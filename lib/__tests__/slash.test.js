const client = require('../../__tests__/client.test.js')
const slash = require('../slash.js')

test('imports', () => {
  expect(typeof slash).toBe('object')
})
test('exports middleware', () => {
  expect(typeof slash.middleware).toBe('function')
})
test('redirect on non-trailing slash', async () => {
  const { unauth } = await client.init()
  const response = await unauth.get('/test0')
  expect(response.statusCode).toBe(302)
  expect(response.header.location).toBe('/test0/')
})
test('redirect with query intact', async () => {
  const { unauth } = await client.init()
  const response = await unauth.get('/test1?foo=bar')
  expect(response.statusCode).toBe(302)
  expect(response.header.location).toBe('/test1/?foo=bar')
})
test('do not redirect on trailing slash', async () => {
  const { unauth } = await client.init()
  const response = await unauth.get('/test404/')
  expect(response.statusCode).toBe(404)
})
