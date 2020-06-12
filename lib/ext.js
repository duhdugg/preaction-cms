const fs = require('fs')
const path = require('path')

const extensionPath = path.resolve(path.join(__dirname, '..', 'ext'))
const contents = fs.readdirSync(extensionPath)
contents.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))

const middleware = [
  (req, res, next) => {
    next()
  },
]

for (let filename of contents) {
  const filepath = path.join(extensionPath, filename)
  if (fs.statSync(filepath).isDirectory()) {
    const extensionContents = fs.readdirSync(filepath)
    if (extensionContents.includes('index.js')) {
      try {
        let extensionPath = path.join(filepath, 'index.js')
        let extension = require(extensionPath)
        if (
          extension.middleware &&
          typeof extension.middleware === 'function'
        ) {
          middleware.push(extension.middleware)
          console.debug('loaded extension', extensionPath)
        }
      } catch (e) {}
    }
  }
}

module.exports = {
  middleware,
}
