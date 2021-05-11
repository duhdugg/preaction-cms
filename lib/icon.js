/**
 * @module lib/icon
 * @function
 * @description returns an array of objects that can be used
 * in html to render icons with `<link>` elements
 * @returns {Object[]}
 */

const fs = require('fs')
const path = require('path')
const env = require('./env.js')

const iconPath = path.resolve(__dirname, '../build/icon')

const getIcons = () => {
  const icons = []
  const t = +new Date()
  const dirContents = fs.readdirSync(iconPath)
  if (dirContents.includes('icon.svg')) {
    icons.push({
      href: `${env.root}/icon/icon.svg?t=${t}`,
      type: 'image/svg+xml',
      rel: 'icon',
    })
  }
  if (dirContents.includes('icon.png')) {
    icons.push({
      href: `${env.root}/icon/icon.png?t=${t}`,
      type: 'image/png',
      rel: dirContents.includes('icon.svg') ? 'alternate icon' : 'icon',
    })
  }
  return icons
}

module.exports = { getIcons }
