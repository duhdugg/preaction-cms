const fs = require('fs')
const path = require('path')

const iconPath = path.resolve(__dirname, '../build/icon')

const getIcons = () => {
  const icons = []
  const t = +new Date()
  const dirContents = fs.readdirSync(iconPath)
  if (dirContents.includes('icon.svg')) {
    icons.push({
      href: `icon/icon.svg?t=${t}`,
      type: 'image/svg+xml',
      rel: 'icon',
    })
  }
  if (dirContents.includes('icon.png')) {
    icons.push({
      href: `icon/icon.png?t=${t}`,
      type: 'image/png',
      rel: dirContents.includes('icon.svg') ? 'alternate icon' : 'icon',
    })
  }
  return icons
}

module.exports = { getIcons }
