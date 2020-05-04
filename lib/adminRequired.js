const env = require('./env.js')

module.exports = (req, res, next) => {
  if (req.session.admin && !env.readOnly) {
    next()
  } else {
    res.status(403).json({ error: 'forbidden' })
  }
}
