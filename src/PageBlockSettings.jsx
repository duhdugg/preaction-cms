import PropTypes from 'prop-types'
import React from 'react'
import { Checkbox, Form, Input, Select } from '@preaction/inputs'
import { PageBlockExtension } from './PageBlockExtension.jsx'
import { blockExtensions } from './ext'
import PageBlockCarouselSettings from './PageBlockCarouselSettings.jsx'

function PageBlockSettings(props) {
  const { getPageBlockSettingsValueHandler } = props
  const gpbsvh = React.useCallback(
    (key) => {
      return getPageBlockSettingsValueHandler(props.block.id, key)
    },
    [getPageBlockSettingsValueHandler, props.block]
  )

  return (
    <div className='block-settings'>
      <Form
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        {props.block.blockType !== 'spacer' ? (
          <div className='header-field'>
            <Input
              type='text'
              label='Header'
              labelFloat
              value={props.block.settings.header}
              valueHandler={gpbsvh('header')}
            />
          </div>
        ) : (
          ''
        )}
        {props.block.settings.header ? (
          <div className='header-level-field'>
            <Input
              type='range'
              label={`Header Level: ${props.block.settings.headerLevel}`}
              min='0'
              max='6'
              value={props.block.settings.headerLevel}
              valueHandler={gpbsvh('headerLevel')}
            />
          </div>
        ) : (
          ''
        )}
        {!props.block.settings.header && props.block.blockType !== 'spacer' ? (
          <div className='pad-field'>
            <Checkbox
              label='Pad'
              checked={props.block.settings.pad}
              valueHandler={gpbsvh('pad')}
            />
          </div>
        ) : (
          ''
        )}
        {props.block.settings.header ? (
          <div>
            <div className='header-theme-field'>
              <Select
                label='Header Theme'
                labelFloat
                value={props.block.settings.headerTheme || 'dark'}
                valueHandler={gpbsvh('headerTheme')}
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
                checked={props.block.settings.headerGradient || false}
                valueHandler={gpbsvh('headerGradient')}
              />
            </div>
          </div>
        ) : (
          ''
        )}
        {props.block.settings.header || props.block.settings.pad ? (
          <div>
            <div className='body-theme-field'>
              <Select
                label='Body Theme'
                labelFloat
                value={props.block.settings.bodyTheme || 'transparent'}
                valueHandler={gpbsvh('bodyTheme')}
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
                checked={props.block.settings.bodyGradient || false}
                valueHandler={gpbsvh('bodyGradient')}
              />
            </div>
            <div className='border-theme-field'>
              <Select
                label='Border Theme'
                labelFloat
                value={props.block.settings.borderTheme || 'dark'}
                valueHandler={gpbsvh('borderTheme')}
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
            label={`Large Monitor Width: ${props.block.settings.xxlWidth} / 12`}
            type='range'
            min='0'
            max='12'
            step='1'
            value={props.block.settings.xxlWidth}
            valueHandler={gpbsvh('xxlWidth')}
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
            valueHandler={gpbsvh('lgWidth')}
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
            valueHandler={gpbsvh('mdWidth')}
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
            valueHandler={gpbsvh('smWidth')}
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
            valueHandler={gpbsvh('xsWidth')}
          />
        </div>
        {props.block.blockType === 'carousel' ? (
          <PageBlockCarouselSettings
            block={props.block}
            contentControl={props.contentControl}
            getContents={props.getContents}
            getContentSettingsValueHandler={
              props.getContentSettingsValueHandler
            }
            getPageBlockSettingsValueHandler={gpbsvh}
          />
        ) : (
          ''
        )}
        {props.block.blockType === 'nav' ? (
          <div>
            <div className='nav-alignment-field'>
              <Select
                label='Alignment'
                labelFloat
                value={props.block.settings.navAlignment}
                valueHandler={gpbsvh('navAlignment')}
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
                labelFloat
                checked={props.block.settings.navCollapsible}
                valueHandler={gpbsvh('navCollapsible')}
              />
            </div>
            <div className='enable-submenus-field'>
              <Checkbox
                label='Enable Submenus'
                checked={props.block.settings.subMenu}
                valueHandler={gpbsvh('subMenu')}
              />
            </div>
          </div>
        ) : (
          ''
        )}
        {props.block.blockType === 'iframe' ? (
          <div>
            <div className='iframe-height-field'>
              <Input
                type='number'
                label='Height'
                labelFloat
                info='If the URL is of the same origin, the frame will be automatically resized to the height of its contents.'
                min='0.0625'
                step='0.0625'
                value={props.block.settings.height || '32'}
                valueHandler={gpbsvh('height')}
              />
            </div>
            <div className='iframe-src-field'>
              <Input
                label='URL'
                labelFloat
                value={props.block.settings.iframeSrc}
                valueHandler={gpbsvh('iframeSrc')}
              />
            </div>
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
              getPageBlockSettingsValueHandler={gpbsvh}
              propsData={props.block.settings.propsData}
            />
          </div>
        ) : (
          ''
        )}
        {props.block.blockType === 'spacer' ? (
          <div>
            <div className='spacer-height-field'>
              <Input
                type='number'
                min='0.0625'
                step='0.0625'
                label='Spacer Height'
                labelFloat
                value={props.block.settings.spacerHeight}
                valueHandler={gpbsvh('spacerHeight')}
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
            value={props.block.settings.customClassName}
            valueHandler={(value) => {
              value = value.toLowerCase().replace(/[^a-z-]/g, '')
              gpbsvh('customClassName')(value)
            }}
          />
        </div>
      </Form>
    </div>
  )
}

PageBlockSettings.propTypes = {
  block: PropTypes.object.isRequired,
  contentControl: PropTypes.func.isRequired,
  getContents: PropTypes.func.isRequired,
  getContentSettingsValueHandler: PropTypes.func.isRequired,
  getPageBlockSettingsValueHandler: PropTypes.func.isRequired,
}

export default PageBlockSettings
