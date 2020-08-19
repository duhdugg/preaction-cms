/**
 * @module randomString
 * @function
 * @param {number} length
 * @description uses Math.random for basic random string generation
 * @returns {string}
 */

module.exports = (length) => {
  const possibleChars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' +
    '~!@#$%^&*()-_=+[]{}\\|;:,.<>/?'
  let s = ''
  while (s.length < length) {
    const charIndex = Math.round(Math.random() * possibleChars.length)
    s += possibleChars[charIndex]
  }
  return s
}
