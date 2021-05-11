import React from 'react'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import PageBlockContent from '../PageBlockContent.jsx'

test('PageBlockContent wysiwyg', () => {
  const mockBlock = {
    id: 3,
    blockType: 'content',
    ordering: 0,
    settings: {
      header: '',
      headerLevel: 0,
      lgWidth: 12,
      mdWidth: 12,
      smWidth: 12,
      xsWidth: 12,
    },
    createdAt: '2020-09-07T21:52:14.153Z',
    updatedAt: '2020-09-07T21:52:14.153Z',
    pageId: 1,
    pageblockcontents: [
      {
        id: 3,
        contentType: 'wysiwyg',
        ordering: 0,
        settings: {
          header: 'Wysiwyg Content',
          headerLevel: '2',
          lgWidth: 12,
          mdWidth: 12,
          smWidth: 12,
          xsWidth: 12,
        },
        wysiwyg: '<h1>FooBar</h1>',
        createdAt: '2020-09-07T21:52:14.189Z',
        updatedAt: '2020-09-08T17:21:07.081Z',
        pageblockId: 3,
      },
      {
        id: 5,
        contentType: 'image',
        ordering: 1,
        settings: {
          altText: '',
          header: 'Image Content',
          headerLevel: '',
          linkUrl: '',
          src: '/uploads/948b1fb4a2e0f6331c59817fea9cfbc5afebe9af5e6d293f2ec4736c3c418297.png',
          lgWidth: '3',
          mdWidth: '3',
          smWidth: '4',
          xsWidth: '6',
        },
        wysiwyg: 'null',
        createdAt: '2020-09-08T17:20:06.046Z',
        updatedAt: '2020-09-08T17:21:17.516Z',
        pageblockId: 3,
      },
    ],
  }
  const mockContent = {
    id: 3,
    contentType: 'wysiwyg',
    ordering: 0,
    settings: {
      header: 'Wysiwyg Content',
      headerLevel: '2',
      lgWidth: 12,
      mdWidth: 12,
      smWidth: 12,
      xsWidth: 12,
    },
    wysiwyg: '<h1>FooBar</h1>',
    createdAt: '2020-09-07T21:52:14.189Z',
    updatedAt: '2020-09-08T17:21:07.081Z',
    pageblockId: 3,
  }
  const mockContentControl = () => {}
  const mockEmitSave = () => {}
  const mockGetContentSettingsValueHandler = () => {}
  const mockNavigate = () => {}
  const mockSettings = {
    footerPath: '/home/footer/',
    headerPath: '/home/header/',
    jumboPath: '/home/jumbo/',
    navAlignment: 'left',
    navCollapsible: true,
    navPosition: 'fixed-top',
    navSpacing: 'normal',
    navType: 'basic',
    showFooter: true,
    showHeader: true,
    showJumbo: true,
    siteTitle: 'Preaction CMS',
    init: true,
    isNavParent: false,
  }
  const mockWidth = { lg: 1, md: 1, sm: 1, xs: 1 }

  const result = render(
    <PageBlockContent
      appRoot=''
      block={mockBlock}
      content={mockContent}
      contentControl={mockContentControl}
      emitSave={mockEmitSave}
      editable
      getContentSettingsValueHandler={mockGetContentSettingsValueHandler}
      index={0}
      first
      navigate={mockNavigate}
      settings={mockSettings}
      token='foobar'
      width={mockWidth}
    />
  )
  expect(result.container).toBeInTheDocument()
})

test('PageBlockContent image', async () => {
  const mockBlock = {
    id: 3,
    blockType: 'content',
    ordering: 0,
    settings: {
      header: '',
      headerLevel: 0,
      lgWidth: 12,
      mdWidth: 12,
      smWidth: 12,
      xsWidth: 12,
    },
    createdAt: '2020-09-07T21:52:14.153Z',
    updatedAt: '2020-09-07T21:52:14.153Z',
    pageId: 1,
    pageblockcontents: [
      {
        id: 3,
        contentType: 'wysiwyg',
        ordering: 0,
        settings: {
          header: 'Wysiwyg Content',
          headerLevel: '2',
          lgWidth: 12,
          mdWidth: 12,
          smWidth: 12,
          xsWidth: 12,
        },
        wysiwyg: '<h1>FooBar</h1>',
        createdAt: '2020-09-07T21:52:14.189Z',
        updatedAt: '2020-09-08T17:21:07.081Z',
        pageblockId: 3,
      },
      {
        id: 5,
        contentType: 'image',
        ordering: 1,
        settings: {
          altText: '',
          header: 'Image Content',
          headerLevel: '',
          linkUrl: '',
          src: '/uploads/948b1fb4a2e0f6331c59817fea9cfbc5afebe9af5e6d293f2ec4736c3c418297.png',
          lgWidth: '3',
          mdWidth: '3',
          smWidth: '4',
          xsWidth: '6',
        },
        wysiwyg: 'null',
        createdAt: '2020-09-08T17:20:06.046Z',
        updatedAt: '2020-09-08T17:21:17.516Z',
        pageblockId: 3,
      },
    ],
  }
  const mockContent = {
    id: 5,
    contentType: 'image',
    ordering: 1,
    settings: {
      altText: '',
      header: 'Image Content',
      headerLevel: '',
      linkUrl: '',
      src: '/uploads/948b1fb4a2e0f6331c59817fea9cfbc5afebe9af5e6d293f2ec4736c3c418297.png',
      lgWidth: '3',
      mdWidth: '3',
      smWidth: '4',
      xsWidth: '6',
    },
    wysiwyg: 'null',
    createdAt: '2020-09-08T17:20:06.046Z',
    updatedAt: '2020-09-08T17:21:17.516Z',
    pageblockId: 3,
  }
  let latestContentControlArgs = {}
  const mockContentControl = (block, index, action) => {
    latestContentControlArgs = {
      block,
      index,
      action,
    }
  }
  const mockEmitSave = () => {}
  const mockGetContentSettingsValueHandler = () => {}
  const mockNavigate = () => {}
  const mockSettings = {
    footerPath: '/home/footer/',
    headerPath: '/home/header/',
    jumboPath: '/home/jumbo/',
    navAlignment: 'left',
    navCollapsible: true,
    navPosition: 'fixed-top',
    navSpacing: 'normal',
    navType: 'basic',
    showFooter: true,
    showHeader: true,
    showJumbo: true,
    siteTitle: 'Preaction CMS',
    init: true,
    isNavParent: false,
  }
  const mockWidth = { lg: 1, md: 1, sm: 1, xs: 1 }

  const result = render(
    <PageBlockContent
      appRoot=''
      block={mockBlock}
      content={mockContent}
      contentControl={mockContentControl}
      emitSave={mockEmitSave}
      editable
      getContentSettingsValueHandler={mockGetContentSettingsValueHandler}
      index={1}
      navigate={mockNavigate}
      settings={mockSettings}
      token='foobar'
      width={mockWidth}
    />
  )
  const rerender = () =>
    result.rerender(
      <PageBlockContent
        appRoot=''
        block={mockBlock}
        content={mockContent}
        contentControl={mockContentControl}
        emitSave={mockEmitSave}
        editable
        getContentSettingsValueHandler={mockGetContentSettingsValueHandler}
        index={1}
        navigate={mockNavigate}
        settings={mockSettings}
        token='foobar'
        width={mockWidth}
      />
    )
  expect(result.container).toBeInTheDocument()
  userEvent.click(result.container.querySelector('.btn.content-settings'))
  rerender()
  await waitFor(() =>
    expect(
      result.getByText('Content Type "image" Settings')
    ).toBeInTheDocument()
  )
  userEvent.click(result.container.querySelector('.btn.move-content.previous'))
  await waitFor(() =>
    expect(latestContentControlArgs.block.id).toBe(mockBlock.id)
  )
  await waitFor(() => expect(latestContentControlArgs.index).toBe(1))
  await waitFor(() => expect(latestContentControlArgs.action).toBe('previous'))
  userEvent.click(result.container.querySelector('.btn.move-content.next'))
  await waitFor(() =>
    expect(latestContentControlArgs.block.id).toBe(mockBlock.id)
  )
  await waitFor(() => expect(latestContentControlArgs.index).toBe(1))
  await waitFor(() => expect(latestContentControlArgs.action).toBe('next'))
  userEvent.click(result.container.querySelector('.btn.delete-content'))
  await waitFor(() =>
    expect(latestContentControlArgs.block.id).toBe(mockBlock.id)
  )
  await waitFor(() => expect(latestContentControlArgs.index).toBe(1))
  await waitFor(() => expect(latestContentControlArgs.action).toBe('delete'))
})
