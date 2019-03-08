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

  addWysiwygBlock () {
    axios
      .post(`/api/page/${this.state.page.id}/blocks`, { blockType: 'wysiwyg' })
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

  deletePageBlock (pageBlock) {
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
                    deletePageBlock={this.deletePageBlock.bind(this)}
                  />
                )
              })
              : ''}
            {this.props.editable ? (
              <div className="page-controls">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={this.addWysiwygBlock.bind(this)}
                >
                  <i className="ion ion-logo-html5" /> Add Content
                </button>
                {this.state.page.userCreated ? (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={this.deletePage.bind(this)}
                  >
                    <i className="ion ion-md-trash" /> Delete Page
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
