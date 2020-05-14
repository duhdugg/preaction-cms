module.exports = {
  cookieSecure: process.env.PREACTION_COOKIE_SECURE ? true : false,
  cookieSameSite: process.env.PREACTION_COOKIE_SAMESITE,
  dbBackup: process.env.PREACTION_DB_BACKUP ? true : false,
  dbLogging: process.env.PREACTION_DB_LOGGING ? true : false,
  proxy: process.env.PREACTION_PROXY ? true : false,
  readOnly: process.env.PREACTION_READONLY ? true : false,
  socketMode: process.env.PREACTION_SOCKET_MODE ? true : false,
  port: process.env.PREACTION_PORT || 8999,
  root: process.env.PREACTION_ROOT || '',
}