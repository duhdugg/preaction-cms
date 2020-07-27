const fs = require('fs')
const path = require('path')
const Op = require('sequelize').Op

const db = require('../lib/db.js')
const pages = require('../lib/pages.js')

const ignore = ['.gitignore']

const listUploads = async () => {
  const uploads = fs.readdirSync(path.join(__dirname, '../uploads'))
  const usedUploads = []
  for (let filename of uploads) {
    if (ignore.includes(filename)) {
      continue
    }
    let inSetting = false
    let inPageSetting = false
    let inPageBlockImage = false
    let inPageBlockComponent = false
    const settingsWithFile = await db.model.Settings.findAll({
      where: { value: `uploads/${filename}` },
    })
    const pagesWithBg = await pages.model.PageBlock.findAll({
      where: { settings: { '"bg"': `uploads/${filename}` } },
    })
    const pageBlockImagesUsingFile = await pages.model.PageBlockContent.findAll(
      {
        where: { filename },
      }
    )
    const pageBlockComponentsUsingFile = await pages.model.PageBlock.findAll({
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
      usedUploads.push(filename)
    }
  }
  return usedUploads
}

// if called directly
if (require.main === module) {
  listUploads().then((uploads) => {
    for (let filename of uploads) {
      console.log(`uploads/${filename}`)
    }
  })
}

module.exports = listUploads
