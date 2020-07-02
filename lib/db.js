const adminRequired = require('./adminRequired.js')
const bodyParser = require('body-parser')
const express = require('express')
const cookieParser = require('cookie-parser')
// sequelize is the DAL/ORM of choice for this project
const Sequelize = require('sequelize')
const csrf = require('./csrf.js')
const env = require('./env.js')
const fs = require('fs')
const hasha = require('hasha')
const util = require('util')

const copyFile = util.promisify(fs.copyFile)
const readdir = util.promisify(fs.readdir)
const rename = util.promisify(fs.rename)

// the database is split between 2 locations
// data/auth.sqlite contains login and session info
const sequelizeAuth = new Sequelize(
  env.nodeEnv === 'test' ? 'sqlite::memory:' : 'sqlite://data/auth.sqlite',
  {
    logging: env.dbLogging,
  }
)
// data/db.sqlite contains all other info (pages, settings, content, etc.)
const sequelize = new Sequelize(
  env.nodeEnv === 'test' ? 'sqlite::memory:' : 'sqlite://data/db.sqlite',
  {
    logging: env.dbLogging,
  }
)

// set up the middleware which the main express application
// will use to list and restore db backups
const middleware = express()
middleware.use(cookieParser())
middleware.use(bodyParser.json({ limit: '50mb' }))

// <== SCHEMA ==>

const model = {}

model.User = sequelizeAuth.define('user', {
  username: { type: Sequelize.STRING },
  password: { type: Sequelize.STRING },
})

model.Session = sequelizeAuth.define('session', {
  sid: { type: Sequelize.STRING, primaryKey: true },
  expires: { type: Sequelize.DATE },
  data: { type: Sequelize.TEXT },
})

model.Session.belongsTo(model.User)
model.User.hasMany(model.Session)

model.Settings = sequelize.define('settings', {
  key: { type: Sequelize.STRING },
  value: { type: Sequelize.JSON },
})

// <== EXPRESS MODULE ROUTES ==>

middleware
  .route('/api/backups')
  .get(adminRequired, async (req, res) => {
    const backups = await listBackups()
    res.json(backups)
  })
  .post(adminRequired, csrf.protect, async (req, res) => {
    if (!req.body.filename) {
      res.status(400).json({ error: 'no filename' })
      return
    } else {
      try {
        await restoreBackup(req.body.filename)
        res.json(true)
      } catch (error) {
        res.status(400).json({ error: error.message })
      }
    }
  })

// <== HELPER FUNCTIONS ==>

const sync = async () => {
  const force = false
  await model.User.sync({ force })
  await model.Session.sync({ force })
  await model.Settings.sync({ force })
  return
}

const backup = async () => {
  const debug = (msg) => {
    if (env.nodeEnv !== 'test') {
      console.debug(msg)
    }
  }
  const error = (msg) => {
    if (env.nodeEnv !== 'test') {
      console.error(msg)
    }
  }
  debug('beginning execution of backup function')
  if (env.dbBackup) {
    try {
      debug('getting timestamp')
      const timestamp = new Date().toISOString()
      debug('calculating sha256 hash')
      const hash = await hasha.fromFile('data/db.sqlite', {
        algorithm: 'sha256',
      })
      debug('copying file')
      await copyFile('data/db.sqlite', 'data/backups/latest.sqlite')
      const newFilename = `${timestamp}-${hash}.sqlite`
      await rename('data/backups/latest.sqlite', `data/backups/${newFilename}`)
      debug(`backup saved to data/backups/${newFilename}`)
      const verifiedHash = await hasha.fromFile(`data/backups/${newFilename}`, {
        algorithm: 'sha256',
      })
      debug('verifying hashes', hash, verifiedHash)
      if (hash !== verifiedHash) {
        error('hash mismatch')
      } else {
        debug('hash verified')
      }
    } catch (error) {
      error(`error: ${error.message}`)
    }
  } else {
    debug('backup disabled')
  }
  return
}

const listBackups = async () => {
  let list = await readdir('data/backups')
  list = list.filter((item) => {
    return item.match(/\.sqlite$/) !== null
  })
  list = list.sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))
  return list
}

const restoreBackup = async (filename) => {
  console.debug('checking if file exists')
  const backups = await listBackups()
  if (backups.indexOf(filename) < 0) {
    throw Error('file does not exist')
  }
  console.debug('calculating sha256 hash')
  const hash = await hasha.fromFile(`data/backups/${filename}`, {
    algorithm: 'sha256',
  })
  console.debug('copying file')
  await copyFile(`data/backups/${filename}`, 'data/db.sqlite')
  console.debug('file copied')
  const verifiedHash = await hasha.fromFile('data/db.sqlite', {
    algorithm: 'sha256',
  })
  console.debug('verifying hash', hash, verifiedHash)
  if (hash !== verifiedHash) {
    throw Error('hash mismatch')
  } else {
    console.debug('hash verified')
  }
  console.debug('backup restored')
  return
}

function extendDefaultSessionFields(defaults, session) {
  defaults.userId = session.userId
  return defaults
}

// <== EXPORT ==>

module.exports = {
  backup,
  middleware,
  model,
  sequelize,
  sequelizeAuth,
  sync,
  extendDefaultSessionFields,
}
