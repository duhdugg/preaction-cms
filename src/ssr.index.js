import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { ChunkExtractor } from '@loadable/server'
import path from 'path'
import App from './App.jsx'

function render(props) {
  const statsFile = path.resolve('./build/ssr/loadable-stats.json')
  const extractor = new ChunkExtractor({ statsFile })
  return renderToString(
    extractor.collectChunks(createElement(App, { ...props }))
  )
}

export { render }
