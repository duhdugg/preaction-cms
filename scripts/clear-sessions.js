const db = require('../lib/db.js')

const run = async () => {
  await db.model.Session.destroy({ where: {} })
  console.debug('sessions cleared')
}
run()
