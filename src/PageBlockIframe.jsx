import PropTypes from 'prop-types'
import React from 'react'

function PageBlockIframe(props) {
  const [height, setHeight] = React.useState(0)
  const [mounted, setMounted] = React.useState(false)
  const [iframeResizeInterval, setIframeResizeInterval] = React.useState(null)
  const iframe = React.useRef()
  React.useEffect(() => {
    if (!mounted) {
      setMounted(true)
      setIframeResizeInterval(
        setInterval(() => {
          let h = '10em'
          try {
            h = iframe.current.contentWindow.document.body.clientHeight + 'px'
          } catch {}
          if (h !== height) {
            setHeight(h)
          }
        }, 250)
      )
    }
    return () => {
      clearInterval(iframeResizeInterval)
    }
  }, [setIframeResizeInterval, iframeResizeInterval, iframe, height, mounted])
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
