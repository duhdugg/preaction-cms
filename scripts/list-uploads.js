const fs = require('fs')
const path = require('path')

const db = require('../lib/db.js')
const pages = require('../lib/modules/pages.js')

const ignore = ['.gitignore']

const listUploads = () => {
  let uploads = fs.readdirSync(path.join(__dirname, '../uploads'))
  uploads.forEach((filename) => {
    if (ignore.includes(filename)) {
      return
    }
    let settingsCheck = db.model.Settings.findAll({
      where: { value: `uploads/${filename}` },
    })
    let pageSettingsCheck = pages.model.Page.findAll({
      where: { settings: { '"bg"': `uploads/${filename}` } },
    })
    let pageBlockImageCheck = pages.model.PageBlockContent.findAll({
      where: {
        filename,
      },
    })
    Promise.all([settingsCheck, pageSettingsCheck, pageBlockImageCheck]).then(
      () => {
        let inSetting = false
        let inPageSetting = false
        let inPageBlockImage = false
        settingsCheck.then((settings) => {
          settings.forEach((setting) => {
            inSetting = true
          })
          pageSettingsCheck.then((pages) => {
            pages.forEach((page) => {
              inPageSetting = true
            })
            pageBlockImageCheck.then((pageBlockContents) => {
              pageBlockContents.forEach((pbc) => {
                inPageBlockImage = true
              })
              if (inSetting || inPageSetting || inPageBlockImage) {
                console.debug(`uploads/${filename}`)
              }
            })
          })
        })
      }
    )
  })
}

// if called directly
if (require.main === module) {
  listUploads()
}

module.exports = listUploads
