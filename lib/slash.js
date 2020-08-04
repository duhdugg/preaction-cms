module.exports = {
  middleware: (req, res, next) => {
    if (!req.path.match(/\/$/)) {
      const query = req.url.slice(req.path.length)
      res.redirect(302, `${req.path}/${query}`)
      return
    }
    next()
  },
}
