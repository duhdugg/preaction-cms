const fs = require('fs')
const hasha = require('hasha')

module.exports = async (path) => {
  const splitBySlash = path.split('/')
  const splitByDot = path.split('.')
  const dir = splitBySlash.slice(0, -1).join('/')
  const ext = splitByDot[splitByDot.length - 1]
  const hash = await hasha.fromFile(path, { algorithm: 'sha256' })
  const newPath = `${dir}/${hash}.${ext}`
  fs.renameSync(path, newPath)
  return newPath
}
