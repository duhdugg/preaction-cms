// this is a middleware function used to access-protect routes
// throughout the express application
// env.readOnly must be false and
// the session must be authorized as admin

const env = require('./env.js')

module.exports = (req, res, next) => {
  if (req.session.admin && !env.readOnly) {
    next()
  } else {
    res.status(403).json({ error: 'forbidden' })
  }
}
