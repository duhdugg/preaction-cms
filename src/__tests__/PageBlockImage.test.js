import React from 'react'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import PageBlockImage from '../PageBlockImage.jsx'

test('PageBlockImage basic', async () => {
  const mockContent = {
    id: 4,
    contentType: 'image',
    filename:
      '948b1fb4a2e0f6331c59817fea9cfbc5afebe9af5e6d293f2ec4736c3c418297.png',
    ordering: 1,
    settings: {
      altText: 'test-image',
      header: '',
      headerLevel: 0,
      linkUrl: '',
      lgWidth: 12,
      mdWidth: 12,
      smWidth: 12,
      xsWidth: 12,
    },
    wysiwyg: null,
    createdAt: '2020-09-08T15:05:24.525Z',
    updatedAt: '2020-09-08T15:05:24.525Z',
    pageblockId: 3,
  }

  const mockNavigate = () => {}

  const result = render(
    <PageBlockImage appRoot='' content={mockContent} navigate={mockNavigate} />
  )
  expect(result.getByAltText('test-image')).toBeInTheDocument()
})

test('PageBlockImage with link', async () => {
  const mockContent = {
    id: 4,
    contentType: 'image',
    filename:
      '948b1fb4a2e0f6331c59817fea9cfbc5afebe9af5e6d293f2ec4736c3c418297.png',
    ordering: 1,
    settings: {
      altText: 'test-image',
      header: '',
      headerLevel: 0,
      linkUrl: '/test/',
      lgWidth: 12,
      mdWidth: 12,
      smWidth: 12,
      xsWidth: 12,
    },
    wysiwyg: null,
    createdAt: '2020-09-08T15:05:24.525Z',
    updatedAt: '2020-09-08T15:05:24.525Z',
    pageblockId: 3,
  }

  let navigatePath
  const mockNavigate = (path) => {
    navigatePath = path
  }

  const result = render(
    <PageBlockImage appRoot='' content={mockContent} navigate={mockNavigate} />
  )
  expect(result.getByAltText('test-image')).toBeInTheDocument()
  userEvent.click(result.getByAltText('test-image'))
  await waitFor(() => expect(navigatePath).toBe('/test/'))
})
