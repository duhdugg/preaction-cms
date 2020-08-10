import PropTypes from 'prop-types'
import React from 'react'
import axios from 'axios'
import { Card, Spinner } from '@preaction/bootstrap-clips'
import { Input, Checkbox, Select } from '@preaction/inputs'
import { getRgbaFromSettings } from './lib/getRgba.js'
import { MdCreate, MdDelete, MdSave } from 'react-icons/md'
import globalthis from 'globalthis'

const globalThis = globalthis()

class SiteSettings extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      backups: [],
      redirect: null,
      redirects: [],
      selectedRestore: '',
      uploadingBg: false,
      uploadingIcon: false,
    }
    this.uploadIconForm = React.createRef()
    this.iconFileInput = React.createRef()
    this.uploadBgForm = React.createRef()
    this.bgFileInput = React.createRef()
  }

  getBackups() {
    axios.get(`${this.props.appRoot}/api/backups`).then((response) => {
      this.setState((state) => {
        state.backups = response.data
        return state
      })
    })
  }

  deleteRedirect(redirect) {
    axios
      .delete(
        `${this.props.appRoot}/api/redirect/${redirect.id}?token=${this.props.token}`
      )
      .then((response) => {
        this.props.emitSave()
        this.getRedirects()
      })
  }

  editRedirect(redirect) {
    this.setState((state) => {
      state.redirect = JSON.parse(JSON.stringify(redirect))
      return state
    })
  }

  getRedirects() {
    axios.get(`${this.props.appRoot}/api/redirect`).then((response) => {
      this.setState((state) => {
        state.redirects = response.data
        return state
      })
    })
  }

  getRedirectValueHandler(key) {
    return (value) => {
      this.setState((state) => {
        state.redirect[key] = value
        return state
      })
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

  refreshIcon() {
    let icon = document.querySelector('link[rel="shortcut icon"]')
    let timestamp = +new Date()
    icon.href = `/icon?v=${timestamp}`
  }

  restoreBackup(filename) {
    axios
      .post(`${this.props.appRoot}/api/backups?token=${this.props.token}`, {
        filename,
      })
      .then((response) => {
        this.props.emitForceReload(() => {
          globalThis.location.reload()
        })
      })
  }

  saveRedirect() {
    if (!this.state.redirect.match.trim()) {
      return
    }
    if (!this.state.redirect.location.trim()) {
      return
    }
    if (this.state.redirect.id) {
      axios
        .put(
          `${this.props.appRoot}/api/redirect/${this.state.redirect.id}?token=${this.props.token}`,
          this.state.redirect
        )
        .then((response) => {
          this.getRedirects()
        })
    } else {
      axios
        .post(
          `${this.props.appRoot}/api/redirect/?token=${this.props.token}`,
          this.state.redirect
        )
        .then((response) => {
          this.getRedirects()
        })
    }
    this.setState((state) => {
      state.redirect = null
      return state
    })
  }

  render() {
    return (
      <div className='settings-component'>
        {this.props.admin ? (
          <div>
            <style type='text/css'>{`
              table.redirects td {
                border-left: 1px solid black;
                padding-left: 0.5em;
                padding-right: 0.5em;
              }
              table.redirects td:first-child {
                border-left: 0;
              }
            `}</style>
            <form
              className='form ml-3 mr-3'
              onSubmit={(e) => e.preventDefault()}
            >
              <div className='row'>
                <div className='col'>
                  <Input
                    label='Site Name'
                    type='text'
                    value={this.props.settings.siteTitle}
                    valueHandler={this.props.getSettingsValueHandler(
                      'siteTitle'
                    )}
                  />
                  <Checkbox
                    label='Max Width Layout'
                    checked={this.props.settings.maxWidthLayout}
                    valueHandler={this.props.getSettingsValueHandler(
                      'maxWidthLayout'
                    )}
                  />
                  <Card
                    header='Navigation'
                    headerTheme='dark'
                    style={{
                      card: {
                        backgroundColor: 'transparent',
                      },
                    }}
                  >
                    <div className='row'>
                      <div className='col-sm-6'>
                        <Select
                          label='Nav Position'
                          value={this.props.settings.navPosition}
                          valueHandler={this.props.getSettingsValueHandler(
                            'navPosition'
                          )}
                        >
                          <option value='fixed-top'>Fixed to Top</option>
                          <option value='above-header'>Above Header</option>
                          <option value='below-header'>Below Header</option>
                        </Select>
                      </div>
                      {this.props.settings.navPosition === 'fixed-top' ? (
                        <div className='col-sm-6'>
                          <Select
                            label='Nav Theme'
                            value={this.props.settings.navTheme}
                            valueHandler={this.props.getSettingsValueHandler(
                              'navTheme'
                            )}
                          >
                            <option value='light'>Light</option>
                            <option value='dark'>Dark</option>
                          </Select>
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
                          >
                            <option>basic</option>
                            <option>tabs</option>
                            <option>pills</option>
                          </Select>
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
                          >
                            <option>left</option>
                            <option>center</option>
                            <option>right</option>
                          </Select>
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
                          >
                            <option>normal</option>
                            <option>fill</option>
                            <option>justify</option>
                          </Select>
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
                          />
                        </div>
                      ) : (
                        ''
                      )}
                    </div>
                  </Card>
                  <Card header='Header' headerTheme='light'>
                    <Checkbox
                      label='Show Header'
                      checked={this.props.settings.showHeader}
                      valueHandler={this.props.getSettingsValueHandler(
                        'showHeader'
                      )}
                    />
                    <Checkbox
                      label='Show Footer'
                      checked={this.props.settings.showFooter}
                      valueHandler={this.props.getSettingsValueHandler(
                        'showFooter'
                      )}
                    />
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
                  />
                  {this.props.settings.useBgImage ? (
                    <div>
                      <Checkbox
                        label='Tile Background Image'
                        checked={this.props.settings.tileBgImage}
                        valueHandler={this.props.getSettingsValueHandler(
                          'tileBgImage'
                        )}
                      />
                      <Input
                        label='Background Image Path'
                        valueHandler={this.props.getSettingsValueHandler('bg')}
                        value={this.props.settings.bg}
                      />
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
                <Card
                  header='Icon'
                  column
                  width={1 / 2}
                  headerTheme='yellow'
                  style={{
                    card: {
                      backgroundColor: 'transparent',
                    },
                  }}
                >
                  <button
                    type='button'
                    className='btn btn-primary'
                    onClick={() => {
                      this.iconFileInput.current.click()
                    }}
                    disabled={this.state.uploadingIcon}
                  >
                    Upload Icon
                    {this.state.uploadingIcon ? (
                      <span>
                        <span> </span>
                        <Spinner />
                      </span>
                    ) : (
                      ''
                    )}
                  </button>
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
                    />
                  </div>
                  <div className='col-sm'>
                    <Input
                      label='Text Color'
                      type='color'
                      value={this.props.settings.fontColor}
                      valueHandler={this.props.getSettingsValueHandler(
                        'fontColor'
                      )}
                    />
                  </div>
                  <div className='col-sm'>
                    <Input
                      label='Link Color'
                      type='color'
                      value={this.props.settings.linkColor}
                      valueHandler={this.props.getSettingsValueHandler(
                        'linkColor'
                      )}
                    />
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
                    />
                  </div>
                  <div className='col-sm'>
                    <Input
                      label='Border Color'
                      type='color'
                      value={this.props.settings.borderColor}
                      valueHandler={this.props.getSettingsValueHandler(
                        'borderColor'
                      )}
                    />
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
                    />
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
                    />
                  </div>
                  <div className='col-sm'>
                    <Select
                      label='Container Header Theme'
                      value={this.props.settings.containerHeaderTheme}
                      valueHandler={this.props.getSettingsValueHandler(
                        'containerHeaderTheme'
                      )}
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
              <Card
                header='Redirects'
                headerTheme='green'
                style={{
                  card: { backgroundColor: 'transparent' },
                }}
              >
                <div className='row'>
                  <table className='redirects'>
                    <thead>
                      <tr>
                        <th />
                        <th>Match</th>
                        <th>Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.redirects.map((redirect) => {
                        return (
                          <tr key={redirect.id}>
                            <td>
                              <button
                                type='button'
                                className='btn btn-sm btn-light'
                                onClick={(e) => {
                                  this.editRedirect(redirect)
                                }}
                              >
                                <MdCreate /> edit
                              </button>
                              <button
                                type='button'
                                className='btn btn-sm btn-danger'
                                onClick={(e) => {
                                  this.deleteRedirect(redirect)
                                }}
                              >
                                <MdDelete /> delete
                              </button>
                            </td>
                            <td>{redirect.match}</td>
                            <td>{redirect.location}</td>
                          </tr>
                        )
                      })}
                      <tr>
                        <td>
                          <button
                            type='button'
                            className='btn btn-sm btn-primary'
                            onClick={(e) => {
                              this.editRedirect({
                                id: null,
                                match: '',
                                location: '',
                              })
                            }}
                          >
                            <MdCreate /> new
                          </button>
                        </td>
                        <td />
                        <td />
                      </tr>
                    </tbody>
                    {this.state.redirect ? (
                      <tfoot>
                        <tr>
                          <td
                            style={{
                              top: '-0.5rem',
                              position: 'relative',
                            }}
                          >
                            <button
                              type='button'
                              className='btn btn-success btn-sm'
                              onClick={this.saveRedirect.bind(this)}
                            >
                              <MdSave /> save
                            </button>
                          </td>
                          <td>
                            <Input
                              value={this.state.redirect.match}
                              valueHandler={this.getRedirectValueHandler(
                                'match'
                              )}
                            />
                          </td>
                          <td>
                            <Input
                              value={this.state.redirect.location}
                              valueHandler={this.getRedirectValueHandler(
                                'location'
                              )}
                            />
                          </td>
                        </tr>
                      </tfoot>
                    ) : (
                      <tfoot />
                    )}
                  </table>
                </div>
              </Card>
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
                />
                {this.props.settings.useGoogleAnalytics ? (
                  <Input
                    label='Google Analytics Tracking ID'
                    value={this.props.settings.googleAnalyticsTrackingId}
                    valueHandler={this.props.getSettingsValueHandler(
                      'googleAnalyticsTrackingId'
                    )}
                  />
                ) : (
                  ''
                )}
              </Card>
              <Card
                header='Backups'
                headerTheme='dark'
                style={{
                  card: {
                    backgroundColor: getRgbaFromSettings(
                      this.props.settings,
                      'container'
                    ).string,
                  },
                }}
              >
                <div>
                  <Select
                    label='Restore File'
                    value={this.state.selectedRestore}
                    valueHandler={(value) => {
                      this.setState((state) => {
                        state.selectedRestore = value
                        return state
                      })
                    }}
                  >
                    <option></option>
                    {this.state.backups.map((filename, index) => {
                      return <option key={index}>{filename}</option>
                    })}
                  </Select>
                  {this.state.selectedRestore ? (
                    <button
                      className='btn btn-secondary'
                      onClick={(e) => {
                        e.preventDefault()
                        this.restoreBackup(this.state.selectedRestore)
                      }}
                    >
                      Restore
                    </button>
                  ) : (
                    ''
                  )}
                </div>
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
              <input type='hidden' name='target' value='bg' />
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
                        .get(`${this.props.appRoot}/api/settings`)
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
                } else {
                }
              }}
              className='d-none'
            />
            <form
              method='POST'
              action={`${this.props.appRoot}/api/upload-img?token=${this.props.token}`}
              target='upload-icon-frame'
              encType='multipart/form-data'
              ref={this.uploadIconForm}
              className='d-none'
            >
              <input
                name='file'
                type='file'
                accept='image/*'
                ref={this.iconFileInput}
                onChange={(event) => {
                  this.uploadIconForm.current.submit()
                  this.setState((state) => {
                    state.uploadingIcon = true
                    return state
                  })
                }}
              />
              <input type='hidden' name='target' value='icon' />
            </form>
            <iframe
              id='upload-icon-frame'
              name='upload-icon-frame'
              title='upload'
              onLoad={() => {
                let iframe = document.getElementById('upload-icon-frame')
                if (iframe.contentWindow.location.href.match(/^https?:\/\//)) {
                  this.setState(
                    (state) => {
                      state.uploadingIcon = false
                      return state
                    },
                    () => {
                      this.iconFileInput.current.value = null
                      iframe.src = 'about:blank'
                      this.refreshIcon()
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

  componentDidMount() {
    this.getBackups()
    this.getRedirects()
  }
}

SiteSettings.propTypes = {
  admin: PropTypes.bool,
  appRoot: PropTypes.string.isRequired,
  emitForceReload: PropTypes.func.isRequired,
  emitSave: PropTypes.func.isRequired,
  getSettingsValueHandler: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  token: PropTypes.string,
}

export default SiteSettings
