/**
 * @module redirects
 */

const adminRequired = require('./adminRequired.js')
const bodyParser = require('body-parser')
const express = require('express')
const Sequelize = require('sequelize')
const csrf = require('./csrf.js')
const db = require('./db.js')

// <== DB DEFINITIONS ==>

/**
 * @memberof redirects
 * @type {Object}
 * @description table definitions
 */
const model = {}

/**
 * @memberof redirects.model
 * @class
 */
model.Redirect = db.sequelize.define('redirect', {
  /**
   * @memberof redirects.model.Redirect
   * @instance
   * @type {string}
   */
  match: { type: Sequelize.STRING },
  /**
   * @memberof redirects.model.Redirect
   * @instance
   * @type {string}
   */
  location: { type: Sequelize.STRING },
})

// <=== EXPRESS MODULE SETUP ==>

/**
 * @memberof redirects
 * @type {express}
 * @description JSON CRUD API
 * @see {@link https://expressjs.com/en/guide/using-middleware.html}
 */
const apiMiddleware = express()
apiMiddleware.use(bodyParser.json({ limit: '50mb' }))

/**
 * @memberof redirects
 * @function
 * @description middleware to handle matched redirects with a 302 response
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {func} next
 * @see {@link https://expressjs.com/en/guide/using-middleware.html}
 */
const middleware = async (req, res, next) => {
  const redirs = await model.Redirect.findAll()
  for (const redirect of redirs) {
    const re = new RegExp(`^/?${redirect.match}/?$`)
    if (re.test(req.path)) {
      res.redirect(redirect.location)
      return
    }
  }
  next()
}

// <== FUNCTIONS ==>

/**
 * @memberof redirects
 * @description ensures the redirect tables are created
 * @returns {Promise} `undefined`
 */
const sync = async () => {
  await model.Redirect.sync({ force: false })
  return
}

// <== EXPRESS MODULE ROUTES ==>

apiMiddleware
  .route('/api/redirect')
  /**
   * @memberof redirects.apiMiddleware
   * @function
   * @name GET-api/redirect
   * @returns {Object[]} see redirects.model.Redirect
   */
  .get(async (req, res) => {
    const redirs = await model.Redirect.findAll({})
    res.json(redirs)
  })
  /**
   * @memberof redirects.apiMiddleware
   * @function
   * @name POST-api/redirect
   * @description creates a new redirect
   * @param {express.Request} req
   * @param {Object} req.body as JSON
   * @param {string} req.body.match
   * @param {string} req.body.location
   * @returns {Object} see redirects.model.Redirect
   */
  .post(adminRequired, csrf.protect, async (req, res) => {
    if (!req.body.match) {
      res.status(400).json({ error: 'no match provided' })
      return
    } else if (!req.body.location) {
      res.status(400).json({ error: 'no location provided' })
      return
    }
    const redirect = await model.Redirect.create({
      match: req.body.match,
      location: req.body.location,
    })
    res.json(redirect)
  })

apiMiddleware
  .route('/api/redirect/:id')
  /**
   * @memberof redirects.apiMiddleware
   * @function
   * @name PUT-api/redirect/_id
   * @param {express.Request} req
   * @param {Object} req.params
   * @param {number} req.params._id
   * @param {Object} req.body as JSON
   * @param {string} req.body.match
   * @param {string} req.body.location
   * @description updates an existing redirect
   * @returns {boolean} `true`
   */
  .put(adminRequired, csrf.protect, async (req, res) => {
    if (!req.body.match) {
      res.status(400).json({ error: 'no match provided' })
      return
    } else if (!req.body.location) {
      res.status(400).json({ error: 'no location provided' })
      return
    }
    const redirect = await model.Redirect.findByPk(req.params.id)
    if (!redirect) {
      res.status(404).json({ error: 'not found' })
      return
    }
    redirect.match = req.body.match
    redirect.location = req.body.location
    await redirect.save()
    res.json(true)
  })
  /**
   * @memberof redirects.apiMiddleware
   * @function
   * @name DELETE-api/redirect/_id
   * @param {express.Request} req
   * @param {Object} req.params
   * @param {number} req.params._id
   * @returns {boolean} `true`
   */
  .delete(adminRequired, csrf.protect, async (req, res) => {
    const redirect = await model.Redirect.findByPk(req.params.id)
    if (!redirect) {
      res.status(404).json({ error: 'not found' })
      return
    }
    await redirect.destroy()
    res.json(true)
  })

// <== EXPORT ==>

module.exports = { apiMiddleware, middleware, sync, model }
