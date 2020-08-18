/**
 * @module lib/env
 * @description more sensitive parts of the express application are configured
 * via runtime environment variables
 */
module.exports = {
  /**
   * @type {boolean}
   * @description enables the middleware in cache.js,
   * `true` by default,
   * set with *lack of* environment variable: `PREACTION_DISABLE_CACHE`
   * @example PREACTION_DISABLE_CACHE=1 npm start
   */
  cache: process.env.PREACTION_DISABLE_CACHE ? false : true,
  /**
   * @type {boolean}
   * @description sets the SAMESITE flag on cookies.
   * `secure` is the ideal setting for production deployments,
   * and also requires `cookieSecure` to be `true`.
   * Set with PREACTION_COOKIE_SAMESITE environment variable
   * @see {@link https://web.dev/samesite-cookies-explained/}
   * @example PREACTION_COOKIE_SAMESITE='secure' PREACTION_COOKIE_SECURE=1 npm start
   */
  cookieSameSite: process.env.PREACTION_COOKIE_SAMESITE,
  /**
   * @type {string}
   * @description for signing cookies, defaults to `@preaction/cms`,
   * set with `PREACTION_COOKIE_SECRET` environment variable
   * @example PREACTION_COOKIE_SECRET='Wanda the Fox' npm start
   */
  cookieSecret: process.env.PREACTION_COOKIE_SECRET || '@preaction/cms',
  /**
   * @type {boolean}
   * @description sets the SECURE flag on cookies,
   * `false` by default,
   * set with `PREACTION_COOKIE_SECURE` environment variable
   * @example PREACTION_COOKIE_SECURE=1 npm start
   */
  cookieSecure: process.env.PREACTION_COOKIE_SECURE ? true : false,
  /**
   * @type {boolean}
   * @description enables automatic database backups, defaults to `false`,
   * set with `PREACTION_DB_BACKUP` environment variable
   * @example PREACTION_DB_BACKUP=1 npm start
   */
  dbBackup: process.env.PREACTION_DB_BACKUP ? true : false,
  /**
   * @type {boolean}
   * @description enables sequelize logging to output raw SQL commands,
   * set with `PREACTION_DB_LOGGING` environment variable
   * @example PREACTION_DB_LOGGING=1 npm start
   */
  dbLogging: process.env.PREACTION_DB_LOGGING ? true : false,
  /**
   * type {string}
   * @description set tracking ID to enable Google Analytics
   * @example PREACTION_GOOGLE_ANALYTICS='UA-FOOBAR-1' npm start
   */
  googleAnalytics: process.env.PREACTION_GOOGLE_ANALYTICS || '',
  /**
   * type {string}
   * @description set with `NODE_ENV` environment variable
   * @see {@link https://expressjs.com/en/advanced/best-practice-performance.html#set-node_env-to-production}
   * @example NODE_ENV='production' PREACTION_COOKIE_SAMESITE='secure' PREACTION_COOKIE_SECURE=1 npm start
   */
  nodeEnv: process.env.NODE_ENV,
  /**
   * @type {number}
   * @description the TCP port the express application server should listen on.
   * defaults to `8999`.
   * set with the `PREACTION_PORT` environment variable
   * @example PREACTION_PORT=8080 npm start
   */
  port: process.env.PREACTION_PORT || 8999,
  /**
   * @type {boolean}
   * @description trust the reverse proxy for setting secure cookies.
   * must be `true` if cookieSecure is `true` and
   * running behind a reverse proxy like nginx.
   * Set with the `PREACTION_PROXY` environment variable
   * @example PREACTION_PROXY=1 npm start
   */
  proxy: process.env.PREACTION_PROXY ? true : false,
  /**
   * @type {boolean}
   * @description disables all admin-required middleware
   * so that no edits can be made to the database.
   * Defaults to `false`.
   * Set with the `PREACTION_READONLY` environment variable
   * @example PREACTION_READONLY=1 npm start
   */
  readOnly: process.env.PREACTION_READONLY ? true : false,
  /**
   * @type {string}
   * @description set a path such as '/preaction-cms' to put
   * all routing behind a specific subpath on your nginx reverse proxy.
   * defaults to `''`.
   * Set with the `PREACTION_ROOT` environment variable.
   * @example PREACTION_ROOT='/preaction' npm start
   */
  root: process.env.PREACTION_ROOT || '',
  /**
   * @type {string}
   * @description this sets the name of the session cookie.
   * defaults to `@preaction/cms:session`
   * @example PREACTION_SESSION_COOKIE_NAME='session' npm start
   */
  sessionCookieName:
    process.env.PREACTION_SESSION_COOKIE_NAME || '@preaction/cms:session',
  /**
   * @type {string}
   * @description enables the /sitemap.xml path
   * and configures the procol and domain.
   * Set with the `PREACTION_SITEMAP_HOSTNAME` environment variable.
   * @example PREACTION_SITEMAP_HOSTNAME='http://example.com' npm start
   */
  sitemapHostname: process.env.PREACTION_SITEMAP_HOSTNAME || false,
  /**
   * @type {boolean}
   * @description enables socket.io-enabled features,
   * such as automatic reloading live edits.
   * Defaults to `false`.
   * Set with `PREACTION_SOCKET_MODE` environment variable
   * @example PREACTION_SOCKET_MODE=1 npm start
   */
  socketMode: process.env.PREACTION_SOCKET_MODE ? true : false,
}
