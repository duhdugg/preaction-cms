/**
 * @module lib/ua
 */

const path = require('path')

module.exports = {
  /**
   * @memberof lib/ua
   * @function
   * @param {express.Request} req
   * @param {express.Response} res
   * @param {func} next
   * @description looks for Trident in User-Agent header
   * @returns {string} text/html for those pesky IE users
   * @see {@link https://expressjs.com/en/guide/using-middleware.html}
   */
  middleware: (req, res, next) => {
    const ua = req.get('User-Agent')
    if (ua && ua.match(/Trident/)) {
      res.sendFile('trident.html', {
        root: path.resolve(path.join(__dirname, '../build')),
      })
    } else {
      next()
    }
  },
}
