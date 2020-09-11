const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')

const pages = require('../lib/pages.js')

const ignore = ['.gitignore']

const listUploads = async () => {
  const uploads = fs.readdirSync(path.join(__dirname, '../uploads'))
  const usedUploads = []
  for (let filename of uploads) {
    if (ignore.includes(filename)) {
      continue
    }
    let inPageBlockImage = false
    const pageBlockImagesUsingFile = await pages.model.PageBlockContent.findAll(
      {
        where: {
          contentType: 'image',
          settings: {
            src: { [Sequelize.Op.like]: `%/uploads/${filename}` },
          },
        },
      }
    )
    inPageBlockImage = pageBlockImagesUsingFile.length > 0
    if (inPageBlockImage) {
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
