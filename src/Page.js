import axios from 'axios'
import React from 'react'
import NotFound from './NotFound.js'
import PageBlock from './PageBlock.js'
import './Page.css'

class Page extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      notFound: false,
      page: null
    }
  }

  addPageBlock (blockType) {
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
        this.props.socket.emit('save')
      })
  }

  blockControl (blockId, action) {
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
          this.props.socket.emit('save')
        })
        axios.put(`/api/page/blocks/${prevBlock.id}`, prevBlock).then(() => {
          this.props.socket.emit('save')
        })
        blocks[index] = block
        blocks[index - 1] = prevBlock
      } else if (action === 'next') {
        block.ordering++
        let nextBlock = blocks[index + 1]
        nextBlock.ordering--
        axios.put(`/api/page/blocks/${block.id}`, block).then(() => {
          this.props.socket.emit('save')
        })
        axios.put(`/api/page/blocks/${nextBlock.id}`, nextBlock).then(() => {
          this.props.socket.emit('save')
        })
        blocks[index] = block
        blocks[index + 1] = nextBlock
      } else if (action === 'delete') {
        if (window.confirm('Delete this block?')) {
          axios.delete(`/api/page/blocks/${blockId}`).then(() => {
            this.props.socket.emit('save')
          })
          let ordering = block.ordering
          blocks.splice(index, 1)
          for (let blk of blocks) {
            if (blk.ordering > ordering) {
              blk.ordering--
            }
          }
          state.page.pageblocks = blocks
        }
      } else if (action === 'refresh') {
        axios.get(`/api/page/blocks/${blockId}`).then(response => {
          this.setState(state => {
            let x = 0
            for (let block of state.page.pageblocks) {
              if (block.id === blockId) {
                break
              }
              x++
            }
            state.page.pageblocks[x] = response.data
            return state
          })
        })
      }
      return state
    })
  }

  deletePage () {
    if (this.props.deletePage) {
      if (
        window.confirm(
          `Are you sure you wish to delete the page, "${
            this.state.page.title
          }"?`
        )
      ) {
        this.props.deletePage(this.state.page)
      }
    }
  }

  getBlocks (blocks) {
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

  getImages (pageblockimages) {
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

  getPageBlockSettingsValueHandler (pageblockId, key) {
    return value => {
      this.setState(state => {
        for (let pageblock of this.state.page.pageblocks) {
          if (pageblock.id === pageblockId) {
            pageblock.settings[key] = value
            axios.put(`/api/page/blocks/${pageblockId}`, pageblock).then(() => {
              this.props.socket.emit('save')
            })
          }
        }
        return state
      })
    }
  }

  galleryControl (pageBlock, index, action) {
    // actions: previous, next, delete
    this.setState(state => {
      let images = this.getImages(pageBlock.pageblockimages)
      let image = images[index]
      if (action === 'previous') {
        image.ordering--
        let prevUpload = images[index - 1]
        prevUpload.ordering++
        axios.put(`/api/page/blocks/image/${image.id}`, image).then(() => {
          this.props.socket.emit('save')
        })
        axios
          .put(`/api/page/blocks/image/${prevUpload.id}`, prevUpload)
          .then(() => {
            this.props.socket.emit('save')
          })
        images[index] = image
        images[index - 1] = prevUpload
      } else if (action === 'next') {
        image.ordering++
        let nextUpload = images[index + 1]
        nextUpload.ordering--
        axios.put(`/api/page/blocks/image/${image.id}`, image).then(() => {
          this.props.socket.emit('save')
        })
        axios
          .put(`/api/page/blocks/image/${nextUpload.id}`, nextUpload)
          .then(() => {
            this.props.socket.emit('save')
          })
        images[index] = image
        images[index + 1] = nextUpload
      } else if (action === 'delete') {
        if (window.confirm('Delete this image?')) {
          axios.delete(`/api/page/blocks/image/${image.id}`).then(() => {
            this.props.socket.emit('save')
          })
          let x = pageBlock.pageblockimages.indexOf(image)
          let ordering = image.ordering
          pageBlock.pageblockimages.splice(x, 1)
          for (let image of images) {
            if (image.ordering > ordering) {
              image.ordering--
            }
          }
        }
      }
      for (let pb of state.page.pageblocks) {
        if (pb.id === pageBlock.id) {
          for (let x = 0; x < pb.pageblockimages.length; x++) {
            if (pb.pageblockimages[x].id === image.id) {
              pb.pageblockimages[x] = image
              break
            }
          }
        }
      }
      return state
    })
  }

  loadPage (pageKey) {
    this.setState(
      state => {
        state.notFound = false
        return state
      },
      () => {
        axios
          .get(`/api/page/by-key/${pageKey}`)
          .then(response => {
            this.setState(state => {
              state.page = response.data
              return state
            })
            if (pageKey !== 'header' && pageKey !== 'footer') {
              let title = ''
              if (pageKey === 'home') {
                title = this.props.siteSettings.siteTitle
              } else {
                title = `${response.data.title} | ${
                  this.props.siteSettings.siteTitle
                }`
              }
              document.title = title
            }
          })
          .catch(e => {
            if (e.response.status === 404) {
              this.setState(state => {
                state.notFound = true
                return state
              })
            }
          })
      }
    )
  }

  reload () {
    this.loadPage(this.props.pageKey)
  }

  render () {
    return (
      <div className="page">
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
                      siteSettings={this.props.siteSettings}
                      blockControl={this.blockControl.bind(this)}
                      getImages={this.getImages.bind(this)}
                      galleryControl={this.galleryControl.bind(this)}
                      getPageBlockSettingsValueHandler={this.getPageBlockSettingsValueHandler.bind(
                        this
                      )}
                      socket={this.props.socket}
                    />
                  )
                }
              )
              : ''}
            {this.props.editable ? (
              <div className="page-controls">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    this.addPageBlock('wysiwyg')
                  }}
                >
                  <i className="ion ion-logo-html5" />
                </button>
                <button
                  type="button"
                  className="btn btn-info btn-sm"
                  onClick={() => {
                    this.addPageBlock('image')
                  }}
                >
                  <i className="ion ion-md-image" />
                </button>
                {this.state.page.userCreated ? (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={this.deletePage.bind(this)}
                  >
                    <i className="ion ion-md-trash" />
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
        {this.state.notFound ? <NotFound /> : ''}
      </div>
    )
  }

  componentDidMount () {
    this.loadPage(this.props.pageKey)
  }

  shouldComponentUpdate (nextProps, nextState) {
    let retval = true
    if (nextProps.pageKey !== this.props.pageKey) {
      this.loadPage(nextProps.pageKey)
    }
    return retval
  }
}

export default Page
