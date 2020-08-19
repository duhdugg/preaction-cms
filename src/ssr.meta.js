import { createElement } from 'react'
import { renderToString } from 'react-dom/server'

const meta = (name, content) => createElement('meta', { name, content })

const getTags = (options) => {
  const tags = []
  if (options.themeColor) {
    tags.push(meta('theme-color', options.themeColor))
  }
  if (options.title) {
    tags.push(meta('og:title', options.title))
  }
  if (options.description) {
    tags.push(meta('description', options.description))
    tags.push(meta('og:description', options.description))
  }
  if (options.ogType) {
    tags.push(meta('og:type', options.ogType))
  }
  if (options.ogImage) {
    tags.push(meta('og:image', options.ogImage))
  }
  if (options.ogUrl) {
    tags.push(meta('og:url', options.ogUrl))
  }
  return tags
}

const render = (options) => {
  let str = ''
  const tags = getTags(options)
  for (let tag of tags) {
    str += renderToString(tag)
  }
  return str.replace(/data-reactroot=""/g, '')
}

export { render }
