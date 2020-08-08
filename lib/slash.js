const env = require('./env.js')
// this handles non-trailing slash redirects
module.exports = {
  middleware: (req, res, next) => {
    if (!req.path.match(/\/$/)) {
      // do not redirect api calls
      if (!req.path.match(new RegExp(`^${env.root}/api/`))) {
        const query = req.url.slice(req.path.length)
        res.redirect(302, `${req.path}/${query}`)
        return
      }
    }
    next()
  },
}
