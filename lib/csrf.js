module.exports = {
  protect: (req, res, next) => {
    let valid = false
    valid = req.session.token && req.session.token === req.query.token
    if (valid) {
      next()
    } else {
      res.status(403).json({ error: 'invalid csrf token' })
    }
  },
}
