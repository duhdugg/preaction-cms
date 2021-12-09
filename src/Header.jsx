import PropTypes from 'prop-types'
import React from 'react'
import Page from './Page.jsx'

function Header(props) {
  const path =
    props.settings.headerPath.match(/\/header\/$/) !== null
      ? props.settings.headerPath
      : '/home/header/'
  return (
    <div>
      {props.show === false ? (
        ''
      ) : (
        <div>
          {props.editable ? (
            <div className='font-weight-bold'>Header: {path}</div>
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
      )}
    </div>
  )
}

Header.propTypes = {
  appRoot: PropTypes.string.isRequired,
  editable: PropTypes.bool,
  emitSave: PropTypes.func.isRequired,
  initPage: PropTypes.object,
  navigate: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  show: PropTypes.bool,
  token: PropTypes.string,
}

export default Header
