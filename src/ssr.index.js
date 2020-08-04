import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App.jsx'

function render(props) {
  return renderToString(createElement(App, { ...props }))
}

export { render }
