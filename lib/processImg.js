// uses jpeg-autorotate to rotate JPEG images based on EXIF data
// returns a promise
// TODO: hash the filename

const fs = require('fs')
const jo = require('jpeg-autorotate')

module.exports = path => {
  return new Promise((resolve, reject) => {
    jo.rotate(
      path,
      { quality: 80 },
      (error, buffer, orientation, dimensions) => {
        if (error) {
          reject(error)
        } else {
          fs.writeFile(path, buffer, resolve)
        }
      }
    )
  })
}
