// render the client (public/index.html),
// replacing placeholder text with env variables and metadata, where
// metadata is defined by settings in db, combined with options
// passed in the third argument

const fs = require('fs')
const cache = require('./cache.js')
const db = require('./db.js')
const env = require('./env.js')

// TODO: rewrite using async/await

module.exports = {
  renderClient: (req, res, options = {}) => {
    const getTitle = new Promise((resolve, reject) => {
      db.model.Settings.findOne({
        where: { key: 'siteTitle' },
      }).then((setting) => {
        let title = ''
        if (setting) {
          title = setting.value
        }
        resolve(title)
      })
    })
    const getHeadSnippet = new Promise((resolve, reject) => {
      db.model.Settings.findOne({
        where: { key: 'useGoogleAnalytics' },
      }).then((setting) => {
        if (setting && setting.value) {
          db.model.Settings.findOne({
            where: { key: 'googleAnalyticsTrackingId' },
          }).then((tidSetting) => {
            if (tidSetting && tidSetting.value) {
              let snippet = fs
                .readFileSync('snippets/google-analytics.html', {
                  encoding: 'utf8',
                })
                .replace(/\$TRACKINGID/g, tidSetting.value)
                .replace(/\$PATH/g, req.path)
              resolve(snippet)
            } else {
              resolve('')
            }
          })
        } else {
          resolve('')
        }
      })
    })
    getTitle.then((title) => {
      let siteTitle = options.siteTitle || title
      let pageTitle = options.pageTitle
      if (pageTitle) {
        title = `${pageTitle} | ${siteTitle}`
      } else {
        title = siteTitle
      }
      let metadata = { title, image: `${env.root}/icon` }
      let timestamp = +new Date()
      Object.assign(metadata, options)
      fs.readFile('build/index.html', 'utf8', (err, contents) => {
        if (err) throw err
        getHeadSnippet.then((snippet) => {
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
            .replace(/<script><\/script>/g, snippet)
          res.send(contents)
          cache.set(req.url, contents, 'text/html')
        })
      })
    })
  },
}
