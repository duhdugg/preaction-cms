import PropTypes from 'prop-types'
import React from 'react'
import Page from './Page.jsx'

class Footer extends React.Component {
  constructor(props) {
    super(props)
    this.page = React.createRef()
  }

  get cleanPath() {
    let path = '/home/footer/'
    if (this.props.settings.footerPath.match(/\/footer\/$/) !== null) {
      path = this.props.settings.footerPath
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
            {this.props.editable ? <h3>Footer</h3> : ''}
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
