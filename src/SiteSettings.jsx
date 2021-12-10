import PropTypes from 'prop-types'
import React from 'react'
import axios from 'axios'
import { Card } from '@preaction/bootstrap-clips'
import { Input, Checkbox, Select } from '@preaction/inputs'
import { MdCreate, MdDelete, MdSave } from 'react-icons/md'

function SiteSettings(props) {
  const [backups, setBackups] = React.useState([])
  const [redirect, setRedirect] = React.useState(null)
  const [redirects, setRedirects] = React.useState([])
  const [selectedRestore, setSelectedRestore] = React.useState('')

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

  const getRedirectValueHandler = React.useCallback(
    (key) => {
      return (value) => {
        const obj = JSON.parse(JSON.stringify(redirect))
        obj[key] = value
        setRedirect(obj)
      }
    },
    [redirect]
  )

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

  const saveRedirect = React.useCallback(() => {
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
  }, [getRedirects, props.appRoot, props.token, redirect])

  const [showPrev, setShowPrev] = React.useState(false)
  React.useEffect(() => {
    if (props.show && !showPrev) {
      getBackups()
      getRedirects()
    }
    setShowPrev(props.show)
  }, [props, showPrev, setShowPrev, getBackups, getRedirects])

  return (
    <div className='site-level settings-component'>
      {props.admin ? (
        <div>
          <style type='text/css'>{`
            .redirects table td {
              border-left: 1px solid black;
              padding-left: 0.5em;
              padding-right: 0.5em;
            }
            .redirects table td:first-child {
              border-left: 0;
            }
          `}</style>
          <form className='form ml-3 mr-3' onSubmit={(e) => e.preventDefault()}>
            <div className='row'>
              <div className='col'>
                <div className='site-name-field'>
                  <Input
                    label='Site Name'
                    labelFloat
                    type='text'
                    value={props.settings.siteTitle}
                    valueHandler={props.getSettingsValueHandler('siteTitle')}
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
                  />
                </div>
                <Card
                  header='Navigation'
                  headerTheme='dark'
                  className='navigation'
                >
                  <div className='row'>
                    <div className='col-sm-6 nav-position-field'>
                      <Select
                        label='Nav Position'
                        labelFloat
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
                          labelFloat
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
                          labelFloat
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
                          labelFloat
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
                  <div className='row'>
                    <div className='col-sm-6 absolute-nav-behavior-field'>
                      <Select
                        label='Absolute URL Behavior'
                        labelFloat
                        value={props.settings.absoluteNavBehavior}
                        valueHandler={props.getSettingsValueHandler(
                          'absoluteNavBehavior'
                        )}
                      >
                        <option value='same-window'>Open in Same Window</option>
                        <option value='new-window'>Open in New Window</option>
                      </Select>
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
                    />
                  </div>
                  <div className='show-footer-field'>
                    <Checkbox
                      label='Show Footer'
                      checked={props.settings.showFooter}
                      valueHandler={props.getSettingsValueHandler('showFooter')}
                    />
                  </div>
                  <div className='row'>
                    <div className='show-hero-field col-sm-6'>
                      <Checkbox
                        label='Show Hero'
                        checked={props.settings.showHero}
                        valueHandler={props.getSettingsValueHandler('showHero')}
                      />
                    </div>
                    {props.settings.showHero ? (
                      <div className='col-sm-6 hero-position-field'>
                        <Select
                          label='Hero Position'
                          labelFloat
                          value={props.settings.heroPosition}
                          valueHandler={props.getSettingsValueHandler(
                            'heroPosition'
                          )}
                        >
                          <option value='above-header'>Above Header</option>
                          <option value='below-header'>Below Header</option>
                        </Select>
                      </div>
                    ) : (
                      ''
                    )}
                  </div>
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
                        >
                          <option value=''>Default</option>
                          <option>blue</option>
                          <option>cyan</option>
                          <option>danger</option>
                          <option>dark</option>
                          <option>gray</option>
                          <option>gray-dark</option>
                          <option>green</option>
                          <option>indigo</option>
                          <option>info</option>
                          <option>light</option>
                          <option>orange</option>
                          <option>pink</option>
                          <option>primary</option>
                          <option>purple</option>
                          <option>red</option>
                          <option>secondary</option>
                          <option>success</option>
                          <option>teal</option>
                          <option>transparent</option>
                          <option>warning</option>
                          <option>white</option>
                          <option>yellow</option>
                        </Select>
                      </div>
                      <div className='body-gradient-field'>
                        <Checkbox
                          label='Body Gradient'
                          checked={props.settings.bodyGradient}
                          valueHandler={props.getSettingsValueHandler(
                            'bodyGradient'
                          )}
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
                        >
                          <option value=''>Default</option>
                          <option>blue</option>
                          <option>cyan</option>
                          <option>danger</option>
                          <option>dark</option>
                          <option>gray</option>
                          <option>gray-dark</option>
                          <option>green</option>
                          <option>indigo</option>
                          <option>info</option>
                          <option>light</option>
                          <option>orange</option>
                          <option>pink</option>
                          <option>primary</option>
                          <option>purple</option>
                          <option>red</option>
                          <option>secondary</option>
                          <option>success</option>
                          <option>teal</option>
                          <option>transparent</option>
                          <option>warning</option>
                          <option>white</option>
                          <option>yellow</option>
                        </Select>
                      </div>
                      <div className='main-gradient-field'>
                        <Checkbox
                          label='Main Gradient'
                          checked={props.settings.mainGradient}
                          valueHandler={props.getSettingsValueHandler(
                            'mainGradient'
                          )}
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
                        >
                          <option>blue</option>
                          <option>cyan</option>
                          <option>danger</option>
                          <option>dark</option>
                          <option>gray</option>
                          <option>gray-dark</option>
                          <option>green</option>
                          <option>indigo</option>
                          <option>info</option>
                          <option>light</option>
                          <option>orange</option>
                          <option>pink</option>
                          <option>primary</option>
                          <option>purple</option>
                          <option>red</option>
                          <option>secondary</option>
                          <option>success</option>
                          <option>teal</option>
                          <option>transparent</option>
                          <option>warning</option>
                          <option>white</option>
                          <option>yellow</option>
                        </Select>
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
                        >
                          <option>blue</option>
                          <option>cyan</option>
                          <option>danger</option>
                          <option>dark</option>
                          <option>gray</option>
                          <option>gray-dark</option>
                          <option>green</option>
                          <option>indigo</option>
                          <option>info</option>
                          <option>light</option>
                          <option>orange</option>
                          <option>pink</option>
                          <option>primary</option>
                          <option>purple</option>
                          <option>red</option>
                          <option>secondary</option>
                          <option>success</option>
                          <option>teal</option>
                          <option>warning</option>
                          <option>white</option>
                          <option>yellow</option>
                        </Select>
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
                      >
                        <option>blue</option>
                        <option>cyan</option>
                        <option>danger</option>
                        <option>dark</option>
                        <option>gray</option>
                        <option>gray-dark</option>
                        <option>green</option>
                        <option>indigo</option>
                        <option>info</option>
                        <option>orange</option>
                        <option>pink</option>
                        <option>primary</option>
                        <option>purple</option>
                        <option>red</option>
                        <option>secondary</option>
                        <option>success</option>
                        <option>teal</option>
                        <option>warning</option>
                        <option>yellow</option>
                      </Select>
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
                          >
                            <option value=''>Default</option>
                            <option>blue</option>
                            <option>cyan</option>
                            <option>danger</option>
                            <option>dark</option>
                            <option>gray</option>
                            <option>gray-dark</option>
                            <option>green</option>
                            <option>indigo</option>
                            <option>info</option>
                            <option>light</option>
                            <option>orange</option>
                            <option>pink</option>
                            <option>primary</option>
                            <option>purple</option>
                            <option>red</option>
                            <option>secondary</option>
                            <option>success</option>
                            <option>teal</option>
                            <option>transparent</option>
                            <option>warning</option>
                            <option>white</option>
                            <option>yellow</option>
                          </Select>
                        </div>
                        <div className='header-gradient-field'>
                          <Checkbox
                            label='Header Gradient'
                            checked={props.settings.headerGradient || false}
                            valueHandler={props.getSettingsValueHandler(
                              'headerGradient'
                            )}
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
                          >
                            <option value=''>Default</option>
                            <option>blue</option>
                            <option>cyan</option>
                            <option>danger</option>
                            <option>dark</option>
                            <option>gray</option>
                            <option>gray-dark</option>
                            <option>green</option>
                            <option>indigo</option>
                            <option>info</option>
                            <option>light</option>
                            <option>orange</option>
                            <option>pink</option>
                            <option>primary</option>
                            <option>purple</option>
                            <option>red</option>
                            <option>secondary</option>
                            <option>success</option>
                            <option>teal</option>
                            <option>transparent</option>
                            <option>warning</option>
                            <option>white</option>
                            <option>yellow</option>
                          </Select>
                        </div>
                        <div className='hero-gradient-field'>
                          <Checkbox
                            label='Hero Gradient'
                            checked={props.settings.heroGradient || false}
                            valueHandler={props.getSettingsValueHandler(
                              'heroGradient'
                            )}
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
                          >
                            <option value=''>Default</option>
                            <option>blue</option>
                            <option>cyan</option>
                            <option>danger</option>
                            <option>dark</option>
                            <option>gray</option>
                            <option>gray-dark</option>
                            <option>green</option>
                            <option>indigo</option>
                            <option>info</option>
                            <option>light</option>
                            <option>orange</option>
                            <option>pink</option>
                            <option>primary</option>
                            <option>purple</option>
                            <option>red</option>
                            <option>secondary</option>
                            <option>success</option>
                            <option>teal</option>
                            <option>transparent</option>
                            <option>warning</option>
                            <option>white</option>
                            <option>yellow</option>
                          </Select>
                        </div>
                        <div className='footer-gradient-field'>
                          <Checkbox
                            label='Footer Gradient'
                            value={props.settings.footerGradient || false}
                            valueHandler={props.getSettingsValueHandler(
                              'footerGradient'
                            )}
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
              </div>
            </div>
            <Card header='Width' headerTheme='dark' className='width'>
              {props.settings.navPosition === 'fixed-top' ? (
                <div className='top-nav-maxwidth-field'>
                  <Checkbox
                    label='Max Width on Navigation Bar'
                    checked={props.settings.maxWidthNav}
                    valueHandler={props.getSettingsValueHandler('maxWidthNav')}
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
                  />
                </div>
              ) : (
                ''
              )}
            </Card>
            <Card header='Redirects' headerTheme='dark' className='redirects'>
              <div className='row'>
                <table>
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
            <Card header='Backups' headerTheme='red' className='backups'>
              <div>
                <Select
                  label='Restore File'
                  labelFloat
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
  getSettingsValueHandler: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  show: PropTypes.bool,
  token: PropTypes.string,
}

export default SiteSettings
