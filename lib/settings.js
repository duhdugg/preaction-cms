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
  fontColor: '#000000',
  footerPath: '/home/footer/',
  googleAnalyticsTrackingId: '',
  headerPath: '/home/header/',
  init: true,
  isNavParent: false,
  linkColor: '#0000ff',
  navAlignment: 'left',
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

const createDefaultSettings = async () => {
  await db.sync()
  const settings = {}
  Object.assign(settings, defaultSettings)
  const updateSetting = async (key) => {
    await db.model.Settings.findOrCreate({
      where: { key },
      defaults: { value: settings[key] },
    })
  }
  await updateSetting('bg')
  await updateSetting('bgColor')
  await updateSetting('borderColor')
  await updateSetting('borderOpacity')
  await updateSetting('containerColor')
  await updateSetting('containerHeaderTheme')
  await updateSetting('containerOpacity')
  await updateSetting('fontColor')
  await updateSetting('footerPath')
  await updateSetting('googleAnalyticsTrackingId')
  await updateSetting('headerPath')
  await updateSetting('hostname')
  await updateSetting('linkColor')
  await updateSetting('maxWidthLayout')
  await updateSetting('navAlignment')
  await updateSetting('navCollapsible')
  await updateSetting('navPosition')
  await updateSetting('navSpacing')
  await updateSetting('navTheme')
  await updateSetting('navType')
  await updateSetting('showFooter')
  await updateSetting('showHeader')
  await updateSetting('siteTitle')
  await updateSetting('tileBgImage')
  await updateSetting('useBgImage')
  await updateSetting('useGoogleAnalytics')
  return
}

const getSettings = async () => {
  const s = {}
  const settings = await db.model.Settings.findAll()
  Object.assign(s, defaultSettings)
  for (const setting of settings) {
    s[setting.key] = setting.value
  }
  s.init = true
  return s
}

const sync = async () => {
  await db.sync()
  await createDefaultSettings()
  return
}

// <== EXPRESS MODULE ROUTES ==>

middleware
  .route('/api/settings')
  .get(cache.middleware, async (req, res) => {
    const settings = await getSettings()
    res.json(settings)
    cache.set(req.url, settings, 'application/json')
  })
  .post(adminRequired, csrf.protect, async (req, res) => {
    const settings = {}
    Object.assign(settings, defaultSettings)
    Object.assign(settings, req.body)
    const updateSetting = async (key) => {
      const [setting] = await db.model.Settings.findOrCreate({
        where: { key },
        defaults: { value: settings[key] },
      })
      setting.value = settings[key]
      return await setting.save()
    }
    await updateSetting('bg')
    await updateSetting('bgColor')
    await updateSetting('borderColor')
    await updateSetting('borderOpacity')
    await updateSetting('containerColor')
    await updateSetting('containerHeaderTheme')
    await updateSetting('containerOpacity')
    await updateSetting('fontColor')
    await updateSetting('footerPath')
    await updateSetting('googleAnalyticsTrackingId')
    await updateSetting('headerPath')
    await updateSetting('hostname')
    await updateSetting('linkColor')
    await updateSetting('maxWidthLayout')
    await updateSetting('navAlignment')
    await updateSetting('navCollapsible')
    await updateSetting('navPosition')
    await updateSetting('navSpacing')
    await updateSetting('navTheme')
    await updateSetting('navType')
    await updateSetting('showFooter')
    await updateSetting('showHeader')
    await updateSetting('siteTitle')
    await updateSetting('tileBgImage')
    await updateSetting('useBgImage')
    await updateSetting('useGoogleAnalytics')
    db.backup()
    res.json(true)
    cache.clear()
  })

const updateBg = async (path) => {
  const [setting] = db.model.Settings.findOrCreate({
    where: { key: 'bg' },
    defaults: { value: path },
  })
  setting.value = path
  return await setting.save()
}

const updateIcon = async (path) => {
  const [setting] = db.model.Settings.findOrCreate({
    where: { key: 'icon' },
    defaults: { value: path },
  })
  setting.value = path
  return await setting.save()
}

module.exports = {
  defaultSettings,
  getSettings,
  middleware,
  sync,
  updateBg,
  updateIcon,
}
