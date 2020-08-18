/**
 * @module ext
 * @description This module will look in the `ext` directory for directories
 * containing an `index.js` file which exports a named `middleware` function.
 * Once found, it will push each of these functions to the end of the
 * middleware `Array`. This will allow extension middleware to override most
 * of the default routes.
 */

const fs = require('fs')
const path = require('path')

const extensionPath = path.resolve(path.join(__dirname, '..', 'ext'))
const contents = fs.readdirSync(extensionPath)
contents.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))

/**
 * @memberof ext
 * @type {func[]}
 * @see {@link https://expressjs.com/en/guide/using-middleware.html}
 */
const middleware = [
  (req, res, next) => {
    next()
  },
]

let extLoaded = false

for (const filename of contents) {
  const filepath = path.join(extensionPath, filename)
  if (fs.statSync(filepath).isDirectory()) {
    const extensionContents = fs.readdirSync(filepath)
    if (extensionContents.includes('index.js')) {
      try {
        const extensionPath = path.join(filepath, 'index.js')
        const extension = require(extensionPath)
        if (
          extension.middleware &&
          typeof extension.middleware === 'function'
        ) {
          middleware.push(extension.middleware)
          console.debug('loaded extension', extensionPath)
          extLoaded = true
        }
      } catch (e) {
        console.error(e)
      }
    }
  }
}

if (!extLoaded) {
  console.log('no extension middleware loaded')
}

module.exports = {
  middleware,
}
