/**
 * @module lib/pages
 */

const adminRequired = require('./adminRequired.js')
const bodyParser = require('body-parser')
const express = require('express')
const sanitizeHtml = require('sanitize-html')
const Sequelize = require('sequelize')
const cache = require('./cache.js')
const csrf = require('./csrf.js')
const db = require('./db.js')

// <== EXPRESS MODULE SETUP ==>

/**
 * @memberof lib/pages
 * @type {express}
 * @see {@link https://expressjs.com/en/guide/using-middleware.html}
 */
const middleware = express()
middleware.use(bodyParser.json({ limit: '50mb' }))

// <== DATABASE DEFINITIONS ==>

/**
 * @memberof lib/pages
 * @type {Object}
 * @description table definitions
 */
const model = {}

// Page.pageType should be 'content'
/**
 * @memberof lib/pages.model
 * @class
 */
model.Page = db.sequelize.define('page', {
  /**
   * @memberof lib/pages.model.Page
   * @instance
   * @type {string}
   */
  key: { type: Sequelize.STRING },
  /**
   * @memberof lib/pages.model.Page
   * @instance
   * @type {string}
   */
  title: { type: Sequelize.STRING },
  /**
   * @memberof lib/pages.model.Page
   * @instance
   * @type {string}
   * @description this should be `content` for all pages right now.
   * It is here for future use of other page types.
   */
  pageType: { type: Sequelize.STRING },
  /**
   * @memberof lib/pages.model.Page
   * @instance
   * @type {boolean}
   * @description whether the page was created by a user. defaults to `false`.
   */
  userCreated: { type: Sequelize.BOOLEAN, defaultValue: false },
  /**
   * @memberof lib/pages.model.Page
   * @instance
   * @type {Object}
   * @description settings can be overridden by pages
   */
  settings: { type: Sequelize.JSON, defaultValue: {} },
  /**
   * @memberof lib/pages.model.Page
   * @instance
   * @type {number}
   */
  parentId: { type: Sequelize.INTEGER },
})

/**
 * @memberof lib/pages.model
 * @class
 */
model.PageBlock = db.sequelize.define('pageblock', {
  /**
   * @memberof lib/pages.model.PageBlock
   * @instance
   * @type {string}
   * @description PageBlock.blockType should be 'carousel', 'content', 'ext', 'iframe', 'nav', or 'spacer'
   */
  blockType: { type: Sequelize.STRING },
  /**
   * @memberof lib/pages.model.PageBlock
   * @instance
   * @type {number}
   */
  ordering: { type: Sequelize.INTEGER },
  /**
   * @memberof lib/pages.model.PageBlock
   * @instance
   * @type {Object}
   */
  settings: { type: Sequelize.JSON, defaultValue: {} },
})

/**
 * @memberof lib/pages.model
 * @class
 */
model.PageBlockContent = db.sequelize.define('pageblockcontent', {
  /**
   * @memberof lib/pages.model.PageBlockContent
   * @instance
   * @type {string}
   * @description 'image', 'spacer', or 'wysiwyg'
   */
  contentType: { type: Sequelize.STRING },
  /**
   * @memberof lib/pages.model.PageBlockContent
   * @instance
   * @type {number}
   */
  ordering: { type: Sequelize.INTEGER },
  /**
   * @memberof lib/pages.model.PageBlockContent
   * @instance
   * @type {Object}
   */
  settings: { type: Sequelize.JSON, defaultValue: {} },
  /**
   * @memberof lib/pages.model.PageBlockContent
   * @instance
   * @type {string}
   * @description for 'wysiwyg' content types only, formatted as HTML.
   * **This should always be sanitized before injecting into DOM.**
   */
  wysiwyg: { type: Sequelize.TEXT },
})

/**
 * @memberof lib/pages.model.Page
 * @instance
 * @type {lib/pages.model.PageBlock[]}
 * @name pageblocks
 */
model.Page.hasMany(model.PageBlock, { onDelete: 'cascade', hooks: true })
/**
 * @memberof lib/pages.model.PageBlock
 * @instance
 * @type {lib/pages.model.Page}
 * @name page
 */
model.PageBlock.belongsTo(model.Page, { hooks: true })
/**
 * @memberof lib/pages.model.PageBlock
 * @instance
 * @type {lib/pages.model.PageBlockContent[]}
 * @name pageblockcontents
 */
model.PageBlock.hasMany(model.PageBlockContent, {
  onDelete: 'cascade',
  hooks: true,
})
/**
 * @memberof lib/pages.model.PageBlockContent
 * @instance
 * @type {lib/pages.model/PageBlock}
 * @name pageblock
 */
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

/**
 * @memberof lib/pages
 * @function
 * @description copies a page
 * @param {Object} fullPage
 * @param {number} destinationParentId the id of the page which should parent
 * the newly copied children
 * @param {string} destinationKey
 * @returns {Promise} page
 */
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

/**
 * @memberof lib/pages
 * @function
 * @param {Object} fullPage
 * @param {number} destinationParentId
 * @param {string} destinationKey
 * @returns {Promise} new parent page
 */
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

const createJumbo = (parentId) => {
  return model.Page.findOrCreate({
    where: { key: 'jumbo', parentId },
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

/**
 * @memberof lib/pages
 * @function
 * @param {number} pageId
 * @description resolves all settings passed down by parental lineage
 * @returns {Promise} `Object` settings
 */
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
    Object.assign(s, pg.settings)
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
  let cp = null
  while (splitPath.length && !cp) {
    try {
      cp = await getPageBySplitPath(null, splitPath)
    } catch (e) {
      splitPath.pop()
    }
  }
  if (!cp) {
    cp = await model.Page.findOne({
      where: { parentId: null, key: 'home' },
    })
  }
  return cp
}

// default block settings should ensure that all required settings are set
const getDefaultBlockSettings = (blockType) => {
  const settings = {
    bodyTheme: 'transparent',
    borderTheme: 'dark',
    customClassName: '',
    header: '',
    headerLevel: 0,
    headerTheme: 'dark',
    pad: false,
    xxlWidth: 12,
    lgWidth: 12,
    mdWidth: 12,
    smWidth: 12,
    xsWidth: 12,
  }
  if (blockType === 'carousel') {
    settings.arrows = true
    settings.autoplay = true
    settings.autoplayPauseOnHover = true
    settings.infinite = true
    settings.keyboardNavigation = true
    settings.swipe = true
  } else if (blockType === 'ext') {
    settings.extKey = undefined
    settings.propsData = {}
  } else if (blockType === 'nav') {
    settings.navAlignment = 'vertical'
    settings.navCollapsible = false
    settings.subMenu = false
  } else if (blockType === 'iframe') {
    settings.height = '32'
    settings.iframeSrc = 'about:blank'
  } else if (blockType === 'spacer') {
    settings.spacerHeight = '1'
  }
  return settings
}

// default content settings should ensure that all required settings are set
const getDefaultContentSettings = (contentType) => {
  const retval = {
    bodyTheme: 'transparent',
    borderTheme: 'dark',
    customClassName: '',
    header: '',
    headerLevel: 0,
    headerTheme: 'dark',
    pad: false,
    xxlWidth: 12,
    lgWidth: 12,
    mdWidth: 12,
    smWidth: 12,
    xsWidth: 12,
  }
  if (contentType === 'image') {
    Object.assign(retval, {
      lgWidth: 3,
      mdWidth: 4,
      smWidth: 6,
    })
  } else if (contentType === 'spacer') {
    Object.assign(retval, {
      spacerHeight: '1',
    })
  }
  return retval
}

/**
 * @memberof lib/pages
 * @function
 * @description depth should be specified in most cases to improve performance.
 * @param {number} pageId
 * @param {number} depth
 * if depth is 1, no child pages will be populated in the tree
 * if depth is 2, only direct descendents will be populated in the tree
 * if depth is 3, it will include grandchildren
 * if depth is less than 1 (default), no limit is applied to child page depth
 * @param {boolean} excludeHeaderFooterJumbo
 * if true, the header, footer, and jumbo pages will be excluded from the tree
 * @returns {Promise} `Object` "full" page, meaning blocks, content,
 * tree, and sitemap included
 */
const getFullPageById = async (
  pageId,
  depth,
  excludeHeaderFooterJumbo = true
) => {
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
  // headers, footers, and jumbos don't need these extra attributes
  if (['header', 'footer', 'jumbo'].includes(page.key)) {
    return page
  }
  const fallbackSettings = await getAppliedPageSettings(page.parentId)
  delete fallbackSettings.site
  let sm = await getSiteMap(page)
  // remove attributes not needed in sitemap
  sm = {
    key: sm.key,
    path: sm.path,
    children: sm.children,
  }
  let pt = await getPageTree(page, depth, excludeHeaderFooterJumbo)
  const obj = JSON.parse(JSON.stringify(page))
  Object.assign(obj, { fallbackSettings })
  obj.siteMap = sm
  obj.tree = pt
  return obj
}

/**
 * @memberof lib/pages
 * @function
 * @description depth should be specified in most cases to improve performance.
 * @param {string} path
 * @param {number} depth
 * see lib/pages.getFullPageById
 * @returns {Promise} `Object` "full" page, meaning blocks, content,
 * tree, and sitemap included
 */
const getFullPageByPath = async (path, depth) => {
  const page = await getPageByPath(path)
  return await getFullPageById(page.id, depth)
}

/**
 * @memberof lib/pages
 * @description generate the path used by parental lineage to access the page
 * @param {Object} page
 * @returns {Promise} `string` path
 */
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

/**
 * @memberof lib/pages
 * @function
 * @param {string} path
 * @returns {Promise} `Object` page
 */
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
const getSiteMap = async (page) => {
  const pageTree = await getPageTree(page, 3)
  if (pageTree.settings.site) {
    return pageTree
  }
  const ancestry = await getAncestry(page)
  ancestry.reverse()
  for (const pg of ancestry) {
    if (pg.settings.site) {
      return await getPageTree(pg, 3)
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
const getPageTree = async (
  page,
  depth = 0,
  excludeHeaderFooterJumbo = true
) => {
  const pageTree = JSON.parse(JSON.stringify(page))
  delete pageTree.pageblocks
  pageTree.children = []
  const path = await getPagePath(page)
  pageTree.path = path
  let where = {
    parentId: page.id,
  }
  if (excludeHeaderFooterJumbo) {
    where = {
      parentId: page.id,
      [Sequelize.Op.not]: [
        {
          [Sequelize.Op.or]: [
            { key: 'header' },
            { key: 'footer' },
            { key: 'jumbo' },
          ],
        },
      ],
    }
  }
  if (depth !== 1) {
    const results = await model.Page.findAll({
      where,
    })
    if (results) {
      for (const pg of results) {
        const pt = await getPageTree(
          pg,
          depth ? depth - 1 : undefined,
          excludeHeaderFooterJumbo
        )
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

// ensures that a default home, header, footer, and jumbo page are created
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
  const jumbo = await createJumbo(home.id)
  return { home, header, footer, jumbo }
}

const getSanitizedHtml = (html) =>
  typeof html !== 'undefined'
    ? sanitizeHtml(html, {
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
          a: ['href', 'target', 'class', 'rel'],
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
    : undefined

/**
 * @memberof lib/pages
 * @description sanitizes (mutates) wysiwyg content in page
 * @param {Object} page
 * @returns {boolean} `true`
 */
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

/**
 * @memberof lib/pages
 * @function
 * @description ensures that default pages are created
 * @returns {Promise} `Object` with default home, header, footer, and jumbo pages
 */
const sync = async () => {
  await dbSync()
  const defaultPages = await findOrCreateDefaultPages()
  return { defaultPages }
}

// <== EXPRESS MODULE ROUTES ==>

middleware
  .route('/api/page')
  /**
   * @memberof lib/pages.middleware
   * @function
   * @param {express.Request} req
   * @param {Object} req.body as JSON
   * @param {string} req.body.pageType
   * @param {string} req.body.key
   * @param {string} req.body.title
   * @param {number} req.body.parentId
   * @param {express.Response} res
   * @name POST-api/page
   * @description creates a page
   * @returns {Object} page
   */
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
      case 'jumbo':
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
      await createJumbo(page.id)
      db.backup()
      res.json(page)
      cache.clear()
    }
  })

middleware
  .route('/api/page/:id')
  /**
   * @memberof lib/pages.middleware
   * @function
   * @name PUT-api/page/_id
   * @param {express.Request} req
   * @param {Object} req.params
   * @param {number} req.params._id
   * @param {Object} req.body as JSON
   * @param {string} req.body.pageType
   * @param {string} req.body.key
   * @param {string} req.body.title
   * @param {number} req.body.parentId
   * @param {Object} req.body.settings
   * @param {express.Response} res
   * @description creates a page
   * @returns {Object} page
   */
  .put(adminRequired, csrf.protect, async (req, res) => {
    const page = await model.Page.findByPk(req.params.id)
    if (!page) {
      res.status(404).json({ error: 'not found' })
      return
    }
    const newKey = req.body.key ? req.body.key.toLowerCase().trim() : ''
    if (page.key !== newKey) {
      switch (newKey) {
        case 'header':
        case 'footer':
        case 'jumbo':
        case 'home':
        case 'login':
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
  /**
   * @memberof lib/pages.middleware
   * @function
   * @name DELETE-api/page/_id
   * @param {express.Request} req
   * @param {Object} req.params
   * @param {number} req.params._id
   * @description deletes a page
   * @returns {Object} deleted page
   */
  .delete(adminRequired, csrf.protect, async (req, res) => {
    let page
    try {
      page = await getFullPageById(req.params.id, 0, false)
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
  /**
   * @memberof lib/pages.middleware
   * @function
   * @name GET-api/page/by-key/params
   * @param {express.Request} req
   * @param {string[]} req.params path joined by `/` separator
   * @param {express.Response} res
   * @description gets a page by its path
   * @returns {Object} page
   */
  .get(cache.middleware, async (req, res) => {
    try {
      const page = await getFullPageByPath(req.params[0], 3)
      res.json(page)
      cache.set(req.path, page, 'application/json')
    } catch (error) {
      res.status(404).json({ error })
    }
  })

middleware
  .route('/api/page/settings/by-key/*')
  /**
   * @memberof lib/pages.middleware
   * @function
   * @name GET-api/page/settings/by-key/params
   * @param {express.Request} req
   * @param {string[]} req.params path joined by `/` separator
   * @param {express.Response} res
   * @description gets a page's settings by its path
   * @returns {Object} settings
   */
  .get(cache.middleware, async (req, res) => {
    const page = await getClosestPageByPath(req.params[0])
    const settings = await getAppliedPageSettings(page.id)
    res.json(settings)
    cache.set(req.path, settings, 'application/json')
  })

middleware
  .route('/api/page/sitemap/by-key/*')
  /**
   * @memberof lib/pages.middleware
   * @function
   * @name GET-api/page/sitemap/by-key/params
   * @param {express.Request} req
   * @param {string[]} req.params path joined by `/` separator
   * @param {express.Response} res
   * @description = gets a page's sitemap by its path
   * @returns {Object} sitemap
   */
  .get(cache.middleware, async (req, res) => {
    const page = await getClosestPageByPath(req.params[0])
    const siteMap = await getSiteMap(page)
    res.json(siteMap)
    cache.set(req.path, siteMap, 'application/json')
  })

middleware
  .route('/api/page/:id/blocks')
  /**
   * @memberof lib/pages.middleware
   * @function
   * @name POST-api/page/_id/blocks
   * @param {express.Request} req
   * @param {Object} req.params
   * @param {number} req.params._id
   * @param {Object} req.body as JSON
   * @param {string} req.body.blockType
   * @param {Object} req.body.settings
   * @param {express.Response} res
   * @description create a new page block
   * @returns {Object} block
   */
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
      pageId: Number(req.params.id),
      blockType: req.body.blockType || 'content',
      ordering,
      settings: Object.assign(
        getDefaultBlockSettings(req.body.blockType),
        req.body.settings || {}
      ),
    })
    if (block.blockType === 'content') {
      await model.PageBlockContent.create({
        contentType: 'wysiwyg',
        pageblockId: block.id,
        wysiwyg: '',
        settings: getDefaultContentSettings('wysiwyg'),
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
  /**
   * @memberof lib/pages.middleware
   * @function
   * @name GET-api/page/blocks/_id
   * @param {express.Request} req
   * @param {Object} req.params
   * @param {number} req.params._id
   * @param {express.Response} res
   * @description get a pageBlock by its id
   * @returns {Object} pageBlock
   */
  .get(adminRequired, async (req, res) => {
    const pageBlock = await model.PageBlock.findByPk(req.params.id, {
      include: [model.PageBlockContent],
    })
    res.json(pageBlock)
  })
  /**
   * @memberof lib/pages.middleware
   * @function
   * @name PUT-api/page/blocks/_id
   * @param {express.Request} req
   * @param {Object} req.params
   * @param {number} req.params._id
   * @param {Object} req.body as JSON
   * @param {number} req.body.ordering
   * @param {Object} req.body.settings
   * @param {express.Response} res
   * @description update a pageBlock by its id
   * @returns {Object} pageBlock
   */
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
  /**
   * @memberof lib/pages.middleware
   * @function
   * @name DELETE-api/page/blocks/_id
   * @param {express.Request} req
   * @param {Object} req.params
   * @param {number} req.params._id
   * @param {express.Response} res
   * @description delete a pageBlock by its id
   * @returns {boolean} `true`
   */
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
  /**
   * @memberof lib/pages.middleware
   * @function
   * @name POST-api/page/blocks/_id/content
   * @param {express.Request} req
   * @param {Object} req.params
   * @param {number} req.params._id
   * @param {Object} req.body as JSON
   * @param {string} req.body.contentType
   * @param {express.Response} res
   * @description creates a new content item for a block
   * @returns {Object} content
   */
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
      pageblockId: Number(req.params.id),
      contentType: req.body.contentType || 'wyswiyg',
      ordering,
      settings: Object.assign(
        req.body.settings || {},
        getDefaultContentSettings(req.body.contentType || 'wysiwyg')
      ),
      wysiwyg: '',
    })
    db.backup()
    res.json(content)
    cache.clear()
  })

middleware
  .route('/api/page/blocks/content/:id')
  /**
   * @memberof lib/pages.middleware
   * @function
   * @name PUT-api/page/block/content/_id
   * @param {express.Request} req
   * @param {Object} req.params
   * @param {number} req.params._id
   * @param {Object} req.body as JSON
   * @param {number} req.body.ordering
   * @param {Object} req.body.settings
   * @param {string} req.body.wysiwyg
   * @param {express.Response} res
   * @description updates content
   * @returns {number[]} `[ id ]`
   */
  .put(adminRequired, csrf.protect, async (req, res) => {
    const contentIds = await model.PageBlockContent.update(
      {
        ordering: req.body.ordering,
        wysiwyg: getSanitizedHtml(req.body.wysiwyg),
        settings: req.body.settings,
      },
      { where: { id: req.params.id } }
    )
    db.backup()
    res.json(contentIds)
    cache.clear()
  })
  /**
   * @memberof lib/pages.middleware
   * @function
   * @name DELETE-api/page/block/content/_id
   * @param {express.Request} req
   * @param {Object} req.params
   * @param {number} req.params._id
   * @param {express.Response} res
   * @description deletes content
   * @returns {boolean} `true`
   */
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
  /**
   * @memberof lib/pages.middleware
   * @function
   * @name GET-api/page/_id/settings
   * @param {express.Request} req
   * @param {Object} req.params
   * @param {number} req.params._id
   * @param {express.Response} res
   * @description gets a page's settings by its id
   * @returns {Object} settings
   */
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
  /**
   * @memberof lib/pages.middleware
   * @function
   * @name GET-api/page/_id/sitemap
   * @param {express.Request} req
   * @param {Object} req.params
   * @param {number} req.params._id
   * @param {express.Response} res
   * @description gets a page's sitemap by its id
   * @returns {Object} sitemap
   */
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
  copyPage,
  copyPageWithChildren,
  getAppliedPageSettings,
  getFullPageById,
  getFullPageByPath,
  getPageByPath,
  getPagePath,
  model,
  sanitizeContent,
  sync,
}
