import PropTypes from 'prop-types'
import React from 'react'
import axios from 'axios'
import { Form, Input } from '@preaction/inputs'
import globalthis from 'globalthis'

const globalThis = globalthis()

function Login(props) {
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [mounted, setMounted] = React.useState(false)

  const loadToken = React.useCallback(() => {
    axios.get(`${props.appRoot}/api/token`).then((response) => {
      props.setToken(response.data)
    })
  }, [props])

  const loginSubmit = (event) => {
    event.preventDefault()
    if (event.target.checkValidity()) {
      axios
        .post(`${props.appRoot}/api/login?token=${props.token}`, {
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

  React.useEffect(() => {
    document.title = `Login | ${props.settings.siteTitle}`
    if (!mounted) {
      loadToken()
      setMounted(true)
    }
  }, [mounted, props, loadToken])

  return (
    <Form onSubmit={loginSubmit} noValidate>
      <Input
        label='Username'
        autoComplete='username'
        required
        valueHandler={usernameValueHandler}
      />
      <Input
        type='password'
        autoComplete='current-password'
        label='Password'
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
