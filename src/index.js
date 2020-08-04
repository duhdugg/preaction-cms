import React from 'react'
import ReactDOM from 'react-dom'
import App from './App.jsx'
import * as serviceWorker from './serviceWorker'
import globalthis from 'globalthis'

const globalThis = globalthis()

let settings = {
  initPage:
    globalThis.initPage !== '$INIT_PAGE' ? globalThis.initPage : undefined,
  initPath: '/',
  initSettings:
    globalThis.initSettings !== '$INIT_SETTINGS'
      ? globalThis.initSettings
      : undefined,
  root: '',
  socketMode: false,
}

if (globalThis.appRoot !== '$ROOT') {
  settings.root = globalThis.appRoot
}
if (globalThis.socketMode !== '$SOCKET_MODE') {
  settings.socketMode = globalThis.socketMode === true
}
if (globalThis.location) {
  settings.initPath = globalThis.location.pathname
} else {
  settings.initPath = `${settings.root}/`
}

const render = !!module.hot ? ReactDOM.render : ReactDOM.hydrate
render(<App {...settings} />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
