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
        borderColor: '#000000',
        borderOpacity: 0,
        containerColor: '#ffffff',
        containerOpacity: 0,
        cssOverrides: '',
        fontColor: '#ffffff',
        googleAnalyticsTrackingId: '',
        linkColor: '#0000ff',
        navAlignment: 'left',
        navCollapsible: true,
        navPosition: 'fixed-top',
        navSpacing: 'normal',
        navTheme: 'dark',
        navType: 'basic',
        siteTitle: '',
        tileBgImage: false,
        useBgImage: false,
        useGoogleAnalytics: false
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
      borderColor: req.body.borderColor || '#000000',
      borderOpacity: req.body.borderOpacity || 0,
      containerColor: req.body.containerColor || '#ffffff',
      containerOpacity: req.body.containerOpacity || 0,
      cssOverrides: req.body.cssOverrides || '',
      fontColor: req.body.fontColor || '#000000',
      googleAnalyticsTrackingId: req.body.googleAnalyticsTrackingId || '',
      hostname: req.body.hostname || '',
      linkColor: req.body.linkColor || '#0000ff',
      navAlignment: req.body.navAlignment || 'left',
      navCollapsible: req.body.navCollapsible || false,
      navPosition: req.body.navPosition || 'fixed-top',
      navSpacing: req.body.navSpacing || 'normal',
      navTheme: req.body.navTheme || 'dark',
      navType: req.body.navType || 'basic',
      siteTitle: req.body.siteTitle || '',
      tileBgImage: req.body.tileBgImage || false,
      useBgImage: req.body.useBgImage || false,
      useGoogleAnalytics: req.body.useGoogleAnalytics || false
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
      updateSetting('borderColor'),
      updateSetting('borderOpacity'),
      updateSetting('containerColor'),
      updateSetting('containerOpacity'),
      updateSetting('cssOverrides'),
      updateSetting('fontColor'),
      updateSetting('googleAnalyticsTrackingId'),
      updateSetting('hostname'),
      updateSetting('linkColor'),
      updateSetting('navAlignment'),
      updateSetting('navCollapsible'),
      updateSetting('navPosition'),
      updateSetting('navSpacing'),
      updateSetting('navTheme'),
      updateSetting('navType'),
      updateSetting('siteTitle'),
      updateSetting('tileBgImage'),
      updateSetting('useBgImage'),
      updateSetting('useGoogleAnalytics')
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
