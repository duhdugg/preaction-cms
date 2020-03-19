import PropTypes from 'prop-types'
import React from 'react'

let ImgContainer = props =>
  props.linkUrl ? (
    <a
      href={props.linkUrl}
      rel='noreferrer noopener'
      target={
        String(props.linkUrl || '').indexOf('/') === 0 ? '_self' : '_blank'
      }
      onClick={e => {
        let r = new RegExp('(?:^[a-z][a-z0-9+.-]*:|//)', 'i')
        let href = props.linkUrl
        let absolute = r.test(href)
        if (props.navigate && !absolute) {
          e.preventDefault()
          if (href.indexOf(props.appRoot) === 0) {
            let regex = new RegExp(`^${props.appRoot}`)
            href = href.replace(regex, '')
          }
          props.navigate(href)
        }
      }}
    >
      {props.children}
    </a>
  ) : (
    <span>{props.children}</span>
  )
ImgContainer.propTypes = {
  appRoot: PropTypes.string.isRequired,
  children: PropTypes.node,
  linkUrl: PropTypes.string,
  navigate: PropTypes.func
}

class PageBlockImage extends React.Component {
  render() {
    return (
      <div className='page-block-content-type-image'>
        <ImgContainer
          appRoot={this.props.appRoot}
          linkUrl={this.props.content.settings.linkUrl}
          navigate={this.props.navigate}
        >
          <img
            src={`${this.props.appRoot}/uploads/${this.props.content.filename}`}
            style={{ width: '100%' }}
            alt={this.props.content.settings.altText || ''}
            title={this.props.content.settings.altText || ''}
          />
        </ImgContainer>
      </div>
    )
  }
}

PageBlockImage.propTypes = {
  appRoot: PropTypes.string.isRequired,
  content: PropTypes.object.isRequired,
  navigate: PropTypes.func
}

export default PageBlockImage
