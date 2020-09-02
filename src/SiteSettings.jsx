import PropTypes from 'prop-types'
import React from 'react'
import axios from 'axios'
import { Card } from '@preaction/bootstrap-clips'
import { Input, Checkbox, Select } from '@preaction/inputs'
import { MdCreate, MdDelete, MdSave } from 'react-icons/md'
import globalthis from 'globalthis'

const globalThis = globalthis()

function SiteSettings(props) {
  const [backups, setBackups] = React.useState([])
  const [redirect, setRedirect] = React.useState(null)
  const [redirects, setRedirects] = React.useState([])
  const [selectedRestore, setSelectedRestore] = React.useState('')
  const firstRender = React.useRef(true)

  const getBackups = React.useCallback(() => {
    axios.get(`${props.appRoot}/api/backups`).then((response) => {
      setBackups(response.data)
    })
  }, [props.appRoot])

  const deleteRedirect = (redirect) => {
    axios
      .delete(
        `${props.appRoot}/api/redirect/${redirect.id}?token=${props.token}`
      )
      .then((response) => {
        props.emitSave()
        getRedirects()
      })
  }

  const editRedirect = (redirect) => {
    setRedirect(JSON.parse(JSON.stringify(redirect)))
  }

  const getRedirects = React.useCallback(() => {
    axios.get(`${props.appRoot}/api/redirect`).then((response) => {
      setRedirects(response.data)
    })
  }, [props.appRoot])

  const getRedirectValueHandler = (key) => {
    return (value) => {
      const obj = JSON.parse(JSON.stringify(redirect))
      obj[key] = value
      setRedirect(obj)
    }
  }

  const restoreBackup = (filename) => {
    axios
      .post(`${props.appRoot}/api/backups?token=${props.token}`, {
        filename,
      })
      .then((response) => {
        props.emitForceReload(() => {
          globalThis.location.reload()
        })
      })
  }

  const saveRedirect = () => {
    if (!redirect.match.trim()) {
      return
    }
    if (!redirect.location.trim()) {
      return
    }
    if (redirect.id) {
      axios
        .put(
          `${props.appRoot}/api/redirect/${redirect.id}?token=${props.token}`,
          redirect
        )
        .then((response) => {
          getRedirects()
        })
    } else {
      axios
        .post(`${props.appRoot}/api/redirect/?token=${props.token}`, redirect)
        .then((response) => {
          getRedirects()
        })
    }
    setRedirect(null)
  }

  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      getBackups()
      getRedirects()
    }
  }, [firstRender, getBackups, getRedirects])

  return (
    <div className='site-level settings-component'>
      {props.admin ? (
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
          <form className='form ml-3 mr-3' onSubmit={(e) => e.preventDefault()}>
            <div className='row'>
              <div className='col'>
                <div className='site-name-field'>
                  <Input
                    label='Site Name'
                    type='text'
                    value={props.settings.siteTitle}
                    valueHandler={props.getSettingsValueHandler('siteTitle')}
                  />
                </div>
                <Card
                  header='Navigation'
                  headerTheme='dark'
                  className={{ card: 'navigation' }}
                >
                  <div className='row'>
                    <div className='col-sm-6 nav-position-field'>
                      <Select
                        label='Nav Position'
                        value={props.settings.navPosition}
                        valueHandler={props.getSettingsValueHandler(
                          'navPosition'
                        )}
                      >
                        <option value='fixed-top'>Fixed to Top</option>
                        <option value='above-header'>Above Header</option>
                        <option value='below-header'>Below Header</option>
                      </Select>
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
                      props.settings.navPosition
                    ) ? (
                      <div className='col-sm-6 nav-alignment-field'>
                        <Select
                          label='Nav Alignment'
                          value={props.settings.navAlignment}
                          valueHandler={props.getSettingsValueHandler(
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
                      props.settings.navPosition
                    ) ? (
                      <div className='col-sm-6 nav-spacing-field'>
                        <Select
                          label='Nav Spacing'
                          value={props.settings.navSpacing}
                          valueHandler={props.getSettingsValueHandler(
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
                      props.settings.navPosition
                    ) ? (
                      <div className='col-sm-6 collapse-nav-field'>
                        <Checkbox
                          label='Collapse nav for smaller screens'
                          checked={props.settings.navCollapsible}
                          valueHandler={props.getSettingsValueHandler(
                            'navCollapsible'
                          )}
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
                    />
                  </div>
                  <div className='show-footer-field'>
                    <Checkbox
                      label='Show Footer'
                      checked={props.settings.showFooter}
                      valueHandler={props.getSettingsValueHandler('showFooter')}
                    />
                  </div>
                </Card>
              </div>
            </div>
            <Card
              header='Redirects'
              headerTheme='dark'
              className={{ card: 'redirects' }}
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
                    {redirects.map((redirect) => {
                      return (
                        <tr key={redirect.id}>
                          <td>
                            <button
                              type='button'
                              className='btn btn-sm btn-light'
                              onClick={(e) => {
                                editRedirect(redirect)
                              }}
                            >
                              <MdCreate /> edit
                            </button>
                            <button
                              type='button'
                              className='btn btn-sm btn-danger'
                              onClick={(e) => {
                                deleteRedirect(redirect)
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
                            editRedirect({
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
                  {redirect ? (
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
                            onClick={saveRedirect}
                          >
                            <MdSave /> save
                          </button>
                        </td>
                        <td>
                          <Input
                            value={redirect.match}
                            valueHandler={getRedirectValueHandler('match')}
                          />
                        </td>
                        <td>
                          <Input
                            value={redirect.location}
                            valueHandler={getRedirectValueHandler('location')}
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
              header='Backups'
              headerTheme='red'
              className={{ card: 'backups' }}
            >
              <div>
                <Select
                  label='Restore File'
                  value={selectedRestore}
                  valueHandler={(value) => {
                    setSelectedRestore(value)
                  }}
                >
                  <option></option>
                  {backups.map((filename, index) => {
                    return <option key={index}>{filename}</option>
                  })}
                </Select>
                {selectedRestore ? (
                  <button
                    className='btn btn-secondary'
                    onClick={(e) => {
                      e.preventDefault()
                      restoreBackup(selectedRestore)
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
