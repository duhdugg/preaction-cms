import PropTypes from 'prop-types'
import React from 'react'
import { Card, Modal } from '@preaction/bootstrap-clips'
import { Form, Input } from '@preaction/inputs'
import PageBlockImage from './PageBlockImage.jsx'
import PageBlockWysiwyg from './PageBlockWysiwyg.jsx'
import { getRgbaFromSettings } from './lib/getRgba.js'
import { MdArrowBack, MdArrowForward, MdSettings } from 'react-icons/md'

class PageBlockContent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showSettings: false
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
      <Card
        column={this.props.column}
        header={this.props.content.settings.header}
        footerTheme='dark'
        footer={
          this.props.editable ? (
            <div className='btn-group'>
              <button
                type='button'
                className='btn btn-sm btn-secondary'
                onClick={this.toggleSettings.bind(this)}
              >
                <MdSettings />
              </button>
              <button
                type='button'
                className='btn btn-sm btn-secondary'
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
            </div>
          ) : (
            ''
          )
        }
        width={this.props.width}
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
            title='Content Type Settings'
            closeHandler={this.toggleSettings.bind(this)}
          >
            <Form
              onSubmit={e => {
                e.prevenDefault()
              }}
            >
              <Input
                label='Width'
                type='range'
                min='3'
                max='12'
                step='3'
                value={this.props.content.settings.width}
                valueHandler={this.props.getContentSettingsValueHandler(
                  'width'
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
  getContentSettingsValueHandler: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  settings: PropTypes.object.isRequired,
  width: PropTypes.any
}

export default PageBlockContent
