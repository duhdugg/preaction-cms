const fs = require('fs')
const hasha = require('hasha')
const process = require('process')
const util = require('util')

const copyFile = util.promisify(fs.copyFile)
const rename = util.promisify(fs.rename)

const backup = async () => {
  console.debug('beginning execution of backup function')
  try {
    console.debug('getting timestamp')
    let timestamp = new Date().toISOString()
    console.debug('calculating sha256 hash')
    let hash = await hasha.fromFile('data/db.sqlite', {
      algorithm: 'sha256',
    })
    console.debug('copying file')
    await copyFile('data/db.sqlite', 'data/backups/latest.sqlite')
    let newFilename = `${timestamp}-${hash}.sqlite`
    await rename('data/backups/latest.sqlite', `data/backups/${newFilename}`)
    console.debug(`backup saved to data/backups/${newFilename}`)
    let verifiedHash = await hasha.fromFile(`data/backups/${newFilename}`, {
      algorithm: 'sha256',
    })
    console.debug('verifying hashes', hash, verifiedHash)
    if (hash !== verifiedHash) {
      console.error('hash mismatch')
    } else {
      console.debug('hash verified')
    }
  } catch (error) {
    console.error(`error: ${error.message}`)
  }
  return
}

backup().then(() => {
  console.debug('done')
  process.exit()
})
