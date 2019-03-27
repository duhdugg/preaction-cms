import React from 'react'
import Page from './Page.js'

class Footer extends React.Component {
  render () {
    return (
      <div>
        {this.props.editable ? <h3>Footer</h3> : ''}
        <Page
          editable={this.props.editable}
          pageKey="footer"
          siteSettings={this.props.siteSettings}
        />
      </div>
    )
  }
}

export default Footer
