const env = require('./env.js')

module.exports = {
  protect: (req, res, next) => {
    const valid = req.session.token && req.session.token === req.query.token
    if (valid && !env.readOnly) {
      next()
    } else {
      res.status(403).json({ error: 'invalid csrf token' })
    }
  },
}
