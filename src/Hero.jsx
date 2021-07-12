import PropTypes from 'prop-types'
import React from 'react'
import Page from './Page.jsx'

class Hero extends React.Component {
  constructor(props) {
    super(props)
    this.page = React.createRef()
  }

  get cleanPath() {
    let path = '/home/hero/'
    if (this.props.settings.heroPath.match(/\/hero\/$/) !== null) {
      path = this.props.settings.heroPath
    }
    return path
  }

  reload() {
    this.page.current.reload()
  }

  render() {
    return (
      <div>
        {this.props.editable ? (
          <div className='font-weight-bold'>Hero: {this.cleanPath}</div>
        ) : (
          ''
        )}
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
    )
  }
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
