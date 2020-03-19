import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import * as serviceWorker from './serviceWorker'
import 'es5-shim'
import 'es6-shim'

let settings = {
  root: sessionStorage.preactionAppRoot || window.appRoot || '',
  socketMode:
    sessionStorage.preactionSocketMode === 'true' ||
    window.socketMode === true ||
    false
}

ReactDOM.render(
  <App root={settings.root} socketMode={settings.socketMode} />,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
