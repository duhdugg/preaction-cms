import React from 'react'
import Page from './Page.js'

class Header extends React.Component {
  constructor (props) {
    super(props)
    this.page = React.createRef()
  }

  reload () {
    this.page.current.reload()
  }

  render () {
    return (
      <div>
        {this.props.editable ? <h3>Header</h3> : ''}
        <Page
          editable={this.props.editable}
          emitSave={this.props.emitSave}
          pageKey="header"
          siteSettings={this.props.siteSettings}
          ref={this.page}
        />
      </div>
    )
  }
}

export default Header
