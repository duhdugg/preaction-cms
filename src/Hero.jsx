import PropTypes from 'prop-types'
import React from 'react'
import Page from './Page.jsx'

function Hero(props) {
  const getCleanPath = () => {
    let path = '/home/hero/'
    if (props.settings.heroPath.match(/\/hero\/$/) !== null) {
      path = props.settings.heroPath
    }
    return path
  }
  return (
    <div>
      {props.editable ? (
        <div className='font-weight-bold'>Hero: {getCleanPath()}</div>
      ) : (
        ''
      )}
      <Page
        appRoot={props.appRoot}
        editable={props.editable}
        emitSave={props.emitSave}
        fallbackSettings={props.settings}
        navigate={props.navigate}
        path={getCleanPath()}
        token={props.token}
        initPage={props.initPage}
      />
    </div>
  )
}

Hero.propTypes = {
  appRoot: PropTypes.string.isRequired,
  editable: PropTypes.bool,
  emitSave: PropTypes.func.isRequired,
  initPage: PropTypes.object,
  navigate: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  token: PropTypes.string,
}

export default Hero
