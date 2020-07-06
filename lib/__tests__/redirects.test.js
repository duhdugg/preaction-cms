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

test('create redirects', async () => {
  await server.sync()
  const token = await login()
  for (let i = 0; i < 3; i++) {
    const response = await agent.post(`/api/redirect?token=${token}`).send({
      match: `^testre-${i}$`,
      location: '/',
    })
    expect(response.statusCode).toBe(200)
  }
})

test('get redirects', async () => {
  const response = await request(server.http).get('/api/redirect')
  expect(response.statusCode).toBe(200)
  expect(response.body[0].match).toBe('^testre-0$')
  expect(response.body[1].match).toBe('^testre-1$')
})

test('update redirect', async () => {
  const response = await agent.put(`/api/redirect/1?token=${token}`).send({
    match: '^testre-00$',
    location: '/',
  })
  expect(response.statusCode).toBe(200)
})

test('delete redirect', async () => {
  const response = await agent.delete(`/api/redirect/1?token=${token}`)
  expect(response.statusCode).toBe(200)
})

describe('/api/redirect error responses', () => {
  test('admin required for POST', async () => {
    const response = await request(server.http).post(`/api/redirect`).send({})
    expect(response.statusCode).toBe(403)
    expect(response.body.error).toBe('forbidden')
  })
  test('csrf token protection for POST', async () => {
    const response = await agent.post(`/api/redirect`).send({})
    expect(response.statusCode).toBe(403)
    expect(response.body.error).toBe('invalid csrf token')
  })
  test('match is required', async () => {
    const response = await agent.post(`/api/redirect?token=${token}`).send({
      location: '/',
    })
    expect(response.statusCode).toBe(400)
    expect(response.body.error).toBe('no match provided')
  })
  test('location is required', async () => {
    const response = await agent.post(`/api/redirect?token=${token}`).send({
      match: 'test',
    })
    expect(response.statusCode).toBe(400)
    expect(response.body.error).toBe('no location provided')
  })
})

describe('/api/redirect/:id error responses', () => {
  test('admin required for PUT', async () => {
    const response = await request(server.http).put('/api/redirect/2').send({})
    expect(response.statusCode).toBe(403)
    expect(response.body.error).toBe('forbidden')
  })
  test('admin required for DELETE', async () => {
    const response = await request(server.http).delete('/api/redirect/2')
    expect(response.statusCode).toBe(403)
    expect(response.body.error).toBe('forbidden')
  })
  test('csrf protection for PUT', async () => {
    const response = await agent.put('/api/redirect/2').send({})
    expect(response.statusCode).toBe(403)
    expect(response.body.error).toBe('invalid csrf token')
  })
  test('csrf protection for DELETE', async () => {
    const response = await agent.delete('/api/redirect/2')
    expect(response.statusCode).toBe(403)
    expect(response.body.error).toBe('invalid csrf token')
  })
  test('match is required for PUT', async () => {
    const response = await agent.put(`/api/redirect/2?token=${token}`).send({
      location: '/',
    })
    expect(response.statusCode).toBe(400)
    expect(response.body.error).toBe('no match provided')
  })
  test('location is required for PUT', async () => {
    const response = await agent.put(`/api/redirect/2?token=${token}`).send({
      match: 'test',
    })
    expect(response.statusCode).toBe(400)
    expect(response.body.error).toBe('no location provided')
  })
  test('404 on invalid id', async () => {
    let response
    response = await agent.put(`/api/redirect/1234?token=${token}`).send({
      match: 'test',
      location: '/',
    })
    expect(response.statusCode).toBe(404)
    expect(response.body.error).toBe('not found')
    response = await agent.delete(`/api/redirect/1234?token=${token}`)
    expect(response.statusCode).toBe(404)
    expect(response.body.error).toBe('not found')
  })
})
