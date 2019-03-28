import axios from 'axios'
import React from 'react'
import { Form, Wysiwyg } from 'preaction-inputs'
import wysiwygToolbar from './lib/wysiwygToolbar.js'

class PageBlockWysiwyg extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: true,
      wysiwyg: '',
      savingWysiwyg: false
    }
    this.wysiwyg = React.createRef()
    this.wysiwygUpdateTimer = null
  }

  handleWysiwyg (value) {
    if (!this.state.loading) {
      this.setState(
        state => {
          state.wysiwyg = value
          if (this.props.editable) {
            state.savingWysiwyg = true
          }
          return state
        },
        () => {
          clearTimeout(this.wysiwygUpdateTimer)
          this.wysiwygUpdateTimer = setTimeout(() => {
            if (this.props.editable) {
              axios
                .put(`/api/page/blocks/wysiwyg/${this.props.data.id}`, {
                  content: this.state.wysiwyg
                })
                .then(() => {
                  this.setState(state => {
                    state.savingWysiwyg = false
                    return state
                  })
                })
            }
          }, 1000)
        }
      )
    }
  }

  render () {
    return (
      <div className="page-block-wysiwyg">
        <Form
          onSubmit={e => {
            e.preventDefault()
          }}
        />
        <div
          style={{
            backgroundColor: this.props.siteSettings
              ? this.props.siteSettings.containerRgba.string
              : 'transparent',
            transition: 'background-color 1s linear',
            fontSize: '1em',
            borderRadius: '0.25rem'
          }}
        >
          <Wysiwyg
            theme="bubble"
            toolbar={wysiwygToolbar}
            value={this.state.wysiwyg}
            valueHandler={this.handleWysiwyg.bind(this)}
            readOnly={!this.props.editable}
            ref={this.wysiwyg}
          />
        </div>
        <div
          style={{
            position: 'relative',
            display: this.state.savingWysiwyg ? 'block' : 'none'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-1.25em',
              width: '100%',
              textAlign: 'right'
            }}
          >
            saving...
          </div>
        </div>
      </div>
    )
  }

  componentDidMount () {
    this.setState(
      state => {
        state.wysiwyg = this.props.data.content
        return state
      },
      () => {
        this.wysiwyg.current.value = this.props.data.content
      }
    )
    window.setTimeout(() => {
      this.setState(state => {
        state.loading = false
        return state
      })
    }, 0)
  }
}

export default PageBlockWysiwyg
