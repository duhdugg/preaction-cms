const adminRequired = require('./adminRequired.js')
const bodyParser = require('body-parser')
const express = require('express')
const Sequelize = require('sequelize')
const db = require('./db.js')

// <== DB DEFINITIONS ==>

const model = {}

model.Redirect = db.sequelize.define('redirect', {
  match: { type: Sequelize.STRING },
  location: { type: Sequelize.STRING },
})

// <=== EXPRESS MODULE SETUP ==>

const middleware = express()
middleware.use(bodyParser.json({ limit: '50mb' }))

// <== FUNCTIONS ==>

const sync = () =>
  new Promise((resolve, reject) => {
    model.Redirect.sync({ force: false }).then(resolve)
  })

// <== EXPRESS MODULE ROUTES ==>

middleware
  .route('/api/redirect')
  .get((req, res) => {
    model.Redirect.findAll({}).then((redirects) => {
      res.json(redirects)
    })
  })
  .post(adminRequired, (req, res) => {
    if (!req.body.match) {
      res.status(400).json({ error: 'no match provided' })
      return
    } else if (!req.body.location) {
      res.status(400).json({ error: 'no location provided' })
      return
    }
    model.Redirect.create({
      match: req.body.match,
      location: req.body.location,
    }).then((redirect) => {
      res.json(redirect)
    })
  })

middleware
  .route('/api/redirect/:id')
  .put(adminRequired, (req, res) => {
    if (!req.body.match) {
      res.status(400).json({ error: 'no match provided' })
      return
    } else if (!req.body.location) {
      res.status(400).json({ error: 'no location provided' })
      return
    }
    model.Redirect.findByPk(req.params.id).then((redirect) => {
      if (!redirect) {
        res.status(404).json({ error: 'not found' })
        return
      }
      redirect.match = req.body.match
      redirect.location = req.body.location
      redirect.save().then(() => {
        res.json(true)
      })
    })
  })
  .delete(adminRequired, (req, res) => {
    model.Redirect.findByPk(req.params.id).then((redirect) => {
      if (!redirect) {
        res.status(404).json({ error: 'not found' })
        return
      }
      redirect.destroy().then(() => {
        res.json(true)
      })
    })
  })

// <== EXPORT ==>

module.exports = { middleware, sync, model }
