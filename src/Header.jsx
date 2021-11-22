import PropTypes from 'prop-types'
import React from 'react'
import Page from './Page.jsx'

function Header(props) {
  const getCleanPath = () => {
    let path = '/home/header/'
    if (props.settings.headerPath.match(/\/header\/$/) !== null) {
      path = props.settings.headerPath
    }
    return path
  }
  return (
    <div>
      {props.show === false ? (
        ''
      ) : (
        <div>
          {props.editable ? (
            <div className='font-weight-bold'>Header: {getCleanPath()}</div>
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
