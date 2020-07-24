const path = require('path')
module.exports = {
  middleware: (req, res, next) => {
    if (req.get('User-Agent').match(/Trident/)) {
      res.sendFile('trident.html', {
        root: path.resolve(path.join(__dirname, '../build')),
      })
    } else {
      next()
    }
  },
}
