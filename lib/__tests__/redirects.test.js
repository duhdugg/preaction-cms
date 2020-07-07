const client = require('../../__tests__/client.test.js')

test('create redirects', async () => {
  const { auth, token } = await client.init()
  for (let i = 0; i < 3; i++) {
    const response = await auth.post(`/api/redirect?token=${token}`).send({
      match: `^testre-${i}$`,
      location: '/',
    })
    expect(response.statusCode).toBe(200)
  }
})

test('get redirects', async () => {
  const { unauth } = await client.init()
  const response = await unauth.get('/api/redirect')
  expect(response.statusCode).toBe(200)
  expect(response.body[0].match).toBe('^testre-0$')
  expect(response.body[1].match).toBe('^testre-1$')
})

test('update redirect', async () => {
  const { auth, token } = await client.init()
  const response = await auth.put(`/api/redirect/1?token=${token}`).send({
    match: '^testre-00$',
    location: '/',
  })
  expect(response.statusCode).toBe(200)
})

test('delete redirect', async () => {
  const { auth, token } = await client.init()
  const response = await auth.delete(`/api/redirect/1?token=${token}`)
  expect(response.statusCode).toBe(200)
})

describe('/api/redirect error responses', () => {
  test('admin required for POST', async () => {
    const { unauth } = await client.init()
    const response = await unauth.post(`/api/redirect`).send({})
    expect(response.statusCode).toBe(403)
    expect(response.body.error).toBe('forbidden')
  })
  test('csrf token protection for POST', async () => {
    const { auth } = await client.init()
    const response = await auth.post(`/api/redirect`).send({})
    expect(response.statusCode).toBe(403)
    expect(response.body.error).toBe('invalid csrf token')
  })
  test('match is required', async () => {
    const { auth, token } = await client.init()
    const response = await auth.post(`/api/redirect?token=${token}`).send({
      location: '/',
    })
    expect(response.statusCode).toBe(400)
    expect(response.body.error).toBe('no match provided')
  })
  test('location is required', async () => {
    const { auth, token } = await client.init()
    const response = await auth.post(`/api/redirect?token=${token}`).send({
      match: 'test',
    })
    expect(response.statusCode).toBe(400)
    expect(response.body.error).toBe('no location provided')
  })
})

describe('/api/redirect/:id error responses', () => {
  test('admin required for PUT', async () => {
    const { unauth } = await client.init()
    const response = await unauth.put('/api/redirect/2').send({})
    expect(response.statusCode).toBe(403)
    expect(response.body.error).toBe('forbidden')
  })
  test('admin required for DELETE', async () => {
    const { unauth } = await client.init()
    const response = await unauth.delete('/api/redirect/2')
    expect(response.statusCode).toBe(403)
    expect(response.body.error).toBe('forbidden')
  })
  test('csrf protection for PUT', async () => {
    const { auth } = await client.init()
    const response = await auth.put('/api/redirect/2').send({})
    expect(response.statusCode).toBe(403)
    expect(response.body.error).toBe('invalid csrf token')
  })
  test('csrf protection for DELETE', async () => {
    const { auth } = await client.init()
    const response = await auth.delete('/api/redirect/2')
    expect(response.statusCode).toBe(403)
    expect(response.body.error).toBe('invalid csrf token')
  })
  test('match is required for PUT', async () => {
    const { auth, token } = await client.init()
    const response = await auth.put(`/api/redirect/2?token=${token}`).send({
      location: '/',
    })
    expect(response.statusCode).toBe(400)
    expect(response.body.error).toBe('no match provided')
  })
  test('location is required for PUT', async () => {
    const { auth, token } = await client.init()
    const response = await auth.put(`/api/redirect/2?token=${token}`).send({
      match: 'test',
    })
    expect(response.statusCode).toBe(400)
    expect(response.body.error).toBe('no location provided')
  })
  test('404 on invalid id', async () => {
    const { auth, token } = await client.init()
    let response
    response = await auth.put(`/api/redirect/1234?token=${token}`).send({
      match: 'test',
      location: '/',
    })
    expect(response.statusCode).toBe(404)
    expect(response.body.error).toBe('not found')
    response = await auth.delete(`/api/redirect/1234?token=${token}`)
    expect(response.statusCode).toBe(404)
    expect(response.body.error).toBe('not found')
  })
})
