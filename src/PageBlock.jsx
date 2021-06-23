import PropTypes from 'prop-types'
import React from 'react'
import loadable from '@loadable/component'
import PageBlockContent from './PageBlockContent.jsx'
import PageBlockNav from './PageBlockNav.jsx'
import PageBlockIframe from './PageBlockIframe.jsx'
import {
  joinClassNames,
  Card,
  Modal,
  Spinner,
} from '@preaction/bootstrap-clips'
import { MdImage, MdLink, MdFileUpload, MdSpaceBar } from 'react-icons/md'
import {
  MdArrowUpward,
  MdArrowDownward,
  MdDelete,
  MdSettings,
  MdTextFields,
} from 'react-icons/md'
import { PageBlockExtension } from './PageBlockExtension.jsx'
import { blockExtensions } from './ext'
const PageBlockCarousel = loadable(() => import('./PageBlockCarousel.jsx'), {
  fallback: <Spinner size='3.25' />,
})
const PageBlockSettings = loadable(() => import('./settingsModules.js'), {
  fallback: <Spinner size='3.25' />,
  resolveComponent: (module) => module.PageBlockSettings,
})
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

  const refreshBlock = () => {
    props.blockControl(props.block.id, 'refresh')
  }

  const toggleSettings = () => {
    setShowSettings(!showSettings)
  }

  const header = getHeader()
  const borderColor = {
    danger: 'var(--bs-danger)',
    dark: 'var(--bs-dark)',
    info: 'var(--bs-info)',
    light: 'var(--bs-light)',
    primary: 'var(--bs-primary)',
    secondary: 'var(--bs-secondary)',
    success: 'var(--bs-success)',
    transparent: 'transparent',
    warning: 'var(--bs-warning)',
    white: 'var(--bs-white)',
  }[props.block.settings.borderTheme || 'dark']
  const border =
    props.block.blockType !== 'spacer'
      ? `1px solid ${
          header || props.block.settings.pad ? borderColor : 'rgba(0,0,0,0)'
        }`
      : 0

  return (
    <Card
      className={joinClassNames(
        'page-block',
        `block-type-${props.block.blockType.replace(/\s/g, '')}`,
        `block-id-${props.block.id}`,
        header || props.block.settings.pad ? '' : 'nopad-body',
        header || props.block.settings.pad
          ? `card-border-${(props.block.settings.borderTheme || 'dark').replace(
              /\s/g,
              ''
            )}`
          : 'card-border-transparent'
      )}
      column
      width={{
        lg: props.block.settings.lgWidth / 12,
        md: props.block.settings.mdWidth / 12,
        sm: props.block.settings.smWidth / 12,
        xs: props.block.settings.xsWidth / 12,
      }}
      header={header}
      headerTheme={props.block.settings.headerTheme || 'dark'}
      theme={
        props.block.settings.header || props.block.settings.pad
          ? props.block.settings.bodyTheme || 'transparent'
          : undefined
      }
      footerTheme={props.block.settings.headerTheme || 'dark'}
      style={{
        body: {
          padding: header || props.block.settings.pad ? '1em' : 0,
          border: 0,
        },
        card: {
          border,
          marginBottom: props.block.blockType === 'spacer' ? 0 : undefined,
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
              title='Move Block: Previous'
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
              title='Move Block: Next'
            >
              <MdArrowDownward />
            </button>
            <button
              type='button'
              className='btn btn-danger btn-sm delete-block'
              onClick={() => {
                props.blockControl(props.block.id, 'delete')
              }}
              title='Delete Block'
            >
              <MdDelete />
            </button>
            <button
              type='button'
              className='btn btn-secondary btn-sm block-settings'
              onClick={toggleSettings}
              title='Block Settings'
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
                title='Add WYSIWYG'
              >
                <MdTextFields />
              </button>
            ) : (
              ''
            )}
            {['carousel', 'content'].includes(props.block.blockType) ? (
              <button
                type='button'
                className='btn btn-secondary btn-sm upload-images'
                onClick={() => {
                  photosInput.current.click()
                }}
                title='Upload Image(s)'
              >
                <div className='upload-images-icon'>
                  <MdImage />
                  <MdFileUpload />
                </div>
              </button>
            ) : (
              ''
            )}
            {['carousel', 'content'].includes(props.block.blockType) ? (
              <button
                type='button'
                className='btn btn-secondary btn-sm add-images-by-url'
                onClick={() => {
                  const src = window.prompt('Enter image URL')
                  if (src) {
                    props.addContent(props.block, 'image', { src })
                  }
                }}
                title='Add Image by URL'
              >
                <div className='linked-image-icon'>
                  <MdImage />
                  <MdLink />
                </div>
              </button>
            ) : (
              ''
            )}
            {props.block.blockType === 'content' ? (
              <button
                type='button'
                className='btn btn-secondary btn-sm add-spacer'
                onClick={() => {
                  props.addContent(props.block, 'spacer')
                }}
                title='Add Spacer Content'
              >
                <MdSpaceBar />
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
      {props.block.blockType === 'carousel' ? (
        <PageBlockCarousel
          block={props.block}
          getContents={props.getContents}
        />
      ) : (
        ''
      )}
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
      {props.block.blockType === 'spacer' ? (
        <div
          style={{
            height: `${props.block.settings.spacerHeight || '0.8'}em`,
          }}
        ></div>
      ) : (
        ''
      )}
      <Modal
        title={`Block Type "${props.block.blockType}${
          props.block.blockType === 'ext'
            ? `/${props.block.settings.extKey}`
            : ''
        }" Settings`}
        show={props.editable && showSettings}
        setShow={setShowSettings}
        closeHandler={toggleSettings}
        headerTheme='info'
        bodyTheme='white'
        footerTheme='dark'
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
        <PageBlockSettings
          block={props.block}
          contentControl={props.contentControl}
          getContents={props.getContents}
          getContentSettingsValueHandler={getContentSettingsValueHandler}
          getPageBlockSettingsValueHandler={
            props.getPageBlockSettingsValueHandler
          }
        />
      </Modal>
      {props.editable &&
      ['carousel', 'content'].includes(props.block.blockType) ? (
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
                  props.emitSave({
                    action: 'add-content',
                    blockId: props.block.id,
                    pageId: props.page.id,
                  })
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
