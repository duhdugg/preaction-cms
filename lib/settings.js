/**
 * @module lib/settings
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
 * @memberof lib/settings
 * @type {express}
 * @see {@link https://expressjs.com/en/guide/using-middleware.html}
 */
const middleware = express()
middleware.use(bodyParser.json({ limit: '50mb' }))
middleware.use(cookieParser())
middleware.use(session.session)

// <== DEFAULTS ==>

/**
 * @memberof lib/settings
 * @type {Object}
 * @description defaults ensure that the application will not fail due to missing settings
 * @example
 * {
 *   bodyTheme: '',
 *   bodyGradient: false,
 *   footerPath: '/home/footer/',
 *   headerPath: '/home/header/',
 *   heroPath: '/home/hero/',
 *   init: true, // used to determine that the frontend has loaded settings from server
 *   isNavParent: false, // not used directly. inherited and overridden by pages
 *   headerTheme: '',
 *   headerGradient: false,
 *   heroTheme: '',
 *   heroGradient: false,
 *   mainTheme: '',
 *   mainGradient: false,
 *   footerTheme: '',
 *   footerGradient: false,
 *   maxWidthFooterContainer: false,
 *   maxWidthHeaderContainer: false,
 *   maxWidthHeroContainer: false,
 *   maxWidthMainContainer: false,
 *   maxWidthNav: false,
 *   metaDescription: '',
 *   navbarTheme: 'dark',
 *   navActiveSubmenuTheme: 'primary',
 *   navActiveTabTheme: 'white',
 *   navAlignment: 'left',
 *   navCollapsible: true,
 *   navPosition: 'fixed-top',
 *   navSpacing: 'normal',
 *   navType: 'basic',
 *   absoluteNavBehavior: 'same-window',
 *   showFooter: true,
 *   showHeader: true,
 *   showHero: true,
 *   heroPosition: 'above-header',
 *   siteTitle: 'Preaction CMS',
 * }
 */
const defaultSettings = {
  bodyTheme: '',
  bodyGradient: false,
  footerPath: '/home/footer/',
  headerPath: '/home/header/',
  heroPath: '/home/hero/',
  init: true, // used to determine that the frontend has loaded settings from server
  isNavParent: false, // not used directly. inherited and overridden by pages
  headerTheme: '',
  headerGradient: false,
  heroTheme: '',
  heroGradient: false,
  mainTheme: '',
  mainGradient: false,
  footerTheme: '',
  footerGradient: false,
  maxWidthFooterContainer: false,
  maxWidthHeaderContainer: false,
  maxWidthHeroContainer: false,
  maxWidthMainContainer: false,
  maxWidthNav: false,
  metaDescription: '',
  navActiveSubmenuTheme: 'primary',
  navActiveTabTheme: 'white',
  navbarTheme: 'dark',
  navAlignment: 'left',
  navCollapsible: true,
  navPosition: 'fixed-top',
  navSpacing: 'normal',
  navType: 'basic',
  absoluteNavBehavior: 'same-window',
  showFooter: true,
  showHeader: true,
  showHero: false,
  heroPosition: 'above-header',
  siteTitle: 'Preaction CMS',
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
  await updateSetting('bodyTheme')
  await updateSetting('bodyGradient')
  await updateSetting('footerPath')
  await updateSetting('headerPath')
  await updateSetting('heroPath')
  await updateSetting('heroTheme')
  await updateSetting('heroGradient')
  await updateSetting('headerTheme')
  await updateSetting('headerGradient')
  await updateSetting('mainTheme')
  await updateSetting('mainGradient')
  await updateSetting('footerTheme')
  await updateSetting('footerGradient')
  await updateSetting('maxWidthFooterContainer')
  await updateSetting('maxWidthHeaderContainer')
  await updateSetting('maxWidthHeroContainer')
  await updateSetting('maxWidthMainContainer')
  await updateSetting('maxWidthNav')
  await updateSetting('metaDescription')
  await updateSetting('navbarTheme')
  await updateSetting('navActiveSubmenuTheme')
  await updateSetting('navActiveTabTheme')
  await updateSetting('navAlignment')
  await updateSetting('navCollapsible')
  await updateSetting('navPosition')
  await updateSetting('navSpacing')
  await updateSetting('navType')
  await updateSetting('absoluteNavBehavior')
  await updateSetting('showFooter')
  await updateSetting('showHeader')
  await updateSetting('showHero')
  await updateSetting('heroPosition')
  await updateSetting('siteTitle')
  return
}

/**
 * @memberof lib/settings
 * @function
 * @returns {Promise} `Object` (see `lib/settings.defaultSettings`)
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
 * @memberof lib/settings
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
   * @memberof lib/settings.middleware
   * @name GET-api/settings
   * @function
   * @returns {Object} (see `lib/settings.defaultSettings`)
   */
  .get(cache.middleware, async (req, res) => {
    const settings = await getSettings()
    res.json(settings)
    cache.set(req.path, settings, 'application/json')
  })
  /**
   * @memberof lib/settings.middleware
   * @name POST-api/settings
   * @function
   * @param {express.Request} req
   * @param {Object} req.body (see `lib/settings.defaultSettings`)
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
    await updateSetting('bodyTheme')
    await updateSetting('bodyGradient')
    await updateSetting('footerPath')
    await updateSetting('headerPath')
    await updateSetting('heroPath')
    await updateSetting('heroTheme')
    await updateSetting('heroGradient')
    await updateSetting('headerTheme')
    await updateSetting('headerGradient')
    await updateSetting('mainTheme')
    await updateSetting('mainGradient')
    await updateSetting('footerTheme')
    await updateSetting('footerGradient')
    await updateSetting('maxWidthFooterContainer')
    await updateSetting('maxWidthHeaderContainer')
    await updateSetting('maxWidthHeroContainer')
    await updateSetting('maxWidthMainContainer')
    await updateSetting('maxWidthNav')
    await updateSetting('metaDescription')
    await updateSetting('navbarTheme')
    await updateSetting('navActiveSubmenuTheme')
    await updateSetting('navActiveTabTheme')
    await updateSetting('navAlignment')
    await updateSetting('navCollapsible')
    await updateSetting('navPosition')
    await updateSetting('navSpacing')
    await updateSetting('navType')
    await updateSetting('absoluteNavBehavior')
    await updateSetting('showFooter')
    await updateSetting('showHeader')
    await updateSetting('showHero')
    await updateSetting('heroPosition')
    await updateSetting('siteTitle')
    db.backup()
    res.json(true)
    cache.clear()
  })

module.exports = {
  defaultSettings,
  getSettings,
  middleware,
  sync,
}
