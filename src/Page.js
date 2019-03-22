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

  deleteBlock (pageBlock) {
    axios.delete(`/api/page/blocks/${pageBlock.id}`).then(response => {
      if (response.status === 200) {
        this.setState(state => {
          let x = 0
          for (let pb of state.page.pageblocks) {
            if (pb.id === pageBlock.id) {
              break
            }
            x++
          }
          state.page.pageblocks.splice(x, 1)
          return state
        })
      }
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

  galleryControl (pageBlock, index, action) {
    // actions: previous, next, delete
    this.setState(state => {
      let images = this.getImages(pageBlock.pageblockimages)
      let image = images[index]
      if (action === 'previous') {
        image.ordering--
        let prevUpload = images[index - 1]
        prevUpload.ordering++
        axios.put(`/api/page/blocks/image/${image.id}`, image)
        axios.put(`/api/page/blocks/image/${prevUpload.id}`, prevUpload)
        images[index] = image
        images[index - 1] = prevUpload
      } else if (action === 'next') {
        image.ordering++
        let nextUpload = images[index + 1]
        nextUpload.ordering--
        axios.put(`/api/page/blocks/image/${image.id}`, image)
        axios.put(`/api/page/blocks/image/${nextUpload.id}`, nextUpload)
        images[index] = image
        images[index + 1] = nextUpload
      } else if (action === 'delete') {
        axios.delete(`/api/page/blocks/image/${image.id}`)
        let x = pageBlock.pageblockimages.indexOf(image)
        let ordering = image.ordering
        pageBlock.pageblockimages.splice(x, 1)
        for (let image of images) {
          if (image.ordering > ordering) {
            image.ordering--
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

  refreshBlock (pageblockId) {
    for (let pageblock of this.state.page.pageblocks) {
      if (pageblock.id === pageblockId) {
        axios.get(`/api/page/blocks/${pageblockId}`).then(response => {
          this.setState(state => {
            for (let x = 0; x < state.page.pageblocks.length; x++) {
              if (state.page.pageblocks[x].id === pageblockId) {
                state.page.pageblocks[x] = response.data
                break
              }
            }
            return state
          })
        })
        break
      }
    }
  }

  render () {
    return (
      <div className="page">
        {this.state.page ? (
          <div>
            {this.state.page.pageblocks
              ? this.state.page.pageblocks.map(block => {
                return (
                  <PageBlock
                    data={block}
                    key={block.id}
                    editable={this.props.editable}
                    siteSettings={this.props.siteSettings}
                    deleteBlock={this.deleteBlock.bind(this)}
                    refreshBlock={this.refreshBlock.bind(this)}
                    getImages={this.getImages.bind(this)}
                    galleryControl={this.galleryControl.bind(this)}
                  />
                )
              })
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
                  className="btn btn-primary btn-sm"
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
