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
                        if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
                          e.preventDefault()
                          props.navigate('/')
                        }
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
                            if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
                              e.preventDefault()
                              props.navigate(props.appRoot + '/')
                            }
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
                              if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
                                e.preventDefault()
                                props.navigate(path)
                              }
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
                    labelFloat
                    type='text'
                    value={props.page.title}
                    valueHandler={props.getPageValueHandler('title')}
                  />
                </div>
                <div className='page-path-field'>
                  <Input
                    label='Page Path'
                    labelFloat
                    type='text'
                    value={props.page.key}
                    valueHandler={props.getPageValueHandler('key')}
                  />
                </div>
                <div className='full-path-field'>
                  <Input
                    label='Full Path (readonly)'
                    labelFloat
                    type='text'
                    value={path}
                    readOnly={true}
                  />
                </div>
                <div className='site-name-field'>
                  <Input
                    label='Site Name'
                    labelFloat
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
                <div className='meta-description-field'>
                  <Input
                    label='Meta Description'
                    labelFloat
                    type='text'
                    maxLength='160'
                    value={props.settings.metaDescription}
                    valueHandler={props.getSettingsValueHandler(
                      'metaDescription'
                    )}
                    readOnly={props.getPageSettingIsUndefined(
                      'metaDescription'
                    )}
                    onClick={() => {
                      overrideSetting('metaDescription')
                    }}
                  />
                  <ResetButton
                    getPageSettingIsUndefined={props.getPageSettingIsUndefined}
                    resetSetting={resetSetting}
                    settingsKey='metaDescription'
                  />
                </div>
                <Card
                  header='Navigation'
                  headerTheme='dark'
                  className='navigation'
                >
                  <div className='parent-site-field'>
                    <Checkbox
                      label='Parent Site'
                      checked={props.settings.site}
                      valueHandler={props.getSettingsValueHandler('site')}
                    />
                    {props.settings.site ? (
                      <Alert>
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
                    <div>
                      <div className='ordering-field'>
                        <Input
                          label='Nav Link Name'
                          placeholder={props.page.title}
                          value={props.settings.navLinkName}
                          valueHandler={props.getSettingsValueHandler(
                            'navLinkName'
                          )}
                        />
                        <Input
                          type='number'
                          step='1'
                          label='Ordering'
                          labelFloat
                          info="Leave this field empty or at 0 to allow this page's nav item to be sorted alphabetically. Otherwise, you may enter a negative number to force it to appear before other items, or a postive number to force it to appear after other items"
                          placeholder='0'
                          value={props.settings.navOrdering}
                          valueHandler={props.getSettingsValueHandler(
                            'navOrdering'
                          )}
                        />
                      </div>
                    </div>
                  ) : (
                    ''
                  )}
                  <div className='row'>
                    <div className='col-sm-6 nav-position-field'>
                      <Select
                        label='Nav Position'
                        labelFloat
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
                          labelFloat
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
                          labelFloat
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
                          labelFloat
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
                  <div className='row'>
                    <div className='col-sm-6 absolute-nav-behavior-field'>
                      <Select
                        label='Absolute URL Behavior'
                        labelFloat
                        value={props.settings.absoluteNavBehavior}
                        valueHandler={props.getSettingsValueHandler(
                          'absoluteNavBehavior'
                        )}
                        readOnly={props.getPageSettingIsUndefined(
                          'absoluteNavBehavior'
                        )}
                        onClick={(e) => {
                          overrideSetting('absoluteNavBehavior')
                        }}
                      >
                        <option value='same-window'>Open in Same Window</option>
                        <option value='new-window'>Open in New Window</option>
                      </Select>
                      <ResetButton
                        getPageSettingIsUndefined={
                          props.getPageSettingIsUndefined
                        }
                        resetSetting={resetSetting}
                        settingsKey='absoluteNavBehavior'
                      />
                    </div>
                  </div>
                </Card>
                <Card
                  header='Header/Footer/Hero'
                  headerTheme='dark'
                  className='header-footer-hero'
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
                        labelFloat
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
                        labelFloat
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
                  <div className='show-hero-field'>
                    <Checkbox
                      label='Show Hero'
                      checked={props.settings.showHero}
                      valueHandler={props.getSettingsValueHandler('showHero')}
                      readOnly={props.getPageSettingIsUndefined('showHero')}
                      onClick={(e) => {
                        overrideSetting('showHero')
                      }}
                    />
                    <ResetButton
                      getPageSettingIsUndefined={
                        props.getPageSettingIsUndefined
                      }
                      resetSetting={resetSetting}
                      settingsKey='showHero'
                    />
                  </div>
                  {props.settings.showHero ? (
                    <div className='hero-path-field'>
                      <Input
                        label='Hero Path'
                        labelFloat
                        info={`By default, every page has a hero subpage automatically created. In order to use the hero specific to this page, enter: ${props.path}hero/`}
                        value={props.settings.heroPath}
                        valueHandler={props.getSettingsValueHandler('heroPath')}
                        readOnly={props.getPageSettingIsUndefined('heroPath')}
                        onClick={(e) => {
                          overrideSetting('heroPath')
                        }}
                      />
                      <ResetButton
                        getPageSettingIsUndefined={
                          props.getPageSettingIsUndefined
                        }
                        resetSetting={resetSetting}
                        settingsKey='heroPath'
                      />
                    </div>
                  ) : (
                    ''
                  )}
                  {props.settings.showHero ? (
                    <div className='hero-position-field'>
                      <Select
                        label='Hero Position'
                        labelFloat
                        value={props.settings.heroPosition}
                        valueHandler={props.getSettingsValueHandler(
                          'heroPosition'
                        )}
                        readOnly={props.getPageSettingIsUndefined(
                          'heroPosition'
                        )}
                        onClick={(e) => {
                          overrideSetting('heroPosition')
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
                        settingsKey='heroPosition'
                      />
                    </div>
                  ) : (
                    ''
                  )}
                </Card>
                <Card
                  header='Theme'
                  headerTheme='dark'
                  className='theme-settings'
                >
                  <div className='row'>
                    <div className='col-sm-6 body-theme-field-group'>
                      <div className='body-theme-field'>
                        <Select
                          label='Body Theme'
                          labelFloat
                          value={props.settings.bodyTheme}
                          valueHandler={props.getSettingsValueHandler(
                            'bodyTheme'
                          )}
                          readOnly={props.getPageSettingIsUndefined(
                            'bodyTheme'
                          )}
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
                      <div className='body-gradient-field'>
                        <Checkbox
                          label='Body Gradient'
                          checked={props.settings.bodyGradient || false}
                          valueHandler={props.getSettingsValueHandler(
                            'bodyGradient'
                          )}
                          readOnly={props.getPageSettingIsUndefined(
                            'bodyGradient'
                          )}
                          onClick={() => {
                            overrideSetting('bodyGradient')
                          }}
                        />
                        <ResetButton
                          getPageSettingIsUndefined={
                            props.getPageSettingIsUndefined
                          }
                          resetSetting={resetSetting}
                          settingsKey='bodyGradient'
                        />
                      </div>
                    </div>
                    <div className='col-sm-6 main-theme-field-group'>
                      <div className='main-theme-field'>
                        <Select
                          label='Main Theme'
                          labelFloat
                          value={props.settings.mainTheme}
                          valueHandler={props.getSettingsValueHandler(
                            'mainTheme'
                          )}
                          readOnly={props.getPageSettingIsUndefined(
                            'mainTheme'
                          )}
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
                      <div className='main-gradient-field'>
                        <Checkbox
                          label='Main Gradient'
                          checked={props.settings.mainGradient || false}
                          valueHandler={props.getSettingsValueHandler(
                            'mainGradient'
                          )}
                          readOnly={props.getPageSettingIsUndefined(
                            'mainGradient'
                          )}
                          onClick={() => {
                            overrideSetting('mainGradient')
                          }}
                        />
                        <ResetButton
                          getPageSettingIsUndefined={
                            props.getPageSettingIsUndefined
                          }
                          resetSetting={resetSetting}
                          settingsKey='mainGradient'
                        />
                      </div>
                    </div>
                    {['fixed-top'].includes(props.settings.navPosition) ? (
                      <div className='col-sm-6 navbar-theme-field'>
                        <Select
                          label='NavBar Theme'
                          labelFloat
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
                          labelFloat
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
                        labelFloat
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
                      <div className='col-sm-6 header-theme-field-group'>
                        <div className='header-theme-field'>
                          <Select
                            label='Header Theme'
                            labelFloat
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
                        <div className='header-gradient-field'>
                          <Checkbox
                            label='Header Gradient'
                            checked={props.settings.headerGradient || false}
                            valueHandler={props.getSettingsValueHandler(
                              'headerGradient'
                            )}
                            readOnly={props.getPageSettingIsUndefined(
                              'headerGradient'
                            )}
                            onClick={() => {
                              overrideSetting('headerGradient')
                            }}
                          />
                          <ResetButton
                            getPageSettingIsUndefined={
                              props.getPageSettingIsUndefined
                            }
                            resetSetting={resetSetting}
                            settingsKey='headerGradient'
                          />
                        </div>
                      </div>
                    ) : (
                      ''
                    )}
                    {props.settings.showHero ? (
                      <div className='col-sm-6 hero-theme-field-group'>
                        <div className='hero-theme-field'>
                          <Select
                            label='Hero Theme'
                            labelFloat
                            value={props.settings.heroTheme}
                            valueHandler={props.getSettingsValueHandler(
                              'heroTheme'
                            )}
                            readOnly={props.getPageSettingIsUndefined(
                              'heroTheme'
                            )}
                            onClick={() => {
                              overrideSetting('heroTheme')
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
                            settingsKey='heroTheme'
                          />
                        </div>
                        <div className='hero-gradient-field'>
                          <Checkbox
                            label='Hero Gradient'
                            checked={props.settings.heroGradient || false}
                            valueHandler={props.getSettingsValueHandler(
                              'heroGradient'
                            )}
                            readOnly={props.getPageSettingIsUndefined(
                              'heroGradient'
                            )}
                            onClick={() => {
                              overrideSetting('heroGradient')
                            }}
                          />
                          <ResetButton
                            getPageSettingIsUndefined={
                              props.getPageSettingIsUndefined
                            }
                            resetSetting={resetSetting}
                            settingsKey='heroGradient'
                          />
                        </div>
                      </div>
                    ) : (
                      ''
                    )}
                    {props.settings.showFooter ? (
                      <div className='col-sm-6 footer-theme-field-group'>
                        <div className='footer-theme-field'>
                          <Select
                            label='Footer Theme'
                            labelFloat
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
                        <div className='footer-gradient-field'>
                          <Checkbox
                            label='Footer Gradient'
                            checked={props.settings.footerGradient || false}
                            valueHandler={props.getSettingsValueHandler(
                              'footerGradient'
                            )}
                            readOnly={props.getPageSettingIsUndefined(
                              'footerGradient'
                            )}
                            onClick={() => {
                              overrideSetting('footerGradient')
                            }}
                          />
                          <ResetButton
                            getPageSettingIsUndefined={
                              props.getPageSettingIsUndefined
                            }
                            resetSetting={resetSetting}
                            settingsKey='footerGradient'
                          />
                        </div>
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
                <Card header='Width' headerTheme='dark' className='width'>
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
                  {props.settings.showHero ? (
                    <div>
                      <div className='hero-container-maxwidth-field'>
                        <Checkbox
                          label='Max Width on Hero Container'
                          checked={props.settings.maxWidthHeroContainer}
                          valueHandler={props.getSettingsValueHandler(
                            'maxWidthHeroContainer'
                          )}
                          readOnly={props.getPageSettingIsUndefined(
                            'maxWidthHeroContainer'
                          )}
                          onClick={(e) => {
                            overrideSetting('maxWidthHeroContainer')
                          }}
                        />
                        <ResetButton
                          getPageSettingIsUndefined={
                            props.getPageSettingIsUndefined
                          }
                          resetSetting={resetSetting}
                          settingsKey='maxWidthHeroContainer'
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
              className='delete-page'
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
  navigate: PropTypes.func.isRequired,
  page: PropTypes.object.isRequired,
  pageId: PropTypes.number.isRequired,
  path: PropTypes.string.isRequired,
  settings: PropTypes.object.isRequired,
  token: PropTypes.string,
}

export default PageSettings
