import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import NotFound from '../NotFound'

test('NotFound renders .not-found without crashing', () => {
  const result = render(<NotFound />)
  expect(result.container.firstChild).toHaveClass('not-found')
})
