// sequelize is the DAL/ORM of choice for this project
const Sequelize = require('sequelize')
const env = require('./env.js')
// TODO: ensure fs read/write abilities
// TODO: configurable db URI
const sequelize = new Sequelize('sqlite://data/db.sqlite', {
  logging: env.dbLogging,
})

// <== SCHEMA ==>

let model = {}

model.User = sequelize.define('user', {
  username: { type: Sequelize.STRING },
  password: { type: Sequelize.STRING },
})

model.Session = sequelize.define('session', {
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

function extendDefaultSessionFields(defaults, session) {
  defaults.userId = session.userId
  return defaults
}

// <== EXPORT ==>

module.exports = {
  model,
  sequelize,
  sync,
  extendDefaultSessionFields,
}
