#!/usr/bin/env node

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const express = require('express')
const path = require('path')
const excerptHtml = require('excerpt-html')
const sm = require('sitemap')

const app = express()
const db = require('./lib/db.js')
const settings = require('./lib/modules/settings.js')
const pages = require('./lib/modules/pages.js')
const renderClient = require('./lib/render.js').renderClient
const session = require('./lib/session.js')
const uploads = require('./lib/modules/uploads.js')

const http = require('http').Server(app)
const io = require('socket.io')(http)

app.use(settings.expressModule)

app.use(cookieParser())
app.use(session.session)
io.use((socket, next) => {
  session.session(socket.request, socket.request.res, next)
})
app.use(bodyParser.json({ limit: '50mb' }))
app.use(session.expressModule)
app.use(pages.expressModule)
app.use(uploads.expressModule)

app.route('/login/').get((req, res) => {
  db.model.Settings.findOne({ where: { key: 'siteTitle' } }).then(setting => {
    renderClient(req, res.status(200), {
      title: `Login | ${setting.value}`
    })
  })
})
app.route('/settings/').get((req, res) => {
  db.model.Settings.findOne({ where: { key: 'siteTitle' } }).then(setting => {
    renderClient(req, res.status(200), {
      title: `Site Settings | ${setting.value}`
    })
  })
})

app.route('/icon').get((req, res) => {
  db.model.Settings.findOne({ where: { key: 'icon' } }).then(setting => {
    if (!setting) {
      res.status(404).send('')
      return
    }
    res.redirect(setting.value)
  })
})

app.route('/bg').get((req, res) => {
  db.model.Settings.findOne({ where: { key: 'bg' } }).then(setting => {
    if (!setting) {
      res.status(404).send('')
      return
    }
    res.redirect(setting.value)
  })
})

app.route('/sitemap.xml').get((req, res) => {
  db.model.Settings.findOne({ where: { key: 'hostname' } }).then(setting => {
    let hostname = setting && setting.value ? setting.value : ''
    let changefreq = 'always'
    let sitemap = sm.createSitemap({
      hostname,
      urls: [
        {
          url: '/',
          changefreq
        }
      ]
    })
    pages.model.Page.findAll().then(pages => {
      for (let page of pages) {
        if (page.userCreated) {
          let title = page.title.toLowerCase().replace(/[^A-z0-9]/gi, '-')
          sitemap.add({ url: `/${title}/`, changefreq })
        }
      }
      sitemap.toXML((err, xml) => {
        if (err) {
          res.status(500).end()
        }
        res.header('Content-Type', 'application/xml')
        res.send(xml)
      })
    })
  })
})

app.route('/').get((req, res) => {
  pages.model.Page.findOne({
    where: { key: 'home' },
    include: [
      {
        model: pages.model.PageBlock,
        include: [pages.model.PageBlockImage, pages.model.PageBlockWysiwyg]
      }
    ]
  }).then(page => {
    let status = page ? 200 : 404
    let content = ''
    let pageblocks = page ? page.pageblocks : []
    pageblocks.sort((a, b) => {
      let retval = 0
      if (a.ordering < b.ordering) {
        retval = -1
      } else if (a.ordering > b.ordering) {
        retval = 1
      }
      return retval
    })
    for (let pageblock of pageblocks) {
      if (pageblock.pageblockwysiwyg) {
        content += pageblock.pageblockwysiwyg.content || ''
      }
    }
    content = excerptHtml(content, { pruneLength: 300 })
    renderClient(req, res.status(status), { description: content })
  })
})

app.use('/', express.static(path.join(__dirname, 'build')))

app.route('*').get((req, res) => {
  let pageKey = req.path.split('/')[1]
  pages.model.Page.findOne({
    where: { key: pageKey },
    include: [
      {
        model: pages.model.PageBlock,
        include: [pages.model.PageBlockImage, pages.model.PageBlockWysiwyg]
      }
    ]
  }).then(page => {
    let status = page ? 200 : 404
    let content = ''
    let pageblocks = page ? page.pageblocks : []
    pageblocks.sort((a, b) => {
      let retval = 0
      if (a.ordering < b.ordering) {
        retval = -1
      } else if (a.ordering > b.ordering) {
        retval = 1
      }
      return retval
    })
    for (let pageblock of pageblocks) {
      if (pageblock.pageblockwysiwyg) {
        content += pageblock.pageblockwysiwyg.content
      }
    }
    content = excerptHtml(content, { pruneLength: 300 })
    renderClient(req, res.status(status), { description: content })
  })
})

io.on('connection', socket => {
  console.debug(Object.keys(socket.conn.request.session))
  socket.on('save', data => {
    if (socket.conn.request.session.authenticated) {
      io.emit('load', data)
    }
  })
  socket.on('force-reload', data => {
    if (socket.conn.request.session.authenticated) {
      io.emit('reload-page')
    }
  })
})

const port = process.env.PREACTION_PORT || 8999

http.listen(port, () => {
  console.log(`preaction-cms app listening on port ${port}`)
})
