import React from 'react'
import { Input, Checkbox, Select } from 'preaction-inputs'

class Settings extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      newPageTitle: '',
      uploadingBg: false,
      uploadingIcon: false
    }
    this.uploadIconForm = React.createRef()
    this.iconFileInput = React.createRef()
    this.uploadBgForm = React.createRef()
    this.bgFileInput = React.createRef()
  }

  addPage () {
    if (this.newPage.key) {
      this.props.addPage(this.newPage)
    }
    this.setState(state => {
      state.newPageTitle = ''
      return state
    })
  }

  getValueHandler (key) {
    return value => {
      this.setState(state => {
        state[key] = value
        return state
      })
    }
  }

  get newPage () {
    let title = this.state.newPageTitle
    let key = title.toLowerCase().replace(/[^A-z0-9]/gi, '-')
    let pageType = 'content'
    return {
      key,
      title,
      pageType
    }
  }

  refreshIcon () {
    let icon = document.querySelector('link[rel="shortcut icon"]')
    let timestamp = +new Date()
    icon.href = `/icon?v=${timestamp}`
  }

  render () {
    return (
      <div>
        {this.props.authenticated ? (
          <div>
            <form className="form ml-3 mr-3" onSubmit={e => e.preventDefault()}>
              <h3>Site Settings</h3>
              <div className="row">
                <div className="col">
                  <Input
                    label="Site Name"
                    type="text"
                    value={this.props.siteSettings.siteTitle}
                    valueHandler={this.props.getSettingsValueHandler(
                      'siteTitle'
                    )}
                  />
                  <Select
                    label="Nav Position"
                    value={this.props.siteSettings.navPosition}
                    valueHandler={this.props.getSettingsValueHandler(
                      'navPosition'
                    )}
                  >
                    <option value="fixed-top">Fixed to Top</option>
                    <option value="above-header">Above Header</option>
                    <option value="below-header">Below Header</option>
                  </Select>
                  {this.props.siteSettings.navPosition === 'fixed-top' ? (
                    <Select
                      label="Nav Theme"
                      value={this.props.siteSettings.navTheme}
                      valueHandler={this.props.getSettingsValueHandler(
                        'navTheme'
                      )}
                    >
                      <option />
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </Select>
                  ) : (
                    ''
                  )}
                  {['above-header', 'below-header'].indexOf(
                    this.props.siteSettings.navPosition
                  ) > -1 ? (
                      <div>
                        <Select
                          label="Nav Type"
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
                          label="Nav Alignment"
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
                          label="Nav Spacing"
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
                          label="Collapse nav for smaller screens"
                          checked={this.props.siteSettings.navCollapsible}
                          valueHandler={this.props.getSettingsValueHandler(
                            'navCollapsible'
                          )}
                        />
                      </div>
                    ) : (
                      ''
                    )}
                </div>
              </div>

              <div className="row">
                <div className="col">
                  <label className="d-block">Site Background</label>
                  <Checkbox
                    label="Use Background Image"
                    checked={this.props.siteSettings.useBgImage}
                    valueHandler={this.props.getSettingsValueHandler(
                      'useBgImage'
                    )}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      this.bgFileInput.current.click()
                    }}
                    disabled={this.state.uploadingBg}
                  >
                    Upload Background
                    {this.state.uploadingBg ? (
                      <span>
                        <span> </span>
                        <i className="icon ion-md-hourglass spinner" />
                      </span>
                    ) : (
                      ''
                    )}
                  </button>
                </div>
              </div>

              <div className="row">
                <div className="col">
                  <label className="d-block">Site Icon</label>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      this.iconFileInput.current.click()
                    }}
                    disabled={this.state.uploadingIcon}
                  >
                    Upload Icon
                    {this.state.uploadingIcon ? (
                      <span>
                        <span> </span>
                        <i className="icon ion-md-hourglass spinner" />
                      </span>
                    ) : (
                      ''
                    )}
                  </button>
                </div>
              </div>

              <h3>Add Page</h3>

              <div className="row">
                <div className="col">
                  <Input
                    label="New Page Title"
                    type="text"
                    value={this.state.newPageTitle}
                    valueHandler={this.getValueHandler('newPageTitle')}
                  />
                  <div>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={this.addPage.bind(this)}
                    >
                      Create New Page
                    </button>
                  </div>
                </div>
              </div>

              <h3>Colors</h3>
              <div className="row">
                <div className="col">
                  <Input
                    label="Background Color"
                    type="color"
                    value={this.props.siteSettings.bgColor}
                    valueHandler={this.props.getSettingsValueHandler('bgColor')}
                  />
                </div>
                <div className="col">
                  <Input
                    label="Text Color"
                    type="color"
                    value={this.props.siteSettings.fontColor}
                    valueHandler={this.props.getSettingsValueHandler(
                      'fontColor'
                    )}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <Input
                    label="Link Color"
                    type="color"
                    value={this.props.siteSettings.linkColor}
                    valueHandler={this.props.getSettingsValueHandler(
                      'linkColor'
                    )}
                  />
                </div>
                <div className="col">
                  <Input
                    label="Container Color"
                    type="color"
                    value={this.props.siteSettings.containerColor}
                    valueHandler={this.props.getSettingsValueHandler(
                      'containerColor'
                    )}
                  />
                </div>
              </div>
              <Input
                label="Container Opacity"
                type="number"
                info="Enter a number between 0.00-1.00"
                min="0"
                max="1"
                step="0.01"
                value={this.props.siteSettings.containerOpacity}
                valueHandler={this.props.getSettingsValueHandler(
                  'containerOpacity'
                )}
              />

              <div>
                <h3>Samples</h3>
                <div>
                  <p>Text</p>
                  <p>
                    <a href="." onClick={e => e.preventDefault()}>
                      Test Link
                    </a>
                  </p>
                </div>
                <div
                  className="p-3"
                  style={{
                    backgroundColor: this.props.siteSettings.containerRgba
                      .string,
                    borderRadius: '0.25rem',
                    transition: 'background-color 1s linear'
                  }}
                >
                  <p>Text</p>
                  <p>
                    <a href="." onClick={e => e.preventDefault()}>
                      Link
                    </a>
                  </p>
                </div>
              </div>
            </form>
            <form
              method="POST"
              action={'/api/upload'}
              target="upload-bg-frame"
              encType="multipart/form-data"
              ref={this.uploadBgForm}
              className="d-none"
            >
              <input
                name="file"
                type="file"
                accept="image/*"
                ref={this.bgFileInput}
                onChange={event => {
                  this.uploadBgForm.current.submit()
                  this.setState(state => {
                    state.uploadingBg = true
                    return state
                  })
                }}
              />
              <input type="hidden" name="target" value="bg" />
            </form>
            <iframe
              id="upload-bg-frame"
              name="upload-bg-frame"
              title="upload"
              onLoad={() => {
                let iframe = document.getElementById('upload-bg-frame')
                if (iframe.contentWindow.location.href.indexOf('http') > -1) {
                  this.props.socket.emit('force-reload')
                  // FIXME: this should be fired after the emit is successfully sent
                  window.setTimeout(() => {
                    window.location.reload()
                  }, 500)
                  this.setState(state => {
                    state.uploadingBg = false
                    return state
                  })
                }
              }}
              className="d-none"
            />
            <form
              method="POST"
              action={'/api/upload'}
              target="upload-icon-frame"
              encType="multipart/form-data"
              ref={this.uploadIconForm}
              className="d-none"
            >
              <input
                name="file"
                type="file"
                accept="image/*"
                ref={this.iconFileInput}
                onChange={event => {
                  this.uploadIconForm.current.submit()
                  this.setState(state => {
                    state.uploadingIcon = true
                    return state
                  })
                }}
              />
              <input type="hidden" name="target" value="icon" />
            </form>
            <iframe
              id="upload-icon-frame"
              name="upload-icon-frame"
              title="upload"
              onLoad={() => {
                let iframe = document.getElementById('upload-icon-frame')
                if (iframe.contentWindow.location.href.indexOf('http') > -1) {
                  this.props.socket.emit('force-reload')
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
              className="d-none"
            />
          </div>
        ) : (
          ''
        )}
      </div>
    )
  }

  componentDidMount () {
    document.title = `Site Settings | ${this.props.siteSettings.siteTitle}`
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (
      nextProps.siteSettings.siteTitle !== this.props.siteSettings.siteTitle
    ) {
      document.title = `Site Settings | ${nextProps.siteSettings.siteTitle}`
    }
    return true
  }
}

export default Settings
