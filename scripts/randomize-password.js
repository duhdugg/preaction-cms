let updateAdminPassword = require('../lib/session.js').updateAdminPassword

const randomString = (length) => {
  const possibleChars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' +
    '~!@#$%^&*()-_=+[]{}\\|;:,.<>/?'
  let s = ''
  while (s.length < length) {
    let charIndex = Math.round(Math.random() * possibleChars.length)
    s += possibleChars[charIndex]
  }
  return s
}

const unhashedPw = randomString(24)

updateAdminPassword(unhashedPw).then(() => {
  console.log('--- password set! ---')
  console.log('password:', unhashedPw)
  console.log('see README.md to change')
  console.log('---')
})
