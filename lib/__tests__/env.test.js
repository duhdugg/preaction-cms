const env = require('../env.js')

test('imports', () => {
  expect(typeof env).toBe('object')
})
