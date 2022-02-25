import './style/base'
import PropTypes from 'prop-types'
import React from 'react'
import axios from 'axios'
import loadable from '@loadable/component'
import {
  BrowserRouter,
  MemoryRouter,
  Route,
  Routes,
  NavLink,
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { StaticRouter } from 'react-router-dom/server'
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
import { allowedReferrers, menuExtensions } from './ext'
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

function AppContainer(props) {
  const [activePathname, setActivePathnameState] = React.useState(
    props.initPath || ''
  )
  // IMPORTANT
  // clearing the initPage after first render prevents it from being used unnecessarily
  // on navigation between appRoot path and other pages
  const [initPage, setInitPage] = React.useState(props.initPage || null)
  const setActivePathname = React.useCallback((path) => {
    if (path === '/home/') {
      path = '/'
    }
    setActivePathnameState(path)
    setInitPage(null)
  }, [])
  const basename = props.appRoot || ''
  const location = basename + activePathname
  return (
    <div className={joinClassNames('AppContainer')}>
      <Router basename={basename} location={location}>
        <App
          activePathname={activePathname}
          init404={props.init404}
          initError={props.initError}
          initPage={initPage}
          initPath={props.initPath}
          initSettings={props.initSettings}
          appRoot={props.appRoot}
          setActivePathname={setActivePathname}
          socketMode={props.socketMode}
        />
      </Router>
    </div>
  )
}

AppContainer.propTypes = {
  appRoot: PropTypes.string,
  init404: PropTypes.bool,
  initError: PropTypes.string,
  initPage: PropTypes.object,
  initPath: PropTypes.string.isRequired,
  initSettings: PropTypes.object,
  socketMode: PropTypes.bool,
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

function PageRoute(props) {
  const location = useLocation()
  const appRoot = new RegExp(`^${props.appRoot}`)
  const pathname = location.pathname.replace(appRoot, '')
  const splitPath = pathname.replace(/(^\/|\/$)/g, '').split('/')
  const pageKey = splitPath[splitPath.length - 1]
  switch (pageKey) {
    case 'home':
    case 'header':
    case 'footer':
    case 'hero':
      return <NotFound />
    default:
      return (
        <Page
          appRoot={props.appRoot}
          deletePage={props.deletePage}
          editable={props.editable}
          emitSave={props.emitSave}
          footerControl={props.getShowPropertyValueHandler('footer')}
          headerControl={props.getShowPropertyValueHandler('header')}
          heroControl={props.getShowPropertyValueHandler('hero')}
          init404={props.init404}
          initError={props.initError}
          initPage={props.initPage}
          navigate={props.navigate}
          onError={props.handlePageError}
          onNotFound={props.handleNotFound}
          path={pathname}
          setActivePage={props.setActivePage}
          setActivePathname={props.setActivePathname}
          token={props.token}
        />
      )
  }
}

PageRoute.propTypes = {
  appRoot: PropTypes.string,
  deletePage: PropTypes.func,
  editable: PropTypes.bool,
  emitSave: PropTypes.func,
  getShowPropertyValueHandler: PropTypes.func,
  handleNotFound: PropTypes.func,
  handlePageError: PropTypes.func,
  init404: PropTypes.bool,
  initError: PropTypes.string,
  initPage: PropTypes.object,
  navigate: PropTypes.func,
  setActivePage: PropTypes.func,
  setActivePathname: PropTypes.func,
  token: PropTypes.string,
}

function App(props) {
  // PROP DESTRUCTURING
  const { setActivePathname } = props

  // OTHER HOOKS
  const location = useLocation()

  // STATE

  const [activePage, setActivePage] = React.useState(
    props.initPage ? copyObj(props.initPage) : null
  )
  const [admin, setAdmin] = React.useState(false)
  const [authenticated, setAuthenticated] = React.useState(false)
  const [editable, setEditable] = React.useState(false)
  const [fallbackSettings, setFallbackSettings] = React.useState(
    props.initPage && props.initPage.fallbackSettings
      ? copyObj(props.initPage.fallbackSettings)
      : {}
  )
  const [newPage, setNewPage] = React.useState({ key: '', title: '' })
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
  const [socket, setSocket] = React.useState(null)

  // OTHER HOOKS
  const routerNavigate = useNavigate()

  // CALLBACKS

  const appRoot = props.appRoot || ''
  const loadSiteMap = React.useCallback(
    (path = '') => {
      return new Promise((resolve, reject) => {
        if (activePage && activePage.id) {
          axios
            .get(`${appRoot}/api/page/${activePage.id}/sitemap`)
            .then((response) => {
              setSiteMap(response.data)
              resolve(response.data)
            })
        } else if (path) {
          // for 404s
          axios
            .get(`${appRoot}/api/page/sitemap/by-key${path}`)
            .then((response) => {
              setSiteMap(response.data)
            })
        }
      })
    },
    [activePage, appRoot]
  )
  const emitSave = React.useCallback(
    (data = {}, callback = () => {}) => {
      if (props.socketMode) {
        socket.emit('save', Object.assign({}, data, { windowId }), () => {
          loadSiteMap()
          callback()
        })
      } else {
        loadSiteMap()
        callback()
      }
    },
    [loadSiteMap, props.socketMode, socket, windowId]
  )

  const addPage = React.useCallback(
    (page) => {
      if (page.key) {
        axios
          .post(`${appRoot}/api/page?token=${token}`, page)
          .then((response) => {
            emitSave({ action: 'add-page' })
            if (activePage) {
              ref.current.querySelector('main .page').reload()
            }
          })
      }
    },
    [activePage, appRoot, emitSave, token]
  )

  const createPage = React.useCallback(
    (newPage) => {
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
      addPage(page)
    },
    [activePage, addPage]
  )

  const getEditable = React.useCallback(
    () => authenticated && admin && editable,
    [authenticated, admin, editable]
  )

  const deletePage = React.useCallback(
    (page) => {
      if (getEditable()) {
        axios
          .delete(`${appRoot}/api/page/${page.id}?token=${token}`)
          .then((response) => {
            if (response.status === 200) {
              setActivePage(null)
              const a = { action: 'delete-page', pageId: page.id }
              setWatchAction(a)
            }
          })
      }
    },
    [getEditable, appRoot, token]
  )

  const emitForceReload = React.useCallback(
    (callback = () => {}) => {
      if (props.socketMode) {
        socket.emit('force-reload', () => {
          callback()
        })
      } else {
        callback()
      }
    },
    [props.socketMode, socket]
  )

  const getFallbackSettings = React.useCallback(() => {
    let s = Object.assign({}, siteSettings)
    if (fallbackSettings && !['/', '/home/'].includes(props.activePathname)) {
      Object.assign(s, fallbackSettings)
    }
    return s
  }, [props.activePathname, siteSettings, fallbackSettings])

  const getSettings = React.useCallback(() => {
    let s = Object.assign({}, getFallbackSettings())
    if (
      activePage &&
      props.activePathname !== '/home' &&
      props.activePathname !== '/'
    ) {
      Object.assign(s, activePage.settings)
    }
    return s
  }, [activePage, props.activePathname, getFallbackSettings])

  const getSiteMap = React.useCallback(() => {
    let sm = {
      key: 'home',
      path: '',
      children: [],
    }
    Object.assign(sm, siteMap)
    return sm
  }, [siteMap])

  const trackPageView = React.useCallback(() => {
    if (globalThis.gtag && globalThis.gtagId) {
      globalThis.gtag('config', globalThis.gtagId, {
        page_path: globalThis.location.pathname,
      })
    }
  }, [])

  const logout = React.useCallback(() => {
    axios.get(`${appRoot}/api/logout?token=${token}`).then(() => {
      setAdmin(false)
      setAuthenticated(false)
      setEditable(false)
    })
  }, [appRoot, token])

  const navigateAbsolute = React.useCallback(
    (url) => {
      const launch = () => {
        if (getSettings().absoluteNavBehavior === 'new-window') {
          const windowFeatures = allowedReferrers.includes(new URL(url).origin)
            ? 'noopener'
            : 'noreferrer noopener'
          window.open(url, '_blank', windowFeatures)
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
    [getSettings]
  )

  const navigateRelative = React.useCallback(
    (path) => {
      if (path.match(/\/$/) === null) {
        path = path + '/'
      }
      const regex = new RegExp(`^${appRoot}`)
      if (path.match(regex)) {
        path = path.replace(regex, '')
      }
      if (path[0] !== '/') {
        path = location.pathname + path
      }
      if (path !== props.activePathname) {
        routerNavigate(path)
        setActivePathname(path)
        // track navigation to login
        if (path === '/login/') {
          trackPageView()
        }
      }
    },
    [
      props.activePathname,
      appRoot,
      routerNavigate,
      setActivePathname,
      trackPageView,
      location,
    ]
  )

  const navigate = React.useCallback(
    (href) => {
      if (absoluteUrl(href)) {
        navigateAbsolute(href)
      } else {
        navigateRelative(href)
      }
    },
    [navigateAbsolute, navigateRelative]
  )

  const toggleEditMode = React.useCallback(() => {
    setEditable(!editable)
  }, [editable])

  const toggleNewPage = React.useCallback(() => {
    const sh = copyObj(show)
    sh.newPage = !sh.newPage
    setShow(sh)
  }, [show])

  const toggleSettings = React.useCallback(() => {
    if (props.activePathname === '/home/' || props.activePathname === '/') {
      const sh = copyObj(show)
      sh.settings = !sh.settings
      setShow(sh)
    } else if (ref && ref.current) {
      ref.current.querySelector('main .page').toggleSettings()
    }
  }, [props.activePathname, show])

  const getMenu = React.useCallback(() => {
    let menu = []
    const settings = getSettings()
    const sm = getSiteMap()
    if (settings.navPosition !== 'fixed-top') {
      menu.push({
        name: 'Home',
        className: 'nav-page-home',
        href: `/${sm.path}${sm.key === 'home' ? '' : '/'}`,
        component: Link,
        order: -100,
        active:
          props.activePathname === '/' ||
          props.activePathname === '/home/' ||
          props.activePathname === `/${sm.path}/`,
        onClick: (e) => {
          if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
            e.preventDefault()
            navigate(`/${sm.path}${sm.key === 'home' ? '' : '/'}`)
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
              name: pg.settings.navLinkName || pg.title,
              className: `nav-page-${page.key}-subpage-${pg.key}`,
              href: `/${pg.path}/`,
              component: NavLink,
              // active: props.activePathname.indexOf(`/${pg.path}/`) === 0,
              order: Number(pg.settings.navOrdering || 0),
              onClick: (e) => {
                if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
                  e.preventDefault()
                  navigate(`/${pg.path}/`)
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
          name: page.settings.navLinkName || page.title,
          className: `nav-page-${page.key}`,
          href: `/${page.path}/`,
          component: NavLink,
          // active:
          //   props.activePathname === `/${page.path}/` ||
          //   props.activePathname.indexOf(`/${page.path}/`) === 0,
          order: Number(page.settings.navOrdering || 0),
          onClick: (e) => {
            if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
              e.preventDefault()
              navigate(`/${page.path}/`)
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
          logout()
        },
      })

      menu.push({
        className: 'nav-toggle-edit',
        name: <span>{editable ? <FaToggleOn /> : <FaToggleOff />} Edit</span>,
        onClick: (e) => {
          e.preventDefault()
          toggleEditMode()
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
            toggleNewPage()
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
            toggleSettings()
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
            appRoot: appRoot,
            editable,
            navigate,
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
  }, [
    activePage,
    props.activePathname,
    admin,
    editable,
    getSettings,
    getSiteMap,
    logout,
    navigate,
    appRoot,
    toggleEditMode,
    toggleNewPage,
    toggleSettings,
    token,
  ])

  const loadSession = React.useCallback(() => {
    let a, t
    return new Promise((resolve, reject) => {
      let conditionallyResolve = () => {
        if (a && t) {
          resolve()
        }
      }
      axios.get(`${appRoot}/api/session`).then((response) => {
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
  }, [appRoot])

  const loadSettings = React.useCallback(
    (path = '') => {
      axios.get(`${appRoot}/api/settings`).then((response) => {
        if (response.data) {
          setSiteSettings(response.data)
        }
      })
      // for 404s
      if (path) {
        axios
          .get(`${appRoot}/api/page/settings/by-key${path}`)
          .then((response) => {
            if (response.data) {
              setFallbackSettings(response.data)
            }
          })
      }
    },
    [appRoot]
  )

  const getNewPageValueHandler = React.useCallback(
    (key) => (value) => {
      const np = copyObj(newPage)
      np[key] = value
      if (key === 'title') {
        np.key = getSaneKey(value)
      }
      setNewPage(np)
    },
    [newPage]
  )
  const getShowPropertyValueHandler = React.useCallback(
    (key) => (value) => {
      const sh = copyObj(show)
      sh[key] = value
      setShow(sh)
    },
    [show]
  )

  const getSettingsValueHandler = React.useCallback(
    (key) => {
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
        clearTimeout(settingsUpdateTimer.current)
        settingsUpdateTimer.current = setTimeout(() => {
          axios
            .post(`${appRoot}/api/settings?token=${token}`, ssCopy)
            .then(() => {
              emitSave({ action: 'update-settings' })
            })
        }, 1000)
      }
    },
    [appRoot, emitSave, siteSettings, token]
  )

  const handleNotFound = React.useCallback(
    (path) => {
      setActivePage(null)
      loadSiteMap(path)
      loadSettings(path)
    },
    [loadSiteMap, loadSettings]
  )

  const redirect = React.useCallback(
    (path) => {
      return new Promise((resolve, reject) => {
        routerNavigate(path, { replace: true })
        setTimeout(() => resolve, 0)
      })
    },
    [routerNavigate]
  )

  const reloadRef = React.useCallback((key) => {
    const pages = {
      activePage: ref.current.querySelector('main .page'),
      header: ref.current.querySelector('header .page'),
      footer: ref.current.querySelector('footer .page'),
      hero: ref.current.querySelector('.pxn-hero .page'),
    }
    if (pages[key]) {
      pages[key].reload()
    }
  }, [])

  const reload = React.useCallback(
    (data = { action: 'all' }) => {
      switch (data.action) {
        case 'all':
          loadSettings()
          reloadRef('activePage')
          reloadRef('header')
          reloadRef('footer')
          reloadRef('hero')
          break
        case 'add-page':
          reloadRef('activePage')
          break
        case 'delete-page':
          reloadRef('activePage')
          break
        case 'update-settings':
          loadSettings()
          reloadRef('activePage')
          break
        default:
          const getPage = (selector) => {
            if (ref && ref.current) {
              const el = ref.current.querySelector(selector)
              const page = el && el.getPage ? el.getPage() : null
              return page
            } else {
              return null
            }
          }
          const activePage = getPage('main .page')
          const headerPage = getPage('header .page')
          const footerPage = getPage('footer .page')
          const heroPage = getPage('.pxn-hero page')
          if (activePage && data.pageId === activePage.id) {
            reloadRef('activePage')
          } else if (headerPage && data.pageId === headerPage.id) {
            reloadRef('header')
          } else if (footerPage && data.pageId === footerPage.id) {
            reloadRef('footer')
          } else if (heroPage && data.pageId === heroPage.id) {
            reloadRef('hero')
          }
          break
      }
    },
    [loadSettings, reloadRef]
  )

  const setActivePageComplete = React.useCallback((page) => {
    setActivePage(page)
    setSiteMap(copyObj(page.siteMap || {}))
    setFallbackSettings(copyObj(page.fallbackSettings || {}))
  }, [])

  const submitNewPage = React.useCallback(() => {
    createPage(newPage)
    toggleNewPage()
    setNewPage({
      title: '',
      key: '',
    })
  }, [createPage, newPage, toggleNewPage])

  const handlePageError = React.useCallback(() => setActivePage(null), [])

  // first render
  React.useEffect(() => {
    if (!props.initSettings) {
      loadSettings()
    }
    loadSession()
    setActivePathname(props.initPath)
    if (typeof globalThis.onpopstate !== 'undefined') {
      globalThis.onpopstate = (event) => {
        setActivePathname(globalThis.location.pathname)
      }
    }
  }, [
    props.initSettings,
    loadSettings,
    loadSession,
    props.initPath,
    setActivePathname,
  ])
  // setup global link handler
  React.useEffect(() => {
    const findAnchor = (element) => {
      if (element.tagName === 'A') {
        return element
      } else if (element.parentElement) {
        return findAnchor(element.parentElement)
      } else {
        return null
      }
    }
    const linkHandler = (event) => {
      const anchor = findAnchor(event.target)
      if (anchor !== null) {
        const classList = new Array(...anchor.classList)
        if (
          !classList.includes('navbar-brand') &&
          !classList.includes('nav-link') &&
          !classList.includes('dropdown-item')
        ) {
          const href = anchor.attributes.href.value
          if (href && !event.shiftKey && !event.ctrlKey && !event.altKey) {
            event.preventDefault()
            if (!editable) {
              navigate(href)
            }
          }
        }
      }
    }
    document.addEventListener('click', linkHandler)
    return () => {
      document.removeEventListener('click', linkHandler)
    }
  }, [editable, navigate])
  React.useEffect(() => {
    if (props.socketMode && globalThis.io) {
      const socket = globalThis.io({ path: `${appRoot}/socket.io` })
      socket.on('load', (data) => {
        if (windowId !== data.windowId) {
          reload(data)
        }
      })
      socket.on('reload-app', () => {
        globalThis.location.reload()
      })
      setSocket(socket)
    }
  }, [appRoot, reload, props.socketMode, windowId])
  // UPDATES
  React.useEffect(() => {
    globalThis.preaction = {
      getSettings,
      reload,
      navigate,
      redirect,
      toggleEditMode,
      toggleSettings,
    }
  }, [getSettings, reload, navigate, redirect, toggleEditMode, toggleSettings])
  const [prevActivePage, setPrevActivePage] = React.useState(activePage)
  React.useEffect(() => {
    const settings = getSettings()
    const bodyClasses = ['pxn-cms-body']
    // set path class on body to allow path-specific styling
    if (props.activePathname === '/login/') {
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
      trackPageView()
    }
  }, [
    activePage,
    props.activePathname,
    getSettings,
    prevActivePage,
    trackPageView,
  ])

  const [watchAction, setWatchAction] = React.useState(null)
  React.useEffect(() => {
    if (watchAction) {
      if (watchAction.action === 'delete-page' && watchAction.pageId) {
        redirect('..').then(() => {
          emitSave(watchAction)
        })
      }
      setWatchAction(null)
    }
  }, [watchAction, emitSave, redirect])

  // VARIABLES
  const settings = getSettings()
  const sm = getSiteMap()
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

  // REFS
  const ref = React.useRef()
  const settingsUpdateTimer = React.useRef()
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
      <Boilerplate
        navBar={
          settings.navPosition === 'fixed-top' ? (
            <NavBar
              fluid={settings.maxWidthNav}
              fixedTo='top'
              itemKey='className'
              theme={settings.navbarTheme}
              brand={{
                name: settings.siteTitle,
                href: `/${sm.path}${sm.key === 'home' ? '' : '/'}`,
                onClick: (e) => {
                  if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
                    e.preventDefault()
                    navigate(`/${sm.path}${sm.key === 'home' ? '' : '/'}`)
                  }
                },
              }}
              menu={getMenu()}
            />
          ) : undefined
        }
        header={
          <div className={getLinkClassName(settings.headerTheme)}>
            {settings.navPosition === 'above-header' ? (
              <Nav
                menu={getMenu()}
                itemKey='className'
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
              appRoot={appRoot}
              editable={editable}
              emitSave={emitSave}
              navigate={navigate}
              settings={settings}
              show={settings.showHeader}
              token={token}
              initPage={props.initPage ? props.initPage.header : undefined}
            />
            {settings.navPosition === 'below-header' ? (
              <Nav
                menu={getMenu()}
                itemKey='className'
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
                appRoot={appRoot}
                editable={editable}
                emitSave={emitSave}
                navigate={navigate}
                settings={settings}
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
              appRoot={appRoot}
              editable={editable}
              emitSave={emitSave}
              navigate={navigate}
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
            <div className='font-weight-bold'>Main: {props.activePathname}</div>
          ) : (
            ''
          )}
          <Routes>
            <Route
              exact
              path='/'
              element={
                <Page
                  appRoot={appRoot}
                  editable={editable}
                  emitSave={emitSave}
                  fallbackSettings={getFallbackSettings()}
                  path='/home/'
                  headerControl={getShowPropertyValueHandler('header')}
                  footerControl={getShowPropertyValueHandler('footer')}
                  heroControl={getShowPropertyValueHandler('hero')}
                  navigate={navigate}
                  setActivePathname={props.setActivePathname}
                  setActivePage={setActivePageComplete}
                  token={token}
                  initPage={props.initPage}
                />
              }
            />
            <Route
              exact
              path='/login'
              element={
                <div className='login'>
                  <Login
                    appRoot={appRoot}
                    loadSession={loadSession}
                    navigate={navigate}
                    settings={siteSettings}
                    setToken={setToken}
                    token={token}
                  />
                </div>
              }
            />
            <Route
              path='*'
              element={
                <PageRoute
                  deletePage={deletePage}
                  editable={editable}
                  emitSave={emitSave}
                  appRoot={appRoot}
                  getShowPropertyValueHandler={getShowPropertyValueHandler}
                  handleNotFound={handleNotFound}
                  handlePageError={handlePageError}
                  init404={props.init404}
                  initError={props.initError}
                  initPage={props.initPage}
                  navigate={navigate}
                  setActivePage={setActivePageComplete}
                  setActivePathname={props.setActivePathname}
                  token={token}
                />
              }
            />
          </Routes>
          {editable ? <hr /> : ''}
        </div>
      </Boilerplate>
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
              onClick={toggleSettings}
            >
              Close
            </button>
          }
        >
          {editable && show.settings ? (
            <SiteSettings
              appRoot={appRoot}
              admin={admin}
              emitForceReload={emitForceReload}
              settings={siteSettings}
              getSettingsValueHandler={getSettingsValueHandler}
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
                  toggleNewPage()
                }}
              >
                Cancel
              </button>
            </div>
          }
        >
          {editable && show.newPage ? (
            <NewPage
              activePathname={props.activePathname}
              getValueHandler={getNewPageValueHandler}
              newPage={newPage}
              submit={submitNewPage}
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
  activePathname: PropTypes.string,
  appRoot: PropTypes.string,
  init404: PropTypes.bool,
  initError: PropTypes.string,
  initPage: PropTypes.object,
  initPath: PropTypes.string.isRequired,
  initSettings: PropTypes.object,
  setActivePathname: PropTypes.func.isRequired,
  socketMode: PropTypes.bool,
}

export default AppContainer
