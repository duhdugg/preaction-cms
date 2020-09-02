import React from 'react'
import PropTypes from 'prop-types'

function ErrorMessage(props) {
  return (
    <div className='page-error-message'>
      <div className='preaction wysiwyg mb-3'>
        <div className='mock quill'>
          <div className='ql-container'>
            <div className='ql-editor'>
              {props.errorMessage ? (
                <div>{props.errorMessage}</div>
              ) : (
                <div>
                  <h1>Error</h1>
                  <p>
                    The site encountered an unexpected error. Please check your
                    connection and try again.
                  </p>
                </div>
              )}
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

export default ErrorMessage
