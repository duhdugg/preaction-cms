/**
 * @module lib/processImg
 * @function
 * @description uses jpeg-autorotate to rotate JPEG images based on EXIF data
 * @param {string} path of the file
 * @returns {Promise} `string` new path of file
 */

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
