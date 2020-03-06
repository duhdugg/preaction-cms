// uses jpeg-autorotate to rotate JPEG images based on EXIF data
// returns a promise
// TODO: hash the filename

const fs = require('fs')
const jo = require('jpeg-autorotate')
const hasha = require('hasha')

module.exports = path => {
  let splitBySlash = path.split('/')
  let splitByDot = path.split('.')
  let dir = splitBySlash.slice(0, -1).join('/')
  let ext = splitByDot[splitByDot.length - 1]
  return new Promise((resolve, reject) => {
    hasha.fromFile(path, { algorithm: 'sha256' }).then(hash => {
      let newPath = `${dir}/${hash}.${ext}`
      fs.rename(path, newPath, () => {
        jo.rotate(
          path,
          { quality: 80 },
          (error, buffer, orientation, dimensions) => {
            if (error) {
              resolve(newPath)
            } else {
              fs.writeFile(newPath, buffer, () => {
                resolve(newPath)
              })
            }
          }
        )
      })
    })
  })
}
