/**
 * @module lib/render
 */

const enableSSR = false

const fs = require('fs')
const cache = require('./cache.js')
const db = require('./db.js')
const env = require('./env.js')
const pages = require('./pages.js')
const { getIcons } = require('./icon.js')
const pkg = require('../package.json')
let reactSSR, metaSSR
if (env.nodeEnv === 'test') {
  reactSSR = () => ''
  metaSSR = () => ''
} else {
  if (enableSSR) {
    reactSSR = require('../build/ssr/client.cjs.js').render
    metaSSR = require('../build/ssr/meta.cjs.js').render
  }
}

module.exports = {
  /**
   * @function
   * @param {express.Request} req
   * @param {express.Response} res
   * @param {Object} options
   * @param {string} options.siteTitle
   * @param {string} options.pageTitle
   * @param {Object} options.page full page, not required
   * @param {Object} options.page.settings
   * @param {string} options.page.settings.headerPath
   * will defer to `options.page.fallbackSettings.headerPath` if `undefined`
   * @param {string} options.page.settings.footerPath
   * will defer to `options.page.fallbackSettings.footerPath` if `undefined`
   * @param {string} options.page.settings.jumboPath
   * will defer to `options.page.fallbackSettings.jumboPath` if `undefined`
   * @param {Object} options.page.fallbackSettings
   * @param {string} options.page.fallbackSettings.headerPath
   * will defer to `'/home/header/'` if `undefined`
   * @param {string} options.page.fallbackSettings.footerPath
   * will defer to `'/home/footer/'` if `undefined`
   * @param {string} options.page.fallbackSettings.jumboPath
   * will defer to `'/home/jumbo/'` if `undefined`
   * @description render the client (public/index.html),
   * replacing placeholder text with env variables and metadata, where
   * metadata is defined by settings in db, combined with options
   * passed in the third argument
   */
  renderClient: async (req, res, options = {}) => {
    let siteTitle = options.siteTitle
    if (!siteTitle) {
      const setting = await db.model.Settings.findOne({
        where: { key: 'siteTitle' },
      })
      siteTitle = setting.value
    }
    let headSnippet
    if (env.googleAnalytics) {
      headSnippet = fs
        .readFileSync('snippets/google-analytics.html', {
          encoding: 'utf8',
        })
        .replace(/\$TRACKINGID/g, env.googleAnalytics)
        .replace(/\$PATH/g, `${env.root}${req.path}`)
    }
    let bodySnippet
    if (env.socketMode) {
      const siov = pkg.dependencies['socket.io'].replace(/\^/, '')
      bodySnippet = `<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/socket.io-client@${siov}/dist/socket.io.min.js"></script>`
    }
    const title = options.pageTitle
      ? `${options.pageTitle} | ${siteTitle}`
      : siteTitle
    const metadata = {
      title,
      ogType: 'website',
      ogUrl: `${env.root}${req.path}`,
      icons: getIcons(),
    }
    if (options.page) {
      let headerPath =
        options.page.settings.headerPath ||
        options.page.fallbackSettings.headerPath ||
        '/home/header/'
      if (!headerPath.match(/\/header\/$/)) {
        headerPath = '/home/header/'
      }
      try {
        options.page.header = await pages.getFullPageByPath(headerPath, 1)
      } catch {
        options.page.header = await pages.getFullPageByPath('/home/header/', 1)
      }
      try {
        let footerPath =
          options.page.settings.footerPath ||
          options.page.fallbackSettings.footerPath ||
          '/home/footer/'
        if (!footerPath.match(/\/footer\/$/)) {
          footerPath = '/home/footer/'
        }
        options.page.footer = await pages.getFullPageByPath(footerPath, 1)
      } catch {
        options.page.footer = await pages.getFullPageByPath('/home/footer', 1)
      }
      try {
        let jumboPath =
          options.page.settings.jumboPath ||
          options.page.fallbackSettings.jumboPath ||
          '/home/jumbo/'
        if (!jumboPath.match(/\/jumbo\/$/)) {
          jumboPath = '/home/jumbo/'
        }
        options.page.jumbo = await pages.getFullPageByPath(jumboPath, 1)
      } catch {
        options.page.jumbo = await pages.getFullPageByPath('/home/jumbo', 1)
      }
      // remove unneeded attributes
      delete options.page.header.tree
      delete options.page.header.siteMap
      delete options.page.header.fallbackSettings
      delete options.page.footer.tree
      delete options.page.footer.siteMap
      delete options.page.footer.fallbackSettings
      delete options.page.jumbo.tree
      delete options.page.jumbo.siteMap
      delete options.page.jumbo.fallbackSettings
      // sanitize all content
      pages.sanitizeContent(options.page)
      pages.sanitizeContent(options.page.header)
      pages.sanitizeContent(options.page.footer)
      pages.sanitizeContent(options.page.jumbo)
    }
    Object.assign(metadata, options)
    fs.readFile('build/index.html', 'utf8', (err, contents) => {
      if (err) throw err
      contents = contents
        .replace(/\$TITLE/g, metadata.title)

        .replace(/<meta name="template"\/>/, enableSSR ? metaSSR(metadata) : '')
        .replace(/\$ROOT/g, env.root)
        .replace(/"\$INIT_PAGE"/g, JSON.stringify(options.page))
        .replace(/"\$INIT_SETTINGS"/g, JSON.stringify(options.siteSettings))
        .replace(/"\$SOCKET_MODE"/g, env.socketMode)
        .replace(/<script id="head-snippet"><\/script>/g, headSnippet || '')
        .replace(/<script id="body-snippet"><\/script>/g, bodySnippet || '')
      if (enableSSR) {
        contents = contents.replace(
          '<div id="root"></div>',
          '<div id="root">' +
            reactSSR({
              init404: options.init404,
              initError: options.initError,
              initPath: req.path,
              initPage: options.page,
              initSettings: options.siteSettings,
              root: env.root,
            }) +
            '</div>'
        )
      }
      res.send(contents)
      if (res.statusCode === 200) {
        cache.set(req.path, contents, 'text/html')
      }
    })
  },
}
