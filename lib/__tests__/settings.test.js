const request = require('supertest')
const server = require('../../server.js')
const session = require('../session.js')

const agent = request.agent(server.http)
let token

const login = async () => {
  await session.updateAdminPassword('admin')
  const tokenResponse = await agent.get('/api/token')
  expect(tokenResponse.statusCode).toBe(200)
  token = tokenResponse.body
  const username = 'admin'
  const password = 'admin'
  const loginResponse = await agent.post(`/api/login?token=${token}`).send({
    username,
    password,
  })
  const sessionResponse = await agent.get('/api/session')
  expect(loginResponse.statusCode).toBe(200)
  expect(loginResponse.body.authenticated).toBe(true)
  expect(sessionResponse.statusCode).toBe(200)
  expect(sessionResponse.body.authenticated).toBe(true)
  return token
}

test('GET /api/settings', async () => {
  await server.sync()
  const response = await request(server.http).get('/api/settings')
  expect(response.statusCode).toBe(200)
})
test('POST /api/settings', async () => {
  const token = await login()
  const response = await agent.post(`/api/settings?token=${token}`).send({})
  expect(response.statusCode).toBe(200)
})
