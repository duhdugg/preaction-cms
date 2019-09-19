import axios from 'axios'
import React from 'react'
import NotFound from './NotFound.jsx'
import PageBlock from './PageBlock.jsx'
import { Checkbox } from '@preaction/inputs'
import './Page.css'

class Page extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      notFound: false,
      page: null,
      showSettings: false
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

  getPageSettingsValueHandler(key) {
    return value => {
      this.setState(state => {
        state.page.settings[key] = value
        if (key === 'showHeader') {
          this.props.headerControl(value)
        } else if (key === 'showFooter') {
          this.props.footerControl(value)
        }
        axios
          .put(`/api/page/${this.state.page.id}`, this.state.page)
          .then(() => {
            this.props.emitSave()
          })
        return state
      })
    }
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

  loadPage(pageKey) {
    this.setState(
      state => {
        state.loading = true
        state.notFound = false
        state.page = null
        return state
      },
      () => {
        axios
          .get(`/api/page/by-key/${pageKey}`)
          .then(response => {
            this.setState(
              state => {
                state.loading = false
                state.notFound = false
                state.page = response.data
                return state
              },
              () => {
                if (!['header', 'footer'].includes(pageKey)) {
                  let showHeader = this.state.page.settings.showHeader !== false
                  let showFooter = this.state.page.settings.showFooter !== false
                  this.props.headerControl(showHeader)
                  this.props.footerControl(showFooter)
                }
              }
            )
            if (pageKey !== 'header' && pageKey !== 'footer') {
              let title = ''
              if (pageKey === 'home') {
                title = this.props.siteSettings.siteTitle
              } else {
                title = `${response.data.title} | ${this.props.siteSettings.siteTitle}`
              }
              document.title = title
            }
          })
          .catch(e => {
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

  reload() {
    this.loadPage(this.props.pageKey)
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
                        siteSettings={this.props.siteSettings}
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
                <button
                  type='button'
                  className='btn btn-primary btn-sm'
                  onClick={() => {
                    this.addPageBlock('wysiwyg')
                  }}
                >
                  <i className='ion ion-logo-html5' />
                </button>
                <button
                  type='button'
                  className='btn btn-info btn-sm'
                  onClick={() => {
                    this.addPageBlock('image')
                  }}
                >
                  <i className='ion ion-md-image' />
                </button>
                <div>
                  {['header', 'footer'].includes(this.state.page.key) ? (
                    ''
                  ) : (
                    <button
                      type='button'
                      className='btn btn-info'
                      onClick={this.toggleSettings.bind(this)}
                    >
                      <i className='ion ion-md-cog' />
                    </button>
                  )}
                  {this.state.showSettings ? (
                    <div className='mt-2'>
                      <div className='col-sm-6 pl-0'>
                        <Checkbox
                          label='Show Header'
                          checked={
                            this.state.page.settings.showHeader !== false
                          }
                          valueHandler={this.getPageSettingsValueHandler(
                            'showHeader'
                          )}
                        />
                        <Checkbox
                          label='Show Footer'
                          checked={
                            this.state.page.settings.showFooter !== false
                          }
                          valueHandler={this.getPageSettingsValueHandler(
                            'showFooter'
                          )}
                        />
                      </div>
                    </div>
                  ) : (
                    <div />
                  )}
                </div>
                {this.state.page.userCreated ? (
                  <button
                    type='button'
                    className='btn btn-danger btn-sm'
                    onClick={this.deletePage.bind(this)}
                  >
                    <i className='ion ion-md-trash' />
                  </button>
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
    this.loadPage(this.props.pageKey)
  }

  shouldComponentUpdate(nextProps, nextState) {
    let retval = true
    if (nextProps.pageKey !== this.props.pageKey) {
      this.loadPage(nextProps.pageKey)
    }
    return retval
  }

  toggleSettings() {
    this.setState(state => {
      state.showSettings = !state.showSettings
      return state
    })
  }
}

export default Page