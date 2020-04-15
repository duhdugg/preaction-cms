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
const { SitemapStream } = require('sitemap')
// zlib is used to gzip sitemap
const { createGzip } = require('zlib')

// app is our main express module
const app = express()

// <== LOCAL IMPORTS ==>
const db = require('./lib/db.js')
const env = require('./lib/env.js')
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
  db.model.Settings.findOne({ where: { key: 'icon' } }).then((setting) => {
    if (!setting) {
      res.status(404).send('')
      return
    }
    res.redirect(setting.value)
  })
})

app.route('/sitemap.xml').get((req, res) => {
  db.model.Settings.findOne({ where: { key: 'hostname' } }).then((setting) => {
    let hostname = setting && setting.value ? setting.value : ''
    let changefreq = 'always'
    try {
      let smStream = new SitemapStream({ hostname: hostname })
      let pipeline = smStream.pipe(createGzip())
      smStream.write({
        url: '/',
        changefreq,
      })
      pages.model.Page.findAll({ where: { userCreated: true } }).then(
        (pageRows) => {
          let rowCount = pageRows.length
          let countMapped = 0
          pageRows.forEach((page) => {
            pages.funcs.getPagePath(page).then((path) => {
              smStream.write({
                url: `${env.root}/${path}/`,
                changefreq,
              })
              countMapped++
              if (countMapped >= rowCount) {
                smStream.end()
                res.header('Content-Type', 'application/xml')
                res.header('Content-Encoding', 'gzip')
                pipeline.pipe(res).on('error', (e) => {
                  throw e
                })
              }
            })
          })
        }
      )
    } catch (e) {
      console.error(e)
      res.status(500).end()
    }
  })
})

// root route should generate description metadata from home page blocks
app.route('/').get((req, res) => {
  pages.model.Page.findOne({
    where: { key: 'home' },
    include: [
      {
        model: pages.model.PageBlock,
        include: [pages.model.PageBlockContent],
      },
    ],
  }).then((page) => {
    let status = page ? 200 : 404
    let description = ''
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
    pageblocks.forEach((pageblock) => {
      if (pageblock.pageblockcontents) {
        let contents = pageblock.pageblockcontents
        contents.sort((a, b) => {
          let retval = 0
          if (a.ordering < b.ordering) {
            retval = -1
          } else if (a.ordering > b.ordering) {
            retval = 1
          }
          return retval
        })
        pageblock.pageblockcontents.forEach((pbc) => {
          if (pbc.wysiwyg) {
            description += pbc.wysiwyg
          }
        })
      }
    })
    // remove line-break paragraphs
    description = description.replace(/<p><br><\/p>/g, '')
    description = excerptHtml(description, { pruneLength: 300 })
    renderClient(req, res.status(status), { description })
  })
})

// root route should also serve the client build
app.use('/', express.static(path.join(__dirname, 'build')))

// all other routes should be caught here, served the appropriate page
// description metadata generated from pageblocks
app.route('*').get((req, res) => {
  let matchRedirect = false
  redirects.model.Redirect.findAll().then((redirects) => {
    redirects.forEach((redirect) => {
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
    case 'favicon.ico':
      renderClient(req, res.status(404, ''))
      return
    default:
  }
  pages.funcs.getPageByPath(req.path).then((page) => {
    pages.funcs
      .getFullPageById(page.id)
      .then((page) => {
        if (matchRedirect) {
          return
        }
        let status = page ? 200 : 404
        let description = ''
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
        pageblocks.forEach((pageblock) => {
          if (pageblock.pageblockcontents) {
            let contents = pageblock.pageblockcontents
            contents.sort((a, b) => {
              let retval = 0
              if (a.ordering < b.ordering) {
                retval = -1
              } else if (a.ordering > b.ordering) {
                retval = 1
              }
              return retval
            })
            pageblock.pageblockcontents.forEach((pbc) => {
              if (pbc.wysiwyg) {
                description += pbc.wysiwyg
              }
            })
          }
        })
        // remove line-break paragraphs
        description = description.replace(/<p><br><\/p>/g, '')
        description = excerptHtml(description, { pruneLength: 300 })
        pages.funcs.getAppliedPageSettings(page.id).then((settings) => {
          let siteTitle = settings.siteTitle
          let pageTitle = page.title
          renderClient(req, res.status(status), {
            description,
            siteTitle,
            pageTitle,
          })
        })
      })
      .catch((e) => {
        console.error(e)
      })
  })
})

// <== SOCKET.IO EVENT CONFIG ==>

if (env.socketMode) {
  io.on('connection', (socket) => {
    socket.on('save', (fn) => {
      fn()
      if (socket.conn.request.session.authenticated) {
        io.emit('load')
      }
    })
    socket.on('force-reload', (fn) => {
      fn()
      if (socket.conn.request.session.authenticated) {
        io.emit('reload-app')
      }
    })
  })
}

// <== SERVER SETUP ==>

db.sync()
  .then(session.sync)
  .then(settings.sync)
  .then(pages.sync)
  .then(redirects.sync)

http.listen(env.port, () => {
  console.log(`@preaction/cms app listening on port ${env.port}`)
})
