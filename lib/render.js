// render the client (public/index.html),
// replacing placeholder text with env variables and metadata, where
// metadata is defined by settings in db, combined with options
// passed in the third argument

const fs = require('fs')
const cache = require('./cache.js')
const db = require('./db.js')
const env = require('./env.js')

module.exports = {
  renderClient: async (req, res, options = {}) => {
    let siteTitle = options.siteTitle
    if (!siteTitle) {
      const setting = await db.model.Settings.findOne({
        where: { key: 'siteTitle' },
      })
      siteTitle = setting.value
    }
    let headSnippet
    const setting = await db.model.Settings.findOne({
      where: { key: 'useGoogleAnalytics' },
    })
    if (setting && setting.value) {
      const tidSetting = await db.model.Settings.findOne({
        where: { key: 'googleAnalyticsTrackingId' },
      })
      if (tidSetting && tidSetting.value) {
        headSnippet = fs
          .readFileSync('snippets/google-analytics.html', {
            encoding: 'utf8',
          })
          .replace(/\$TRACKINGID/g, tidSetting.value)
          .replace(/\$PATH/g, `${env.root}${req.path}`)
      }
    }
    const title = options.pageTitle
      ? `${options.pageTitle} | ${siteTitle}`
      : siteTitle
    const metadata = { title, image: `${env.root}/icon` }
    const timestamp = +new Date()
    Object.assign(metadata, options)
    fs.readFile('build/index.html', 'utf8', (err, contents) => {
      if (err) throw err
      contents = contents
        .replace(/\$OG_TITLE/g, metadata.title)
        .replace(/\$OG_DESCRIPTION/g, metadata.description || '')
        .replace(/\$OG_URL/g, `${env.root}${req.url}`)
        .replace(/\$OG_IMAGE/g, metadata.image)
        .replace(/\$TIMESTAMP/g, timestamp)
        .replace(/href="\/static\//gi, `href="${env.root}/static/`)
        .replace(/src="\/static\//gi, `src="${env.root}/static/`)
        .replace(/\$ROOT/g, env.root)
        .replace(/\$SOCKET_MODE/g, env.socketMode)
        .replace(/<script><\/script>/g, headSnippet || '')
      res.send(contents)
      if (res.statusCode === 200) {
        cache.set(req.url, contents, 'text/html')
      }
    })
  },
}
