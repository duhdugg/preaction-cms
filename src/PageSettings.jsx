import PropTypes from 'prop-types'
import React from 'react'
import { Alert, Card } from '@preaction/bootstrap-clips'
import { Input, Checkbox, Select } from '@preaction/inputs'
import { MdDelete } from 'react-icons/md'

class PageSettings extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      confirmDelete: false,
    }
  }

  deletePage() {
    if (this.state.confirmDelete) {
      if (this.props.deletePage) {
        this.props.deletePage()
      }
    }
  }

  getValueHandler(key) {
    return (value) => {
      this.setState((state) => {
        state[key] = value
        return state
      })
    }
  }

  get path() {
    const splitPath = Array.from(this.props.path.split('/')).filter((p) => !!p)
    splitPath.splice(splitPath.length - 1, 1, this.props.page.key)
    return '/' + splitPath.join('/') + '/'
  }

  get pathAncestry() {
    const ancestry = []
    const splitPath = Array.from(this.path.split('/')).filter((p) => !!p)
    for (let x = 0; x < splitPath.length - 1; x++) {
      const path = '/' + splitPath.slice(0, x + 1).join('/') + '/'
      ancestry.push(path)
    }
    return ancestry
  }

  overrideSetting(key) {
    if (this.props.getPageSettingIsUndefined(key)) {
      this.props.getSettingsValueHandler(key)(this.props.settings[key])
    }
  }

  resetSetting(key) {
    let isUndefined = this.props.getPageSettingIsUndefined(key)
    if (!isUndefined) {
      this.props.getResetter(key)()
    }
  }

  render() {
    let ResetButton = (props) => {
      let isUndefined = this.props.getPageSettingIsUndefined(props.settingsKey)
      return isUndefined ? (
        ''
      ) : (
        <button
          type='button'
          className='btn btn-sm btn-success'
          style={{ margin: 0, top: '-0.8em', position: 'relative' }}
          onClick={() => {
            this.resetSetting(props.settingsKey)
          }}
        >
          Reset
        </button>
      )
    }

    return (
      <div className='settings-component'>
        {this.props.admin ? (
          <div>
            <form
              className='form ml-3 mr-3'
              onSubmit={(e) => e.preventDefault()}
            >
              <div className='row'>
                <div className='col'>
                  <Alert>
                    <div>
                      <strong>Page-Level Settings</strong>
                    </div>
                    <div>
                      These settings are specific to pages under the current
                      path:
                      {this.props.path}
                    </div>
                    <div className='mt-3'>
                      Navigate to the{' '}
                      <a
                        href={`${this.props.appRoot}/`}
                        onClick={(e) => {
                          e.preventDefault()
                          this.props.navigate('/')
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
                            href={`${this.props.appRoot}/`}
                            onClick={(e) => {
                              e.preventDefault()
                              this.props.navigate(this.props.appRoot + '/')
                            }}
                          >
                            (root page)
                          </a>
                        </li>
                        {this.pathAncestry.map((path, index) => (
                          <li key={index}>
                            <a
                              href={`${this.props.appRoot}${path}`}
                              onClick={(e) => {
                                e.preventDefault()
                                this.props.navigate(path)
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
                      value={this.props.page.title}
                      valueHandler={this.props.getPageValueHandler('title')}
                    />
                  </div>
                  <div className='page-path-field'>
                    <Input
                      label='Page Path'
                      type='text'
                      value={this.props.page.key}
                      valueHandler={this.props.getPageValueHandler('key')}
                    />
                  </div>
                  <div className='full-path-field'>
                    <Input
                      label='Full Path (readonly)'
                      type='text'
                      value={this.path}
                      readOnly={true}
                    />
                  </div>
                  <div className='site-name-field'>
                    <Input
                      label='Site Name'
                      type='text'
                      value={this.props.settings.siteTitle}
                      valueHandler={this.props.getSettingsValueHandler(
                        'siteTitle'
                      )}
                      readOnly={this.props.getPageSettingIsUndefined(
                        'siteTitle'
                      )}
                      onClick={() => {
                        this.overrideSetting('siteTitle')
                      }}
                    />
                    <ResetButton settingsKey='siteTitle' />
                  </div>
                  <Card
                    header='Navigation'
                    headerTheme='dark'
                    className={{ card: 'navigation' }}
                  >
                    <div className='parent-site-field'>
                      <Checkbox
                        label='Parent Site'
                        checked={this.props.settings.site}
                        valueHandler={this.props.getSettingsValueHandler(
                          'site'
                        )}
                      />
                      {this.props.settings.site ? (
                        <Alert level='info'>
                          <strong>Notice:</strong> This setting will cause the
                          navigation menu to behave as if the current page were
                          a top-level site.
                        </Alert>
                      ) : (
                        ''
                      )}
                    </div>
                    <div className='include-page-in-nav-field'>
                      <Checkbox
                        label='Include Page in Navigation'
                        checked={this.props.settings.includeInNav === true}
                        valueHandler={this.props.getSettingsValueHandler(
                          'includeInNav'
                        )}
                      />
                    </div>
                    {this.props.settings.includeInNav ? (
                      <div className='ordering-field'>
                        <Input
                          type='number'
                          step='1'
                          label='Ordering'
                          info="Leave this field empty or at 0 to allow this page's nav item to be sorted alphabetically. Otherwise, you may enter a negative number to force it to appear before other items, or a postive number to force it to appear after other items"
                          placeholder='0'
                          value={this.props.settings.navOrdering}
                          valueHandler={this.props.getSettingsValueHandler(
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
                          value={this.props.settings.navPosition}
                          valueHandler={this.props.getSettingsValueHandler(
                            'navPosition'
                          )}
                          readOnly={this.props.getPageSettingIsUndefined(
                            'navPosition'
                          )}
                          onClick={() => {
                            this.overrideSetting('navPosition')
                          }}
                        >
                          <option value='fixed-top'>Fixed to Top</option>
                          <option value='above-header'>Above Header</option>
                          <option value='below-header'>Below Header</option>
                        </Select>
                        <ResetButton settingsKey='navPosition' />
                      </div>
                      {['above-header', 'below-header'].includes(
                        this.props.settings.navPosition
                      ) ? (
                        <div className='col-sm-6 nav-type-field'>
                          <Select
                            label='Nav Type'
                            value={this.props.settings.navType}
                            valueHandler={this.props.getSettingsValueHandler(
                              'navType'
                            )}
                            readOnly={this.props.getPageSettingIsUndefined(
                              'navType'
                            )}
                            onClick={(e) => {
                              this.overrideSetting('navType')
                            }}
                          >
                            <option>basic</option>
                            <option>tabs</option>
                            <option>pills</option>
                          </Select>
                          <ResetButton settingsKey='navType' />
                        </div>
                      ) : (
                        ''
                      )}
                      {['above-header', 'below-header'].includes(
                        this.props.settings.navPosition
                      ) ? (
                        <div className='col-sm-6 nav-alignment-field'>
                          <Select
                            label='Nav Alignment'
                            value={this.props.settings.navAlignment}
                            valueHandler={this.props.getSettingsValueHandler(
                              'navAlignment'
                            )}
                            readOnly={this.props.getPageSettingIsUndefined(
                              'navAlignment'
                            )}
                            onClick={(e) => {
                              this.overrideSetting('navAlignment')
                            }}
                          >
                            <option>left</option>
                            <option>center</option>
                            <option>right</option>
                          </Select>
                          <ResetButton settingsKey='navAlignment' />
                        </div>
                      ) : (
                        ''
                      )}
                      {['above-header', 'below-header'].includes(
                        this.props.settings.navPosition
                      ) ? (
                        <div className='col-sm-6 nav-spacing-field'>
                          <Select
                            label='Nav Spacing'
                            value={this.props.settings.navSpacing}
                            valueHandler={this.props.getSettingsValueHandler(
                              'navSpacing'
                            )}
                            readOnly={this.props.getPageSettingIsUndefined(
                              'navSpacing'
                            )}
                            onClick={(e) => {
                              this.overrideSetting('navSpacing')
                            }}
                          >
                            <option>normal</option>
                            <option>fill</option>
                            <option>justify</option>
                          </Select>
                          <ResetButton settingsKey='navSpacing' />
                        </div>
                      ) : (
                        ''
                      )}
                      {['above-header', 'below-header'].includes(
                        this.props.settings.navPosition
                      ) ? (
                        <div className='col-sm-6 collapse-nav-field'>
                          <Checkbox
                            label='Collapse nav for smaller screens'
                            checked={this.props.settings.navCollapsible}
                            valueHandler={this.props.getSettingsValueHandler(
                              'navCollapsible'
                            )}
                            readOnly={this.props.getPageSettingIsUndefined(
                              'navCollapsible'
                            )}
                            onClick={(e) => {
                              this.overrideSetting('navCollapsible')
                            }}
                          />
                          <ResetButton settingsKey='navCollapsible' />
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
                        checked={this.props.settings.showHeader}
                        valueHandler={this.props.getSettingsValueHandler(
                          'showHeader'
                        )}
                        readOnly={this.props.getPageSettingIsUndefined(
                          'showHeader'
                        )}
                        onClick={(e) => {
                          this.overrideSetting('showHeader')
                        }}
                      />
                      <ResetButton settingsKey='showHeader' />
                    </div>
                    {this.props.settings.showHeader ? (
                      <div className='header-path-field'>
                        <Input
                          label='Header Path'
                          info={`By default, every page has a header subpage automatically created. In order to use the header specific to this page, enter: ${this.props.path}header/`}
                          value={this.props.settings.headerPath}
                          valueHandler={this.props.getSettingsValueHandler(
                            'headerPath'
                          )}
                          readOnly={this.props.getPageSettingIsUndefined(
                            'headerPath'
                          )}
                          onClick={(e) => {
                            this.overrideSetting('headerPath')
                          }}
                        />
                        <ResetButton settingsKey='headerPath' />
                      </div>
                    ) : (
                      ''
                    )}
                    <div className='show-footer-field'>
                      <Checkbox
                        label='Show Footer'
                        checked={this.props.settings.showFooter}
                        valueHandler={this.props.getSettingsValueHandler(
                          'showFooter'
                        )}
                        readOnly={this.props.getPageSettingIsUndefined(
                          'showFooter'
                        )}
                        onClick={(e) => {
                          this.overrideSetting('showFooter')
                        }}
                      />
                      <ResetButton settingsKey='showFooter' />
                    </div>
                    {this.props.settings.showFooter ? (
                      <div className='footer-path-field'>
                        <Input
                          label='Footer Path'
                          info={`By default, every page has a footer subpage automatically created. In order to use the footer specific to this page, enter: ${this.props.path}footer/`}
                          value={this.props.settings.footerPath}
                          valueHandler={this.props.getSettingsValueHandler(
                            'footerPath'
                          )}
                          readOnly={this.props.getPageSettingIsUndefined(
                            'footerPath'
                          )}
                          onClick={(e) => {
                            this.overrideSetting('footerPath')
                          }}
                        />
                        <ResetButton settingsKey='footerPath' />
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
                  checked={this.state.confirmDelete}
                  valueHandler={this.getValueHandler('confirmDelete')}
                />
                <button
                  type='button'
                  className='btn btn-danger'
                  onClick={this.deletePage.bind(this)}
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
