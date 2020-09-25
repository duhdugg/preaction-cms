import PropTypes from 'prop-types'
import React from 'react'
import PageBlockContent from './PageBlockContent.jsx'
import PageBlockNav from './PageBlockNav.jsx'
import PageBlockIframe from './PageBlockIframe.jsx'
import { Card, Modal } from '@preaction/bootstrap-clips'
import { Form, Input, Checkbox, Select } from '@preaction/inputs'
import { MdImage, MdLink, MdFileUpload } from 'react-icons/md'
import {
  MdArrowUpward,
  MdArrowDownward,
  MdDelete,
  MdSettings,
  MdTextFields,
} from 'react-icons/md'
import { PageBlockExtension } from './PageBlockExtension.jsx'
import { blockExtensions } from './ext'

function PageBlock(props) {
  const [showSettings, setShowSettings] = React.useState(false)
  const imgUploadForm = React.useRef()
  const photosInput = React.useRef()
  const imgUploadFrame = React.useRef()

  const getHeader = () => {
    let el
    let text = props.block.settings.header
    if (!text) {
      return ''
    }
    let headerLevel = props.block.settings.headerLevel
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

  const getContentSettingsValueHandler = (contentId) => {
    return (key) =>
      props.getContentSettingsValueHandler(props.block.id, contentId, key)
  }

  const getPageBlockSettingsValueHandler = (key) => {
    return props.getPageBlockSettingsValueHandler(props.block.id, key)
  }

  const refreshBlock = () => {
    props.blockControl(props.block.id, 'refresh')
  }

  const toggleSettings = () => {
    setShowSettings(!showSettings)
  }

  const header = getHeader()

  return (
    <Card
      className={{
        card: `page-block page-block-outer block-type-${props.block.blockType}`,
      }}
      column
      width={{
        lg: props.block.settings.lgWidth / 12,
        md: props.block.settings.mdWidth / 12,
        sm: props.block.settings.smWidth / 12,
        xs: props.block.settings.xsWidth / 12,
      }}
    >
      <Card
        className={{
          card: 'page-block-inner',
        }}
        header={header}
        headerTheme='dark'
        footerTheme='dark'
        style={{
          body: {
            padding: header ? '1em' : 0,
            border: `1px solid ${header ? 'var(--dark)' : 'rgba(0,0,0,0)'}`,
          },
        }}
        footer={
          props.editable ? (
            <div className='btn-group d-block'>
              <button
                type='button'
                className='btn btn-secondary btn-sm move-block previous'
                disabled={props.first}
                onClick={() => {
                  props.blockControl(props.block.id, 'previous')
                }}
              >
                <MdArrowUpward />
              </button>
              <button
                type='button'
                className='btn btn-secondary btn-sm move-block next'
                disabled={props.last}
                onClick={() => {
                  props.blockControl(props.block.id, 'next')
                }}
              >
                <MdArrowDownward />
              </button>
              <button
                type='button'
                className='btn btn-danger btn-sm delete-block'
                onClick={() => {
                  props.blockControl(props.block.id, 'delete')
                }}
              >
                <MdDelete />
              </button>
              <button
                type='button'
                className='btn btn-secondary btn-sm block-settings'
                onClick={toggleSettings}
              >
                <MdSettings />
              </button>
              {props.block.blockType === 'content' ? (
                <button
                  type='button'
                  className='btn btn-secondary btn-sm add-wysiwyg'
                  onClick={() => {
                    props.addContent(props.block, 'wysiwyg')
                  }}
                >
                  <MdTextFields />
                </button>
              ) : (
                ''
              )}
              {props.block.blockType === 'content' ? (
                <button
                  type='button'
                  className='btn btn-secondary btn-sm upload-images'
                  onClick={() => {
                    photosInput.current.click()
                  }}
                >
                  <div className='upload-images-icon'>
                    <MdImage />
                    <MdFileUpload />
                  </div>
                </button>
              ) : (
                ''
              )}
              {props.block.blockType === 'content' ? (
                <button
                  type='button'
                  className='btn btn-secondary btn-sm add-images-by-url'
                  onClick={() => {
                    const src = window.prompt('Enter image URL')
                    if (src) {
                      props.addContent(props.block, 'image', { src })
                    }
                  }}
                >
                  <div className='linked-image-icon'>
                    <MdImage />
                    <MdLink />
                  </div>
                </button>
              ) : (
                ''
              )}
              <span style={{ display: 'inline-block', paddingLeft: '0.5rem' }}>
                block type: {props.block.blockType}
                {props.block.blockType === 'ext'
                  ? `/${props.block.settings.extKey}`
                  : ''}
              </span>
            </div>
          ) : (
            ''
          )
        }
      >
        {props.block.blockType === 'content' ? (
          <div className='row'>
            {props
              .getContents(props.block.pageblockcontents)
              .map((content, key) => (
                <PageBlockContent
                  key={content.id}
                  appRoot={props.appRoot}
                  block={props.block}
                  width={{
                    lg: content.settings.lgWidth / 12,
                    md: content.settings.mdWidth / 12,
                    sm: content.settings.smWidth / 12,
                    xs: content.settings.xsWidth / 12,
                  }}
                  content={content}
                  contentControl={props.contentControl}
                  first={key === 0}
                  last={key === props.block.pageblockcontents.length - 1}
                  index={key}
                  getContentSettingsValueHandler={getContentSettingsValueHandler(
                    content.id
                  )}
                  editable={props.editable}
                  emitSave={props.emitSave}
                  navigate={props.navigate}
                  settings={props.settings}
                  token={props.token}
                />
              ))}
          </div>
        ) : (
          ''
        )}
        {props.block.blockType === 'nav' ? (
          <PageBlockNav
            block={props.block}
            navigate={props.navigate}
            page={props.page}
          />
        ) : (
          ''
        )}
        {props.block.blockType === 'iframe' ? (
          <PageBlockIframe block={props.block} />
        ) : (
          ''
        )}
        {props.block.blockType === 'ext' ? (
          <PageBlockExtension
            extBlockIndex={blockExtensions}
            extKey={props.block.settings.extKey}
            propsData={{
              ...props.block.settings.propsData,
              preaction: {
                appRoot: props.appRoot,
                block: props.block,
                editable: props.editable,
                emitSave: props.emitSave,
                getPageBlockSettingsValueHandler:
                  props.getPageBlockSettingsValueHandler,
                navigate: props.navigate,
                page: props.page,
                settings: props.settings,
                token: props.token,
              },
            }}
          />
        ) : (
          ''
        )}
      </Card>
      {props.editable && showSettings ? (
        <Modal
          title={`Block Type "${props.block.blockType}${
            props.block.blockType === 'ext'
              ? `/${props.block.settings.extKey}`
              : ''
          }" Settings`}
          closeHandler={toggleSettings}
          footer={
            <button
              type='button'
              className='btn btn-secondary'
              onClick={toggleSettings}
            >
              Close
            </button>
          }
        >
          <div className='block-settings'>
            <Form
              onSubmit={(e) => {
                e.prevenDefault()
              }}
            >
              <div className='header-field'>
                <Input
                  type='text'
                  label='Header'
                  value={props.block.settings.header}
                  valueHandler={getPageBlockSettingsValueHandler('header')}
                />
              </div>
              <div className='header-level-field'>
                <Input
                  type='range'
                  label={`Header Level: ${props.block.settings.headerLevel}`}
                  min='0'
                  max='6'
                  value={props.block.settings.headerLevel}
                  valueHandler={getPageBlockSettingsValueHandler('headerLevel')}
                />
              </div>
              <div className='width-field desktop-width-field'>
                <Input
                  label={`Desktop Width: ${props.block.settings.lgWidth} / 12`}
                  type='range'
                  min='0'
                  max='12'
                  step='1'
                  value={props.block.settings.lgWidth}
                  valueHandler={getPageBlockSettingsValueHandler('lgWidth')}
                />
              </div>
              <div className='width-field tablet-width-field'>
                <Input
                  label={`Tablet Width: ${props.block.settings.mdWidth} / 12`}
                  type='range'
                  min='0'
                  max='12'
                  step='1'
                  value={props.block.settings.mdWidth}
                  valueHandler={getPageBlockSettingsValueHandler('mdWidth')}
                />
              </div>
              <div className='width-field landscape-phone-width-field'>
                <Input
                  label={`Phone Width (Landscape): ${props.block.settings.smWidth} / 12`}
                  type='range'
                  min='0'
                  max='12'
                  step='1'
                  value={props.block.settings.smWidth}
                  valueHandler={getPageBlockSettingsValueHandler('smWidth')}
                />
              </div>
              <div className='width-field portrait-phone-width-field'>
                <Input
                  label={`Phone Width (Portrait): ${props.block.settings.xsWidth} / 12`}
                  type='range'
                  min='0'
                  max='12'
                  step='1'
                  value={props.block.settings.xsWidth}
                  valueHandler={getPageBlockSettingsValueHandler('xsWidth')}
                />
              </div>
              {props.block.blockType === 'nav' ? (
                <div>
                  <div className='nav-alignment-field'>
                    <Select
                      label='Alignment'
                      value={props.block.settings.navAlignment}
                      valueHandler={getPageBlockSettingsValueHandler(
                        'navAlignment'
                      )}
                    >
                      <option>left</option>
                      <option>center</option>
                      <option>right</option>
                      <option>vertical</option>
                    </Select>
                  </div>
                  <div className='nav-collapsible-field'>
                    <Checkbox
                      label='Collabsible'
                      checked={props.block.settings.navCollapsible}
                      valueHandler={getPageBlockSettingsValueHandler(
                        'navCollapsible'
                      )}
                    />
                  </div>
                  <div className='enable-submenus-field'>
                    <Checkbox
                      label='Enable Submenus'
                      checked={props.block.settings.subMenu}
                      valueHandler={getPageBlockSettingsValueHandler('subMenu')}
                    />
                  </div>
                </div>
              ) : (
                ''
              )}
              {props.block.blockType === 'iframe' ? (
                <div className='iframe-src-field'>
                  <Input
                    label='URL'
                    value={props.block.settings.iframeSrc}
                    valueHandler={getPageBlockSettingsValueHandler('iframeSrc')}
                  />
                </div>
              ) : (
                ''
              )}
              {props.block.blockType === 'ext' ? (
                <div
                  className={`block-ext-settings key-${props.block.settings.extKey}`}
                >
                  <PageBlockExtension.Settings
                    extBlockIndex={blockExtensions}
                    extKey={props.block.settings.extKey}
                    getPageBlockSettingsValueHandler={
                      getPageBlockSettingsValueHandler
                    }
                    propsData={props.block.settings.propsData}
                  />
                </div>
              ) : (
                ''
              )}
            </Form>
          </div>
        </Modal>
      ) : (
        ''
      )}
      {props.editable ? (
        <div>
          <form
            method='POST'
            action={`${props.appRoot}/api/upload-img?token=${props.token}`}
            encType='multipart/form-data'
            ref={imgUploadForm}
            target={`upload-frame-${props.block.id}`}
            className='d-none'
          >
            <input
              name='photos'
              type='file'
              multiple
              accept='image/*'
              ref={photosInput}
              onChange={() => {
                imgUploadForm.current.submit()
              }}
            />
            <input
              name='target'
              type='hidden'
              value={`page-block/${props.block.id}`}
            />
          </form>
          <iframe
            name={`upload-frame-${props.block.id}`}
            title='upload'
            onLoad={() => {
              try {
                if (
                  imgUploadFrame.current.contentWindow.location.href.match(
                    /api\/upload-img/g
                  )
                ) {
                  refreshBlock()
                }
              } catch {}
            }}
            className='d-none'
            ref={imgUploadFrame}
          />
        </div>
      ) : (
        ''
      )}
    </Card>
  )
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
