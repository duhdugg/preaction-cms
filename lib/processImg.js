/**
 * @module lib/processImg
 * @function
 * @description uses jpeg-autorotate to rotate JPEG images based on EXIF data before using exiftool to remove EXIF data
 * @param {string} path of the file
 * @returns {Promise} `string` new path of file
 */

const child_process = require('child_process')
const env = require('../lib/env.js')
const fs = require('fs')
const jo = require('jpeg-autorotate')
const renameUpload = require('./renameUpload.js')
const path = require('path')

module.exports = async (filepath) => {
  const newPath = await renameUpload(filepath)
  try {
    const { buffer } = await jo.rotate(filepath, { quality: 80 })
    fs.writeFileSync(newPath, buffer)
  } catch (error) {}
  if (env.removeExif) {
    child_process.spawnSync(path.join(__dirname, '../scripts/remove-exif.sh'), [
      newPath,
    ])
  }
  return newPath
}
