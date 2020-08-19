/**
 * @module lib/env
 * @description more sensitive parts of the express application are configured
 * via runtime environment variables
 */

const randomString = require('./randomString.js')

module.exports = {
  /**
   * @type {boolean}
   * @description enables the middleware in cache.js,
   * `true` by default,
   * set with *lack of* environment variable: `CMS_CACHE_DISABLE`
   * @example CMS_CACHE_DISABLE=1 npm start
   */
  cache: process.env.CMS_CACHE_DISABLE ? false : true,
  /**
   * @type {string}
   * @description this sets the name of the session cookie.
   * defaults to `@preaction/cms:session`
   * @example CMS_COOKIE_NAME='session' npm start
   */
  cookieName: process.env.CMS_COOKIE_NAME || '@preaction/cms:session',
  /**
   * @type {boolean}
   * @description trust the reverse proxy (via the "X-Forwarded-Proto" header)
   * for setting secure cookies.
   * must be `true` if cookieSecure is `true` and
   * running behind a reverse proxy like nginx (recommended for production).
   * Set with the `CMS_COOKIE_PROXY` environment variable
   * @see {@link https://github.com/expressjs/session#readme}
   * @example CMS_COOKIE_PROXY=1 npm start
   */
  cookieProxy: process.env.CMS_COOKIE_PROXY ? true : false,
  /**
   * @type {boolean}
   * @description sets the SAMESITE flag on cookies.
   * `secure` is the ideal setting for production deployments,
   * and also requires `cookieSecure` to be `true`.
   * Set with CMS_COOKIE_SAMESITE environment variable
   * @see {@link https://web.dev/samesite-cookies-explained/}
   * @example CMS_COOKIE_SAMESITE='secure' CMS_COOKIE_SECURE=1 npm start
   */
  cookieSameSite: process.env.CMS_COOKIE_SAMESITE,
  /**
   * @type {string}
   * @description for signing cookies, defaults to a randomly generated string
   * which changes every start.
   * set with `CMS_COOKIE_SECRET` environment variable
   * @example CMS_COOKIE_SECRET='Wanda the Fox' npm start
   */
  cookieSecret: process.env.CMS_COOKIE_SECRET || randomString(24),
  /**
   * @type {boolean}
   * @description sets the SECURE flag on cookies,
   * `false` by default,
   * set with `CMS_COOKIE_SECURE` environment variable
   * @example CMS_COOKIE_SECURE=1 npm start
   */
  cookieSecure: process.env.CMS_COOKIE_SECURE ? true : false,
  /**
   * @type {boolean}
   * @description enables automatic database backups, defaults to `false`,
   * set with `CMS_DB_BACKUP` environment variable
   * @example CMS_DB_BACKUP=1 npm start
   */
  dbBackup: process.env.CMS_DB_BACKUP ? true : false,
  /**
   * @type {boolean}
   * @description enables sequelize logging to output raw SQL commands,
   * set with `CMS_DB_LOGGING` environment variable
   * @example CMS_DB_LOGGING=1 npm start
   */
  dbLogging: process.env.CMS_DB_LOGGING ? true : false,
  /**
   * type {string}
   * @description set tracking ID to enable Google Analytics
   * @example CMS_GOOGLE_ANALYTICS='UA-FOOBAR-1' npm start
   */
  googleAnalytics: process.env.CMS_GOOGLE_ANALYTICS || '',
  /**
   * type {string}
   * @description set with `NODE_ENV` environment variable
   * @see {@link https://expressjs.com/en/advanced/best-practice-performance.html#set-node_env-to-production}
   * @example NODE_ENV='production' CMS_COOKIE_SAMESITE='secure' CMS_COOKIE_SECURE=1 npm start
   */
  nodeEnv: process.env.NODE_ENV,
  /**
   * @type {number}
   * @description the TCP port the express application server should listen on.
   * defaults to `8999`.
   * set with the `CMS_PORT` environment variable
   * @example CMS_PORT=8080 npm start
   */
  port: process.env.CMS_PORT || 8999,
  /**
   * @type {boolean}
   * @description disables all admin-required middleware
   * so that no edits can be made to the database.
   * Defaults to `false`.
   * Set with the `CMS_READONLY` environment variable
   * @example CMS_READONLY=1 npm start
   */
  readOnly: process.env.CMS_READONLY ? true : false,
  /**
   * @type {string}
   * @description set a path such as '/preaction-cms' to put
   * all routing behind a specific subpath on your nginx reverse proxy.
   * defaults to `''`.
   * Set with the `CMS_ROOT` environment variable.
   * @example CMS_ROOT='/preaction' npm start
   */
  root: process.env.CMS_ROOT || '',
  /**
   * @type {string}
   * @description enables the /sitemap.xml path
   * and configures the protocol and domain.
   * Set with the `CMS_SITEMAP_HOSTNAME` environment variable.
   * @example CMS_SITEMAP_HOSTNAME='https://example.com' npm start
   */
  sitemapHostname: process.env.CMS_SITEMAP_HOSTNAME || false,
  /**
   * @type {boolean}
   * @description enables socket.io-enabled features,
   * such as automatic reloading live edits.
   * Defaults to `false`.
   * Set with `CMS_SOCKET_MODE` environment variable
   * @example CMS_SOCKET_MODE=1 npm start
   */
  socketMode: process.env.CMS_SOCKET_MODE ? true : false,
}

if (module.exports.nodeEnv !== 'test') {
  console.debug('Preaction CMS environment variables =', module.exports)
}
