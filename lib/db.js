/** @module lib/db */

const adminRequired = require('./adminRequired.js')
const bodyParser = require('body-parser')
const express = require('express')
const cookieParser = require('cookie-parser')
// sequelize is the DAL/ORM of choice for this project
const Sequelize = require('sequelize')
const cache = require('./cache.js')
const csrf = require('./csrf.js')
const env = require('./env.js')
const fs = require('fs')
const hasha = require('hasha')
const util = require('util')

const copyFile = util.promisify(fs.copyFile)
const readdir = util.promisify(fs.readdir)
const rename = util.promisify(fs.rename)

/**
 * @memberof lib/db
 * @type {sequelize}
 * @see {@link https://sequelize.org/master/class/lib/sequelize.js~Sequelize.html}
 * @description the authorization database at data/auth.sqlite,
 * which houses data for sessions and users
 */
const sequelizeAuth = new Sequelize(
  env.nodeEnv === 'test' ? 'sqlite::memory:' : 'sqlite://data/auth.sqlite',
  {
    logging: env.dbLogging,
  }
)
/**
 * @memberof lib/db
 * @type {sequelize}
 * @see {@link https://sequelize.org/master/class/lib/sequelize.js~Sequelize.html}
 * @description the main database at db/data.sqlite
 */
// data/db.sqlite contains all other info (pages, settings, content, etc.)
const sequelize = new Sequelize(
  env.nodeEnv === 'test' ? 'sqlite::memory:' : 'sqlite://data/db.sqlite',
  {
    logging: env.dbLogging,
  }
)

// set up the middleware which the main express application
// will use to list and restore db backups
/**
 * @memberof lib/db
 * @type {express}
 * @see {@link https://expressjs.com/en/guide/using-middleware.html}
 */
const middleware = express()
middleware.use(cookieParser())
middleware.use(bodyParser.json({ limit: '50mb' }))

// <== SCHEMA ==>

/**
 * @memberof lib/db
 * @type {Object}
 * @description table definitions
 */
const model = {}

/**
 * @memberof lib/db.model
 * @class
 */
model.User = sequelizeAuth.define('user', {
  /**
   * @memberof lib/db.model.User
   * @instance
   * @type {string}
   */
  username: { type: Sequelize.STRING },
  /**
   * @memberof lib/db.model.User
   * @instance
   * @type {string}
   */
  password: { type: Sequelize.STRING },
})

/**
 * @memberof lib/db.model
 * @class
 */
model.Session = sequelizeAuth.define('session', {
  /**
   * @memberof lib/db.model.Session
   * @instance
   * @type {string}
   */
  sid: { type: Sequelize.STRING, primaryKey: true },
  /**
   * @memberof lib/db.model.Session
   * @instance
   * @type {Date}
   */
  expires: { type: Sequelize.DATE },
  /**
   * @memberof lib/db.model.Session
   * @instance
   * @type {string}
   */
  data: { type: Sequelize.TEXT },
})

/**
 * @memberof lib/db.model.Session
 * @name user
 * @type {lib/db.model.User}
 * @instance
 */
model.Session.belongsTo(model.User)

/**
 * @memberof lib/db.model.User
 * @name sessions
 * @type {lib/db.model.Session[]}
 * @instance
 */
model.User.hasMany(model.Session)

/**
 * @memberof lib/db.model
 * @class
 */
model.Settings = sequelize.define('settings', {
  /**
   * @memberof lib/db.model.Settings
   * @type {string}
   */
  key: { type: Sequelize.STRING },
  /**
   * @memberof lib/db.model.Settings
   * @type {Array|boolean|string|null|number|Object}
   */
  value: { type: Sequelize.JSON },
})

// <== EXPRESS MODULE ROUTES ==>

middleware
  .route('/api/backups')
  /**
   * @memberof lib/db.middleware
   * @function GET-api/backups
   * @returns {string[]} list of files in `data/backups` directory with `.sqlite` extension
   */
  .get(adminRequired, async (req, res) => {
    const backups = await listBackups()
    res.json(backups)
  })
  /**
   * @memberof lib/db.middleware
   * @function POST-api/backups
   * @param {express.Request} req
   * @param {Object} req.body JSON body
   * @param {string} req.body.filename the filename of the backup to restore
   * @returns {boolean} true
   */
  .post(adminRequired, csrf.protect, async (req, res) => {
    if (!req.body.filename) {
      res.status(400).json({ error: 'no filename' })
      return
    } else {
      try {
        await restoreBackup(req.body.filename)
        cache.clear()
        res.json(true)
      } catch (error) {
        res.status(400).json({ error: error.message })
      }
    }
  })

// <== HELPER FUNCTIONS ==>

/**
 * @memberof lib/db
 * @function
 * @description synchronizes all the tables in `db.model`
 * @returns {Promise} `undefined`
 */
const sync = async () => {
  const force = false
  await model.User.sync({ force })
  await model.Session.sync({ force })
  await model.Settings.sync({ force })
  return
}

/**
 * @memberof lib/db
 * @function
 * @description attempts to create an automatic backup
 * @returns {Promise} `undefined`
 */
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
  if (!backups.includes(filename)) {
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

/**
 * @memberof lib/db
 * @description needed for `connect-session-sequelize`
 * @param {Object} defaults
 * @param {Object} session
 */
const extendDefaultSessionFields = (defaults, session) => {
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
