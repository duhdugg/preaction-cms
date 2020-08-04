// more sensitive parts of the express application are configured
// via runtime environment variables
module.exports = {
  // cache enables the middleware in cache.js
  cache: process.env.PREACTION_DISABLE_CACHE ? false : true,
  // cookieSecure sets the SECURE flag on cookies
  cookieSecure: process.env.PREACTION_COOKIE_SECURE ? true : false,
  // cookieSameSite sets the SAMESITE flag on cookies
  // see https://web.dev/samesite-cookies-explained/
  // 'secure' is the ideal setting for production deployments
  // 'secure' also requires cookieSecure to be true
  cookieSameSite: process.env.PREACTION_COOKIE_SAMESITE,
  // for signing cookies
  cookieSecret: process.env.PREACTION_COOKIE_SECRET || '@preaction/cms',
  // this will enable automatic backups for the database
  // see db.js:backup for more info
  dbBackup: process.env.PREACTION_DB_BACKUP ? true : false,
  // enables sequelize logging to output raw SQL commands
  dbLogging: process.env.PREACTION_DB_LOGGING ? true : false,
  // trust the reverse proxy for setting secure cookies
  // must be true if cookieSecure is true and
  // running behind a reverse proxy like nginx
  proxy: process.env.PREACTION_PROXY ? true : false,
  // readOnly mode disables all admin-required middleware
  // so that no edits can be made to the database
  readOnly: process.env.PREACTION_READONLY ? true : false,
  // enables socket.io-enabled features
  // such as automatic reloading live edits
  socketMode: process.env.PREACTION_SOCKET_MODE ? true : false,
  // node environment
  nodeEnv: process.env.NODE_ENV,
  // the TCP port the express application server should listen on
  port: process.env.PREACTION_PORT || 8999,
  // set a path such as '/preaction-cms' to put
  // all routing behind a specific subpath on your
  // nginx reverse proxy
  // note: if set, you will need to add a redirect for the /icon subpath
  // to point to the new location
  // in your nginx config
  root: process.env.PREACTION_ROOT || '',
  // enables the /sitemap.xml path and configures the procol and domain
  // example value: http://example.com
  sitemapHostname: process.env.PREACTION_SITEMAP_HOSTNAME || false,
  // this sets the name of the session cookie
  sessionCookieName:
    process.env.PREACTION_SESSION_COOKIE_NAME || '@preaction/cms:session',
}
