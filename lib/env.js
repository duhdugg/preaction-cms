module.exports = {
  dbLogging: process.env.PREACTION_NO_DB_LOGGING ? false : true,
  port: process.env.PREACTION_PORT || 8999,
  root: process.env.PREACTION_ROOT || ''
}
