const bodyParser = require('body-parser')
const express = require('express')
const multer = require('multer')
const path = require('path')
const processImg = require('../processImg.js')
const session = require('../session.js')
const updateIcon = require('./settings.js').updateIcon

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
    for (let file of req.files) {
      processImg(`uploads/${file.filename}`)
        .finally(() => {
          switch (req.body.target) {
            case 'icon':
              updateIcon(`uploads/${file.filename}`).then(conditionalRespond)
              break
            default:
              conditionalRespond()
              break
          }
        })
        .catch(e => {})
    }
  })

module.exports = {
  expressModule
}
