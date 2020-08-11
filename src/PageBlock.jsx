import PropTypes from 'prop-types'
import React from 'react'
import PageBlockContent from './PageBlockContent.jsx'
import PageBlockNav from './PageBlockNav.jsx'
import PageBlockIframe from './PageBlockIframe.jsx'
import { Card, Modal } from '@preaction/bootstrap-clips'
import { Form, Input, Checkbox, Select } from '@preaction/inputs'
import { MdImage } from 'react-icons/md'
import {
  MdArrowUpward,
  MdArrowDownward,
  MdDelete,
  MdSettings,
  MdTextFields,
} from 'react-icons/md'

class PageBlock extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showSettings: false,
      uploading: false,
    }
    this.childRef = React.createRef()
    this.imgUploadForm = React.createRef()
    this.photosInput = React.createRef()
    this.jsInput = React.createRef()
    this.jsUploadForm = React.createRef()
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
    return (key) =>
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
    this.setState((state) => {
      state.showSettings = !state.showSettings
      return state
    })
  }

  render() {
    return (
      <Card
        className={{
          card: `page-block page-block-outer block-type-${this.props.block.blockType}`,
        }}
        style={{
          body: {
            padding: 0,
          },
          card: {
            border: 0,
            backgroundColor: 'transparent',
            padding: 0,
          },
        }}
        column
        width={{
          lg: this.props.block.settings.lgWidth / 12,
          md: this.props.block.settings.mdWidth / 12,
          sm: this.props.block.settings.smWidth / 12,
          xs: this.props.block.settings.xsWidth / 12,
        }}
      >
        <Card
          className={{
            card: 'page-block-inner',
          }}
          style={{
            body: {
              backgroundColor: 'transparent',
              padding: 0,
            },
            footer: { padding: 0 },
          }}
          header={this.header}
          headerTheme='dark'
          footerTheme='dark'
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
                <span
                  style={{ display: 'inline-block', paddingLeft: '0.5rem' }}
                >
                  block type: {this.props.block.blockType}
                </span>
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
                      sm: content.settings.smWidth / 12,
                      xs: content.settings.xsWidth / 12,
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
                    navigate={this.props.navigate}
                    settings={this.props.settings}
                    token={this.props.token}
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
          {this.props.block.blockType === 'iframe' ? (
            <PageBlockIframe
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
            title={`Block Type ${this.props.block.blockType} Settings`}
            closeHandler={this.toggleSettings.bind(this)}
            footer={
              <button
                type='button'
                className='btn btn-secondary'
                onClick={this.toggleSettings.bind(this)}
              >
                Close
              </button>
            }
          >
            <Form
              onSubmit={(e) => {
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
                label={`Desktop Width: ${this.props.block.settings.lgWidth} / 12`}
                type='range'
                min='0'
                max='12'
                step='1'
                value={this.props.block.settings.lgWidth}
                valueHandler={this.getPageBlockSettingsValueHandler('lgWidth')}
              />
              <Input
                label={`Tablet Width: ${this.props.block.settings.mdWidth} / 12`}
                type='range'
                min='0'
                max='12'
                step='1'
                value={this.props.block.settings.mdWidth}
                valueHandler={this.getPageBlockSettingsValueHandler('mdWidth')}
              />
              <Input
                label={`Phone Width (Landscape): ${this.props.block.settings.smWidth} / 12`}
                type='range'
                min='0'
                max='12'
                step='1'
                value={this.props.block.settings.smWidth}
                valueHandler={this.getPageBlockSettingsValueHandler('smWidth')}
              />
              <Input
                label={`Phone Width (Portrait): ${this.props.block.settings.xsWidth} / 12`}
                type='range'
                min='0'
                max='12'
                step='1'
                value={this.props.block.settings.xsWidth}
                valueHandler={this.getPageBlockSettingsValueHandler('xsWidth')}
              />
              {this.props.block.blockType === 'nav' ? (
                <span>
                  <Select
                    label='Alignment'
                    value={this.props.block.settings.navAlignment}
                    valueHandler={this.getPageBlockSettingsValueHandler(
                      'navAlignment'
                    )}
                  >
                    <option>left</option>
                    <option>center</option>
                    <option>right</option>
                    <option>vertical</option>
                  </Select>
                  <Checkbox
                    label='Collabsible'
                    checked={this.props.block.settings.navCollapsible}
                    valueHandler={this.getPageBlockSettingsValueHandler(
                      'navCollapsible'
                    )}
                  />
                  <Checkbox
                    label='Enable Submenus'
                    checked={this.props.block.settings.subMenu}
                    valueHandler={this.getPageBlockSettingsValueHandler(
                      'subMenu'
                    )}
                  />
                </span>
              ) : (
                ''
              )}
              {this.props.block.blockType === 'iframe' ? (
                <span>
                  <Input
                    label='URL'
                    value={this.props.block.settings.iframeSrc}
                    valueHandler={this.getPageBlockSettingsValueHandler(
                      'iframeSrc'
                    )}
                  />
                </span>
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
              action={`${this.props.appRoot}/api/upload-img?token=${this.props.token}`}
              encType='multipart/form-data'
              ref={this.imgUploadForm}
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
                  this.imgUploadForm.current.submit()
                  this.setState((state) => {
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
                  (state) => {
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
      </Card>
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
  navigate: PropTypes.func.isRequired,
  page: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
  token: PropTypes.string,
}

export default PageBlock
