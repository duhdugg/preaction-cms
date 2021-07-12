const fs = require('fs')
const path = require('path')

const styleDirContents = fs.readdirSync(path.join(__dirname, '../src/style'))

if (!styleDirContents.includes('custom.js')) {
  fs.copyFileSync(
    path.join(__dirname, '../src/style/custom.template.js'),
    path.join(__dirname, '../src/style/custom.js')
  )
}
console.log('custom CSS imports are defined in src/style/custom.js')
console.log('To customize styling, modify this file and rebuild.')
console.log('---------------------------------------------------')
console.log(
  fs.readFileSync(path.join(__dirname, '../src/style/custom.js'), 'utf8')
)
console.log('---------------------------------------------------\n')

const extDirContents = fs.readdirSync(path.join(__dirname, '../src/ext'))

if (!extDirContents.includes('index.js')) {
  fs.copyFileSync(
    path.join(__dirname, '../src/ext/index.template.js'),
    path.join(__dirname, '../src/ext/index.js')
  )
}
console.log('Client-side extensions are defined in src/ext/index.js')
console.log('To use other block types or menu extensions,')
console.log('modify this file and rebuild.')
console.log('-------------------------------------------------------')
console.log(
  fs.readFileSync(path.join(__dirname, '../src/ext/index.js'), 'utf8')
)
console.log('-------------------------------------------------------\n')
