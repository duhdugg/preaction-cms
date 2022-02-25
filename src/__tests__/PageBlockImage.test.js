import React from 'react'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import PageBlockImage from '../PageBlockImage.jsx'

test('PageBlockImage basic', async () => {
  const mockContent = {
    id: 4,
    contentType: 'image',
    ordering: 1,
    settings: {
      altText: 'test-image',
      header: '',
      headerLevel: 0,
      linkUrl: '',
      src: '/uploads/948b1fb4a2e0f6331c59817fea9cfbc5afebe9af5e6d293f2ec4736c3c418297.png',
      xxlWidth: 12,
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

  const result = render(<PageBlockImage appRoot='' content={mockContent} />)
  expect(result.getByAltText('test-image')).toBeInTheDocument()
})

test('PageBlockImage with link', async () => {
  const mockContent = {
    id: 4,
    contentType: 'image',
    ordering: 1,
    settings: {
      altText: 'test-image',
      header: '',
      headerLevel: 0,
      linkUrl: '/test/',
      src: '/uploads/948b1fb4a2e0f6331c59817fea9cfbc5afebe9af5e6d293f2ec4736c3c418297.png',
      xxlWidth: 12,
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

  const result = render(<PageBlockImage appRoot='' content={mockContent} />)
  expect(result.getByAltText('test-image')).toBeInTheDocument()
})
