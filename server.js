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
const cache = require('./lib/cache.js')
const db = require('./lib/db.js')
const env = require('./lib/env.js')
const ext = require('./lib/ext.js')
const settings = require('./lib/settings.js')
const pages = require('./lib/pages.js')
const redirects = require('./lib/redirects.js')
const renderClient = require('./lib/render.js').renderClient
const session = require('./lib/session.js')
const uploads = require('./lib/uploads.js')

// <== http and socket.io setup ==>
// socket.io events needs to verify session
// which requires the app be put into an http.Server instance
// and the http.Server instance to be called into the socket.io instance
const http = require('http').Server(app)
const io = require('socket.io')(http)

// <== express setup and module loading ==>
app.use(settings.middleware)
app.use(cookieParser())
app.use(session.session)
// connect socket.io to session
io.use((socket, next) => {
  session.session(socket.request, socket.request.res, next)
})
// enable JSON requests and limit them to 50 megabytes in size
app.use(bodyParser.json({ limit: '50mb' }))
app.use(ext.middleware)
app.use(session.middleware)
app.use(db.middleware)
app.use(uploads.middleware)
app.use(redirects.middleware)
app.use(pages.middleware)

// <== ROUTES ==>

// the favicon is hard-coded to use /icon path
// and the server needs to redirect to the uploaded url in settings
app.route('/icon').get(async (req, res) => {
  const setting = await db.model.Settings.findOne({ where: { key: 'icon' } })
  if (!setting) {
    res.status(404).send('')
    return
  }
  res.redirect(setting.value)
})

if (env.sitemapHostname) {
  // sitemap needs to traverse all pages in database
  app.route('/sitemap.xml').get(async (req, res) => {
    const hostname = env.sitemapHostname
    const changefreq = 'always'
    try {
      const smStream = new SitemapStream({ hostname })
      const pipeline = smStream.pipe(createGzip())
      smStream.write({
        url: '/',
        changefreq,
      })
      function end() {
        smStream.end()
        res.header('Content-Type', 'application/xml')
        res.header('Content-Encoding', 'gzip')
        pipeline.pipe(res).on('error', (e) => {
          throw e
        })
      }
      const pageRows = await pages.model.Page.findAll({
        where: { userCreated: true },
      })
      const rowCount = pageRows.length
      if (!rowCount) {
        end()
      }
      let countMapped = 0
      for (const page of pageRows) {
        const path = await pages.funcs.getPagePath(page)
        smStream.write({
          url: `${env.root}/${path}/`,
          changefreq,
        })
        countMapped++
        if (countMapped >= rowCount) {
          end()
        }
      }
    } catch (e) {
      console.error(e)
      res.status(500).end()
    }
  })
}

// root route should generate description metadata from home page blocks
app.route('/').get(cache.middleware, async (req, res) => {
  try {
    const page = await pages.funcs.getFullPageByPath('/home/')
    let description = ''
    const pageblocks = page ? page.pageblocks : []
    pageblocks.sort((a, b) =>
      a.ordering < b.ordering ? -1 : a.ordering > b.ordering ? 1 : 0
    )
    for (const pageblock of pageblocks) {
      if (pageblock.pageblockcontents) {
        const contents = pageblock.pageblockcontents
        contents.sort((a, b) =>
          a.ordering < b.ordering ? -1 : a.ordering > b.ordering ? 1 : 0
        )
        for (const pbc of pageblock.pageblockcontents) {
          if (pbc.wysiwyg) {
            description += pbc.wysiwyg
          }
        }
      }
    }
    // remove line-break paragraphs
    description = description.replace(/<p><br><\/p>/g, '')
    description = excerptHtml(description, { pruneLength: 300 })
    renderClient(req, res.status(200), { description })
  } catch (error) {
    renderClient(req, res.status(404))
  }
})

// root route should also serve the client build
app.use('/', express.static(path.join(__dirname, 'build')))

// all other routes should be caught here, served the appropriate page
// description metadata generated from pageblocks
// and titles from page+site settings
app.route('*').get(cache.middleware, async (req, res) => {
  const redirs = await redirects.model.Redirect.findAll()
  for (const redirect of redirs) {
    const re = new RegExp(`^/?${redirect.match}/?$`)
    if (re.test(req.path)) {
      res.redirect(redirect.location)
      return
    }
  }
  const pageKey = req.path.split('/')[1]
  switch (pageKey) {
    case 'home':
    case 'header':
    case 'footer':
    case 'favicon.ico':
      renderClient(req, res.status(404, ''))
      return
    default:
  }
  try {
    const page = await pages.funcs.getFullPageByPath(req.path)
    // build the description from sorted contents of sort pageblocks
    let description = ''
    const pageblocks = page ? page.pageblocks : []
    // sort pageblocks by ordering attribute
    pageblocks.sort((a, b) =>
      a.ordering < b.ordering ? -1 : a.ordering > b.ordering ? 1 : 0
    )
    for (const pageblock of pageblocks) {
      if (pageblock.pageblockcontents) {
        const contents = pageblock.pageblockcontents
        // sort contents by ordering attribute
        contents.sort((a, b) =>
          a.ordering < b.ordering ? -1 : a.ordering > b.ordering ? 1 : 0
        )
        for (const pbc of contents) {
          if (pbc.wysiwyg) {
            description += pbc.wysiwyg
          }
        }
      }
    }
    // remove line-break paragraphs
    description = description.replace(/<p><br><\/p>/g, '')
    description = excerptHtml(description, { pruneLength: 300 })
    const settings = await pages.funcs.getAppliedPageSettings(page.id)
    const siteTitle = settings.siteTitle
    const pageTitle = page.title
    renderClient(req, res.status(200), {
      description,
      siteTitle,
      pageTitle,
    })
  } catch (error) {
    renderClient(req, res.status(404))
  }
})

// <== SOCKET.IO EVENT CONFIG ==>

// env.socketMode determines whether socket.io events are configured
if (env.socketMode) {
  io.on('connection', (socket) => {
    socket.on('save', (fn) => {
      fn()
      if (socket.conn.request.session.admin) {
        io.emit('load')
      }
    })
    socket.on('force-reload', (fn) => {
      fn()
      if (socket.conn.request.session.admin) {
        io.emit('reload-app')
      }
    })
  })
}

// <== SERVER SETUP ==>

// sync all the things and run the server
const sync = async () => {
  await db.sync()
  await session.sync()
  await settings.sync()
  await pages.sync()
  await redirects.sync()
}

const load = async () => {
  if (require.main === module) {
    await sync()
    // http.listen instead of app.listen so that socket.io events work
    http.listen(env.port, () => {
      console.log(`@preaction/cms app listening on port ${env.port}`)
    })
  }
}
load()

module.exports = {
  app,
  http,
  io,
  sync,
}
