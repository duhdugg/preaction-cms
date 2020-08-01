import axios from 'axios'
import PropTypes from 'prop-types'
import React from 'react'
import inputs from '@preaction/inputs'
import bootstrapClips from '@preaction/bootstrap-clips'
import validation from '@preaction/validation'
import { Spinner } from '@preaction/bootstrap-clips'
import globalthis from 'globalthis'

const globalThis = globalthis()

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
    }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) {
      return <div className='alert alert-danger'>Error Loading Component</div>
    }
    return this.props.children
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
}

class PageBlockComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      Component: null,
      identifier: Math.random(),
    }
  }

  get containerId() {
    return `component-container-${this.state.identifier}`
  }

  get scriptId() {
    return `script-container-${this.state.identifier}`
  }

  loadComponent() {
    globalThis.axios = axios
    globalThis.React = React
    globalThis['@preaction/bootstrap-clips'] = bootstrapClips
    globalThis['@preaction/inputs'] = inputs
    globalThis['@preaction/validation'] = validation
    const script = document.createElement('script')
    script.async = true
    script.id = this.scriptId
    script.src = this.props.block.settings.src
    script.onload = () => {
      try {
        let Component = globalThis[this.props.block.settings.globalName].default
        this.setState({ Component })
      } catch (e) {
        this.setState({
          Component: new Error('error loading component'),
        })
      }
    }
    script.onerror = (e) => {
      if (this.props.block.settings.src) {
        this.setState({
          Component: new Error('error loading script'),
        })
      }
    }
    document.body.appendChild(script)
  }

  removeScript() {
    const script = document.getElementById(this.scriptId)
    if (script) {
      document.body.removeChild(script)
    }
  }

  render() {
    let Component = this.state.Component
    let componentProps = {}
    try {
      let obj = JSON.parse(this.props.block.settings.propsData)
      Object.assign(componentProps, obj)
    } catch (e) {}
    Object.assign(componentProps, {
      preaction: {
        appRoot: this.props.appRoot,
        block: this.props.block,
        editable: this.props.editable,
        navigate: this.props.navigate,
        page: this.props.page,
        settings: this.props.settings,
      },
    })
    return (
      <ErrorBoundary>
        <div className='component'>
          <div id={this.containerId}>
            {Component !== null ? (
              <Component {...componentProps} />
            ) : (
              <div className='spinner-container'>
                <Spinner size='3' />
              </div>
            )}
          </div>
        </div>
      </ErrorBoundary>
    )
  }
  componentDidMount() {
    if (this.props.block.settings.src) {
      this.loadComponent()
    } else {
      this.setState({
        Component: (props) => {
          return <div>Component Placeholder</div>
        },
      })
    }
  }
  componentWillUnmount() {
    this.removeScript()
  }
}

PageBlockComponent.propTypes = {
  appRoot: PropTypes.string.isRequired,
  block: PropTypes.object.isRequired,
  editable: PropTypes.bool.isRequired,
  navigate: PropTypes.func.isRequired,
  page: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
}

export default PageBlockComponent
