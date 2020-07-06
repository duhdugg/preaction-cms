const request = require('supertest')
const db = require('../db.js')
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

test('imports', () => {
  expect(typeof db).toBe('object')
})
test('GET /api/backups', async () => {
  await server.sync()
  await login()
  const response = await agent.get('/api/backups')
  expect(response.statusCode).toBe(200)
  expect(Array.isArray(response.body)).toBe(true)
})
