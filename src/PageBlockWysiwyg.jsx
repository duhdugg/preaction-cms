import axios from 'axios'
import PropTypes from 'prop-types'
import React from 'react'
import { Spinner } from '@preaction/bootstrap-clips'
import { Form, Textarea, Wysiwyg } from '@preaction/inputs'
import env from './lib/env.js'
import wysiwygToolbar from './lib/wysiwygToolbar.js'
import globalthis from 'globalthis'

const globalThis = globalthis()

class PageBlockWysiwyg extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      wysiwyg: this.props.content.wysiwyg || '',
      savingWysiwyg: false,
    }
    this.wysiwyg = React.createRef()
    this.wysiwygUpdateTimer = null
  }

  dirtyEnough(pval, nval) {
    // quill will make some iconsequential formatting adjustments to html,
    // which causes the PUT request to fire unnecessarily.
    // workaround this by assuming some replacements made and comparing length
    pval = pval.replace(/<br \/>/g, '<br>')
    return pval.length !== nval.length
  }

  handleWysiwyg(value) {
    if (this.dirtyEnough(this.state.wysiwyg, value)) {
      this.setState(
        (state) => {
          state.wysiwyg = value
          if (this.props.editable) {
            state.savingWysiwyg = true
          }
          return state
        },
        () => {
          clearTimeout(this.wysiwygUpdateTimer)
          this.wysiwygUpdateTimer = globalThis.setTimeout(() => {
            if (this.props.editable) {
              axios
                .put(
                  `${this.props.appRoot}/api/page/blocks/content/${this.props.content.id}?token=${this.props.token}`,
                  {
                    wysiwyg: this.state.wysiwyg,
                  }
                )
                .then(() => {
                  this.setState((state) => {
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

  get theme() {
    return this.props.editable ? this.props.theme : 'bubble'
  }

  render() {
    return (
      <div className='page-block-content-type-wysiwyg'>
        <Form
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          {this.props.editable && this.props.sourceMode ? (
            <Textarea
              value={this.state.wysiwyg}
              valueHandler={this.handleWysiwyg.bind(this)}
              readOnly={!this.props.editable}
            />
          ) : (
            <Wysiwyg
              // allowDangerousFallback as the value was sanitized by server,
              // but the error message is preferred if component fails when editing
              allowDangerousFallback={
                !this.props.editable || env.NODE_ENV === 'test'
              }
              fallbackMode={!this.props.editable || env.NODE_ENV === 'test'}
              loadableFallback={<Spinner />}
              theme={this.theme}
              toolbar={wysiwygToolbar}
              value={this.state.wysiwyg}
              valueHandler={this.handleWysiwyg.bind(this)}
              readOnly={!this.props.editable}
              ref={this.wysiwyg}
            />
          )}
          {this.state.savingWysiwyg ? (
            <div
              style={{
                position: 'relative',
              }}
            >
              <div
                style={{
                  fontSize: '0.8em',
                  fontStyle: 'italic',
                  position: 'absolute',
                  top: '-1.25em',
                  width: '100%',
                  textAlign: 'right',
                }}
              >
                saving...
              </div>
            </div>
          ) : (
            ''
          )}
        </Form>
      </div>
    )
  }

  componentDidMount() {
    this.setState({ wysiwyg: this.props.content.wysiwyg })
  }

  componentDidUpdate(prevProps) {
    if (this.props.content.wysiwyg !== prevProps.content.wysiwyg) {
      if (!this.props.editable) {
        this.setState({ wysiwyg: this.props.content.wysiwyg })
      }
    }
  }
}

PageBlockWysiwyg.propTypes = {
  appRoot: PropTypes.string.isRequired,
  block: PropTypes.object.isRequired,
  content: PropTypes.object.isRequired,
  emitSave: PropTypes.func.isRequired,
  editable: PropTypes.bool,
  sourceMode: PropTypes.bool,
  theme: PropTypes.string.isRequired,
  token: PropTypes.string,
}

export default PageBlockWysiwyg
