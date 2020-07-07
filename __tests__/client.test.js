const request = require('supertest')
const server = require('../server.js')
const session = require('../lib/session.js')

test('test client', () => {
  expect(typeof Client).toBe('function')
})

class Client extends Object {
  async init() {
    if (!this.unauth) {
      await server.sync()
      this.unauth = request(server.http)
    }
    const unauth = this.unauth
    if (this.auth && this.token) {
      const auth = this.auth
      const token = this.token
      return { auth, token, unauth }
    }
    await session.updateAdminPassword('admin')
    const auth = request.agent(server.http)
    const tokenResponse = await auth.get('/api/token')
    expect(tokenResponse.statusCode).toBe(200)
    const token = tokenResponse.body
    const username = 'admin'
    const password = 'admin'
    const loginResponse = await auth.post(`/api/login?token=${token}`).send({
      username,
      password,
    })
    const sessionResponse = await auth.get('/api/session')
    expect(loginResponse.statusCode).toBe(200)
    expect(loginResponse.body.authenticated).toBe(true)
    expect(sessionResponse.statusCode).toBe(200)
    expect(sessionResponse.body.authenticated).toBe(true)
    this.auth = auth
    this.token = token
    return { auth, token, unauth }
  }
}

module.exports = new Client()
