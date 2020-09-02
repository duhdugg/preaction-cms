import PropTypes from 'prop-types'
import React from 'react'
import { Alert, Card } from '@preaction/bootstrap-clips'
import { Input, Checkbox, Select } from '@preaction/inputs'
import { MdDelete } from 'react-icons/md'

function ResetButton(props) {
  const isUndefined = props.getPageSettingIsUndefined(props.settingsKey)
  return isUndefined ? (
    ''
  ) : (
    <button
      type='button'
      className='btn btn-sm btn-success'
      style={{ margin: 0, top: '-0.8em', position: 'relative' }}
      onClick={() => {
        props.resetSetting(props.settingsKey)
      }}
    >
      Reset
    </button>
  )
}

ResetButton.propTypes = {
  getPageSettingIsUndefined: PropTypes.func.isRequired,
  resetSetting: PropTypes.func.isRequired,
  settingsKey: PropTypes.string.isRequired,
}

function PageSettings(props) {
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  const deletePage = () => {
    if (confirmDelete && props.deletePage) {
      props.deletePage()
    }
  }

  const getPath = () => {
    const splitPath = Array.from(props.path.split('/')).filter((p) => !!p)
    splitPath.splice(splitPath.length - 1, 1, props.page.key)
    return '/' + splitPath.join('/') + '/'
  }

  const getPathAncestry = () => {
    const ancestry = []
    const splitPath = Array.from(path.split('/')).filter((p) => !!p)
    for (let x = 0; x < splitPath.length - 1; x++) {
      const path = '/' + splitPath.slice(0, x + 1).join('/') + '/'
      ancestry.push(path)
    }
    return ancestry
  }

  const overrideSetting = (key) => {
    if (props.getPageSettingIsUndefined(key)) {
      props.getSettingsValueHandler(key)(props.settings[key])
    }
  }

  const resetSetting = (key) => {
    let isUndefined = props.getPageSettingIsUndefined(key)
    if (!isUndefined) {
      props.getResetter(key)()
    }
  }

  const path = getPath()
  const pathAncestry = getPathAncestry()

  return (
    <div className='settings-component'>
      {props.admin ? (
        <div>
          <form className='form ml-3 mr-3' onSubmit={(e) => e.preventDefault()}>
            <div className='row'>
              <div className='col'>
                <Alert>
                  <div>
                    <strong>Page-Level Settings</strong>
                  </div>
                  <div>
                    These settings are specific to pages under the current path:
                    {props.path}
                  </div>
                  <div className='mt-3'>
                    Navigate to the{' '}
                    <a
                      href={`${props.appRoot}/`}
                      onClick={(e) => {
                        e.preventDefault()
                        props.navigate('/')
                      }}
                    >
                      root page
                    </a>{' '}
                    and click <strong>Settings</strong> to change site-level
                    settings.
                  </div>
                  <div className='mt-3'>
                    Defaults for this page are inherited from the following
                    parent pages (in this order):
                    <ol>
                      <li>
                        <a
                          href={`${props.appRoot}/`}
                          onClick={(e) => {
                            e.preventDefault()
                            props.navigate(props.appRoot + '/')
                          }}
                        >
                          (root page)
                        </a>
                      </li>
                      {pathAncestry.map((path, index) => (
                        <li key={index}>
                          <a
                            href={`${props.appRoot}${path}`}
                            onClick={(e) => {
                              e.preventDefault()
                              props.navigate(path)
                            }}
                          >
                            {path}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </div>
                </Alert>
                <div className='page-title-field'>
                  <Input
                    label='Page Title'
                    type='text'
                    value={props.page.title}
                    valueHandler={props.getPageValueHandler('title')}
                  />
                </div>
                <div className='page-path-field'>
                  <Input
                    label='Page Path'
                    type='text'
                    value={props.page.key}
                    valueHandler={props.getPageValueHandler('key')}
                  />
                </div>
                <div className='full-path-field'>
                  <Input
                    label='Full Path (readonly)'
                    type='text'
                    value={path}
                    readOnly={true}
                  />
                </div>
                <div className='site-name-field'>
                  <Input
                    label='Site Name'
                    type='text'
                    value={props.settings.siteTitle}
                    valueHandler={props.getSettingsValueHandler('siteTitle')}
                    readOnly={props.getPageSettingIsUndefined('siteTitle')}
                    onClick={() => {
                      overrideSetting('siteTitle')
                    }}
                  />
                  <ResetButton
                    getPageSettingIsUndefined={props.getPageSettingIsUndefined}
                    resetSetting={resetSetting}
                    settingsKey='siteTitle'
                  />
                </div>
                <Card
                  header='Navigation'
                  headerTheme='dark'
                  className={{ card: 'navigation' }}
                >
                  <div className='parent-site-field'>
                    <Checkbox
                      label='Parent Site'
                      checked={props.settings.site}
                      valueHandler={props.getSettingsValueHandler('site')}
                    />
                    {props.settings.site ? (
                      <Alert level='info'>
                        <strong>Notice:</strong> This setting will cause the
                        navigation menu to behave as if the current page were a
                        top-level site.
                      </Alert>
                    ) : (
                      ''
                    )}
                  </div>
                  <div className='include-page-in-nav-field'>
                    <Checkbox
                      label='Include Page in Navigation'
                      checked={props.settings.includeInNav === true}
                      valueHandler={props.getSettingsValueHandler(
                        'includeInNav'
                      )}
                    />
                  </div>
                  {props.settings.includeInNav ? (
                    <div className='ordering-field'>
                      <Input
                        type='number'
                        step='1'
                        label='Ordering'
                        info="Leave this field empty or at 0 to allow this page's nav item to be sorted alphabetically. Otherwise, you may enter a negative number to force it to appear before other items, or a postive number to force it to appear after other items"
                        placeholder='0'
                        value={props.settings.navOrdering}
                        valueHandler={props.getSettingsValueHandler(
                          'navOrdering'
                        )}
                      />
                    </div>
                  ) : (
                    ''
                  )}
                  <div className='row'>
                    <div className='col-sm-6 nav-position-field'>
                      <Select
                        label='Nav Position'
                        value={props.settings.navPosition}
                        valueHandler={props.getSettingsValueHandler(
                          'navPosition'
                        )}
                        readOnly={props.getPageSettingIsUndefined(
                          'navPosition'
                        )}
                        onClick={() => {
                          overrideSetting('navPosition')
                        }}
                      >
                        <option value='fixed-top'>Fixed to Top</option>
                        <option value='above-header'>Above Header</option>
                        <option value='below-header'>Below Header</option>
                      </Select>
                      <ResetButton
                        getPageSettingIsUndefined={
                          props.getPageSettingIsUndefined
                        }
                        resetSetting={resetSetting}
                        settingsKey='navPosition'
                      />
                    </div>
                    {['above-header', 'below-header'].includes(
                      props.settings.navPosition
                    ) ? (
                      <div className='col-sm-6 nav-type-field'>
                        <Select
                          label='Nav Type'
                          value={props.settings.navType}
                          valueHandler={props.getSettingsValueHandler(
                            'navType'
                          )}
                          readOnly={props.getPageSettingIsUndefined('navType')}
                          onClick={(e) => {
                            overrideSetting('navType')
                          }}
                        >
                          <option>basic</option>
                          <option>tabs</option>
                          <option>pills</option>
                        </Select>
                        <ResetButton
                          getPageSettingIsUndefined={
                            props.getPageSettingIsUndefined
                          }
                          resetSetting={resetSetting}
                          settingsKey='navType'
                        />
                      </div>
                    ) : (
                      ''
                    )}
                    {['above-header', 'below-header'].includes(
                      props.settings.navPosition
                    ) ? (
                      <div className='col-sm-6 nav-alignment-field'>
                        <Select
                          label='Nav Alignment'
                          value={props.settings.navAlignment}
                          valueHandler={props.getSettingsValueHandler(
                            'navAlignment'
                          )}
                          readOnly={props.getPageSettingIsUndefined(
                            'navAlignment'
                          )}
                          onClick={(e) => {
                            overrideSetting('navAlignment')
                          }}
                        >
                          <option>left</option>
                          <option>center</option>
                          <option>right</option>
                        </Select>
                        <ResetButton
                          getPageSettingIsUndefined={
                            props.getPageSettingIsUndefined
                          }
                          resetSetting={resetSetting}
                          settingsKey='navAlignment'
                        />
                      </div>
                    ) : (
                      ''
                    )}
                    {['above-header', 'below-header'].includes(
                      props.settings.navPosition
                    ) ? (
                      <div className='col-sm-6 nav-spacing-field'>
                        <Select
                          label='Nav Spacing'
                          value={props.settings.navSpacing}
                          valueHandler={props.getSettingsValueHandler(
                            'navSpacing'
                          )}
                          readOnly={props.getPageSettingIsUndefined(
                            'navSpacing'
                          )}
                          onClick={(e) => {
                            overrideSetting('navSpacing')
                          }}
                        >
                          <option>normal</option>
                          <option>fill</option>
                          <option>justify</option>
                        </Select>
                        <ResetButton
                          getPageSettingIsUndefined={
                            props.getPageSettingIsUndefined
                          }
                          resetSetting={resetSetting}
                          settingsKey='navSpacing'
                        />
                      </div>
                    ) : (
                      ''
                    )}
                    {['above-header', 'below-header'].includes(
                      props.settings.navPosition
                    ) ? (
                      <div className='col-sm-6 collapse-nav-field'>
                        <Checkbox
                          label='Collapse nav for smaller screens'
                          checked={props.settings.navCollapsible}
                          valueHandler={props.getSettingsValueHandler(
                            'navCollapsible'
                          )}
                          readOnly={props.getPageSettingIsUndefined(
                            'navCollapsible'
                          )}
                          onClick={(e) => {
                            overrideSetting('navCollapsible')
                          }}
                        />
                        <ResetButton
                          getPageSettingIsUndefined={
                            props.getPageSettingIsUndefined
                          }
                          resetSetting={resetSetting}
                          settingsKey='navCollapsible'
                        />
                      </div>
                    ) : (
                      ''
                    )}
                  </div>
                </Card>
                <Card
                  header='Header/Footer'
                  headerTheme='dark'
                  className={{ card: 'header-footer' }}
                >
                  <div className='show-header-field'>
                    <Checkbox
                      label='Show Header'
                      checked={props.settings.showHeader}
                      valueHandler={props.getSettingsValueHandler('showHeader')}
                      readOnly={props.getPageSettingIsUndefined('showHeader')}
                      onClick={(e) => {
                        overrideSetting('showHeader')
                      }}
                    />
                    <ResetButton
                      getPageSettingIsUndefined={
                        props.getPageSettingIsUndefined
                      }
                      resetSetting={resetSetting}
                      settingsKey='showHeader'
                    />
                  </div>
                  {props.settings.showHeader ? (
                    <div className='header-path-field'>
                      <Input
                        label='Header Path'
                        info={`By default, every page has a header subpage automatically created. In order to use the header specific to this page, enter: ${props.path}header/`}
                        value={props.settings.headerPath}
                        valueHandler={props.getSettingsValueHandler(
                          'headerPath'
                        )}
                        readOnly={props.getPageSettingIsUndefined('headerPath')}
                        onClick={(e) => {
                          overrideSetting('headerPath')
                        }}
                      />
                      <ResetButton
                        getPageSettingIsUndefined={
                          props.getPageSettingIsUndefined
                        }
                        resetSetting={resetSetting}
                        settingsKey='headerPath'
                      />
                    </div>
                  ) : (
                    ''
                  )}
                  <div className='show-footer-field'>
                    <Checkbox
                      label='Show Footer'
                      checked={props.settings.showFooter}
                      valueHandler={props.getSettingsValueHandler('showFooter')}
                      readOnly={props.getPageSettingIsUndefined('showFooter')}
                      onClick={(e) => {
                        overrideSetting('showFooter')
                      }}
                    />
                    <ResetButton
                      getPageSettingIsUndefined={
                        props.getPageSettingIsUndefined
                      }
                      resetSetting={resetSetting}
                      settingsKey='showFooter'
                    />
                  </div>
                  {props.settings.showFooter ? (
                    <div className='footer-path-field'>
                      <Input
                        label='Footer Path'
                        info={`By default, every page has a footer subpage automatically created. In order to use the footer specific to this page, enter: ${props.path}footer/`}
                        value={props.settings.footerPath}
                        valueHandler={props.getSettingsValueHandler(
                          'footerPath'
                        )}
                        readOnly={props.getPageSettingIsUndefined('footerPath')}
                        onClick={(e) => {
                          overrideSetting('footerPath')
                        }}
                      />
                      <ResetButton
                        getPageSettingIsUndefined={
                          props.getPageSettingIsUndefined
                        }
                        resetSetting={resetSetting}
                        settingsKey='footerPath'
                      />
                    </div>
                  ) : (
                    ''
                  )}
                </Card>
              </div>
            </div>
            <Card
              header='Delete Page'
              headerTheme='red'
              className={{ card: 'delete-page' }}
            >
              <Checkbox
                label='Confirm to delete this page'
                checked={confirmDelete}
                valueHandler={setConfirmDelete}
              />
              <button
                type='button'
                className='btn btn-danger'
                onClick={deletePage}
              >
                <MdDelete /> Delete Page
              </button>
            </Card>
          </form>
        </div>
      ) : (
        ''
      )}
    </div>
  )
}

PageSettings.propTypes = {
  admin: PropTypes.bool,
  appRoot: PropTypes.string.isRequired,
  deletePage: PropTypes.func,
  getPageSettingIsUndefined: PropTypes.func.isRequired,
  getPageValueHandler: PropTypes.func.isRequired,
  getResetter: PropTypes.func.isRequired,
  getSettingsValueHandler: PropTypes.func.isRequired,
  hide: PropTypes.array,
  navigate: PropTypes.func.isRequired,
  page: PropTypes.object.isRequired,
  pageId: PropTypes.number.isRequired,
  path: PropTypes.string.isRequired,
  settings: PropTypes.object.isRequired,
  site: PropTypes.bool,
  token: PropTypes.string,
}

export default PageSettings
