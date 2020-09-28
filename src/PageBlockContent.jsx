import PropTypes from 'prop-types'
import React from 'react'
import { Card, Modal } from '@preaction/bootstrap-clips'
import { Form, Input, Checkbox, Select } from '@preaction/inputs'
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
  const borderColor = {
    danger: 'var(--danger)',
    dark: 'var(--dark)',
    info: 'var(--info)',
    light: 'var(--light)',
    primary: 'var(--primary)',
    secondary: 'var(--secondary)',
    success: 'var(--success)',
    transparent: 'transparent',
    warning: 'var(--warning)',
    white: 'var(--white)',
  }[props.content.settings.borderTheme || 'dark']
  const border =
    props.content.contentType !== 'spacer'
      ? `1px solid ${
          header || props.block.settings.pad ? borderColor : 'rgba(0,0,0,0)'
        }`
      : 0

  return (
    <Card
      className={{
        card: 'page-block-content',
      }}
      noMargin
      column
      header={header}
      headerTheme={props.content.settings.headerTheme || 'dark'}
      bodyTheme={
        props.content.settings.header || props.content.settings.pad
          ? props.content.settings.bodyTheme || 'transparent'
          : undefined
      }
      footerTheme={props.content.settings.headerTheme || 'dark'}
      style={{
        body: {
          padding: header || props.content.settings.pad ? '1em' : 0,
          border: 0,
        },
        card: {
          border,
          marginBottom: props.content.contentType === 'spacer' ? 0 : undefined,
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
        <PageBlockImage content={props.content} navigate={props.navigate} />
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
      {showSettings ? (
        <Modal
          title={`Content Type "${props.content.contentType}" Settings`}
          closeHandler={toggleSettings}
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
          <div className='content-settings'>
            <Form
              onSubmit={(e) => {
                e.preventDefault()
              }}
            >
              {props.content.contentType !== 'spacer' ? (
                <div className='header-field'>
                  <Input
                    type='text'
                    label='Header'
                    value={props.content.settings.header}
                    valueHandler={props.getContentSettingsValueHandler(
                      'header'
                    )}
                  />
                </div>
              ) : (
                ''
              )}
              {props.content.settings.header ? (
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
              ) : (
                ''
              )}
              {!props.content.settings.header &&
              props.content.contentType !== 'spacer' ? (
                <div className='pad-field'>
                  <Checkbox
                    label='Pad'
                    checked={props.content.settings.pad}
                    valueHandler={props.getContentSettingsValueHandler('pad')}
                  />
                </div>
              ) : (
                ''
              )}
              {props.content.settings.header ? (
                <div className='card-header-theme'>
                  <Select
                    label='Header Theme'
                    value={props.content.settings.headerTheme || 'dark'}
                    valueHandler={props.getContentSettingsValueHandler(
                      'headerTheme'
                    )}
                  >
                    <option>danger</option>
                    <option>dark</option>
                    <option>info</option>
                    <option>light</option>
                    <option>primary</option>
                    <option>secondary</option>
                    <option>success</option>
                    <option>warning</option>
                    <option>white</option>
                  </Select>
                </div>
              ) : (
                ''
              )}
              {props.content.settings.header || props.content.settings.pad ? (
                <div>
                  <div className='body-theme'>
                    <Select
                      label='Body Theme'
                      value={props.content.settings.bodyTheme || 'transparent'}
                      valueHandler={props.getContentSettingsValueHandler(
                        'bodyTheme'
                      )}
                    >
                      <option>danger</option>
                      <option>dark</option>
                      <option>info</option>
                      <option>light</option>
                      <option>primary</option>
                      <option>secondary</option>
                      <option>success</option>
                      <option>transparent</option>
                      <option>warning</option>
                      <option>white</option>
                    </Select>
                  </div>
                </div>
              ) : (
                ''
              )}
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
              {props.content.contentType === 'spacer' ? (
                <div>
                  <div className='spacer-height-field'>
                    <Input
                      type='number'
                      min='0.0625'
                      step='0.0625'
                      label='Spacer Height'
                      value={props.content.settings.spacerHeight}
                      valueHandler={props.getContentSettingsValueHandler(
                        'spacerHeight'
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
