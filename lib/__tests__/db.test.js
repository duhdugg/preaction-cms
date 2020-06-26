/* global it, expect */
const db = require('../db.js')

it('imports', () => {
  expect(typeof db).toBe('object')
})
