const fs = require('fs')
const hasha = require('hasha')
const process = require('process')

const backup = async () => {
  console.debug('beginning execution of backup function')
  try {
    console.debug('getting timestamp')
    const timestamp = new Date().toISOString()
    console.debug('calculating sha256 hash')
    const hash = await hasha.fromFile('data/db.sqlite', {
      algorithm: 'sha256',
    })
    console.debug('copying file')
    fs.copyFileSync('data/db.sqlite', 'data/backups/latest.sqlite')
    const newFilename = `${timestamp}-${hash}.sqlite`
    fs.renameSync('data/backups/latest.sqlite', `data/backups/${newFilename}`)
    console.debug(`backup saved to data/backups/${newFilename}`)
    const verifiedHash = await hasha.fromFile(`data/backups/${newFilename}`, {
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

const run = async () => {
  await backup()
  console.debug('done')
  process.exit()
}
run()
