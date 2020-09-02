import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import ErrorMessage from '../ErrorMessage'

test('ErrorMessage renders default message', () => {
  const result = render(<ErrorMessage />)
  expect(result.getByText('Error')).toBeInTheDocument()
})

test('ErrorMessage renders errorMessage', () => {
  const result = render(<ErrorMessage errorMessage='foobar' />)
  expect(result.getByText('foobar')).toBeInTheDocument()
})
