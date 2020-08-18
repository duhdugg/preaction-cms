/**
 * @module adminRequired
 * @function
 * @description this is an Express middleware function used to protect routes
 * `env.readOnly` must be false and the session must be an authorized admin.
 * Otherwise a 403 forbidden error response will be sent.
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {func} next
 * @see {@link https://expressjs.com/en/guide/using-middleware.html}
 */

const env = require('./env.js')

module.exports = (req, res, next) => {
  if (req.session.admin && !env.readOnly) {
    next()
  } else {
    res.status(403).json({ error: 'forbidden' })
  }
}
