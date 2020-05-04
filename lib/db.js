// sequelize is the DAL/ORM of choice for this project
const Sequelize = require('sequelize')
const env = require('./env.js')
const fs = require('fs')
const hasha = require('hasha')
const util = require('util')

const copyFile = util.promisify(fs.copyFile)
const rename = util.promisify(fs.rename)

const sequelize = new Sequelize('sqlite://data/db.sqlite', {
  logging: env.dbLogging,
})
const sequelizeAuth = new Sequelize('sqlite://data/auth.sqlite', {
  logging: env.dbLogging,
})

// <== SCHEMA ==>

let model = {}

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

// <== HELPER FUNCTIONS ==>

let sync = () =>
  new Promise((resolve, reject) => {
    let force = false
    model.User.sync({ force })
      .then(model.Session.sync({ force }))
      .then(model.Settings.sync({ force }))
      .then(resolve)
  })

const backup = async () => {
  console.debug('beginning execution of backup function')
  if (env.dbBackup) {
    try {
      console.debug('getting timestamp')
      let timestamp = new Date().toISOString()
      console.debug('calculating sha256 hash')
      let hash = await hasha.fromFile('data/db.sqlite', {
        algorithm: 'sha256',
      })
      console.debug('copying file')
      await copyFile('data/db.sqlite', 'data/backups/latest.sqlite')
      let newFilename = `${timestamp}-${hash}.sqlite`
      await rename('data/backups/latest.sqlite', `data/backups/${newFilename}`)
      console.debug(`backup saved to data/backups/${newFilename}`)
      let verifiedHash = await hasha.fromFile(`data/backups/${newFilename}`, {
        algorithm: 'sha256',
      })
      console.debug(hash, verifiedHash)
      if (hash !== verifiedHash) {
        console.error('hash mismatch')
      } else {
        console.debug('hash verified')
      }
    } catch (error) {
      console.error(`error: ${error.message}`)
    }
  } else {
    console.debug('backup disabled')
  }
  return
}

function extendDefaultSessionFields(defaults, session) {
  defaults.userId = session.userId
  return defaults
}

// <== EXPORT ==>

module.exports = {
  backup,
  model,
  sequelize,
  sequelizeAuth,
  sync,
  extendDefaultSessionFields,
}
