const bodyParser = require('body-parser')
const express = require('express')
const Sequelize = require('sequelize')
const db = require('../db.js')
const session = require('../session.js')

const model = {}

model.Redirect = db.sequelize.define('redirect', {
  match: { type: Sequelize.STRING },
  location: { type: Sequelize.STRING }
})

const expressModule = express()
expressModule.use(bodyParser.json({ limit: '50mb' }))

const dbSync = new Promise((resolve, reject) => {
  db.sync.then(() => {
    model.Redirect.sync({ force: false }).then(resolve)
  })
})

const sync = new Promise((resolve, reject) => {
  Promise.all([db.sync, dbSync])
    .then(resolve)
    .catch(reject)
})

expressModule
  .route('/api/redirect')
  .get((req, res) => {
    model.Redirect.findAll({}).then(redirects => {
      res.json(redirects)
    })
  })
  .post(session.authenticationRequired, (req, res) => {
    if (!req.body.match) {
      res.status(400).json({ error: 'no match provided' })
      return
    } else if (!req.body.location) {
      res.status(400).json({ error: 'no location provided' })
      return
    }
    model.Redirect.create({
      match: req.body.match,
      location: req.body.location
    }).then(redirect => {
      res.json(redirect)
    })
  })

expressModule
  .route('/api/redirect/:id')
  .put(session.authenticationRequired, (req, res) => {
    if (!req.body.match) {
      res.status(400).json({ error: 'no match provided' })
      return
    } else if (!req.body.location) {
      res.status(400).json({ error: 'no location provided' })
      return
    }
    model.Redirect.findByPk(req.params.id).then(redirect => {
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
  .delete(session.authenticationRequired, (req, res) => {
    model.Redirect.findByPk(req.params.id).then(redirect => {
      if (!redirect) {
        res.status(404).json({ error: 'not found' })
        return
      }
      redirect.destroy().then(() => {
        res.json(true)
      })
    })
  })

module.exports = { expressModule, sync, model }
