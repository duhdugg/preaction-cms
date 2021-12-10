import PropTypes from 'prop-types'
import React from 'react'
import Page from './Page.jsx'

function Hero(props) {
  const path =
    props.settings.heroPath.match(/\/hero\/$/) !== null
      ? props.settings.heroPath
      : '/home/hero/'
  return (
    <div>
      {props.editable ? (
        <div className='font-weight-bold'>Hero: {path}</div>
      ) : (
        ''
      )}
      <Page
        appRoot={props.appRoot}
        editable={props.editable}
        emitSave={props.emitSave}
        fallbackSettings={props.settings}
        navigate={props.navigate}
        path={path}
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
