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
    let getDescription = new Promise((resolve, reject) => {
      db.model.Settings.findOne({
        where: { key: 'siteDescription' }
      }).then(setting => {
        let description = ''
        if (setting) {
          description = setting.value
        }
        resolve(description)
      })
    })
    getTitle.then(title => {
      getDescription.then(description => {
        let metadata = { title, description, image: '/logo.png' }
        Object.assign(metadata, options)
        fs.readFile('build/index.html', 'utf8', (err, contents) => {
          if (err) throw err
          res.send(
            contents
              .replace(/\$OG_TITLE/gi, metadata.title)
              .replace(/\$OG_DESCRIPTION/gi, metadata.description)
              .replace(/\$OG_URL/gi, req.url)
              .replace(/\$OG_IMAGE/gi, metadata.image)
          )
        })
      })
    })
  }
}
