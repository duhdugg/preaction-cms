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
  let status = req.session.authenticated ? 200 : 401
  db.model.Settings.findOne({ where: { key: 'siteTitle' } }).then(setting => {
    renderClient(req, res.status(status), {
      title: `Site Settings | ${setting.value}`
    })
  })
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
        navAlignment: 'left',
        navCollapsible: true,
        navPosition: 'fixed-top',
        navSpacing: 'normal',
        navTheme: 'dark',
        navType: 'basic',
        useBgImage: false
      }
      settings.forEach(setting => {
        retval[setting.key] = setting.value
      })
      res.json(retval)
    })
  })
  .post(session.authenticationRequired, (req, res) => {
    let settings = {
      bgColor: req.body.bgColor || '#ffffff',
      fontColor: req.body.fontColor || '#000000',
      hostname: req.body.hostname || '',
      linkColor: req.body.linkColor || '#0000ff',
      containerColor: req.body.containerColor || '#ffffff',
      containerOpacity: req.body.containerOpacity || 0,
      siteTitle: req.body.siteTitle || '',
      navAlignment: req.body.navAlignment || 'left',
      navCollapsible: req.body.navCollapsible || false,
      navPosition: req.body.navPosition || 'fixed-top',
      navSpacing: req.body.navSpacing || 'normal',
      navTheme: req.body.navTheme || 'dark',
      navType: req.body.navType || 'basic',
      useBgImage: req.body.useBgImage || false
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
      updateSetting('hostname'),
      updateSetting('linkColor'),
      updateSetting('containerColor'),
      updateSetting('containerOpacity'),
      updateSetting('siteTitle'),
      updateSetting('navAlignment'),
      updateSetting('navCollapsible'),
      updateSetting('navPosition'),
      updateSetting('navSpacing'),
      updateSetting('navTheme'),
      updateSetting('navType'),
      updateSetting('useBgImage')
    ]).then(() => {
      res.json(true)
    })
  })

function updateBg(path) {
  return new Promise((resolve, reject) => {
    db.model.Settings.findOrCreate({
      where: { key: 'bg' },
      defaults: { value: path }
    }).spread((setting, created) => {
      setting.value = path
      setting.save().then(resolve)
    })
  })
}

function updateIcon(path) {
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

module.exports = { expressModule, updateBg, updateIcon }
