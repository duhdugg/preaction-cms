import hexRgb from 'hex-rgb'

function getRgbaString(hexRgbObject) {
  let { red, green, blue, alpha } = hexRgbObject
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

function getRgba(color, opacity) {
  let rgba = hexRgb(color)
  rgba.alpha = opacity
  rgba.string = getRgbaString(rgba)
  return rgba
}

function getRgbaFromSettings(settings, key) {
  let colorKey = `${key}Color`
  let opacityKey = `${key}Opacity`
  return getRgba(settings[colorKey], settings[opacityKey])
}

export { getRgba, getRgbaFromSettings, getRgbaString }
