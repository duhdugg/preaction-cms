import axios from 'axios'
import PropTypes from 'prop-types'
import React from 'react'
import { Form, Wysiwyg } from '@preaction/inputs'
import { getRgbaFromSettings } from './lib/getRgba.js'
import wysiwygToolbar from './lib/wysiwygToolbar.js'

class PageBlockWysiwyg extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      wysiwyg: '',
      savingWysiwyg: false
    }
    this.wysiwyg = React.createRef()
    this.wysiwygUpdateTimer = null
  }

  handleWysiwyg(value) {
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
                  this.props.emitSave()
                })
            }
          }, 1000)
        }
      )
    }
  }

  render() {
    return (
      <div className='page-block-wysiwyg'>
        <Form
          onSubmit={e => {
            e.preventDefault()
          }}
        />
        <div
          style={{
            backgroundColor: this.props.settings
              ? getRgbaFromSettings(this.props.settings, 'container').string
              : 'transparent',
            transition: 'background-color 1s linear, border-color 1s linear',
            fontSize: '1em',
            border: this.props.settings
              ? `1px solid ${
                  getRgbaFromSettings(this.props.settings, 'border').string
                }`
              : '0px solid transparent',
            borderRadius: '0.25rem'
          }}
        >
          <Wysiwyg
            theme='bubble'
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

  componentDidMount() {
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

  componentDidUpdate(prevProps) {
    if (this.props.data.content !== prevProps.data.content) {
      if (!this.props.editable) {
        this.setState(
          state => {
            state.wysiwyg = this.props.data.content
            return state
          },
          () => {
            this.wysiwyg.current.value = this.props.data.content
          }
        )
      }
    }
  }
}

PageBlockWysiwyg.propTypes = {
  data: PropTypes.object.isRequired,
  emitSave: PropTypes.func.isRequired,
  editable: PropTypes.bool,
  settings: PropTypes.object.isRequired
}

export default PageBlockWysiwyg
