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
                  header='Header/Footer/Jumbotron'
                  headerTheme='dark'
                  className={{ card: 'header-footer-jumbo' }}
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
                  <div className='show-jumbo-field'>
                    <Checkbox
                      label='Show Jumbotron'
                      checked={props.settings.showJumbo}
                      valueHandler={props.getSettingsValueHandler('showJumbo')}
                      readOnly={props.getPageSettingIsUndefined('showJumbo')}
                      onClick={(e) => {
                        overrideSetting('showJumbo')
                      }}
                    />
                    <ResetButton
                      getPageSettingIsUndefined={
                        props.getPageSettingIsUndefined
                      }
                      resetSetting={resetSetting}
                      settingsKey='showJumbo'
                    />
                  </div>
                  {props.settings.showJumbo ? (
                    <div className='jumbo-path-field'>
                      <Input
                        label='Jumbotron Path'
                        info={`By default, every page has a jumbotron subpage automatically created. In order to use the jumbotron specific to this page, enter: ${props.path}jumbo/`}
                        value={props.settings.jumboPath}
                        valueHandler={props.getSettingsValueHandler(
                          'jumboPath'
                        )}
                        readOnly={props.getPageSettingIsUndefined('jumboPath')}
                        onClick={(e) => {
                          overrideSetting('jumboPath')
                        }}
                      />
                      <ResetButton
                        getPageSettingIsUndefined={
                          props.getPageSettingIsUndefined
                        }
                        resetSetting={resetSetting}
                        settingsKey='jumboPath'
                      />
                    </div>
                  ) : (
                    ''
                  )}
                  {props.settings.showJumbo ? (
                    <div className='jumbo-position-field'>
                      <Select
                        label='Jumbotron Position'
                        value={props.settings.jumboPosition}
                        valueHandler={props.getSettingsValueHandler(
                          'jumboPosition'
                        )}
                        readOnly={props.getPageSettingIsUndefined(
                          'jumboPosition'
                        )}
                        onClick={(e) => {
                          overrideSetting('jumboPosition')
                        }}
                      >
                        <option value='above-header'>Above Header</option>
                        <option value='below-header'>Below Header</option>
                      </Select>
                      <ResetButton
                        getPageSettingIsUndefined={
                          props.getPageSettingIsUndefined
                        }
                        resetSetting={resetSetting}
                        settingsKey='jumboPosition'
                      />
                    </div>
                  ) : (
                    ''
                  )}
                </Card>
                <Card
                  header='Theme'
                  headerTheme='dark'
                  className={{
                    card: 'theme-settings',
                  }}
                >
                  <div className='row'>
                    <div className='col-sm-6 body-theme-field'>
                      <Select
                        label='Body Theme'
                        value={props.settings.bodyTheme}
                        valueHandler={props.getSettingsValueHandler(
                          'bodyTheme'
                        )}
                        readOnly={props.getPageSettingIsUndefined('bodyTheme')}
                        onClick={() => {
                          overrideSetting('bodyTheme')
                        }}
                      >
                        <option value=''>Default</option>
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
                      <ResetButton
                        getPageSettingIsUndefined={
                          props.getPageSettingIsUndefined
                        }
                        resetSetting={resetSetting}
                        settingsKey='bodyTheme'
                      />
                    </div>
                    <div className='col-sm-6 main-theme-field'>
                      <Select
                        label='Main Theme'
                        value={props.settings.mainTheme}
                        valueHandler={props.getSettingsValueHandler(
                          'mainTheme'
                        )}
                        readOnly={props.getPageSettingIsUndefined('mainTheme')}
                        onClick={() => {
                          overrideSetting('mainTheme')
                        }}
                      >
                        <option value=''>Default</option>
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
                      <ResetButton
                        getPageSettingIsUndefined={
                          props.getPageSettingIsUndefined
                        }
                        resetSetting={resetSetting}
                        settingsKey='mainTheme'
                      />
                    </div>
                    {['fixed-top'].includes(props.settings.navPosition) ? (
                      <div className='col-sm-6 navbar-theme-field'>
                        <Select
                          label='NavBar Theme'
                          value={props.settings.navbarTheme}
                          valueHandler={props.getSettingsValueHandler(
                            'navbarTheme'
                          )}
                          readOnly={props.getPageSettingIsUndefined(
                            'navbarTheme'
                          )}
                          onClick={() => {
                            overrideSetting('navbarTheme')
                          }}
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
                        <ResetButton
                          getPageSettingIsUndefined={
                            props.getPageSettingIsUndefined
                          }
                          resetSetting={resetSetting}
                          settingsKey='navbarTheme'
                        />
                      </div>
                    ) : (
                      ''
                    )}
                    {['above-header', 'below-header'].includes(
                      props.settings.navPosition
                    ) && props.settings.navType === 'tabs' ? (
                      <div className='col-sm-6 nav-active-tab-theme-field'>
                        <Select
                          label='Active Nav Tab Theme'
                          value={props.settings.navActiveTabTheme || 'white'}
                          valueHandler={props.getSettingsValueHandler(
                            'navActiveTabTheme'
                          )}
                          readOnly={props.getPageSettingIsUndefined(
                            'navActiveTabTheme'
                          )}
                          onClick={() => {
                            overrideSetting('navActiveTabTheme')
                          }}
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
                        <ResetButton
                          getPageSettingIsUndefined={
                            props.getPageSettingIsUndefined
                          }
                          resetSetting={resetSetting}
                          settingsKey='navActiveTabTheme'
                        />
                      </div>
                    ) : (
                      ''
                    )}
                    <div className='col-sm-6 nav-active-submenu-theme-field'>
                      <Select
                        label='Active Submenu Theme'
                        value={
                          props.settings.navActiveSubmenuTheme || 'primary'
                        }
                        valueHandler={props.getSettingsValueHandler(
                          'navActiveSubmenuTheme'
                        )}
                        readOnly={props.getPageSettingIsUndefined(
                          'navActiveSubmenuTheme'
                        )}
                        onClick={() => {
                          overrideSetting('navActiveSubmenuTheme')
                        }}
                      >
                        <option>danger</option>
                        <option>dark</option>
                        <option>info</option>
                        <option>primary</option>
                        <option>secondary</option>
                        <option>success</option>
                        <option>warning</option>
                      </Select>
                      <ResetButton
                        getPageSettingIsUndefined={
                          props.getPageSettingIsUndefined
                        }
                        resetSetting={resetSetting}
                        settingsKey='navActiveSubmenuTheme'
                      />
                    </div>
                    {props.settings.showHeader ||
                    props.settings.navPosition !== 'fixed-top' ? (
                      <div className='col-sm-6 header-theme-field'>
                        <Select
                          label='Header Theme'
                          value={props.settings.headerTheme}
                          valueHandler={props.getSettingsValueHandler(
                            'headerTheme'
                          )}
                          readOnly={props.getPageSettingIsUndefined(
                            'headerTheme'
                          )}
                          onClick={() => {
                            overrideSetting('headerTheme')
                          }}
                        >
                          <option value=''>Default</option>
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
                        <ResetButton
                          getPageSettingIsUndefined={
                            props.getPageSettingIsUndefined
                          }
                          resetSetting={resetSetting}
                          settingsKey='headerTheme'
                        />
                      </div>
                    ) : (
                      ''
                    )}
                    {props.settings.showJumbo ? (
                      <div className='col-sm-6 jumbo-theme-field'>
                        <Select
                          label='Jumbotron Theme'
                          value={props.settings.jumboTheme}
                          valueHandler={props.getSettingsValueHandler(
                            'jumboTheme'
                          )}
                          readOnly={props.getPageSettingIsUndefined(
                            'jumboTheme'
                          )}
                          onClick={() => {
                            overrideSetting('jumboTheme')
                          }}
                        >
                          <option value=''>Default</option>
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
                        <ResetButton
                          getPageSettingIsUndefined={
                            props.getPageSettingIsUndefined
                          }
                          resetSetting={resetSetting}
                          settingsKey='jumboTheme'
                        />
                      </div>
                    ) : (
                      ''
                    )}
                    {props.settings.showFooter ? (
                      <div className='col-sm-6 footer-theme-field'>
                        <Select
                          label='Footer Theme'
                          value={props.settings.footerTheme}
                          valueHandler={props.getSettingsValueHandler(
                            'footerTheme'
                          )}
                          readOnly={props.getPageSettingIsUndefined(
                            'footerTheme'
                          )}
                          onClick={() => {
                            overrideSetting('footerTheme')
                          }}
                        >
                          <option value=''>Default</option>
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
                        <ResetButton
                          getPageSettingIsUndefined={
                            props.getPageSettingIsUndefined
                          }
                          resetSetting={resetSetting}
                          settingsKey='footerTheme'
                        />
                      </div>
                    ) : (
                      ''
                    )}
                  </div>
                  <div className='theme-examples'>
                    <div>Examples</div>
                    <div className='badge bg-danger text-light'>danger</div>
                    <div className='badge bg-dark text-light'>dark</div>
                    <div className='badge bg-info text-light'>info</div>
                    <div className='badge bg-light text-dark'>light</div>
                    <div className='badge bg-primary text-light'>primary</div>
                    <div className='badge bg-secondary text-light'>
                      secondary
                    </div>
                    <div className='badge bg-success text-light'>success</div>
                    <div className='badge bg-warning text-dark'>warning</div>
                    <div className='badge bg-white text-dark'>white</div>
                  </div>
                </Card>
                <Card
                  header='Width'
                  headerTheme='dark'
                  className={{ card: 'width' }}
                >
                  {props.settings.navPosition === 'fixed-top' ? (
                    <div className='top-nav-maxwidth-field'>
                      <Checkbox
                        label='Max Width on Navigation Bar'
                        checked={props.settings.maxWidthNav}
                        valueHandler={props.getSettingsValueHandler(
                          'maxWidthNav'
                        )}
                        readOnly={props.getPageSettingIsUndefined(
                          'maxWidthNav'
                        )}
                        onClick={(e) => {
                          overrideSetting('maxWidthNav')
                        }}
                      />
                      <ResetButton
                        getPageSettingIsUndefined={
                          props.getPageSettingIsUndefined
                        }
                        resetSetting={resetSetting}
                        settingsKey='maxWidthNav'
                      />
                    </div>
                  ) : (
                    ''
                  )}
                  {props.settings.showJumbo ? (
                    <div>
                      <div className='jumbo-container-maxwidth-field'>
                        <Checkbox
                          label='Max Width on Jumbotron Container'
                          checked={props.settings.maxWidthJumboContainer}
                          valueHandler={props.getSettingsValueHandler(
                            'maxWidthJumboContainer'
                          )}
                          readOnly={props.getPageSettingIsUndefined(
                            'maxWidthJumboContainer'
                          )}
                          onClick={(e) => {
                            overrideSetting('maxWidthJumboContainer')
                          }}
                        />
                        <ResetButton
                          getPageSettingIsUndefined={
                            props.getPageSettingIsUndefined
                          }
                          resetSetting={resetSetting}
                          settingsKey='maxWidthJumboContainer'
                        />
                      </div>
                    </div>
                  ) : (
                    ''
                  )}
                  {props.settings.showHeader ||
                  props.settings.navPosition !== 'fixed-top' ? (
                    <div className='header-container-maxwidth-field'>
                      <Checkbox
                        label='Max Width on Header Container'
                        checked={props.settings.maxWidthHeaderContainer}
                        valueHandler={props.getSettingsValueHandler(
                          'maxWidthHeaderContainer'
                        )}
                        readOnly={props.getPageSettingIsUndefined(
                          'maxWidthHeaderContainer'
                        )}
                        onClick={(e) => {
                          overrideSetting('maxWidthHeaderContainer')
                        }}
                      />
                      <ResetButton
                        getPageSettingIsUndefined={
                          props.getPageSettingIsUndefined
                        }
                        resetSetting={resetSetting}
                        settingsKey='maxWidthHeaderContainer'
                      />
                    </div>
                  ) : (
                    ''
                  )}
                  <div className='main-container-maxwidth-field'>
                    <Checkbox
                      label='Max Width on Main Container'
                      checked={props.settings.maxWidthMainContainer}
                      valueHandler={props.getSettingsValueHandler(
                        'maxWidthMainContainer'
                      )}
                      readOnly={props.getPageSettingIsUndefined(
                        'maxWidthMainContainer'
                      )}
                      onClick={(e) => {
                        overrideSetting('maxWidthMainContainer')
                      }}
                    />
                    <ResetButton
                      getPageSettingIsUndefined={
                        props.getPageSettingIsUndefined
                      }
                      resetSetting={resetSetting}
                      settingsKey='maxWidthMainContainer'
                    />
                  </div>
                  {props.settings.showFooter ? (
                    <div className='footer-container-maxwidth-field'>
                      <Checkbox
                        label='Max Width on Footer Container'
                        checked={props.settings.maxWidthFooterContainer}
                        valueHandler={props.getSettingsValueHandler(
                          'maxWidthFooterContainer'
                        )}
                        readOnly={props.getPageSettingIsUndefined(
                          'maxWidthFooterContainer'
                        )}
                        onClick={(e) => {
                          overrideSetting('maxWidthFooterContainer')
                        }}
                      />
                      <ResetButton
                        getPageSettingIsUndefined={
                          props.getPageSettingIsUndefined
                        }
                        resetSetting={resetSetting}
                        settingsKey='maxWidthFooterContainer'
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
