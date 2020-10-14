import PropTypes from 'prop-types'
import React from 'react'
import { Checkbox, Form, Input, Select } from '@preaction/inputs'
import { PageBlockExtension } from './PageBlockExtension.jsx'
import { blockExtensions } from './ext'
import PageBlockCarouselSettings from './PageBlockCarouselSettings.jsx'

function PageBlockSettings(props) {
  const getPageBlockSettingsValueHandler = (key) => {
    return props.getPageBlockSettingsValueHandler(props.block.id, key)
  }

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
              value={props.block.settings.header}
              valueHandler={getPageBlockSettingsValueHandler('header')}
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
              valueHandler={getPageBlockSettingsValueHandler('headerLevel')}
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
              valueHandler={getPageBlockSettingsValueHandler('pad')}
            />
          </div>
        ) : (
          ''
        )}
        {props.block.settings.header ? (
          <div className='header-theme-field'>
            <Select
              label='Header Theme'
              value={props.block.settings.headerTheme || 'dark'}
              valueHandler={getPageBlockSettingsValueHandler('headerTheme')}
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
        {props.block.settings.header || props.block.settings.pad ? (
          <div>
            <div className='body-theme-field'>
              <Select
                label='Body Theme'
                value={props.block.settings.bodyTheme || 'transparent'}
                valueHandler={getPageBlockSettingsValueHandler('bodyTheme')}
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
            <div className='border-theme-field'>
              <Select
                label='Border Theme'
                value={props.block.settings.borderTheme || 'dark'}
                valueHandler={getPageBlockSettingsValueHandler('borderTheme')}
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
        {props.block.blockType === 'carousel' ? (
          <PageBlockCarouselSettings
            block={props.block}
            contentControl={props.contentControl}
            getContents={props.getContents}
            getContentSettingsValueHandler={
              props.getContentSettingsValueHandler
            }
            getPageBlockSettingsValueHandler={getPageBlockSettingsValueHandler}
          />
        ) : (
          ''
        )}
        {props.block.blockType === 'nav' ? (
          <div>
            <div className='nav-alignment-field'>
              <Select
                label='Alignment'
                value={props.block.settings.navAlignment}
                valueHandler={getPageBlockSettingsValueHandler('navAlignment')}
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
          <div>
            <div className='iframe-height-field'>
              <Input
                type='number'
                label='Height'
                info='If the URL is of the same origin, the frame will be automatically resized to the height of its contents.'
                min='0.0625'
                step='0.0625'
                value={props.block.settings.height || '32'}
                valueHandler={getPageBlockSettingsValueHandler('height')}
              />
            </div>
            <div className='iframe-src-field'>
              <Input
                label='URL'
                value={props.block.settings.iframeSrc}
                valueHandler={getPageBlockSettingsValueHandler('iframeSrc')}
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
              getPageBlockSettingsValueHandler={
                getPageBlockSettingsValueHandler
              }
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
                value={props.block.settings.spacerHeight}
                valueHandler={getPageBlockSettingsValueHandler('spacerHeight')}
              />
            </div>
          </div>
        ) : (
          ''
        )}
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
