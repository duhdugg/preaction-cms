const fs = require('fs')
const path = require('path')

const styleDirContents = fs.readdirSync(path.join(__dirname, '../src/style'))

if (!styleDirContents.includes('index.js')) {
  fs.copyFileSync(
    path.join(__dirname, '../src/style/index.template.js'),
    path.join(__dirname, '../src/style/index.js')
  )
}
console.log('CSS imports are defined in src/style/index.js')
console.log('-------------------------------\n')
console.log(
  fs.readFileSync(path.join(__dirname, '../src/style/index.js'), 'utf8')
)
console.log('-------------------------------\n')
console.log('To customize styling, modify this file and rebuild.')
