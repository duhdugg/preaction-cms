import React from 'react'
import Page from './Page.js'

class Header extends React.Component {
  render () {
    return (
      <div>
        {this.props.editable ? <h3>Header</h3> : ''}
        <Page
          pageKey="header"
          editable={this.props.editable}
          siteSettings={this.props.siteSettings}
        />
      </div>
    )
  }
}

export default Header
