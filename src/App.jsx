import PropTypes from 'prop-types'
import React from 'react'
import axios from 'axios'
import globalthis from 'globalthis'
import io from 'socket.io-client'
import {
  BrowserRouter,
  StaticRouter,
  Route,
  Switch,
  NavLink,
  Link,
  Redirect,
} from 'react-router-dom'
import { Boilerplate, Modal, NavBar, Nav } from '@preaction/bootstrap-clips'
import { Input } from '@preaction/inputs'
import { MdCreate, MdPerson, MdSettings } from 'react-icons/md'
import { FaToggleOff, FaToggleOn } from 'react-icons/fa'

import Footer from './Footer.jsx'
import Header from './Header.jsx'
import Login from './Login.jsx'
import NotFound from './NotFound.jsx'
import Page from './Page.jsx'
import SiteSettings from './SiteSettings.jsx'

import { Quill } from '@preaction/inputs'

import absoluteUrl from './lib/absoluteUrl.js'
import getKeyFromTitle from './lib/getKeyFromTitle.js'

const ssr = typeof window === 'undefined'

// styles
if (!ssr) {
  require('animate.css/animate.min.css')
  require('bootstrap/dist/css/bootstrap.min.css')
  require('react-quill/dist/quill.bubble.css')
  require('react-quill/dist/quill.snow.css')
  require('./App.css')
}

const globalThis = globalthis()

// this is needed so relative links in WYSIWYG content will navigate correctly
function registerSmartLinkFormat(relativeLinkHandler = (url) => {}) {
  const LinkFormat = Quill.import('formats/link')
  if (LinkFormat) {
    class SmartLinkFormat extends LinkFormat {
      static create(value) {
        let node = super.create(value)
        node.addEventListener('click', (event) => {
          let href = node.getAttribute('href')
          if (absoluteUrl(href)) {
            // implicitly doin the needful here by
            // relying on default event handlers
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
}

class Router extends React.Component {
  render() {
    return ssr ? (
      <StaticRouter location={this.props.location} context={{}}>
        {this.props.children}
      </StaticRouter>
    ) : (
      <BrowserRouter basename={this.props.basename}>
        {this.props.children}
      </BrowserRouter>
    )
  }
}
Router.propTypes = {
  location: PropTypes.string,
  basename: PropTypes.string,
  children: PropTypes.node,
}

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activePage: null,
      activePathname: '',
      admin: false, // is user logged in as admin?
      authenticated: false, // is user logged in at all?
      editable: false,
      fallbackSettings: {},
      navigate: null, // used by react-router Redirect component during render
      newPage: {
        key: '',
        title: '',
      },
      redirect: null, // used by react-router Redirect component during render
      show: {
        header: true,
        footer: true,
        newPage: false, // for rendering the new page modal
        settings: false, // for rendering the settings modal
      },
      siteMap: {}, // for generating the navigation menu
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
        linkColor: '#ffffff',
        siteTitle: '',
        siteDescription: '',
        navTheme: 'dark',
        navPosition: 'fixed-top',
        tileBgImage: false,
        useBgImage: false,
      },
      token: '',
    }
    this.settingsUpdateTimer = null // used to set a delay on settings updates
    this.socket = null // for socket.io-enabled features
    this.activePage = React.createRef()
    this.header = React.createRef()
    this.footer = React.createRef()
    registerSmartLinkFormat((href) => {
      if (!this.state.editable) {
        this.navigate(href)
      }
    })

    if (this.props.initPath) {
      this.state.activePathname = this.props.initPath
    }
    if (this.props.initPage) {
      this.state.activePage = JSON.parse(JSON.stringify(this.props.initPage))
      this.state.siteMap = JSON.parse(
        JSON.stringify(this.props.initPage.siteMap)
      )
      this.state.fallbackSettings = JSON.parse(
        JSON.stringify(this.props.initPage.fallbackSettings)
      )
    }
  }

  // calls the server to add a page to the database
  addPage(page) {
    if (page.key) {
      axios
        .post(`${this.root}/api/page?token=${this.state.token}`, page)
        .then((response) => {
          if (response.data) {
            this.loadSiteMap()
          }
        })
        .then(() => {
          this.emitSave()
        })
    }
  }

  // hydrates values of a new page object before calling addPage
  createPage(newPage) {
    if (!newPage.title) {
      return
    }
    let key = newPage.key
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
    let page = {
      key,
      title: newPage.title,
      pageType,
      parentId,
    }
    this.addPage(page)
  }

  deletePage(page) {
    if (this.editable) {
      axios
        .delete(`${this.root}/api/page/${page.id}?token=${this.state.token}`)
        .then((response) => {
          if (response.status === 200) {
            this.setState(
              (state) => {
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

  // tell the server to reload all listening clients
  emitForceReload(callback = () => {}) {
    if (this.props.socketMode) {
      this.socket.emit('force-reload', () => {
        callback()
      })
    } else {
      callback()
    }
  }

  // tell the server that an edit was made
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

  // these are settings which the application falls back on
  // when a page doesn't have an override for it
  get fallbackSettings() {
    let s = Object.assign({}, this.state.siteSettings)
    if (this.state.fallbackSettings && this.state.activePathname !== '/home/') {
      Object.assign(s, this.state.fallbackSettings)
    }
    return s
  }

  // for navigation
  get menu() {
    let menu = []
    if (this.settings.navPosition !== 'fixed-top') {
      menu.push({
        name: 'Home',
        href: `/${this.siteMap.path}${this.siteMap.key === 'home' ? '' : '/'}`,
        component: Link,
        order: -100,
        active:
          this.state.activePathname === '/home/' ||
          this.state.activePathname === `/${this.siteMap.path}/`,
        onClick: (e) => {
          e.preventDefault()
          this.navigate(
            `/${this.siteMap.path}${this.siteMap.key === 'home' ? '' : '/'}`
          )
        },
      })
    }
    this.siteMap.children.forEach((page) => {
      if (page.settings.includeInNav) {
        let subMenu = []
        page.children.forEach((pg) => {
          if (pg.settings.includeInNav) {
            subMenu.push({
              name: pg.title,
              href: `/${pg.path}/`,
              component: NavLink,
              order: Number(pg.settings.navOrdering || 0),
              onClick: (e) => {
                e.preventDefault()
                this.navigate(`/${pg.path}/`)
              },
            })
          }
        })
        subMenu.sort((a, b) => {
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
        menu.push({
          name: page.title,
          href: `/${page.path}/`,
          component: NavLink,
          order: Number(page.settings.navOrdering || 0),
          onClick: (e) => {
            e.preventDefault()
            this.navigate(`/${page.path}/`)
          },
          subMenu: subMenu.length ? subMenu : null,
        })
      }
    })
    if (this.state.admin) {
      let adminSubmenu = []
      adminSubmenu.push({
        name: 'Logout',
        onClick: (e) => {
          e.preventDefault()
          this.logout()
        },
      })

      menu.push({
        name: (
          <span>
            {this.state.editable ? <FaToggleOn /> : <FaToggleOff />} Edit
          </span>
        ),
        onClick: (e) => {
          e.preventDefault()
          this.toggleEditMode()
        },
        toggleParent: false,
        order: 100,
      })

      if (this.state.editable) {
        menu.push({
          name: (
            <span>
              <MdCreate /> New Page
            </span>
          ),
          onClick: (e) => {
            e.preventDefault()
            this.toggleNewPage()
          },
          order: 200,
        })
        menu.push({
          name: (
            <span>
              <MdSettings /> Settings
            </span>
          ),
          onClick: (e) => {
            e.preventDefault()
            this.toggleSettings()
          },
          order: 300,
        })
      }

      menu.push({
        name: (
          <span>
            <MdPerson /> User
          </span>
        ),
        subMenu: adminSubmenu,
        order: 400,
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

  // this is used to set a subpath configuration for reverse proxies
  get root() {
    return this.props.root || ''
  }

  // page overrides, mapped to fallback settings
  get settings() {
    let s = Object.assign({}, this.fallbackSettings)
    if (
      this.state.activePage &&
      this.state.activePathname !== '/home' &&
      this.state.activePathname !== '/'
    ) {
      Object.keys(this.state.activePage.settings).forEach((key) => {
        switch (key) {
          case 'cssOverrides':
            // cssOverrides should be extended from fallbackSettings
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

  // used when generating the navigation menu
  get siteMap() {
    let sm = {
      key: 'home',
      path: '',
      children: [],
    }
    Object.assign(sm, this.state.siteMap)
    return sm
  }

  // for new page modal
  getNewPageValueHandler(key) {
    return (value) => {
      this.setState((state) => {
        state.newPage[key] = value
        if (key === 'title') {
          state.newPage.key = getKeyFromTitle(value)
        }
        return state
      })
    }
  }

  // for site settings modal
  getSettingsValueHandler(key) {
    return (value) => {
      if (key === 'siteTitle') {
        let splitTitle = document.title.split(' | ')
        if (splitTitle.length < 2) {
          document.title = value
        } else {
          document.title = `${splitTitle[0]} | ${value}`
        }
      }
      this.setState(
        (state) => {
          state.siteSettings[key] = value
          return state
        },
        () => {
          clearTimeout(this.settingsUpdateTimer)
          this.settingsUpdateTimer = setTimeout(() => {
            axios
              .post(
                `${this.root}/api/settings?token=${this.state.token}`,
                this.state.siteSettings
              )
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

  // so page components can control showing the header and footer
  getShowPropertyValueHandler(key) {
    return (value) => {
      this.setState((state) => {
        state.show[key] = value
        return state
      })
    }
  }

  // handler for page api request errors
  handlePageError() {
    this.setState((state) => {
      state.activePage = null
      return state
    })
  }

  // handler for 404s
  handleNotFound(path) {
    this.setState((state) => {
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
      axios.get(`${this.root}/api/session`).then((response) => {
        if (response.data && response.data.authenticated) {
          this.setState((state) => {
            state.authenticated = true
            if (response.data.admin) {
              state.admin = true
            }
            return state
          }, conditionallyResolve)
        }
        if (response.data && response.data.token) {
          this.setState((state) => {
            state.token = response.data.token
            return state
          }, conditionallyResolve)
        }
      })
    })
  }

  loadSettings(path = '') {
    axios.get(`${this.root}/api/settings`).then((response) => {
      if (response.data) {
        this.setState((state) => {
          state.siteSettings = response.data
          return state
        })
      }
    })
    // for 404s
    if (path) {
      axios
        .get(`${this.root}/api/page/settings/by-key${path}`)
        .then((response) => {
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
          .then((response) => {
            this.setState(
              (state) => {
                state.siteMap = response.data
                return state
              },
              () => {
                resolve(this.state.siteMap)
              }
            )
          })
      } else if (path) {
        // for 404s
        axios
          .get(`${this.root}/api/page/sitemap/by-key${path}`)
          .then((response) => {
            this.setState((state) => {
              state.siteMap = response.data
              return state
            })
          })
      }
    })
  }

  logout() {
    axios.get(`${this.root}/api/logout?token=${this.state.token}`).then(() => {
      this.setState((state) => {
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
    if (path.indexOf(this.root) === 0) {
      let regex = new RegExp(`^${this.root}`)
      path = path.replace(regex, '')
    }
    if (path !== this.state.activePathname) {
      this.setState(
        (state) => {
          state.navigate = path
          state.activePathname = path
          return state
        },
        () => {
          this.setState(
            (state) => {
              state.navigate = false
              return state
            },
            () => {
              this.trackPageView()
            }
          )
        }
      )
    }
  }

  toggleEditMode() {
    this.setState((state) => {
      state.editable = !state.editable
      return state
    })
  }

  toggleSettings() {
    if (
      this.state.activePathname === '/home/' ||
      this.state.activePathname === '/'
    ) {
      this.setState((state) => {
        state.show.settings = !state.show.settings
        return state
      })
    } else if (this.activePage && this.activePage.current) {
      this.activePage.current.toggleSettings()
    }
  }

  toggleNewPage() {
    this.setState((state) => {
      state.show.newPage = !state.show.newPage
      return state
    })
  }

  redirect(path) {
    this.setState(
      (state) => {
        state.redirect = path
        return state
      },
      () => {
        this.setState(
          (state) => {
            state.redirect = false
            return state
          },
          () => {
            this.trackPageView()
          }
        )
      }
    )
  }

  reload() {
    this.loadSettings()
    if (this.activePage.current) {
      this.header.current.reload()
      this.activePage.current.reload()
      this.footer.current.reload()
    }
  }

  setActivePage(page) {
    this.setState((state) => {
      state.activePage = page
      state.siteMap = JSON.parse(JSON.stringify(page.siteMap))
      state.fallbackSettings = JSON.parse(JSON.stringify(page.fallbackSettings))
      return state
    })
  }

  setActivePathname(pathname) {
    this.setState((state) => {
      state.activePathname = pathname
      return state
    })
  }

  setFallbackSettings(settings) {
    this.setState((state) => {
      state.fallbackSettings = settings
      return state
    })
  }

  setToken(token) {
    this.setState({ token })
  }

  trackPageView() {
    if (
      this.settings.useGoogleAnalytics &&
      this.settings.googleAnalyticsTrackingId &&
      globalThis.gtag
    ) {
      globalThis.gtag('config', this.settings.googleAnalyticsTrackingId, {
        page_path: globalThis.location.pathname,
      })
    }
  }

  render() {
    return (
      <div
        className={`App ${this.state.editable ? 'editable' : 'non-editable'}`}
      >
        <Router basename={`${this.root}/`} location={this.props.initPath}>
          <div>
            {this.state.redirect ? <Redirect to={this.state.redirect} /> : ''}
            {this.state.navigate ? (
              <Redirect to={this.state.navigate} push />
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
                  onClick: (e) => {
                    e.preventDefault()
                    this.navigate(
                      `/${this.siteMap.path}${
                        this.siteMap.key === 'home' ? '' : '/'
                      }`
                    )
                  },
                }}
                menu={this.menu}
              />
            ) : (
              ''
            )}
            <Boilerplate
              noContain={this.settings.maxWidthLayout}
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
                      className={this.settings.navClassName}
                    />
                  ) : (
                    ''
                  )}
                  <Header
                    activePage={this.state.activePage}
                    appRoot={this.root}
                    editable={this.state.editable}
                    emitSave={this.emitSave.bind(this)}
                    navigate={this.navigate.bind(this)}
                    settings={this.settings}
                    show={this.settings.showHeader}
                    token={this.state.token}
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
                      className={this.settings.navClassName}
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
                  navigate={this.navigate.bind(this)}
                  settings={this.settings}
                  ref={this.footer}
                  show={this.settings.showFooter}
                  token={this.state.token}
                />
              }
            >
              {this.state.editable ? <hr /> : ''}
              {this.state.editable ? (
                <h3>Page: {this.state.activePathname}</h3>
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
                    navigate={this.navigate.bind(this)}
                    setActivePathname={this.setActivePathname.bind(this)}
                    setActivePage={this.setActivePage.bind(this)}
                    token={this.state.token}
                    initPage={this.props.initPage}
                  />
                </Route>
                <Route exact path='/login'>
                  <div className='login'>
                    <Login
                      appRoot={this.root}
                      settings={this.state.siteSettings}
                      setToken={this.setToken.bind(this)}
                      token={this.state.token}
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
                            onError={this.handlePageError.bind(this)}
                            onNotFound={this.handleNotFound.bind(this)}
                            setActivePathname={this.setActivePathname.bind(
                              this
                            )}
                            setActivePage={this.setActivePage.bind(this)}
                            token={this.state.token}
                            initPage={this.props.initPage}
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
          {this.settings.init
            ? `\
          html { background-color: transparent }
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
              emitForceReload={this.emitForceReload.bind(this)}
              emitSave={this.emitSave.bind(this)}
              settings={this.state.siteSettings}
              getSettingsValueHandler={this.getSettingsValueHandler.bind(this)}
              token={this.state.token}
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
                      this.createPage(this.state.newPage)
                      this.toggleNewPage()
                      this.setState((state) => {
                        state.newPage.title = ''
                        state.newPage.key = ''
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
            <form onSubmit={(e) => e.preventDefault()}>
              <Input
                type='text'
                label='Page Title'
                value={this.state.newPage.title}
                valueHandler={this.getNewPageValueHandler('title')}
                required
              />
              <Input
                type='text'
                label='URL Path'
                value={this.state.newPage.key}
                valueHandler={this.getNewPageValueHandler('key')}
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
    // redirect with trailing slash if it's not there
    if (globalThis.location) {
      if (globalThis.location.pathname.match(/\/$/) === null) {
        globalThis.location.pathname = globalThis.location.pathname + '/'
        return
      }
    }
    // get everything loaded
    this.loadSettings()
    this.loadSession()
    this.setActivePathname(this.props.initPath)
    // set up socket.io-enabled features
    if (this.props.socketMode) {
      this.socket = io({ path: `${this.root}/socket.io` })
      this.socket.on('load', () => {
        if (!this.state.editable) {
          this.reload()
        }
      })
      this.socket.on('reload-app', () => {
        globalThis.location.reload()
      })
    }
    // handle state changes on back/forward browser buttons
    if (typeof globalThis.onpopstate !== 'undefined') {
      globalThis.onpopstate = (event) => {
        this.setActivePathname(globalThis.location.pathname)
      }
    }
    globalThis.preaction = {
      navigate: this.navigate.bind(this),
      redirect: this.redirect.bind(this),
      reload: this.reload.bind(this),
      toggleEditMode: this.toggleEditMode.bind(this),
      toggleNewPage: this.toggleNewPage.bind(this),
      toggleSettings: this.toggleSettings.bind(this),
    }
  }
}

App.propTypes = {
  initPage: PropTypes.object,
  initPath: PropTypes.string.isRequired,
  root: PropTypes.string,
  socketMode: PropTypes.bool,
}

export default App
