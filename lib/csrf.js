/** @module */

const env = require('./env.js')

module.exports = {
  /**
   * @function
   * @description CSRF protection middleware
   * @param {Express.Request} req
   * @param {Express.Response} res
   * @param {func} next
   * @see {@link https://expressjs.com/en/guide/using-middleware.html}
   */
  protect: (req, res, next) => {
    const valid = req.session.token && req.session.token === req.query.token
    if (valid && !env.readOnly) {
      next()
    } else {
      res.status(403).json({ error: 'invalid csrf token' })
    }
  },
}
