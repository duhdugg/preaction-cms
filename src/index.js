import React from 'react'
import ReactDOM from 'react-dom'
import App from './App.jsx'
import * as serviceWorker from './serviceWorker'

const initialize = () => {
  // Redirect with trailing slash if it's not there.
  // As this should be handled by express primarily,
  // it's here for hot reloading mode.
  if (globalThis.location) {
    if (globalThis.location.pathname.match(/\/$/) === null) {
      globalThis.location.pathname = globalThis.location.pathname + '/'
      return
    }
  }

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
    settings.initPath = globalThis.location.pathname.replace(
      new RegExp(`^${settings.root}`),
      ''
    )
  } else {
    settings.initPath = `/`
  }

  const render = !!module.hot ? ReactDOM.render : ReactDOM.hydrate
  render(<App {...settings} />, document.getElementById('root'))

  // If you want your app to work offline and load faster, you can change
  // unregister() to register() below. Note this comes with some pitfalls.
  // Learn more about service workers: https://bit.ly/CRA-PWA
  serviceWorker.unregister()
}
initialize()
