import './style/base'
import PropTypes from 'prop-types'
import React from 'react'
import axios from 'axios'
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

const copyObj = (obj) => JSON.parse(JSON.stringify(obj))

// this is needed so links in WYSIWYG content will go through navigate() correctly
function setGlobalLinkHandler(linkHandler) {
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
          if (href && !event.shiftKey && !event.ctrlKey && !event.altKey) {
            event.preventDefault()
            linkHandler(href)
          }
        }
      }
    })
  }
}

function Router(props) {
  return ssr ? (
    <StaticRouter
      basename={props.basename}
      location={props.location}
      context={{}}
    >
      {props.children}
    </StaticRouter>
  ) : test ? (
    <MemoryRouter initialEntries={[props.location]}>
      {props.children}
    </MemoryRouter>
  ) : (
    <BrowserRouter basename={props.basename}>{props.children}</BrowserRouter>
  )
}
Router.propTypes = {
  location: PropTypes.string,
  basename: PropTypes.string,
  children: PropTypes.node,
}

function App(props) {
  const [activePage, setActivePage] = React.useState(
    props.initPage ? copyObj(props.initPage) : null
  )
  const [activePathname, setActivePathname] = React.useState(
    props.initPath || ''
  )
  const [admin, setAdmin] = React.useState(false)
  const [authenticated, setAuthenticated] = React.useState(false)
  const [editable, setEditable] = React.useState(false)
  const [fallbackSettings, setFallbackSettings] = React.useState(
    props.initPage && props.initPage.fallbackSettings
      ? copyObj(props.initPage.fallbackSettings)
      : {}
  )
  const [navigate, setNavigate] = React.useState(null)
  const [newPage, setNewPage] = React.useState({ key: '', title: '' })
  const [redirect, setRedirect] = React.useState(null)
  const [show, setShow] = React.useState({
    header: true,
    footer: true,
    hero: false,
    newPage: false,
    settings: false,
  })
  const [siteMap, setSiteMap] = React.useState(
    props.initPage && props.initPage.siteMap
      ? copyObj(props.initPage.siteMap)
      : {}
  )
  const [siteSettings, setSiteSettings] = React.useState(
    props.initSettings
      ? copyObj(props.initSettings)
      : {
          footerPath: '/home/footer/',
          headerPath: '/home/header/',
          heroPath: '/home/hero/',
          siteTitle: '',
          navbarTheme: 'dark',
          navPosition: 'fixed-top',
        }
  )
  const [token, setToken] = React.useState('')
  const [windowId] = React.useState(`${+new Date()}:${Math.random()}`)
  const [settingsUpdateTimer, setSettingsUpdateTimer] = React.useState(null)
  const [socket, setSocket] = React.useState(null)
  const helpers = React.useMemo(
    () => ({
      addPage: (page) => {
        if (page.key) {
          axios
            .post(`${helpers.getRoot()}/api/page?token=${token}`, page)
            .then((response) => {
              helpers.emitSave({ action: 'add-page' })
              if (activePage) {
                ref.current.querySelector('main .page').reload()
              }
            })
        }
      },
      createPage: (newPage) => {
        let key = newPage.key
        if (!key.replace(/-/gi, '')) {
          return
        }
        let pageType = 'content'
        let parentId = null
        if (activePage) {
          if (activePage.key !== 'home') {
            parentId = activePage.id
          }
        }
        let page = {
          key,
          title: newPage.title,
          pageType,
          parentId,
        }
        helpers.addPage(page)
      },
      deletePage: (page) => {
        if (helpers.getEditable()) {
          axios
            .delete(`${helpers.getRoot()}/api/page/${page.id}?token=${token}`)
            .then((response) => {
              if (response.status === 200) {
                setActivePage(null)
                const a = { action: 'delete-page', pageId: page.id }
                setWatchAction(a)
              }
            })
        }
      },
      emitForceReload: (callback = () => {}) => {
        if (props.socketMode) {
          socket.emit('force-reload', () => {
            callback()
          })
        } else {
          callback()
        }
      },
      emitSave: (data = {}, callback = () => {}) => {
        if (props.socketMode) {
          socket.emit('save', Object.assign({}, data, { windowId }), () => {
            helpers.loadSiteMap()
            callback()
          })
        } else {
          helpers.loadSiteMap()
          callback()
        }
      },
      getEditable: () => authenticated && admin && editable,
      getFallbackSettings: () => {
        let s = Object.assign({}, siteSettings)
        if (fallbackSettings && !['/', '/home/'].includes(activePathname)) {
          Object.assign(s, fallbackSettings)
        }
        return s
      },
      getMenu: () => {
        let menu = []
        const settings = helpers.getSettings()
        const sm = helpers.getSiteMap()
        const root = helpers.getRoot()
        if (settings.navPosition !== 'fixed-top') {
          menu.push({
            name: 'Home',
            className: 'nav-page-home',
            href: `/${sm.path}${sm.key === 'home' ? '' : '/'}`,
            component: Link,
            order: -100,
            active:
              activePathname === '/' ||
              activePathname === '/home/' ||
              activePathname === `/${sm.path}/`,
            onClick: (e) => {
              if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
                e.preventDefault()
                helpers.navigate(`/${sm.path}${sm.key === 'home' ? '' : '/'}`)
              }
            },
          })
        }
        sm.children.forEach((page) => {
          if (page.settings.includeInNav) {
            let subMenu = []
            page.children.forEach((pg) => {
              if (pg.settings.includeInNav) {
                subMenu.push({
                  name: pg.title,
                  className: `nav-page-${page.key}-subpage-${pg.key}`,
                  href: `/${pg.path}/`,
                  component: NavLink,
                  // active: activePathname.indexOf(`/${pg.path}/`) === 0,
                  order: Number(pg.settings.navOrdering || 0),
                  onClick: (e) => {
                    if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
                      e.preventDefault()
                      helpers.navigate(`/${pg.path}/`)
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
              //   activePathname === `/${page.path}/` ||
              //   activePathname.indexOf(`/${page.path}/`) === 0,
              order: Number(page.settings.navOrdering || 0),
              onClick: (e) => {
                if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
                  e.preventDefault()
                  helpers.navigate(`/${page.path}/`)
                }
              },
              subMenu: subMenu.length ? subMenu : null,
            })
          }
        })
        if (admin) {
          let adminSubmenu = []
          adminSubmenu.push({
            name: 'Logout',
            className: 'nav-logout',
            onClick: (e) => {
              e.preventDefault()
              helpers.logout()
            },
          })

          menu.push({
            className: 'nav-toggle-edit',
            name: (
              <span>{editable ? <FaToggleOn /> : <FaToggleOff />} Edit</span>
            ),
            onClick: (e) => {
              e.preventDefault()
              helpers.toggleEditMode()
            },
            toggleParent: false,
            order: 100,
          })

          if (editable) {
            menu.push({
              className: 'nav-new-page',
              name: (
                <span>
                  <MdCreate /> New Page
                </span>
              ),
              onClick: (e) => {
                e.preventDefault()
                helpers.toggleNewPage()
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
                helpers.toggleSettings()
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
                appRoot: root,
                editable,
                navigate: helpers.navigate,
                page: activePage,
                settings,
                token,
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
      },
      getNewPageValueHandler: (key) => (value) => {
        const np = copyObj(newPage)
        np[key] = value
        if (key === 'title') {
          np.key = getSaneKey(value)
        }
        setNewPage(np)
      },
      getRoot: () => props.root || '',
      getSettings: () => {
        let s = Object.assign({}, helpers.getFallbackSettings())
        if (
          activePage &&
          activePathname !== '/home' &&
          activePathname !== '/'
        ) {
          Object.assign(s, activePage.settings)
        }
        return s
      },
      getShowPropertyValueHandler: (key) => (value) => {
        const sh = copyObj(show)
        sh[key] = value
        setShow(sh)
      },
      getSettingsValueHandler: (key) => {
        return (value) => {
          if (key === 'siteTitle') {
            let splitTitle = document.title.split(' | ')
            if (splitTitle.length < 2) {
              document.title = value
            } else {
              document.title = `${splitTitle[0]} | ${value}`
            }
          }
          const ssCopy = copyObj(siteSettings)
          ssCopy[key] = value
          setSiteSettings(ssCopy)
          clearTimeout(settingsUpdateTimer)
          setSettingsUpdateTimer(
            setTimeout(() => {
              axios
                .post(
                  `${helpers.getRoot()}/api/settings?token=${token}`,
                  ssCopy
                )
                .then(() => {
                  helpers.emitSave({ action: 'update-settings' })
                })
            }, 1000)
          )
        }
      },
      getSiteMap: () => {
        let sm = {
          key: 'home',
          path: '',
          children: [],
        }
        Object.assign(sm, siteMap)
        return sm
      },
      handlePageError: () => setActivePage(null),
      handleNotFound: (path) => {
        setActivePage(null)
        helpers.loadSiteMap(path)
        helpers.loadSettings(path)
      },
      loadSession: () => {
        let a, t
        return new Promise((resolve, reject) => {
          let conditionallyResolve = () => {
            if (a && t) {
              resolve()
            }
          }
          axios.get(`${helpers.getRoot()}/api/session`).then((response) => {
            if (response.data && response.data.authenticated) {
              setAuthenticated(true)
              if (response.data.admin) {
                setAdmin(true)
                a = true
              }
              conditionallyResolve()
            }
            if (response.data && response.data.token) {
              t = response.data.token
              setToken(response.data.token)
              conditionallyResolve()
            }
          })
        })
      },
      loadSettings: (path = '') => {
        const root = helpers.getRoot()
        axios.get(`${root}/api/settings`).then((response) => {
          if (response.data) {
            setSiteSettings(response.data)
          }
        })
        // for 404s
        if (path) {
          axios
            .get(`${root}/api/page/settings/by-key${path}`)
            .then((response) => {
              if (response.data) {
                setFallbackSettings(response.data)
              }
            })
        }
      },
      loadSiteMap: (path = '') => {
        const root = helpers.getRoot()
        return new Promise((resolve, reject) => {
          if (activePage && activePage.id) {
            axios
              .get(`${helpers.getRoot()}/api/page/${activePage.id}/sitemap`)
              .then((response) => {
                setSiteMap(response.data)
                resolve(response.data)
              })
          } else if (path) {
            // for 404s
            axios
              .get(`${root}/api/page/sitemap/by-key${path}`)
              .then((response) => {
                setSiteMap(response.data)
              })
          }
        })
      },
      logout: () => {
        axios.get(`${helpers.getRoot()}/api/logout?token=${token}`).then(() => {
          setAdmin(false)
          setAuthenticated(false)
          setEditable(false)
        })
      },
      navigate: (href) => {
        if (absoluteUrl(href)) {
          helpers.navigateAbsolute(href)
        } else {
          helpers.navigateRelative(href)
        }
      },
      navigateAbsolute: (url) => {
        const launch = () => {
          if (helpers.getSettings().absoluteNavBehavior === 'new-window') {
            window.open(url, '_blank', 'noreferrer noopener')
          } else {
            window.location = url
          }
        }
        if (new URL(url).origin === globalThis.location.origin) {
          launch()
        } else {
          if (
            globalThis.gtag &&
            globalThis.gtagId &&
            globalThis.google_tag_manager
          ) {
            globalThis.gtag('event', 'click', {
              event_category: 'outbound',
              event_label: url,
              transport_type: 'beacon',
              event_callback: (id) => {
                if (id === globalThis.gtagId) {
                  launch()
                }
              },
            })
          } else {
            launch()
          }
        }
      },
      navigateRelative: (path) => {
        if (path.match(/\/$/) === null) {
          path = path + '/'
        }
        const regex = new RegExp(`^${helpers.getRoot()}`)
        if (path.match(regex)) {
          path = path.replace(regex, '')
        }
        if (path !== activePathname) {
          setNavigate(path)
          setActivePathname(path)
          // track navigation to login
          if (path === '/login/') {
            helpers.trackPageView()
          }
          // give the Navigate component a cycle to render before clearing
          setTimeout(() => setNavigate(null), 0)
        }
      },
      redirect: (path) => {
        return new Promise((resolve, reject) => {
          setRedirect(path)
          // give the Redirect component a cycle to render before clearing
          setTimeout(() => setRedirect(false), 0)
          setTimeout(() => resolve, 0)
        })
      },
      reload: (data = { action: 'all' }) => {
        switch (data.action) {
          case 'all':
            helpers.loadSettings()
            helpers.reloadRef('activePage')
            helpers.reloadRef('header')
            helpers.reloadRef('footer')
            helpers.reloadRef('hero')
            break
          case 'add-page':
            helpers.reloadRef('activePage')
            break
          case 'delete-page':
            helpers.reloadRef('activePage')
            break
          case 'update-settings':
            helpers.loadSettings()
            helpers.reloadRef('activePage')
            break
          default:
            const activePage =
              ref && ref.current
                ? ref.current.querySelector('main .page').getPage()
                : null
            const headerPage =
              ref && ref.current
                ? ref.current.querySelector('header .page').getPage()
                : null
            const footerPage =
              ref && ref.current
                ? ref.current.querySelector('footer .page').getPage()
                : null
            const heroPage =
              ref && ref.current
                ? ref.current.querySelector('.pxn-hero .page').getPage()
                : null
            if (activePage && data.pageId === activePage.id) {
              helpers.reloadRef('activePage')
            } else if (headerPage && data.pageId === headerPage.id) {
              helpers.reloadRef('header')
            } else if (footerPage && data.pageId === footerPage.id) {
              helpers.reloadRef('footer')
            } else if (heroPage && data.pageId === heroPage.id) {
              helpers.reloadRef('hero')
            }
            break
        }
      },
      reloadRef: (key) => {
        const pages = {
          activePage: ref.current.querySelector('main .page'),
          header: ref.current.querySelector('header .page'),
          footer: ref.current.querySelector('footer .page'),
          hero: ref.current.querySelector('.pxn-hero .page'),
        }
        if (pages[key]) {
          pages[key].reload()
        }
      },
      setActivePage: (page) => {
        setActivePage(page)
        setSiteMap(copyObj(page.siteMap || {}))
        setFallbackSettings(copyObj(page.fallbackSettings || {}))
      },
      submitNewPage: () => {
        helpers.createPage(newPage)
        helpers.toggleNewPage()
        setNewPage({
          title: '',
          key: '',
        })
      },
      toggleEditMode: () => {
        setEditable(!editable)
      },
      toggleNewPage: () => {
        const sh = copyObj(show)
        sh.newPage = !sh.newPage
        setShow(sh)
      },
      toggleSettings: () => {
        if (activePathname === '/home/' || activePathname === '/') {
          const sh = copyObj(show)
          sh.settings = !sh.settings
          setShow(sh)
        } else if (ref && ref.current) {
          ref.current.querySelector('main .page').toggleSettings()
        }
      },
      trackPageView: () => {
        if (globalThis.gtag && globalThis.gtagId) {
          globalThis.gtag('config', globalThis.gtagId, {
            page_path: globalThis.location.pathname,
          })
        }
      },
    }),
    [
      activePage,
      activePathname,
      admin,
      authenticated,
      editable,
      fallbackSettings,
      newPage,
      props.root,
      props.socketMode,
      setEditable,
      settingsUpdateTimer,
      show,
      siteMap,
      siteSettings,
      socket,
      token,
      windowId,
    ]
  )
  // first render
  const [firstRender, setFirstRender] = React.useState(true)
  React.useEffect(() => {
    if (firstRender) {
      setGlobalLinkHandler((href) => {
        if (!editable) {
          helpers.navigate(href)
        }
      })
      // get everything loaded
      if (!props.initSettings) {
        helpers.loadSettings()
      }
      helpers.loadSession()
      setActivePathname(props.initPath)
      // set up socket.io-enabled features
      if (props.socketMode && globalThis.io) {
        const socket = globalThis.io({ path: `${helpers.getRoot()}/socket.io` })
        socket.on('load', (data) => {
          if (windowId !== data.windowId) {
            helpers.reload(data)
          }
        })
        socket.on('reload-app', () => {
          globalThis.location.reload()
        })
        setSocket(socket)
      }
      // handle state changes on back/forward browser buttons
      if (typeof globalThis.onpopstate !== 'undefined') {
        globalThis.onpopstate = (event) => {
          setActivePathname(globalThis.location.pathname)
        }
      }
      globalThis.preaction = Object.assign({}, helpers)
      setFirstRender(false)
    }
  }, [
    setFirstRender,
    editable,
    firstRender,
    helpers,
    props.initPath,
    props.initSettings,
    props.socketMode,
    windowId,
  ])
  // updates
  const [prevActivePage, setPrevActivePage] = React.useState(activePage)
  React.useEffect(() => {
    const settings = helpers.getSettings()
    const bodyClasses = ['pxn-cms-body']
    // set path class on body to allow path-specific styling
    if (activePathname === '/login/') {
      bodyClasses.push('path-login-')
    } else if (activePage) {
      bodyClasses.push(
        `path-${getSaneKey(activePage.tree.path || 'undefined')}-`
      )
    }
    if (settings.bodyTheme) {
      bodyClasses.push(getThemeClassName(settings.bodyTheme))
      const linkClass = getLinkClassName(settings.bodyTheme)
      if (linkClass) {
        bodyClasses.push(linkClass)
      }
    }
    if (settings.bodyGradient) {
      bodyClasses.push(getGradientClassName(true))
    }
    document.body.className = bodyClasses.join(' ')
    // track page view if new activePage is set
    if (
      activePage &&
      (!prevActivePage || activePage.id !== prevActivePage.id)
    ) {
      setPrevActivePage(activePage)
      helpers.trackPageView()
    }
  }, [helpers, activePathname, setPrevActivePage, prevActivePage, activePage])

  const [watchAction, setWatchAction] = React.useState(null)
  React.useEffect(() => {
    if (watchAction) {
      if (watchAction.action === 'delete-page' && watchAction.pageId) {
        helpers.redirect('..').then(() => {
          helpers.emitSave(watchAction)
        })
      }
      setWatchAction(null)
    }
  }, [watchAction, setWatchAction, helpers])

  const settings = helpers.getSettings()
  const sm = helpers.getSiteMap()
  const navPositionClassName = {
    'fixed-top': 'nav-position-fixed-top',
    'above-header': 'nav-position-above-header',
    'below-header': 'nav-position-below-header',
  }[settings.navPosition]
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
  }[settings.navActiveSubmenuTheme]
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
  }[settings.navActiveTabTheme]
  const ref = React.useRef()
  return (
    <div
      className={joinClassNames(
        'App',
        editable ? 'editable' : 'non-editable',
        navPositionClassName,
        navActiveSubmenuThemeClassName,
        navActiveTabThemeClassName
      )}
      ref={ref}
    >
      <Router basename={helpers.getRoot()} location={activePathname}>
        <div>
          {redirect ? <Redirect to={redirect} /> : ''}
          {navigate ? <Redirect to={navigate} push /> : ''}
          <Boilerplate
            navBar={
              settings.navPosition === 'fixed-top' ? (
                <NavBar
                  fluid={settings.maxWidthNav}
                  fixedTo='top'
                  theme={settings.navbarTheme}
                  brand={{
                    name: settings.siteTitle,
                    href: `/${sm.path}${sm.key === 'home' ? '' : '/'}`,
                    onClick: (e) => {
                      if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
                        e.preventDefault()
                        helpers.navigate(
                          `/${sm.path}${sm.key === 'home' ? '' : '/'}`
                        )
                      }
                    },
                  }}
                  menu={helpers.getMenu()}
                />
              ) : undefined
            }
            header={
              <div className={getLinkClassName(settings.headerTheme)}>
                {settings.navPosition === 'above-header' ? (
                  <Nav
                    menu={helpers.getMenu()}
                    type={settings.navType}
                    align={settings.navAlignment}
                    justify={settings.navSpacing === 'justify'}
                    fill={settings.navSpacing === 'fill'}
                    collapsible={settings.navCollapsible}
                  />
                ) : (
                  ''
                )}
                <Header
                  appRoot={helpers.getRoot()}
                  editable={editable}
                  emitSave={helpers.emitSave}
                  navigate={helpers.navigate}
                  settings={settings}
                  show={settings.showHeader}
                  token={token}
                  initPage={props.initPage ? props.initPage.header : undefined}
                />
                {settings.navPosition === 'below-header' ? (
                  <Nav
                    menu={helpers.getMenu()}
                    type={settings.navType}
                    align={settings.navAlignment}
                    justify={settings.navSpacing === 'justify'}
                    fill={settings.navSpacing === 'fill'}
                    collapsible={settings.navCollapsible}
                  />
                ) : undefined}
              </div>
            }
            hero={
              settings.showHero ? (
                <div
                  className={getLinkClassName(
                    settings.heroTheme || settings.headerTheme
                  )}
                >
                  <Hero
                    appRoot={helpers.getRoot()}
                    editable={editable}
                    emitSave={helpers.emitSave}
                    navigate={helpers.navigate}
                    settings={settings}
                    show={settings.showHero}
                    token={token}
                    initPage={props.initPage ? props.initPage.hero : undefined}
                  />
                </div>
              ) : (
                ''
              )
            }
            heroPosition={settings.heroPosition}
            heroTheme={settings.heroTheme || undefined}
            heroGradient={settings.heroGradient || false}
            headerTheme={settings.headerTheme || undefined}
            headerGradient={settings.headerGradient || false}
            mainTheme={settings.mainTheme || undefined}
            mainGradient={settings.mainGradient || false}
            footerTheme={settings.footerTheme || undefined}
            footerGradient={settings.footerGradient || false}
            footer={
              <div className={getLinkClassName(settings.footerTheme)}>
                <Footer
                  appRoot={helpers.getRoot()}
                  editable={editable}
                  emitSave={helpers.emitSave}
                  navigate={helpers.navigate}
                  settings={settings}
                  show={settings.showFooter}
                  token={token}
                  initPage={props.initPage ? props.initPage.footer : undefined}
                />
              </div>
            }
            fluid={{
              footerContainer: settings.maxWidthFooterContainer,
              headerContainer: settings.maxWidthHeaderContainer,
              heroContainer: settings.maxWidthHeroContainer,
              mainContainer: settings.maxWidthMainContainer,
            }}
          >
            <div
              className={joinClassNames(
                'main-body',
                getLinkClassName(settings.mainTheme || '')
              )}
            >
              {editable ? <hr /> : ''}
              {editable ? (
                <div className='font-weight-bold'>Main: {activePathname}</div>
              ) : (
                ''
              )}
              <Switch>
                <Route exact path='/'>
                  <Page
                    appRoot={helpers.getRoot()}
                    editable={editable}
                    emitSave={helpers.emitSave}
                    fallbackSettings={helpers.getFallbackSettings()}
                    path='/home/'
                    headerControl={helpers.getShowPropertyValueHandler(
                      'header'
                    )}
                    footerControl={helpers.getShowPropertyValueHandler(
                      'footer'
                    )}
                    heroControl={helpers.getShowPropertyValueHandler('hero')}
                    navigate={helpers.navigate}
                    setActivePathname={setActivePathname}
                    setActivePage={helpers.setActivePage}
                    token={token}
                    initPage={props.initPage}
                  />
                </Route>
                <Route exact path='/login'>
                  <div className='login'>
                    <Login
                      appRoot={helpers.getRoot()}
                      loadSession={helpers.loadSession}
                      navigate={helpers.navigate}
                      settings={siteSettings}
                      setToken={setToken}
                      token={token}
                    />
                  </div>
                </Route>
                <Route
                  render={({ location }) => {
                    const root = new RegExp(`^${helpers.getRoot()}`)
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
                            appRoot={helpers.getRoot()}
                            editable={editable}
                            path={pathname}
                            deletePage={helpers.deletePage}
                            emitSave={helpers.emitSave}
                            headerControl={helpers.getShowPropertyValueHandler(
                              'header'
                            )}
                            footerControl={helpers.getShowPropertyValueHandler(
                              'footer'
                            )}
                            heroControl={helpers.getShowPropertyValueHandler(
                              'hero'
                            )}
                            navigate={helpers.navigate}
                            onError={helpers.handlePageError}
                            onNotFound={helpers.handleNotFound}
                            setActivePathname={setActivePathname}
                            setActivePage={helpers.setActivePage}
                            token={token}
                            initPage={props.initPage}
                            init404={props.init404}
                            initError={props.initError}
                          />
                        )
                    }
                  }}
                />
              </Switch>
              {editable ? <hr /> : ''}
            </div>
          </Boilerplate>
        </div>
      </Router>
      <div className='site-settings-modal-container'>
        <Modal
          title='Site Settings'
          show={editable && show.settings}
          setShow={(value) => {
            const sh = copyObj(show)
            sh.settings = value
            setShow(sh)
          }}
          size='lg'
          headerTheme='primary'
          bodyTheme='white'
          footerTheme='dark'
          footer={
            <button
              type='button'
              className='btn btn-secondary'
              onClick={helpers.toggleSettings}
            >
              Close
            </button>
          }
        >
          {editable && show.settings ? (
            <SiteSettings
              appRoot={helpers.getRoot()}
              admin={admin}
              emitForceReload={helpers.emitForceReload}
              settings={siteSettings}
              getSettingsValueHandler={helpers.getSettingsValueHandler}
              show={show.settings}
              token={token}
            />
          ) : (
            ''
          )}
        </Modal>
      </div>
      <div className='new-page-modal-container'>
        <Modal
          title='New Page'
          show={editable && show.newPage}
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
                  helpers.toggleNewPage()
                }}
              >
                Cancel
              </button>
            </div>
          }
        >
          {editable && show.newPage ? (
            <NewPage
              activePathname={activePathname}
              getValueHandler={helpers.getNewPageValueHandler}
              newPage={newPage}
              submit={helpers.submitNewPage}
            />
          ) : (
            ''
          )}
        </Modal>
      </div>
    </div>
  )
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
