import PropTypes from 'prop-types'
import React, { Suspense } from 'react'
import {
  joinClassNames,
  Card,
  Modal,
  Spinner,
} from '@preaction/bootstrap-clips'
import PageBlockImage from './PageBlockImage.jsx'
import PageBlockWysiwyg from './PageBlockWysiwyg.jsx'
import {
  MdArrowBack,
  MdArrowForward,
  MdDelete,
  MdLineStyle,
  MdSettings,
} from 'react-icons/md'
import { FaHtml5 } from 'react-icons/fa'
import getLinkClassName from './lib/getLinkClassName.js'

const PageBlockContentSettings = React.lazy(() =>
  import('./PageBlockContentSettings.jsx')
)

function PageBlockContent(props) {
  const [showSettings, setShowSettings] = React.useState(false)
  const [sourceMode, setSourceMode] = React.useState(false)
  const [theme, setTheme] = React.useState('bubble')

  const getHeader = () => {
    let el
    let text = props.content.settings.header
    if (!text) {
      return ''
    }
    let headerLevel = props.content.settings.headerLevel
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

  const toggleSettings = React.useCallback(() => {
    setShowSettings(!showSettings)
  }, [showSettings])

  const toggleSourceMode = React.useCallback(() => {
    setSourceMode(!sourceMode)
  }, [sourceMode])

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === 'bubble' ? 'snow' : 'bubble')
  }, [theme])

  const header = getHeader()
  const padded = !!header || props.content.settings.pad
  const customClassName = (props.content.settings.customClassName || '')
    .toLowerCase()
    .replace(/[^a-z-]/g, '')

  return (
    <Card
      className={joinClassNames(
        'page-block-content',
        `content-type-${props.content.contentType.replace(/\s/g, '')}`,
        `content-id-${props.content.id}`,
        padded ? '' : 'nopad-body',
        padded
          ? `card-border-${(
              props.content.settings.borderTheme || 'dark'
            ).replace(/\s/g, '')}`
          : 'card-border-transparent',
        props.content.contentType === 'spacer' ? 'mb-0' : '',
        getLinkClassName(props.content.settings.bodyTheme),
        customClassName ? `custom-${customClassName}` : ''
      )}
      column
      header={header}
      headerTheme={props.content.settings.headerTheme || 'dark'}
      headerGradient={props.content.settings.headerGradient}
      theme={
        padded
          ? props.content.settings.bodyTheme || 'transparent'
          : 'transparent'
      }
      gradient={padded ? props.content.settings.bodyGradient : false}
      footerTheme={props.content.settings.headerTheme || 'dark'}
      footerGradient={props.content.settings.headerGradient}
      footer={
        props.editable ? (
          <div className='btn-group d-block'>
            <button
              type='button'
              className='btn btn-sm btn-secondary move-content previous'
              disabled={props.first}
              onClick={() => {
                props.contentControl(props.block, props.index, 'previous')
              }}
              title='Move Content: Previous'
            >
              <MdArrowBack />
            </button>
            <button
              type='button'
              disabled={props.last}
              className='btn btn-sm btn-secondary move-content next'
              onClick={() => {
                props.contentControl(props.block, props.index, 'next')
              }}
              title='Move Content: Next'
            >
              <MdArrowForward />
            </button>
            <button
              type='button'
              disabled={props.first && props.last}
              className='btn btn-sm btn-danger delete-content'
              onClick={() => {
                props.contentControl(props.block, props.index, 'delete')
              }}
              title='Delete Content'
            >
              <MdDelete />
            </button>
            <button
              type='button'
              className='btn btn-sm btn-secondary content-settings'
              onClick={toggleSettings}
              title='Content Settings'
            >
              <MdSettings />
            </button>
            {props.content.contentType === 'wysiwyg' ? (
              <button
                type='button'
                className='btn btn-sm btn-secondary toggle-wysiwyg-html'
                onClick={toggleSourceMode}
                title='Toggle HTML Source Mode'
              >
                <FaHtml5 />
              </button>
            ) : (
              ''
            )}
            {props.content.contentType === 'wysiwyg' && !sourceMode ? (
              <button
                type='button'
                className='btn btn-sm btn-secondary toggle-wysiwyg-theme'
                onClick={toggleTheme}
                title='Toggle Toolbar'
              >
                <MdLineStyle />
              </button>
            ) : (
              ''
            )}
            <span style={{ display: 'inline-block', paddingLeft: '0.5rem' }}>
              content type: {props.content.contentType}
            </span>
          </div>
        ) : (
          ''
        )
      }
      width={props.width}
    >
      {props.content.contentType === 'wysiwyg' ? (
        <PageBlockWysiwyg
          appRoot={props.appRoot}
          block={props.block}
          content={props.content}
          editable={props.editable}
          emitSave={props.emitSave}
          sourceMode={sourceMode}
          theme={theme}
          token={props.token}
        />
      ) : (
        ''
      )}
      {props.content.contentType === 'image' ? (
        <PageBlockImage content={props.content} />
      ) : (
        ''
      )}
      {props.content.contentType === 'spacer' ? (
        <div
          style={{
            height: `${props.content.settings.spacerHeight || '1'}em`,
          }}
        ></div>
      ) : (
        ''
      )}
      <Modal
        title={`Content Type "${props.content.contentType}" Settings`}
        show={showSettings}
        setShow={setShowSettings}
        size='lg'
        headerTheme='warning'
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
        {showSettings ? (
          <Suspense fallback={<Spinner size={3.25} />}>
            <PageBlockContentSettings
              content={props.content}
              getContentSettingsValueHandler={
                props.getContentSettingsValueHandler
              }
            />
          </Suspense>
        ) : (
          ''
        )}
      </Modal>
    </Card>
  )
}

PageBlockContent.propTypes = {
  block: PropTypes.object.isRequired,
  appRoot: PropTypes.string.isRequired,
  content: PropTypes.object.isRequired,
  contentControl: PropTypes.func.isRequired,
  emitSave: PropTypes.func.isRequired,
  editable: PropTypes.bool,
  first: PropTypes.bool,
  getContentSettingsValueHandler: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  last: PropTypes.bool,
  settings: PropTypes.object.isRequired,
  token: PropTypes.string,
  width: PropTypes.any,
}

export default PageBlockContent
