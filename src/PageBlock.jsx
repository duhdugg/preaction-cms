import PropTypes from 'prop-types'
import React from 'react'
import PageBlockContent from './PageBlockContent.jsx'
import PageBlockNav from './PageBlockNav.jsx'
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

  get header() {
    let el
    let text = this.props.block.settings.header
    if (!text) {
      return ''
    }
    let headerLevel = this.props.block.settings.headerLevel
    switch (headerLevel) {
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
        el = React.createElement(`h${headerLevel}`, {}, text)
        break
      default:
        el = React.createElement('span', {}, text)
        break
    }
    return el
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
          header={this.header}
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
                {this.props.block.blockType === 'content' ? (
                  <span>
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
                  </span>
                ) : (
                  ''
                )}
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
                    appRoot={this.props.appRoot}
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
          {this.props.block.blockType === 'nav' ? (
            <PageBlockNav
              appRoot={this.props.appRoot}
              block={this.props.block}
              editable={this.props.editable}
              emitSave={this.props.emitSave}
              navigate={this.props.navigate}
              page={this.props.page}
              settings={this.props.settings}
            />
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
                label={`Header Level: ${this.props.block.settings.headerLevel}`}
                min='0'
                max='6'
                value={this.props.block.settings.headerLevel}
                valueHandler={this.getPageBlockSettingsValueHandler(
                  'headerLevel'
                )}
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
              {this.props.block.blockType === 'nav' ? (
                <Checkbox
                  label='Enable Submenus'
                  checked={this.props.block.settings.subMenu}
                  valueHandler={this.getPageBlockSettingsValueHandler(
                    'subMenu'
                  )}
                />
              ) : (
                ''
              )}
            </Form>
          </Modal>
        ) : (
          ''
        )}
        {this.props.editable ? (
          <div>
            <form
              method='POST'
              action={`${this.props.appRoot}/api/upload`}
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
  appRoot: PropTypes.string.isRequired,
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
  navigate: PropTypes.func,
  page: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired
}

export default PageBlock
