// render the client (public/index.html),
// replacing placeholder text with metadata
// metadata is defined by settings in db, combined with options
// passed in the third argument

const fs = require('fs')
const db = require('./db.js')

module.exports = {
  renderClient: (req, res, options) => {
    let getTitle = new Promise((resolve, reject) => {
      db.model.Settings.findOne({
        where: { key: 'siteTitle' }
      }).then(setting => {
        let title = ''
        if (setting) {
          title = setting.value
        }
        resolve(title)
      })
    })
    getTitle.then(title => {
      let metadata = { title, image: '/icon' }
      let timestamp = +new Date()
      Object.assign(metadata, options)
      fs.readFile('build/index.html', 'utf8', (err, contents) => {
        if (err) throw err
        res.send(
          contents
            .replace(/\$OG_TITLE/gi, metadata.title)
            .replace(/\$OG_DESCRIPTION/gi, metadata.description || '')
            .replace(/\$OG_URL/gi, req.url)
            .replace(/\$OG_IMAGE/gi, metadata.image)
            .replace(/\$TIMESTAMP/gi, timestamp)
        )
      })
    })
  }
}
