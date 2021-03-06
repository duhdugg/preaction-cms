/**
 * @module lib/slash
 */
const env = require('./env.js')
module.exports = {
  /**
   * @memberof lib/slash
   * @function
   * @param {express.Request} req
   * @param {express.Response} res
   * @param {func} next
   * @description handles non-trailing slash redirects
   * @see {@link https://expressjs.com/en/guide/using-middleware.html}
   */
  middleware: (req, res, next) => {
    if (!req.path.match(/\/$/)) {
      // do not redirect api calls
      if (!req.path.match(new RegExp(`^${env.root}/api/`))) {
        const query = req.url.slice(req.path.length)
        res.redirect(302, `${env.root}${req.path}/${query}`)
        return
      }
    }
    next()
  },
}
