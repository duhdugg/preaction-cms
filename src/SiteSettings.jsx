import PropTypes from 'prop-types'
import React from 'react'
import axios from 'axios'
import { Card } from '@preaction/bootstrap-clips'
import { Input, Checkbox, Select } from '@preaction/inputs'
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
    }
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
                  <Card header='Navigation' headerTheme='dark'>
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
                <div className='col'></div>
              </div>
              <Card header='Redirects' headerTheme='green'>
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
              <Card header='Backups' headerTheme='dark'>
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
