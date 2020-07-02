// uses jpeg-autorotate to rotate JPEG images based on EXIF data
// returns a promise

const fs = require('fs')
const jo = require('jpeg-autorotate')
const renameUpload = require('./renameUpload.js')

module.exports = async (path) => {
  const newPath = await renameUpload(path)
  try {
    const { buffer } = await jo.rotate(path, { quality: 80 })
    fs.writeFileSync(newPath, buffer)
  } catch (error) {}
  return newPath
}
