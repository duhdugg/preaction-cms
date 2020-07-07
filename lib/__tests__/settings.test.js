const client = require('../../__tests__/client.test.js')

test('GET /api/settings', async () => {
  const { unauth } = await client.init()
  const response = await unauth.get('/api/settings')
  expect(response.statusCode).toBe(200)
})
test('POST /api/settings', async () => {
  const { auth, token } = await client.init()
  const response = await auth.post(`/api/settings?token=${token}`).send({})
  expect(response.statusCode).toBe(200)
})
