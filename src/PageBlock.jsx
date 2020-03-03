import PropTypes from 'prop-types'
import React from 'react'
import PageBlockContent from './PageBlockContent.jsx'
import { Card, Modal, Spinner } from '@preaction/bootstrap-clips'
import { Form, Input, Checkbox } from '@preaction/inputs'
import { MdImage } from 'react-icons/md'
import {
  MdArrowUpward,
  MdArrowDownward,
  MdDelete,
  MdSettings,
  MdTextFields
} from 'react-icons/md'
import { getRgbaFromSettings } from './lib/getRgba.js'

class PageBlock extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showSettings: false,
      uploading: false
    }
    this.uploadForm = React.createRef()
    this.photosInput = React.createRef()
  }

  getContentSettingsValueHandler(contentId) {
    return key =>
      this.props.getContentSettingsValueHandler(
        this.props.block.id,
        contentId,
        key
      )
  }

  getPageBlockSettingsValueHandler(key) {
    return this.props.getPageBlockSettingsValueHandler(this.props.block.id, key)
  }

  refreshBlock() {
    this.props.blockControl(this.props.block.id, 'refresh')
    this.props.emitSave()
  }

  toggleSettings() {
    this.setState(state => {
      state.showSettings = !state.showSettings
      return state
    })
  }

  render() {
    return (
      <div className={`page-block ${this.props.block.blockType}`}>
        <Card
          style={{
            body: {
              padding: this.props.block.settings.padding
                ? `${this.props.block.settings.padding}em`
                : 0,
              backgroundColor: 'transparent'
            },
            card: {
              border: this.props.block.settings.showBorder
                ? `1px solid ${
                    getRgbaFromSettings(this.props.settings, 'border').string
                  }`
                : 0,
              backgroundColor: this.props.block.settings.showContainer
                ? getRgbaFromSettings(this.props.settings, 'container').string
                : 'transparent'
            },
            footer: { padding: 0 }
          }}
          header={this.props.block.settings.header}
          headerTheme={this.props.settings.containerHeaderTheme}
          footerTheme={this.props.settings.containerHeaderTheme}
          footer={
            this.props.editable ? (
              <div className='btn-group d-block'>
                <button
                  type='button'
                  className='btn btn-secondary btn-sm'
                  disabled={this.props.first}
                  onClick={() => {
                    this.props.blockControl(this.props.block.id, 'previous')
                  }}
                >
                  <MdArrowUpward />
                </button>
                <button
                  type='button'
                  className='btn btn-secondary btn-sm'
                  disabled={this.props.last}
                  onClick={() => {
                    this.props.blockControl(this.props.block.id, 'next')
                  }}
                >
                  <MdArrowDownward />
                </button>
                <button
                  type='button'
                  className='btn btn-danger btn-sm'
                  onClick={() => {
                    this.props.blockControl(this.props.block.id, 'delete')
                  }}
                >
                  <MdDelete />
                </button>
                <button
                  type='button'
                  className='btn btn-secondary btn-sm'
                  onClick={() => {
                    this.toggleSettings()
                  }}
                >
                  <MdSettings />
                </button>
                <button
                  type='button'
                  className='btn btn-secondary btn-sm'
                  onClick={() => {
                    this.props.addContent(this.props.block, 'wysiwyg')
                  }}
                >
                  <MdTextFields />
                </button>
                <button
                  type='button'
                  className='btn btn-secondary btn-sm'
                  onClick={() => {
                    this.photosInput.current.click()
                  }}
                >
                  <MdImage />
                </button>
              </div>
            ) : (
              ''
            )
          }
        >
          {this.props.block.blockType === 'content' ? (
            <div className='row'>
              {this.props
                .getContents(this.props.block.pageblockcontents)
                .map((content, key) => (
                  <PageBlockContent
                    key={content.id}
                    block={this.props.block}
                    column
                    width={{
                      lg: content.settings.lgWidth / 12,
                      md: content.settings.mdWidth / 12,
                      sm: content.settings.smWith / 12,
                      xs: content.settings.xsWidth / 12
                    }}
                    content={content}
                    contentControl={this.props.contentControl}
                    first={key === 0}
                    last={key === this.props.block.pageblockcontents.length - 1}
                    index={key}
                    getContentSettingsValueHandler={this.getContentSettingsValueHandler(
                      content.id
                    )}
                    editable={this.props.editable}
                    emitSave={this.props.emitSave}
                    settings={this.props.settings}
                  />
                ))}
            </div>
          ) : (
            ''
          )}
        </Card>
        {this.props.editable && this.state.showSettings ? (
          <Modal
            title='Block Settings'
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
                value={this.props.block.settings.header}
                valueHandler={this.getPageBlockSettingsValueHandler('header')}
              />
              <Input
                type='range'
                label={`Padding: ${
                  this.props.block.settings.padding
                    ? Number(this.props.block.settings.padding).toFixed(2)
                    : '0.00'
                }`}
                min='0'
                max='3'
                step='0.05'
                value={this.props.block.settings.padding || 0}
                valueHandler={this.getPageBlockSettingsValueHandler('padding')}
              />
              <Checkbox
                label='Show Container Background'
                checked={this.props.block.settings.showContainer}
                valueHandler={this.getPageBlockSettingsValueHandler(
                  'showContainer'
                )}
              />
              <Checkbox
                label='Show Border'
                checked={this.props.block.settings.showBorder}
                valueHandler={this.getPageBlockSettingsValueHandler(
                  'showBorder'
                )}
              />
            </Form>
          </Modal>
        ) : (
          ''
        )}
        {this.props.editable ? (
          <div>
            <form
              method='POST'
              action='/api/upload'
              encType='multipart/form-data'
              ref={this.uploadForm}
              target={`upload-frame-${this.props.block.id}`}
              className='d-none'
            >
              <input
                name='photos'
                type='file'
                multiple
                accept='image/*'
                ref={this.photosInput}
                onChange={() => {
                  this.uploadForm.current.submit()
                  this.setState(state => {
                    state.uploading = true
                    return state
                  })
                }}
              />
              <input
                name='target'
                type='hidden'
                value={`page-block/${this.props.block.id}`}
              />
            </form>
            <iframe
              name={`upload-frame-${this.props.block.id}`}
              title='upload'
              onLoad={() => {
                this.setState(
                  state => {
                    state.uploading = false
                    return state
                  },
                  () => {
                    this.refreshBlock()
                  }
                )
              }}
              className='d-none'
            />
          </div>
        ) : (
          ''
        )}
      </div>
    )
  }
}

PageBlock.propTypes = {
  addContent: PropTypes.func.isRequired,
  block: PropTypes.object.isRequired,
  blockControl: PropTypes.func.isRequired,
  contentControl: PropTypes.func.isRequired,
  editable: PropTypes.bool,
  emitSave: PropTypes.func.isRequired,
  first: PropTypes.bool,
  getContentSettingsValueHandler: PropTypes.func.isRequired,
  getContents: PropTypes.func.isRequired,
  getPageBlockSettingsValueHandler: PropTypes.func.isRequired,
  last: PropTypes.bool,
  settings: PropTypes.object.isRequired
}

export default PageBlock
