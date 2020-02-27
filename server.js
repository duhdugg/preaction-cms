#!/usr/bin/env node

// <== LIBRARY IMPORTS ==>
// bodyParser to handle json requests
const bodyParser = require('body-parser')
// cookieParser to handle cookies
const cookieParser = require('cookie-parser')
// express is the server-side framework of choice for this project
const express = require('express')
// path is needed to generate static build path later
const path = require('path')
// excerptHtml is used to generate descriptions from content
const excerptHtml = require('excerpt-html')
// sitemap is used to generate sitemaps
const sm = require('sitemap')

// app is our main express module
const app = express()

// <== LOCAL IMPORTS ==>
const db = require('./lib/db.js')
const settings = require('./lib/modules/settings.js')
const pages = require('./lib/modules/pages.js')
const redirects = require('./lib/modules/redirects.js')
const renderClient = require('./lib/render.js').renderClient
const session = require('./lib/session.js')
const uploads = require('./lib/modules/uploads.js')

// <== http and socket.io setup ==>
const http = require('http').Server(app)
const io = require('socket.io')(http)

// <== express setup and module loading ==>
app.use(settings.expressModule)
app.use(cookieParser())
app.use(session.session)
// connect io to session
io.use((socket, next) => {
  session.session(socket.request, socket.request.res, next)
})
// enable JSON requests and limit them to 50 megabytes in size
app.use(bodyParser.json({ limit: '50mb' }))
app.use(session.expressModule)
app.use(uploads.expressModule)
app.use(redirects.expressModule)
app.use(pages.expressModule)

// <== ROUTES ==>

app.route('/icon').get((req, res) => {
  db.model.Settings.findOne({ where: { key: 'icon' } }).then(setting => {
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
      pages.forEach(page => {
        if (page.userCreated) {
          let title = page.title.toLowerCase().replace(/[^A-z0-9]/gi, '-')
          sitemap.add({ url: `/${title}/`, changefreq })
        }
      })
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

// root route should generate description metadata from home page blocks
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
    pageblocks.forEach(pageblock => {
      if (pageblock.pageblockwysiwyg) {
        content += pageblock.pageblockwysiwyg.content || ''
      }
    })
    content = excerptHtml(content, { pruneLength: 300 })
    renderClient(req, res.status(status), { description: content })
  })
})

// root route should also serve the client build
app.use('/', express.static(path.join(__dirname, 'build')))

// all other routes should be caught here, served the appropriate page
// description metadata generated from pageblocks
app.route('*').get((req, res) => {
  let matchRedirect = false
  console.debug(req.path)
  redirects.model.Redirect.findAll().then(redirects => {
    redirects.forEach(redirect => {
      let re = new RegExp(`^/?${redirect.match}/?$`)
      if (re.test(req.path)) {
        matchRedirect = true
        res.redirect(redirect.location)
      }
    })
  })

  let pageKey = req.path.split('/')[1]
  switch (pageKey) {
    case 'home':
    case 'header':
    case 'footer':
      renderClient(req, res.status(404, ''))
      return
    default:
  }
  pages.model.Page.findOne({
    where: { key: pageKey },
    include: [
      {
        model: pages.model.PageBlock,
        include: [pages.model.PageBlockImage, pages.model.PageBlockWysiwyg]
      }
    ]
  }).then(page => {
    if (matchRedirect) {
      return
    }
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
    pageblocks.forEach(pageblock => {
      if (pageblock.pageblockwysiwyg) {
        content += pageblock.pageblockwysiwyg.content
      }
    })
    content = excerptHtml(content, { pruneLength: 300 })
    renderClient(req, res.status(status), { description: content })
  })
})

// <== SOCKET.IO EVENT CONFIG ==>

io.on('connection', socket => {
  socket.on('save', fn => {
    fn()
    if (socket.conn.request.session.authenticated) {
      io.emit('load')
    }
  })
  socket.on('force-reload', fn => {
    fn()
    if (socket.conn.request.session.authenticated) {
      io.emit('reload-app')
    }
  })
})

// <== SERVER SETUP ==>

const port = process.env.PREACTION_PORT || 8999

db.sync()
  .then(session.sync)
  .then(pages.sync)
  .then(redirects.sync)

http.listen(port, () => {
  console.log(`@preaction/cms app listening on port ${port}`)
})
