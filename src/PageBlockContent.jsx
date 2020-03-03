import PropTypes from 'prop-types'
import React from 'react'
import { Card, Modal } from '@preaction/bootstrap-clips'
import { Form, Checkbox, Input } from '@preaction/inputs'
import PageBlockImage from './PageBlockImage.jsx'
import PageBlockWysiwyg from './PageBlockWysiwyg.jsx'
import { getRgbaFromSettings } from './lib/getRgba.js'
import {
  MdArrowBack,
  MdArrowForward,
  MdDelete,
  MdLineStyle,
  MdSettings
} from 'react-icons/md'
import { FaHtml5 } from 'react-icons/fa'

class PageBlockContent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showSettings: false,
      sourceMode: false,
      theme: 'bubble'
    }
  }

  toggleSettings() {
    this.setState(state => {
      state.showSettings = !state.showSettings
      return state
    })
  }

  toggleSourceMode() {
    this.setState(state => {
      state.sourceMode = !state.sourceMode
      return state
    })
  }

  toggleTheme() {
    this.setState(state => {
      state.theme = state.theme === 'bubble' ? 'snow' : 'bubble'
      return state
    })
  }

  render() {
    return (
      <Card
        noMargin
        column={this.props.column}
        header={this.props.content.settings.header}
        headerTheme={this.props.settings.containerHeaderTheme}
        footerTheme={this.props.settings.containerHeaderTheme}
        footer={
          this.props.editable ? (
            <div className='btn-group d-block'>
              <button
                type='button'
                className='btn btn-sm btn-secondary'
                disabled={this.props.first}
                onClick={() => {
                  this.props.contentControl(
                    this.props.block,
                    this.props.index,
                    'previous'
                  )
                }}
              >
                <MdArrowBack />
              </button>
              <button
                type='button'
                disabled={this.props.last}
                className='btn btn-sm btn-secondary'
                onClick={() => {
                  this.props.contentControl(
                    this.props.block,
                    this.props.index,
                    'next'
                  )
                }}
              >
                <MdArrowForward />
              </button>
              <button
                type='button'
                disabled={this.props.first && this.props.last}
                className='btn btn-sm btn-danger'
                onClick={() => {
                  this.props.contentControl(
                    this.props.block,
                    this.props.index,
                    'delete'
                  )
                }}
              >
                <MdDelete />
              </button>
              <button
                type='button'
                className='btn btn-sm btn-secondary'
                onClick={this.toggleSettings.bind(this)}
              >
                <MdSettings />
              </button>
              {this.props.content.contentType === 'wysiwyg' ? (
                <button
                  type='button'
                  className='btn btn-sm btn-secondary'
                  onClick={this.toggleSourceMode.bind(this)}
                >
                  <FaHtml5 />
                </button>
              ) : (
                ''
              )}
              {this.props.content.contentType === 'wysiwyg' &&
              !this.state.sourceMode ? (
                <button
                  type='button'
                  className='btn btn-sm btn-secondary'
                  onClick={this.toggleTheme.bind(this)}
                >
                  <MdLineStyle />
                </button>
              ) : (
                ''
              )}
            </div>
          ) : (
            ''
          )
        }
        width={this.props.width}
        style={{
          card: {
            backgroundColor: this.props.content.settings.showContainer
              ? getRgbaFromSettings(this.props.settings, 'container').string
              : 'transparent',
            border: this.props.content.settings.showBorder
              ? `1px solid ${
                  getRgbaFromSettings(this.props.settings, 'border').string
                }`
              : 0
          },
          body: {
            padding: this.props.content.settings.padding
              ? `${this.props.content.settings.padding}em`
              : 0
          },
          footer: {
            padding: 0
          }
        }}
      >
        {this.props.content.contentType === 'wysiwyg' ? (
          <PageBlockWysiwyg
            block={this.props.block}
            content={this.props.content}
            editable={this.props.editable}
            emitSave={this.props.emitSave}
            sourceMode={this.state.sourceMode}
            theme={this.state.theme}
          />
        ) : (
          ''
        )}
        {this.props.content.contentType === 'image' ? (
          <PageBlockImage
            block={this.props.block}
            content={this.props.content}
            editable={this.props.editable}
            emitSave={this.props.emitSave}
          />
        ) : (
          ''
        )}
        {this.state.showSettings ? (
          <Modal
            title={`Content Type ${this.props.content.contentType} Settings`}
            closeHandler={this.toggleSettings.bind(this)}
          >
            <Form
              onSubmit={e => {
                e.prevenDefault()
              }}
            >
              <Input
                type='text'
                label='Header'
                value={this.props.content.settings.header}
                valueHandler={this.props.getContentSettingsValueHandler(
                  'header'
                )}
              />
              <Input
                label={`Desktop Width: ${this.props.content.settings.lgWidth} / 12`}
                type='range'
                min='0'
                max='12'
                step='1'
                value={this.props.content.settings.lgWidth}
                valueHandler={this.props.getContentSettingsValueHandler(
                  'lgWidth'
                )}
              />
              <Input
                label={`Tablet Width: ${this.props.content.settings.mdWidth} / 12`}
                type='range'
                min='0'
                max='12'
                step='1'
                value={this.props.content.settings.mdWidth}
                valueHandler={this.props.getContentSettingsValueHandler(
                  'mdWidth'
                )}
              />
              <Input
                label={`Phone Width (Landscape): ${this.props.content.settings.smWidth} / 12`}
                type='range'
                min='0'
                max='12'
                step='1'
                value={this.props.content.settings.smWidth}
                valueHandler={this.props.getContentSettingsValueHandler(
                  'smWidth'
                )}
              />
              <Input
                label={`Phone Width (Portrait): ${this.props.content.settings.xsWidth} / 12`}
                type='range'
                min='0'
                max='12'
                step='1'
                value={this.props.content.settings.xsWidth}
                valueHandler={this.props.getContentSettingsValueHandler(
                  'xsWidth'
                )}
              />
              <Input
                label={`Padding: ${
                  this.props.content.settings.padding
                    ? Number(this.props.content.settings.padding).toFixed(2)
                    : '0.00'
                }`}
                type='range'
                min='0'
                max='3'
                step='0.05'
                value={this.props.content.settings.padding || 0}
                valueHandler={this.props.getContentSettingsValueHandler(
                  'padding'
                )}
              />
              <Checkbox
                label='Show Container Background'
                checked={this.props.content.settings.showContainer}
                valueHandler={this.props.getContentSettingsValueHandler(
                  'showContainer'
                )}
              />
              <Checkbox
                label='Show Container Border'
                checked={this.props.content.settings.showBorder}
                valueHandler={this.props.getContentSettingsValueHandler(
                  'showBorder'
                )}
              />
            </Form>
          </Modal>
        ) : (
          ''
        )}
      </Card>
    )
  }
}

PageBlockContent.propTypes = {
  block: PropTypes.object.isRequired,
  column: PropTypes.bool,
  content: PropTypes.object.isRequired,
  contentControl: PropTypes.func.isRequired,
  emitSave: PropTypes.func.isRequired,
  editable: PropTypes.bool,
  first: PropTypes.bool,
  getContentSettingsValueHandler: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  last: PropTypes.bool,
  settings: PropTypes.object.isRequired,
  width: PropTypes.any
}

export default PageBlockContent
