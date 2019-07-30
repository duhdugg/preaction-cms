const bodyParser = require('body-parser')
const express = require('express')
const Sequelize = require('sequelize')
const db = require('../db.js')
const session = require('../session.js')

const expressModule = express()
expressModule.use(bodyParser.json({ limit: '50mb' }))

const model = {}

model.Blog = db.sequelize.define('blog', {
  title: { type: Sequelize.STRING },
  content: { type: Sequelize.TEXT },
  published: { type: Sequelize.BOOLEAN }
})

let dbSync = new Promise((resolve, reject) => {
  db.sync.then(() => {
    model.Blog.sync({ force: false }).then(resolve)
  })
})

expressModule
  .route('/api/blog')
  .get((req, res) => {
    if (req.session.authenticated) {
      db.model.Blog.findAll({ order: [['createdAt', 'DESC']] }).then(
        articles => {
          res.json(articles)
        }
      )
    } else {
      db.model.Blog.findAll({ where: { published: true } }).then(articles => {
        res.json(articles)
      })
    }
  })
  .post(session.authenticationRequired, (req, res) => {
    db.model.Blog.create({ title: '', content: '', published: false }).then(
      article => {
        res.json(article)
      }
    )
  })

expressModule
  .route('/api/blog/:id')
  .delete(session.authenticationRequired, (req, res) => {
    db.model.Blog.findByPk(req.params.id).then(article => {
      article.destroy().then(() => {
        res.json(true)
      })
    })
  })
  .put(session.authenticationRequired, (req, res) => {
    db.model.Blog.findByPk(req.params.id).then(article => {
      article.title = req.body.title || ''
      article.content = req.body.content || ''
      article.published = req.body.published || false
      article.save().then(() => {
        res.json(article)
      })
    })
  })

module.exports = {
  dbSync,
  expressModule
}
