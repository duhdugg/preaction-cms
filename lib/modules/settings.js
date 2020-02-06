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

const defaultSettings = {
  bgColor: '#ffffff',
  borderColor: '#000000',
  borderOpacity: 1,
  containerColor: '#000000',
  containerOpacity: 0.15,
  cssOverrides: '',
  fontColor: '#000000',
  googleAnalyticsTrackingId: '',
  hostname: '',
  init: true,
  linkColor: '#0000ff',
  navAlignment: 'left',
  navCollapsible: true,
  navPosition: 'fixed-top',
  navSpacing: 'normal',
  navTheme: 'dark',
  navType: 'basic',
  siteTitle: 'Preaction CMS',
  tileBgImage: false,
  useBgImage: false,
  useGoogleAnalytics: false
}

expressModule.route('/settings').get((req, res) => {
  let status = req.session.authenticated ? 200 : 401
  db.model.Settings.findOne({ where: { key: 'siteTitle' } }).then(setting => {
    if (!setting) {
      setting = { value: defaultSettings.siteTitle }
    }
    renderClient(req, res.status(status), {
      title: `Site Settings | ${setting.value}`
    })
  })
})

expressModule
  .route('/api/settings')
  .get((req, res) => {
    db.model.Settings.findAll().then(settings => {
      let retval = {}
      Object.assign(retval, defaultSettings)
      settings.forEach(setting => {
        retval[setting.key] = setting.value
      })
      res.json(retval)
    })
  })
  .post(session.authenticationRequired, (req, res) => {
    let settings = {}
    Object.assign(settings, defaultSettings)
    Object.assign(settings, req.body)
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
    updateSetting('bgColor')
      .then(() => updateSetting('borderColor'))
      .then(() => updateSetting('containerColor'))
      .then(() => updateSetting('containerOpacity'))
      .then(() => updateSetting('cssOverrides'))
      .then(() => updateSetting('fontColor'))
      .then(() => updateSetting('googleAnalyticsTrackingId'))
      .then(() => updateSetting('hostname'))
      .then(() => updateSetting('linkColor'))
      .then(() => updateSetting('linkColor'))
      .then(() => updateSetting('navAlignment'))
      .then(() => updateSetting('navCollapsible'))
      .then(() => updateSetting('navPosition'))
      .then(() => updateSetting('navSpacing'))
      .then(() => updateSetting('navTheme'))
      .then(() => updateSetting('navType'))
      .then(() => updateSetting('siteTitle'))
      .then(() => updateSetting('tileBgImage'))
      .then(() => updateSetting('useBgImage'))
      .then(() => updateSetting('useGoogleAnalytics'))
      .then(() => res.json(true))
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
