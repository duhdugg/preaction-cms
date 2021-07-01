const db = require('../lib/db.js')
const pages = require('../lib/pages.js')
const pkg = require('../package.json')

db.sync().then(async () => {
  const allMeta = await db.model.Meta.findAll()
  let dbMeta
  for (const meta of allMeta) {
    if (meta.key === 'db') {
      dbMeta = meta
      break
    }
  }
  if (dbMeta === undefined) {
    dbMeta = await db.model.Meta.create({
      key: 'db',
      value: { version: '4.99' },
    })
    console.debug('upgrade-db', { dbVersion: dbMeta.value.version })
  }
  await db.model.User.findAll()
  await db.model.Session.findAll()
  const allPages = await pages.model.Page.findAll()
  const updateMetaVersion = async () => {
    dbMeta.value = { version: pkg.version }
    await dbMeta.save()
    console.log('upgrade-db', { upgradedTo: dbMeta.value.version })
    return
  }
  if (dbMeta.value.version < '5.0') {
    for (const page of allPages) {
      page.settings = Object.assign({}, page.settings, {
        // rename jumbo to hero
        heroPath: (page.settings.jumboPath || '').replace('/jumbo', '/hero'),
        heroPosition: page.settings.jumboPosition,
        heroTheme: page.settings.jumboTheme,
        maxWidthHeroContainer: page.settings.maxWidthJumboContainer,
        showHero: page.settings.showJumbo,
        // new settings
        bodyGradient: false,
        headerGradient: false,
        heroGradient: false,
        mainGradient: false,
        footerGradient: false,
      })
      console.log('upgrade-db', `updating page id ${page.id}`)
      await page.save()
    }
    const allPageBlocks = await pages.model.PageBlock.findAll()
    for (const pageBlock of allPageBlocks) {
      pageBlock.settings = Object.assign({}, pageBlock.settings, {
        customClassName: '',
        headerGradient: false,
        bodyGradient: false,
        // default xxlWidth to current lgWidth to preserve existing layout
        xxlWidth: pageBlock.settings.lgWidth,
      })
      console.log('upgrade-db', `updating pageBlock id ${pageBlock.id}`)
      await pageBlock.save()
    }
    const allContents = await pages.model.PageBlockContent.findAll()
    for (const content of allContents) {
      content.settings = Object.assign({}, content.settings, {
        customClassName: '',
        headerGradient: false,
        bodyGradient: false,
        // default xxlWidth to current lgWidth to preserve existing layout
        xxlWidth: content.settings.lgWidth,
      })
      console.log('upgrade-db', `updating content id ${content.id}`)
      await content.save()
    }
    await updateMetaVersion()
  }
})
