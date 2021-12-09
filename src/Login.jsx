import PropTypes from 'prop-types'
import React from 'react'
import axios from 'axios'
import { Form, Input } from '@preaction/inputs'

function Login(props) {
  // PROPS DESTRUCTURING
  const { appRoot, setToken } = props
  // STATE
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  // CALLBACKS
  const loadToken = React.useCallback(() => {
    axios.get(`${appRoot}/api/token`).then((response) => {
      setToken(response.data)
    })
  }, [appRoot, setToken])
  // HANDLERS
  const loginSubmit = (event) => {
    event.preventDefault()
    if (event.target.checkValidity()) {
      axios
        .post(`${appRoot}/api/login?token=${props.token}`, {
          username,
          password,
        })
        .then((response) => {
          props.loadSession()
          props.navigate('/')
        })
        .catch((e) => {
          globalThis.alert('incorrect login')
        })
    }
  }
  const usernameValueHandler = (value) => {
    setUsername(value.toLowerCase())
  }
  // SIDE EFFECTS
  React.useEffect(() => {
    document.title = `Login | ${props.settings.siteTitle}`
  }, [props.settings])
  React.useEffect(() => {
    loadToken()
  }, [loadToken])
  // RENDER
  return (
    <Form onSubmit={loginSubmit} noValidate>
      <Input
        label='Username'
        labelFloat
        autoComplete='username'
        required
        valueHandler={usernameValueHandler}
      />
      <Input
        type='password'
        autoComplete='current-password'
        label='Password'
        labelFloat
        required
        valueHandler={setPassword}
      />
      <button type='submit' className='btn btn-success'>
        Log In
      </button>
    </Form>
  )
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
