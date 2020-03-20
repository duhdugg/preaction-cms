import PropTypes from 'prop-types'
import React from 'react'

class PageBlockIframe extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      height: 0,
      showSettings: false
    }
    this.iframe = React.createRef()
    this.iframeResizeInterval = null
  }

  get height() {
    return this.state.height
  }

  toggleSettings() {
    this.setState(state => {
      state.showSettings = !state.showSettings
      return state
    })
  }

  render() {
    return (
      <iframe
        src={this.props.block.settings.iframeSrc}
        style={{
          border: 0,
          width: '100%',
          height: this.height
        }}
        title='iframe'
        ref={this.iframe}
      />
    )
  }

  componentDidMount() {
    this.iframeResizeInterval = setInterval(() => {
      let height = '10em'
      try {
        height =
          this.iframe.current.contentWindow.document.body.clientHeight + 'px'
      } catch {}
      if (height !== this.state.height) {
        this.setState(state => {
          state.height = height
          return state
        })
      }
    }, 250)
  }
}

PageBlockIframe.propTypes = {
  appRoot: PropTypes.string.isRequired,
  block: PropTypes.object.isRequired,
  editable: PropTypes.bool,
  emitSave: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired,
  page: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired
}

export default PageBlockIframe
