const bodyParser = require('body-parser')
const express = require('express')
const multer = require('multer')
const path = require('path')
const processImg = require('../processImg.js')
const session = require('../session.js')
const updateIcon = require('./settings.js').updateIcon
const PageBlock = require('./pages.js').model.PageBlock
const PageBlockImage = require('./pages.js').model.PageBlockImage

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
  fileFilter: (req, file, cb) => {
    // FIXME: allow images only
    cb(null, true)
  }
})
const upload = multer({ storage })

const expressModule = express()
expressModule.use(bodyParser.json({ limit: '50mb' }))

expressModule.use(
  '/uploads',
  express.static(path.join(__dirname, '..', '..', 'uploads'))
)

expressModule
  .route('/api/upload')
  .post(session.authenticationRequired, upload.any(), (req, res, next) => {
    let filesProcessed = 0
    let conditionalRespond = () => {
      filesProcessed++
      if (filesProcessed >= req.files.length) {
        res.status(200).send('')
      }
    }
    let target = req.body.target.split('/')
    let pageblockId
    let getOrdering
    if (target[0] === 'page-block' && target.length > 1) {
      pageblockId = target[1]
      getOrdering = new Promise((resolve, reject) => {
        PageBlockImage.findAll({
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
    for (let file of req.files) {
      let filename = file.filename
      processImg(`uploads/${filename}`)
        .finally(() => {
          switch (req.body.target) {
            case 'icon':
              updateIcon(`uploads/${filename}`).then(conditionalRespond)
              break
            default:
              try {
                if (target[0] === 'page-block') {
                  getOrdering.then(ordering => {
                    PageBlock.findByPk(pageblockId).then(block => {
                      orderIndex++
                      PageBlockImage.create({
                        filename,
                        pageblockId,
                        ordering: ordering + orderIndex
                      }).then(conditionalRespond)
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
    }
  })

module.exports = {
  expressModule
}
