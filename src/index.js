import React from 'react'
import ReactDOM from 'react-dom/client'
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
    appRoot: '',
    initPage:
      globalThis.initPage !== '$INIT_PAGE' ? globalThis.initPage : undefined,
    initPath: '/',
    initSettings:
      globalThis.initSettings !== '$INIT_SETTINGS'
        ? globalThis.initSettings
        : undefined,
    socketMode: false,
  }

  if (globalThis.appRoot !== '$ROOT') {
    settings.appRoot = globalThis.appRoot
  }
  if (globalThis.socketMode !== '$SOCKET_MODE') {
    settings.socketMode = globalThis.socketMode === true
  }
  if (globalThis.location) {
    settings.initPath = globalThis.location.pathname.replace(
      new RegExp(`^${settings.appRoot}`),
      ''
    )
  } else {
    settings.initPath = `/`
  }

  const root = document.getElementById('root')
  const app = <App {...settings} />
  const render = () =>
    !!module.hot
      ? ReactDOM.createRoot(root).render(app)
      : ReactDOM.hydrateRoot(root, app)
  render()

  // If you want your app to work offline and load faster, you can change
  // unregister() to register() below. Note this comes with some pitfalls.
  // Learn more about service workers: https://bit.ly/CRA-PWA
  serviceWorker.unregister()
}
initialize()
