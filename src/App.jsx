import React from 'react'
import axios from 'axios'
import io from 'socket.io-client'
import {
  BrowserRouter as Router,
  Route,
  Switch,
  NavLink,
  Link,
  Redirect
} from 'react-router-dom'
import { Boilerplate, Modal, NavBar, Nav } from '@preaction/bootstrap-clips'
import { Input } from '@preaction/inputs'
import { MdCreate, MdHome, MdPerson, MdSettings } from 'react-icons/md'
import { FaToggleOff, FaToggleOn } from 'react-icons/fa'

// styles
import 'animate.css/animate.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

import Footer from './Footer.jsx'
import Header from './Header.jsx'
import Login from './Login.jsx'
import NotFound from './NotFound.jsx'
import Page from './Page.jsx'
import SiteSettings from './SiteSettings.jsx'

import { registerSmartLinkFormat } from '@preaction/inputs'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activePage: null,
      activePathname: '',
      activeSettings: {},
      authenticated: false,
      editable: false,
      navigate: null,
      newPage: {
        title: ''
      },
      pages: [],
      redirect: null,
      show: {
        header: true,
        footer: true,
        newPage: false,
        settings: false
      },
      siteSettings: {
        bgColor: '#000000',
        borderColor: '#000000',
        borderOpacity: 0,
        containerColor: '#ffffff',
        containerHeaderTheme: 'dark',
        containerOpacity: 0,
        cssOverrides: '',
        fontColor: '#ffffff',
        hostname: '',
        linkColor: '#ffffff',
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

  createPage(title) {
    if (!title) {
      return
    }
    let key = title.toLowerCase().replace(/[^A-z0-9]/gi, '-')
    if (!key.replace(/-/gi, '')) {
      return
    }
    let pageType = 'content'
    let parentId = null
    if (this.state.activePage) {
      if (
        !(this.state.activePage.key === 'home') &&
        this.state.activePage.parentId === null
      ) {
        parentId = this.state.activePage.id
      }
    }
    let newPage = {
      key,
      title,
      pageType,
      parentId
    }
    this.addPage(newPage)
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
          this.setState(state => {
            state.activePage = null
            return state
          })
          this.loadPages()
          this.redirect('/')
        })
    }
  }

  get editable() {
    return this.state.authenticated && this.state.editable
  }

  emitSave(callback = () => {}) {
    this.socket.emit('save', () => {
      this.loadPages()
      callback()
    })
  }

  get fallbackSettings() {
    let s = Object.assign({}, this.state.siteSettings)
    if (this.state.activePage && this.state.activePathname !== '/home/') {
      Object.assign(s, this.state.activePage.fallbackSettings)
    }
    return s
  }

  get menu() {
    let menu = []
    if (this.settings.navPosition !== 'fixed-top') {
      menu.push({
        name: <MdHome />,
        href: '/',
        component: Link,
        order: -1,
        active: this.state.activePathname === '/home/',
        onClick: e => {
          this.navigate('/')
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
                    this.navigate(path)
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
        name: 'Logout',
        onClick: e => {
          e.preventDefault()
          this.logout()
        }
      })

      menu.push({
        name: (
          <span>
            {this.state.editable ? <FaToggleOn /> : <FaToggleOff />} Edit
          </span>
        ),
        onClick: e => {
          e.preventDefault()
          this.toggleEditMode()
        },
        order: 1
      })

      if (this.state.editable) {
        menu.push({
          name: (
            <span>
              <MdCreate /> New Page
            </span>
          ),
          onClick: e => {
            e.preventDefault()
            this.toggleNewPage()
          },
          order: 2
        })
        menu.push({
          name: (
            <span>
              <MdSettings /> Settings
            </span>
          ),
          onClick: e => {
            e.preventDefault()
            this.toggleSettings()
          },
          order: 3
        })
      }

      menu.push({
        name: (
          <span>
            <MdPerson /> User
          </span>
        ),
        subMenu: adminSubmenu,
        order: 4
      })
    }
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
    return menu
  }

  get settings() {
    let s = Object.assign({}, this.fallbackSettings)
    if (
      this.state.activePage &&
      this.state.activePathname !== '/home' &&
      this.state.activePathname !== '/'
    ) {
      Object.assign(s, this.state.activePage.settings)
    }
    return s
  }

  getNewPageValueHandler(key) {
    return value => {
      this.setState(state => {
        state.newPage[key] = value
        return state
      })
    }
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
      if (key === 'siteTitle') {
        let splitTitle = document.title.split(' | ')
        if (splitTitle.length < 2) {
          document.title = value
        } else {
          document.title = `${splitTitle[0]} | ${value}`
        }
      }
      this.setState(
        state => {
          state.siteSettings[key] = value
          return state
        },
        () => {
          clearTimeout(this.settingsUpdateTimer)
          this.settingsUpdateTimer = setTimeout(() => {
            axios.post('/api/settings', this.state.siteSettings).then(() => {
              this.emitSave(() => {
                this.loadSettings()
              })
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
    return new Promise((resolve, reject) => {
      let conditionallyResolve = () => {
        if (this.state.authenticated && this.state.token) {
          resolve()
        }
      }
      axios.get('/api/session').then(response => {
        if (response.data && response.data.authenticated) {
          this.setState(state => {
            state.authenticated = true
            return state
          }, conditionallyResolve)
        }
        if (response.data && response.data.token) {
          this.setState(state => {
            state.token = response.data.token
            return state
          }, conditionallyResolve)
        }
      })
    })
  }

  loadSettings() {
    return new Promise((resolve, reject) => {
      axios.get('/api/settings').then(response => {
        if (response.data) {
          this.setState(
            state => {
              state.siteSettings = response.data
              state.siteSettings.hostname = window.location.origin || ''
              return state
            },
            () => {
              resolve(this.state.siteSettings)
            }
          )
        }
      })
    })
  }

  loadPages() {
    return new Promise((resolve, reject) => {
      axios.get('/api/page').then(response => {
        if (response.data) {
          this.setState(
            state => {
              state.pages = response.data
              return state
            },
            () => {
              resolve(this.state.pages)
            }
          )
        }
      })
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
    this.trackPageView(path)
  }

  toggleEditMode() {
    this.setState(state => {
      state.editable = !state.editable
      return state
    })
  }

  toggleSettings() {
    if (
      this.state.activePathname === '/home/' ||
      this.state.activePathname === '/'
    ) {
      this.setState(state => {
        state.show.settings = !state.show.settings
        return state
      })
    } else if (this.activePage && this.activePage.current) {
      this.activePage.current.toggleSettings()
    }
  }

  toggleNewPage() {
    this.setState(state => {
      state.show.newPage = !state.show.newPage
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
    this.trackPageView(path)
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

  setActivePage(page) {
    this.setState(state => {
      state.activePage = page
      return state
    })
  }

  setActivePathname(pathname) {
    this.setState(state => {
      state.activePathname = pathname
      return state
    })
  }

  trackPageView(path) {
    if (
      this.settings.useGoogleAnalytics &&
      this.settings.googleAnalyticsTrackingId &&
      window.gtag
    ) {
      window.gtag('config', this.settings.googleAnalyticsTrackingId, {
        page_path: path
      })
    }
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
            {this.settings.navPosition === 'fixed-top' ? (
              <NavBar
                fixedTo='top'
                theme={this.settings.navTheme}
                brand={{
                  name: this.settings.siteTitle,
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
                  {this.settings.navPosition === 'above-header' ? (
                    <Nav
                      menu={this.menu}
                      type={this.settings.navType}
                      align={this.settings.navAlignment}
                      justify={this.settings.navSpacing === 'justify'}
                      fill={this.settings.navSpacing === 'fill'}
                      collapsible={this.settings.navCollapsible}
                      className='mb-3'
                    />
                  ) : (
                    ''
                  )}
                  <Header
                    activePage={this.state.activePage}
                    editable={this.state.editable}
                    emitSave={this.emitSave.bind(this)}
                    show={this.state.show.header}
                    ref={this.header}
                  />
                  {this.settings.navPosition === 'below-header' ? (
                    <Nav
                      menu={this.menu}
                      type={this.settings.navType}
                      align={this.settings.navAlignment}
                      justify={this.settings.navSpacing === 'justify'}
                      fill={this.settings.navSpacing === 'fill'}
                      collapsible={this.settings.navCollapsible}
                      className='mb-3'
                    />
                  ) : (
                    ''
                  )}
                </div>
              }
              footer={
                <Footer
                  activePage={this.state.activePage}
                  editable={this.state.editable}
                  emitSave={this.emitSave.bind(this)}
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
                    fallbackSettings={this.fallbackSettings}
                    path='/home/'
                    ref={this.activePage}
                    headerControl={this.getShowPropertyValueHandler('header')}
                    footerControl={this.getShowPropertyValueHandler('footer')}
                    setActivePathname={this.setActivePathname.bind(this)}
                    setActivePage={this.setActivePage.bind(this)}
                  />
                </Route>
                <Route exact path='/login'>
                  <div className='container'>
                    <Login settings={this.state.siteSettings} />
                  </div>
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
                            path={location.pathname}
                            deletePage={this.deletePage.bind(this)}
                            emitSave={this.emitSave.bind(this)}
                            ref={this.activePage}
                            headerControl={this.getShowPropertyValueHandler(
                              'header'
                            )}
                            footerControl={this.getShowPropertyValueHandler(
                              'footer'
                            )}
                            setActivePathname={this.setActivePathname.bind(
                              this
                            )}
                            setActivePage={this.setActivePage.bind(this)}
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
            a { color: ${this.settings.linkColor}; }
            a.active { color: ${this.settings.fontColor}; }
            a:hover { color: ${this.settings.fontColor}; }
            #root::before {
              background-color: ${this.settings.bgColor};
            }
            .App {
              color: ${this.settings.fontColor};
              opacity: ${this.settings.init ? 1 : 0};
              padding-top: ${
                this.settings.navPosition === 'fixed-top' ? '4rem' : '0'
              };
            }
            .dropdown-item.active, .dropdown-item:active {
              background-color: ${this.settings.linkColor};
            }
            .nav-pills .nav-link.active, .nav-pills .show>.nav-link {
              background-color: ${this.settings.linkColor};
            }
            .modal-content {
              background-color: ${this.settings.bgColor};
              color: ${this.settings.fontColor};
            }
          `}
          {this.settings.useBgImage
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
                background-image: url(/${this.settings.bg});
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
          {this.settings.tileBgImage
            ? `\
              .App::before {
                background-size: auto;
                background-repeat: repeat;
              }
          `
            : ''}
        </style>
        <style>{this.settings.cssOverrides || ''}</style>
        {this.state.editable && this.state.show.settings ? (
          <Modal
            title='Site Settings'
            closeHandler={this.toggleSettings.bind(this)}
            footer={
              <button
                type='button'
                className='btn btn-secondary'
                onClick={this.toggleSettings.bind(this)}
              >
                Close
              </button>
            }
          >
            <SiteSettings
              authenticated={this.state.authenticated}
              settings={this.state.siteSettings}
              getSettingsValueHandler={this.getSettingsValueHandler.bind(this)}
            />
          </Modal>
        ) : (
          ''
        )}
        {this.state.editable && this.state.show.newPage ? (
          <Modal
            title='New Page'
            hideCloseButton={true}
            footer={
              <div>
                <button
                  type='button'
                  className='btn btn-success'
                  onClick={() => {
                    if (this.state.newPage.title) {
                      this.createPage(this.state.newPage.title)
                      this.toggleNewPage()
                      this.setState(state => {
                        state.newPage.title = ''
                        return state
                      })
                    }
                  }}
                >
                  Save
                </button>{' '}
                <button
                  type='button'
                  className='btn btn-secondary'
                  onClick={() => {
                    this.toggleNewPage()
                  }}
                >
                  Cancel
                </button>
              </div>
            }
          >
            <form onSubmit={e => e.preventDefault()}>
              <Input
                type='text'
                label='Page Title'
                value={this.state.newPage.title}
                valueHandler={this.getNewPageValueHandler('title')}
                required
              />
            </form>
          </Modal>
        ) : (
          ''
        )}
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
        this.reload()
      }
    })
    this.socket.on('reload-app', () => {
      if (!this.state.editable) {
        window.location.reload()
      }
    })
    window.onpopstate = event => {
      this.setActivePathname(window.location.pathname)
    }
  }
}

export default App
