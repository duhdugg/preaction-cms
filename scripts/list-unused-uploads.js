const fs = require('fs')
const path = require('path')
const listUploads = require('./list-uploads.js')

const ignore = ['.gitignore']

const listUnusedUploads = async () => {
  const uploads = fs.readdirSync(path.join(__dirname, '../uploads'))
  const usedUploads = await listUploads()
  const unused = []
  for (let filename of uploads) {
    if (ignore.includes(filename)) {
      continue
    }
    if (!usedUploads.includes(filename)) {
      unused.push(filename)
    }
  }
  return unused
}

if (require.main === module) {
  listUnusedUploads().then((files) => {
    for (let filename of files) {
      console.log(`uploads/${filename}`)
    }
  })
}
