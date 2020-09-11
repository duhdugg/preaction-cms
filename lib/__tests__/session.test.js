const client = require('../../__tests__/client.test.js')
const session = require('../session.js')

test('imports', () => {
  expect(typeof session).toBe('object')
})
test('exports middleware', () => {
  expect(typeof session.middleware).toBe('function')
})
test('logout', async () => {
  const { auth, token } = await client.init()
  const response = await auth.get(`/api/logout?token=${token}`)
  expect(response.statusCode).toBe(200)
  const sessionResponse = await auth.get('/api/session')
  expect(sessionResponse.body.authenticated).toBe(false)
  expect(sessionResponse.body.admin).toBe(false)
})
