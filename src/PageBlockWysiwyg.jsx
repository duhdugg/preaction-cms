import axios from 'axios'
import PropTypes from 'prop-types'
import React from 'react'
import { Form, Wysiwyg } from '@preaction/inputs'
import wysiwygToolbar from './lib/wysiwygToolbar.js'

class PageBlockWysiwyg extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      wysiwyg: '',
      savingWysiwyg: false
    }
    this.content = React.createRef()
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
                .put(`/api/page/blocks/content/${this.props.content.id}`, {
                  wysiwyg: this.state.wysiwyg
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
      <div className='page-block-content'>
        <Form
          onSubmit={e => {
            e.preventDefault()
          }}
        />
        <Wysiwyg
          theme={this.props.editable ? 'snow' : 'bubble'}
          toolbar={wysiwygToolbar}
          value={this.state.wysiwyg}
          valueHandler={this.handleWysiwyg.bind(this)}
          readOnly={!this.props.editable}
          ref={this.content}
        />
        <div
          style={{
            position: 'relative',
            display: this.state.savingWysiwyg ? 'block' : 'none'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-0.5em',
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
        state.wysiwyg = this.props.content.wysiwyg
        return state
      },
      () => {
        this.content.current.value = this.props.content.wysiwyg
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
    if (this.props.content.wysiwyg !== prevProps.content.wysiwyg) {
      if (!this.props.editable) {
        this.setState(
          state => {
            state.wysiwyg = this.props.content.wysiwyg
            return state
          },
          () => {
            this.content.current.value = this.props.content.wysiwyg
          }
        )
      }
    }
  }
}

PageBlockWysiwyg.propTypes = {
  block: PropTypes.object.isRequired,
  content: PropTypes.object.isRequired,
  emitSave: PropTypes.func.isRequired,
  editable: PropTypes.bool
}

export default PageBlockWysiwyg
