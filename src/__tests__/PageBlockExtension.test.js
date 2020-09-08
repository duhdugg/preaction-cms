import PropTypes from 'prop-types'
import React from 'react'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { PageBlockExtension } from '../PageBlockExtension.jsx'
import { Input } from '@preaction/inputs'

function MockExtension(props) {
  return <div>foobar</div>
}

function MockExtensionSettings(props) {
  return (
    <div>
      <Input
        value={props.propsData.test}
        valueHandler={props.getPropsDataValueHandler('test')}
      />
    </div>
  )
}

MockExtensionSettings.propTypes = {
  propsData: PropTypes.object.isRequired,
  getPropsDataValueHandler: PropTypes.func.isRequired,
}

MockExtension.Settings = MockExtensionSettings

test('PageBlockExtension basic', () => {
  const mockIndex = { test: MockExtension }
  const propsData = {
    foo: 'bar',
  }
  const result = render(
    <PageBlockExtension
      extBlockIndex={mockIndex}
      extKey={'test'}
      propsData={propsData}
    />
  )
  expect(result.getByText('foobar')).toBeInTheDocument()
})

test('PageBlockExtension.Settings basic', async () => {
  const mockIndex = { test: MockExtension }
  const mockSettings = {
    propsData: {
      foo: 'bar',
      test: '',
    },
  }
  const mockGetPageBlockSettingsValueHandler = (key) => (value) => {
    mockSettings[key] = value
  }
  const result = render(
    <PageBlockExtension.Settings
      extBlockIndex={mockIndex}
      extKey={'test'}
      propsData={mockSettings.propsData}
      getPageBlockSettingsValueHandler={mockGetPageBlockSettingsValueHandler}
    />
  )
  expect(result.container.querySelector('input')).toBeInTheDocument()
  userEvent.type(result.container.querySelector('input'), '!')
  await waitFor(() => expect(mockSettings.propsData.test).toBe('!'))
})

test('PageBlockExtension not found', () => {
  const mockIndex = {}
  const propsData = {
    foo: 'bar',
  }
  const result = render(
    <PageBlockExtension
      extBlockIndex={mockIndex}
      extKey={'test'}
      propsData={propsData}
    />
  )
  expect(result.getByText('Error:')).toBeInTheDocument()
})
