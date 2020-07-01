const adminRequired = require('./adminRequired.js')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const express = require('express')
const cache = require('./cache.js')
const csrf = require('./csrf.js')
const db = require('./db.js')
const session = require('./session.js')

// <== MODULE SETUP ==>

const middleware = express()
middleware.use(bodyParser.json({ limit: '50mb' }))
middleware.use(cookieParser())
middleware.use(session.session)

// <== DEFAULTS ==>

// defaults ensure that the application will not fail due to missing settings
const defaultSettings = {
  bgColor: '#ffffff',
  borderColor: '#000000',
  borderOpacity: 1,
  containerColor: '#ffffff',
  containerHeaderTheme: 'dark',
  containerOpacity: 1,
  cssOverrides: '',
  fontColor: '#000000',
  footerPath: '/home/footer/',
  googleAnalyticsTrackingId: '',
  headerPath: '/home/header/',
  init: true,
  isNavParent: false,
  linkColor: '#0000ff',
  navAlignment: 'left',
  navClassName: '',
  navCollapsible: true,
  navPosition: 'fixed-top',
  navSpacing: 'normal',
  navTheme: 'dark',
  navType: 'basic',
  showFooter: true,
  showHeader: true,
  siteTitle: 'Preaction CMS',
  tileBgImage: false,
  useBgImage: false,
  useGoogleAnalytics: false,
}

// <== FUNCTIONS ==>

// TODO: rewrite using async/await
const createDefaultSettings = () =>
  new Promise((resolve, reject) => {
    db.sync()
      .then(() => {
        let settings = {}
        Object.assign(settings, defaultSettings)
        let updateSetting = (key) => {
          return new Promise((resolve, reject) => {
            db.model.Settings.findOrCreate({
              where: { key },
              defaults: { value: settings[key] },
            }).then((setting, created) => {
              resolve(setting)
            })
          })
        }
        updateSetting('bg')
          .then(() => updateSetting('bgColor'))
          .then(() => updateSetting('borderColor'))
          .then(() => updateSetting('borderOpacity'))
          .then(() => updateSetting('containerColor'))
          .then(() => updateSetting('containerHeaderTheme'))
          .then(() => updateSetting('containerOpacity'))
          .then(() => updateSetting('cssOverrides'))
          .then(() => updateSetting('fontColor'))
          .then(() => updateSetting('footerPath'))
          .then(() => updateSetting('googleAnalyticsTrackingId'))
          .then(() => updateSetting('headerPath'))
          .then(() => updateSetting('hostname'))
          .then(() => updateSetting('linkColor'))
          .then(() => updateSetting('maxWidthLayout'))
          .then(() => updateSetting('navAlignment'))
          .then(() => updateSetting('navClassName'))
          .then(() => updateSetting('navCollapsible'))
          .then(() => updateSetting('navPosition'))
          .then(() => updateSetting('navSpacing'))
          .then(() => updateSetting('navTheme'))
          .then(() => updateSetting('navType'))
          .then(() => updateSetting('showFooter'))
          .then(() => updateSetting('showHeader'))
          .then(() => updateSetting('siteTitle'))
          .then(() => updateSetting('tileBgImage'))
          .then(() => updateSetting('useBgImage'))
          .then(() => updateSetting('useGoogleAnalytics'))
          .then(() => resolve(true))
      })
      .catch(reject)
  })

const sync = () =>
  new Promise((resolve, reject) => {
    db.sync().then(createDefaultSettings).then(resolve, reject)
  })

// <== EXPRESS MODULE ROUTES ==>

middleware
  .route('/api/settings')
  .get(cache.middleware, (req, res) => {
    db.model.Settings.findAll().then((settings) => {
      let retval = {}
      Object.assign(retval, defaultSettings)
      settings.forEach((setting) => {
        retval[setting.key] = setting.value
      })
      res.json(retval)
      cache.set(req.url, retval, 'application/json')
    })
  })
  .post(adminRequired, csrf.protect, (req, res) => {
    let settings = {}
    Object.assign(settings, defaultSettings)
    Object.assign(settings, req.body)
    const updateSetting = (key) => {
      return new Promise((resolve, reject) => {
        db.model.Settings.findOrCreate({
          where: { key },
          defaults: { value: settings[key] },
        }).then((setting, created) => {
          setting.value = settings[key]
          setting.save().then(resolve)
        })
      })
    }
    updateSetting('bg')
      .then(() => updateSetting('bgColor'))
      .then(() => updateSetting('borderColor'))
      .then(() => updateSetting('borderOpacity'))
      .then(() => updateSetting('containerColor'))
      .then(() => updateSetting('containerHeaderTheme'))
      .then(() => updateSetting('containerOpacity'))
      .then(() => updateSetting('cssOverrides'))
      .then(() => updateSetting('fontColor'))
      .then(() => updateSetting('footerPath'))
      .then(() => updateSetting('googleAnalyticsTrackingId'))
      .then(() => updateSetting('headerPath'))
      .then(() => updateSetting('hostname'))
      .then(() => updateSetting('linkColor'))
      .then(() => updateSetting('maxWidthLayout'))
      .then(() => updateSetting('navAlignment'))
      .then(() => updateSetting('navClassName'))
      .then(() => updateSetting('navCollapsible'))
      .then(() => updateSetting('navPosition'))
      .then(() => updateSetting('navSpacing'))
      .then(() => updateSetting('navTheme'))
      .then(() => updateSetting('navType'))
      .then(() => updateSetting('showFooter'))
      .then(() => updateSetting('showHeader'))
      .then(() => updateSetting('siteTitle'))
      .then(() => updateSetting('tileBgImage'))
      .then(() => updateSetting('useBgImage'))
      .then(() => updateSetting('useGoogleAnalytics'))
      .then(() => {
        db.backup()
        res.json(true)
        cache.clear()
      })
  })

const updateBg = (path) => {
  return new Promise((resolve, reject) => {
    db.model.Settings.findOrCreate({
      where: { key: 'bg' },
      defaults: { value: path },
    }).then((setting, created) => {
      setting.value = path
      setting.save().then(resolve)
    })
  })
}

const updateIcon = (path) => {
  return new Promise((resolve, reject) => {
    db.model.Settings.findOrCreate({
      where: { key: 'icon' },
      defaults: { value: path },
    }).then((setting, created) => {
      setting.value = path
      setting.save().then(resolve)
    })
  })
}

module.exports = { defaultSettings, middleware, sync, updateBg, updateIcon }
