const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const express = require('express')
const db = require('../db.js')
const renderClient = require('../render.js').renderClient
const session = require('../session.js')

const expressModule = express()
expressModule.use(bodyParser.json({ limit: '50mb' }))
expressModule.use(cookieParser())
expressModule.use(session.session)

expressModule.route('/settings').get((req, res) => {
  renderClient(req, res.status(200))
})

expressModule
  .route('/api/settings')
  .get((req, res) => {
    db.model.Settings.findAll().then(settings => {
      let retval = {
        bgColor: '#000000',
        fontColor: '#ffffff',
        linkColor: '#0000ff',
        containerColor: '#ffffff',
        containerOpacity: 0,
        siteTitle: '',
        siteDescription: '',
        navTheme: 'light'
      }
      for (let setting of settings) {
        retval[setting.key] = setting.value
      }
      res.json(retval)
    })
  })
  .post(session.authenticationRequired, (req, res) => {
    let settings = {
      bgColor: req.body.bgColor || '#ffffff',
      fontColor: req.body.fontColor || '#000000',
      linkColor: req.body.linkColor || '#0000ff',
      containerColor: req.body.containerColor || '#ffffff',
      containerOpacity: req.body.containerOpacity || 0,
      siteTitle: req.body.siteTitle || '',
      siteDescription: req.body.siteDescription || '',
      navTheme: req.body.navTheme || 'light'
    }
    let updateSetting = key => {
      return new Promise((resolve, reject) => {
        db.model.Settings.findOrCreate({
          where: { key },
          defaults: { value: settings[key] }
        }).spread((setting, created) => {
          setting.value = settings[key]
          setting.save().then(resolve)
        })
      })
    }
    Promise.all([
      updateSetting('bgColor'),
      updateSetting('fontColor'),
      updateSetting('linkColor'),
      updateSetting('containerColor'),
      updateSetting('containerOpacity'),
      updateSetting('siteTitle'),
      updateSetting('siteDescription'),
      updateSetting('navTheme')
    ]).then(() => {
      res.json(true)
    })
  })

function updateIcon (path) {
  return new Promise((resolve, reject) => {
    db.model.Settings.findOrCreate({
      where: { key: 'icon' },
      defaults: { value: path }
    }).spread((setting, created) => {
      setting.value = path
      setting.save().then(resolve)
    })
  })
}

module.exports = { expressModule, updateIcon }
