/**
 * @module settings
 */

const adminRequired = require('./adminRequired.js')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const express = require('express')
const cache = require('./cache.js')
const csrf = require('./csrf.js')
const db = require('./db.js')
const session = require('./session.js')

// <== MODULE SETUP ==>

/**
 * @memberof settings
 * @type {express}
 * @see {@link https://expressjs.com/en/guide/using-middleware.html}
 */
const middleware = express()
middleware.use(bodyParser.json({ limit: '50mb' }))
middleware.use(cookieParser())
middleware.use(session.session)

// <== DEFAULTS ==>

/**
 * @memberof settings
 * @type {Object}
 * @description defaults ensure that the application will not fail due to missing settings
 * @example
 * {
 *   footerPath: '/home/footer/',
 *   googleAnalyticsTrackingId: '',
 *   headerPath: '/home/header/',
 *   init: true, // used to determine that the frontend has loaded settings from server
 *   isNavParent: false, // not used directly. inherited and overridden by pages
 *   navAlignment: 'left',
 *   navCollapsible: true,
 *   navPosition: 'fixed-top',
 *   navSpacing: 'normal',
 *   navType: 'basic',
 *   showFooter: true,
 *   showHeader: true,
 *   siteTitle: 'Preaction CMS',
 *   useGoogleAnalytics: false,
 * }
 */
const defaultSettings = {
  footerPath: '/home/footer/',
  googleAnalyticsTrackingId: '',
  headerPath: '/home/header/',
  init: true, // used to determine that the frontend has loaded settings from server
  isNavParent: false, // not used directly. inherited and overridden by pages
  navAlignment: 'left',
  navCollapsible: true,
  navPosition: 'fixed-top',
  navSpacing: 'normal',
  navType: 'basic',
  showFooter: true,
  showHeader: true,
  siteTitle: 'Preaction CMS',
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
  await updateSetting('footerPath')
  await updateSetting('googleAnalyticsTrackingId')
  await updateSetting('headerPath')
  await updateSetting('navAlignment')
  await updateSetting('navCollapsible')
  await updateSetting('navPosition')
  await updateSetting('navSpacing')
  await updateSetting('navType')
  await updateSetting('showFooter')
  await updateSetting('showHeader')
  await updateSetting('siteTitle')
  await updateSetting('useGoogleAnalytics')
  return
}

/**
 * @memberof settings
 * @function
 * @returns {Promise} `Object` (see `settings.defaultSettings`)
 */
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

/**
 * @memberof settings
 * @function
 * @description ensures default settings are created
 * @returns {Promise} `undefined`
 */
const sync = async () => {
  await db.sync()
  await createDefaultSettings()
  return
}

// <== EXPRESS MODULE ROUTES ==>

middleware
  .route('/api/settings')
  /**
   * @memberof settings.middleware
   * @name GET-api/settings
   * @function
   * @returns {Object} (see `settings.defaultSettings`)
   */
  .get(cache.middleware, async (req, res) => {
    const settings = await getSettings()
    res.json(settings)
    cache.set(req.url, settings, 'application/json')
  })
  /**
   * @memberof settings.middleware
   * @name POST-api/settings
   * @function
   * @param {express.Request} req
   * @param {Object} req.body (see `settings.defaultSettings`)
   * @returns {boolean} `true`
   */
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
    await updateSetting('footerPath')
    await updateSetting('googleAnalyticsTrackingId')
    await updateSetting('headerPath')
    await updateSetting('navAlignment')
    await updateSetting('navCollapsible')
    await updateSetting('navPosition')
    await updateSetting('navSpacing')
    await updateSetting('navType')
    await updateSetting('showFooter')
    await updateSetting('showHeader')
    await updateSetting('siteTitle')
    await updateSetting('useGoogleAnalytics')
    db.backup()
    res.json(true)
    cache.clear()
  })

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
  updateIcon,
}
