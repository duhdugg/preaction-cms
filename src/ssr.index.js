import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App.jsx'

function render(initPath, initPage) {
  return renderToString(createElement(App, { initPath, initPage }))
}

export { render }
