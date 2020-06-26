/* global it, expect */
const env = require('../env.js')

it('imports', () => {
  expect(typeof env).toBe('object')
})
