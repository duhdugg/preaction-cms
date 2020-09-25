import PropTypes from 'prop-types'
import React from 'react'
import { Card, Modal } from '@preaction/bootstrap-clips'
import { Form, Input } from '@preaction/inputs'
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

  const toggleSettings = () => {
    setShowSettings(!showSettings)
  }

  const toggleSourceMode = () => {
    setSourceMode(!sourceMode)
  }

  const toggleTheme = () => {
    setTheme(theme === 'bubble' ? 'snow' : 'bubble')
  }

  const header = getHeader()

  return (
    <Card
      className={{
        card: 'page-block-content',
      }}
      noMargin
      column
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
              className='btn btn-sm btn-secondary move-content previous'
              disabled={props.first}
              onClick={() => {
                props.contentControl(props.block, props.index, 'previous')
              }}
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
            >
              <MdDelete />
            </button>
            <button
              type='button'
              className='btn btn-sm btn-secondary content-settings'
              onClick={toggleSettings}
            >
              <MdSettings />
            </button>
            {props.content.contentType === 'wysiwyg' ? (
              <button
                type='button'
                className='btn btn-sm btn-secondary toggle-wysiwyg-html'
                onClick={toggleSourceMode}
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
        <PageBlockImage content={props.content} navigate={props.navigate} />
      ) : (
        ''
      )}
      {showSettings ? (
        <Modal
          title={`Content Type "${props.content.contentType}" Settings`}
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
          <div className='content-settings'>
            <Form
              onSubmit={(e) => {
                e.prevenDefault()
              }}
            >
              <div className='header-field'>
                <Input
                  type='text'
                  label='Header'
                  value={props.content.settings.header}
                  valueHandler={props.getContentSettingsValueHandler('header')}
                />
              </div>
              <div className='header-level-field'>
                <Input
                  type='range'
                  label={`Header Level: ${props.content.settings.headerLevel}`}
                  min='0'
                  max='6'
                  value={props.content.settings.headerLevel}
                  valueHandler={props.getContentSettingsValueHandler(
                    'headerLevel'
                  )}
                />
              </div>
              <div className='width-field desktop-width-field'>
                <Input
                  label={`Desktop Width: ${props.content.settings.lgWidth} / 12`}
                  type='range'
                  min='0'
                  max='12'
                  step='1'
                  value={props.content.settings.lgWidth}
                  valueHandler={props.getContentSettingsValueHandler('lgWidth')}
                />
              </div>
              <div className='width-field tablet-width-field'>
                <Input
                  label={`Tablet Width: ${props.content.settings.mdWidth} / 12`}
                  type='range'
                  min='0'
                  max='12'
                  step='1'
                  value={props.content.settings.mdWidth}
                  valueHandler={props.getContentSettingsValueHandler('mdWidth')}
                />
              </div>
              <div className='width-field landscape-phone-width-field'>
                <Input
                  label={`Phone Width (Landscape): ${props.content.settings.smWidth} / 12`}
                  type='range'
                  min='0'
                  max='12'
                  step='1'
                  value={props.content.settings.smWidth}
                  valueHandler={props.getContentSettingsValueHandler('smWidth')}
                />
              </div>
              <div className='width-field portrait-phone-width-field'>
                <Input
                  label={`Phone Width (Portrait): ${props.content.settings.xsWidth} / 12`}
                  type='range'
                  min='0'
                  max='12'
                  step='1'
                  value={props.content.settings.xsWidth}
                  valueHandler={props.getContentSettingsValueHandler('xsWidth')}
                />
              </div>
              {props.content.contentType === 'image' ? (
                <div>
                  <div className='img-src-field'>
                    <Input
                      label='Image Source'
                      value={props.content.settings.src}
                      valueHandler={props.getContentSettingsValueHandler('src')}
                    />
                  </div>
                  <div className='alt-text-field'>
                    <Input
                      label='Alt Text'
                      value={props.content.settings.altText}
                      valueHandler={props.getContentSettingsValueHandler(
                        'altText'
                      )}
                    />
                  </div>
                  <div className='link-url-field'>
                    <Input
                      label='Link URL'
                      type='url'
                      value={props.content.settings.linkUrl}
                      valueHandler={props.getContentSettingsValueHandler(
                        'linkUrl'
                      )}
                    />
                  </div>
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
  navigate: PropTypes.func,
  settings: PropTypes.object.isRequired,
  token: PropTypes.string,
  width: PropTypes.any,
}

export default PageBlockContent
