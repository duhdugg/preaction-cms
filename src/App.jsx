import PropTypes from 'prop-types'
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
import { MdCreate, MdPerson, MdSettings } from 'react-icons/md'
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

import { Quill } from '@preaction/inputs'

import absoluteUrl from './lib/absoluteUrl.js'

function registerSmartLinkFormat(relativeLinkHandler = url => {}) {
  const LinkFormat = Quill.import('formats/link')
  class SmartLinkFormat extends LinkFormat {
    static create(value) {
      let node = super.create(value)
      node.addEventListener('click', event => {
        let href = node.getAttribute('href')
        if (absoluteUrl(href)) {
        } else {
          event.preventDefault()
          relativeLinkHandler(href)
        }
      })
      return node
    }
  }
  Quill.register('formats/link', SmartLinkFormat)
}

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activePage: null,
      activePathname: '',
      activeSettings: {},
      admin: false,
      authenticated: false,
      editable: false,
      fallbackSettings: {},
      navigate: null,
      newPage: {
        title: ''
      },
      redirect: null,
      show: {
        header: true,
        footer: true,
        newPage: false,
        settings: false
      },
      siteMap: {},
      siteSettings: {
        bgColor: '#000000',
        borderColor: '#000000',
        borderOpacity: 0,
        containerColor: '#ffffff',
        containerHeaderTheme: 'dark',
        containerOpacity: 0,
        cssOverrides: '',
        fontColor: '#ffffff',
        footerPath: '/home/footer/',
        headerPath: '/home/header/',
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
    registerSmartLinkFormat(href => {
      if (href.indexOf(this.root) === 0) {
        let regex = new RegExp(`^${this.root}`)
        href = href.replace(regex, '')
      }
      if (!this.state.editable) {
        this.navigate(href)
      }
    })
  }

  addPage(page) {
    if (page.key) {
      axios
        .post(`${this.root}/api/page`, page)
        .then(response => {
          if (response.data) {
            this.loadSiteMap()
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
      if (this.state.activePage.key !== 'home') {
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
      axios.delete(`${this.root}/api/page/${page.id}`).then(response => {
        if (response.status === 200) {
          this.setState(
            state => {
              state.activePage = null
            },
            () => {
              this.redirect('..')
              this.emitSave()
            }
          )
        }
      })
    }
  }

  get editable() {
    return this.state.authenticated && this.state.admin && this.state.editable
  }

  emitSave(callback = () => {}) {
    if (this.props.socketMode) {
      this.socket.emit('save', () => {
        this.loadSiteMap()
        callback()
      })
    } else {
      this.loadSiteMap()
      callback()
    }
  }

  get fallbackSettings() {
    let s = Object.assign({}, this.state.siteSettings)
    if (this.state.fallbackSettings && this.state.activePathname !== '/home/') {
      Object.assign(s, this.state.fallbackSettings)
    }
    return s
  }

  get menu() {
    let menu = []
    if (this.settings.navPosition !== 'fixed-top') {
      menu.push({
        name: 'Home',
        href: `/${this.siteMap.path}${this.siteMap.key === 'home' ? '' : '/'}`,
        component: Link,
        order: -1,
        active:
          this.state.activePathname === '/home/' ||
          this.state.activePathname === `/${this.siteMap.path}/`,
        onClick: e => {
          this.navigate(
            `/${this.siteMap.path}${this.siteMap.key === 'home' ? '' : '/'}`
          )
        }
      })
    }
    this.siteMap.children.forEach(page => {
      if (page.settings.includeInNav) {
        let subMenu = []
        page.children.forEach(pg => {
          if (pg.settings.includeInNav) {
            subMenu.push({
              name: pg.title,
              href: `/${pg.path}/`,
              component: NavLink,
              onClick: e => {
                this.navigate(`/${pg.path}/`)
              }
            })
          }
        })
        menu.push({
          name: page.title,
          href: `/${page.path}/`,
          component: NavLink,
          onClick: e => {
            this.navigate(`/${page.path}/`)
          },
          subMenu: subMenu.length ? subMenu : null
        })
      }
    })
    if (this.state.admin) {
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

  get root() {
    return this.props.root || ''
  }

  get settings() {
    let s = Object.assign({}, this.fallbackSettings)
    if (
      this.state.activePage &&
      this.state.activePathname !== '/home' &&
      this.state.activePathname !== '/'
    ) {
      Object.keys(this.state.activePage.settings).forEach(key => {
        switch (key) {
          case 'cssOverrides':
            s[key] = s[key] + '\n\n' + this.state.activePage.settings[key]
            break
          default:
            s[key] = this.state.activePage.settings[key]
            break
        }
      })
    }
    return s
  }

  get siteMap() {
    let sm = {
      key: 'home',
      path: '',
      children: []
    }
    Object.assign(sm, this.state.siteMap)
    return sm
  }

  getNewPageValueHandler(key) {
    return value => {
      this.setState(state => {
        state.newPage[key] = value
        return state
      })
    }
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
            axios
              .post(`${this.root}/api/settings`, this.state.siteSettings)
              .then(() => {
                this.emitSave(() => {
                  if (this.settingsUpdateTimer !== undefined) {
                    this.loadSettings()
                  }
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

  handleNotFound(path) {
    this.setState(state => {
      state.activePage = null
      return state
    })
    this.loadSiteMap(path)
    this.loadSettings(path)
  }

  loadSession() {
    return new Promise((resolve, reject) => {
      let conditionallyResolve = () => {
        if (this.state.authenticated && this.state.token) {
          resolve()
        }
      }
      axios.get(`${this.root}/api/session`).then(response => {
        if (response.data && response.data.authenticated) {
          this.setState(state => {
            state.authenticated = true
            if (response.data.admin) {
              state.admin = true
            }
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

  loadSettings(path = '') {
    axios.get(`${this.root}/api/settings`).then(response => {
      if (response.data) {
        this.setState(state => {
          state.siteSettings = response.data
          state.siteSettings.hostname = window.location.origin || ''
          return state
        })
      }
    })
    if (path) {
      axios
        .get(`${this.root}/api/page/settings/by-key${path}`)
        .then(response => {
          if (response.data) {
            this.setFallbackSettings(response.data)
          }
        })
    }
  }

  loadSiteMap(path = '') {
    return new Promise((resolve, reject) => {
      if (this.state.activePage && this.state.activePage.id) {
        axios
          .get(`${this.root}/api/page/${this.state.activePage.id}/sitemap`)
          .then(response => {
            this.setState(
              state => {
                state.siteMap = response.data
                return state
              },
              () => {
                resolve(this.state.siteMap)
              }
            )
          })
      } else if (path) {
        axios
          .get(`${this.root}/api/page/sitemap/by-key${path}`)
          .then(response => {
            this.setState(state => {
              state.siteMap = response.data
              return state
            })
          })
      }
    })
  }

  logout() {
    axios.get(`${this.root}/api/logout`).then(() => {
      this.setState(state => {
        state.admin = false
        state.authenticated = false
        state.editable = false
        return state
      })
    })
  }

  navigate(path) {
    if (path.match(/\/$/) === null) {
      path = path + '/'
    }
    this.setState(
      state => {
        state.navigate = path
        state.activePathname = path
        return state
      },
      () => {
        this.setState(state => {
          state.navigate = false
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
          state.redirect = false
          return state
        })
      }
    )
    this.trackPageView(path)
  }

  reload() {
    this.loadSiteMap()
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
      state.siteMap = JSON.parse(JSON.stringify(page.siteMap))
      state.fallbackSettings = JSON.parse(JSON.stringify(page.fallbackSettings))
      return state
    })
  }

  setActivePathname(pathname) {
    this.setState(state => {
      state.activePathname = pathname
      return state
    })
  }

  setFallbackSettings(settings) {
    this.setState(state => {
      state.fallbackSettings = settings
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
        <Router basename={`${this.root}/`}>
          <div>
            {this.state.redirect ? <Redirect to={this.state.redirect} /> : ''}
            {this.state.navigate ? (
              // FIXME: redirects are pushing extra state to window.history
              <Redirect to={this.state.navigate} push={false} />
            ) : (
              ''
            )}
            {this.settings.navPosition === 'fixed-top' ? (
              <NavBar
                fixedTo='top'
                theme={this.settings.navTheme}
                brand={{
                  name: this.settings.siteTitle,
                  href: `${this.root}/${this.siteMap.path}${
                    this.siteMap.key === 'home' ? '' : '/'
                  }`,
                  onClick: e => {
                    e.preventDefault()
                    this.navigate(
                      `/${this.siteMap.path}${
                        this.siteMap.key === 'home' ? '' : '/'
                      }`
                    )
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
                    appRoot={this.root}
                    editable={this.state.editable}
                    emitSave={this.emitSave.bind(this)}
                    settings={this.settings}
                    show={this.settings.showHeader}
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
                  appRoot={this.root}
                  editable={this.state.editable}
                  emitSave={this.emitSave.bind(this)}
                  settings={this.settings}
                  ref={this.footer}
                  show={this.settings.showFooter}
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
                    appRoot={this.root}
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
                    <Login
                      appRoot={this.root}
                      settings={this.state.siteSettings}
                    />
                  </div>
                </Route>
                <Route
                  render={({ location }) => {
                    let root = new RegExp(`^${this.root}`)
                    let pathname = location.pathname.replace(root, '')
                    switch (pathname) {
                      case '/home/':
                      case '/header/':
                      case '/footer/':
                        return <NotFound />
                      default:
                        return (
                          <Page
                            appRoot={this.root}
                            editable={this.state.editable}
                            path={pathname}
                            deletePage={this.deletePage.bind(this)}
                            emitSave={this.emitSave.bind(this)}
                            ref={this.activePage}
                            headerControl={this.getShowPropertyValueHandler(
                              'header'
                            )}
                            footerControl={this.getShowPropertyValueHandler(
                              'footer'
                            )}
                            navigate={this.navigate.bind(this)}
                            onNotFound={this.handleNotFound.bind(this)}
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
              appRoot={this.root}
              admin={this.state.admin}
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
    if (window.location.pathname.match(/\/$/) === null) {
      window.location.pathname = window.location.pathname + '/'
      return
    }
    this.loadSettings()
    this.loadSession()
    this.setActivePathname(window.location.pathname)
    if (this.props.socketMode) {
      this.socket = io({ path: `${this.root}/socket.io` })
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
    }
    window.onpopstate = event => {
      this.setActivePathname(window.location.pathname)
    }
    window.preaction = {
      navigate: path => {
        this.navigate(path)
      },
      redirect: path => {
        this.redirect(path)
      },
      toggleEditMode: () => {
        this.toggleEditMode()
      }
    }
  }
}

App.propTypes = {
  root: PropTypes.string,
  socketMode: PropTypes.bool
}

export default App
