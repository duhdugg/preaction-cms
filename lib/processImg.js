// uses jpeg-autorotate to rotate JPEG images based on EXIF data
// returns a promise

const fs = require('fs')
const jo = require('jpeg-autorotate')
const renameUpload = require('./renameUpload.js')

module.exports = (path) => {
  return new Promise((resolve, reject) => {
    renameUpload(path).then((newPath) => {
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
}
