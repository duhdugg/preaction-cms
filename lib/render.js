/**
 * @module lib/render
 */

const fs = require('fs')
const cache = require('./cache.js')
const reactSSR = require('../build/static/js/client.cjs.js').render
const metaSSR = require('../build/static/js/meta.cjs.js').render
const db = require('./db.js')
const env = require('./env.js')
const pages = require('./pages.js')
const { getIcons } = require('./icon.js')

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
   * @param {Object} options.page.fallbackSettings
   * @param {string} options.page.fallbackSettings.headerPath
   * will defer to `'/home/header/'` if `undefined`
   * @param {string} options.page.fallbackSettings.footerPath
   * will defer to `'/home/footer/'` if `undefined`
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
      options.page.header = await pages.getFullPageByPath(
        options.page.settings.headerPath ||
          options.page.fallbackSettings.headerPath ||
          '/home/header/',
        1
      )
      options.page.footer = await pages.getFullPageByPath(
        options.page.settings.footerPath ||
          options.page.fallbackSettings.footerPath ||
          '/home/footer/',
        1
      )
      // remove unneeded attributes
      delete options.page.header.tree
      delete options.page.header.siteMap
      delete options.page.header.fallbackSettings
      delete options.page.footer.tree
      delete options.page.footer.siteMap
      delete options.page.footer.fallbackSettings
      // sanitize all content
      pages.sanitizeContent(options.page)
      pages.sanitizeContent(options.page.header)
      pages.sanitizeContent(options.page.footer)
    }
    Object.assign(metadata, options)
    fs.readFile('build/index.html', 'utf8', (err, contents) => {
      if (err) throw err
      contents = contents
        .replace(/\$TITLE/g, metadata.title)
        .replace(/<meta name="template"\/>/, metaSSR(metadata))
        .replace(/\$ROOT/g, env.root)
        .replace(/"\$INIT_PAGE"/g, JSON.stringify(options.page))
        .replace(/"\$INIT_SETTINGS"/g, JSON.stringify(options.siteSettings))
        .replace(/\$SOCKET_MODE/g, env.socketMode)
        .replace(/<script><\/script>/g, headSnippet || '')
        .replace(
          '<div id="root"></div>',
          '<div id="root">' +
            reactSSR({
              init404: options.init404,
              initPath: req.path,
              initPage: options.page,
              initSettings: options.siteSettings,
              root: env.root,
            }) +
            '</div>'
        )
      res.send(contents)
      if (res.statusCode === 200) {
        cache.set(req.url, contents, 'text/html')
      }
    })
  },
}
