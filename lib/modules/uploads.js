const bodyParser = require('body-parser')
const express = require('express')
const multer = require('multer')
const path = require('path')
const processImg = require('../processImg.js')
const session = require('../session.js')
const updateBg = require('./settings.js').updateBg
const updateIcon = require('./settings.js').updateIcon
const pages = require('./pages.js')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.indexOf('image/') === 0) {
      cb(null, true)
    } else {
      return cb(new Error('File must be an image!'))
    }
  }
})

const expressModule = express()
expressModule.use(bodyParser.json({ limit: '50mb' }))

expressModule.use(
  '/uploads',
  express.static(path.join(__dirname, '..', '..', 'uploads'))
)

expressModule
  .route('/api/upload')
  .post(session.authenticationRequired, upload.any(), (req, res, next) => {
    let filesProcessed = []
    let conditionalRespond = path => {
      filesProcessed.push(path)
      if (filesProcessed.length >= req.files.length) {
        res.status(200).json(filesProcessed)
      }
    }
    let target = req.body.target.split('/')

    let getOrdering
    let pageblockId
    if (target[0] === 'page-block' && target.length > 1) {
      pageblockId = target[1]
      getOrdering = new Promise((resolve, reject) => {
        pages.model.PageBlockContent.findAll({
          where: { pageblockId },
          limit: 1,
          order: [['ordering', 'DESC']]
        }).then(results => {
          let ordering = 0
          if (results.length) {
            ordering = results[0].ordering + 1
          }
          resolve(ordering)
        })
      })
    }
    let orderIndex = -1
    if (!req.files.length) {
      res.status(400).send('no files')
    }
    req.files.forEach(file => {
      let filename = file.filename
      let path = `uploads/${filename}`
      processImg(path)
        .finally(() => {
          switch (req.body.target) {
            case 'bg':
              updateBg(path).then(() => conditionalRespond(path))
              break
            case 'icon':
              updateIcon(path).then(() => conditionalRespond(path))
              break
            default:
              try {
                if (target[0] === 'page-bg') {
                  let pageId = target[1]
                  pages.model.Page.findByPk(pageId).then(page => {
                    page.settings.bg = path
                    page.settings = JSON.parse(JSON.stringify(page.settings))
                    page.save().then(() => conditionalRespond(path))
                  })
                }
                if (target[0] === 'page-block') {
                  getOrdering.then(ordering => {
                    pages.model.PageBlock.findByPk(pageblockId).then(block => {
                      orderIndex++
                      pages.model.PageBlockContent.create({
                        contentType: 'image',
                        filename,
                        pageblockId,
                        ordering: ordering + orderIndex,
                        settings: {
                          header: '',
                          lgWidth: 12,
                          marginBottom: 0,
                          marginTop: 0,
                          mdWidth: 12,
                          padding: 0,
                          smWidth: 12,
                          xsWidth: 12
                        }
                      }).then(() => conditionalRespond(path))
                    })
                  })
                }
              } catch (error) {
                res.status(400).send('invalid target')
              }
              break
          }
        })
        .catch(e => {})
    })
  })

module.exports = {
  expressModule
}
