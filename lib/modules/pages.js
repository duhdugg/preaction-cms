const bodyParser = require('body-parser')
const express = require('express')
const Sequelize = require('sequelize')
const db = require('../db.js')
const session = require('../session.js')

const expressModule = express()
expressModule.use(bodyParser.json({ limit: '50mb' }))

const model = {}

// Page.pageType should be 'content' or 'blog'
model.Page = db.sequelize.define('page', {
  key: { type: Sequelize.STRING },
  pageType: { type: Sequelize.STRING },
  title: { type: Sequelize.STRING },
  userCreated: { type: Sequelize.BOOLEAN, defaultValue: false }
})

// PageBlock.blockType should be 'wysiwyg' or 'image'
model.PageBlock = db.sequelize.define('pageblock', {
  blockType: { type: Sequelize.STRING },
  ordering: { type: Sequelize.INTEGER }
})

model.PageBlockWysiwyg = db.sequelize.define('pageblockwysiwyg', {
  content: { type: Sequelize.TEXT }
})

model.PageBlockImage = db.sequelize.define('pageblockimage', {
  filename: { type: Sequelize.STRING },
  ordering: { type: Sequelize.INTEGER }
})

model.Page.hasMany(model.PageBlock)
model.PageBlock.belongsTo(model.Page)
model.PageBlock.hasOne(model.PageBlockImage)
model.PageBlock.hasOne(model.PageBlockWysiwyg)
model.PageBlockWysiwyg.belongsTo(model.PageBlock)
model.PageBlockImage.belongsTo(model.PageBlock)

let dbSync = new Promise((resolve, reject) => {
  db.sync.then(() => {
    Promise.all([
      model.Page.sync({ force: false }),
      model.PageBlock.sync({ force: false }),
      model.PageBlockWysiwyg.sync({ force: false }),
      model.PageBlockImage.sync({ force: false })
    ])
      .then(resolve)
      .catch(reject)
  })
})

let createDefaultPages = new Promise((resolve, reject) => {
  dbSync.then(() => {
    let createHeader = () => {
      return model.Page.findOrCreate({
        where: { key: 'header' },
        defaults: { pageType: 'content' }
      })
    }
    let createFooter = () => {
      return model.Page.findOrCreate({
        where: { key: 'footer' },
        defaults: { pageType: 'content' }
      })
    }
    let createHome = () => {
      return model.Page.findOrCreate({
        where: { key: 'home' },
        defaults: { pageType: 'content' }
      })
    }
    createHeader()
      .then(createFooter)
      .then(createHome)
      .then(resolve)
      .catch(reject)
  })
})

let sync = new Promise((resolve, reject) => {
  Promise.all([db.sync, dbSync, createDefaultPages])
    .then(resolve)
    .catch(reject)
})

expressModule
  .route('/api/page')
  .get((req, res) => {
    model.Page.findAll().then(pages => {
      res.json(pages)
    })
  })
  .post(session.authenticationRequired, (req, res) => {
    if (!req.body.pageType) {
      res.status(400).json({ error: 'missing pageType' })
      return
    }
    if (!req.body.key) {
      res.status(400).json({ error: 'missing key' })
      return
    }
    if (!req.body.title) {
      res.status(400).json({ error: 'missing title' })
    }
    switch (req.body.pageType) {
      case 'content':
        break
      default:
        res.status(400).json({ error: 'invalid pageType' })
    }
    switch (req.body.key) {
      case 'header':
      case 'footer':
      case 'home':
      case 'settings':
      case 'login':
        res.status(400).json({ error: `${req.body.key} is reserved` })
        return
    }
    model.Page.create({
      pageType: req.body.pageType,
      key: req.body.key,
      title: req.body.title,
      userCreated: true
    }).then(page => {
      res.json(page)
    })
  })

expressModule
  .route('/api/page/:id')
  .get((req, res) => {
    model.Page.findByPk(req.params.id, {
      include: [
        {
          model: model.PageBlock,
          include: [model.PageBlockImage, model.PageBlockWysiwyg]
        }
      ]
    }).then(page => {
      if (!page) {
        res.status(404).json({ error: 'not found' })
        return
      }
      res.json(page)
    })
  })
  .put(session.authenticationRequired, (req, res) => {
    model.Page.findByPk(req.params.id).then(page => {
      if (!page) {
        res.status(404).json({ error: 'not found' })
        return
      }
      res.json(page)
    })
  })
  .delete(session.authenticationRequired, (req, res) => {
    model.Page.findByPk(req.params.id).then(page => {
      if (!page) {
        res.status(404).json({ error: 'not found' })
        return
      }
      model.Page.destroy({ where: { id: req.params.id } }).then(() => {
        res.json(page)
      })
    })
  })

expressModule.route('/api/page/by-key/:pageKey').get((req, res) => {
  model.Page.findOne({
    where: { key: req.params.pageKey },
    include: [
      {
        model: model.PageBlock,
        include: [model.PageBlockWysiwyg, model.PageBlockImage]
      }
    ]
  }).then(page => {
    if (!page) {
      res.status(404).json({ error: 'not found' })
      return
    }
    res.json(page)
  })
})

expressModule
  .route('/api/page/:id/blocks')
  .get((req, res) => {
    model.PageBlock.findAll({
      where: { pageId: req.params.id },
      include: [model.PageBlockImage, model.PageBlockWysiwyg]
    }).then(blocks => {
      res.json(blocks)
    })
  })
  .post(session.authenticationRequired, (req, res) => {
    model.PageBlock.create({
      pageId: req.params.id,
      blockType: req.body.blockType || 'wysiwyg'
    }).then(block => {
      if (block.blockType === 'wysiwyg') {
        model.PageBlockWysiwyg.create({
          pageblockId: block.id,
          content: ''
        }).then(wysiwyg => {
          model.PageBlock.findByPk(block.id, {
            include: [model.PageBlockWysiwyg]
          }).then(block => {
            res.json(block)
          })
        })
      }
    })
  })

expressModule
  .route('/api/page/blocks/:id')
  .get((req, res) => {
    model.PageBlock.findByPk(req.params.id).then(pageBlock => {
      res.json(pageBlock)
    })
  })
  .delete(session.authenticationRequired, (req, res) => {
    model.PageBlock.destroy({ where: { id: req.params.id } }).then(() => {
      res.json(true)
    })
  })

expressModule
  .route('/api/page/blocks/wysiwyg/:id')
  .get((req, res) => {
    model.PageBlockWysiwyg.findByPk(req.params.id).then(wysiwyg => {
      res.json(wysiwyg)
    })
  })
  .put(session.authenticationRequired, (req, res) => {
    model.PageBlockWysiwyg.update(
      { content: req.body.content },
      { where: { id: req.params.id } }
    ).then(wysiwyg => {
      res.json(wysiwyg)
    })
  })

module.exports = {
  createDefaultPages,
  dbSync,
  expressModule,
  model,
  sync
}
