import PropTypes from 'prop-types'
import React from 'react'
import axios from 'axios'
import { Form, Input } from '@preaction/inputs'
import globalthis from 'globalthis'

const globalThis = globalthis()

class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      password: '',
    }
  }

  loadToken() {
    axios.get(`${this.props.appRoot}/api/token`).then((response) => {
      this.props.setToken(response.data)
    })
  }

  loginSubmit(event) {
    event.preventDefault()
    const { username, password } = this.state
    if (event.target.checkValidity()) {
      axios
        .post(`${this.props.appRoot}/api/login?token=${this.props.token}`, {
          username,
          password,
        })
        .then((response) => {
          this.props.loadSession()
          this.props.navigate('/')
        })
        .catch((e) => {
          globalThis.alert('incorrect login')
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
  loadSession: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  setToken: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired,
  token: PropTypes.string,
}

export default Login
