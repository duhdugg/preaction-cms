/** @module lib/cache */

const env = require('./env.js')
const store = {}

module.exports = {
  /**
   * @description this clears all items in the store
   */
  clear: () => {
    for (const key of Object.keys(store)) {
      delete store[key]
    }
  },
  /**
   * @description this is the Express middleware used on cached routes
   * @param {express.Request} req
   * @param {express.Response} res
   * @param {func} next
   * @see {@link https://expressjs.com/en/guide/using-middleware.html}
   */
  middleware: (req, res, next) => {
    if (!env.cache) {
      next()
      return
    }
    const val = store[req.path]
    if (val) {
      res.type(val.contentType).send(val.contents)
    } else {
      next()
    }
  },
  /**
   * @param {string} key
   * @param {string} contents
   * @param {string} contentType
   * */
  set: (key, contents, contentType) => {
    store[key] = { contents, contentType }
  },
  /**
   * @property {string} contents
   * @property {string} contentType
   */
  store,
}
