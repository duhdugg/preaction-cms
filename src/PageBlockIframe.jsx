import PropTypes from 'prop-types'
import React from 'react'

function PageBlockIframe(props) {
  // STATE
  const [height, setHeight] = React.useState(0)
  // REFS
  const iframeResizeInterval = React.useRef(null)
  const iframe = React.useRef()
  // SIDE EFFECTS
  React.useEffect(() => {
    iframeResizeInterval.current = setInterval(() => {
      let h = `${props.block.settings.height || 32}em`
      try {
        h = iframe.current.contentWindow.document.body.clientHeight + 'px'
      } catch {}
      if (h !== height) {
        setHeight(h)
      }
    }, 250)
    return () => {
      clearInterval(iframeResizeInterval)
      iframeResizeInterval.current = null
    }
  }, [height, props.block.settings.height])
  // RENDER
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
