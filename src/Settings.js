import React from 'react'
import { Input, Textarea, Select } from 'preaction-inputs'

class Settings extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      newPageTitle: ''
    }
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

  render () {
    return (
      <div>
        {this.props.authenticated ? (
          <form className="form ml-3 mr-3" onSubmit={e => e.preventDefault()}>
            <h3>Site Settings</h3>
            <div className="row">
              <div className="col">
                <Input
                  label="Site Name"
                  type="text"
                  value={this.props.siteSettings.siteTitle}
                  valueHandler={this.props.getSettingsValueHandler('siteTitle')}
                />
                <Textarea
                  label="Site Description"
                  value={this.props.siteSettings.siteDescription}
                  valueHandler={this.props.getSettingsValueHandler(
                    'siteDescription'
                  )}
                />
                <Select
                  label="Nav Theme"
                  value={this.props.siteSettings.navTheme}
                  valueHandler={this.props.getSettingsValueHandler('navTheme')}
                >
                  <option />
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </Select>
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
                  valueHandler={this.props.getSettingsValueHandler('fontColor')}
                />
              </div>
            </div>
            <div className="row">
              <div className="col">
                <Input
                  label="Link Color"
                  type="color"
                  value={this.props.siteSettings.linkColor}
                  valueHandler={this.props.getSettingsValueHandler('linkColor')}
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
                  backgroundColor: this.props.siteSettings.containerRgba.string,
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
