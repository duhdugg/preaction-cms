import PropTypes from 'prop-types'
import React from 'react'
import Page from './Page.jsx'

class Footer extends React.Component {
  constructor(props) {
    super(props)
    this.page = React.createRef()
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
              path='/home/footer/'
              ref={this.page}
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
  settings: PropTypes.object.isRequired,
  show: PropTypes.bool
}

export default Footer
