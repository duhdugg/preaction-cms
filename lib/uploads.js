/**
 * @module uploads
 */

const adminRequired = require('./adminRequired.js')
const bodyParser = require('body-parser')
const express = require('express')
const multer = require('multer')
const path = require('path')
const csrf = require('./csrf.js')
const db = require('./db.js')
const processImg = require('./processImg.js')
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
    if (file.mimetype.match(/^image\//)) {
      cb(null, true)
    } else {
      return cb(new Error('File must be an image!'))
    }
  },
})

// <== EXPESS MODULE SETUP ==>

/**
 * @memberof uploads
 * @type {express}
 * @see {@link https://expressjs.com/en/guide/using-middleware.html}
 */
const middleware = express()
middleware.use(bodyParser.json({ limit: '50mb' }))

// <== EXPRESS MODULE ROUTES ==>

/**
 * @memberof uploads.middleware
 * @name GET-uploads
 * @return {blob} file
 */
middleware.use(
  '/uploads',
  express.static(path.join(__dirname, '..', 'uploads'))
)

/**
 * @memberof uploads.middleware
 * @name POST-api/upload-img
 * @param {express.Request} req
 * @param {blob[]} req.files
 * @param {Object} req.body
 * @param {string} req.body.target
 * @param {express.Response} res
 * @param {func} next
 *
 */
// this is used to upload images for:
//   - site background
//   - site icon
//   - page background
//   - page block content
middleware
  .route('/api/upload-img')
  .post(
    adminRequired,
    csrf.protect,
    uploadImg.any(),
    async (req, res, next) => {
      const filesProcessed = []
      const conditionalRespond = (path) => {
        filesProcessed.push(path)
        if (filesProcessed.length >= req.files.length) {
          db.backup()
          res.status(200).json(filesProcessed)
        }
      }
      if (!req.body.target) {
        res.status(400).json({ error: 'no target' })
      }
      const target = req.body.target.split('/')
      if (target.length !== 2) {
        res.status(400).json({ error: 'invalid target' })
      }

      if (target[0] === 'page-block' && target.length > 1) {
        const pageblockId = target[1]
        const results = await pages.model.PageBlockContent.findAll({
          where: { pageblockId },
          limit: 1,
          order: [['ordering', 'DESC']],
        })
        let ordering = 0
        if (results.length) {
          ordering = results[0].ordering + 1
        }
        let orderIndex = -1
        if (!req.files.length) {
          res.status(400).send('no files')
        }
        for (const file of req.files) {
          let filename = file.filename
          const path = `uploads/${filename}`
          const newPath = await processImg(path)
          const sp = newPath.split('/')
          filename = sp[sp.length - 1]
          try {
            if (target[0] === 'page-block') {
              await pages.model.PageBlock.findByPk(pageblockId)
              orderIndex++
              await pages.model.PageBlockContent.create({
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
              })
              conditionalRespond(newPath)
            } else {
              res.status(400).send('invalid target')
            }
          } catch (error) {
            res.status(400).send('invalid target')
          }
          break
        }
      }
    }
  )

// <== EXPORT ==>

module.exports = {
  middleware,
}
