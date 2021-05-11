#!/usr/bin/env node

const pages = require('../lib/pages.js')

if (process.argv.length < 3) {
  console.error('no id specified')
  process.exit(1)
}

const inputId = process.argv[2]
if (isNaN(inputId)) {
  console.error('invalid id')
  process.exit(1)
}

pages.model.PageBlock.findByPk(inputId).then((block) => {
  if (block) {
    pages.model.Page.findByPk(block.pageId).then((page) => {
      if (page) {
        pages.getPagePath(page).then((path) => {
          console.debug(path)
        })
      }
    })
  }
})
