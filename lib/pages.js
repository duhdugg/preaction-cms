const adminRequired = require('./adminRequired.js')
const bodyParser = require('body-parser')
const express = require('express')
const Sequelize = require('sequelize')
const csrf = require('./csrf.js')
const db = require('./db.js')
const settings = require('./settings.js')

// TODO: rewrite promises with async/await

// <== EXPRESS MODULE SETUP ==>

const middleware = express()
middleware.use(bodyParser.json({ limit: '50mb' }))

// <== DATABASE DEFINITIONS ==>

const model = {}

// Page.pageType should be 'content'
model.Page = db.sequelize.define(
  'page',
  {
    key: { type: Sequelize.STRING },
    title: { type: Sequelize.STRING },
    pageType: { type: Sequelize.STRING },
    userCreated: { type: Sequelize.BOOLEAN, defaultValue: false },
    settings: { type: Sequelize.JSON, defaultValue: {} },
    parentId: { type: Sequelize.INTEGER },
  },
  {
    associate: (models) => {
      model.Page.hasMany(model.Page, {
        as: 'children',
        foreignKey: 'parentId',
        onDelete: 'cascade',
        hooks: true,
      })
      model.Page.belongsTo(model.Page, {
        as: 'parent',
        foreignKey: 'parentId',
        hooks: true,
      })
    },
  }
)

// PageBlock.blockType should be 'component', 'content', 'iframe', or 'nav'
model.PageBlock = db.sequelize.define('pageblock', {
  blockType: { type: Sequelize.STRING },
  ordering: { type: Sequelize.INTEGER },
  settings: { type: Sequelize.JSON, defaultValue: {} },
})

model.PageBlockContent = db.sequelize.define('pageblockcontent', {
  contentType: { type: Sequelize.STRING },
  filename: { type: Sequelize.STRING },
  ordering: { type: Sequelize.INTEGER },
  settings: { type: Sequelize.JSON, defaultValue: {} },
  wysiwyg: { type: Sequelize.TEXT },
})

model.Page.hasMany(model.PageBlock, { onDelete: 'cascade', hooks: true })
model.PageBlock.belongsTo(model.Page, { hooks: true })
model.PageBlock.hasMany(model.PageBlockContent, {
  onDelete: 'cascade',
  hooks: true,
})
model.PageBlockContent.belongsTo(model.PageBlock, { hooks: true })

// <== FUNCTIONS ==>

// copies a block into a page
let copyBlock = (block, destPageId) => {
  let newBlock = JSON.parse(JSON.stringify(block))
  delete newBlock.id
  delete newBlock.createdAt
  delete newBlock.updatedAt
  newBlock.pageId = destPageId
  return new Promise((resolve, reject) => {
    model.PageBlock.create(newBlock).then((newBlock) => {
      if (block.pageblockcontents && block.pageblockcontents.length) {
        let contentsCopied = 0
        let doContent = (content) => {
          copyContent(content, newBlock.id).then(() => {
            contentsCopied++
            if (contentsCopied >= block.pageblockcontents.length) {
              resolve(newBlock)
            }
          })
        }
        for (let content of block.pageblockcontents) {
          doContent(content)
        }
      } else {
        resolve(newBlock)
      }
    })
  })
}

// copies content into a block
const copyContent = (content, destPageBlockId) => {
  let newContent = JSON.parse(JSON.stringify(content))
  delete newContent.id
  delete newContent.createdAt
  delete newContent.updatedAt
  newContent.pageblockId = destPageBlockId
  return model.PageBlockContent.create(newContent)
}

// copies a page
const copyPage = (fullPage, destinationParentId, destinationKey) => {
  let newPage = JSON.parse(JSON.stringify(fullPage))
  delete newPage.id
  delete newPage.createdAt
  delete newPage.updatedAt
  newPage.parentId = destinationParentId
  newPage.key = destinationKey
  return new Promise((resolve, reject) => {
    model.Page.create(newPage).then((newPage) => {
      if (fullPage.pageblocks && fullPage.pageblocks.length) {
        let blocksCopied = 0
        let doBlock = (block) => {
          copyBlock(block, newPage.id).then((newBlock) => {
            blocksCopied++
            if (blocksCopied >= fullPage.pageblocks.length) {
              resolve(newPage)
            }
          })
        }
        for (let block of fullPage.pageblocks) {
          doBlock(block)
        }
      } else {
        resolve(newPage)
      }
    })
  })
}

const copyPageWithChildren = (
  fullPage,
  destinationParentId,
  destinationKey
) => {
  copyPage(fullPage, destinationParentId, destinationKey).then((newParent) => {
    fullPage.tree.children.forEach((subPage) => {
      getFullPageById(subPage.id).then((fullSubPage) => {
        copyPageWithChildren(fullSubPage, newParent.id, fullSubPage.key)
      })
    })
  })
}

// ensures that a header exists for a page
const createHeader = (parentId) => {
  return model.Page.findOrCreate({
    where: { key: 'header', parentId },
    defaults: { pageType: 'content', parentId, userCreated: false },
  })
}

// ensures that a footer exists for a page
const createFooter = (parentId) => {
  return model.Page.findOrCreate({
    where: { key: 'footer', parentId },
    defaults: { pageType: 'content', parentId, userCreated: false },
  })
}

// resolves pages sorted by parental lineage
const getAncestry = (page) => {
  let ancestry = []
  const populateAncestry = (pg) =>
    new Promise((resolve, reject) => {
      ancestry.push(pg)
      if (pg.parentId) {
        model.Page.findByPk(pg.parentId).then((parent) => {
          resolve(populateAncestry(parent))
        })
      } else {
        ancestry.reverse()
        resolve(ancestry)
      }
    })
  return populateAncestry(page)
}

// resolves all settings passed down by parental lineage
const getAppliedPageSettings = (pageId) => {
  let s = {}
  const mapSiteSettings = new Promise((resolve, reject) => {
    db.model.Settings.findAll().then((settings) => {
      Object.assign(s, settings.defaultSettings)
      settings.forEach((setting) => {
        s[setting.key] = setting.value
      })
      resolve()
    })
  })
  return new Promise((resolve, reject) => {
    mapSiteSettings.then(() => {
      model.Page.findByPk(pageId).then((page) => {
        if (!page) {
          resolve(s)
          return
        }
        getAncestry(page).then((ancestry) => {
          ancestry.forEach((page) => {
            Object.keys(page.settings).forEach((key) => {
              switch (key) {
                case 'cssOverrides':
                  s[key] = s[key] + '\n\n' + page.settings[key]
                  break
                default:
                  s[key] = page.settings[key]
                  break
              }
            })
          })
          if (!page.settings.site) {
            s.site = false
          }
          s.includeInNav = page.settings.includeInNav === true
          s.init = true
          s.navOrdering = page.settings.navOrdering
          resolve(s)
        })
      })
    })
  })
}

// 404 pages will still need to use applied settings
// from the leftmost part of the URL that is correct
const getClosestPageByPath = (path) => {
  let splitPath = path.split('/').filter((key) => {
    return key ? true : false
  })
  let cp
  let getHome = () => {
    return new Promise((resolve, reject) => {
      model.Page.findOne({
        where: { parentId: null, key: 'home' },
      }).then((home) => {
        cp = home
        resolve(home)
      })
    })
  }
  let getPageBySplitPath = (parentId, splitPath) => {
    let key = splitPath[0]
    return new Promise((resolve, reject) => {
      model.Page.findOne({
        where: { parentId, key },
      }).then((page) => {
        if (splitPath.length === 1) {
          if (!page) {
            reject('not found')
            return
          }
          getPageById(page.id).then((page) => {
            cp = page
            resolve(cp)
          })
        } else {
          if (!page) {
            reject('not found')
            return
          }
          let spCopy = Array.from(splitPath)
          spCopy.shift()
          getPageBySplitPath(page.id, spCopy)
            .then((page) => {
              getPageById(page.id).then((page) => {
                cp = page
                resolve(cp)
              })
            })
            .catch((e) => {
              resolve(page)
            })
        }
      })
    })
  }
  return new Promise((resolve, reject) => {
    getHome().then((home) => {
      getPageBySplitPath(null, splitPath)
        .then((page) => {
          resolve(page)
        })
        .catch(() => {
          resolve(home)
        })
    })
  })
}

// default block settings should ensure that all required settings are set
const getDefaultBlockSettings = (blockType) => {
  let settings = {
    header: '',
    headerLevel: 0,
    lgWidth: 12,
    mdWidth: 12,
    showBorder: false,
    showContainer: false,
    smWidth: 12,
    xsWidth: 12,
  }
  if (blockType === 'component') {
    settings.src = ''
    settings.globalName = 'Component'
    settings.propsData = '{}'
  } else if (blockType === 'nav') {
    settings.navAlignment = 'vertical'
    settings.navType = 'basic'
    settings.subNav = false
  } else if (blockType === 'iframe') {
    settings.iframeSrc = 'about:blank'
  }
  return settings
}

// default content settings should ensure that all required settings are set
const getDefaultContentSettings = () => {
  return {
    header: '',
    headerLevel: 0,
    lgWidth: 12,
    mdWidth: 12,
    smWidth: 12,
    xsWidth: 12,
  }
}

// "full" page meaning blocks and content included
const getFullPageById = (pageId) => {
  return new Promise((resolve, reject) => {
    model.Page.findByPk(pageId, {
      include: [
        {
          model: model.PageBlock,
          include: [model.PageBlockContent],
        },
      ],
    }).then((page) => {
      if (!page) {
        reject('not found')
        return
      }
      getAppliedPageSettings(page.parentId).then((fallbackSettings) => {
        let obj = JSON.parse(JSON.stringify(page))
        Object.assign(obj, { fallbackSettings })
        getSiteMap(page).then((sm) => {
          getPageTree(page).then((pt) => {
            obj.siteMap = sm
            obj.tree = pt
            resolve(obj)
          })
        })
      })
    })
  })
}

// generate the path used by parental lineage to access the page
const getPagePath = (page) => {
  return new Promise((resolve, reject) => {
    let splitPath = []
    getAncestry(page).then((ancestry) => {
      let count = ancestry.length
      ancestry.forEach((pg) => {
        splitPath.push(pg.key)
        if (splitPath.length >= count) {
          resolve(splitPath.join('/'))
        }
      })
    })
  })
}

// just the page itself
const getPageById = (id) => {
  return new Promise((resolve, reject) => {
    model.Page.findByPk(id)
      .then((page) => {
        resolve(page)
      })
      .catch(reject)
  })
}

const getPageByPath = (path) => {
  // split the path into an array, removing empty keys
  let splitPath = path.split('/').filter((key) => {
    return key ? true : false
  })
  // recursively traverse the array to resolve the page
  let getPageBySplitPath = (parentId, splitPath) => {
    let key = splitPath[0]
    return new Promise((resolve, reject) => {
      model.Page.findOne({
        where: { parentId, key },
      }).then((page) => {
        if (splitPath.length === 1) {
          if (!page) {
            reject('not found')
            return
          }
          getPageById(page.id).then((page) => {
            resolve(page)
          })
        } else {
          if (!page) {
            reject('not found')
            return
          }
          let spCopy = Array.from(splitPath)
          spCopy.shift()
          getPageBySplitPath(page.id, spCopy)
            .then((page) => {
              getPageById(page.id).then((page) => {
                resolve(page)
              })
            })
            .catch((e) => {
              reject(e)
            })
        }
      })
    })
  }
  return getPageBySplitPath(null, splitPath)
}

// generates the site map used to build the navigation menu
const getSiteMap = (page) => {
  return new Promise((resolve, reject) => {
    let resolved = false
    getPageTree(page).then((pageTree) => {
      if (pageTree.settings.site) {
        resolve(pageTree)
        resolved = true
      } else {
        getAncestry(page).then((ancestry) => {
          ancestry.reverse()
          ancestry.forEach((pg) => {
            if (pg.settings.site && !resolved) {
              resolve(getPageTree(pg))
              resolved = true
            }
          })
          if (!resolved) {
            model.Page.findOne({
              where: { parentId: null, key: 'home' },
            }).then((home) => {
              let siteMap = JSON.parse(JSON.stringify(home))
              siteMap.path = ''
              siteMap.children = []
              model.Page.findAll({
                where: {
                  parentId: null,
                  [Sequelize.Op.not]: [{ key: 'home' }],
                },
              }).then((pages) => {
                let count = pages.length
                if (count) {
                  pages.forEach((pg) => {
                    getPageTree(pg).then((pt) => {
                      siteMap.children.push(pt)
                      if (
                        siteMap.children.length >= count &&
                        siteMap.id !== null
                      ) {
                        resolve(siteMap)
                      }
                    })
                  })
                } else {
                  resolve(siteMap)
                }
              })
            })
          }
        })
      }
    })
  })
}

// generates a tree of subpages that can be traversed
const getPageTree = (page) => {
  let pageTree = JSON.parse(JSON.stringify(page))
  pageTree.children = []
  return new Promise((resolve, reject) => {
    getPagePath(page).then((path) => {
      pageTree.path = path
      model.Page.findAll({
        where: { parentId: page.id },
      }).then((results) => {
        if (results) {
          let count = results.length
          if (!count) {
            resolve(pageTree)
            return
          }
          let i = 0
          results.forEach((pg) => {
            getPageTree(pg)
              .then((pt) => {
                pageTree.children.push(pt)
                i++
              })
              .then(() => {
                if (i >= count) {
                  pageTree.children.sort((a, b) => {
                    let c = 0
                    if (a.title > b.title) {
                      c++
                    } else if (a.title < b.title) {
                      c--
                    }
                    return c
                  })
                  resolve(pageTree)
                }
              })
          })
        } else {
          resolve(pageTree)
        }
      })
    })
  })
}

const dbSync = () =>
  new Promise((resolve, reject) => {
    let force = false
    model.Page.sync({ force })
      .then(() => model.PageBlock.sync({ force }))
      .then(() => model.PageBlockContent.sync({ force }))
      .then(resolve)
      .catch(reject)
  })

// ensures that a default home, header, and footer page are created
const createDefaultPages = () =>
  new Promise((resolve, reject) => {
    dbSync().then(() => {
      let createHome = () =>
        model.Page.findOrCreate({
          where: { key: 'home', parentId: null },
          defaults: { pageType: 'content', parentId: null },
        })
      createHome().then((pages) => {
        let page = pages[0]
        return createHeader(page.id).then((results) => {
          createFooter(page.id).then((results) => {
            settings.sync().then(() => {
              resolve(page)
            })
          })
        })
      })
    })
  })

const sync = () =>
  new Promise((resolve, reject) => {
    dbSync().then(createDefaultPages).then(resolve).catch(reject)
  })

// <== EXPRESS MODULE ROUTES ==>

middleware.route('/api/page').post(adminRequired, csrf.protect, (req, res) => {
  if (!req.body.pageType) {
    res.status(400).json({ error: 'missing pageType' })
    return
  }
  if (!req.body.key) {
    res.status(400).json({ error: 'missing key' })
    return
  }
  if (!req.body.title) {
    res.status(400).json({ error: 'missing title' })
  }
  switch (req.body.pageType) {
    case 'content':
      break
    default:
      res.status(400).json({ error: 'invalid pageType' })
  }
  let key = req.body.key.toLowerCase().trim()
  switch (key) {
    case 'header':
    case 'footer':
    case 'home':
    case 'login':
      res.status(400).json({ error: `${key} is reserved` })
      return
    default:
      break
  }
  model.Page.findOne({
    where: { key, parentId: req.body.parentId || null },
  }).then((page) => {
    if (page) {
      res.status(400).json({ error: `${key} already exists` })
      return
    }
    model.Page.create({
      pageType: req.body.pageType,
      key: key,
      title: req.body.title.trim(),
      parentId: req.body.parentId || null,
      userCreated: true,
      settings: {
        includeInNav: true,
      },
    }).then((page) => {
      if (req.body.pageType === 'content') {
        createHeader(page.id).then(() => {
          createFooter(page.id).then(() => {
            db.backup()
            res.json(page)
          })
        })
      }
    })
  })
})

middleware
  .route('/api/page/:id')
  .put(adminRequired, csrf.protect, (req, res) => {
    model.Page.findByPk(req.params.id).then((page) => {
      if (!page) {
        res.status(404).json({ error: 'not found' })
        return
      }
      let newKey = req.body.key.toLowerCase().trim()
      let updatePage = () => {
        page.key = newKey
        if (req.body.title) {
          page.title = req.body.title.trim()
        }
        page.settings = req.body.settings
        page.save().then((pg) => {
          db.backup()
          res.json(pg)
        })
      }
      if (!page.parentId) {
        if (page.key !== newKey) {
          switch (newKey) {
            case 'header':
            case 'footer':
            case 'home':
            case 'login':
              res.status(400).json({ error: `${newKey} is reserved` })
              return
            default:
              break
          }
        }
      }
      if (page.key !== newKey) {
        model.Page.findOne({
          where: { key: newKey, parentId: req.body.parentId },
        }).then((page) => {
          if (page) {
            res.status(400).json({ error: `${newKey} already exists` })
            return
          } else {
            updatePage()
          }
        })
      } else {
        updatePage()
      }
    })
  })
  .delete(adminRequired, csrf.protect, (req, res) => {
    model.Page.findByPk(req.params.id).then((page) => {
      if (!page) {
        res.status(404).json({ error: 'not found' })
        return
      }
      Promise.all([
        model.Page.destroy({ where: { id: req.params.id } }),
        model.Page.destroy({ where: { parentId: req.params.id } }),
      ]).then(() => {
        db.backup()
        res.json(page)
      })
    })
  })

middleware.route('/api/page/by-key/:key').get((req, res) => {
  getPageByPath(req.params.key)
    .then((page) => {
      getFullPageById(page.id).then((page) => {
        res.json(page)
      })
    })
    .catch((error) => {
      res.status(404).json({ error })
    })
})

middleware.route('/api/page/by-key/:parentKey/*').get((req, res) => {
  let p = `${req.params.parentKey}/${req.params[0]}`
  getPageByPath(p)
    .then((page) => {
      getFullPageById(page.id).then((page) => {
        res.json(page)
      })
    })
    .catch((error) => {
      res.status(404).json({ error })
    })
})

middleware.route('/api/page/settings/by-key/:key').get((req, res) => {
  getClosestPageByPath(req.params.key)
    .then((page) => {
      getAppliedPageSettings(page.id).then((settings) => {
        res.json(settings)
      })
    })
    .catch((error) => {
      res.status(404).json({ error })
    })
})

middleware.route('/api/page/settings/by-key/:parentKey/*').get((req, res) => {
  let p = `${req.params.parentKey}/${req.params[0]}`
  getClosestPageByPath(p)
    .then((page) => {
      getAppliedPageSettings(page.id).then((settings) => {
        res.json(settings)
      })
    })
    .catch((error) => {
      res.status(404).json({ error })
    })
})

middleware.route('/api/page/sitemap/by-key/:key').get((req, res) => {
  getClosestPageByPath(req.params.key)
    .then((page) => {
      getSiteMap(page).then((siteMap) => {
        res.json(siteMap)
      })
    })
    .catch((error) => {
      res.status(404).json({ error })
    })
})

middleware.route('/api/page/sitemap/by-key/:parentKey/*').get((req, res) => {
  let p = `${req.params.parentKey}/${req.params[0]}`
  getClosestPageByPath(p)
    .then((page) => {
      getSiteMap(page).then((siteMap) => {
        res.json(siteMap)
      })
    })
    .catch((error) => {
      res.status(404).json({ error })
    })
})

middleware
  .route('/api/page/:id/blocks')
  .post(adminRequired, csrf.protect, (req, res) => {
    let getOrdering = new Promise((resolve, reject) => {
      model.PageBlock.findAll({
        where: { pageId: req.params.id },
        limit: 1,
        order: [['ordering', 'DESC']],
      }).then((results) => {
        let ordering = 0
        if (results.length) {
          ordering = results[0].ordering + 1
        }
        resolve(ordering)
      })
    })
    getOrdering.then((ordering) => {
      model.PageBlock.create({
        pageId: req.params.id,
        blockType: req.body.blockType || 'content',
        ordering,
        settings: getDefaultBlockSettings(req.body.blockType),
      }).then((block) => {
        if (block.blockType === 'content') {
          model.PageBlockContent.create({
            contentType: 'wysiwyg',
            pageblockId: block.id,
            wysiwyg: '',
            settings: getDefaultContentSettings(),
          }).then((content) => {
            model.PageBlock.findByPk(block.id, {
              include: [model.PageBlockContent],
            }).then((block) => {
              db.backup()
              res.json(block)
            })
          })
        } else {
          db.backup()
          res.json(block)
        }
      })
    })
  })

middleware
  .route('/api/page/blocks/:id')
  .get(adminRequired, (req, res) => {
    model.PageBlock.findByPk(req.params.id, {
      include: [model.PageBlockContent],
    }).then((pageBlock) => {
      res.json(pageBlock)
    })
  })
  .put(adminRequired, csrf.protect, (req, res) => {
    model.PageBlock.update(
      {
        ordering: req.body.ordering,
        settings: req.body.settings || {},
      },
      {
        where: { id: req.params.id },
      }
    ).then((pageBlock) => {
      db.backup()
      res.json(pageBlock)
    })
  })
  .delete(adminRequired, csrf.protect, (req, res) => {
    model.PageBlock.findByPk(req.params.id).then((pageblock) => {
      let ordering = pageblock.ordering
      pageblock.destroy().then(() => {
        model.PageBlock.findAll({
          where: { ordering: { $gt: ordering } },
        }).then((pageblocks) => {
          pageblocks.forEach((block) => {
            block.ordering--
            block.save()
          })
          db.backup()
          res.json(true)
        })
      })
    })
  })

middleware
  .route('/api/page/blocks/:id/content')
  .post(adminRequired, csrf.protect, (req, res) => {
    let getOrdering = new Promise((resolve, reject) => {
      model.PageBlockContent.findAll({
        where: { pageblockId: req.params.id },
        limit: 1,
        order: [['ordering', 'DESC']],
      }).then((results) => {
        let ordering = 0
        if (results.length) {
          ordering = results[0].ordering + 1
        }
        resolve(ordering)
      })
    })
    getOrdering.then((ordering) => {
      model.PageBlockContent.create({
        pageblockId: req.params.id,
        contentType: req.body.contentType || 'wyswiyg',
        ordering,
        settings: getDefaultContentSettings(),
        wysiwyg: '',
      }).then((content) => {
        db.backup()
        res.json(content)
      })
    })
  })

middleware
  .route('/api/page/blocks/content/:id')
  .put(adminRequired, csrf.protect, (req, res) => {
    model.PageBlockContent.update(
      {
        ordering: req.body.ordering,
        wysiwyg: req.body.wysiwyg,
        settings: req.body.settings,
      },
      { where: { id: req.params.id } }
    ).then((content) => {
      db.backup()
      res.json(content)
    })
  })
  .delete(adminRequired, csrf.protect, (req, res) => {
    model.PageBlockContent.findByPk(req.params.id).then((content) => {
      let ordering = content.ordering
      content.destroy().then(() => {
        model.PageBlockContent.findAll({
          where: { ordering: { $gt: ordering } },
        }).then((contents) => {
          contents.forEach((content) => {
            content.ordering--
            content.save()
          })
          db.backup()
          res.json(true)
        })
      })
    })
  })

middleware.route('/api/page/:id/settings').get(adminRequired, (req, res) => {
  model.Page.findByPk(req.params.id).then((page) => {
    if (!page) {
      res.status(404).json({ error: 'not found' })
      return
    }
    res.json(page.settings)
  })
})

middleware.route('/api/page/:id/sitemap').get(adminRequired, (req, res) => {
  model.Page.findByPk(req.params.id).then((page) => {
    getSiteMap(page).then((siteMap) => {
      res.json(siteMap)
    })
  })
})

// <== EXPORT ==>

module.exports = {
  middleware,
  funcs: {
    copyPage,
    copyPageWithChildren,
    getAppliedPageSettings,
    getFullPageById,
    getPageByPath,
    getPagePath,
  },
  model,
  sync,
}