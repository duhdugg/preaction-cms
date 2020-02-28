import axios from 'axios'
import PropTypes from 'prop-types'
import React from 'react'
import { Checkbox, Form, Input, Wysiwyg } from '@preaction/inputs'
import { Card, Modal } from '@preaction/bootstrap-clips'
import { getRgbaFromSettings } from './lib/getRgba.js'
import wysiwygToolbar from './lib/wysiwygToolbar.js'
import { MdSettings } from 'react-icons/md'

class PageBlockWysiwyg extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      wysiwyg: '',
      showSettings: false,
      savingWysiwyg: false
    }
    this.wysiwyg = React.createRef()
    this.wysiwygUpdateTimer = null
  }

  getPageBlockSettingsValueHandler(key) {
    return this.props.getPageBlockSettingsValueHandler(this.props.data.id, key)
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
                .put(
                  `/api/page/blocks/wysiwyg/${this.props.data.pageblockwysiwyg.id}`,
                  {
                    content: this.state.wysiwyg
                  }
                )
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

  toggleSettings() {
    this.setState(state => {
      state.showSettings = !state.showSettings
      return state
    })
  }

  render() {
    return (
      <div className='page-block-wysiwyg'>
        <Form
          onSubmit={e => {
            e.preventDefault()
          }}
        />
        <Card
          style={{
            card: {
              backgroundColor: getRgbaFromSettings(
                this.props.settings,
                'container'
              ).string,
              border: `1px solid ${
                getRgbaFromSettings(this.props.settings, 'border').string
              }`
            },
            body: {
              padding: this.props.settings.containerPadding
                ? `${this.props.settings.containerPadding}em`
                : 0
            }
          }}
          header={this.props.data.settings.header}
          headerTheme={this.props.settings.containerHeaderTheme}
          footerTheme={this.props.settings.containerHeaderTheme}
        >
          <Wysiwyg
            theme='bubble'
            toolbar={wysiwygToolbar}
            value={this.state.wysiwyg}
            valueHandler={this.handleWysiwyg.bind(this)}
            readOnly={!this.props.editable}
            ref={this.wysiwyg}
          />
        </Card>
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
        {this.props.editable ? (
          <div>
            <button
              type='button'
              className='btn btn-secondary btn-sm'
              onClick={this.toggleSettings.bind(this)}
            >
              <MdSettings /> Content Block Settings
            </button>
            {this.state.showSettings ? (
              <Modal
                closeHandler={this.toggleSettings.bind(this)}
                title='Content Block Settings'
              >
                <Form
                  onSubmit={e => {
                    e.preventDefault()
                  }}
                >
                  <Input
                    type='text'
                    label='Header (optional)'
                    value={this.props.data.settings.header}
                    valueHandler={this.getPageBlockSettingsValueHandler(
                      'header'
                    )}
                  />
                </Form>
              </Modal>
            ) : (
              ''
            )}
          </div>
        ) : (
          ''
        )}
      </div>
    )
  }

  componentDidMount() {
    this.setState(
      state => {
        state.wysiwyg = this.props.data.pageblockwysiwyg.content
        return state
      },
      () => {
        this.wysiwyg.current.value = this.props.data.pageblockwysiwyg.content
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
    if (
      this.props.data.pageblockwysiwyg.content !==
      prevProps.data.pageblockwysiwyg.content
    ) {
      if (!this.props.editable) {
        this.setState(
          state => {
            state.wysiwyg = this.props.data.pageblockwysiwyg.content
            return state
          },
          () => {
            this.wysiwyg.current.value = this.props.data.pageblockwysiwyg.content
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
  getPageBlockSettingsValueHandler: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired
}

export default PageBlockWysiwyg
