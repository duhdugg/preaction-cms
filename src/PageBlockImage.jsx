import PropTypes from 'prop-types'
import React from 'react'

class PageBlockImage extends React.Component {
  render() {
    return (
      <div className='page-block-image'>
        <img
          src={`/uploads/${this.props.content.filename}`}
          style={{ width: '100%' }}
          alt=''
        />
      </div>
    )
  }
}

PageBlockImage.propTypes = {
  content: PropTypes.object.isRequired
}

export default PageBlockImage
