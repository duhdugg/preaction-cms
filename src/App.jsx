import './style/base'
import PropTypes from 'prop-types'
import React from 'react'
import axios from 'axios'
import globalthis from 'globalthis'
import loadable from '@loadable/component'
import {
  BrowserRouter,
  StaticRouter,
  MemoryRouter,
  Route,
  Switch,
  NavLink,
  Link,
  Redirect,
} from 'react-router-dom'
import {
  getGradientClassName,
  getThemeClassName,
  joinClassNames,
  Boilerplate,
  Modal,
  NavBar,
  Nav,
  Spinner,
} from '@preaction/bootstrap-clips'
import { MdCreate, MdPerson, MdSettings } from 'react-icons/md'
import { FaToggleOff, FaToggleOn } from 'react-icons/fa'

import Footer from './Footer.jsx'
import Header from './Header.jsx'
import Hero from './Hero.jsx'
import Login from './Login.jsx'
import NotFound from './NotFound.jsx'
import Page from './Page.jsx'

import absoluteUrl from './lib/absoluteUrl.js'
import getLinkClassName from './lib/getLinkClassName.js'
import getSaneKey from './lib/getSaneKey.js'
import { menuExtensions } from './ext'
import env from './lib/env.js'

// import styling
import './style/cms.scss'
import './style/custom.js'

const NewPage = loadable(() => import('./settingsModules.js'), {
  fallback: <Spinner size='3.25' />,
  resolveComponent: (module) => module.NewPage,
})
const SiteSettings = loadable(() => import('./settingsModules.js'), {
  fallback: <Spinner size='3.25' />,
  resolveComponent: (module) => module.SiteSettings,
})

const ssr = typeof window === 'undefined'
const test = env.NODE_ENV === 'test'

const globalThis = globalthis()

// this is needed so relative links in WYSIWYG content will navigate correctly
function setGlobalRelativeLinkHandler(relativeLinkHandler) {
  const findAnchor = (element) => {
    if (element.tagName === 'A') {
      return element
    } else if (element.parentElement) {
      return findAnchor(element.parentElement)
    } else {
      return null
    }
  }
  if (typeof document !== 'undefined') {
    document.addEventListener('click', (event) => {
      const anchor = findAnchor(event.target)
      if (anchor !== null) {
        const classList = new Array(...anchor.classList)
        if (
          !classList.includes('nav-link') &&
          !classList.includes('dropdown-item')
        ) {
          const href = anchor.attributes.href.value
          if (
            href &&
            !absoluteUrl(href) &&
            !event.shiftKey &&
            !event.ctrlKey &&
            !event.altKey
          ) {
            event.preventDefault()
            relativeLinkHandler(anchor.attributes.href.value)
          }
        }
      }
    })
  }
}

class Router extends React.Component {
  render() {
    return ssr ? (
      <StaticRouter
        basename={this.props.basename}
        location={this.props.location}
        context={{}}
      >
        {this.props.children}
      </StaticRouter>
    ) : test ? (
      <MemoryRouter initialEntries={[this.props.location]}>
        {this.props.children}
      </MemoryRouter>
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
        hero: false,
        newPage: false, // for rendering the new page modal
        settings: false, // for rendering the settings modal
      },
      siteMap: {}, // for generating the navigation menu
      siteSettings: {
        footerPath: '/home/footer/',
        headerPath: '/home/header/',
        heroPath: '/home/hero/',
        siteTitle: '',
        navbarTheme: 'dark',
        navPosition: 'fixed-top',
      },
      token: '',
      windowId: `${+new Date()}:${Math.random()}`,
    }
    this.settingsUpdateTimer = null // used to set a delay on settings updates
    this.socket = null // for socket.io-enabled features
    this.activePage = React.createRef()
    this.header = React.createRef()
    this.footer = React.createRef()
    this.hero = React.createRef()

    setGlobalRelativeLinkHandler((href) => {
      if (!this.state.editable) {
        this.navigate(href)
      }
    })

    if (this.props.initPath) {
      this.state.activePathname = this.props.initPath
    }
    if (this.props.initSettings) {
      this.state.siteSettings = JSON.parse(
        JSON.stringify(this.props.initSettings)
      )
    }
    if (this.props.initPage) {
      this.state.activePage = JSON.parse(JSON.stringify(this.props.initPage))
      this.state.siteMap = JSON.parse(
        JSON.stringify(this.props.initPage.siteMap || {})
      )
      this.state.fallbackSettings = JSON.parse(
        JSON.stringify(this.props.initPage.fallbackSettings || {})
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
          this.emitSave({ action: 'add-page' })
          if (this.state.activePage) {
            this.activePage.current.reload()
          }
        })
    }
  }

  // hydrates values of a new page object before calling addPage
  createPage(newPage) {
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
                this.emitSave({ action: 'delete-page', pageId: page.id })
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
  emitSave(data = {}, callback = () => {}) {
    if (this.props.socketMode) {
      this.socket.emit(
        'save',
        Object.assign({}, data, { windowId: this.state.windowId }),
        () => {
          this.loadSiteMap()
          callback()
        }
      )
    } else {
      this.loadSiteMap()
      callback()
    }
  }

  // these are settings which the application falls back on
  // when a page doesn't have an override for it
  get fallbackSettings() {
    let s = Object.assign({}, this.state.siteSettings)
    if (
      this.state.fallbackSettings &&
      !['/', '/home/'].includes(this.state.activePathname)
    ) {
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
        className: 'nav-page-home',
        href: `/${this.siteMap.path}${this.siteMap.key === 'home' ? '' : '/'}`,
        component: Link,
        order: -100,
        active:
          this.state.activePathname === '/' ||
          this.state.activePathname === '/home/' ||
          this.state.activePathname === `/${this.siteMap.path}/`,
        onClick: (e) => {
          if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
            e.preventDefault()
            this.navigate(
              `/${this.siteMap.path}${this.siteMap.key === 'home' ? '' : '/'}`
            )
          }
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
              className: `nav-page-${page.key}-subpage-${pg.key}`,
              href: `/${pg.path}/`,
              component: NavLink,
              // active: this.state.activePathname.indexOf(`/${pg.path}/`) === 0,
              order: Number(pg.settings.navOrdering || 0),
              onClick: (e) => {
                if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
                  e.preventDefault()
                  this.navigate(`/${pg.path}/`)
                }
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
          className: `nav-page-${page.key}`,
          href: `/${page.path}/`,
          component: NavLink,
          // active:
          //   this.state.activePathname === `/${page.path}/` ||
          //   this.state.activePathname.indexOf(`/${page.path}/`) === 0,
          order: Number(page.settings.navOrdering || 0),
          onClick: (e) => {
            if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
              e.preventDefault()
              this.navigate(`/${page.path}/`)
            }
          },
          subMenu: subMenu.length ? subMenu : null,
        })
      }
    })
    if (this.state.admin) {
      let adminSubmenu = []
      adminSubmenu.push({
        name: 'Logout',
        className: 'nav-logout',
        onClick: (e) => {
          e.preventDefault()
          this.logout()
        },
      })

      menu.push({
        className: 'nav-toggle-edit',
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
          className: 'nav-new-page',
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
          className: 'nav-settings',
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
        className: 'nav-user',
        name: (
          <span>
            <MdPerson /> User
          </span>
        ),
        subMenu: adminSubmenu,
        order: 400,
      })
    }

    for (let key of Object.keys(menuExtensions)) {
      menu.push(
        Object.assign(
          { className: `nav-extension-${key}` },
          menuExtensions[key]({
            appRoot: this.root,
            editable: this.state.editable,
            navigate: this.navigate.bind(this),
            page: this.state.activePage,
            settings: this.settings,
            token: this.state.token,
          })
        )
      )
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
      Object.assign(s, this.state.activePage.settings)
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
          state.newPage.key = getSaneKey(value)
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
                this.emitSave({ action: 'update-settings' })
              })
          }, 1000)
        }
      )
    }
  }

  // so page components can control showing the header, footer, and hero
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
    const regex = new RegExp(`^${this.root}`)
    if (path.match(regex)) {
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
              // track navigation to login
              if (path === '/login/') {
                this.trackPageView()
              }
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
        this.setState((state) => {
          state.redirect = false
          return state
        })
      }
    )
  }

  reload(data = { action: 'all' }) {
    switch (data.action) {
      case 'all':
        this.loadSettings()
        this.reloadRef('activePage')
        this.reloadRef('header')
        this.reloadRef('footer')
        this.reloadRef('hero')
        break
      case 'add-page':
        this.reloadRef('activePage')
        break
      case 'delete-page':
        this.reloadRef('activePage')
        break
      case 'update-settings':
        this.loadSettings()
        this.reloadRef('activePage')
        break
      default:
        if (
          this.activePage.current &&
          this.activePage.current.state.page &&
          data.pageId === this.activePage.current.state.page.id
        ) {
          this.reloadRef('activePage')
        } else if (
          this.header.current &&
          this.header.current.page.current.state.page &&
          data.pageId === this.header.current.page.current.state.page.id
        ) {
          this.reloadRef('header')
        } else if (
          this.footer.current &&
          this.footer.current.page.current.state.page &&
          data.pageId === this.footer.current.page.current.state.page.id
        ) {
          this.reloadRef('footer')
        } else if (
          this.hero.current &&
          this.hero.current.page.current.state.page &&
          data.pageId === this.hero.current.page.current.state.page.id
        ) {
          this.reloadRef('hero')
        }
        break
    }
  }

  reloadRef(key) {
    if (this[key].current) {
      this[key].current.reload()
    }
  }

  setActivePage(page) {
    this.setState((state) => {
      state.activePage = page
      state.siteMap = JSON.parse(JSON.stringify(page.siteMap || {}))
      state.fallbackSettings = JSON.parse(
        JSON.stringify(page.fallbackSettings || {})
      )
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

  submitNewPage() {
    this.createPage(this.state.newPage)
    this.toggleNewPage()
    this.setState((state) => {
      state.newPage.title = ''
      state.newPage.key = ''
      return state
    })
  }

  trackPageView() {
    if (globalThis.gtag && globalThis.gtagId) {
      globalThis.gtag('config', globalThis.gtagId, {
        page_path: globalThis.location.pathname,
      })
    }
  }

  render() {
    const navPositionClassName = {
      'fixed-top': 'nav-position-fixed-top',
      'above-header': 'nav-position-above-header',
      'below-header': 'nav-position-below-header',
    }[this.settings.navPosition]
    const navActiveSubmenuThemeClassName = {
      blue: 'nav-active-submenu-theme-blue',
      cyan: 'nav-active-submenu-theme-cyan',
      danger: 'nav-active-submenu-theme-danger',
      dark: 'nav-active-submenu-theme-dark',
      gray: 'nav-active-submenu-theme-gray',
      'gray-dark': 'nav-active-submenu-theme-gray-dark',
      green: 'nav-active-submenu-theme-green',
      indigo: 'nav-active-submenu-theme-indigo',
      info: 'nav-active-submenu-theme-info',
      orange: 'nav-active-submenu-theme-orange',
      pink: 'nav-active-submenu-theme-pink',
      purple: 'nav-active-submenu-theme-purple',
      primary: 'nav-active-submenu-theme-primary',
      red: 'nav-active-submenu-theme-red',
      secondary: 'nav-active-submenu-theme-secondary',
      success: 'nav-active-submenu-theme-success',
      teal: 'nav-active-submenu-theme-teal',
      warning: 'nav-active-submenu-theme-warning',
      yellow: 'nav-active-submenu-theme-yellow',
    }[this.settings.navActiveSubmenuTheme]
    const navActiveTabThemeClassName = {
      blue: 'nav-active-tab-theme-blue',
      cyan: 'nav-active-tab-theme-cyan',
      danger: 'nav-active-tab-theme-danger',
      dark: 'nav-active-tab-theme-dark',
      gray: 'nav-active-tab-theme-gray',
      'gray-dark': 'nav-active-tab-theme-gray-dark',
      indigo: 'nav-active-tab-theme-indigo',
      info: 'nav-active-tab-theme-info',
      orange: 'nav-active-tab-theme-orange',
      light: 'nav-active-tab-theme-light',
      pink: 'nav-active-tab-theme-pink',
      purple: 'nav-active-tab-theme-purple',
      primary: 'nav-active-tab-theme-primary',
      red: 'nav-active-tab-theme-red',
      secondary: 'nav-active-tab-theme-secondary',
      success: 'nav-active-tab-theme-success',
      teal: 'nav-active-tab-theme-teal',
      warning: 'nav-active-tab-theme-warning',
      white: 'nav-active-tab-theme-white',
      yellow: 'nav-active-tab-theme-yellow',
    }[this.settings.navActiveTabTheme]
    return (
      <div
        className={joinClassNames(
          'App',
          this.state.editable ? 'editable' : 'non-editable',
          navPositionClassName,
          navActiveSubmenuThemeClassName,
          navActiveTabThemeClassName
        )}
      >
        <Router basename={this.root} location={this.state.activePathname}>
          <div>
            {this.state.redirect ? <Redirect to={this.state.redirect} /> : ''}
            {this.state.navigate ? (
              <Redirect to={this.state.navigate} push />
            ) : (
              ''
            )}
            <Boilerplate
              navBar={
                this.settings.navPosition === 'fixed-top' ? (
                  <NavBar
                    fluid={this.settings.maxWidthNav}
                    fixedTo='top'
                    theme={this.settings.navbarTheme}
                    brand={{
                      name: this.settings.siteTitle,
                      href: `/${this.siteMap.path}${
                        this.siteMap.key === 'home' ? '' : '/'
                      }`,
                      onClick: (e) => {
                        if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
                          e.preventDefault()
                          this.navigate(
                            `/${this.siteMap.path}${
                              this.siteMap.key === 'home' ? '' : '/'
                            }`
                          )
                        }
                      },
                    }}
                    menu={this.menu}
                  />
                ) : undefined
              }
              header={
                <div className={getLinkClassName(this.settings.headerTheme)}>
                  {this.settings.navPosition === 'above-header' ? (
                    <Nav
                      menu={this.menu}
                      type={this.settings.navType}
                      align={this.settings.navAlignment}
                      justify={this.settings.navSpacing === 'justify'}
                      fill={this.settings.navSpacing === 'fill'}
                      collapsible={this.settings.navCollapsible}
                    />
                  ) : (
                    ''
                  )}
                  <Header
                    appRoot={this.root}
                    editable={this.state.editable}
                    emitSave={this.emitSave.bind(this)}
                    navigate={this.navigate.bind(this)}
                    settings={this.settings}
                    show={this.settings.showHeader}
                    token={this.state.token}
                    ref={this.header}
                    initPage={
                      this.props.initPage
                        ? this.props.initPage.header
                        : undefined
                    }
                  />
                  {this.settings.navPosition === 'below-header' ? (
                    <Nav
                      menu={this.menu}
                      type={this.settings.navType}
                      align={this.settings.navAlignment}
                      justify={this.settings.navSpacing === 'justify'}
                      fill={this.settings.navSpacing === 'fill'}
                      collapsible={this.settings.navCollapsible}
                    />
                  ) : undefined}
                </div>
              }
              hero={
                this.settings.showHero ? (
                  <div
                    className={getLinkClassName(
                      this.settings.heroTheme || this.settings.headerTheme
                    )}
                  >
                    <Hero
                      appRoot={this.root}
                      editable={this.state.editable}
                      emitSave={this.emitSave.bind(this)}
                      navigate={this.navigate.bind(this)}
                      settings={this.settings}
                      ref={this.hero}
                      show={this.settings.showHero}
                      token={this.state.token}
                      initPage={
                        this.props.initPage
                          ? this.props.initPage.hero
                          : undefined
                      }
                    />
                  </div>
                ) : (
                  ''
                )
              }
              heroPosition={this.settings.heroPosition}
              heroTheme={this.settings.heroTheme || undefined}
              heroGradient={this.settings.heroGradient || false}
              headerTheme={this.settings.headerTheme || undefined}
              headerGradient={this.settings.headerGradient || false}
              mainTheme={this.settings.mainTheme || undefined}
              mainGradient={this.settings.mainGradient || false}
              footerTheme={this.settings.footerTheme || undefined}
              footerGradient={this.settings.footerGradient || false}
              footer={
                <div className={getLinkClassName(this.settings.footerTheme)}>
                  <Footer
                    appRoot={this.root}
                    editable={this.state.editable}
                    emitSave={this.emitSave.bind(this)}
                    navigate={this.navigate.bind(this)}
                    settings={this.settings}
                    ref={this.footer}
                    show={this.settings.showFooter}
                    token={this.state.token}
                    initPage={
                      this.props.initPage
                        ? this.props.initPage.footer
                        : undefined
                    }
                  />
                </div>
              }
              fluid={{
                footerContainer: this.settings.maxWidthFooterContainer,
                headerContainer: this.settings.maxWidthHeaderContainer,
                heroContainer: this.settings.maxWidthHeroContainer,
                mainContainer: this.settings.maxWidthMainContainer,
              }}
            >
              <div
                className={joinClassNames(
                  'main-body',
                  getLinkClassName(this.settings.mainTheme || '')
                )}
              >
                {this.state.editable ? <hr /> : ''}
                {this.state.editable ? (
                  <div className='font-weight-bold'>
                    Main: {this.state.activePathname}
                  </div>
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
                      heroControl={this.getShowPropertyValueHandler('hero')}
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
                        loadSession={this.loadSession.bind(this)}
                        navigate={this.navigate.bind(this)}
                        settings={this.state.siteSettings}
                        setToken={this.setToken.bind(this)}
                        token={this.state.token}
                      />
                    </div>
                  </Route>
                  <Route
                    render={({ location }) => {
                      const root = new RegExp(`^${this.root}`)
                      const pathname = location.pathname.replace(root, '')
                      const splitPath = pathname
                        .replace(/(^\/|\/$)/g, '')
                        .split('/')
                      const key = splitPath[splitPath.length - 1]
                      switch (key) {
                        case 'home':
                        case 'header':
                        case 'footer':
                        case 'hero':
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
                              heroControl={this.getShowPropertyValueHandler(
                                'hero'
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
                              init404={this.props.init404}
                              initError={this.props.initError}
                            />
                          )
                      }
                    }}
                  />
                </Switch>
                {this.state.editable ? <hr /> : ''}
              </div>
            </Boilerplate>
          </div>
        </Router>
        <div className='site-settings-modal-container'>
          <Modal
            title='Site Settings'
            show={this.state.editable && this.state.show.settings}
            setShow={(value) => {
              this.setState((state) => {
                state.show.settings = value
                return state
              })
            }}
            size='lg'
            headerTheme='primary'
            bodyTheme='white'
            footerTheme='dark'
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
            {this.state.editable && this.state.show.settings ? (
              <SiteSettings
                appRoot={this.root}
                admin={this.state.admin}
                emitForceReload={this.emitForceReload.bind(this)}
                settings={this.state.siteSettings}
                getSettingsValueHandler={this.getSettingsValueHandler.bind(
                  this
                )}
                show={this.state.show.settings}
                token={this.state.token}
              />
            ) : (
              ''
            )}
          </Modal>
        </div>
        <div className='new-page-modal-container'>
          <Modal
            title='New Page'
            show={this.state.editable && this.state.show.newPage}
            setShow={() => {}}
            headerTheme='success'
            bodyTheme='white'
            footerTheme='dark'
            hideCloseButton={true}
            footer={
              <div>
                <button
                  type='button'
                  className='btn btn-success'
                  onClick={() => {
                    const btn = document.querySelector(
                      '.new-page-modal-container form .btn.d-none'
                    )
                    btn.click()
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
            {this.state.editable && this.state.show.newPage ? (
              <NewPage
                activePathname={this.state.activePathname}
                getValueHandler={this.getNewPageValueHandler.bind(this)}
                newPage={this.state.newPage}
                submit={this.submitNewPage.bind(this)}
              />
            ) : (
              ''
            )}
          </Modal>
        </div>
      </div>
    )
  }

  componentDidMount() {
    // get everything loaded
    if (!this.props.initSettings) {
      this.loadSettings()
    }
    this.loadSession()
    this.setActivePathname(this.props.initPath)
    // set up socket.io-enabled features
    if (this.props.socketMode && globalThis.io) {
      this.socket = globalThis.io({ path: `${this.root}/socket.io` })
      this.socket.on('load', (data) => {
        if (this.state.windowId !== data.windowId) {
          this.reload(data)
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
    if (test) {
      // provide interface for testing functionality which cannot be reached due to @loadable/component
      Object.assign(globalThis.preaction, {
        deletePage: this.deletePage.bind(this),
        getSettingsValueHandler: this.getSettingsValueHandler.bind(this),
        getState: () => this.state,
        setState: this.setState.bind(this),
        submitNewPage: this.submitNewPage.bind(this),
      })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const bodyClasses = []
    // set path class on body to allow path-specific styling
    if (this.state.activePathname === '/login/') {
      bodyClasses.push('path-login-')
    } else if (this.state.activePage) {
      bodyClasses.push(
        `path-${getSaneKey(this.state.activePage.tree.path || 'undefined')}-`
      )
    }
    if (this.settings.bodyTheme) {
      bodyClasses.push(getThemeClassName(this.settings.bodyTheme))
      const linkClass = getLinkClassName(this.settings.bodyTheme)
      if (linkClass) {
        bodyClasses.push(linkClass)
      }
    }
    if (this.settings.bodyGradient) {
      bodyClasses.push(getGradientClassName(true))
    }
    document.body.className = bodyClasses.join(' ')
    // track page view if new activePage is set
    if (
      this.state.activePage &&
      this.state.activePage !== prevState.activePage
    ) {
      this.trackPageView()
    }
  }
}

App.propTypes = {
  init404: PropTypes.bool,
  initError: PropTypes.string,
  initPage: PropTypes.object,
  initPath: PropTypes.string.isRequired,
  initSettings: PropTypes.object,
  root: PropTypes.string,
  socketMode: PropTypes.bool,
}

export default App
