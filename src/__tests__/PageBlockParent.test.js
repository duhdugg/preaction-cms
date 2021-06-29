import React from 'react'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { StaticRouter } from 'react-router-dom'
import PageBlockParent from '../PageBlockParent.jsx'

test('PageBlockParent content', async () => {
  let latestAddContentArgs = {}
  const mockAddContent = (block, contentType) => {
    latestAddContentArgs = { block, contentType }
  }
  const mockBlock = {
    id: 9,
    blockType: 'content',
    ordering: 1,
    settings: {
      header: 'Content Block',
      headerLevel: '1',
      xxlWidth: 12,
      lgWidth: 12,
      mdWidth: 12,
      smWidth: 12,
      xsWidth: 12,
    },
    createdAt: '2020-09-08T19:07:56.597Z',
    updatedAt: '2020-09-08T19:08:55.436Z',
    pageId: 7,
    pageblockcontents: [
      {
        id: 9,
        contentType: 'image',
        ordering: 0,
        settings: {
          altText: '',
          header: '',
          headerLevel: 0,
          linkUrl: '',
          src: '/uploads/948b1fb4a2e0f6331c59817fea9cfbc5afebe9af5e6d293f2ec4736c3c418297.png',
          xxlWidth: 12,
          lgWidth: '3',
          mdWidth: '4',
          smWidth: '5',
          xsWidth: '6',
        },
        wysiwyg: 'null',
        createdAt: '2020-09-08T19:08:04.431Z',
        updatedAt: '2020-09-08T19:08:19.338Z',
        pageblockId: 9,
      },
      {
        id: 10,
        contentType: 'image',
        ordering: 1,
        settings: {
          altText: '',
          header: '',
          headerLevel: 0,
          linkUrl: '',
          src: '/uploads/f5c09490c5ff4e6b5d144ffd442e112eb74057a4adfafea1de69dc31a95b2b21.png',
          xxlWidth: 12,
          lgWidth: '3',
          mdWidth: '4',
          smWidth: '5',
          xsWidth: '6',
        },
        wysiwyg: 'null',
        createdAt: '2020-09-08T19:08:33.699Z',
        updatedAt: '2020-09-08T19:08:41.807Z',
        pageblockId: 9,
      },
    ],
  }
  let latestBlockControlArgs = {}
  const mockBlockControl = (blockId, action) => {
    latestBlockControlArgs = { blockId, action }
  }
  const mockContentControl = () => {}
  const mockEmitSave = () => {}
  const mockGetContentSettingsValueHandler = () => {}
  const mockGetContents = (contents) => {
    return contents.concat().sort((a, b) => {
      return a.ordering < b.ordering ? -1 : a.ordering > b.ordering ? 1 : 0
    })
  }
  const mockGetPageBlockSettingsValueHandler = () => {}
  const mockNavigate = () => {}
  const mockPage = {
    id: 7,
    key: 'abc',
    title: 'ABC',
    pageType: 'content',
    userCreated: true,
    settings: { includeInNav: true },
    parentId: 4,
    createdAt: '2020-09-08T14:39:13.303Z',
    updatedAt: '2020-09-08T14:39:13.303Z',
    pageblocks: [
      {
        id: 5,
        blockType: 'nav',
        ordering: 0,
        settings: {
          header: 'Nav Block',
          headerLevel: 0,
          xxlWidth: 12,
          lgWidth: 12,
          mdWidth: 12,
          smWidth: 12,
          xsWidth: 12,
          navAlignment: 'vertical',
          navCollapsible: false,
          subMenu: false,
        },
        createdAt: '2020-09-08T14:40:25.998Z',
        updatedAt: '2020-09-08T19:09:00.895Z',
        pageId: 7,
        pageblockcontents: [],
      },
      {
        id: 9,
        blockType: 'content',
        ordering: 1,
        settings: {
          header: 'Content Block',
          headerLevel: 0,
          xxlWidth: 12,
          lgWidth: 12,
          mdWidth: 12,
          smWidth: 12,
          xsWidth: 12,
        },
        createdAt: '2020-09-08T19:07:56.597Z',
        updatedAt: '2020-09-08T19:08:55.436Z',
        pageId: 7,
        pageblockcontents: [
          {
            id: 9,
            contentType: 'image',
            ordering: 0,
            settings: {
              altText: '',
              header: '',
              headerLevel: 0,
              linkUrl: '',
              src: '/uploads/948b1fb4a2e0f6331c59817fea9cfbc5afebe9af5e6d293f2ec4736c3c418297.png',
              xxlWidth: 12,
              lgWidth: '3',
              mdWidth: '4',
              smWidth: '5',
              xsWidth: '6',
            },
            wysiwyg: 'null',
            createdAt: '2020-09-08T19:08:04.431Z',
            updatedAt: '2020-09-08T19:08:19.338Z',
            pageblockId: 9,
          },
          {
            id: 10,
            contentType: 'image',
            ordering: 1,
            settings: {
              altText: '',
              header: '',
              headerLevel: 0,
              linkUrl: '',
              src: '/uploads/f5c09490c5ff4e6b5d144ffd442e112eb74057a4adfafea1de69dc31a95b2b21.png',
              xxlWidth: 12,
              lgWidth: '3',
              mdWidth: '4',
              smWidth: '5',
              xsWidth: '6',
            },
            wysiwyg: 'null',
            createdAt: '2020-09-08T19:08:33.699Z',
            updatedAt: '2020-09-08T19:08:41.807Z',
            pageblockId: 9,
          },
        ],
      },
      {
        id: 10,
        blockType: 'iframe',
        ordering: 2,
        settings: {
          header: 'Iframe Block',
          headerLevel: 0,
          xxlWidth: 12,
          lgWidth: 12,
          mdWidth: 12,
          smWidth: 12,
          xsWidth: 12,
          iframeSrc: 'about:blank',
        },
        createdAt: '2020-09-08T19:09:15.814Z',
        updatedAt: '2020-09-08T19:09:23.373Z',
        pageId: 7,
        pageblockcontents: [],
      },
    ],
    fallbackSettings: {
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
      includeInNav: true,
      site: false,
    },
    siteMap: {
      key: 'home',
      path: '',
      children: [
        {
          id: 4,
          key: 'foo-1',
          title: 'Foo 1',
          pageType: 'content',
          userCreated: true,
          settings: { includeInNav: true },
          parentId: null,
          createdAt: '2020-09-08T14:39:05.800Z',
          updatedAt: '2020-09-08T14:39:05.800Z',
          children: [
            {
              id: 7,
              key: 'abc',
              title: 'ABC',
              pageType: 'content',
              userCreated: true,
              settings: { includeInNav: true },
              parentId: 4,
              createdAt: '2020-09-08T14:39:13.303Z',
              updatedAt: '2020-09-08T14:39:13.303Z',
              children: [],
              path: 'foo-1/abc',
            },
            {
              id: 10,
              key: 'def',
              title: 'DEF',
              pageType: 'content',
              userCreated: true,
              settings: { includeInNav: true },
              parentId: 4,
              createdAt: '2020-09-08T14:39:17.229Z',
              updatedAt: '2020-09-08T14:39:17.229Z',
              children: [],
              path: 'foo-1/def',
            },
          ],
          path: 'foo-1',
        },
      ],
    },
    tree: {
      id: 7,
      key: 'abc',
      title: 'ABC',
      pageType: 'content',
      userCreated: true,
      settings: { includeInNav: true },
      parentId: 4,
      createdAt: '2020-09-08T14:39:13.303Z',
      updatedAt: '2020-09-08T14:39:13.303Z',
      children: [
        {
          id: 13,
          key: '123',
          title: '123',
          pageType: 'content',
          userCreated: true,
          settings: { includeInNav: true },
          parentId: 7,
          createdAt: '2020-09-08T14:39:52.230Z',
          updatedAt: '2020-09-08T14:39:52.230Z',
          children: [],
          path: 'foo-1/abc/123',
        },
        {
          id: 16,
          key: '456',
          title: '456',
          pageType: 'content',
          userCreated: true,
          settings: { includeInNav: true },
          parentId: 7,
          createdAt: '2020-09-08T14:40:32.017Z',
          updatedAt: '2020-09-08T14:40:32.017Z',
          children: [],
          path: 'foo-1/abc/456',
        },
      ],
      path: 'foo-1/abc',
    },
  }
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
    includeInNav: true,
    site: false,
  }
  const result = render(
    <PageBlockParent
      addContent={mockAddContent}
      appRoot=''
      block={mockBlock}
      blockControl={mockBlockControl}
      contentControl={mockContentControl}
      editable
      emitSave={mockEmitSave}
      getContentSettingsValueHandler={mockGetContentSettingsValueHandler}
      getContents={mockGetContents}
      getPageBlockSettingsValueHandler={mockGetPageBlockSettingsValueHandler}
      navigate={mockNavigate}
      page={mockPage}
      settings={mockSettings}
      token='foobar'
    />
  )
  expect(result.getByText('Content Block')).toBeInTheDocument()
  await waitFor(
    () =>
      new Promise((resolve, reject) => {
        setTimeout(resolve, 100)
      })
  )
  userEvent.click(result.container.querySelector('.btn.move-block.previous'))
  await waitFor(() => expect(latestBlockControlArgs.blockId).toBe(mockBlock.id))
  await waitFor(() => expect(latestBlockControlArgs.action).toBe('previous'))
  userEvent.click(result.container.querySelector('.btn.move-block.next'))
  await waitFor(() => expect(latestBlockControlArgs.blockId).toBe(mockBlock.id))
  await waitFor(() => expect(latestBlockControlArgs.action).toBe('next'))
  userEvent.click(result.container.querySelector('.btn.delete-block'))
  await waitFor(() => expect(latestBlockControlArgs.blockId).toBe(mockBlock.id))
  await waitFor(() => expect(latestBlockControlArgs.action).toBe('delete'))
  userEvent.click(result.container.querySelector('.btn.add-wysiwyg'))
  await waitFor(() => expect(latestAddContentArgs.block.id).toBe(mockBlock.id))
  await waitFor(() => expect(latestAddContentArgs.contentType).toBe('wysiwyg'))
  userEvent.click(result.container.querySelector('.btn.add-spacer'))
  await waitFor(() => expect(latestAddContentArgs.block.id).toBe(mockBlock.id))
  await waitFor(() => expect(latestAddContentArgs.contentType).toBe('spacer'))
  userEvent.click(result.container.querySelector('.btn.block-settings'))
  await waitFor(() =>
    expect(
      result.getByText('Block Type "content" Settings')
    ).toBeInTheDocument()
  )
})
test('PageBlockParent nav', async () => {
  const mockAddContent = () => {}
  const mockBlock = {
    id: 5,
    blockType: 'nav',
    ordering: 0,
    settings: {
      header: 'Nav Block',
      headerLevel: 0,
      xxlWidth: 12,
      lgWidth: 12,
      mdWidth: 12,
      smWidth: 12,
      xsWidth: 12,
      navAlignment: 'vertical',
      navCollapsible: false,
      subMenu: false,
    },
    createdAt: '2020-09-08T14:40:25.998Z',
    updatedAt: '2020-09-08T19:09:00.895Z',
    pageId: 7,
    pageblockcontents: [],
  }
  const mockBlockControl = () => {}
  const mockContentControl = () => {}
  const mockEmitSave = () => {}
  const mockGetContentSettingsValueHandler = () => {}
  const mockGetContents = (contents) => {
    return contents.concat().sort((a, b) => {
      return a.ordering < b.ordering ? -1 : a.ordering > b.ordering ? 1 : 0
    })
  }
  const mockGetPageBlockSettingsValueHandler = () => {}
  const mockNavigate = () => {}
  const mockPage = {
    id: 7,
    key: 'abc',
    title: 'ABC',
    pageType: 'content',
    userCreated: true,
    settings: { includeInNav: true },
    parentId: 4,
    createdAt: '2020-09-08T14:39:13.303Z',
    updatedAt: '2020-09-08T14:39:13.303Z',
    pageblocks: [
      {
        id: 5,
        blockType: 'nav',
        ordering: 0,
        settings: {
          header: 'Nav Block',
          headerLevel: 0,
          xxlWidth: 12,
          lgWidth: 12,
          mdWidth: 12,
          smWidth: 12,
          xsWidth: 12,
          navAlignment: 'vertical',
          navCollapsible: false,
          subMenu: false,
        },
        createdAt: '2020-09-08T14:40:25.998Z',
        updatedAt: '2020-09-08T19:09:00.895Z',
        pageId: 7,
        pageblockcontents: [],
      },
      {
        id: 9,
        blockType: 'content',
        ordering: 1,
        settings: {
          header: 'Content Block',
          headerLevel: 0,
          xxlWidth: 12,
          lgWidth: 12,
          mdWidth: 12,
          smWidth: 12,
          xsWidth: 12,
        },
        createdAt: '2020-09-08T19:07:56.597Z',
        updatedAt: '2020-09-08T19:08:55.436Z',
        pageId: 7,
        pageblockcontents: [
          {
            id: 9,
            contentType: 'image',
            ordering: 0,
            settings: {
              altText: '',
              header: '',
              headerLevel: 0,
              linkUrl: '',
              src: '/uploads/948b1fb4a2e0f6331c59817fea9cfbc5afebe9af5e6d293f2ec4736c3c418297.png',
              xxlWidth: 12,
              lgWidth: '3',
              mdWidth: '4',
              smWidth: '5',
              xsWidth: '6',
            },
            wysiwyg: 'null',
            createdAt: '2020-09-08T19:08:04.431Z',
            updatedAt: '2020-09-08T19:08:19.338Z',
            pageblockId: 9,
          },
          {
            id: 10,
            contentType: 'image',
            ordering: 1,
            settings: {
              altText: '',
              header: '',
              headerLevel: 0,
              linkUrl: '',
              src: '/uploads/f5c09490c5ff4e6b5d144ffd442e112eb74057a4adfafea1de69dc31a95b2b21.png',
              xxlWidth: 12,
              lgWidth: '3',
              mdWidth: '4',
              smWidth: '5',
              xsWidth: '6',
            },
            wysiwyg: 'null',
            createdAt: '2020-09-08T19:08:33.699Z',
            updatedAt: '2020-09-08T19:08:41.807Z',
            pageblockId: 9,
          },
        ],
      },
      {
        id: 10,
        blockType: 'iframe',
        ordering: 2,
        settings: {
          header: 'Iframe Block',
          headerLevel: 0,
          xxlWidth: 12,
          lgWidth: 12,
          mdWidth: 12,
          smWidth: 12,
          xsWidth: 12,
          iframeSrc: 'about:blank',
        },
        createdAt: '2020-09-08T19:09:15.814Z',
        updatedAt: '2020-09-08T19:09:23.373Z',
        pageId: 7,
        pageblockcontents: [],
      },
    ],
    fallbackSettings: {
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
      includeInNav: true,
      site: false,
    },
    siteMap: {
      key: 'home',
      path: '',
      children: [
        {
          id: 4,
          key: 'foo-1',
          title: 'Foo 1',
          pageType: 'content',
          userCreated: true,
          settings: { includeInNav: true },
          parentId: null,
          createdAt: '2020-09-08T14:39:05.800Z',
          updatedAt: '2020-09-08T14:39:05.800Z',
          children: [
            {
              id: 7,
              key: 'abc',
              title: 'ABC',
              pageType: 'content',
              userCreated: true,
              settings: { includeInNav: true },
              parentId: 4,
              createdAt: '2020-09-08T14:39:13.303Z',
              updatedAt: '2020-09-08T14:39:13.303Z',
              children: [],
              path: 'foo-1/abc',
            },
            {
              id: 10,
              key: 'def',
              title: 'DEF',
              pageType: 'content',
              userCreated: true,
              settings: { includeInNav: true },
              parentId: 4,
              createdAt: '2020-09-08T14:39:17.229Z',
              updatedAt: '2020-09-08T14:39:17.229Z',
              children: [],
              path: 'foo-1/def',
            },
          ],
          path: 'foo-1',
        },
      ],
    },
    tree: {
      id: 7,
      key: 'abc',
      title: 'ABC',
      pageType: 'content',
      userCreated: true,
      settings: { includeInNav: true },
      parentId: 4,
      createdAt: '2020-09-08T14:39:13.303Z',
      updatedAt: '2020-09-08T14:39:13.303Z',
      children: [
        {
          id: 13,
          key: '123',
          title: '123',
          pageType: 'content',
          userCreated: true,
          settings: { includeInNav: true },
          parentId: 7,
          createdAt: '2020-09-08T14:39:52.230Z',
          updatedAt: '2020-09-08T14:39:52.230Z',
          children: [],
          path: 'foo-1/abc/123',
        },
        {
          id: 16,
          key: '456',
          title: '456',
          pageType: 'content',
          userCreated: true,
          settings: { includeInNav: true },
          parentId: 7,
          createdAt: '2020-09-08T14:40:32.017Z',
          updatedAt: '2020-09-08T14:40:32.017Z',
          children: [],
          path: 'foo-1/abc/456',
        },
      ],
      path: 'foo-1/abc',
    },
  }
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
    includeInNav: true,
    site: false,
  }
  const result = render(
    <StaticRouter>
      <PageBlockParent
        addContent={mockAddContent}
        appRoot=''
        block={mockBlock}
        blockControl={mockBlockControl}
        contentControl={mockContentControl}
        editable
        emitSave={mockEmitSave}
        getContentSettingsValueHandler={mockGetContentSettingsValueHandler}
        getContents={mockGetContents}
        getPageBlockSettingsValueHandler={mockGetPageBlockSettingsValueHandler}
        navigate={mockNavigate}
        page={mockPage}
        settings={mockSettings}
        token='foobar'
      />
    </StaticRouter>
  )
  expect(result.getByText('Nav Block')).toBeInTheDocument()
  userEvent.click(result.container.querySelector('.btn.block-settings'))
  await waitFor(() =>
    expect(result.getByText('Block Type "nav" Settings')).toBeInTheDocument()
  )
})
test('PageBlockParent iframe', async () => {
  const mockAddContent = () => {}
  const mockBlock = {
    id: 10,
    blockType: 'iframe',
    ordering: 2,
    settings: {
      header: 'Iframe Block',
      headerLevel: 0,
      xxlWidth: 12,
      lgWidth: 12,
      mdWidth: 12,
      smWidth: 12,
      xsWidth: 12,
      iframeSrc: 'about:blank',
    },
    createdAt: '2020-09-08T19:09:15.814Z',
    updatedAt: '2020-09-08T19:09:23.373Z',
    pageId: 7,
    pageblockcontents: [],
  }
  const mockBlockControl = () => {}
  const mockContentControl = () => {}
  const mockEmitSave = () => {}
  const mockGetContentSettingsValueHandler = () => {}
  const mockGetContents = (contents) => {
    return contents.concat().sort((a, b) => {
      return a.ordering < b.ordering ? -1 : a.ordering > b.ordering ? 1 : 0
    })
  }
  const mockGetPageBlockSettingsValueHandler = () => {}
  const mockNavigate = () => {}
  const mockPage = {
    id: 7,
    key: 'abc',
    title: 'ABC',
    pageType: 'content',
    userCreated: true,
    settings: { includeInNav: true },
    parentId: 4,
    createdAt: '2020-09-08T14:39:13.303Z',
    updatedAt: '2020-09-08T14:39:13.303Z',
    pageblocks: [
      {
        id: 5,
        blockType: 'nav',
        ordering: 0,
        settings: {
          header: 'Nav Block',
          headerLevel: 0,
          xxlWidth: 12,
          lgWidth: 12,
          mdWidth: 12,
          smWidth: 12,
          xsWidth: 12,
          navAlignment: 'vertical',
          navCollapsible: false,
          subMenu: false,
        },
        createdAt: '2020-09-08T14:40:25.998Z',
        updatedAt: '2020-09-08T19:09:00.895Z',
        pageId: 7,
        pageblockcontents: [],
      },
      {
        id: 9,
        blockType: 'content',
        ordering: 1,
        settings: {
          header: 'Content Block',
          headerLevel: 0,
          xxlWidth: 12,
          lgWidth: 12,
          mdWidth: 12,
          smWidth: 12,
          xsWidth: 12,
        },
        createdAt: '2020-09-08T19:07:56.597Z',
        updatedAt: '2020-09-08T19:08:55.436Z',
        pageId: 7,
        pageblockcontents: [
          {
            id: 9,
            contentType: 'image',
            ordering: 0,
            settings: {
              altText: '',
              header: '',
              headerLevel: 0,
              linkUrl: '',
              src: '/uploads/948b1fb4a2e0f6331c59817fea9cfbc5afebe9af5e6d293f2ec4736c3c418297.png',
              xxlWidth: 12,
              lgWidth: '3',
              mdWidth: '4',
              smWidth: '5',
              xsWidth: '6',
            },
            wysiwyg: 'null',
            createdAt: '2020-09-08T19:08:04.431Z',
            updatedAt: '2020-09-08T19:08:19.338Z',
            pageblockId: 9,
          },
          {
            id: 10,
            contentType: 'image',
            ordering: 1,
            settings: {
              altText: '',
              header: '',
              headerLevel: 0,
              linkUrl: '',
              src: '/uploads/f5c09490c5ff4e6b5d144ffd442e112eb74057a4adfafea1de69dc31a95b2b21.png',
              xxlWidth: 12,
              lgWidth: '3',
              mdWidth: '4',
              smWidth: '5',
              xsWidth: '6',
            },
            wysiwyg: 'null',
            createdAt: '2020-09-08T19:08:33.699Z',
            updatedAt: '2020-09-08T19:08:41.807Z',
            pageblockId: 9,
          },
        ],
      },
      {
        id: 10,
        blockType: 'iframe',
        ordering: 2,
        settings: {
          header: 'Iframe Block',
          headerLevel: 0,
          xxlWidth: 12,
          lgWidth: 12,
          mdWidth: 12,
          smWidth: 12,
          xsWidth: 12,
          iframeSrc: 'about:blank',
        },
        createdAt: '2020-09-08T19:09:15.814Z',
        updatedAt: '2020-09-08T19:09:23.373Z',
        pageId: 7,
        pageblockcontents: [],
      },
    ],
    fallbackSettings: {
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
      includeInNav: true,
      site: false,
    },
    siteMap: {
      key: 'home',
      path: '',
      children: [
        {
          id: 4,
          key: 'foo-1',
          title: 'Foo 1',
          pageType: 'content',
          userCreated: true,
          settings: { includeInNav: true },
          parentId: null,
          createdAt: '2020-09-08T14:39:05.800Z',
          updatedAt: '2020-09-08T14:39:05.800Z',
          children: [
            {
              id: 7,
              key: 'abc',
              title: 'ABC',
              pageType: 'content',
              userCreated: true,
              settings: { includeInNav: true },
              parentId: 4,
              createdAt: '2020-09-08T14:39:13.303Z',
              updatedAt: '2020-09-08T14:39:13.303Z',
              children: [],
              path: 'foo-1/abc',
            },
            {
              id: 10,
              key: 'def',
              title: 'DEF',
              pageType: 'content',
              userCreated: true,
              settings: { includeInNav: true },
              parentId: 4,
              createdAt: '2020-09-08T14:39:17.229Z',
              updatedAt: '2020-09-08T14:39:17.229Z',
              children: [],
              path: 'foo-1/def',
            },
          ],
          path: 'foo-1',
        },
      ],
    },
    tree: {
      id: 7,
      key: 'abc',
      title: 'ABC',
      pageType: 'content',
      userCreated: true,
      settings: { includeInNav: true },
      parentId: 4,
      createdAt: '2020-09-08T14:39:13.303Z',
      updatedAt: '2020-09-08T14:39:13.303Z',
      children: [
        {
          id: 13,
          key: '123',
          title: '123',
          pageType: 'content',
          userCreated: true,
          settings: { includeInNav: true },
          parentId: 7,
          createdAt: '2020-09-08T14:39:52.230Z',
          updatedAt: '2020-09-08T14:39:52.230Z',
          children: [],
          path: 'foo-1/abc/123',
        },
        {
          id: 16,
          key: '456',
          title: '456',
          pageType: 'content',
          userCreated: true,
          settings: { includeInNav: true },
          parentId: 7,
          createdAt: '2020-09-08T14:40:32.017Z',
          updatedAt: '2020-09-08T14:40:32.017Z',
          children: [],
          path: 'foo-1/abc/456',
        },
      ],
      path: 'foo-1/abc',
    },
  }
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
    includeInNav: true,
    site: false,
  }
  const result = render(
    <PageBlockParent
      addContent={mockAddContent}
      appRoot=''
      block={mockBlock}
      blockControl={mockBlockControl}
      contentControl={mockContentControl}
      editable
      emitSave={mockEmitSave}
      getContentSettingsValueHandler={mockGetContentSettingsValueHandler}
      getContents={mockGetContents}
      getPageBlockSettingsValueHandler={mockGetPageBlockSettingsValueHandler}
      navigate={mockNavigate}
      page={mockPage}
      settings={mockSettings}
      token='foobar'
    />
  )
  expect(result.getByText('Iframe Block')).toBeInTheDocument()
  await waitFor(
    () =>
      new Promise((resolve, reject) => {
        setTimeout(resolve, 100)
      })
  )
  userEvent.click(result.container.querySelector('.btn.block-settings'))
  await waitFor(() =>
    expect(result.getByText('Block Type "iframe" Settings')).toBeInTheDocument()
  )
})
test('PageBlockParent spacer', async () => {
  const mockAddContent = () => {}
  const mockBlock = {
    id: 20,
    blockType: 'spacer',
    ordering: 3,
    settings: {
      xxlWidth: 12,
      lgWidth: 12,
      mdWidth: 12,
      smWidth: 12,
      xsWidth: 12,
    },
    createdAt: '2020-09-08T19:09:15.814Z',
    updatedAt: '2020-09-08T19:09:23.373Z',
    pageId: 7,
    pageblockcontents: [],
  }
  const mockBlockControl = () => {}
  const mockContentControl = () => {}
  const mockEmitSave = () => {}
  const mockGetContentSettingsValueHandler = () => {}
  const mockGetContents = (contents) => {
    return contents.concat().sort((a, b) => {
      return a.ordering < b.ordering ? -1 : a.ordering > b.ordering ? 1 : 0
    })
  }
  const mockGetPageBlockSettingsValueHandler = () => {}
  const mockNavigate = () => {}
  const mockPage = {
    id: 7,
    key: 'abc',
    title: 'ABC',
    pageType: 'content',
    userCreated: true,
    settings: { includeInNav: true },
    parentId: 4,
    createdAt: '2020-09-08T14:39:13.303Z',
    updatedAt: '2020-09-08T14:39:13.303Z',
    pageblocks: [
      {
        id: 5,
        blockType: 'nav',
        ordering: 0,
        settings: {
          header: 'Nav Block',
          headerLevel: 0,
          xxlWidth: 12,
          lgWidth: 12,
          mdWidth: 12,
          smWidth: 12,
          xsWidth: 12,
          navAlignment: 'vertical',
          navCollapsible: false,
          subMenu: false,
        },
        createdAt: '2020-09-08T14:40:25.998Z',
        updatedAt: '2020-09-08T19:09:00.895Z',
        pageId: 7,
        pageblockcontents: [],
      },
      {
        id: 9,
        blockType: 'content',
        ordering: 1,
        settings: {
          header: 'Content Block',
          headerLevel: 0,
          xxlWidth: 12,
          lgWidth: 12,
          mdWidth: 12,
          smWidth: 12,
          xsWidth: 12,
        },
        createdAt: '2020-09-08T19:07:56.597Z',
        updatedAt: '2020-09-08T19:08:55.436Z',
        pageId: 7,
        pageblockcontents: [
          {
            id: 9,
            contentType: 'image',
            ordering: 0,
            settings: {
              altText: '',
              header: '',
              headerLevel: 0,
              linkUrl: '',
              src: '/uploads/948b1fb4a2e0f6331c59817fea9cfbc5afebe9af5e6d293f2ec4736c3c418297.png',
              xxlWidth: 12,
              lgWidth: '3',
              mdWidth: '4',
              smWidth: '5',
              xsWidth: '6',
            },
            wysiwyg: 'null',
            createdAt: '2020-09-08T19:08:04.431Z',
            updatedAt: '2020-09-08T19:08:19.338Z',
            pageblockId: 9,
          },
          {
            id: 10,
            contentType: 'image',
            ordering: 1,
            settings: {
              altText: '',
              header: '',
              headerLevel: 0,
              linkUrl: '',
              src: '/uploads/f5c09490c5ff4e6b5d144ffd442e112eb74057a4adfafea1de69dc31a95b2b21.png',
              xxlWidth: 12,
              lgWidth: '3',
              mdWidth: '4',
              smWidth: '5',
              xsWidth: '6',
            },
            wysiwyg: 'null',
            createdAt: '2020-09-08T19:08:33.699Z',
            updatedAt: '2020-09-08T19:08:41.807Z',
            pageblockId: 9,
          },
        ],
      },
      {
        id: 10,
        blockType: 'iframe',
        ordering: 2,
        settings: {
          header: 'Iframe Block',
          headerLevel: 0,
          xxlWidth: 12,
          lgWidth: 12,
          mdWidth: 12,
          smWidth: 12,
          xsWidth: 12,
          iframeSrc: 'about:blank',
        },
        createdAt: '2020-09-08T19:09:15.814Z',
        updatedAt: '2020-09-08T19:09:23.373Z',
        pageId: 7,
        pageblockcontents: [],
      },
      {
        id: 20,
        blockType: 'spacer',
        ordering: 3,
        settings: {
          header: 'Iframe Block',
          headerLevel: 0,
          xxlWidth: 12,
          lgWidth: 12,
          mdWidth: 12,
          smWidth: 12,
          xsWidth: 12,
          iframeSrc: 'about:blank',
        },
        createdAt: '2020-09-08T19:09:15.814Z',
        updatedAt: '2020-09-08T19:09:23.373Z',
        pageId: 7,
        pageblockcontents: [],
      },
    ],
    fallbackSettings: {
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
      includeInNav: true,
      site: false,
    },
    siteMap: {
      key: 'home',
      path: '',
      children: [
        {
          id: 4,
          key: 'foo-1',
          title: 'Foo 1',
          pageType: 'content',
          userCreated: true,
          settings: { includeInNav: true },
          parentId: null,
          createdAt: '2020-09-08T14:39:05.800Z',
          updatedAt: '2020-09-08T14:39:05.800Z',
          children: [
            {
              id: 7,
              key: 'abc',
              title: 'ABC',
              pageType: 'content',
              userCreated: true,
              settings: { includeInNav: true },
              parentId: 4,
              createdAt: '2020-09-08T14:39:13.303Z',
              updatedAt: '2020-09-08T14:39:13.303Z',
              children: [],
              path: 'foo-1/abc',
            },
            {
              id: 10,
              key: 'def',
              title: 'DEF',
              pageType: 'content',
              userCreated: true,
              settings: { includeInNav: true },
              parentId: 4,
              createdAt: '2020-09-08T14:39:17.229Z',
              updatedAt: '2020-09-08T14:39:17.229Z',
              children: [],
              path: 'foo-1/def',
            },
          ],
          path: 'foo-1',
        },
      ],
    },
    tree: {
      id: 7,
      key: 'abc',
      title: 'ABC',
      pageType: 'content',
      userCreated: true,
      settings: { includeInNav: true },
      parentId: 4,
      createdAt: '2020-09-08T14:39:13.303Z',
      updatedAt: '2020-09-08T14:39:13.303Z',
      children: [
        {
          id: 13,
          key: '123',
          title: '123',
          pageType: 'content',
          userCreated: true,
          settings: { includeInNav: true },
          parentId: 7,
          createdAt: '2020-09-08T14:39:52.230Z',
          updatedAt: '2020-09-08T14:39:52.230Z',
          children: [],
          path: 'foo-1/abc/123',
        },
        {
          id: 16,
          key: '456',
          title: '456',
          pageType: 'content',
          userCreated: true,
          settings: { includeInNav: true },
          parentId: 7,
          createdAt: '2020-09-08T14:40:32.017Z',
          updatedAt: '2020-09-08T14:40:32.017Z',
          children: [],
          path: 'foo-1/abc/456',
        },
      ],
      path: 'foo-1/abc',
    },
  }
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
    includeInNav: true,
    site: false,
  }
  const result = render(
    <PageBlockParent
      addContent={mockAddContent}
      appRoot=''
      block={mockBlock}
      blockControl={mockBlockControl}
      contentControl={mockContentControl}
      editable
      emitSave={mockEmitSave}
      getContentSettingsValueHandler={mockGetContentSettingsValueHandler}
      getContents={mockGetContents}
      getPageBlockSettingsValueHandler={mockGetPageBlockSettingsValueHandler}
      navigate={mockNavigate}
      page={mockPage}
      settings={mockSettings}
      token='foobar'
    />
  )
  expect(
    result.container.querySelector('.block-type-spacer')
  ).toBeInTheDocument()
})
