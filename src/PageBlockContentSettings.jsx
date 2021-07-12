import PropTypes from 'prop-types'
import React from 'react'
import { Form, Input, Checkbox, Select } from '@preaction/inputs'

function PageBlockContentSettings(props) {
  return (
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
              labelFloat
              value={props.content.settings.header}
              valueHandler={props.getContentSettingsValueHandler('header')}
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
              valueHandler={props.getContentSettingsValueHandler('headerLevel')}
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
          <div>
            <div className='header-theme-field'>
              <Select
                label='Header Theme'
                labelFloat
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
            <div className='header-gradient-field'>
              <Checkbox
                label='Header Gradient'
                checked={props.content.settings.headerGradient || false}
                valueHandler={props.getContentSettingsValueHandler(
                  'headerGradient'
                )}
              />
            </div>
          </div>
        ) : (
          ''
        )}
        {props.content.settings.header || props.content.settings.pad ? (
          <div>
            <div className='body-theme-field'>
              <Select
                label='Body Theme'
                labelFloat
                value={props.content.settings.bodyTheme || 'transparent'}
                valueHandler={props.getContentSettingsValueHandler('bodyTheme')}
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
            <div className='body-gradient-field'>
              <Checkbox
                label='Body Gradient'
                checked={props.content.settings.bodyGradient || false}
                valueHandler={props.getContentSettingsValueHandler(
                  'bodyGradient'
                )}
              />
            </div>
            <div className='border-theme-field'>
              <Select
                label='Border Theme'
                labelFloat
                value={props.content.settings.borderTheme || 'dark'}
                valueHandler={props.getContentSettingsValueHandler(
                  'borderTheme'
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
            <div className='theme-examples mb-2'>
              <div>Theme Examples</div>
              <div className='badge bg-danger text-light'>danger</div>
              <div className='badge bg-dark text-light'>dark</div>
              <div className='badge bg-info text-light'>info</div>
              <div className='badge bg-light text-dark'>light</div>
              <div className='badge bg-primary text-light'>primary</div>
              <div className='badge bg-secondary text-light'>secondary</div>
              <div className='badge bg-success text-light'>success</div>
              <div className='badge bg-warning text-dark'>warning</div>
              <div className='badge bg-white text-dark'>white</div>
            </div>
          </div>
        ) : (
          ''
        )}
        <div className='width-field large-monitor-width-field'>
          <Input
            label={`Large Monitor Width: ${props.content.settings.xxlWidth} / 12`}
            type='range'
            min='0'
            max='12'
            step='1'
            value={props.content.settings.xxlWidth}
            valueHandler={props.getContentSettingsValueHandler('xxlWidth')}
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
                labelFloat
                value={props.content.settings.src}
                valueHandler={props.getContentSettingsValueHandler('src')}
              />
            </div>
            <div className='alt-text-field'>
              <Input
                label='Alt Text'
                labelFloat
                value={props.content.settings.altText}
                valueHandler={props.getContentSettingsValueHandler('altText')}
              />
            </div>
            <div className='link-url-field'>
              <Input
                label='Link URL'
                labelFloat
                type='url'
                value={props.content.settings.linkUrl}
                valueHandler={props.getContentSettingsValueHandler('linkUrl')}
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
                labelFloat
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
        <div className='custom-class-name-field'>
          <Input
            label='Custom Style Class Name'
            labelFloat
            value={props.content.settings.customClassName}
            valueHandler={(value) => {
              value = value.toLowerCase().replace(/[^a-z-]/g, '')
              props.getContentSettingsValueHandler('customClassName')(value)
            }}
          />
        </div>
      </Form>
    </div>
  )
}

PageBlockContentSettings.propTypes = {
  content: PropTypes.object.isRequired,
  getContentSettingsValueHandler: PropTypes.func.isRequired,
}

export default PageBlockContentSettings
