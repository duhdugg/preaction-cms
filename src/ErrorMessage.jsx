import React from 'react'
import PropTypes from 'prop-types'
import { Wysiwyg } from '@preaction/inputs'

class ErrorMessage extends React.Component {
  constructor(props) {
    super(props)
    this.content = React.createRef()
  }

  get errorMessage() {
    return (
      this.props.errorMessage ||
      '<h1>Error</h1><p>The site encountered an unexpected error. Please check your connection and try again.</p>'
    )
  }

  render() {
    return (
      <div className='page-error-message'>
        <Wysiwyg value={this.errorMessage} theme='bubble' readOnly />
      </div>
    )
  }
}

ErrorMessage.propTypes = {
  errorMessage: PropTypes.string,
}

export default ErrorMessage
