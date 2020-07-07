const client = require('../../__tests__/client.test.js')
const db = require('../db.js')

test('imports', () => {
  expect(typeof db).toBe('object')
})
test('GET /api/backups', async () => {
  const { auth } = await client.init()
  const response = await auth.get('/api/backups')
  expect(response.statusCode).toBe(200)
  expect(Array.isArray(response.body)).toBe(true)
})
