import axios from 'axios'
import PropTypes from 'prop-types'
import React from 'react'
import NotFound from './NotFound.jsx'
import PageBlock from './PageBlock.jsx'
import { Modal, Nav, Spinner } from '@preaction/bootstrap-clips'
import './Page.css'
import PageSettings from './PageSettings.jsx'
import { MdCreate } from 'react-icons/md'
import { FaHtml5, FaSitemap } from 'react-icons/fa'

class Page extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      notFound: false,
      page: null,
      showSettings: false
    }
    this.updateTimer = null
  }

  addContent(block, contentType) {
    axios
      .post(`${this.props.appRoot}/api/page/blocks/${block.id}/content`, {
        contentType
      })
      .then(response => {
        this.setState(state => {
          state.page.pageblocks.forEach(pageblock => {
            if (block.id === pageblock.id) {
              if (!block.pageblockcontents) {
                block.pageblockcontents = []
              }
              block.pageblockcontents.push(response.data)
            }
          })
          return state
        })
        this.props.emitSave()
      })
  }

  addPageBlock(blockType) {
    axios
      .post(`${this.props.appRoot}/api/page/${this.state.page.id}/blocks`, {
        blockType
      })
      .then(response => {
        this.setState(state => {
          if (!state.page.pageblocks) {
            state.page.pageblocks = []
          }
          state.page.pageblocks.push(response.data)
          return state
        })
        this.props.emitSave()
      })
  }

  blockControl(blockId, action) {
    // actions: previous, next, delete, refresh
    this.setState(state => {
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
          .put(`${this.props.appRoot}/api/page/blocks/${block.id}`, block)
          .then(() => {
            this.props.emitSave()
          })
        axios
          .put(
            `${this.props.appRoot}/api/page/blocks/${prevBlock.id}`,
            prevBlock
          )
          .then(() => {
            this.props.emitSave()
          })
        blocks[index] = block
        blocks[index - 1] = prevBlock
      } else if (action === 'next') {
        block.ordering++
        let nextBlock = blocks[index + 1]
        nextBlock.ordering--
        axios
          .put(`${this.props.appRoot}/api/page/blocks/${block.id}`, block)
          .then(() => {
            this.props.emitSave()
          })
        axios
          .put(
            `${this.props.appRoot}/api/page/blocks/${nextBlock.id}`,
            nextBlock
          )
          .then(() => {
            this.props.emitSave()
          })
        blocks[index] = block
        blocks[index + 1] = nextBlock
      } else if (action === 'delete') {
        if (window.confirm('Delete this block?')) {
          axios
            .delete(`${this.props.appRoot}/api/page/blocks/${blockId}`)
            .then(() => {
              this.props.emitSave()
            })
          let ordering = block.ordering
          blocks.splice(index, 1)
          blocks.forEach(blk => {
            if (blk.ordering > ordering) {
              blk.ordering--
            }
          })
          state.page.pageblocks = blocks
        }
      } else if (action === 'refresh') {
        axios
          .get(`${this.props.appRoot}/api/page/blocks/${blockId}`)
          .then(response => {
            this.setState(state => {
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
        window.confirm(
          `Are you sure you wish to delete the page, "${this.state.page.title}"?`
        )
      ) {
        this.props.deletePage(this.state.page)
        this.setState(state => {
          state.showSettings = false
          return state
        })
      }
    }
  }

  get newPage() {
    let title = this.state.newPageTitle
    let key = title.toLowerCase().replace(/[^A-z0-9]/gi, '-')
    let pageType = 'content'
    return {
      key,
      title,
      pageType
    }
  }

  get splitPath() {
    let path = []
    this.props.path.split('/').forEach(dir => {
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
    return value => {
      this.setState(
        state => {
          this.state.page.pageblocks.forEach(pageblock => {
            if (pageblock.id === pageblockId) {
              pageblock.pageblockcontents.forEach(content => {
                if (content.id === contentId) {
                  if (
                    ['smWidth', 'mdWidth', 'lgWidth', 'xsWidth'].indexOf(key) >=
                    0
                  ) {
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
          this.state.page.pageblocks.forEach(pageblock => {
            if (pageblock.id === pageblockId) {
              pageblock.pageblockcontents.forEach(content => {
                if (content.id === contentId) {
                  clearTimeout(this.updateTimer)
                  this.updateTimer = setTimeout(() => {
                    axios
                      .put(
                        `${this.props.appRoot}/api/page/blocks/content/${contentId}`,
                        content
                      )
                      .then(() => {
                        this.props.emitSave()
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
    return value => {
      this.setState(
        state => {
          this.state.page.pageblocks.forEach(pageblock => {
            if (pageblock.id === pageblockId) {
              if (
                ['smWidth', 'mdWidth', 'lgWidth', 'xsWidth'].indexOf(key) >= 0
              ) {
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
          this.state.page.pageblocks.forEach(pageblock => {
            if (pageblock.id === pageblockId) {
              clearTimeout(this.updateTimer)
              this.updateTimer = setTimeout(() => {
                axios
                  .put(
                    `${this.props.appRoot}/api/page/blocks/${pageblockId}`,
                    pageblock
                  )
                  .then(() => {
                    this.props.emitSave()
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
        state => {
          delete state.page.settings[key]
          return state
        },
        () => {
          clearTimeout(this.updateTimer)
          this.updateTimer = setTimeout(() => {
            axios
              .put(
                `${this.props.appRoot}/api/page/${this.state.page.id}`,
                this.state.page
              )
              .then(() => {
                this.loadSettings()
                this.props.emitSave()
              })
          }, 1000)
        }
      )
    }
  }

  getPageSettingsValueHandler(key) {
    return value => {
      this.setState(
        state => {
          state.page.settings[key] = value
          if (key === 'showHeader') {
            this.props.headerControl(value)
          } else if (key === 'showFooter') {
            this.props.footerControl(value)
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
                `${this.props.appRoot}/api/page/${this.state.page.id}`,
                this.state.page
              )
              .then(() => {
                this.props.emitSave()
              })
          }, 1000)
        }
      )
    }
  }

  getPageValueHandler(key) {
    return value => {
      this.setState(
        state => {
          state.page[key] = value
          if (key === 'title') {
            let k = value.toLowerCase().replace(/[^A-z0-9]/gi, '-')
            if (k.replace(/-/gi, '')) {
              state.page.key = k
            }
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
                `${this.props.appRoot}/api/page/${this.state.page.id}`,
                this.state.page
              )
              .then(() => {
                this.props.emitSave()
              })
          }, 1000)
        }
      )
    }
  }

  get pageControlsMenu() {
    let menu = [
      {
        name: (
          <span>
            <MdCreate /> add block
          </span>
        ),
        icon: 'arrow-dropdown',
        subMenu: [
          {
            name: (
              <span>
                <FaHtml5 /> Content
              </span>
            ),
            onClick: e => {
              e.preventDefault()
              this.addPageBlock('content')
            }
          },
          {
            name: (
              <span>
                <FaSitemap /> Navigation
              </span>
            ),
            onClick: e => {
              e.preventDefault()
              this.addPageBlock('nav')
            }
          }
        ],
        onClick: e => {
          e.preventDefault()
        }
      }
    ]
    return menu
  }

  contentControl(pageBlock, index, action) {
    // actions: previous, next, delete
    this.setState(state => {
      let contents = this.getContents(pageBlock.pageblockcontents)
      let content = contents[index]
      if (action === 'previous') {
        content.ordering--
        let prevUpload = contents[index - 1]
        prevUpload.ordering++
        axios
          .put(
            `${this.props.appRoot}/api/page/blocks/content/${content.id}`,
            content
          )
          .then(() => {
            this.props.emitSave()
          })
        axios
          .put(
            `${this.props.appRoot}/api/page/blocks/content/${prevUpload.id}`,
            prevUpload
          )
          .then(() => {
            this.props.emitSave()
          })
        contents[index] = content
        contents[index - 1] = prevUpload
      } else if (action === 'next') {
        content.ordering++
        let nextContent = contents[index + 1]
        nextContent.ordering--
        axios
          .put(
            `${this.props.appRoot}/api/page/blocks/content/${content.id}`,
            content
          )
          .then(() => {
            this.props.emitSave()
          })
        axios
          .put(
            `${this.props.appRoot}/api/page/blocks/content/${nextContent.id}`,
            nextContent
          )
          .then(() => {
            this.props.emitSave()
          })
        contents[index] = content
        contents[index + 1] = nextContent
      } else if (action === 'delete') {
        if (window.confirm('Delete this content?')) {
          axios
            .delete(
              `${this.props.appRoot}/api/page/blocks/content/${content.id}`
            )
            .then(() => {
              this.props.emitSave()
            })
          let x = pageBlock.pageblockcontents.indexOf(content)
          let ordering = content.ordering
          pageBlock.pageblockcontents.splice(x, 1)
          contents.forEach(content => {
            if (content.ordering > ordering) {
              content.ordering--
            }
          })
        }
      }
      state.page.pageblocks.forEach(pb => {
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
    path = path.replace(/^\//, '')
    this.setState(
      state => {
        state.loading = true
        state.notFound = false
        state.page = null
        return state
      },
      () => {
        axios
          .get(`${this.props.appRoot}/api/page/by-key/${path}`)
          .then(response => {
            let page = response.data
            this.setState(
              state => {
                state.loading = false
                state.notFound = false
                state.page = page
                return state
              },
              () => {
                this.loadSettings()
                if (this.props.setActivePage) {
                  this.props.setActivePage(this.state.page)
                }
                if (this.props.setActivePathname) {
                  this.props.setActivePathname(this.props.path)
                }
                if (
                  this.topLevelPageKey !== 'header' &&
                  this.topLevelPageKey !== 'footer'
                ) {
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
          .catch(e => {
            console.error(e)
            if (e.response.status === 404) {
              this.setState(state => {
                state.loading = false
                state.notFound = true
                return state
              })
              this.onNotFound()
            }
          })
      }
    )
  }

  loadSettings() {
    if (!['header', 'footer'].includes(this.state.page.key)) {
      let showHeader = this.settings.showHeader !== false
      let showFooter = this.settings.showFooter !== false
      this.props.headerControl(showHeader)
      this.props.footerControl(showFooter)
    }
  }

  onNotFound() {
    if (this.props.onNotFound) {
      this.props.onNotFound(this.props.path)
    }
  }

  reload() {
    this.loadPage(this.props.path)
  }

  renamePage() {
    let oldTitle = this.state.page.title
    let title = window.prompt(`New Page Title for ${this.state.page.title}`)
    if (title) {
      let key = title.toLowerCase().replace(/[^A-z0-9]/gi, '-')
      this.setState(
        state => {
          state.page.title = title
          state.page.key = key
        },
        () => {
          axios
            .put(
              `${this.props.appRoot}/api/page/${this.state.page.id}`,
              this.state.page
            )
            .then(() => {
              if (title !== oldTitle) {
                this.props.emitSave()
                if (this.state.page.parentId) {
                  window.location.href = `/${this.topLevelPageKey}/${key}/`
                } else {
                  window.location.href = `/${key}/`
                }
              }
            })
        }
      )
    }
  }

  toggleSettings() {
    this.setState(state => {
      state.showSettings = !state.showSettings
      return state
    })
  }

  render() {
    return (
      <div className='page'>
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
              <Modal
                title='Page Settings'
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
                <PageSettings
                  appRoot={this.props.appRoot}
                  authenticated={this.props.editable}
                  pageId={this.state.page.id}
                  page={this.state.page}
                  path={this.props.path}
                  settings={this.settings}
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
            ) : (
              ''
            )}
          </div>
        ) : (
          ''
        )}
        {this.state.loading ? (
          <div className='container'>
            <Spinner size='3.25' />
          </div>
        ) : (
          ''
        )}
        {this.state.notFound ? <NotFound /> : ''}
      </div>
    )
  }

  componentDidMount() {
    this.loadPage(this.props.path)
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
  addPage: PropTypes.func,
  appRoot: PropTypes.string.isRequired,
  deletePage: PropTypes.func,
  editable: PropTypes.bool,
  emitSave: PropTypes.func.isRequired,
  fallbackSettings: PropTypes.object,
  footerControl: PropTypes.func,
  headerControl: PropTypes.func,
  navigate: PropTypes.func,
  onNotFound: PropTypes.func,
  path: PropTypes.string.isRequired,
  setActivePage: PropTypes.func,
  setActivePathname: PropTypes.func
}

export default Page
