const db = require('../lib/db.js')
const pages = require('../lib/pages.js')
const pkg = require('../package.json')
const settings = require('../lib/settings.js')

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
    console.log('upgrade-db', { dbVersion: dbMeta.value.version })
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
      // rename jumbo to hero
      if (page.key === 'jumbo') {
        page.key = 'hero'
      }
      page.settings = Object.assign({}, page.settings, {
        // rename jumbo settings to hero settings
        heroPath: page.settings.jumboPath
          ? page.settings.jumboPath.replace('/jumbo', '/hero')
          : undefined,
        heroPosition: page.settings.jumboPosition,
        heroTheme: page.settings.jumboTheme,
        maxWidthHeroContainer: page.settings.maxWidthJumboContainer,
        showHero: page.settings.showJumbo,
      })
      // remove jumbo settings
      delete page.settings.jumboPath
      delete page.settings.jumboPosition
      delete page.settings.jumboTheme
      delete page.settings.maxWidthJumboContainer
      delete page.settings.showJumbo
      page.settings = Object.assign({}, page.settings)
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
    // create new settings
    const allSettings = await settings.getSettings()
    const newSetting = async (key, value) => {
      const [setting] = await db.model.Settings.findOrCreate({
        where: { key },
        defaults: { value },
      })
      setting.value = value
      console.log('upgrade-db', 'setting value', key, value)
      return await setting.save()
    }
    await newSetting(
      'heroPath',
      allSettings.jumboPath || settings.defaultSettings.heroPath
    )
    await newSetting(
      'heroTheme',
      allSettings.jumboTheme || settings.defaultSettings.heroTheme
    )
    await newSetting(
      'heroGradient',
      allSettings.jumboGradient || settings.defaultSettings.heroGradient
    )
    await newSetting(
      'heroPosition',
      allSettings.jumboPosition || settings.defaultSettings.heroPosition
    )
    await newSetting(
      'maxWidthHeroContainer',
      allSettings.maxWidthJumboContainer ||
        settings.defaultSettings.maxWidthHeroContainer
    )
    // delete retired settings
    console.log('deleting retired settings')
    await db.model.Settings.destroy({
      where: {
        key: [
          'jumboPath',
          'jumboTheme',
          'jumboGradient',
          'jumboPosition',
          'showJumbo',
          'maxWidthHeroContainer',
        ],
      },
    })
    await updateMetaVersion()
  }
})
