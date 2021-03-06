/**
 * @module lib/uploads
 */

const adminRequired = require('./adminRequired.js')
const bodyParser = require('body-parser')
const express = require('express')
const multer = require('multer')
const path = require('path')
const cache = require('./cache.js')
const csrf = require('./csrf.js')
const db = require('./db.js')
const env = require('./env.js')
const processImg = require('./processImg.js')
const pages = require('./pages.js')

// <== MULTER CONFIGS ==>

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    const splitName = file.originalname.split('.')
    const extension = splitName[splitName.length - 1]
    const timestamp = new Date().toISOString()
    const rando = Math.random()
    const filename = `${timestamp}-${rando}.${extension}`
    cb(null, filename)
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
 * @memberof lib/uploads
 * @type {express}
 * @see {@link https://expressjs.com/en/guide/using-middleware.html}
 */
const middleware = express()
middleware.use(bodyParser.json({ limit: '50mb' }))

// <== EXPRESS MODULE ROUTES ==>

/**
 * @memberof lib/uploads.middleware
 * @name GET-uploads
 * @return {blob} file
 */
middleware.use(
  '/uploads',
  express.static(path.join(__dirname, '..', 'uploads'))
)

/**
 * @memberof lib/uploads.middleware
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
          cache.clear()
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
          try {
            if (target[0] === 'page-block') {
              const block = await pages.model.PageBlock.findByPk(pageblockId)
              orderIndex++
              const settings = { src: `${env.root}/${newPath}` }
              if (block.blockType === 'content') {
                Object.assign(settings, {
                  altText: '',
                  header: '',
                  headerLevel: 0,
                  linkUrl: '',
                  xxlWidth: 2,
                  lgWidth: 3,
                  mdWidth: 4,
                  smWidth: 6,
                  xsWidth: 12,
                })
              }
              await pages.model.PageBlockContent.create({
                contentType: 'image',
                pageblockId,
                ordering: ordering + orderIndex,
                settings: settings,
              })
              conditionalRespond(newPath)
            } else {
              res.status(400).send('invalid target')
              break
            }
          } catch (error) {
            res.status(400).send('invalid target')
            break
          }
        }
      }
    }
  )

// <== EXPORT ==>

module.exports = {
  middleware,
}
