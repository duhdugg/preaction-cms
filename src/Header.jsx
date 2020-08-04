import PropTypes from 'prop-types'
import React from 'react'
import Page from './Page.jsx'

class Header extends React.Component {
  constructor(props) {
    super(props)
    this.page = React.createRef()
  }

  get cleanPath() {
    let path = '/home/header/'
    if (this.props.settings.headerPath.match(/\/header\/$/) !== null) {
      path = this.props.settings.headerPath
    }
    return path
  }

  reload() {
    this.page.current.reload()
  }

  render() {
    return (
      <div>
        {this.props.show === false ? (
          ''
        ) : (
          <div>
            {this.props.editable ? <h3>Header</h3> : ''}
            <Page
              appRoot={this.props.appRoot}
              editable={this.props.editable}
              emitSave={this.props.emitSave}
              fallbackSettings={this.props.settings}
              navigate={this.props.navigate}
              path={this.cleanPath}
              token={this.props.token}
              ref={this.page}
              initPage={this.props.initPage}
            />
          </div>
        )}
      </div>
    )
  }
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
