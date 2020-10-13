import axios from 'axios'
import PropTypes from 'prop-types'
import React from 'react'
import ErrorMessage from './ErrorMessage.jsx'
import NotFound from './NotFound.jsx'
import PageBlock from './PageBlock.jsx'
import { Modal, Nav, Spinner } from '@preaction/bootstrap-clips'
import PageSettings from './PageSettings.jsx'
import {
  MdCreate,
  MdFilterFrames,
  MdSettingsInputComponent,
  MdSpaceBar,
  MdViewCarousel,
} from 'react-icons/md'
import { FaHtml5, FaSitemap } from 'react-icons/fa'
import globalthis from 'globalthis'
import { blockExtensions } from './ext'
import env from './lib/env.js'

const globalThis = globalthis()
const ssr = typeof window === 'undefined'

class Page extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      errorMessage: undefined,
      page: this.props.initPage
        ? JSON.parse(JSON.stringify(this.props.initPage))
        : null,
      showSettings: false,
      status: undefined,
    }
    if (this.props.initError) {
      this.state.status = 'error'
      this.state.errorMessage = this.props.initError
      if (!ssr) {
        this.onError(this.props.initError)
      }
    } else if (this.props.init404) {
      this.state.status = 'notFound'
      if (!ssr) {
        this.onNotFound()
      }
    }
    this.updateTimer = null
    // ref needed for testing
    if (env.NODE_ENV === 'test') {
      this.ref = React.createRef()
    }
  }

  addContent(block, contentType, settings = {}) {
    axios
      .post(
        `${this.props.appRoot}/api/page/blocks/${block.id}/content?token=${this.props.token}`,
        {
          contentType,
          settings,
        }
      )
      .then((response) => {
        this.setState((state) => {
          state.page.pageblocks.forEach((pageblock) => {
            if (block.id === pageblock.id) {
              if (!block.pageblockcontents) {
                block.pageblockcontents = []
              }
              block.pageblockcontents.push(response.data)
            }
          })
          return state
        })
        this.props.emitSave({
          action: 'add-content',
          blockId: block.id,
          pageId: block.pageId,
        })
      })
  }

  addPageBlock(block) {
    axios
      .post(
        `${this.props.appRoot}/api/page/${this.state.page.id}/blocks?token=${this.props.token}`,
        block
      )
      .then((response) => {
        this.setState((state) => {
          if (!state.page.pageblocks) {
            state.page.pageblocks = []
          }
          state.page.pageblocks.push(response.data)
          return state
        })
        this.props.emitSave({
          action: 'add-pageblock',
          pageId: this.state.page.id,
        })
      })
  }

  blockControl(blockId, action) {
    // actions: previous, next, delete, refresh
    this.setState((state) => {
      let blocks = this.getBlocks(state.page.pageblocks)
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
            `${this.props.appRoot}/api/page/blocks/${block.id}?token=${this.props.token}`,
            block
          )
          .then(() => {
            this.props.emitSave({
              action: 'update-pageblock',
              blockId: block.id,
              pageId: block.pageId,
            })
          })
        axios
          .put(
            `${this.props.appRoot}/api/page/blocks/${prevBlock.id}?token=${this.props.token}`,
            prevBlock
          )
          .then(() => {
            this.props.emitSave({
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
            `${this.props.appRoot}/api/page/blocks/${block.id}?token=${this.props.token}`,
            block
          )
          .then(() => {
            this.props.emitSave({
              action: 'update-pageblock',
              blockId: block.id,
              pageId: block.pageId,
            })
          })
        axios
          .put(
            `${this.props.appRoot}/api/page/blocks/${nextBlock.id}?token=${this.props.token}`,
            nextBlock
          )
          .then(() => {
            this.props.emitSave({
              action: 'update-pageblock',
              blockId: nextBlock.id,
              pageId: nextBlock.pageId,
            })
          })
        blocks[index] = block
        blocks[index + 1] = nextBlock
      } else if (action === 'delete') {
        if (globalThis.confirm('Delete this block?')) {
          axios
            .delete(
              `${this.props.appRoot}/api/page/blocks/${blockId}?token=${this.props.token}`
            )
            .then(() => {
              this.props.emitSave({
                action: 'delete-pageblock',
                blockId: blockId,
                pageId: state.page.id,
              })
            })
          let ordering = block.ordering
          blocks.splice(index, 1)
          blocks.forEach((blk) => {
            if (blk.ordering > ordering) {
              blk.ordering--
            }
          })
          state.page.pageblocks = blocks
        }
      } else if (action === 'refresh') {
        axios
          .get(`${this.props.appRoot}/api/page/blocks/${blockId}`)
          .then((response) => {
            this.setState((state) => {
              for (let x = 0; x < state.page.pageblocks.length; x++) {
                let block = state.page.pageblocks[x]
                if (block.id === blockId) {
                  state.page.pageblocks[x] = response.data
                  break
                }
              }
              return state
            })
          })
      }
      return state
    })
  }

  deletePage() {
    if (this.props.deletePage) {
      if (
        globalThis.confirm(
          `Are you sure you wish to delete the page, "${this.state.page.title}"?`
        )
      ) {
        this.setState(
          (state) => {
            state.showSettings = false
            return state
          },
          () => {
            this.props.deletePage(this.state.page)
          }
        )
      }
    }
  }

  get splitPath() {
    let path = []
    this.props.path.split('/').forEach((dir) => {
      if (dir) {
        path.push(dir)
      }
    })
    return path
  }

  get settings() {
    let s = Object.assign({}, this.state.page.fallbackSettings)
    if (this.props.fallbackSettings) {
      Object.assign(s, this.props.fallbackSettings)
    }
    Object.assign(s, this.state.page.settings)
    if (this.state.page.settings.navOrdering === undefined) {
      s.navOrdering = undefined
    }
    return s
  }

  get topLevelPageKey() {
    return this.splitPath[0]
  }

  getBlocks(blocks) {
    return blocks.concat().sort((a, b) => {
      let retval = 0
      if (a.ordering < b.ordering) {
        retval = -1
      } else if (a.ordering > b.ordering) {
        retval = 1
      }
      return retval
    })
  }

  getContents(contents) {
    return contents.concat().sort((a, b) => {
      let retval = 0
      if (a.ordering < b.ordering) {
        retval = -1
      } else if (a.ordering > b.ordering) {
        retval = 1
      }
      return retval
    })
  }

  getContentSettingsValueHandler(pageblockId, contentId, key) {
    return (value) => {
      this.setState(
        (state) => {
          this.state.page.pageblocks.forEach((pageblock) => {
            if (pageblock.id === pageblockId) {
              pageblock.pageblockcontents.forEach((content) => {
                if (content.id === contentId) {
                  if (
                    ['smWidth', 'mdWidth', 'lgWidth', 'xsWidth'].includes(key)
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
          return state
        },
        () => {
          this.state.page.pageblocks.forEach((pageblock) => {
            if (pageblock.id === pageblockId) {
              pageblock.pageblockcontents.forEach((content) => {
                if (content.id === contentId) {
                  clearTimeout(this.updateTimer)
                  this.updateTimer = setTimeout(() => {
                    let contentObj = JSON.parse(JSON.stringify(content))
                    delete contentObj.wysiwyg
                    axios
                      .put(
                        `${this.props.appRoot}/api/page/blocks/content/${contentId}?token=${this.props.token}`,
                        contentObj
                      )
                      .then(() => {
                        this.props.emitSave({
                          action: 'update-content',
                          contentId: contentId,
                          blockId: pageblock.id,
                          pageId: this.state.page.id,
                        })
                      })
                  }, 1000)
                }
              })
            }
          })
        }
      )
    }
  }

  getPageSettingIsUndefined(key) {
    return this.state.page.settings[key] === undefined
  }

  getPageBlockSettingsValueHandler(pageblockId, key) {
    return (value) => {
      this.setState(
        (state) => {
          this.state.page.pageblocks.forEach((pageblock) => {
            if (pageblock.id === pageblockId) {
              if (['smWidth', 'mdWidth', 'lgWidth', 'xsWidth'].includes(key)) {
                // minimum value for width attribute is here
                // to allow the correct visual spacing on the sliders
                if (value < 1) {
                  value = 1
                }
              }
              pageblock.settings[key] = value
            }
          })
          return state
        },
        () => {
          this.state.page.pageblocks.forEach((pageblock) => {
            if (pageblock.id === pageblockId) {
              clearTimeout(this.updateTimer)
              this.updateTimer = setTimeout(() => {
                axios
                  .put(
                    `${this.props.appRoot}/api/page/blocks/${pageblockId}?token=${this.props.token}`,
                    pageblock
                  )
                  .then(() => {
                    this.props.emitSave({
                      action: 'update-pageblock',
                      blockId: pageblockId,
                      pageId: this.state.page.id,
                    })
                  })
              }, 1000)
            }
          })
        }
      )
    }
  }

  getPageSettingsResetter(key) {
    return () => {
      this.setState(
        (state) => {
          delete state.page.settings[key]
          return state
        },
        () => {
          clearTimeout(this.updateTimer)
          this.updateTimer = setTimeout(() => {
            axios
              .put(
                `${this.props.appRoot}/api/page/${this.state.page.id}?token=${this.props.token}`,
                this.state.page
              )
              .then(() => {
                this.loadSettings()
                this.props.emitSave({
                  action: 'update-pageSettings',
                  pageId: this.state.page.id,
                })
              })
          }, 1000)
        }
      )
    }
  }

  getPageSettingsValueHandler(key) {
    return (value) => {
      this.setState(
        (state) => {
          state.page.settings[key] = value
          if (key === 'showHeader') {
            this.props.headerControl(value)
          } else if (key === 'showFooter') {
            this.props.footerControl(value)
          } else if (key === 'showJumbo') {
            this.props.jumboControl(value)
          }
          return state
        },
        () => {
          if (this.props.setActivePage) {
            this.props.setActivePage(this.state.page)
          }
          clearTimeout(this.updateTimer)
          this.updateTimer = setTimeout(() => {
            axios
              .put(
                `${this.props.appRoot}/api/page/${this.state.page.id}?token=${this.props.token}`,
                this.state.page
              )
              .then(() => {
                this.props.emitSave({
                  action: 'update-page',
                  pageId: this.state.page.id,
                })
              })
          }, 1000)
        }
      )
    }
  }

  // used for page settings modal
  getPageValueHandler(key) {
    return (value) => {
      this.setState(
        (state) => {
          state.page[key] = value
          return state
        },
        () => {
          if (this.props.setActivePage) {
            this.props.setActivePage(this.state.page)
          }
          clearTimeout(this.updateTimer)
          this.updateTimer = setTimeout(() => {
            axios
              .put(
                `${this.props.appRoot}/api/page/${this.state.page.id}?token=${this.props.token}`,
                this.state.page
              )
              .then(() => {
                this.props.emitSave({
                  action: 'update-page',
                  pageId: this.state.page.id,
                })
              })
          }, 1000)
        }
      )
    }
  }

  get pageControlsMenu() {
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
          this.addPageBlock({
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
              this.addPageBlock({ blockType: 'carousel' })
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
              this.addPageBlock({ blockType: 'content' })
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
              this.addPageBlock({ blockType: 'iframe' })
            },
          },
          {
            className: `add-nav-block ${
              this.state.page.userCreated ? 'd-block' : 'd-none'
            }`,
            name: (
              <span>
                <FaSitemap /> Navigation
              </span>
            ),
            onClick: (e) => {
              e.preventDefault()
              this.addPageBlock({ blockType: 'nav' })
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
              this.addPageBlock({ blockType: 'spacer' })
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
  }

  contentControl(pageBlock, index, action) {
    // actions: previous, next, delete
    this.setState((state) => {
      let contents = this.getContents(pageBlock.pageblockcontents)
      let content = contents[index]
      if (action === 'previous') {
        content.ordering--
        let prevContent = contents[index - 1]
        prevContent.ordering++
        delete content.wysiwyg
        delete prevContent.wysiwyg
        axios
          .put(
            `${this.props.appRoot}/api/page/blocks/content/${content.id}?token=${this.props.token}`,
            content
          )
          .then(() => {
            this.props.emitSave({
              action: 'update-content',
              contentId: content.id,
              blockId: pageBlock.id,
              pageId: pageBlock.pageId,
            })
          })
        axios
          .put(
            `${this.props.appRoot}/api/page/blocks/content/${prevContent.id}?token=${this.props.token}`,
            prevContent
          )
          .then(() => {
            this.props.emitSave({
              action: 'update-content',
              contentId: prevContent.id,
              blockId: prevContent.pageblockId,
              pageId: state.page.id,
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
            `${this.props.appRoot}/api/page/blocks/content/${content.id}?token=${this.props.token}`,
            content
          )
          .then(() => {
            this.props.emitSave({
              action: 'update-content',
              contentId: content.id,
              blockId: content.pageblockId,
              pageId: state.page.id,
            })
          })
        axios
          .put(
            `${this.props.appRoot}/api/page/blocks/content/${nextContent.id}?token=${this.props.token}`,
            nextContent
          )
          .then(() => {
            this.props.emitSave({
              action: 'update-content',
              contentId: nextContent.id,
              blockId: nextContent.pageblockId,
              pageId: state.page.id,
            })
          })
        contents[index] = content
        contents[index + 1] = nextContent
      } else if (action === 'delete') {
        if (globalThis.confirm('Delete this content?')) {
          axios
            .delete(
              `${this.props.appRoot}/api/page/blocks/content/${content.id}?token=${this.props.token}`
            )
            .then(() => {
              this.props.emitSave({
                action: 'delete-content',
                contentId: content.id,
                blockId: content.pageBlockId,
                pageId: state.page.id,
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
      state.page.pageblocks.forEach((pb) => {
        if (pb.id === pageBlock.id) {
          for (let x = 0; x < pb.pageblockcontents.length; x++) {
            if (pb.pageblockcontents[x].id === content.id) {
              pb.pageblockcontents[x] = content
              break
            }
          }
        }
      })
      return state
    })
  }

  loadPage(path) {
    // remove leading slash
    path = path.replace(/^\//, '')
    // clear the state
    this.setState(
      (state) => {
        state.status = 'loading'
        state.page = null
        return state
      },
      () => {
        // use pathOnRequest variable to prevent loading incorrect content
        // pathonRequest will be compared to the current props path
        // after axios.get resolves
        let pathOnRequest = this.props.path
        // get the page data by path
        axios
          .get(`${this.props.appRoot}/api/page/by-key/${path}`)
          .then((response) => {
            // if pathOnRequest does not match current props path,
            // don't do anything, as the application has navigated
            // to a different path
            if (pathOnRequest !== this.props.path) {
              return
            }
            // set the page state
            let page = response.data
            this.setState(
              (state) => {
                state.status = 'ok'
                state.page = page
                return state
              },
              () => {
                // load settings
                this.loadSettings()
                // communicate to parent component
                if (this.props.setActivePage) {
                  this.props.setActivePage(this.state.page)
                }
                if (this.props.setActivePathname) {
                  this.props.setActivePathname(this.props.path)
                }
                // set the title if page is not header, footer, nor jumbo
                if (path.match(/\/(header|footer|jumbo)\/$/g) === null) {
                  let title = ''
                  if (this.topLevelPageKey === 'home') {
                    title = this.settings.siteTitle
                  } else {
                    title = `${response.data.title} | ${this.settings.siteTitle}`
                  }
                  document.title = title
                }
              }
            )
          })
          .catch((e) => {
            if (env.NODE_ENV !== 'test') {
              console.error(e)
            }
            if (e.response && e.response.status === 404) {
              // set notFound state on 404
              this.setState((state) => {
                state.status = 'notFound'
                return state
              })
              // communicate to parent component
              this.onNotFound()
            } else {
              let errorMessage
              try {
                errorMessage = e.response.data.error
              } catch (e) {}
              this.onError(errorMessage)
            }
          })
      }
    )
  }

  loadSettings() {
    // control showing header/footer/jumbo in parent App.jsx component
    if (!['header', 'footer', 'jumbo'].includes(this.state.page.key)) {
      let showHeader = this.settings.showHeader !== false
      let showFooter = this.settings.showFooter !== false
      let showJumbo = this.settings.showJumbo !== false
      this.props.headerControl(showHeader)
      this.props.footerControl(showFooter)
      this.props.jumboControl(showJumbo)
    }
  }

  onError(errorMessage) {
    this.setState({ errorMessage, status: 'error' }, () => {
      if (this.props.onError) {
        this.props.onError()
      }
    })
  }

  onNotFound() {
    if (this.props.onNotFound) {
      this.props.onNotFound(this.props.path)
    }
  }

  reload() {
    this.loadPage(this.props.path)
  }

  toggleSettings() {
    this.setState((state) => {
      state.showSettings = !state.showSettings
      return state
    })
  }

  render() {
    return (
      <div className='page' ref={this.ref}>
        {this.state.page ? (
          <div className='row'>
            {this.state.page.pageblocks
              ? this.getBlocks(this.state.page.pageblocks).map(
                  (block, index) => {
                    return (
                      <PageBlock
                        addContent={this.addContent.bind(this)}
                        appRoot={this.props.appRoot}
                        block={block}
                        blockControl={this.blockControl.bind(this)}
                        contentControl={this.contentControl.bind(this)}
                        editable={this.props.editable}
                        emitSave={this.props.emitSave}
                        first={index === 0}
                        getContents={this.getContents.bind(this)}
                        getContentSettingsValueHandler={this.getContentSettingsValueHandler.bind(
                          this
                        )}
                        getPageBlockSettingsValueHandler={this.getPageBlockSettingsValueHandler.bind(
                          this
                        )}
                        key={block.id}
                        last={index === this.state.page.pageblocks.length - 1}
                        navigate={this.props.navigate}
                        page={this.state.page}
                        settings={this.settings}
                        token={this.props.token}
                      />
                    )
                  }
                )
              : ''}
            {this.props.editable ? (
              <div className='page-controls col-12'>
                <Nav type='tabs' menu={this.pageControlsMenu} />
              </div>
            ) : (
              ''
            )}
            {this.props.editable && this.state.showSettings ? (
              <div className='page-settings-modal-container'>
                <Modal
                  title='Page Settings'
                  closeHandler={this.toggleSettings.bind(this)}
                  headerTheme='secondary'
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
                  <PageSettings
                    appRoot={this.props.appRoot}
                    admin={this.props.editable}
                    navigate={(path) => {
                      this.setState({ showSettings: false }, () => {
                        this.props.navigate(path)
                      })
                    }}
                    pageId={this.state.page.id}
                    page={this.state.page}
                    path={this.props.path}
                    settings={this.settings}
                    token={this.props.token}
                    deletePage={this.deletePage.bind(this)}
                    getPageValueHandler={this.getPageValueHandler.bind(this)}
                    getResetter={this.getPageSettingsResetter.bind(this)}
                    getSettingsValueHandler={this.getPageSettingsValueHandler.bind(
                      this
                    )}
                    getPageSettingIsUndefined={this.getPageSettingIsUndefined.bind(
                      this
                    )}
                  />
                </Modal>
              </div>
            ) : (
              ''
            )}
          </div>
        ) : (
          ''
        )}
        {this.state.status === 'loading' ? <Spinner size='3.25' /> : ''}
        {this.state.status === 'error' ? (
          <ErrorMessage errorMessage={this.state.errorMessage} />
        ) : (
          ''
        )}
        {this.state.status === 'notFound' ? <NotFound /> : ''}
      </div>
    )
  }

  componentDidMount() {
    if (!this.state.page) {
      this.loadPage(this.props.path)
    }
    if (env.NODE_ENV === 'test') {
      this.ref.current.blockControl = this.blockControl.bind(this)
      this.ref.current.deletePage = this.deletePage.bind(this)
      this.ref.current.toggleSettings = this.toggleSettings.bind(this)
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    let retval = true
    if (nextProps.path !== this.props.path) {
      this.loadPage(nextProps.path)
    }
    return retval
  }
}

Page.propTypes = {
  appRoot: PropTypes.string.isRequired,
  deletePage: PropTypes.func,
  editable: PropTypes.bool,
  emitSave: PropTypes.func.isRequired,
  fallbackSettings: PropTypes.object,
  footerControl: PropTypes.func,
  headerControl: PropTypes.func,
  jumboControl: PropTypes.func,
  init404: PropTypes.bool,
  initError: PropTypes.string,
  initPage: PropTypes.object,
  navigate: PropTypes.func.isRequired,
  onError: PropTypes.func,
  onNotFound: PropTypes.func,
  path: PropTypes.string.isRequired,
  setActivePage: PropTypes.func,
  setActivePathname: PropTypes.func,
  token: PropTypes.string,
}

export default Page
