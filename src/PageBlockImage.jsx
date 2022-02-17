import PropTypes from 'prop-types'
import React from 'react'
import absoluteUrl from './lib/absoluteUrl.js'

function ImgContainer(props) {
  return props.linkUrl ? (
    <a
      href={props.linkUrl}
      rel='noreferrer noopener'
      target={absoluteUrl(props.linkUrl) ? '_blank' : 'self'}
    >
      {props.children}
    </a>
  ) : (
    <span>{props.children}</span>
  )
}
ImgContainer.propTypes = {
  children: PropTypes.node,
  linkUrl: PropTypes.string,
}

function PageBlockImage(props) {
  return (
    <div className='page-block-content-type-image'>
      <ImgContainer linkUrl={props.content.settings.linkUrl}>
        <img
          style={{ width: '100%' }}
          alt={props.content.settings.altText || ''}
          src={props.content.settings.src}
          title={props.content.settings.altText || ''}
        />
      </ImgContainer>
    </div>
  )
}

PageBlockImage.propTypes = {
  content: PropTypes.object.isRequired,
}

export default PageBlockImage
