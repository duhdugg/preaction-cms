const Sequelize = require('sequelize')
// TODO: ensure fs read/write abilities
// TODO: secondary db with configurable URI
// TOOD: configurable logging
const sequelize = new Sequelize('sqlite://data/db.sqlite')

let model = {}

model.User = sequelize.define('user', {
  username: { type: Sequelize.STRING },
  password: { type: Sequelize.STRING }
})

model.Session = sequelize.define('session', {
  sid: { type: Sequelize.STRING, primaryKey: true },
  expires: { type: Sequelize.DATE },
  data: { type: Sequelize.TEXT }
})

model.Session.belongsTo(model.User)
model.User.hasMany(model.Session)

model.Settings = sequelize.define('settings', {
  key: { type: Sequelize.STRING },
  value: { type: Sequelize.JSON }
})

// TODO: database migrations for future releases
let syncAllTables = new Promise((resolve, reject) => {
  let numberOfTables = Object.keys(model).length
  let tableSync = 0
  for (let key of Object.keys(model)) {
    model[key].sync({ force: false }).then(() => {
      tableSync++
      if (tableSync === numberOfTables) {
        resolve()
      }
    })
  }
})

let createDefaultSettings = () => {
  return new Promise((resolve, reject) => {
    model.Settings.sync({ force: false }).then(() => {
      model.Settings.findOne({
        where: { key: 'init' }
      }).then(setting => {
        if (!setting) {
          let bgColorCreated = model.Settings.create({
            key: 'bgColor',
            value: '#ffffff'
          })
          let fontColorCreated = model.Settings.create({
            key: 'fontColor',
            value: '#000000'
          })
          let linkColorCreated = model.Settings.create({
            key: 'linkColor',
            value: '#0000ff'
          })
          let containerColorCreated = model.Settings.create({
            key: 'containerColor',
            value: '#000000'
          })
          let containerOpacityCreated = model.Settings.create({
            key: 'containerOpacity',
            value: '0.15'
          })
          let siteTitleCreated = model.Settings.create({
            key: 'siteTitle',
            value: 'Preaction CMS'
          })
          let navAlignmentCreated = model.Settings.create({
            key: 'navAlignment',
            value: 'left'
          })
          let navCollapsibleCreated = model.Settings.create({
            key: 'navCollapsible',
            value: true
          })
          let navPositionCreated = model.Settings.create({
            key: 'navPosition',
            value: 'fixed-top'
          })
          let navSpacingCreated = model.Settings.create({
            key: 'navSpacing',
            value: 'normal'
          })
          let navThemeCreated = model.Settings.create({
            key: 'navTheme',
            value: 'dark'
          })
          let navTypeCreated = model.Settings.create({
            key: 'navType',
            value: 'basic'
          })
          let useBgImageCreated = model.Settings.create({
            key: 'useBgImage',
            value: false
          })
          let initCreated = model.Settings.create({
            key: 'init',
            value: true
          })
          Promise.all([
            bgColorCreated,
            fontColorCreated,
            linkColorCreated,
            containerColorCreated,
            containerOpacityCreated,
            siteTitleCreated,
            navPositionCreated,
            navThemeCreated,
            navTypeCreated,
            navAlignmentCreated,
            navSpacingCreated,
            navCollapsibleCreated,
            useBgImageCreated,
            initCreated
          ]).then(resolve)
        } else {
          resolve()
        }
      })
    })
  })
}

let sync = new Promise((resolve, reject) => {
  syncAllTables.then(createDefaultSettings().then(resolve))
})

function extendDefaultSessionFields (defaults, session) {
  defaults.userId = session.userId
  return defaults
}

module.exports = {
  model,
  sequelize,
  sync,
  extendDefaultSessionFields
}
