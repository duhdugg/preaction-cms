import axios from 'axios'
import PropTypes from 'prop-types'
import React from 'react'
import loadable from '@loadable/component'
import ErrorMessage from './ErrorMessage.jsx'
import NotFound from './NotFound.jsx'
import PageBlockParent from './PageBlockParent.jsx'
import { Modal, Nav, Spinner } from '@preaction/bootstrap-clips'
import {
  MdCreate,
  MdFilterFrames,
  MdSettingsInputComponent,
  MdSpaceBar,
  MdViewCarousel,
} from 'react-icons/md'
import { FaHtml5, FaSitemap } from 'react-icons/fa'
import { blockExtensions } from './ext'
import env from './lib/env.js'

const PageSettings = loadable(() => import('./settingsModules.js'), {
  fallback: <Spinner size='3.25' />,
  resolveComponent: (module) => module.PageSettings,
})

const ssr = typeof window === 'undefined'
const test = env.NODE_ENV === 'test'

const copyObj = (ob) => JSON.parse(JSON.stringify(ob))

function Page(props) {
  const [page, setPage] = React.useState(
    props.initPage ? copyObj(props.initPage) : null
  )
  const [showSettings, setShowSettings] = React.useState(false)
  const [updateTimer, setUpdateTimer] = React.useState(null)

  const helpers = React.useMemo(
    () => ({
      addContent: (block, contentType, settings = {}) => {
        axios
          .post(
            `${props.appRoot}/api/page/blocks/${block.id}/content?token=${props.token}`,
            {
              contentType,
              settings,
            }
          )
          .then((response) => {
            const pageCopy = copyObj(page)
            pageCopy.pageblocks.forEach((pageblock) => {
              if (block.id === pageblock.id) {
                if (!block.pageblockcontents) {
                  block.pageblockcontents = []
                }
                block.pageblockcontents.push(response.data)
              }
            })
            setPage(pageCopy)
            props.emitSave({
              action: 'add-content',
              blockId: block.id,
              pageId: block.pageId,
            })
          })
      },
      addPageBlock: (block) => {
        axios
          .post(
            `${props.appRoot}/api/page/${page.id}/blocks?token=${props.token}`,
            block
          )
          .then((response) => {
            const pageCopy = copyObj(page)
            if (!pageCopy.pageblocks) {
              pageCopy.pageblocks = []
            }
            pageCopy.pageblocks.push(response.data)
            setPage(pageCopy)
            props.emitSave({
              action: 'add-pageblock',
              pageId: pageCopy.id,
            })
          })
      },
      blockControl: (blockId, action) => {
        const pageCopy = copyObj(page)
        // actions: previous, next, delete, refresh
        let blocks = helpers.getBlocks(pageCopy.pageblocks)
        let block
        let index = 0
        while (index < blocks.length) {
          block = blocks[index]
          if (block.id === blockId) {
            break
          }
          index++
        }
        if (action === 'previous') {
          block.ordering--
          let prevBlock = blocks[index - 1]
          prevBlock.ordering++
          axios
            .put(
              `${props.appRoot}/api/page/blocks/${block.id}?token=${props.token}`,
              block
            )
            .then(() => {
              props.emitSave({
                action: 'update-pageblock',
                blockId: block.id,
                pageId: block.pageId,
              })
            })
          axios
            .put(
              `${props.appRoot}/api/page/blocks/${prevBlock.id}?token=${props.token}`,
              prevBlock
            )
            .then(() => {
              props.emitSave({
                action: 'update-pageblock',
                blockId: prevBlock.id,
                pageId: prevBlock.pageId,
              })
            })
          blocks[index] = block
          blocks[index - 1] = prevBlock
        } else if (action === 'next') {
          block.ordering++
          let nextBlock = blocks[index + 1]
          nextBlock.ordering--
          axios
            .put(
              `${props.appRoot}/api/page/blocks/${block.id}?token=${props.token}`,
              block
            )
            .then(() => {
              props.emitSave({
                action: 'update-pageblock',
                blockId: block.id,
                pageId: block.pageId,
              })
            })
          axios
            .put(
              `${props.appRoot}/api/page/blocks/${nextBlock.id}?token=${props.token}`,
              nextBlock
            )
            .then(() => {
              props.emitSave({
                action: 'update-pageblock',
                blockId: nextBlock.id,
                pageId: nextBlock.pageId,
              })
            })
          blocks[index] = block
          blocks[index + 1] = nextBlock
        } else if (action === 'delete') {
          if (test || globalThis.confirm('Delete this block?')) {
            axios
              .delete(
                `${props.appRoot}/api/page/blocks/${blockId}?token=${props.token}`
              )
              .then(() => {
                props.emitSave({
                  action: 'delete-pageblock',
                  blockId: blockId,
                  pageId: pageCopy.id,
                })
              })
            let ordering = block.ordering
            blocks.splice(index, 1)
            blocks.forEach((blk) => {
              if (blk.ordering > ordering) {
                blk.ordering--
              }
            })
            pageCopy.pageblocks = blocks
          }
        } else if (action === 'refresh') {
          axios
            .get(`${props.appRoot}/api/page/blocks/${blockId}`)
            .then((response) => {
              const pageCopy = copyObj(page)
              for (let x = 0; x < pageCopy.pageblocks.length; x++) {
                let block = pageCopy.pageblocks[x]
                if (block.id === blockId) {
                  pageCopy.pageblocks[x] = response.data
                  break
                }
              }
              setPage(pageCopy)
            })
        }
        setPage(pageCopy)
      },
      deletePage: () => {
        if (props.deletePage) {
          if (
            test ||
            globalThis.confirm(
              `Are you sure you wish to delete the page, "${page.title}"?`
            )
          ) {
            setShowSettings(false)
            props.deletePage(page)
          }
        }
      },
      getInitialError: () => props.initError || undefined,
      getInitialStatus: () => {
        let initialStatus = undefined
        if (props.initError) {
          initialStatus = 'error'
        } else if (props.init404) {
          initialStatus = 'notFound'
        }
        return initialStatus
      },
      getPage: () => page,
      getSplitPath: () => {
        const path = []
        props.path.split('/').forEach((dir) => {
          if (dir) {
            path.push(dir)
          }
        })
        return path
      },
      getSettings: () => {
        const s = Object.assign({}, page ? page.fallbackSettings : {})
        if (props.fallbackSettings) {
          Object.assign(s, props.fallbackSettings)
        }
        Object.assign(s, page ? page.settings : {})
        if (page && page.settings.navOrdering === undefined) {
          s.navOrdering = undefined
        }
        return s
      },
      getTopLevelPageKey: () => helpers.getSplitPath()[0],
      getBlocks: (blocks) => {
        return blocks.concat().sort((a, b) => {
          let retval = 0
          if (a.ordering < b.ordering) {
            retval = -1
          } else if (a.ordering > b.ordering) {
            retval = 1
          }
          return retval
        })
      },
      getContents: (contents) => {
        return contents.concat().sort((a, b) => {
          let retval = 0
          if (a.ordering < b.ordering) {
            retval = -1
          } else if (a.ordering > b.ordering) {
            retval = 1
          }
          return retval
        })
      },
      getContentSettingsValueHandler: (pageblockId, contentId, key) => {
        return (value) => {
          const pageCopy = copyObj(page)
          pageCopy.pageblocks.forEach((pageblock) => {
            if (pageblock.id === pageblockId) {
              pageblock.pageblockcontents.forEach((content) => {
                if (content.id === contentId) {
                  if (
                    [
                      'smWidth',
                      'mdWidth',
                      'lgWidth',
                      'xsWidth',
                      'xxlWidth',
                    ].includes(key)
                  ) {
                    // minimum value for width attribute is here
                    // to allow the correct visual spacing on the sliders
                    if (value < 1) {
                      value = 1
                    }
                  }
                  content.settings[key] = value
                }
              })
            }
          })
          setPage(pageCopy)
          pageCopy.pageblocks.forEach((pageblock) => {
            if (pageblock.id === pageblockId) {
              pageblock.pageblockcontents.forEach((content) => {
                if (content.id === contentId) {
                  clearTimeout(updateTimer)
                  setUpdateTimer(
                    setTimeout(() => {
                      let contentObj = JSON.parse(JSON.stringify(content))
                      delete contentObj.wysiwyg
                      axios
                        .put(
                          `${props.appRoot}/api/page/blocks/content/${contentId}?token=${props.token}`,
                          contentObj
                        )
                        .then(() => {
                          props.emitSave({
                            action: 'update-content',
                            contentId: contentId,
                            blockId: pageblock.id,
                            pageId: pageCopy.id,
                          })
                        })
                    }, 1000)
                  )
                }
              })
            }
          })
        }
      },
      getPageSettingIsUndefined: (key) => page.settings[key] === undefined,
      getPageBlockSettingsValueHandler: (pageblockId, key) => (value) => {
        const pageCopy = copyObj(page)
        pageCopy.pageblocks.forEach((pageblock) => {
          if (pageblock.id === pageblockId) {
            if (
              ['smWidth', 'mdWidth', 'lgWidth', 'xsWidth', 'xxlWidth'].includes(
                key
              )
            ) {
              // minimum value for width attribute is here
              // to allow the correct visual spacing on the sliders
              if (value < 1) {
                value = 1
              }
            }
            pageblock.settings[key] = value
          }
        })
        setPage(pageCopy)
        pageCopy.pageblocks.forEach((pageblock) => {
          if (pageblock.id === pageblockId) {
            clearTimeout(updateTimer)
            setUpdateTimer(
              setTimeout(() => {
                axios
                  .put(
                    `${props.appRoot}/api/page/blocks/${pageblockId}?token=${props.token}`,
                    pageblock
                  )
                  .then(() => {
                    props.emitSave({
                      action: 'update-pageblock',
                      blockId: pageblockId,
                      pageId: pageCopy.id,
                    })
                  })
              }, 1000)
            )
          }
        })
      },
      getPageSettingsResetter: (key) => () => {
        const pageCopy = copyObj(page)
        delete pageCopy.settings[key]
        setPage(pageCopy)
        clearTimeout(updateTimer)
        setUpdateTimer(
          setTimeout(() => {
            axios
              .put(
                `${props.appRoot}/api/page/${pageCopy.id}?token=${props.token}`,
                pageCopy
              )
              .then(() => {
                setWatchAction('loadSettings')
                props.emitSave({
                  action: 'update-pageSettings',
                  pageId: pageCopy.id,
                })
              })
          }, 1000)
        )
      },
      getPageSettingsValueHandler: (key) => {
        return (value) => {
          const pageCopy = copyObj(page)
          pageCopy.settings[key] = value
          if (key === 'showHeader') {
            props.headerControl(value)
          } else if (key === 'showFooter') {
            props.footerControl(value)
          } else if (key === 'showHero') {
            props.heroControl(value)
          }
          setPage(pageCopy)
          if (props.setActivePage) {
            props.setActivePage(pageCopy)
          }
          clearTimeout(updateTimer)
          setUpdateTimer(
            setTimeout(() => {
              axios
                .put(
                  `${props.appRoot}/api/page/${pageCopy.id}?token=${props.token}`,
                  pageCopy
                )
                .then(() => {
                  props.emitSave({
                    action: 'update-page',
                    pageId: pageCopy.id,
                  })
                })
            }, 1000)
          )
        }
      },
      getPageValueHandler: (key) => (value) => {
        const pageCopy = copyObj(page)
        pageCopy[key] = value
        setPage(pageCopy)
        if (props.setActivePage) {
          props.setActivePage(pageCopy)
        }
        clearTimeout(updateTimer)
        setUpdateTimer(
          setTimeout(() => {
            axios
              .put(
                `${props.appRoot}/api/page/${pageCopy.id}?token=${props.token}`,
                pageCopy
              )
              .then(() => {
                props.emitSave({
                  action: 'update-page',
                  pageId: pageCopy.id,
                })
              })
          }, 1000)
        )
      },
      getPageControlsMenu: () => {
        const extensionBlockMenuItems = []
        for (let extKey of Object.keys(blockExtensions)) {
          const Extension = blockExtensions[extKey]
          extensionBlockMenuItems.push({
            className: `add-extension-block-${extKey}`,
            name: (
              <span>
                <MdSettingsInputComponent /> {Extension.label}
              </span>
            ),
            onClick: (e) => {
              e.preventDefault()
              helpers.addPageBlock({
                blockType: 'ext',
                settings: {
                  extKey,
                  propsData: Extension.defaultProps || {},
                },
              })
            },
          })
        }
        const menu = [
          {
            className: 'add-block-dropdown',
            name: (
              <span>
                <MdCreate /> add block
              </span>
            ),
            icon: 'arrow-dropdown',
            subMenu: [
              {
                className: 'add-carousel-block',
                name: (
                  <span>
                    <MdViewCarousel /> Carousel
                  </span>
                ),
                onClick: (e) => {
                  e.preventDefault()
                  helpers.addPageBlock({ blockType: 'carousel' })
                },
              },
              {
                className: 'add-content-block',
                name: (
                  <span>
                    <FaHtml5 /> Content
                  </span>
                ),
                onClick: (e) => {
                  e.preventDefault()
                  helpers.addPageBlock({ blockType: 'content' })
                },
              },
              {
                className: 'add-iframe-block',
                name: (
                  <span>
                    <MdFilterFrames /> iframe
                  </span>
                ),
                onClick: (e) => {
                  e.preventDefault()
                  helpers.addPageBlock({ blockType: 'iframe' })
                },
              },
              {
                className: `add-nav-block ${
                  page.userCreated ? 'd-block' : 'd-none'
                }`,
                name: (
                  <span>
                    <FaSitemap /> Navigation
                  </span>
                ),
                onClick: (e) => {
                  e.preventDefault()
                  helpers.addPageBlock({ blockType: 'nav' })
                },
              },
              {
                className: 'add-spacer-block',
                name: (
                  <span>
                    <MdSpaceBar /> Spacer
                  </span>
                ),
                onClick: (e) => {
                  e.preventDefault()
                  helpers.addPageBlock({ blockType: 'spacer' })
                },
              },
              ...extensionBlockMenuItems,
            ],
            onClick: (e) => {
              e.preventDefault()
            },
          },
        ]
        return menu
      },
      contentControl: (pageBlock, index, action) => {
        // actions: previous, next, delete
        let contents = helpers.getContents(pageBlock.pageblockcontents)
        let content = contents[index]
        if (action === 'previous') {
          content.ordering--
          let prevContent = contents[index - 1]
          prevContent.ordering++
          delete content.wysiwyg
          delete prevContent.wysiwyg
          axios
            .put(
              `${props.appRoot}/api/page/blocks/content/${content.id}?token=${props.token}`,
              content
            )
            .then(() => {
              props.emitSave({
                action: 'update-content',
                contentId: content.id,
                blockId: pageBlock.id,
                pageId: pageBlock.pageId,
              })
            })
          axios
            .put(
              `${props.appRoot}/api/page/blocks/content/${prevContent.id}?token=${props.token}`,
              prevContent
            )
            .then(() => {
              props.emitSave({
                action: 'update-content',
                contentId: prevContent.id,
                blockId: prevContent.pageblockId,
                pageId: page.id,
              })
            })
          contents[index] = content
          contents[index - 1] = prevContent
        } else if (action === 'next') {
          content.ordering++
          let nextContent = contents[index + 1]
          nextContent.ordering--
          delete content.wysiwyg
          delete nextContent.wysiwyg
          axios
            .put(
              `${props.appRoot}/api/page/blocks/content/${content.id}?token=${props.token}`,
              content
            )
            .then(() => {
              props.emitSave({
                action: 'update-content',
                contentId: content.id,
                blockId: content.pageblockId,
                pageId: page.id,
              })
            })
          axios
            .put(
              `${props.appRoot}/api/page/blocks/content/${nextContent.id}?token=${props.token}`,
              nextContent
            )
            .then(() => {
              props.emitSave({
                action: 'update-content',
                contentId: nextContent.id,
                blockId: nextContent.pageblockId,
                pageId: page.id,
              })
            })
          contents[index] = content
          contents[index + 1] = nextContent
        } else if (action === 'delete') {
          if (test || globalThis.confirm('Delete this content?')) {
            axios
              .delete(
                `${props.appRoot}/api/page/blocks/content/${content.id}?token=${props.token}`
              )
              .then(() => {
                props.emitSave({
                  action: 'delete-content',
                  contentId: content.id,
                  blockId: content.pageBlockId,
                  pageId: page.id,
                })
              })
            let x = pageBlock.pageblockcontents.indexOf(content)
            let ordering = content.ordering
            pageBlock.pageblockcontents.splice(x, 1)
            contents.forEach((content) => {
              if (content.ordering > ordering) {
                content.ordering--
              }
            })
          }
        }
        page.pageblocks.forEach((pb) => {
          if (pb.id === pageBlock.id) {
            for (let x = 0; x < pb.pageblockcontents.length; x++) {
              if (pb.pageblockcontents[x].id === content.id) {
                pb.pageblockcontents[x] = content
                break
              }
            }
          }
        })
        setPage(copyObj(page))
      },
      loadPage: (path) => {
        // remove leading slash
        path = path.replace(/^\//, '')
        // clear the state
        setStatus('loading')
        setPage(null)
        // use pathOnRequest variable to prevent loading incorrect content
        // pathonRequest will be compared to the current props path
        // after axios.get resolves
        let pathOnRequest = props.path
        // get the page data by path
        axios
          .get(`${props.appRoot}/api/page/by-key/${path}`)
          .then((response) => {
            // if pathOnRequest does not match current props path,
            // don't do anything, as the application has navigated
            // to a different path
            if (pathOnRequest !== props.path) {
              return
            }
            // set the page state
            const pg = response.data
            setStatus('ok')
            setPage(pg)
            // load settings
            if (!['header', 'footer', 'hero'].includes(pg.key)) {
              setWatchAction('loadSettings')
            }
            // communicate to parent component
            if (props.setActivePage) {
              props.setActivePage(pg)
            }
            if (props.setActivePathname) {
              props.setActivePathname(props.path)
            }
            // set the title if page is not header, footer, nor hero
            if (path.match(/\/(header|footer|hero)\/$/g) === null) {
              const settings = helpers.getSettings()
              let title = ''
              if (helpers.getTopLevelPageKey() === 'home') {
                title = settings.siteTitle
              } else {
                title = `${response.data.title} | ${settings.siteTitle}`
              }
              document.title = title
            }
          })
          .catch((e) => {
            if (!test) {
              console.error(e)
            }
            if (e.response && e.response.status === 404) {
              // set notFound state on 404
              setStatus('notFound')
              // communicate to parent component
              helpers.onNotFound()
            } else {
              let errorMessage
              try {
                errorMessage = e.response.data.error
              } catch (e) {}
              helpers.onError(errorMessage)
            }
          })
      },
      loadSettings: () => {
        // control showing header/footer/hero in parent App.jsx component
        if (!page) {
          return
        }
        const settings = helpers.getSettings()
        if (!['header', 'footer', 'hero'].includes(page.key)) {
          props.headerControl(settings.showHeader !== false)
          props.footerControl(settings.showFooter !== false)
          props.heroControl(settings.showHero !== false)
        }
      },
      onError: (errorMessage) => {
        setErrorMessage(errorMessage)
        setStatus('error')
        if (props.onError) {
          props.onError()
        }
      },
      onNotFound: () =>
        props.onNotFound ? props.onNotFound(props.path) : null,
      reload: () => helpers.loadPage(props.path),
      toggleSettings: () => setShowSettings(!showSettings),
    }),
    [page, props, showSettings, updateTimer]
  )

  const [status, setStatus] = React.useState(helpers.getInitialStatus())
  const [errorMessage, setErrorMessage] = React.useState(
    helpers.getInitialError()
  )

  if (props.init404) {
    if (!ssr) {
      helpers.onNotFound()
    }
  }

  // on mount
  React.useEffect(() => {
    if (!page && !status) {
      helpers.loadPage(props.path)
    }
    if (ref.current) {
      Object.assign(ref.current, helpers)
    }
  })

  // call helpers.loadPage when props.path changes
  const [prevPath, setPrevPath] = React.useState(props.path)
  React.useEffect(() => {
    if (prevPath !== props.path) {
      helpers.loadPage(props.path)
      setPrevPath(props.path)
    }
  }, [props.path, prevPath, setPrevPath, helpers])

  const [watchAction, setWatchAction] = React.useState(null)
  React.useEffect(() => {
    if (watchAction) {
      if (watchAction === 'loadSettings') {
        helpers.loadSettings()
      }
      setWatchAction(null)
    }
  }, [watchAction, setWatchAction, helpers, props.path])

  const ref = React.useRef() // needed for testing
  const settings = helpers.getSettings()
  return (
    <div className='page' ref={ref}>
      {page ? (
        <div className='row pageblocks'>
          {page.pageblocks
            ? helpers.getBlocks(page.pageblocks).map((block, index) => {
                return (
                  <PageBlockParent
                    addContent={helpers.addContent}
                    appRoot={props.appRoot}
                    block={block}
                    blockControl={helpers.blockControl}
                    contentControl={helpers.contentControl}
                    editable={props.editable}
                    emitSave={props.emitSave}
                    first={index === 0}
                    getContents={helpers.getContents}
                    getContentSettingsValueHandler={
                      helpers.getContentSettingsValueHandler
                    }
                    getPageBlockSettingsValueHandler={
                      helpers.getPageBlockSettingsValueHandler
                    }
                    key={block.id}
                    last={index === page.pageblocks.length - 1}
                    navigate={props.navigate}
                    page={page}
                    settings={helpers.getSettings()}
                    token={props.token}
                  />
                )
              })
            : ''}
          {props.editable ? (
            <div className='page-controls col-12'>
              <Nav type='tabs' menu={helpers.getPageControlsMenu()} />
            </div>
          ) : (
            ''
          )}
        </div>
      ) : (
        ''
      )}
      {page ? (
        <div className='page-settings-modal-container'>
          <Modal
            title='Page Settings'
            show={props.editable && showSettings}
            setShow={setShowSettings}
            size='lg'
            headerTheme='secondary'
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
            {props.editable && showSettings ? (
              <PageSettings
                appRoot={props.appRoot}
                admin={props.editable}
                navigate={(path) => {
                  setShowSettings(false)
                  props.navigate(path)
                }}
                pageId={page.id}
                page={page}
                path={props.path}
                settings={settings}
                token={props.token}
                deletePage={helpers.deletePage}
                getPageValueHandler={helpers.getPageValueHandler}
                getResetter={helpers.getPageSettingsResetter}
                getSettingsValueHandler={helpers.getPageSettingsValueHandler}
                getPageSettingIsUndefined={helpers.getPageSettingIsUndefined}
              />
            ) : (
              ''
            )}
          </Modal>
        </div>
      ) : (
        ''
      )}
      {status === 'loading' ? <Spinner size='3.25' /> : ''}
      {status === 'error' ? <ErrorMessage errorMessage={errorMessage} /> : ''}
      {status === 'notFound' ? <NotFound /> : ''}
    </div>
  )
}

Page.propTypes = {
  appRoot: PropTypes.string.isRequired,
  deletePage: PropTypes.func,
  editable: PropTypes.bool,
  emitSave: PropTypes.func.isRequired,
  fallbackSettings: PropTypes.object,
  footerControl: PropTypes.func,
  headerControl: PropTypes.func,
  heroControl: PropTypes.func,
  init404: PropTypes.bool, // for SSR
  initError: PropTypes.string, // for SSR
  initPage: PropTypes.object, // for SSR
  navigate: PropTypes.func.isRequired,
  onError: PropTypes.func,
  onNotFound: PropTypes.func,
  path: PropTypes.string.isRequired,
  setActivePage: PropTypes.func,
  setActivePathname: PropTypes.func,
  token: PropTypes.string,
}

export default Page
