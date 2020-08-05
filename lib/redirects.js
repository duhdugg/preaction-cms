const adminRequired = require('./adminRequired.js')
const bodyParser = require('body-parser')
const express = require('express')
const Sequelize = require('sequelize')
const csrf = require('./csrf.js')
const db = require('./db.js')

// <== DB DEFINITIONS ==>

const model = {}

model.Redirect = db.sequelize.define('redirect', {
  match: { type: Sequelize.STRING },
  location: { type: Sequelize.STRING },
})

// <=== EXPRESS MODULE SETUP ==>

const apiMiddleware = express()
apiMiddleware.use(bodyParser.json({ limit: '50mb' }))

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

const sync = async () => {
  await model.Redirect.sync({ force: false })
  return
}

// <== EXPRESS MODULE ROUTES ==>

apiMiddleware
  .route('/api/redirect')
  .get(async (req, res) => {
    const redirs = await model.Redirect.findAll({})
    res.json(redirs)
  })
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
