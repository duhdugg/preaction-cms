import React from 'react'
import PropTypes from 'prop-types'

function PageBlockExtension(props) {
  let Component = (
    <div className='alert alert-danger'>
      <strong>Error:</strong> Extension {props.extKey} not found!
    </div>
  )
  const extBlockIndex = props.extBlockIndex || {}
  if (extBlockIndex[props.extKey]) {
    Component = React.createElement(extBlockIndex[props.extKey], {
      ...props.propsData,
    })
  }
  return Component
}

PageBlockExtension.propTypes = {
  extBlockIndex: PropTypes.object,
  extKey: PropTypes.string.isRequired,
  propsData: PropTypes.object.isRequired,
}

function PageBlockExtensionSettings(props) {
  const { getPageBlockSettingsValueHandler } = props
  const getPropsDataValueHandler = React.useCallback(
    (key) => {
      return (value) => {
        const propsData = JSON.parse(JSON.stringify(props.propsData))
        propsData[key] = value
        getPageBlockSettingsValueHandler('propsData')(propsData)
      }
    },
    [props.propsData, getPageBlockSettingsValueHandler]
  )

  let Settings = <div />
  const extBlockIndex = props.extBlockIndex || {}
  if (extBlockIndex[props.extKey].Settings) {
    Settings = React.createElement(extBlockIndex[props.extKey].Settings, {
      propsData: props.propsData,
      getPropsDataValueHandler,
    })
  }
  return Settings
}

PageBlockExtensionSettings.propTypes = {
  extBlockIndex: PropTypes.object,
  extKey: PropTypes.string.isRequired,
  getPageBlockSettingsValueHandler: PropTypes.func.isRequired,
  propsData: PropTypes.object.isRequired,
}

PageBlockExtension.Settings = PageBlockExtensionSettings

export { PageBlockExtension }
