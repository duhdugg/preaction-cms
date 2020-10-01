import PropTypes from 'prop-types'
import React from 'react'

function PageBlockIframe(props) {
  const [height, setHeight] = React.useState(0)
  const iframeResizeInterval = React.useRef(null)
  const iframe = React.useRef()
  const firstRender = React.useRef(true)
  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      iframeResizeInterval.current = setInterval(() => {
        let h = `${props.block.settings.height || 32}em`
        try {
          h = iframe.current.contentWindow.document.body.clientHeight + 'px'
        } catch {}
        if (h !== height) {
          setHeight(h)
        }
      }, 250)
    }
    return () => {
      clearInterval(iframeResizeInterval)
      iframeResizeInterval.current = null
    }
  }, [iframeResizeInterval, iframe, height, firstRender, props])
  return (
    <iframe
      src={props.block.settings.iframeSrc}
      style={{
        border: 0,
        width: '100%',
        height,
      }}
      title='iframe'
      ref={iframe}
    />
  )
}

PageBlockIframe.propTypes = {
  block: PropTypes.object.isRequired,
}

export default PageBlockIframe
