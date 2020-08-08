const adminRequired = require('./adminRequired.js')
const bodyParser = require('body-parser')
const express = require('express')
const sanitizeHtml = require('sanitize-html')
const Sequelize = require('sequelize')
const cache = require('./cache.js')
const csrf = require('./csrf.js')
const db = require('./db.js')

// <== EXPRESS MODULE SETUP ==>

const middleware = express()
middleware.use(bodyParser.json({ limit: '50mb' }))

// <== DATABASE DEFINITIONS ==>

const model = {}

// Page.pageType should be 'content'
model.Page = db.sequelize.define('page', {
  key: { type: Sequelize.STRING },
  title: { type: Sequelize.STRING },
  pageType: { type: Sequelize.STRING },
  userCreated: { type: Sequelize.BOOLEAN, defaultValue: false },
  settings: { type: Sequelize.JSON, defaultValue: {} },
  parentId: { type: Sequelize.INTEGER },
})

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
const copyBlock = async (block, destPageId) => {
  let newBlock = JSON.parse(JSON.stringify(block))
  delete newBlock.id
  delete newBlock.createdAt
  delete newBlock.updatedAt
  newBlock.pageId = destPageId
  newBlock = await model.PageBlock.create(newBlock)
  if (block.pageblockcontents && block.pageblockcontents.length) {
    for (const content of block.pageblockcontents) {
      await copyContent(content, newBlock.id)
    }
  }
  return newBlock
}

// copies content into a block
const copyContent = async (content, destPageBlockId) => {
  const newContent = JSON.parse(JSON.stringify(content))
  delete newContent.id
  delete newContent.createdAt
  delete newContent.updatedAt
  newContent.pageblockId = destPageBlockId
  return await model.PageBlockContent.create(newContent)
}

// copies a page
const copyPage = async (fullPage, destinationParentId, destinationKey) => {
  let newPage = JSON.parse(JSON.stringify(fullPage))
  delete newPage.id
  delete newPage.createdAt
  delete newPage.updatedAt
  newPage.parentId = destinationParentId
  newPage.key = destinationKey
  newPage = await model.Page.create(newPage)
  for (const block of fullPage.pageblocks) {
    await copyBlock(block, newPage.id)
  }
  return newPage
}

const copyPageWithChildren = async (
  fullPage,
  destinationParentId,
  destinationKey
) => {
  let newParent = await copyPage(fullPage, destinationParentId, destinationKey)
  for (const subPage of fullPage.tree.children) {
    const fullSubPage = await getFullPageById(subPage.id)
    await copyPageWithChildren(fullSubPage, newParent.id, fullSubPage.key)
  }
  newParent = await getFullPageById(newParent.id)
  return newParent
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
const getAncestry = async (page) => {
  const ancestry = []
  const populateAncestry = async (pg) => {
    ancestry.push(pg)
    if (pg.parentId) {
      const parent = await model.Page.findByPk(pg.parentId)
      return populateAncestry(parent)
    } else {
      ancestry.reverse()
      return ancestry
    }
  }
  return await populateAncestry(page)
}

// resolves all settings passed down by parental lineage
const getAppliedPageSettings = async (pageId) => {
  const s = {}
  const settings = await db.model.Settings.findAll()
  Object.assign(s, settings.defaultSettings)
  for (const setting of settings) {
    s[setting.key] = setting.value
  }
  s.init = true
  const page = await model.Page.findByPk(pageId)
  if (!page) {
    return s
  }
  const ancestry = await getAncestry(page)
  for (const pg of ancestry) {
    for (const key of Object.keys(pg.settings)) {
      switch (key) {
        case 'cssOverrides':
          s[key] = s[key] + '\n\n' + pg.settings[key]
          break
        default:
          s[key] = pg.settings[key]
          break
      }
    }
    if (!pg.settings.site) {
      s.site = false
    }
    s.includeInNav = pg.settings.includeInNav === true
    s.navOrdering = pg.settings.navOrdering
  }
  return s
}

// 404 pages will still need to use applied settings
// from the leftmost part of the URL that is correct
const getClosestPageByPath = async (path) => {
  const splitPath = path.split('/').filter((key) => {
    return key ? true : false
  })
  const home = await model.Page.findOne({
    where: { parentId: null, key: 'home' },
  })
  let cp = home
  try {
    cp = await getPageBySplitPath(null, splitPath)
  } catch (e) {}
  return cp
}

// default block settings should ensure that all required settings are set
const getDefaultBlockSettings = (blockType) => {
  const settings = {
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
// depth should be specified in most cases to improve performance
// if depth is 1, no child pages will be populated in the tree
// if depth is 2, only direct descendents will be populated in the tree
// if depth is 3, it will include grandchildren
// if depth is less than 1, no limit is applied to child page depth
const getFullPageById = async (pageId, depth) => {
  const page = await model.Page.findByPk(pageId, {
    include: [
      {
        model: model.PageBlock,
        include: [model.PageBlockContent],
      },
    ],
  })
  if (!page) {
    throw new Error('not found')
  }
  sanitizeContent(page)
  // headers and footers don't need these extra attributes
  if (['header', 'footer'].includes(page.key)) {
    return page
  }
  const fallbackSettings = await getAppliedPageSettings(page.parentId)
  let sm = await getSiteMap(page)
  // remove attributes not needed in sitemap
  sm = {
    key: sm.key,
    path: sm.path,
    children: sm.children,
  }
  let pt = await getPageTree(page, depth)
  const obj = JSON.parse(JSON.stringify(page))
  Object.assign(obj, { fallbackSettings })
  obj.siteMap = sm
  obj.tree = pt
  return obj
}

// see getFullPageById
const getFullPageByPath = async (path, depth) => {
  const page = await getPageByPath(path)
  return await getFullPageById(page.id, depth)
}

// generate the path used by parental lineage to access the page
const getPagePath = async (page) => {
  const splitPath = []
  const ancestry = await getAncestry(page)
  for (const pg of ancestry) {
    splitPath.push(pg.key)
  }
  return splitPath.join('/')
}

// just the page itself
const getPageById = async (id) => {
  return await model.Page.findByPk(id)
}

const getPageByPath = async (path) => {
  // split the path into an array, removing empty keys
  const splitPath = path.split('/').filter((key) => {
    return key ? true : false
  })
  return await getPageBySplitPath(null, splitPath)
}

// recursively traverse the array to resolve the page
const getPageBySplitPath = async (parentId, splitPath) => {
  const key = splitPath[0]
  let page = await model.Page.findOne({ where: { parentId, key } })
  if (!page) {
    throw new Error('not found')
  }
  if (splitPath.length > 1) {
    const spCopy = Array.from(splitPath)
    spCopy.shift()
    page = await getPageBySplitPath(page.id, spCopy)
  }
  return await getPageById(page.id)
}

// generates the site map used to build the navigation menu
// calls to getPageTree should use a depth of 3 to build top nav
// except when generating the top-level site map, where it should be 2
const getSiteMap = async (page) => {
  const pageTree = await getPageTree(page, 3)
  if (pageTree.settings.site) {
    return pageTree
  }
  const ancestry = await getAncestry(page)
  ancestry.reverse()
  for (const pg of ancestry) {
    if (pg.settings.site) {
      return await getPageTree(pg, 2)
    }
  }
  const home = await model.Page.findOne({
    where: { parentId: null, key: 'home' },
  })
  const siteMap = JSON.parse(JSON.stringify(home))
  siteMap.path = ''
  siteMap.children = []
  const pages = await model.Page.findAll({
    where: { parentId: null, [Sequelize.Op.not]: [{ key: 'home' }] },
  })
  for (const pg of pages) {
    const pt = await getPageTree(pg, 2)
    siteMap.children.push(pt)
  }
  return siteMap
}

// generates a tree of subpages that can be traversed
// if depth is less than 1, no limit is applied
const getPageTree = async (page, depth) => {
  const pageTree = JSON.parse(JSON.stringify(page))
  delete pageTree.pageblocks
  pageTree.children = []
  const path = await getPagePath(page)
  pageTree.path = path
  if (depth > 1) {
    const results = await model.Page.findAll({
      where: {
        parentId: page.id,
        [Sequelize.Op.not]: [
          { [Sequelize.Op.or]: [{ key: 'header' }, { key: 'footer' }] },
        ],
      },
    })
    if (results) {
      for (const pg of results) {
        const pt = await getPageTree(pg, depth ? depth - 1 : undefined)
        pageTree.children.push(pt)
      }
      pageTree.children.sort((a, b) =>
        a.title < b.title ? -1 : a.title > b.title ? 1 : 0
      )
    }
  }
  return pageTree
}

const dbSync = async () => {
  const force = false
  await model.Page.sync({ force })
  await model.PageBlock.sync({ force })
  await model.PageBlockContent.sync({ force })
  return
}

// ensures that a default home, header, and footer page are created
const findOrCreateDefaultPages = async () => {
  await dbSync()
  const createHome = async () => {
    const pages = await model.Page.findOrCreate({
      where: { key: 'home', parentId: null },
      defaults: { pageType: 'content', parentId: null },
    })
    return pages[0]
  }
  const home = await createHome()
  const header = await createHeader(home.id)
  const footer = await createFooter(home.id)
  return { home, header, footer }
}

const getSanitizedHtml = (html) =>
  sanitizeHtml(html, {
    allowedTags: [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'blockquote',
      'p',
      'a',
      'ul',
      'ol',
      'li',
      'b',
      'i',
      's',
      'span',
      'strong',
      'em',
      'strike',
      'code',
      'br',
      'pre',
    ],
    allowedAttributes: {
      h1: ['class'],
      h2: ['class'],
      h3: ['class'],
      h4: ['class'],
      h5: ['class'],
      h6: ['class'],
      blockquote: ['class'],
      a: ['href', 'target', 'class'],
      p: ['class'],
      ul: ['class'],
      ol: ['class'],
      li: ['class'],
      b: ['class'],
      i: ['class'],
      s: ['class'],
      span: ['class'],
      strong: ['class'],
      em: ['class'],
      strike: ['class'],
      code: ['class'],
      br: ['class'],
      pre: ['class'],
    },
  })

// sanitizes wysiwyg content in page
const sanitizeContent = (page) => {
  if (page && page.pageblocks) {
    for (let block of page.pageblocks) {
      for (let content of block.pageblockcontents) {
        content.wysiwyg = getSanitizedHtml(content.wysiwyg)
      }
    }
  }
  return true
}

const sync = async () => {
  await dbSync()
  const defaultPages = await findOrCreateDefaultPages()
  return { defaultPages }
}

// <== EXPRESS MODULE ROUTES ==>

middleware
  .route('/api/page')
  .post(adminRequired, csrf.protect, async (req, res) => {
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
      return
    }
    switch (req.body.pageType) {
      case 'content':
        break
      default:
        res.status(400).json({ error: 'invalid pageType' })
        return
    }
    const key = req.body.key.toLowerCase().trim()
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
    let page = await model.Page.findOne({
      where: { key, parentId: req.body.parentId || null },
    })
    if (page) {
      res.status(400).json({ error: `${key} already exists` })
      return
    }
    page = await model.Page.create({
      pageType: req.body.pageType,
      key: key,
      title: req.body.title.trim(),
      parentId: req.body.parentId || null,
      userCreated: true,
      settings: {
        includeInNav: true,
      },
    })
    if (req.body.pageType === 'content') {
      await createHeader(page.id)
      await createFooter(page.id)
      db.backup()
      res.json(page)
      cache.clear()
    }
  })

middleware
  .route('/api/page/:id')
  .put(adminRequired, csrf.protect, async (req, res) => {
    const page = await model.Page.findByPk(req.params.id)
    if (!page) {
      res.status(404).json({ error: 'not found' })
      return
    }
    const newKey = req.body.key ? req.body.key.toLowerCase().trim() : ''
    if (page.key !== newKey) {
      if (!page.parentId) {
        switch (newKey) {
          case 'home':
          case 'login':
            res.status(400).json({ error: `${newKey} is reserved` })
            return
          default:
            break
        }
      }
      switch (newKey) {
        case 'header':
        case 'footer':
          res.status(400).json({ error: `${newKey} is reserved` })
          return
        default:
          break
      }
      const pg = await model.Page.findOne({
        where: { key: newKey, parentId: req.body.parentId || null },
      })
      if (pg) {
        res.status(400).json({ error: `${newKey} already exists` })
        return
      }
    }
    page.key = newKey
    if (req.body.title) {
      page.title = req.body.title.trim()
    }
    page.settings = req.body.settings
    const pg = await page.save()
    db.backup()
    res.json(pg)
    cache.clear()
  })
  .delete(adminRequired, csrf.protect, async (req, res) => {
    let page
    try {
      page = await getFullPageById(req.params.id)
    } catch (e) {
      res.status(404).json({ error: 'not found' })
      return
    }
    const ids = []
    const populateIds = (page) => {
      ids.push(page.id)
      for (let child of page.children) {
        populateIds(child)
      }
    }
    populateIds(page.tree)
    for (let pageId of ids) {
      await model.Page.destroy({ where: { id: pageId } })
    }
    db.backup()
    res.json(page)
    cache.clear()
  })

middleware
  .route('/api/page/by-key/*')
  .get(cache.middleware, async (req, res) => {
    try {
      const page = await getFullPageByPath(req.params[0], 3)
      res.json(page)
      cache.set(req.url, page, 'application/json')
    } catch (error) {
      res.status(404).json({ error })
    }
  })

middleware
  .route('/api/page/settings/by-key/*')
  .get(cache.middleware, async (req, res) => {
    const page = await getClosestPageByPath(req.params[0])
    const settings = await getAppliedPageSettings(page.id)
    res.json(settings)
    cache.set(req.url, settings, 'application/json')
  })

middleware
  .route('/api/page/sitemap/by-key/*')
  .get(cache.middleware, async (req, res) => {
    const page = await getClosestPageByPath(req.params[0])
    const siteMap = await getSiteMap(page)
    res.json(siteMap)
    cache.set(req.url, siteMap, 'application/json')
  })

middleware
  .route('/api/page/:id/blocks')
  .post(adminRequired, csrf.protect, async (req, res) => {
    const results = await model.PageBlock.findAll({
      where: { pageId: req.params.id },
      limit: 1,
      order: [['ordering', 'DESC']],
    })
    let ordering = 0
    if (results.length) {
      ordering = results[0].ordering + 1
    }
    let block = await model.PageBlock.create({
      pageId: req.params.id,
      blockType: req.body.blockType || 'content',
      ordering,
      settings: getDefaultBlockSettings(req.body.blockType),
    })
    if (block.blockType === 'content') {
      await model.PageBlockContent.create({
        contentType: 'wysiwyg',
        pageblockId: block.id,
        wysiwyg: '',
        settings: getDefaultContentSettings(),
        ordering: 0,
      })
      block = await model.PageBlock.findByPk(block.id, {
        include: [model.PageBlockContent],
      })
    }
    db.backup()
    res.json(block)
    cache.clear()
  })

middleware
  .route('/api/page/blocks/:id')
  .get(adminRequired, async (req, res) => {
    const pageBlock = await model.PageBlock.findByPk(req.params.id, {
      include: [model.PageBlockContent],
    })
    res.json(pageBlock)
  })
  .put(adminRequired, csrf.protect, async (req, res) => {
    const pageBlock = await model.PageBlock.update(
      {
        ordering: req.body.ordering,
        settings: req.body.settings || {},
      },
      {
        where: { id: req.params.id },
      }
    )
    db.backup()
    res.json(pageBlock)
    cache.clear()
  })
  .delete(adminRequired, csrf.protect, async (req, res) => {
    const pageBlock = await model.PageBlock.findByPk(req.params.id)
    const ordering = pageBlock.ordering
    const pageId = pageBlock.pageId
    await pageBlock.destroy()
    const pageBlocks = await model.PageBlock.findAll({
      where: { ordering: { [Sequelize.Op.gt]: ordering }, pageId },
    })
    pageBlocks.forEach((block) => {
      block.ordering--
      block.save()
    })
    db.backup()
    res.json(true)
    cache.clear()
  })

middleware
  .route('/api/page/blocks/:id/content')
  .post(adminRequired, csrf.protect, async (req, res) => {
    const results = await model.PageBlockContent.findAll({
      where: { pageblockId: req.params.id },
      limit: 1,
      order: [['ordering', 'DESC']],
    })
    let ordering = 0
    if (results.length) {
      ordering = results[0].ordering + 1
    }
    const content = await model.PageBlockContent.create({
      pageblockId: req.params.id,
      contentType: req.body.contentType || 'wyswiyg',
      ordering,
      settings: getDefaultContentSettings(),
      wysiwyg: '',
    })
    db.backup()
    res.json(content)
    cache.clear()
  })

middleware
  .route('/api/page/blocks/content/:id')
  .put(adminRequired, csrf.protect, async (req, res) => {
    const content = await model.PageBlockContent.update(
      {
        ordering: req.body.ordering,
        wysiwyg: getSanitizedHtml(req.body.wysiwyg),
        settings: req.body.settings,
      },
      { where: { id: req.params.id } }
    )
    db.backup()
    content.wysiwyg = getSanitizedHtml(content.wysiwyg)
    res.json(content)
    cache.clear()
  })
  .delete(adminRequired, csrf.protect, async (req, res) => {
    const content = await model.PageBlockContent.findByPk(req.params.id)
    const pageblockId = content.pageblockId
    const ordering = content.ordering
    await content.destroy()
    const contents = await model.PageBlockContent.findAll({
      where: { ordering: { [Sequelize.Op.gt]: ordering }, pageblockId },
    })
    contents.forEach((content) => {
      content.ordering--
      content.save()
    })
    db.backup()
    res.json(true)
    cache.clear()
  })

middleware
  .route('/api/page/:id/settings')
  .get(adminRequired, async (req, res) => {
    const page = await model.Page.findByPk(req.params.id)
    if (!page) {
      res.status(404).json({ error: 'not found' })
      return
    }
    res.json(page.settings)
  })

middleware
  .route('/api/page/:id/sitemap')
  .get(adminRequired, async (req, res) => {
    const page = await model.Page.findByPk(req.params.id)
    if (!page) {
      res.status(404).json({ error: 'not found' })
      return
    }
    const siteMap = await getSiteMap(page)
    res.json(siteMap)
  })

// <== EXPORT ==>

module.exports = {
  middleware,
  funcs: {
    copyPage,
    copyPageWithChildren,
    getAppliedPageSettings,
    getFullPageById,
    getFullPageByPath,
    getPageByPath,
    getPagePath,
    sanitizeContent,
  },
  model,
  sync,
}
