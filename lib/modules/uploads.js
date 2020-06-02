const adminRequired = require('../adminRequired.js')
const bodyParser = require('body-parser')
const express = require('express')
const multer = require('multer')
const path = require('path')
const db = require('../db.js')
const env = require('../env.js')
const processImg = require('../processImg.js')
const renameUpload = require('../renameUpload.js')
const updateBg = require('./settings.js').updateBg
const updateIcon = require('./settings.js').updateIcon
const pages = require('./pages.js')

// <== MULTER CONFIGS ==>

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
})

// different multer instances for different filetypes

const uploadImg = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.indexOf('image/') === 0) {
      cb(null, true)
    } else {
      return cb(new Error('File must be an image!'))
    }
  },
})

const uploadJs = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.match(/\/javascript$/)) {
      cb(null, true)
    } else {
      return cb(new Error('File must be javascript!'))
    }
  },
})

// <== EXPESS MODULE SETUP ==>

const expressModule = express()
expressModule.use(bodyParser.json({ limit: '50mb' }))

// <== EXPRESS MODULE ROUTES ==>

expressModule.use(
  '/uploads',
  express.static(path.join(__dirname, '..', '..', 'uploads'))
)

// this is used to upload images for:
//   - site background
//   - site icon
//   - page background
//   - page block content
expressModule
  .route('/api/upload-img')
  .post(adminRequired, uploadImg.any(), (req, res, next) => {
    let filesProcessed = []
    let conditionalRespond = (path) => {
      filesProcessed.push(path)
      if (filesProcessed.length >= req.files.length) {
        db.backup()
        res.status(200).json(filesProcessed)
      }
    }
    if (!req.body.target) {
      res.status(400).json({ error: 'no target' })
    }
    let target = req.body.target.split('/')
    if (target.length !== 2) {
      res.status(400).json({ error: 'invalid target' })
    }

    let getOrdering
    let pageblockId
    if (target[0] === 'page-block' && target.length > 1) {
      pageblockId = target[1]
      getOrdering = new Promise((resolve, reject) => {
        pages.model.PageBlockContent.findAll({
          where: { pageblockId },
          limit: 1,
          order: [['ordering', 'DESC']],
        }).then((results) => {
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
    req.files.forEach((file) => {
      let filename = file.filename
      let path = `uploads/${filename}`
      processImg(path)
        .then((newPath) => {
          let sp = newPath.split('/')
          let filename = sp[sp.length - 1]
          switch (req.body.target) {
            case 'bg':
              updateBg(newPath).then(() => conditionalRespond(newPath))
              break
            case 'icon':
              updateIcon(newPath).then(() => conditionalRespond(newPath))
              break
            default:
              try {
                if (target[0] === 'page-bg') {
                  let pageId = target[1]
                  pages.model.Page.findByPk(pageId).then((page) => {
                    page.settings.bg = newPath
                    page.settings = JSON.parse(JSON.stringify(page.settings))
                    page.save().then(() => conditionalRespond(newPath))
                  })
                } else if (target[0] === 'page-block') {
                  getOrdering.then((ordering) => {
                    pages.model.PageBlock.findByPk(pageblockId).then(
                      (block) => {
                        orderIndex++
                        pages.model.PageBlockContent.create({
                          contentType: 'image',
                          filename,
                          pageblockId,
                          ordering: ordering + orderIndex,
                          settings: {
                            altText: '',
                            header: '',
                            headerLevel: 0,
                            linkUrl: '',
                            lgWidth: 12,
                            mdWidth: 12,
                            smWidth: 12,
                            xsWidth: 12,
                          },
                        }).then(() => conditionalRespond(newPath))
                      }
                    )
                  })
                } else {
                  res.status(400).send('invalid target')
                }
              } catch (error) {
                res.status(400).send('invalid target')
              }
              break
          }
        })
        .catch((e) => {})
    })
  })

// this is used to upload a js file and set its url as a component src
expressModule
  .route('/api/upload-js')
  .post(adminRequired, uploadJs.single('component'), (req, res, next) => {
    let filename = req.file.filename
    let path = `uploads/${filename}`
    renameUpload(path).then((newPath) => {
      let sp = newPath.split('/')
      let filename = sp[sp.length - 1]
      try {
        let target = req.body.target.split('/')
        if (target[0] === 'page-block') {
          pages.model.PageBlock.findByPk(target[1]).then((block) => {
            let settings = block.settings
            settings.src = `${env.root}/uploads/${filename}`
            block.settings = settings
            block.save().then(() => {
              res.json(filename)
            })
          })
        } else {
          console.debug(target)
          res.status(400).send('invalid target')
        }
      } catch (e) {
        res.status(400).send('invalid target')
      }
    })
  })

// <== EXPORT ==>

module.exports = {
  expressModule,
}
