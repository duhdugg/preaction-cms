#!/usr/bin/env node

const { Op } = require('sequelize')
const pages = require('../lib/pages.js')

if (process.argv.length < 3) {
  console.error('no query specified')
  process.exit(1)
}

const queryInput = process.argv[2]

pages.model.PageBlockContent.findAll({
  where: {
    wysiwyg: { [Op.like]: `%${queryInput}%` },
  },
}).then((contents) => {
  for (const content of contents) {
    pages.model.PageBlock.findByPk(content.pageblockId).then((block) => {
      if (block) {
        pages.model.Page.findByPk(block.pageId).then((page) => {
          if (page) {
            pages.getPagePath(page).then((path) => {
              console.debug({
                contentId: content.id,
                blockId: block.id,
                pageId: page.id,
                path,
                wysiwyg: content.wysiwyg,
              })
            })
          }
        })
      }
    })
  }
})
