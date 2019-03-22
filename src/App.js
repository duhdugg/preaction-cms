import React from 'react'
import axios from 'axios'
import hexRgb from 'hex-rgb'
import {
  BrowserRouter as Router,
  Route,
  Switch,
  NavLink,
  Redirect
} from 'react-router-dom'
import { Boilerplate, NavBar } from 'preaction-bootstrap-clips'

// styles
import 'animate.css/animate.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'ionicons/dist/css/ionicons.min.css'
import './App.css'

import Footer from './Footer.js'
import Header from './Header.js'
import Login from './Login.js'
import Page from './Page.js'
import Settings from './Settings.js'

class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      authenticated: false,
      csrf: '',
      editable: true,
      pages: [],
      redirect: null,
      siteSettings: {
        bgColor: '#000000',
        fontColor: '#ffffff',
        linkColor: '#ffffff',
        containerColor: '#ffffff',
        containerOpacity: 0,
        siteTitle: '',
        siteDescription: '',
        navTheme: 'dark'
      }
    }
    this.settingsUpdateTimer = null
  }

  addPage (page) {
    if (page.key) {
      axios.post('/api/page', page).then(response => {
        if (response.data) {
          this.loadPages()
        }
      })
    }
  }

  deletePage (page) {
    if (this.editable) {
      axios
        .delete(`/api/page/${page.id}`)
        .then(response => {
          if (response.status === 200) {
            this.loadPages()
          }
        })
        .then(() => {
          this.loadPages()
          this.redirect('/')
        })
    }
  }

  get editable () {
    return this.state.authenticated && this.state.editable
  }

  get menu () {
    let menu = []
    for (let page of this.state.pages) {
      if (page.userCreated) {
        menu.push({
          name: page.title,
          href: `/${page.key}/`,
          component: NavLink
        })
      }
    }
    if (this.state.authenticated) {
      let adminSubmenu = []
      adminSubmenu.push({
        name: (
          <span>
            <i
              className={`ion ion-md-radio-button-${
                this.state.editable ? 'on' : 'off'
              }`}
            />{' '}
            Edit
          </span>
        ),
        onClick: e => {
          e.preventDefault()
          this.toggleEdit()
        }
      })
      adminSubmenu.push({
        name: 'Site Settings',
        href: '/settings/',
        component: NavLink
      })
      adminSubmenu.push({
        name: 'Logout',
        onClick: e => {
          e.preventDefault()
          this.logout()
        }
      })

      menu.push({
        name: 'Admin',
        subMenu: adminSubmenu
      })
    }
    return menu
  }

  get siteSettings () {
    let settings = JSON.parse(JSON.stringify(this.state.siteSettings))
    settings.containerRgba = hexRgb(settings.containerColor)
    settings.containerRgba.alpha = settings.containerOpacity
    let { red, green, blue, alpha } = settings.containerRgba
    settings.containerRgba.string = `rgba(${red}, ${green}, ${blue}, ${alpha})`
    return settings
  }

  getSettingsValueHandler (key) {
    return value => {
      this.setState(
        state => {
          state.siteSettings[key] = value
          return state
        },
        () => {
          clearTimeout(this.settingsUpdateTimer)
          this.settingsUpdateTimer = setTimeout(() => {
            axios.post('/api/settings', this.state.siteSettings)
          }, 1000)
        }
      )
    }
  }

  loadSession () {
    axios.get('/api/session').then(response => {
      if (response.data && response.data.authenticated) {
        this.setState(state => {
          state.authenticated = true
          return state
        })
      }
      if (response.data && response.data.csrf) {
        this.setState(state => {
          state.csrf = response.data.csrf
          return state
        })
      }
    })
  }

  loadSettings () {
    axios.get('/api/settings').then(response => {
      if (response.data) {
        this.setState(state => {
          state.siteSettings = response.data
          return state
        })
      }
    })
  }

  loadPages () {
    axios.get('/api/page').then(response => {
      if (response.data) {
        this.setState(state => {
          state.pages = response.data
          return state
        })
      }
    })
  }

  logout () {
    axios.get('/api/logout').then(() => {
      this.setState(state => {
        state.authenticated = false
        state.editable = false
        return state
      })
    })
  }

  toggleEdit () {
    this.setState(state => {
      state.editable = !state.editable
      return state
    })
  }

  redirect (path) {
    this.setState(
      state => {
        state.redirect = path
        return state
      },
      () => {
        this.setState(state => {
          state.redirect = null
          return state
        })
      }
    )
  }

  render () {
    return (
      <div
        className={`App ${this.state.editable ? 'editable' : 'non-editable'}`}
      >
        <Router>
          <div>
            {this.state.redirect ? <Redirect to={this.state.redirect} /> : ''}
            <NavBar
              fixedTo="top"
              theme={this.siteSettings.navTheme}
              brand={{
                name: this.siteSettings.siteTitle,
                href: '/',
                onClick: e => {
                  e.preventDefault()
                  this.redirect('/')
                }
              }}
              menu={this.menu}
            />
            <Boilerplate
              header={
                <Header
                  authenticated={this.state.authenticated}
                  editable={this.state.editable}
                  toggleEdit={this.toggleEdit.bind(this)}
                  siteSettings={this.siteSettings}
                  pages={this.state.pages}
                  logout={this.logout.bind(this)}
                />
              }
              footer={
                <Footer
                  authenticated={this.state.authenticated}
                  editable={this.state.editable}
                  siteSettings={this.siteSettings}
                  logout={this.logout.bind(this)}
                />
              }
            >
              <Switch>
                <Route exact path="/">
                  <Page
                    editable={this.state.editable}
                    pageKey="home"
                    siteSettings={this.siteSettings}
                  />
                </Route>
                <Route exact path="/login">
                  <div className="container">
                    <Login siteSettings={this.siteSettings} />
                  </div>
                </Route>
                <Route exact path="/settings">
                  <Settings
                    addPage={this.addPage.bind(this)}
                    deletePage={this.deletePage.bind(this)}
                    siteSettings={this.siteSettings}
                    authenticated={this.state.authenticated}
                    getSettingsValueHandler={this.getSettingsValueHandler.bind(
                      this
                    )}
                    pages={this.state.pages}
                  />
                </Route>
                <Route
                  render={({ location }) => {
                    let pageKey = location.pathname.split('/')[1]
                    return (
                      <Page
                        editable={this.state.editable}
                        siteSettings={this.siteSettings}
                        pageKey={pageKey}
                        deletePage={this.deletePage.bind(this)}
                      />
                    )
                  }}
                />
              </Switch>
            </Boilerplate>
          </div>
        </Router>
        <style>
          {`\
            a { color: ${this.siteSettings.linkColor}; }
            a.active { color: ${this.siteSettings.fontColor}; }
            a:hover { color: ${this.siteSettings.fontColor}; }
            img {
              border: 3px solid ${this.siteSettings.fontColor};
            }
            .App {
              opacity: ${this.siteSettings.init ? 1 : 0}
            }
          `}
        </style>
      </div>
    )
  }

  componentDidMount () {
    this.loadSettings()
    this.loadPages()
    this.loadSession()
  }

  componentDidUpdate () {
    window.document.body.style.backgroundColor = this.siteSettings.bgColor
    window.document.body.style.color = this.siteSettings.fontColor
  }
}

export default App
