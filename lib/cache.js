const env = require('./env.js')
const store = {}

const middleware = (req, res, next) => {
  if (!env.cache) {
    next()
    return
  }
  const val = store[req.url]
  if (val) {
    res.type(val.contentType).send(val.contents)
  } else {
    next()
  }
}

const cache = {
  clear: () => {
    for (const key of Object.keys(store)) {
      delete store[key]
    }
  },
  store,
  middleware,
  set: (key, contents, contentType) => {
    store[key] = {
      contents,
      contentType,
    }
  },
}

module.exports = cache
