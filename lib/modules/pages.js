const bodyParser = require('body-parser')
const express = require('express')
const Sequelize = require('sequelize')
const db = require('../db.js')
const session = require('../session.js')

const expressModule = express()
expressModule.use(bodyParser.json({ limit: '50mb' }))

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
    parentId: { type: Sequelize.INTEGER }
  },
  {
    associate: models => {
      model.Page.hasMany(model.Page, {
        as: 'children',
        foreignKey: 'parentId',
        onDelete: 'cascade',
        hooks: true
      })
      model.Page.belongsTo(model.Page, {
        as: 'parent',
        foreignKey: 'parentId',
        hooks: true
      })
    }
  }
)

// PageBlock.blockType should be 'content' or 'nav'
model.PageBlock = db.sequelize.define('pageblock', {
  blockType: { type: Sequelize.STRING },
  ordering: { type: Sequelize.INTEGER },
  settings: { type: Sequelize.JSON, defaultValue: {} }
})

model.PageBlockContent = db.sequelize.define('pageblockcontent', {
  contentType: { type: Sequelize.STRING },
  filename: { type: Sequelize.STRING },
  ordering: { type: Sequelize.INTEGER },
  settings: { type: Sequelize.JSON, defaultValue: {} },
  wysiwyg: { type: Sequelize.TEXT }
})

model.Page.hasMany(model.PageBlock, { onDelete: 'cascade', hooks: true })
model.PageBlock.belongsTo(model.Page, { hooks: true })
model.PageBlock.hasMany(model.PageBlockContent, {
  onDelete: 'cascade',
  hooks: true
})
model.PageBlockContent.belongsTo(model.PageBlock, { hooks: true })

let createHeader = parentId => {
  return model.Page.findOrCreate({
    where: { key: 'header', parentId },
    defaults: { pageType: 'content', parentId, userCreated: false }
  })
}
let createFooter = parentId => {
  return model.Page.findOrCreate({
    where: { key: 'footer', parentId },
    defaults: { pageType: 'content', parentId, userCreated: false }
  })
}

let getAncestry = page => {
  let ancestry = []
  let populateAncestry = pg =>
    new Promise((resolve, reject) => {
      ancestry.push(pg)
      if (pg.parentId) {
        model.Page.findByPk(pg.parentId).then(parent => {
          resolve(populateAncestry(parent))
        })
      } else {
        ancestry.reverse()
        resolve(ancestry)
      }
    })
  return populateAncestry(page)
}

let getAppliedPageSettings = pageId => {
  let s = {}
  let mapSiteSettings = new Promise((resolve, reject) => {
    db.model.Settings.findAll().then(settings => {
      Object.assign(s, settings.defaultSettings)
      settings.forEach(setting => {
        s[setting.key] = setting.value
      })
      resolve()
    })
  })
  return new Promise((resolve, reject) => {
    mapSiteSettings.then(() => {
      model.Page.findByPk(pageId).then(page => {
        if (!page) {
          resolve(s)
          return
        }
        getAncestry(page).then(ancestry => {
          ancestry.forEach(page => {
            Object.keys(page.settings).forEach(key => {
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
          resolve(s)
        })
      })
    })
  })
}

let getClosestPageByPath = path => {
  let splitPath = path.split('/').filter(key => {
    return key ? true : false
  })
  let cp
  let getHome = () => {
    return new Promise((resolve, reject) => {
      model.Page.findOne({
        where: { parentId: null, key: 'home' }
      }).then(home => {
        cp = home
        resolve(home)
      })
    })
  }
  let getPageBySplitPath = (parentId, splitPath) => {
    let key = splitPath[0]
    return new Promise((resolve, reject) => {
      model.Page.findOne({
        where: { parentId, key }
      }).then(page => {
        if (splitPath.length === 1) {
          if (!page) {
            reject('not found')
            return
          }
          getPageById(page.id).then(page => {
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
            .then(page => {
              getPageById(page.id).then(page => {
                cp = page
                resolve(cp)
              })
            })
            .catch(e => {
              resolve(page)
            })
        }
      })
    })
  }
  return new Promise((resolve, reject) => {
    getHome().then(home => {
      getPageBySplitPath(null, splitPath)
        .then(page => {
          resolve(page)
        })
        .catch(() => {
          resolve(home)
        })
    })
  })
}

let getDefaultBlockSettings = blockType => {
  let settings = {
    header: '',
    headerLevel: 0,
    lgWidth: 12,
    mdWidth: 12,
    padding: 0,
    showBorder: false,
    showContainer: false,
    smWidth: 12,
    xsWidth: 12
  }
  if (blockType === 'nav') {
    settings.navAlignment = 'vertical'
    settings.navType = 'basic'
    settings.subNav = false
  }
  return settings
}

let getDefaultContentSettings = () => {
  return {
    header: '',
    headerLevel: 0,
    lgWidth: 12,
    marginBottom: 0,
    marginTop: 0,
    mdWidth: 12,
    padding: 0,
    smWidth: 12,
    xsWidth: 12
  }
}

let getFullPageById = pageId => {
  return new Promise((resolve, reject) => {
    model.Page.findByPk(pageId, {
      include: [
        {
          model: model.PageBlock,
          include: [model.PageBlockContent]
        }
      ]
    }).then(page => {
      if (!page) {
        reject('not found')
        return
      }
      getAppliedPageSettings(page.parentId).then(fallbackSettings => {
        let obj = JSON.parse(JSON.stringify(page))
        Object.assign(obj, { fallbackSettings })
        getSiteMap(page).then(sm => {
          getPageTree(page).then(pt => {
            obj.siteMap = sm
            obj.tree = pt
            resolve(obj)
          })
        })
      })
    })
  })
}

let getPagePath = page => {
  return new Promise((resolve, reject) => {
    let splitPath = []
    getAncestry(page).then(ancestry => {
      let count = ancestry.length
      ancestry.forEach(pg => {
        splitPath.push(pg.key)
        if (splitPath.length >= count) {
          resolve(splitPath.join('/'))
        }
      })
    })
  })
}

let getPageById = id => {
  return new Promise((resolve, reject) => {
    model.Page.findByPk(id)
      .then(page => {
        resolve(page)
      })
      .catch(reject)
  })
}

let getPageByPath = path => {
  let splitPath = path.split('/').filter(key => {
    return key ? true : false
  })
  let getPageBySplitPath = (parentId, splitPath) => {
    let key = splitPath[0]
    return new Promise((resolve, reject) => {
      model.Page.findOne({
        where: { parentId, key }
      }).then(page => {
        if (splitPath.length === 1) {
          if (!page) {
            reject('not found')
            return
          }
          getPageById(page.id).then(page => {
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
            .then(page => {
              getPageById(page.id).then(page => {
                resolve(page)
              })
            })
            .catch(e => {
              reject(e)
            })
        }
      })
    })
  }
  return getPageBySplitPath(null, splitPath)
}

let getSiteMap = page => {
  return new Promise((resolve, reject) => {
    let resolved = false
    getPageTree(page).then(pageTree => {
      if (pageTree.settings.site) {
        resolve(pageTree)
        resolved = true
      } else {
        getAncestry(page).then(ancestry => {
          ancestry.reverse()
          ancestry.forEach(pg => {
            if (pg.settings.site && !resolved) {
              resolve(getPageTree(pg))
              resolved = true
            }
          })
          if (!resolved) {
            model.Page.findOne({
              where: { parentId: null, key: 'home' }
            }).then(home => {
              let siteMap = JSON.parse(JSON.stringify(home))
              siteMap.path = ''
              siteMap.children = []
              model.Page.findAll({
                where: {
                  parentId: null,
                  [Sequelize.Op.not]: [{ key: 'home' }]
                }
              }).then(pages => {
                let count = pages.length
                if (count) {
                  pages.forEach(pg => {
                    getPageTree(pg).then(pt => {
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
let getPageTree = page => {
  let pageTree = JSON.parse(JSON.stringify(page))
  pageTree.children = []
  return new Promise((resolve, reject) => {
    getPagePath(page).then(path => {
      pageTree.path = path
      model.Page.findAll({
        where: { parentId: page.id }
      }).then(results => {
        if (results) {
          let count = results.length
          if (!count) {
            resolve(pageTree)
            return
          }
          let i = 0
          results.forEach(pg => {
            getPageTree(pg)
              .then(pt => {
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

let dbSync = () =>
  new Promise((resolve, reject) => {
    let force = false
    model.Page.sync({ force })
      .then(() => model.PageBlock.sync({ force }))
      .then(() => model.PageBlockContent.sync({ force }))
      .then(resolve)
      .catch(reject)
  })

let createDefaultPages = () =>
  new Promise((resolve, reject) => {
    dbSync().then(() => {
      let createHome = () =>
        model.Page.findOrCreate({
          where: { key: 'home', parentId: null },
          defaults: { pageType: 'content', parentId: null }
        })
      createHome()
        .then(pages => {
          let page = pages[0]
          return createHeader(page.id)
            .then(results => {
              createFooter(page.id).then(results => {
                db.model.Settings.findOne({
                  where: { key: 'headerPath' }
                }).then(headerSetting => {
                  headerSetting.value = '/home/header/'
                  headerSetting.save().then(() => {
                    db.model.Settings.findOne({
                      where: { key: 'footerPath' }
                    }).then(footerSetting => {
                      footerSetting.value = '/home/footer/'
                      footerSetting.save().then(() => {
                        resolve(page)
                      })
                    })
                  })
                })
              })
            })
            .catch(reject)
        })
        .catch(reject)
    })
  })

let sync = () =>
  new Promise((resolve, reject) => {
    dbSync()
      .then(createDefaultPages)
      .then(resolve)
      .catch(reject)
  })

expressModule
  .route('/api/page')
  .get((req, res) => {
    model.Page.findAll({ where: { pageType: 'content' } }).then(pages => {
      res.json(pages)
    })
  })
  .post(session.authenticationRequired, (req, res) => {
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
      where: { key, parentId: req.body.parentId || null }
    }).then(page => {
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
          includeInNav: true
        }
      }).then(page => {
        if (req.body.pageType === 'content') {
          createHeader(page.id).then(() => {
            createFooter(page.id).then(() => {
              res.json(page)
            })
          })
        }
      })
    })
  })

expressModule
  .route('/api/page/:id')
  .get((req, res) => {
    getFullPageById(req.params.id)
      .then(page => {
        res.json(page)
      })
      .catch(e => {
        res.status(404).json({ e })
      })
  })
  .put(session.authenticationRequired, (req, res) => {
    model.Page.findByPk(req.params.id).then(page => {
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
        page.save().then(pg => {
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
        model.Page.findOne({ where: { key: newKey } }).then(page => {
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
  .delete(session.authenticationRequired, (req, res) => {
    model.Page.findByPk(req.params.id).then(page => {
      if (!page) {
        res.status(404).json({ error: 'not found' })
        return
      }
      Promise.all([
        model.Page.destroy({ where: { id: req.params.id } }),
        model.Page.destroy({ where: { parentId: req.params.id } })
      ]).then(() => {
        res.json(page)
      })
    })
  })

expressModule.route('/api/page/by-key/:key').get((req, res) => {
  getPageByPath(req.params.key)
    .then(page => {
      getFullPageById(page.id).then(page => {
        res.json(page)
      })
    })
    .catch(error => {
      res.status(404).json({ error })
    })
})

expressModule.route('/api/page/by-key/:parentKey/*').get((req, res) => {
  let p = `${req.params.parentKey}/${req.params[0]}`
  getPageByPath(p)
    .then(page => {
      getFullPageById(page.id).then(page => {
        res.json(page)
      })
    })
    .catch(error => {
      res.status(404).json({ error })
    })
})

expressModule.route('/api/page/settings/by-key/:key').get((req, res) => {
  getClosestPageByPath(req.params.key)
    .then(page => {
      getAppliedPageSettings(page.id).then(settings => {
        res.json(settings)
      })
    })
    .catch(error => {
      res.status(404).json({ error })
    })
})

expressModule
  .route('/api/page/settings/by-key/:parentKey/*')
  .get((req, res) => {
    let p = `${req.params.parentKey}/${req.params[0]}`
    getClosestPageByPath(p)
      .then(page => {
        getAppliedPageSettings(page.id).then(settings => {
          res.json(settings)
        })
      })
      .catch(error => {
        res.status(404).json({ error })
      })
  })

expressModule.route('/api/page/sitemap/by-key/:key').get((req, res) => {
  getClosestPageByPath(req.params.key)
    .then(page => {
      getSiteMap(page).then(siteMap => {
        res.json(siteMap)
      })
    })
    .catch(error => {
      res.status(404).json({ error })
    })
})

expressModule.route('/api/page/sitemap/by-key/:parentKey/*').get((req, res) => {
  let p = `${req.params.parentKey}/${req.params[0]}`
  getClosestPageByPath(p)
    .then(page => {
      getSiteMap(page).then(siteMap => {
        res.json(siteMap)
      })
    })
    .catch(error => {
      res.status(404).json({ error })
    })
})

expressModule
  .route('/api/page/:id/blocks')
  .get((req, res) => {
    model.PageBlock.findAll({
      where: { pageId: req.params.id },
      include: [model.PageBlockContent]
    }).then(blocks => {
      res.json(blocks)
    })
  })
  .post(session.authenticationRequired, (req, res) => {
    let getOrdering = new Promise((resolve, reject) => {
      model.PageBlock.findAll({
        where: { pageId: req.params.id },
        limit: 1,
        order: [['ordering', 'DESC']]
      }).then(results => {
        let ordering = 0
        if (results.length) {
          ordering = results[0].ordering + 1
        }
        resolve(ordering)
      })
    })
    getOrdering.then(ordering => {
      model.PageBlock.create({
        pageId: req.params.id,
        blockType: req.body.blockType || 'content',
        ordering,
        settings: getDefaultBlockSettings(req.body.blockType)
      }).then(block => {
        if (block.blockType === 'content') {
          model.PageBlockContent.create({
            contentType: 'wysiwyg',
            pageblockId: block.id,
            wysiwyg: '',
            settings: getDefaultContentSettings()
          }).then(content => {
            model.PageBlock.findByPk(block.id, {
              include: [model.PageBlockContent]
            }).then(block => {
              res.json(block)
            })
          })
        } else {
          res.json(block)
        }
      })
    })
  })

expressModule
  .route('/api/page/blocks/:id')
  .get((req, res) => {
    model.PageBlock.findByPk(req.params.id, {
      include: [model.PageBlockContent]
    }).then(pageBlock => {
      res.json(pageBlock)
    })
  })
  .put(session.authenticationRequired, (req, res) => {
    model.PageBlock.update(
      {
        ordering: req.body.ordering,
        settings: req.body.settings || {}
      },
      {
        where: { id: req.params.id }
      }
    ).then(pageBlock => {
      res.json(pageBlock)
    })
  })
  .delete(session.authenticationRequired, (req, res) => {
    model.PageBlock.findByPk(req.params.id).then(pageblock => {
      let ordering = pageblock.ordering
      pageblock.destroy().then(() => {
        model.PageBlock.findAll({
          where: { ordering: { $gt: ordering } }
        }).then(pageblocks => {
          pageblocks.forEach(block => {
            block.ordering--
            block.save()
          })
          res.json(true)
        })
      })
    })
  })

expressModule
  .route('/api/page/blocks/:id/content')
  .post(session.authenticationRequired, (req, res) => {
    let getOrdering = new Promise((resolve, reject) => {
      model.PageBlockContent.findAll({
        where: { pageblockId: req.params.id },
        limit: 1,
        order: [['ordering', 'DESC']]
      }).then(results => {
        let ordering = 0
        if (results.length) {
          ordering = results[0].ordering + 1
        }
        resolve(ordering)
      })
    })
    getOrdering.then(ordering => {
      model.PageBlockContent.create({
        pageblockId: req.params.id,
        contentType: req.body.contentType || 'wyswiyg',
        ordering,
        settings: getDefaultContentSettings(),
        wysiwyg: ''
      }).then(content => {
        res.json(content)
      })
    })
  })

expressModule
  .route('/api/page/blocks/content/:id')
  .get((req, res) => {
    model.PageBlockContent.findByPk(req.params.id).then(content => {
      res.json(content)
    })
  })
  .put(session.authenticationRequired, (req, res) => {
    model.PageBlockContent.update(
      {
        ordering: req.body.ordering,
        wysiwyg: req.body.wysiwyg,
        settings: req.body.settings
      },
      { where: { id: req.params.id } }
    ).then(content => {
      res.json(content)
    })
  })
  .delete(session.authenticationRequired, (req, res) => {
    model.PageBlockContent.findByPk(req.params.id).then(content => {
      let ordering = content.ordering
      content.destroy().then(() => {
        model.PageBlockContent.findAll({
          where: { ordering: { $gt: ordering } }
        }).then(contents => {
          contents.forEach(content => {
            content.ordering--
            content.save()
          })
          res.json(true)
        })
      })
    })
  })

expressModule.route('/api/page/:id/ancestry').get((req, res) => {
  model.Page.findByPk(req.params.id).then(page => {
    getAncestry(page).then(ancestry => {
      res.json(ancestry)
    })
  })
})

expressModule.route('/api/page/:id/settings').get((req, res) => {
  model.Page.findByPk(req.params.id).then(page => {
    if (!page) {
      res.status(404).json({ error: 'not found' })
      return
    }
    res.json(page.settings)
  })
})

expressModule.route('/api/page/:id/sitemap').get((req, res) => {
  model.Page.findByPk(req.params.id).then(page => {
    getSiteMap(page).then(siteMap => {
      res.json(siteMap)
    })
  })
})

module.exports = {
  expressModule,
  model,
  sync
}
