import PropTypes from 'prop-types'
import React from 'react'
import axios from 'axios'
import { Form, Input } from '@preaction/inputs'

class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      password: '',
    }
  }

  loadToken() {
    axios.get(`${this.props.appRoot}/api/token`).then((token) => {
      this.props.setToken(token)
    })
  }

  loginSubmit(event) {
    event.preventDefault()
    const { username, password } = this.state
    const token = this.props.token
    if (event.target.checkValidity()) {
      axios
        .post(`${this.props.appRoot}/api/login`, { username, password, token })
        .then((response) => {
          window.location.href = `${this.props.appRoot}/`
        })
        .catch((e) => {
          window.alert('incorrect login')
        })
    }
  }

  getLoginValueHandler(key) {
    return (value) => {
      if (key === 'username') {
        value = value.toLowerCase()
      }
      this.setState((state) => {
        state[key] = value
        return state
      })
    }
  }

  render() {
    return (
      <Form onSubmit={this.loginSubmit.bind(this)} noValidate>
        <Input
          label='Username'
          autoComplete='username'
          required
          valueHandler={this.getLoginValueHandler('username')}
        />
        <Input
          type='password'
          autoComplete='current-password'
          label='Password'
          required
          valueHandler={this.getLoginValueHandler('password')}
        />
        <button type='submit' className='btn btn-success'>
          Log In
        </button>
      </Form>
    )
  }

  componentDidMount() {
    document.title = `Login | ${this.props.settings.siteTitle}`
    this.loadToken()
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.settings.siteTitle !== this.props.settings.siteTitle) {
      document.title = `Login | ${nextProps.settings.siteTitle}`
    }
    return true
  }
}

Login.propTypes = {
  appRoot: PropTypes.string.isRequired,
  settings: PropTypes.object.isRequired,
  setToken: PropTypes.func.isRequired,
  token: PropTypes.string,
}

export default Login
