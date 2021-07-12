/** @module lib/warm */

const supertest = require('supertest')
const env = require('./env.js')
const randomString = require('./randomString.js')

const state = {
  key: null,
}

let serverHttp = null
let pages = null

const warmRequest = async (path) => {
  if (serverHttp) {
    const client = supertest(serverHttp)
    if (env.nodeEnv !== 'test') {
      return await client.get(path)
    }
  }
  return
}

const getPageRows = async () => {
  if (pages && env.nodeEnv !== 'test') {
    return await pages.model.Page.findAll({
      where: { userCreated: true },
    })
  }
  return [{}]
}

const getPagePath = async (page) => {
  if (pages && env.nodeEnv !== 'test') {
    return await pages.getPagePath(page)
  }
  return ''
}

module.exports = {
  /**
   * @description sets the `lib/pages` module. circular dependencies workaround
   * @param {module} mod
   * @default require('lib/pages')
   * */
  setPageModule: (mod) => {
    pages = mod
  },
  /**
   * @description sets the `http.Server` instance to be used by supertest. circular dependencies workaround
   * @param {http.Server} http
   * */
  setServerHttp: (http) => {
    serverHttp = http
  },
  /**
   * @description state object of module containing a `key` attribute updated on each call to upCache
   */
  state,
  /**
   * @description warms up the cache
   * @returns {Promise} `undefined`
   */
  upCache: async () => {
    if (env.cache) {
      state.key = randomString(24)
      const key = state.key
      const paths = [
        '/',
        '/login',
        '/login/',
        '/api/settings',
        '/api/page/by-key/home/',
        '/api/page/by-key/home/header/',
        '/api/page/by-key/home/footer/',
        '/api/page/by-key/home/hero/',
        '/api/page/settings/by-key/home/',
        '/api/page/sitemap/by-key/home/',
      ]
      for (const path of paths) {
        await warmRequest(path)
        if (key !== state.key) {
          return
        }
      }
      const pageRows = await getPageRows()
      for (const page of pageRows) {
        const pagePath = await getPagePath(page)
        const paths = [
          `/${pagePath}/`,
          `/api/page/by-key/${pagePath}/`,
          `/api/page/by-key/${pagePath}/header/`,
          `/api/page/by-key/${pagePath}/footer/`,
          `/api/page/by-key/${pagePath}/hero/`,
          `/api/page/settings/by-key/${pagePath}/`,
          `/api/page/sitemap/by-key/${pagePath}/`,
        ]
        for (const path of paths) {
          await warmRequest(path)
          if (key !== state.key) {
            return
          }
        }
      }
    }
  },
  /**
   * @description warms the cache for a specified path
   * @returns {Promise} `undefined`
   */
  warmRequest,
}
