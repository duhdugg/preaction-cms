import PropTypes from 'prop-types'
import React from 'react'
import axios from 'axios'
import { Card, Spinner } from '@preaction/bootstrap-clips'
import { Input, Checkbox, Select, Textarea } from '@preaction/inputs'
import { getRgbaFromSettings } from './lib/getRgba.js'
import { MdDelete } from 'react-icons/md'

class PageSettings extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      confirmDelete: false,
      uploadingBg: false,
    }
    this.uploadBgForm = React.createRef()
    this.bgFileInput = React.createRef()
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
    let splitPath = Array.from(this.props.path.split('/')).filter((p) => {
      return p ? true : false
    })
    splitPath.splice(splitPath.length - 1, 1, this.props.page.key)
    return '/' + splitPath.join('/') + '/'
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
                  <Input
                    label='Page Title'
                    type='text'
                    value={this.props.page.title}
                    valueHandler={this.props.getPageValueHandler('title')}
                  />
                  <Input
                    label='Page Path'
                    type='text'
                    value={this.props.page.key}
                    valueHandler={this.props.getPageValueHandler('key')}
                  />
                  <Input
                    label='Full Path (readonly)'
                    type='text'
                    value={this.path}
                    readOnly={true}
                  />
                  <Input
                    label='Site Name'
                    type='text'
                    value={this.props.settings.siteTitle}
                    valueHandler={this.props.getSettingsValueHandler(
                      'siteTitle'
                    )}
                    readOnly={this.props.getPageSettingIsUndefined('siteTitle')}
                    onClick={() => {
                      this.overrideSetting('siteTitle')
                    }}
                  />
                  <ResetButton settingsKey='siteTitle' />
                  <Checkbox
                    label='Max Width Layout'
                    checked={this.props.settings.maxWidthLayout}
                    valueHandler={this.props.getSettingsValueHandler(
                      'maxWidthLayout'
                    )}
                    readOnly={this.props.getPageSettingIsUndefined(
                      'maxWidthLayout'
                    )}
                    onClick={() => {
                      this.overrideSetting('maxWidthLayout')
                    }}
                  />
                  <ResetButton settingsKey='maxWidthLayout' />
                  <Card
                    header='Navigation'
                    headerTheme='dark'
                    style={{
                      card: {
                        backgroundColor: 'transparent',
                      },
                    }}
                  >
                    <Checkbox
                      label='Parent Site'
                      checked={this.props.settings.site}
                      valueHandler={this.props.getSettingsValueHandler('site')}
                    />
                    <Checkbox
                      label='Include Page in Navigation'
                      checked={this.props.settings.includeInNav === true}
                      valueHandler={this.props.getSettingsValueHandler(
                        'includeInNav'
                      )}
                    />
                    {this.props.settings.includeInNav ? (
                      <Input
                        type='number'
                        step='1'
                        label='Ordering'
                        placeholder='0'
                        value={this.props.settings.navOrdering}
                        valueHandler={this.props.getSettingsValueHandler(
                          'navOrdering'
                        )}
                      />
                    ) : (
                      ''
                    )}
                    <div className='row'>
                      <div className='col-sm-6'>
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
                      {this.props.settings.navPosition === 'fixed-top' ? (
                        <div className='col-sm-6'>
                          <Select
                            label='Nav Theme'
                            value={this.props.settings.navTheme}
                            valueHandler={this.props.getSettingsValueHandler(
                              'navTheme'
                            )}
                            readOnly={this.props.getPageSettingIsUndefined(
                              'navTheme'
                            )}
                          >
                            <option value='light'>Light</option>
                            <option value='dark'>Dark</option>
                          </Select>
                          <ResetButton settingsKey='navTheme' />
                        </div>
                      ) : (
                        ''
                      )}
                      {['above-header', 'below-header'].includes(
                        this.props.settings.navPosition
                      ) ? (
                        <div className='col-sm-6'>
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
                        <div className='col-sm-6'>
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
                        <div className='col-sm-6'>
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
                        <div className='col-sm-6'>
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
                      <div className='col-12'>
                        <Input
                          label='Nav Class Name'
                          value={this.props.settings.navClassName}
                          valueHandler={this.props.getSettingsValueHandler(
                            'navClassName'
                          )}
                          readOnly={this.props.getPageSettingIsUndefined(
                            'navClassName'
                          )}
                          onClick={(e) => {
                            this.overrideSetting('navClassName')
                          }}
                        />
                        <ResetButton settingsKey='navClassName' />
                      </div>
                    </div>
                  </Card>
                  <Card header='Header/Footer' headerTheme='light'>
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
                    {this.props.settings.showHeader ? (
                      <div>
                        <Input
                          label='Header Path'
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
                    {this.props.settings.showFooter ? (
                      <div>
                        <Input
                          label='Header Path'
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
              <div className='row'>
                <Card
                  header='Background'
                  column
                  width={1 / 2}
                  headerTheme='green'
                  style={{
                    card: {
                      backgroundColor: 'transparent',
                    },
                  }}
                >
                  <Checkbox
                    label='Use Background Image'
                    checked={this.props.settings.useBgImage}
                    valueHandler={this.props.getSettingsValueHandler(
                      'useBgImage'
                    )}
                    readOnly={this.props.getPageSettingIsUndefined(
                      'useBgImage'
                    )}
                    onClick={(e) => {
                      this.overrideSetting('useBgImage')
                    }}
                  />
                  <ResetButton settingsKey='useBgImage' />
                  {this.props.settings.useBgImage ? (
                    <div>
                      <Checkbox
                        label='Tile Background Image'
                        checked={this.props.settings.tileBgImage}
                        valueHandler={this.props.getSettingsValueHandler(
                          'tileBgImage'
                        )}
                        readOnly={this.props.getPageSettingIsUndefined(
                          'tileBgImage'
                        )}
                        onClick={(e) => {
                          this.overrideSetting('tileBgImage')
                        }}
                      />
                      <ResetButton settingsKey='tileBgImage' />
                      <Input
                        label='Background Image Path'
                        valueHandler={this.props.getSettingsValueHandler('bg')}
                        value={this.props.settings.bg}
                        readOnly={this.props.getPageSettingIsUndefined('bg')}
                        onClick={(e) => {
                          this.overrideSetting('bg')
                        }}
                      />
                      <ResetButton settingsKey='bg' />
                      <div>
                        <button
                          type='button'
                          className='btn btn-primary'
                          onClick={() => {
                            this.bgFileInput.current.click()
                          }}
                          disabled={this.state.uploadingBg}
                        >
                          Upload Background
                          {this.state.uploadingBg ? (
                            <span>
                              <span> </span>
                              <Spinner />
                            </span>
                          ) : (
                            ''
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    ''
                  )}
                </Card>
              </div>
              <div className='row'>
                <div className='col'></div>
              </div>
              <Card
                header='Colors'
                headerTheme='dark'
                style={{
                  card: {
                    backgroundColor: 'transparent',
                  },
                }}
              >
                <div className='row'>
                  <div className='col-sm'>
                    <Input
                      label='Background Color'
                      type='color'
                      value={this.props.settings.bgColor}
                      valueHandler={this.props.getSettingsValueHandler(
                        'bgColor'
                      )}
                      readOnly={this.props.getPageSettingIsUndefined('bgColor')}
                      onClick={() => {
                        this.overrideSetting('bgColor')
                      }}
                    />
                    <ResetButton settingsKey='bgColor' />
                  </div>
                  <div className='col-sm'>
                    <Input
                      label='Text Color'
                      type='color'
                      value={this.props.settings.fontColor}
                      valueHandler={this.props.getSettingsValueHandler(
                        'fontColor'
                      )}
                      readonly={this.props.getPageSettingIsUndefined(
                        'fontColor'
                      )}
                      onClick={() => {
                        this.overrideSetting('fontColor')
                      }}
                    />
                    <ResetButton settingsKey='fontColor' />
                  </div>
                  <div className='col-sm'>
                    <Input
                      label='Link Color'
                      type='color'
                      value={this.props.settings.linkColor}
                      valueHandler={this.props.getSettingsValueHandler(
                        'linkColor'
                      )}
                      readOnly={this.props.getPageSettingIsUndefined(
                        'linkColor'
                      )}
                      onClick={() => {
                        this.overrideSetting('linkColor')
                      }}
                    />
                    <ResetButton settingsKey='linkColor' />
                  </div>
                </div>
                <div className='row'>
                  <div className='col-sm'>
                    <Input
                      label='Container Color'
                      type='color'
                      value={this.props.settings.containerColor}
                      valueHandler={this.props.getSettingsValueHandler(
                        'containerColor'
                      )}
                      readOnly={this.props.getPageSettingIsUndefined(
                        'containerColor'
                      )}
                      onClick={() => {
                        this.overrideSetting('containerColor')
                      }}
                    />
                    <ResetButton settingsKey='containerColor' />
                  </div>
                  <div className='col-sm'>
                    <Input
                      label='Border Color'
                      type='color'
                      value={this.props.settings.borderColor}
                      valueHandler={this.props.getSettingsValueHandler(
                        'borderColor'
                      )}
                      readOnly={this.props.getPageSettingIsUndefined(
                        'borderColor'
                      )}
                      onClick={() => {
                        this.overrideSetting('borderColor')
                      }}
                    />
                    <ResetButton settingsKey='borderColor' />
                  </div>
                </div>
                <div className='row'>
                  <div className='col-sm'>
                    <Input
                      label='Container Opacity'
                      type='number'
                      info='Enter a number between 0.00-1.00'
                      min='0'
                      max='1'
                      step='0.01'
                      value={this.props.settings.containerOpacity}
                      valueHandler={this.props.getSettingsValueHandler(
                        'containerOpacity'
                      )}
                      readOnly={this.props.getPageSettingIsUndefined(
                        'containerOpacity'
                      )}
                      onClick={() => {
                        this.overrideSetting('containerOpacity')
                      }}
                    />
                    <Input
                      type='range'
                      min='0'
                      max='1'
                      step='0.01'
                      value={this.props.settings.containerOpacity}
                      valueHandler={this.props.getSettingsValueHandler(
                        'containerOpacity'
                      )}
                      readOnly={this.props.getPageSettingIsUndefined(
                        'containerOpacity'
                      )}
                      onClick={() => {
                        this.overrideSetting('containerOpacity')
                      }}
                    />
                    <ResetButton settingsKey='containerOpacity' />
                  </div>
                  <div className='col-sm'>
                    <Input
                      label='Border Opacity'
                      type='number'
                      info='Enter a number between 0.00-1.00'
                      min='0'
                      max='1'
                      step='0.01'
                      value={this.props.settings.borderOpacity}
                      valueHandler={this.props.getSettingsValueHandler(
                        'borderOpacity'
                      )}
                      readOnly={this.props.getPageSettingIsUndefined(
                        'borderOpacity'
                      )}
                      onClick={() => {
                        this.overrideSetting('borderOpacity')
                      }}
                    />
                    <Input
                      type='range'
                      min='0'
                      max='1'
                      step='0.01'
                      value={this.props.settings.borderOpacity}
                      valueHandler={this.props.getSettingsValueHandler(
                        'borderOpacity'
                      )}
                      readOnly={this.props.getPageSettingIsUndefined(
                        'borderOpacity'
                      )}
                      onClick={() => {
                        this.overrideSetting('borderOpacity')
                      }}
                    />
                    <ResetButton settingsKey='borderOpacity' />
                  </div>
                  <div className='col-sm'>
                    <Select
                      label='Container Header Theme'
                      value={this.props.settings.containerHeaderTheme}
                      valueHandler={this.props.getSettingsValueHandler(
                        'containerHeaderTheme'
                      )}
                      readOnly={this.props.getPageSettingIsUndefined(
                        'containerHeaderTheme'
                      )}
                      onClick={() => {
                        this.overrideSetting('containerHeaderTheme')
                      }}
                    >
                      <option>blue</option>
                      <option>dark</option>
                      <option>gray</option>
                      <option>green</option>
                      <option>light</option>
                      <option>red</option>
                      <option>teal</option>
                      <option>yellow</option>
                    </Select>
                    <ResetButton settingsKey='containerHeaderTheme' />
                  </div>
                </div>
              </Card>
              <Card
                header='Samples'
                style={{
                  card: {
                    backgroundColor: this.props.settings.bgColor,
                  },
                }}
                headerTheme='teal'
              >
                <div>
                  <p>Text</p>
                  <p>
                    <a href='.' onClick={(e) => e.preventDefault()}>
                      Test Link
                    </a>
                  </p>
                </div>
                <Card
                  header='Container'
                  headerTheme={this.props.settings.containerHeaderTheme}
                  style={{
                    card: {
                      backgroundColor: getRgbaFromSettings(
                        this.props.settings,
                        'container'
                      ).string,
                      border: `1px solid ${
                        getRgbaFromSettings(this.props.settings, 'border')
                          .string
                      }`,
                      borderRadius: '0.25rem',
                      transition:
                        'background-color 0.5s linear, border-color 0.5s linear',
                    },
                    body: {
                      padding: '1em',
                    },
                  }}
                >
                  <p>Text</p>
                  <p>
                    <a href='.' onClick={(e) => e.preventDefault()}>
                      Link
                    </a>
                  </p>
                </Card>
              </Card>
              <Textarea
                label='CSS Overrides'
                value={this.props.settings.cssOverrides}
                valueHandler={this.props.getSettingsValueHandler(
                  'cssOverrides'
                )}
                readOnly={this.props.getPageSettingIsUndefined('cssOverrides')}
                onClick={() => {
                  this.overrideSetting('cssOverrides')
                }}
              />
              <ResetButton settingsKey='cssOverrides' />
              <Card
                header='Analytics'
                headerTheme='blue'
                style={{
                  card: { backgroundColor: 'transparent' },
                }}
              >
                <Checkbox
                  label='Use Google Analytics'
                  checked={this.props.settings.useGoogleAnalytics}
                  valueHandler={this.props.getSettingsValueHandler(
                    'useGoogleAnalytics'
                  )}
                  readOnly={this.props.getPageSettingIsUndefined(
                    'useGoogleAnalytics'
                  )}
                  onClick={() => {
                    this.overrideSetting('useGoogleAnalytics')
                  }}
                />
                <ResetButton settingsKey='useGoogleAnalytics' />
                {this.props.settings.useGoogleAnalytics ? (
                  <div>
                    <Input
                      label='Google Analytics Tracking ID'
                      value={this.props.settings.googleAnalyticsTrackingId}
                      valueHandler={this.props.getSettingsValueHandler(
                        'googleAnalyticsTrackingId'
                      )}
                      readOnly={this.props.getPageSettingIsUndefined(
                        'googleAnalyticsTrackingId'
                      )}
                      onClick={() => {
                        this.overrideSetting('googleAnalyticsTrackingId')
                      }}
                    />
                    <ResetButton settingsKey='googleAnalyticsTrackingId' />
                  </div>
                ) : (
                  ''
                )}
              </Card>
              <Card
                header='Delete Page'
                headerTheme='red'
                style={{
                  card: { backgroundColor: 'transparent' },
                }}
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
            <form
              method='POST'
              action={`${this.props.appRoot}/api/upload-img?token=${this.props.token}`}
              target='upload-bg-frame'
              encType='multipart/form-data'
              ref={this.uploadBgForm}
              className='d-none'
            >
              <input
                name='file'
                type='file'
                accept='image/*'
                ref={this.bgFileInput}
                onChange={(event) => {
                  this.uploadBgForm.current.submit()
                  this.setState((state) => {
                    state.uploadingBg = true
                    return state
                  })
                }}
              />
              <input
                type='hidden'
                name='target'
                value={`page-bg/${this.props.pageId}`}
              />
            </form>
            <iframe
              id='upload-bg-frame'
              name='upload-bg-frame'
              title='upload'
              onLoad={() => {
                let iframe = document.getElementById('upload-bg-frame')
                if (iframe.contentWindow.location.href.match(/^https?:\/\//)) {
                  this.setState(
                    (state) => {
                      state.uploadingBg = false
                      return state
                    },
                    () => {
                      this.bgFileInput.current.value = null
                      iframe.src = 'about:blank'
                      axios
                        .get(
                          `${this.props.appRoot}/api/page/${this.props.pageId}/settings`
                        )
                        .then((response) => {
                          let settings = response.data
                          if (settings.bg) {
                            this.props.getSettingsValueHandler('bg')(
                              settings.bg
                            )
                          }
                        })
                    }
                  )
                }
              }}
              className='d-none'
            />
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
  page: PropTypes.object.isRequired,
  pageId: PropTypes.number.isRequired,
  path: PropTypes.string.isRequired,
  settings: PropTypes.object.isRequired,
  site: PropTypes.bool,
  token: PropTypes.string,
}

export default PageSettings
