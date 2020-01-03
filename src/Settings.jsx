import PropTypes from 'prop-types'
import React from 'react'
import axios from 'axios'
import { Card } from '@preaction/bootstrap-clips'
import { Input, Checkbox, Select, Textarea } from '@preaction/inputs'

class Settings extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      newPageTitle: '',
      redirect: null,
      redirects: [],
      uploadingBg: false,
      uploadingIcon: false
    }
    this.uploadIconForm = React.createRef()
    this.iconFileInput = React.createRef()
    this.uploadBgForm = React.createRef()
    this.bgFileInput = React.createRef()
  }

  deleteRedirect(redirect) {
    axios.delete(`/api/redirect/${redirect.id}`).then(response => {
      this.getRedirects()
    })
  }

  editRedirect(redirect) {
    this.setState(state => {
      state.redirect = JSON.parse(JSON.stringify(redirect))
      return state
    })
  }

  getRedirects() {
    axios.get('/api/redirect').then(response => {
      this.setState(state => {
        state.redirects = response.data
        return state
      })
    })
  }

  getRedirectValueHandler(key) {
    return value => {
      this.setState(state => {
        state.redirect[key] = value
        return state
      })
    }
  }

  getValueHandler(key) {
    return value => {
      this.setState(state => {
        state[key] = value
        return state
      })
    }
  }

  get newPage() {
    let title = this.state.newPageTitle
    let key = title.toLowerCase().replace(/[^A-z0-9]/gi, '-')
    let pageType = 'content'
    return {
      key,
      title,
      pageType
    }
  }

  refreshIcon() {
    let icon = document.querySelector('link[rel="shortcut icon"]')
    let timestamp = +new Date()
    icon.href = `/icon?v=${timestamp}`
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
        .put(`/api/redirect/${this.state.redirect.id}`, this.state.redirect)
        .then(response => {
          this.getRedirects()
        })
    } else {
      axios.post('/api/redirect/', this.state.redirect).then(response => {
        this.getRedirects()
      })
    }
    this.setState(state => {
      state.redirect = null
      return state
    })
  }

  render() {
    return (
      <div>
        {this.props.authenticated ? (
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
            <form className='form ml-3 mr-3' onSubmit={e => e.preventDefault()}>
              <h3>Site Settings</h3>
              <div className='row'>
                <div className='col'>
                  <Input
                    label='Site Name'
                    type='text'
                    value={this.props.siteSettings.siteTitle}
                    valueHandler={this.props.getSettingsValueHandler(
                      'siteTitle'
                    )}
                  />
                  <Card
                    header='Navigation'
                    headerTheme='dark'
                    style={{
                      card: {
                        backgroundColor: 'transparent'
                      }
                    }}
                  >
                    <Select
                      label='Nav Position'
                      value={this.props.siteSettings.navPosition}
                      valueHandler={this.props.getSettingsValueHandler(
                        'navPosition'
                      )}
                    >
                      <option value='fixed-top'>Fixed to Top</option>
                      <option value='above-header'>Above Header</option>
                      <option value='below-header'>Below Header</option>
                    </Select>
                    {this.props.siteSettings.navPosition === 'fixed-top' ? (
                      <Select
                        label='Nav Theme'
                        value={this.props.siteSettings.navTheme}
                        valueHandler={this.props.getSettingsValueHandler(
                          'navTheme'
                        )}
                      >
                        <option />
                        <option value='light'>Light</option>
                        <option value='dark'>Dark</option>
                      </Select>
                    ) : (
                      ''
                    )}
                    {['above-header', 'below-header'].indexOf(
                      this.props.siteSettings.navPosition
                    ) > -1 ? (
                      <div>
                        <Select
                          label='Nav Type'
                          value={this.props.siteSettings.navType}
                          valueHandler={this.props.getSettingsValueHandler(
                            'navType'
                          )}
                        >
                          <option>basic</option>
                          <option>tabs</option>
                          <option>pills</option>
                        </Select>
                        <Select
                          label='Nav Alignment'
                          value={this.props.siteSettings.navAlignment}
                          valueHandler={this.props.getSettingsValueHandler(
                            'navAlignment'
                          )}
                        >
                          <option>left</option>
                          <option>center</option>
                          <option>right</option>
                        </Select>
                        <Select
                          label='Nav Spacing'
                          value={this.props.siteSettings.navSpacing}
                          valueHandler={this.props.getSettingsValueHandler(
                            'navSpacing'
                          )}
                        >
                          <option>normal</option>
                          <option>fill</option>
                          <option>justify</option>
                        </Select>
                        <Checkbox
                          label='Collapse nav for smaller screens'
                          checked={this.props.siteSettings.navCollapsible}
                          valueHandler={this.props.getSettingsValueHandler(
                            'navCollapsible'
                          )}
                        />
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
                      backgroundColor: 'transparent'
                    }
                  }}
                >
                  <Checkbox
                    label='Use Background Image'
                    checked={this.props.siteSettings.useBgImage}
                    valueHandler={this.props.getSettingsValueHandler(
                      'useBgImage'
                    )}
                  />
                  {this.props.siteSettings.useBgImage ? (
                    <div>
                      <Checkbox
                        label='Tile Background Image'
                        checked={this.props.siteSettings.tileBgImage}
                        valueHandler={this.props.getSettingsValueHandler(
                          'tileBgImage'
                        )}
                      />
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
                            <i className='icon ion-md-hourglass spinner' />
                          </span>
                        ) : (
                          ''
                        )}
                      </button>
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
                      backgroundColor: 'transparent'
                    }
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
                        <i className='icon ion-md-hourglass spinner' />
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
                    backgroundColor: 'transparent'
                  }
                }}
              >
                <div className='row'>
                  <div className='col-sm'>
                    <Input
                      label='Background Color'
                      type='color'
                      value={this.props.siteSettings.bgColor}
                      valueHandler={this.props.getSettingsValueHandler(
                        'bgColor'
                      )}
                    />
                  </div>
                  <div className='col-sm'>
                    <Input
                      label='Text Color'
                      type='color'
                      value={this.props.siteSettings.fontColor}
                      valueHandler={this.props.getSettingsValueHandler(
                        'fontColor'
                      )}
                    />
                  </div>
                </div>
                <div className='row'>
                  <div className='col'>
                    <Input
                      label='Link Color'
                      type='color'
                      value={this.props.siteSettings.linkColor}
                      valueHandler={this.props.getSettingsValueHandler(
                        'linkColor'
                      )}
                    />
                  </div>
                  <div className='col-sm'>
                    <Input
                      label='Container Color'
                      type='color'
                      value={this.props.siteSettings.containerColor}
                      valueHandler={this.props.getSettingsValueHandler(
                        'containerColor'
                      )}
                    />
                  </div>
                  <div className='col-sm'>
                    <Input
                      label='Border Color'
                      type='color'
                      value={this.props.siteSettings.borderColor}
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
                      value={this.props.siteSettings.containerOpacity}
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
                      value={this.props.siteSettings.borderOpacity}
                      valueHandler={this.props.getSettingsValueHandler(
                        'borderOpacity'
                      )}
                    />
                  </div>
                </div>

                <div>
                  <h3>Samples</h3>
                  <div>
                    <p>Text</p>
                    <p>
                      <a href='.' onClick={e => e.preventDefault()}>
                        Test Link
                      </a>
                    </p>
                  </div>
                  <div
                    className='p-3'
                    style={{
                      backgroundColor: this.props.siteSettings.containerRgba
                        .string,
                      border: `1px solid ${this.props.siteSettings.borderRgba.string}`,
                      borderRadius: '0.25rem',
                      transition:
                        'background-color 1s linear, border-color 1s linear'
                    }}
                  >
                    <p>Text</p>
                    <p>
                      <a href='.' onClick={e => e.preventDefault()}>
                        Link
                      </a>
                    </p>
                  </div>
                </div>
              </Card>
              <Textarea
                label='CSS Overrides'
                value={this.props.siteSettings.cssOverrides}
                valueHandler={this.props.getSettingsValueHandler(
                  'cssOverrides'
                )}
              />
              <Card
                header='Redirects'
                headerTheme='red'
                style={{
                  card: { backgroundColor: 'transparent' }
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
                      {this.state.redirects.map(redirect => {
                        return (
                          <tr key={redirect.id}>
                            <td>
                              <button
                                type='button'
                                className='btn btn-sm btn-light'
                                onClick={e => {
                                  this.editRedirect(redirect)
                                }}
                              >
                                <i className='ion ion-md-create' /> edit
                              </button>
                              <button
                                type='button'
                                className='btn btn-sm btn-danger'
                                onClick={e => {
                                  this.deleteRedirect(redirect)
                                }}
                              >
                                <i className='ion ion-md-trash' /> delete
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
                            onClick={e => {
                              this.editRedirect({
                                id: null,
                                match: '',
                                location: ''
                              })
                            }}
                          >
                            <i className='ion ion-md-create' /> new
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
                              position: 'relative'
                            }}
                          >
                            <button
                              type='button'
                              className='btn btn-success btn-sm'
                              onClick={this.saveRedirect.bind(this)}
                            >
                              <i className='ion ion-md-save' /> Save
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
            </form>
            <form
              method='POST'
              action={'/api/upload'}
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
                onChange={event => {
                  this.uploadBgForm.current.submit()
                  this.setState(state => {
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
                if (iframe.contentWindow.location.href.indexOf('http') > -1) {
                  this.props.emitReload(() => {
                    window.location.reload()
                  })
                  this.setState(state => {
                    state.uploadingBg = false
                    return state
                  })
                }
              }}
              className='d-none'
            />
            <form
              method='POST'
              action={'/api/upload'}
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
                onChange={event => {
                  this.uploadIconForm.current.submit()
                  this.setState(state => {
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
                if (iframe.contentWindow.location.href.indexOf('http') > -1) {
                  this.props.emitReload()
                  this.setState(
                    state => {
                      state.uploadingIcon = false
                      return state
                    },
                    () => {
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
    document.title = `Site Settings | ${this.props.siteSettings.siteTitle}`
    this.getRedirects()
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      nextProps.siteSettings.siteTitle !== this.props.siteSettings.siteTitle
    ) {
      document.title = `Site Settings | ${nextProps.siteSettings.siteTitle}`
    }
    return true
  }
}

Settings.propTypes = {
  authenticated: PropTypes.bool,
  emitReload: PropTypes.func.isRequired,
  getSettingsValueHandler: PropTypes.func.isRequired,
  siteSettings: PropTypes.object.isRequired
}

export default Settings
