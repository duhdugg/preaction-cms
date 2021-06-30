#!/usr/bin/env node

const pkg = require('./package.json')

// <== LIBRARY IMPORTS ==>
// bodyParser to handle json requests
const bodyParser = require('body-parser')
// cookieParser to handle cookies
const cookieParser = require('cookie-parser')
// express is the server-side framework of choice for this project
const express = require('express')
// path is needed to generate static build path later
const path = require('path')
// sitemap is used to generate sitemaps
const { SitemapStream } = require('sitemap')
// zlib is used to gzip sitemap
const { createGzip } = require('zlib')

// app is our main express module
const app = express()

// <== LOCAL IMPORTS ==>
const env = require('./lib/env.js')
if (env.nodeEnv !== 'test') {
  console.log({
    'Preaction CMS environment variables': env,
    'Preaction CMS Version': pkg.version,
  })
}
const cache = require('./lib/cache.js')
const db = require('./lib/db.js')
const ext = require('./lib/ext.js')
const settings = require('./lib/settings.js')
const pages = require('./lib/pages.js')
const redirects = require('./lib/redirects.js')
const renderClient = require('./lib/render.js').renderClient
const session = require('./lib/session.js')
const slash = require('./lib/slash.js')
const socket = require('./lib/socket.js')
const ua = require('./lib/ua.js')
const uploads = require('./lib/uploads.js')
const warm = require('./lib/warm.js')

// <== http and socket.io setup ==>
const http = require('http').Server(app)
if (env.socketMode || env.nodeEnv === 'test') {
  socket.setHttp(http)
}

// <== express setup and module loading ==>
app.use(settings.middleware)
app.use(cookieParser())
app.use(session.session)
// connect socket.io to session
if (env.socketMode || env.nodeEnv === 'test') {
  socket.io.use((sock, next) => {
    session.session(sock.request, sock.request.res, next)
  })
}
// enable JSON requests and limit them to 50 megabytes in size
app.use(bodyParser.json({ limit: '50mb' }))
app.use(ext.middleware)
app.use(session.middleware)
app.use(db.middleware)
app.use(uploads.middleware)
app.use(redirects.apiMiddleware)
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

if (env.sitemapHostname || env.nodeEnv === 'test') {
  // sitemap needs to traverse all pages in database
  app.route('/sitemap.xml').get(async (req, res) => {
    const hostname = env.sitemapHostname || 'http://localhost:8999'
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
        const path = await pages.getPagePath(page)
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

app.route('/').get(ua.middleware, cache.middleware, async (req, res) => {
  const siteSettings = await settings.getSettings()
  try {
    const page = await pages.getFullPageByPath('/home/', 3)
    const description = siteSettings.metaDescription
    renderClient(req, res.status(200), { description, page, siteSettings })
  } catch (error) {
    renderClient(req, res.status(404), { init404: true, siteSettings })
  }
})

// root route should also serve the client build
app.use('/', express.static(path.join(__dirname, 'build')))

// all other routes should be caught here, served the appropriate page
app
  .route('*')
  .get(
    ua.middleware,
    cache.middleware,
    redirects.middleware,
    slash.middleware,
    async (req, res) => {
      const siteSettings = await settings.getSettings()
      const splitPath = req.path.split('/')
      const pageKey = splitPath[splitPath.length - 2]
      switch (pageKey) {
        case 'home':
        case 'header':
        case 'footer':
        case 'hero':
        case 'favicon.ico':
          renderClient(req, res.status(404), {
            init404: true,
            siteSettings,
          })
          return
        default:
      }
      try {
        const page = await pages.getFullPageByPath(req.path, 3)
        const appliedSettings = await pages.getAppliedPageSettings(page.id)
        const siteTitle = appliedSettings.siteTitle
        const pageTitle = page.title
        const description = appliedSettings.metaDescription
        renderClient(req, res.status(200), {
          description,
          siteSettings,
          siteTitle,
          pageTitle,
          page,
        })
      } catch (error) {
        renderClient(req, res.status(404), { init404: true, siteSettings })
      }
    }
  )

// <== SERVER SETUP ==>

// sync all the things and run the server
const sync = async () => {
  await db.sync()
  await session.sync()
  await settings.sync()
  await pages.sync()
  await redirects.sync()
}

// circular dependencies workaround
warm.setServerHttp(http)
warm.setPageModule(pages)

const load = async () => {
  if (require.main === module) {
    if (env.removeExif) {
      const child_process = require('child_process')
      const { stdout } = child_process.spawnSync(
        path.join(__dirname, './scripts/check-exiftool.sh')
      )
      console.log(stdout.toString())
    }
    await sync()
    // http.listen instead of app.listen so that socket.io events work
    http.listen(env.port, () => {
      console.log(`@preaction/cms app listening on port ${env.port}`)
      warm.upCache()
    })
  }
}
load()

module.exports = {
  app,
  http,
  sync,
}
