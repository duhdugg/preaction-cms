import PropTypes from 'prop-types'
import React from 'react'

class PageBlockImage extends React.Component {
  render() {
    return (
      <div className='page-block-image'>
        <img
          src={`${this.props.appRoot}/uploads/${this.props.content.filename}`}
          style={{ width: '100%' }}
          alt=''
        />
      </div>
    )
  }
}

PageBlockImage.propTypes = {
  appRoot: PropTypes.string.isRequired,
  content: PropTypes.object.isRequired
}

export default PageBlockImage
