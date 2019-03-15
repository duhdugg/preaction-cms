#!/usr/bin/env node

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const express = require('express')
const path = require('path')
// const excerptHtml = require('excerpt-html')
// const sm = require('sitemap')

const app = express()
const db = require('./lib/db.js')
const settings = require('./lib/modules/settings.js')
const pages = require('./lib/modules/pages.js')
const renderClient = require('./lib/render.js').renderClient
const session = require('./lib/session.js')
const uploads = require('./lib/modules/uploads.js')

app.use(settings.expressModule)

app.use(cookieParser())
app.use(session.session)
app.use(bodyParser.json({ limit: '50mb' }))
app.use(session.expressModule)
app.use(pages.expressModule)
app.use(uploads.expressModule)

app.route('/').get((req, res) => {
  db.model.Settings.findOne({ where: { key: 'siteTitle' } }).then(setting => {
    renderClient(req, res.status(200), { title: setting.value })
  })
})
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

// app.route('/sitemap.xml').get((req, res) => {
//   let hostname = 'http://example.com'
//   let changefreq = 'always'
//   let sitemap = sm.createSitemap({
//     hostname,
//     urls: [
//       {
//         url: '/',
//         changefreq
//       }
//     ]
//   })
//   db.model.Blog.findAll({ where: { published: true } }).then(articles => {
//     for (let article of articles) {
//       let title = article.title.toLowerCase().replace(/[^A-z0-9]/g, '-')
//       sitemap.add({ url: `/blog/${article.id}/${title}`, changefreq })
//     }
//     sitemap.toXML((err, xml) => {
//       if (err) {
//         res.status(500).end()
//       }
//       res.header('Content-Type', 'application/xml')
//       res.send(xml)
//     })
//   })
// })

app.use('/', express.static(path.join(__dirname, 'build')))

app.route('*').get((req, res) => {
  let pageKey = req.path.split('/')[1]
  pages.model.Page.findOne({ where: { key: pageKey } }).then(page => {
    let status = 200
    if (!page) {
      status = 404
    }
    renderClient(req, res.status(status))
  })
})

app.listen(8999, () => {
  console.log(`preaction-cms app listening on port 8999`)
})
