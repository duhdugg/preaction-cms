import React from 'react'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import Login from '../Login.jsx'

const server = setupServer(
  rest.get('/api/token', (req, res, ctx) => {
    return res(ctx.json('foobar'))
  }),
  rest.post('/api/login', (req, res, ctx) => {
    return res(
      ctx.json({
        authenticated: true,
        admin: true,
      })
    )
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('Login', async () => {
  let loadSessionCalled = false
  const mockLoadSession = () => {
    loadSessionCalled = true
  }
  const mockSettings = { siteTitle: 'Preaction CMS' }
  let token
  const mockSetToken = (value) => {
    token = value
  }
  let latestNavigatePath
  const mockNavigate = (path) => {
    latestNavigatePath = path
  }
  const result = render(
    <Login
      appRoot=''
      loadSession={mockLoadSession}
      settings={mockSettings}
      setToken={mockSetToken}
      navigate={mockNavigate}
      token={token}
    />
  )
  expect(result.getByText('Username')).toBeInTheDocument()
  expect(result.getByText('Password')).toBeInTheDocument()
  expect(result.getByText('Log In')).toBeInTheDocument()
  await waitFor(() => expect(token).toBe('foobar'))
  await userEvent.type(result.getByLabelText('Username *'), 'admin')
  await userEvent.type(result.getByLabelText('Password *'), 'pass')
  await userEvent.click(result.getByText('Log In'))
  await expect(loadSessionCalled).toBe(true)
  await expect(latestNavigatePath).toBe('/')
})
