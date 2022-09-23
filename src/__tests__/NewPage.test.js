import React from 'react'
import NewPage from '../NewPage.jsx'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

function getResults() {
  const props = {
    activePathname: '/home/',
    getValueHandler: (key) => {
      return (value) => {
        props.newPage[key] = value
      }
    },
    newPage: { title: '', key: '' },
    submit: () => {
      state.submitted = true
    },
  }
  const state = {
    submitted: false,
    newPage: props.newPage,
  }
  const result = render(<NewPage {...props} />)
  const rerender = () => {
    result.rerender(<NewPage {...props} />)
  }
  return {
    rerender,
    result,
    state,
  }
}

test('NewPage renders without crashing', () => {
  const { result } = getResults()
  expect(result.container.firstChild).toBeInTheDocument()
})

test('NewPage fields alter state', async () => {
  const { rerender, result, state } = getResults()
  const title = 'Test'
  const key = 'test'
  for (let c = 0; c < title.length; c++) {
    const char = title[c]
    await userEvent.type(result.getByLabelText('Page Title *'), char)
    rerender()
  }
  for (let c = 0; c < key.length; c++) {
    const char = key[c]
    await userEvent.type(result.getByLabelText('URL Path *'), char)
    rerender()
  }
  expect(state.newPage.title).toBe('Test')
  expect(state.newPage.key).toBe('test')
})

test('NewPage form submits', async () => {
  const { rerender, result, state } = getResults()
  const title = 'Test'
  const key = 'test'
  for (let c = 0; c < title.length; c++) {
    const char = title[c]
    await userEvent.type(result.getByLabelText('Page Title *'), char)
    rerender()
  }
  for (let c = 0; c < key.length; c++) {
    const char = key[c]
    await userEvent.type(result.getByLabelText('URL Path *'), char)
    rerender()
  }
  expect(state.submitted).toBe(false)
  await userEvent.click(result.container.querySelector('button'))
  expect(state.submitted).toBe(true)
})

test('NewPage form does not submit when invalid', async () => {
  const { rerender, result, state } = getResults()
  const key = 'test'
  for (let c = 0; c < key.length; c++) {
    const char = key[c]
    await userEvent.type(result.getByLabelText('URL Path *'), char)
    rerender()
  }
  expect(state.submitted).toBe(false)
  await userEvent.click(result.container.querySelector('button'))
  expect(state.submitted).toBe(false)
})
