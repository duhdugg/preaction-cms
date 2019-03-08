import React from 'react'
import Page from './Page.js'

class Header extends React.Component {
  render () {
    return (
      <div>
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
