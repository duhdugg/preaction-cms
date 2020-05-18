const fs = require('fs')
const hasha = require('hasha')

module.exports = (path) => {
  let splitBySlash = path.split('/')
  let splitByDot = path.split('.')
  let dir = splitBySlash.slice(0, -1).join('/')
  let ext = splitByDot[splitByDot.length - 1]
  return new Promise((resolve, reject) => {
    hasha.fromFile(path, { algorithm: 'sha256' }).then((hash) => {
      let newPath = `${dir}/${hash}.${ext}`
      fs.rename(path, newPath, () => {
        resolve(newPath)
      })
    })
  })
}
