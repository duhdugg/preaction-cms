import PropTypes from 'prop-types'
import React from 'react'
import Page from './Page.jsx'

function Footer(props) {
  const getCleanPath = () => {
    let path = '/home/footer/'
    if (props.settings.footerPath.match(/\/footer\/$/) !== null) {
      path = props.settings.footerPath
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
            <div className='font-weight-bold'>Footer: {getCleanPath()}</div>
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

Footer.propTypes = {
  appRoot: PropTypes.string.isRequired,
  editable: PropTypes.bool,
  emitSave: PropTypes.func.isRequired,
  initPage: PropTypes.object,
  navigate: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  show: PropTypes.bool,
  token: PropTypes.string,
}

export default Footer
