import React from 'react'
import PropTypes from 'prop-types'

class PageBlockExtension extends React.Component {
  render() {
    let Component = (
      <div className='alert alert-danger'>
        <strong>Error:</strong> Extension {this.props.extKey} not found!
      </div>
    )
    const extBlockIndex = this.props.extBlockIndex || {}
    if (extBlockIndex[this.props.extKey]) {
      Component = React.createElement(extBlockIndex[this.props.extKey], {
        ...this.props.propsData,
      })
    }
    return Component
  }
}

PageBlockExtension.propTypes = {
  extBlockIndex: PropTypes.object,
  extKey: PropTypes.string.isRequired,
  propsData: PropTypes.object.isRequired,
}

class PageBlockExtensionSettings extends React.Component {
  getPropsDataValueHandler(key) {
    return (value) => {
      const propsData = JSON.parse(JSON.stringify(this.props.propsData))
      propsData[key] = value
      this.props.getPageBlockSettingsValueHandler('propsData')(propsData)
    }
  }

  render() {
    let Settings = <div />
    const extBlockIndex = this.props.extBlockIndex || {}
    if (extBlockIndex[this.props.extKey].Settings) {
      Settings = React.createElement(
        extBlockIndex[this.props.extKey].Settings,
        {
          propsData: this.props.propsData,
          getPropsDataValueHandler: this.getPropsDataValueHandler.bind(this),
        }
      )
    }
    return Settings
  }
}

PageBlockExtensionSettings.propTypes = {
  extBlockIndex: PropTypes.object,
  extKey: PropTypes.string.isRequired,
  getPageBlockSettingsValueHandler: PropTypes.func.isRequired,
  propsData: PropTypes.object.isRequired,
}

PageBlockExtension.Settings = PageBlockExtensionSettings

export { PageBlockExtension }
