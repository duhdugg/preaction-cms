const bcrypt = require('bcryptjs')
const express = require('express')
const session = require('express-session')
const SessionStore = require('connect-session-sequelize')(session.Store)
const db = require('./db.js')
const env = require('./env.js')
const renderClient = require('./render.js').renderClient

let oneYear = 365 * 24 * 60 * 60 * 1000
let sessionConfig = {
  secret: '@preaction/cms',
  name: '@preaction/cms:session',
  cookie: {
    maxAge: oneYear,
    sameSite: env.cookieSameSite,
    secure: env.cookieSecure,
  },
  store: new SessionStore({
    db: db.sequelize,
    expiration: oneYear,
    extendDefaultFields: db.extendDefaultSessionFields,
    table: 'session',
  }),
  resave: false,
  saveUninitialized: false,
}

const expressModule = express()

// authenticationRequired is a middleware function to require
// that the session is authenticated before proceeding
// to the next middleware function
const authenticationRequired = (req, res, next) => {
  if (req.session.authenticated) {
    next()
  } else {
    res.status(401).json({ error: 'unauthorized' })
  }
}

const adminRequired = (req, res, next) => {
  if (req.session.admin && !env.readOnly) {
    next()
  } else {
    res.status(403).json({ error: 'forbidden' })
  }
}

let createDefaultUser = () =>
  new Promise((resolve, reject) => {
    let salt = bcrypt.genSaltSync()
    let password = bcrypt.hashSync('admin', salt)
    let username = 'admin'
    db.model.User.findOrCreate({
      where: { username: 'admin' },
      defaults: { username, password },
    }).then(resolve)
  })

let updateAdminPassword = (pw) => {
  return new Promise((resolve, reject) => {
    createDefaultUser().then(() => {
      let salt = bcrypt.genSaltSync()
      let password = bcrypt.hashSync(pw, salt)
      db.model.User.update(
        { password },
        {
          where: { username: 'admin' },
        }
      ).then(resolve)
    })
  })
}

let sync = () =>
  new Promise((resolve, reject) => {
    createDefaultUser().then(resolve)
  })

expressModule.route('/login').get((req, res) => {
  renderClient(req, res.status(200))
})

expressModule.route('/api/session').get((req, res, next) => {
  let timestamp = +new Date()
  let rando = Math.random()
  let token = `${timestamp}:${rando}`
  if (!req.session.token) {
    req.session.token = token
  }
  let session = JSON.parse(JSON.stringify(req.session))
  if (session.userId) {
    db.model.User.findByPk(session.userId).then((user) => {
      res.json(session)
    })
  } else {
    res.json(session)
  }
})

expressModule.route('/api/login').post((req, res, next) => {
  if (!req.body.username) {
    res.status(400).json({ error: 'username is required' })
    return
  }
  if (!req.body.password) {
    res.status(400).json({ error: 'password is required' })
    return
  }
  db.model.User.findOne({
    where: { username: req.body.username },
  }).then((user) => {
    if (!user) {
      res.status(401).json({})
    } else {
      bcrypt.compare(req.body.password, user.password, function (
        err,
        response
      ) {
        if (err) {
          res.status(401).json(err)
        } else if (response) {
          req.session.userId = user.id
          req.session.authenticated = true
          if (user.id === 1) {
            req.session.admin = true
          }
          let session = JSON.parse(JSON.stringify(req.session))
          res.json(session)
        } else {
          res.status(401).json({})
        }
      })
    }
  })
})

expressModule.route('/api/logout').get(authenticationRequired, (req, res) => {
  req.session.admin = false
  req.session.authenticated = false
  req.session.userId = undefined
  res.json(true)
})

module.exports = {
  adminRequired,
  authenticationRequired,
  updateAdminPassword,
  session: session(sessionConfig),
  expressModule,
  sync,
}
