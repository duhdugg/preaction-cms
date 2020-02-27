import PropTypes from 'prop-types'
import React from 'react'
import Page from './Page.jsx'

class Header extends React.Component {
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
            {this.props.editable ? <h3>Header</h3> : ''}
            <Page
              editable={this.props.editable}
              emitSave={this.props.emitSave}
              path='/header/'
              ref={this.page}
            />
          </div>
        )}
      </div>
    )
  }
}

Header.propTypes = {
  editable: PropTypes.bool,
  emitSave: PropTypes.func.isRequired,
  show: PropTypes.bool
}

export default Header
