module.exports = {
  dbLogging: process.env.PREACTION_DB_LOGGING ? true : false,
  port: process.env.PREACTION_PORT || 8999,
  root: process.env.PREACTION_ROOT || ''
}
