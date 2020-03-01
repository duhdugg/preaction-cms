import PropTypes from 'prop-types'
import React from 'react'
import PageBlockContent from './PageBlockContent.jsx'
import { Card, Modal, Spinner } from '@preaction/bootstrap-clips'
import { Form, Input } from '@preaction/inputs'
import { MdImage } from 'react-icons/md'
import {
  MdArrowUpward,
  MdArrowDownward,
  MdDelete,
  MdSettings
} from 'react-icons/md'

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
        {this.props.block.blockType === 'content' ? (
          <div className='row'>
            {this.props
              .getContents(this.props.block.pageblockcontents)
              .map((content, key) => (
                <PageBlockContent
                  key={content.id}
                  block={this.props.block}
                  column
                  width={content.settings.width / 12}
                  content={content}
                  contentControl={this.props.contentControl}
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
        {this.props.editable ? (
          <div className='page-block-buttons' style={{ marginBottom: '1em' }}>
            <button
              type='button'
              className='btn btn-primary btn-sm'
              disabled={this.props.first}
              onClick={() => {
                this.props.blockControl(this.props.block.id, 'previous')
              }}
            >
              <MdArrowUpward /> move block up
            </button>
            <button
              type='button'
              className='btn btn-danger btn-sm'
              onClick={() => {
                this.props.blockControl(this.props.block.id, 'delete')
              }}
            >
              <MdDelete /> delete block
            </button>
            <button
              type='button'
              className='btn btn-primary btn-sm'
              disabled={this.props.last}
              onClick={() => {
                this.props.blockControl(this.props.block.id, 'next')
              }}
            >
              <MdArrowDownward /> move block down
            </button>
            <button
              type='button'
              className='btn btn-secondary btn-sm'
              onClick={() => {
                this.toggleSettings()
              }}
            >
              <MdSettings /> block settings
            </button>
          </div>
        ) : (
          ''
        )}
        {this.props.editable && this.state.showSettings ? (
          <Modal
            title='Block Settings'
            closeHandler={this.toggleSettings.bind(this)}
          >
            <div className='pt-1'>
              <button
                type='button'
                className='btn btn-info d-block'
                onClick={() => {
                  this.photosInput.current.click()
                }}
                disabled={this.state.uploading}
              >
                <MdImage /> add images
                {this.state.uploading ? (
                  <span>
                    <span> </span>
                    <Spinner />
                  </span>
                ) : (
                  ''
                )}
              </button>
            </div>
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
  block: PropTypes.object.isRequired,
  blockControl: PropTypes.func.isRequired,
  contentControl: PropTypes.func.isRequired,
  editable: PropTypes.bool,
  emitSave: PropTypes.func.isRequired,
  first: PropTypes.bool,
  getContents: PropTypes.func.isRequired,
  getContentSettingsValueHandler: PropTypes.func.isRequired,
  getPageBlockSettingsValueHandler: PropTypes.func.isRequired,
  last: PropTypes.bool,
  settings: PropTypes.object.isRequired
}

export default PageBlock
