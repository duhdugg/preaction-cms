const db = require('../lib/db.js')

db.model.Session.destroy({ where: {} }).then(() => {
  console.debug('done')
})
