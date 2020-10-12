import React from 'react'
import PropTypes from 'prop-types'

function ErrorMessage(props) {
  return (
    <div className='page-error-message'>
      <div className='preaction wysiwyg'>
        <div className='mock quill'>
          <div className='ql-container'>
            <div className='ql-editor'>
              <div>
                <h1>Error</h1>
                <p>{props.errorMessage}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

ErrorMessage.propTypes = {
  errorMessage: PropTypes.string,
}

ErrorMessage.defaultProps = {
  errorMessage:
    'The site encountered an unexpected error. Please check your connection and try again.',
}

export default ErrorMessage
