import React from 'react'
import PropTypes from 'prop-types'
import { Wysiwyg } from '@preaction/inputs'

function ErrorMessage(props) {
  const errorMessage =
    props.errorMessage ||
    '<h1>Error</h1><p>The site encountered an unexpected error. Please check your connection and try again.</p>'
  return (
    <div className='page-error-message'>
      <Wysiwyg value={errorMessage} theme='bubble' />
    </div>
  )
}

ErrorMessage.propTypes = {
  errorMessage: PropTypes.string,
}

export default ErrorMessage
