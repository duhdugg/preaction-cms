const bodyParser = require('body-parser')
const express = require('express')
const Sequelize = require('sequelize')
const db = require('../db.js')
const session = require('../session.js')

const expressModule = express()
expressModule.use(bodyParser.json({ limit: '50mb' }))

const model = {}

// Page.pageType should be 'content'
model.Page = db.sequelize.define(
  'page',
  {
    key: { type: Sequelize.STRING },
    title: { type: Sequelize.STRING },
    pageType: { type: Sequelize.STRING },
    userCreated: { type: Sequelize.BOOLEAN, defaultValue: false },
    settings: { type: Sequelize.JSON, defaultValue: {} },
    parentId: { type: Sequelize.INTEGER }
  },
  {
    associate: models => {
      model.Page.hasMany(model.Page, {
        as: 'children',
        foreignKey: 'parentId',
        onDelete: 'cascade',
        hooks: true
      })
      model.Page.belongsTo(model.Page, {
        as: 'parent',
        foreignKey: 'parentId',
        hooks: true
      })
    }
  }
)

// PageBlock.blockType should be 'wysiwyg' or 'image'
model.PageBlock = db.sequelize.define('pageblock', {
  blockType: { type: Sequelize.STRING },
  ordering: { type: Sequelize.INTEGER },
  settings: { type: Sequelize.JSON, defaultValue: {} }
})

model.PageBlockWysiwyg = db.sequelize.define('pageblockwysiwyg', {
  content: { type: Sequelize.TEXT }
})

model.PageBlockImage = db.sequelize.define('pageblockimage', {
  filename: { type: Sequelize.STRING },
  ordering: { type: Sequelize.INTEGER }
})

model.Page.hasMany(model.PageBlock, { onDelete: 'cascade', hooks: true })
model.PageBlock.belongsTo(model.Page, { hooks: true })
model.PageBlock.hasMany(model.PageBlockImage, {
  onDelete: 'cascade',
  hooks: true
})
model.PageBlock.hasOne(model.PageBlockWysiwyg, {
  onDelete: 'cascade',
  hooks: true
})
model.PageBlockWysiwyg.belongsTo(model.PageBlock, { hooks: true })
model.PageBlockImage.belongsTo(model.PageBlock, { hooks: true })

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
    model.Page.findAll({ where: { pageType: 'content' } }).then(pages => {
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
    let key = req.body.key.toLowerCase().trim()
    switch (key) {
      case 'header':
      case 'footer':
      case 'home':
      case 'settings':
      case 'login':
        res.status(400).json({ error: `${key} is reserved` })
        return
      default:
        break
    }
    model.Page.findOne({ where: { key } }).then(page => {
      if (page) {
        res.status(400).json({ error: `${key} already exists` })
        return
      }
      model.Page.create({
        pageType: req.body.pageType,
        key: key,
        title: req.body.title.trim(),
        parentId: req.body.parentId || null,
        userCreated: true,
        settings: { showHeader: true, showFooter: true }
      }).then(page => {
        res.json(page)
      })
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
      let newKey = req.body.key.toLowerCase().trim()
      let updatePage = () => {
        page.key = newKey
        if (req.body.title) {
          page.title = req.body.title.trim()
        }
        page.settings = req.body.settings
        page.save().then(pg => {
          res.json(pg)
        })
      }
      if (!page.parentId) {
        if (page.key !== newKey) {
          switch (newKey) {
            case 'header':
            case 'footer':
            case 'home':
            case 'settings':
            case 'login':
              res.status(400).json({ error: `${newKey} is reserved` })
              return
            default:
              break
          }
        }
      }
      if (page.key !== newKey) {
        model.Page.findOne({ where: { key: newKey } }).then(page => {
          if (page) {
            res.status(400).json({ error: `${newKey} already exists` })
            return
          } else {
            updatePage()
          }
        })
      } else {
        updatePage()
      }
    })
  })
  .delete(session.authenticationRequired, (req, res) => {
    model.Page.findByPk(req.params.id).then(page => {
      if (!page) {
        res.status(404).json({ error: 'not found' })
        return
      }
      Promise.all([
        model.Page.destroy({ where: { id: req.params.id } }),
        model.Page.destroy({ where: { parentId: req.params.id } })
      ]).then(() => {
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

expressModule.route('/api/page/by-key/:parentKey/:pageKey').get((req, res) => {
  model.Page.findOne({
    where: { key: req.params.parentKey }
  }).then(parent => {
    if (!parent) {
      res.status(404).json({ error: 'not found' })
    }
    model.Page.findOne({
      where: { parentId: parent.id, key: req.params.pageKey },
      include: [
        {
          model: model.PageBlock,
          include: [model.PageBlockWysiwyg, model.PageBlockImage]
        }
      ]
    }).then(page => {
      if (!page) {
        res.status(404).json({ error: 'not found' })
      }
      res.json(page)
    })
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
    let getOrdering = new Promise((resolve, reject) => {
      model.PageBlock.findAll({
        where: { pageId: req.params.id },
        limit: 1,
        order: [['ordering', 'DESC']]
      }).then(results => {
        let ordering = 0
        if (results.length) {
          ordering = results[0].ordering + 1
        }
        resolve(ordering)
      })
    })
    let settings = {}
    if (req.body.blockType === 'image') {
      settings.maxWidth = '25%'
      settings.autoCollapseColumns = true
      settings.center = false
      settings.showContainer = true
      settings.pushToZoom = false
    }
    getOrdering.then(ordering => {
      model.PageBlock.create({
        pageId: req.params.id,
        blockType: req.body.blockType || 'wysiwyg',
        ordering,
        settings
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
        } else {
          res.json(block)
        }
      })
    })
  })

expressModule
  .route('/api/page/blocks/:id')
  .get((req, res) => {
    model.PageBlock.findByPk(req.params.id, {
      include: [model.PageBlockImage, model.PageBlockWysiwyg]
    }).then(pageBlock => {
      res.json(pageBlock)
    })
  })
  .put(session.authenticationRequired, (req, res) => {
    model.PageBlock.update(
      {
        ordering: req.body.ordering,
        settings: req.body.settings || {}
      },
      {
        where: { id: req.params.id }
      }
    ).then(pageBlock => {
      res.json(pageBlock)
    })
  })
  .delete(session.authenticationRequired, (req, res) => {
    model.PageBlock.findByPk(req.params.id).then(pageblock => {
      let ordering = pageblock.ordering
      pageblock.destroy().then(() => {
        model.PageBlock.findAll({
          where: { ordering: { $gt: ordering } }
        }).then(pageblocks => {
          pageblocks.forEach(block => {
            block.ordering--
            block.save()
          })
          res.json(true)
        })
      })
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

expressModule
  .route('/api/page/blocks/image/:id')
  .get((req, res) => {
    model.PageBlockImage.findByPk(req.params.id).then(pageblockimage => {
      res.json(pageblockimage)
    })
  })
  .put(session.authenticationRequired, (req, res) => {
    model.PageBlockImage.update(
      { ordering: req.body.ordering },
      { where: { id: req.params.id } }
    ).then(pageblockimage => {
      res.json(pageblockimage)
    })
  })
  .delete(session.authenticationRequired, (req, res) => {
    model.PageBlockImage.findByPk(req.params.id).then(pageblockimage => {
      let ordering = pageblockimage.ordering
      pageblockimage.destroy().then(() => {
        model.PageBlockImage.findAll({
          where: { ordering: { $gt: ordering } }
        }).then(pageblockimages => {
          pageblockimages.forEach(image => {
            image.ordering--
            image.save()
          })
          res.json(true)
        })
      })
    })
  })

module.exports = {
  createDefaultPages,
  dbSync,
  expressModule,
  model,
  sync
}
