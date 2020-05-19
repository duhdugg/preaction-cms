const fs = require('fs')
const path = require('path')
const Op = require('sequelize').Op

const db = require('../lib/db.js')
const pages = require('../lib/modules/pages.js')

const ignore = ['.gitignore']

const listUploads = () => {
  let uploads = fs.readdirSync(path.join(__dirname, '../uploads'))
  uploads.forEach(async (filename) => {
    if (ignore.includes(filename)) {
      return
    }
    let inSetting = false
    let inPageSetting = false
    let inPageBlockImage = false
    let inPageBlockComponent = false
    let settingsWithFile = await db.model.Settings.findAll({
      where: { value: `uploads/${filename}` },
    })
    let pagesWithBg = await pages.model.PageBlock.findAll({
      where: { settings: { '"bg"': `uploads/${filename}` } },
    })
    let pageBlockImagesUsingFile = await pages.model.PageBlockContent.findAll({
      where: { filename },
    })
    let pageBlockComponentsUsingFile = await pages.model.PageBlock.findAll({
      where: {
        blockType: 'component',
        settings: { '"src"': { [Op.like]: `%${filename}%` } },
      },
    })
    inSetting = settingsWithFile.length > 0
    inPageSetting = pagesWithBg.length > 0
    inPageBlockImage = pageBlockImagesUsingFile.length > 0
    inPageBlockComponent = pageBlockComponentsUsingFile.length > 0
    if (
      inSetting ||
      inPageSetting ||
      inPageBlockImage ||
      inPageBlockComponent
    ) {
      console.log(`uploads/${filename}`)
    }
  })
}

// if called directly
if (require.main === module) {
  listUploads()
}

module.exports = listUploads
