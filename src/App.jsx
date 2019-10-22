import React from 'react'
import axios from 'axios'
import hexRgb from 'hex-rgb'
import io from 'socket.io-client'
import {
  BrowserRouter as Router,
  Route,
  Switch,
  NavLink,
  Link,
  Redirect
} from 'react-router-dom'
import { Boilerplate, NavBar, Nav } from '@preaction/bootstrap-clips'

// styles
import 'animate.css/animate.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'ionicons/dist/css/ionicons.min.css'
import './App.css'

import Footer from './Footer.jsx'
import Header from './Header.jsx'
import Login from './Login.jsx'
import NotFound from './NotFound.jsx'
import Page from './Page.jsx'
import Settings from './Settings.jsx'

import { registerSmartLinkFormat } from '@preaction/inputs'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activePathname: '',
      authenticated: false,
      editable: false,
      navigate: null,
      pages: [],
      redirect: null,
      show: {
        header: true,
        footer: true
      },
      siteSettings: {
        bgColor: '#000000',
        borderColor: '#000000',
        borderOpacity: 0,
        fontColor: '#ffffff',
        hostname: '',
        linkColor: '#ffffff',
        containerColor: '#ffffff',
        containerOpacity: 0,
        siteTitle: '',
        siteDescription: '',
        navTheme: 'dark',
        navPosition: 'fixed-top',
        tileBgImage: false,
        useBgImage: false
      },
      token: ''
    }
    this.settingsUpdateTimer = null
    this.socket = null
    this.activePage = React.createRef()
    this.header = React.createRef()
    this.footer = React.createRef()
    registerSmartLinkFormat(this.navigate.bind(this))
  }

  addPage(page) {
    if (page.key) {
      axios
        .post('/api/page', page)
        .then(response => {
          if (response.data) {
            this.loadPages()
          }
        })
        .then(() => {
          this.emitSave()
        })
    }
  }

  deletePage(page) {
    if (this.editable) {
      axios
        .delete(`/api/page/${page.id}`)
        .then(response => {
          if (response.status === 200) {
            this.loadPages()
          }
          this.emitSave()
        })
        .then(() => {
          this.loadPages()
          this.redirect('/')
        })
    }
  }

  get editable() {
    return this.state.authenticated && this.state.editable
  }

  emitSave(callback = () => {}) {
    this.socket.emit('save', callback)
  }

  emitReload(callback = () => {}) {
    this.socket.emit('force-reload', callback)
  }

  get menu() {
    let menu = []
    if (this.state.siteSettings.navPosition !== 'fixed-top') {
      menu.push({
        name: <i className='ion ion-md-home' />,
        href: '/',
        component: Link,
        order: -1,
        active: this.state.activePathname === '/',
        onClick: e => {
          this.setActivePathname('/')
        }
      })
    }
    this.state.pages.forEach(page => {
      if (page.userCreated) {
        let path = `/${page.key}/`
        if (page.parentId) {
          let parentPage = this.getPageById(page.parentId)
          if (parentPage) {
            path = `/${parentPage.key}/${page.key}/`
            menu.forEach(menuItem => {
              if (menuItem.href === `/${parentPage.key}/`) {
                if (menuItem.subMenu === undefined) {
                  menuItem.subMenu = []
                }
                menuItem.subMenu.push({
                  name: page.title,
                  href: path,
                  component: NavLink,
                  onClick: e => {
                    this.setActivePathname(path)
                  }
                })
                menuItem.subMenu.sort((a, b) => {
                  let retval = 0
                  if (a.name < b.name) {
                    retval--
                  } else if (a.name > b.name) {
                    retval++
                  }
                  return retval
                })
              }
            })
          }
        } else {
          menu.push({
            name: page.title,
            href: path,
            component: NavLink,
            onClick: e => {
              e.preventDefault()
              this.navigate(path)
            }
          })
        }
      }
    })
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
        component: NavLink,
        onClick: e => {
          this.setActivePathname('/settings/')
        }
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
        subMenu: adminSubmenu,
        order: 1
      })

      menu.sort((a, b) => {
        let retval = 0
        if (a.name < b.name) {
          retval = -1
        } else if (a.name > b.name) {
          retval = 1
        }
        let aOrder = a.order
        let bOrder = b.order
        if (aOrder === undefined) {
          aOrder = 0
        }
        if (bOrder === undefined) {
          bOrder = 0
        }
        if (aOrder < bOrder) {
          retval = -1
        } else if (aOrder > bOrder) {
          retval = 1
        }
        return retval
      })
    }
    return menu
  }

  get siteSettings() {
    function getRgbaString(hexRgbObject) {
      let { red, green, blue, alpha } = hexRgbObject
      return `rgba(${red}, ${green}, ${blue}, ${alpha})`
    }
    let settings = JSON.parse(JSON.stringify(this.state.siteSettings))
    settings.containerRgba = hexRgb(settings.containerColor)
    settings.containerRgba.alpha = settings.containerOpacity
    settings.containerRgba.string = getRgbaString(settings.containerRgba)
    settings.borderRgba = hexRgb(settings.borderColor)
    settings.borderRgba.alpha = settings.borderOpacity
    settings.borderRgba.string = getRgbaString(settings.borderRgba)
    return settings
  }

  getPageById(id) {
    let retval = null
    this.state.pages.forEach(page => {
      if (page.id === id) {
        retval = page
      }
    })
    return retval
  }

  getSettingsValueHandler(key) {
    return value => {
      this.setState(
        state => {
          state.siteSettings[key] = value
          return state
        },
        () => {
          clearTimeout(this.settingsUpdateTimer)
          this.settingsUpdateTimer = setTimeout(() => {
            axios.post('/api/settings', this.state.siteSettings).then(() => {
              this.emitSave()
            })
          }, 1000)
        }
      )
    }
  }

  getShowPropertyValueHandler(key) {
    return value => {
      this.setState(state => {
        state.show[key] = value
        return state
      })
    }
  }

  loadSession() {
    axios.get('/api/session').then(response => {
      if (response.data && response.data.authenticated) {
        this.setState(state => {
          state.authenticated = true
          return state
        })
      }
      if (response.data && response.data.token) {
        this.setState(state => {
          state.token = response.data.token
          return state
        })
      }
    })
  }

  loadSettings() {
    axios.get('/api/settings').then(response => {
      if (response.data) {
        this.setState(state => {
          state.siteSettings = response.data
          state.siteSettings.hostname = window.location.origin || ''
          return state
        })
      }
    })
  }

  loadPages() {
    axios.get('/api/page').then(response => {
      if (response.data) {
        this.setState(state => {
          state.pages = response.data
          return state
        })
      }
    })
  }

  logout() {
    axios.get('/api/logout').then(() => {
      this.setState(state => {
        state.authenticated = false
        state.editable = false
        return state
      })
    })
  }

  navigate(path) {
    this.setState(
      state => {
        state.navigate = path
        return state
      },
      () => {
        this.setActivePathname(path)
        this.setState(state => {
          state.navigate = null
          return state
        })
      }
    )
  }

  toggleEdit() {
    this.setState(state => {
      state.editable = !state.editable
      return state
    })
  }

  redirect(path) {
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

  reload() {
    this.loadPages()
    this.loadSettings()
    if (this.activePage.current) {
      this.header.current.reload()
      this.activePage.current.reload()
      this.footer.current.reload()
    }
  }

  setActivePathname(pathname) {
    this.setState(state => {
      state.activePathname = pathname
      return state
    })
  }

  render() {
    return (
      <div
        className={`App ${this.state.editable ? 'editable' : 'non-editable'}`}
      >
        <Router>
          <div>
            {this.state.redirect ? <Redirect to={this.state.redirect} /> : ''}
            {this.state.navigate ? (
              <Redirect to={this.state.navigate} push={true} />
            ) : (
              ''
            )}
            {this.state.siteSettings.navPosition === 'fixed-top' ? (
              <NavBar
                fixedTo='top'
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
            ) : (
              ''
            )}
            <Boilerplate
              header={
                <div>
                  {this.state.siteSettings.navPosition === 'above-header' ? (
                    <Nav
                      menu={this.menu}
                      type={this.state.siteSettings.navType}
                      align={this.state.siteSettings.navAlignment}
                      justify={this.state.siteSettings.navSpacing === 'justify'}
                      fill={this.state.siteSettings.navSpacing === 'fill'}
                      collapsible={this.state.siteSettings.navCollapsible}
                      className='mb-3'
                    />
                  ) : (
                    ''
                  )}
                  <Header
                    editable={this.state.editable}
                    emitSave={this.emitSave.bind(this)}
                    siteSettings={this.siteSettings}
                    pages={this.state.pages}
                    logout={this.logout.bind(this)}
                    show={this.state.show.header}
                    ref={this.header}
                  />
                  {this.state.siteSettings.navPosition === 'below-header' ? (
                    <Nav
                      menu={this.menu}
                      type={this.state.siteSettings.navType}
                      align={this.state.siteSettings.navAlignment}
                      justify={this.state.siteSettings.navSpacing === 'justify'}
                      fill={this.state.siteSettings.navSpacing === 'fill'}
                      collapsible={this.state.siteSettings.navCollapsible}
                      className='mb-3'
                    />
                  ) : (
                    ''
                  )}
                </div>
              }
              footer={
                <Footer
                  editable={this.state.editable}
                  emitSave={this.emitSave.bind(this)}
                  siteSettings={this.siteSettings}
                  logout={this.logout.bind(this)}
                  ref={this.footer}
                  show={this.state.show.footer}
                />
              }
            >
              {this.state.editable ? <hr /> : ''}
              {this.state.editable ? (
                <h3>Page: {window.location.pathname}</h3>
              ) : (
                ''
              )}
              <Switch>
                <Route exact path='/'>
                  <Page
                    editable={this.state.editable}
                    emitSave={this.emitSave.bind(this)}
                    path='/home/'
                    siteSettings={this.siteSettings}
                    ref={this.activePage}
                    headerControl={this.getShowPropertyValueHandler('header')}
                    footerControl={this.getShowPropertyValueHandler('footer')}
                  />
                </Route>
                <Route exact path='/login'>
                  <div className='container'>
                    <Login siteSettings={this.siteSettings} />
                  </div>
                </Route>
                <Route exact path='/settings'>
                  <Settings
                    addPage={this.addPage.bind(this)}
                    authenticated={this.state.authenticated}
                    deletePage={this.deletePage.bind(this)}
                    emitSave={this.emitSave.bind(this)}
                    emitReload={this.emitReload.bind(this)}
                    siteSettings={this.siteSettings}
                    getSettingsValueHandler={this.getSettingsValueHandler.bind(
                      this
                    )}
                    pages={this.state.pages}
                  />
                </Route>
                <Route
                  render={({ location }) => {
                    switch (location.pathname) {
                      case '/home/':
                      case '/header/':
                      case '/footer/':
                        return <NotFound />
                      default:
                        return (
                          <Page
                            editable={this.state.editable}
                            siteSettings={this.siteSettings}
                            path={location.pathname}
                            addPage={this.addPage.bind(this)}
                            deletePage={this.deletePage.bind(this)}
                            emitSave={this.emitSave.bind(this)}
                            ref={this.activePage}
                            headerControl={this.getShowPropertyValueHandler(
                              'header'
                            )}
                            footerControl={this.getShowPropertyValueHandler(
                              'footer'
                            )}
                          />
                        )
                    }
                  }}
                />
              </Switch>
              {this.state.editable ? <hr /> : ''}
            </Boilerplate>
          </div>
        </Router>
        <style>
          {`\
            a { color: ${this.siteSettings.linkColor}; }
            a.active { color: ${this.siteSettings.fontColor}; }
            a:hover { color: ${this.siteSettings.fontColor}; }
            img {
              border: 1px solid ${this.siteSettings.borderRgba.string};
            }
            #root::before {
              background-color: ${this.state.siteSettings.bgColor};
              color: ${this.state.siteSettings.fontColor};
            }
            .App {
              opacity: ${this.siteSettings.init ? 1 : 0};
              padding-top: ${
                this.state.siteSettings.navPosition === 'fixed-top'
                  ? '4rem'
                  : '0'
              };
            }
            .dropdown-item.active, .dropdown-item:active {
              background-color: ${this.siteSettings.linkColor};
            }
            .nav-pills .nav-link.active, .nav-pills .show>.nav-link {
              background-color: ${this.siteSettings.linkColor};
            }
          `}
          {this.state.siteSettings.useBgImage
            ? `\
              .App {
                overflow: hidden;
                position: relative;
              }
              .App::before {
                content: ' ';
                position: fixed;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                background-image: url("/bg");
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                will-change: transform;
                z-index: -1;
                opacity: 1;
                pointer-events: none;
              }
          `
            : ''}
          {this.state.siteSettings.tileBgImage
            ? `\
              .App::before {
                background-size: auto;
                background-repeat: repeat;
              }
          `
            : ''}
        </style>
      </div>
    )
  }

  componentDidMount() {
    this.loadSettings()
    this.loadPages()
    this.loadSession()
    this.setActivePathname(window.location.pathname)
    this.socket = io()
    this.socket.on('load', () => {
      if (!this.state.editable) {
        if (this.state.activePathname !== '/settings/') {
          this.reload()
        }
      }
    })
    this.socket.on('reload-page', () => {
      if (!this.state.editable) {
        if (this.state.activePathname !== '/settings/') {
          window.location.reload()
        }
      }
    })
    window.onpopstate = event => {
      this.setActivePathname(window.location.pathname)
    }
  }
}

export default App
