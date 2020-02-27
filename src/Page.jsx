import axios from 'axios'
import PropTypes from 'prop-types'
import React from 'react'
import NotFound from './NotFound.jsx'
import PageBlock from './PageBlock.jsx'
import { Card, Modal, Nav } from '@preaction/bootstrap-clips'
import './Page.css'
import PageSettings from './PageSettings.jsx'

class Page extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      notFound: false,
      page: null,
      showSettings: false
    }
    this.settingsUpdateTimer = null
  }

  addPage() {
    let title = window.prompt('New Page Title')
    if (title) {
      let key = title.toLowerCase().replace(/[^A-z0-9]/gi, '-')
      let pageType = 'content'
      let page = {
        title,
        key,
        pageType,
        parentId: this.state.page.id
      }
      this.props.addPage(page)
    }
  }

  addPageBlock(blockType) {
    axios
      .post(`/api/page/${this.state.page.id}/blocks`, { blockType })
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
        axios.put(`/api/page/blocks/${block.id}`, block).then(() => {
          this.props.emitSave()
        })
        axios.put(`/api/page/blocks/${prevBlock.id}`, prevBlock).then(() => {
          this.props.emitSave()
        })
        blocks[index] = block
        blocks[index - 1] = prevBlock
      } else if (action === 'next') {
        block.ordering++
        let nextBlock = blocks[index + 1]
        nextBlock.ordering--
        axios.put(`/api/page/blocks/${block.id}`, block).then(() => {
          this.props.emitSave()
        })
        axios.put(`/api/page/blocks/${nextBlock.id}`, nextBlock).then(() => {
          this.props.emitSave()
        })
        blocks[index] = block
        blocks[index + 1] = nextBlock
      } else if (action === 'delete') {
        if (window.confirm('Delete this block?')) {
          axios.delete(`/api/page/blocks/${blockId}`).then(() => {
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
        axios.get(`/api/page/blocks/${blockId}`).then(response => {
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
    return this.state.page.appliedSettings
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

  getImages(pageblockimages) {
    return pageblockimages.concat().sort((a, b) => {
      let retval = 0
      if (a.ordering < b.ordering) {
        retval = -1
      } else if (a.ordering > b.ordering) {
        retval = 1
      }
      return retval
    })
  }

  getPageSettingIsUndefined(key) {
    return this.state.page.settings[key] === undefined
  }

  getPageBlockSettingsValueHandler(pageblockId, key) {
    return value => {
      this.setState(state => {
        this.state.page.pageblocks.forEach(pageblock => {
          if (pageblock.id === pageblockId) {
            pageblock.settings[key] = value
            axios.put(`/api/page/blocks/${pageblockId}`, pageblock).then(() => {
              this.props.emitSave()
            })
          }
        })
        return state
      })
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
          clearTimeout(this.settingsUpdateTimer)
          this.settingsUpdateTimer = setTimeout(() => {
            axios
              .put(`/api/page/${this.state.page.id}`, this.state.page)
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
          clearTimeout(this.settingsUpdateTimer)
          this.settingsUpdateTimer = setTimeout(() => {
            axios
              .put(`/api/page/${this.state.page.id}`, this.state.page)
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
        name: 'add block',
        icon: 'arrow-dropdown',
        subMenu: [
          {
            name: (
              <span>
                <i className='ion ion-md-image' /> image
              </span>
            ),
            onClick: e => {
              e.preventDefault()
              this.addPageBlock('image')
            }
          },
          {
            name: (
              <span>
                <i className='ion ion-logo-html5' /> wysiwyg
              </span>
            ),
            onClick: e => {
              e.preventDefault()
              this.addPageBlock('wysiwyg')
            }
          }
        ],
        onClick: e => {
          e.preventDefault()
        }
      }
    ]
    if (this.state.page.userCreated) {
      menu.push({
        name: 'add subpage',
        onClick: e => {
          e.preventDefault()
          this.addPage()
        }
      })
    }
    if (['header', 'footer'].indexOf(this.topLevelPageKey) < 0) {
      let subMenu = []
      if (this.topLevelPageKey !== 'home' && !this.state.page.parentId) {
        subMenu.push({
          name: 'Add SubPage',
          onClick: e => {
            e.preventDefault()
            this.addPage()
          }
        })
      }
      if (this.topLevelPageKey !== 'home') {
        subMenu.push({
          name: 'Reset Page Title',
          onClick: e => {
            e.preventDefault()
            this.renamePage()
          }
        })
      }
      subMenu.push({
        name: (
          <span>
            <i
              className={`ion ion-md-${
                this.state.page.settings.showHeader
                  ? 'checkbox-outline'
                  : 'square-outline'
              }`}
            />{' '}
            show header
          </span>
        ),
        onClick: e => {
          e.preventDefault()
          this.getPageSettingsValueHandler('showHeader')(
            !this.state.page.settings.showHeader
          )
        },
        toggleParent: false
      })
      subMenu.push({
        name: (
          <span>
            <i
              className={`ion ion-md-${
                this.state.page.settings.showFooter
                  ? 'checkbox-outline'
                  : 'square-outline'
              }`}
            />{' '}
            show footer
          </span>
        ),
        onClick: e => {
          e.preventDefault()
          this.getPageSettingsValueHandler('showFooter')(
            !this.state.page.settings.showFooter
          )
        },
        toggleParent: false
      })
      menu.push({
        name: 'page settings',
        onClick: this.toggleSettings.bind(this)
      })
    }
    return menu
  }

  galleryControl(pageBlock, index, action) {
    // actions: previous, next, delete
    this.setState(state => {
      let images = this.getImages(pageBlock.pageblockimages)
      let image = images[index]
      if (action === 'previous') {
        image.ordering--
        let prevUpload = images[index - 1]
        prevUpload.ordering++
        axios.put(`/api/page/blocks/image/${image.id}`, image).then(() => {
          this.props.emitSave()
        })
        axios
          .put(`/api/page/blocks/image/${prevUpload.id}`, prevUpload)
          .then(() => {
            this.props.emitSave()
          })
        images[index] = image
        images[index - 1] = prevUpload
      } else if (action === 'next') {
        image.ordering++
        let nextUpload = images[index + 1]
        nextUpload.ordering--
        axios.put(`/api/page/blocks/image/${image.id}`, image).then(() => {
          this.props.emitSave()
        })
        axios
          .put(`/api/page/blocks/image/${nextUpload.id}`, nextUpload)
          .then(() => {
            this.props.emitSave()
          })
        images[index] = image
        images[index + 1] = nextUpload
      } else if (action === 'delete') {
        if (window.confirm('Delete this image?')) {
          axios.delete(`/api/page/blocks/image/${image.id}`).then(() => {
            this.props.emitSave()
          })
          let x = pageBlock.pageblockimages.indexOf(image)
          let ordering = image.ordering
          pageBlock.pageblockimages.splice(x, 1)
          images.forEach(image => {
            if (image.ordering > ordering) {
              image.ordering--
            }
          })
        }
      }
      state.page.pageblocks.forEach(pb => {
        if (pb.id === pageBlock.id) {
          for (let x = 0; x < pb.pageblockimages.length; x++) {
            if (pb.pageblockimages[x].id === image.id) {
              pb.pageblockimages[x] = image
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
          .get(`/api/page/by-key/${path}`)
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
              }
            )
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
          })
          .catch(e => {
            console.error(e)
            if (e.response.status === 404) {
              this.setState(state => {
                state.loading = false
                state.notFound = true
                return state
              })
            }
          })
      }
    )
  }

  loadSettings() {
    if (!['header', 'footer'].includes(this.topLevelPageKey)) {
      let showHeader = this.settings.showHeader !== false
      let showFooter = this.settings.showFooter !== false
      this.props.headerControl(showHeader)
      this.props.footerControl(showFooter)
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
            .put(`/api/page/${this.state.page.id}`, this.state.page)
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

  toggleSettings(e) {
    e.preventDefault()
    this.setState(state => {
      state.showSettings = !state.showSettings
      return state
    })
  }

  render() {
    return (
      <div className='page'>
        {this.state.page ? (
          <div>
            {this.state.page.pageblocks
              ? this.getBlocks(this.state.page.pageblocks).map(
                  (block, index) => {
                    return (
                      <PageBlock
                        data={block}
                        key={block.id}
                        first={index === 0}
                        last={index === this.state.page.pageblocks.length - 1}
                        editable={this.props.editable}
                        emitSave={this.props.emitSave}
                        settings={this.settings}
                        blockControl={this.blockControl.bind(this)}
                        getImages={this.getImages.bind(this)}
                        galleryControl={this.galleryControl.bind(this)}
                        getPageBlockSettingsValueHandler={this.getPageBlockSettingsValueHandler.bind(
                          this
                        )}
                      />
                    )
                  }
                )
              : ''}
            {this.props.editable ? (
              <div className='page-controls'>
                <Nav type='tabs' menu={this.pageControlsMenu} />
                {this.state.page.userCreated ? (
                  <button
                    type='button'
                    className='btn btn-danger btn-sm'
                    onClick={this.deletePage.bind(this)}
                  >
                    <i className='ion ion-md-trash' /> Delete Page
                  </button>
                ) : (
                  ''
                )}
                {this.state.showSettings ? (
                  <Modal>
                    <Card
                      header='Page Settings'
                      footer={
                        <div className='btn-group'>
                          <button
                            className='btn btn-dark'
                            onClick={this.toggleSettings.bind(this)}
                          >
                            Close
                          </button>
                        </div>
                      }
                      noMargin={true}
                    >
                      <PageSettings
                        authenticated={this.props.editable}
                        emitReload={() => {}}
                        settings={this.settings}
                        getResetter={this.getPageSettingsResetter.bind(this)}
                        getSettingsValueHandler={this.getPageSettingsValueHandler.bind(
                          this
                        )}
                        getPageSettingIsUndefined={this.getPageSettingIsUndefined.bind(
                          this
                        )}
                      />
                    </Card>
                  </Modal>
                ) : (
                  ''
                )}
              </div>
            ) : (
              ''
            )}
          </div>
        ) : (
          ''
        )}
        {this.state.loading ? (
          <div className='container'>
            <span style={{ fontSize: '4rem' }}>
              <i className='ion ion-md-hourglass spinner' />
            </span>
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
  deletePage: PropTypes.func,
  editable: PropTypes.bool,
  emitSave: PropTypes.func.isRequired,
  footerControl: PropTypes.func,
  headerControl: PropTypes.func,
  path: PropTypes.string.isRequired,
  setActivePage: PropTypes.func
}

export default Page
