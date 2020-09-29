import React from 'react'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { StaticRouter } from 'react-router-dom'
import Page from '../Page.jsx'

jest.setTimeout(30000)
window.confirm = jest.fn(() => true)

const mockPage1 = {
  id: 13,
  key: '123',
  title: '123',
  pageType: 'content',
  userCreated: true,
  settings: { includeInNav: true },
  parentId: 7,
  createdAt: '2020-09-08T14:39:52.230Z',
  updatedAt: '2020-09-08T14:39:52.230Z',
  pageblocks: [],
  fallbackSettings: {
    footerPath: '/home/footer/',
    headerPath: '/home/header/',
    jumboPath: '/home/jumbo/',
    navAlignment: 'left',
    navCollapsible: true,
    navPosition: 'above-header',
    navSpacing: 'normal',
    navType: 'basic',
    showFooter: true,
    showHeader: true,
    showJumbo: true,
    siteTitle: 'Preaction CMS',
    init: true,
    includeInNav: true,
    site: false,
    navOrdering: '',
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
            settings: {
              includeInNav: true,
              site: false,
              navOrdering: '',
              navPosition: 'above-header',
            },
            parentId: 4,
            createdAt: '2020-09-08T14:39:13.303Z',
            updatedAt: '2020-09-08T20:52:03.317Z',
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
}
const mockPage2 = {
  id: 16,
  key: '456',
  title: '456',
  pageType: 'content',
  userCreated: true,
  settings: { includeInNav: true },
  parentId: 7,
  createdAt: '2020-09-08T14:40:32.017Z',
  updatedAt: '2020-09-08T14:40:32.017Z',
  pageblocks: [
    {
      id: 16,
      blockType: 'iframe',
      ordering: 0,
      settings: {
        header: '',
        headerLevel: 0,
        lgWidth: 12,
        mdWidth: 12,
        smWidth: 12,
        xsWidth: 12,
        iframeSrc: 'about:blank?test=1',
      },
      createdAt: '2020-09-09T13:54:22.781Z',
      updatedAt: '2020-09-09T13:54:40.594Z',
      pageId: 16,
      pageblockcontents: [],
    },
    {
      id: 17,
      blockType: 'iframe',
      ordering: 1,
      settings: {
        header: '',
        headerLevel: 0,
        lgWidth: 12,
        mdWidth: 12,
        smWidth: 12,
        xsWidth: 12,
        iframeSrc: 'about:blank?test=2',
      },
      createdAt: '2020-09-09T13:54:32.037Z',
      updatedAt: '2020-09-09T13:54:46.182Z',
      pageId: 16,
      pageblockcontents: [],
    },
    {
      id: 18,
      blockType: 'iframe',
      ordering: 2,
      settings: {
        header: '',
        headerLevel: 0,
        lgWidth: 12,
        mdWidth: 12,
        smWidth: 12,
        xsWidth: 12,
        iframeSrc: 'about:blank?test=3',
      },
      createdAt: '2020-09-09T13:54:33.714Z',
      updatedAt: '2020-09-09T13:54:51.736Z',
      pageId: 16,
      pageblockcontents: [],
    },
  ],
  fallbackSettings: {
    footerPath: '/home/footer/',
    headerPath: '/home/header/',
    jumboPath: '/home/jumbo/',
    navAlignment: 'left',
    navCollapsible: true,
    navPosition: 'above-header',
    navSpacing: 'normal',
    navType: 'basic',
    showFooter: true,
    showHeader: true,
    showJumbo: true,
    siteTitle: 'Preaction CMS',
    init: true,
    includeInNav: true,
    site: false,
    navOrdering: '',
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
            settings: {
              includeInNav: true,
              site: false,
              navOrdering: '',
              navPosition: 'above-header',
            },
            parentId: 4,
            createdAt: '2020-09-08T14:39:13.303Z',
            updatedAt: '2020-09-08T20:52:03.317Z',
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
}
const mockPage3 = {
  id: 19,
  key: '789',
  title: '789',
  pageType: 'content',
  userCreated: true,
  settings: { includeInNav: true },
  parentId: 7,
  createdAt: '2020-09-09T21:07:57.016Z',
  updatedAt: '2020-09-09T21:07:57.016Z',
  pageblocks: [
    {
      id: 19,
      blockType: 'content',
      ordering: 0,
      settings: {
        header: '',
        headerLevel: 0,
        lgWidth: '12',
        mdWidth: 12,
        smWidth: 12,
        xsWidth: 12,
      },
      createdAt: '2020-09-09T21:08:41.332Z',
      updatedAt: '2020-09-09T21:12:55.843Z',
      pageId: 19,
      pageblockcontents: [
        {
          id: 28,
          contentType: 'image',
          ordering: 2,
          settings: {
            altText: 'tux3',
            header: '',
            headerLevel: 0,
            linkUrl: '',
            src:
              '/uploads/0a14f83599ddabac762593a6ca1e410a4281a6a50acd3182cae46fa005bd0df1.png',
            lgWidth: '4',
            mdWidth: '4',
            smWidth: '4',
            xsWidth: '4',
          },
          wysiwyg: 'null',
          createdAt: '2020-09-09T21:12:12.490Z',
          updatedAt: '2020-09-09T21:13:20.759Z',
          pageblockId: 19,
        },
        {
          id: 27,
          contentType: 'image',
          ordering: 1,
          settings: {
            altText: 'tux2',
            header: '',
            headerLevel: 0,
            linkUrl: '',
            src:
              '/uploads/6976a933427176ede8ffd276b29a0527d68ab553aaaa9b8e7d05a43cfaad6bd9.png',
            lgWidth: '4',
            mdWidth: '4',
            smWidth: '4',
            xsWidth: '4',
          },
          wysiwyg: 'null',
          createdAt: '2020-09-09T21:12:08.474Z',
          updatedAt: '2020-09-09T21:13:15.549Z',
          pageblockId: 19,
        },
        {
          id: 26,
          contentType: 'image',
          ordering: 0,
          settings: {
            altText: 'tux1',
            header: '',
            headerLevel: 0,
            linkUrl: '',
            src:
              '/uploads/6dec3e94a22c3f67c6bfb867114a11310cbef2398b00b86e1b5842648e1a2afb.png',
            lgWidth: '4',
            mdWidth: '4',
            smWidth: '4',
            xsWidth: '4',
          },
          wysiwyg: 'null',
          createdAt: '2020-09-09T21:12:04.087Z',
          updatedAt: '2020-09-09T21:13:07.968Z',
          pageblockId: 19,
        },
      ],
    },
  ],
  fallbackSettings: {
    footerPath: '/home/footer/',
    headerPath: '/home/header/',
    jumboPath: '/home/jumbo/',
    navAlignment: 'left',
    navCollapsible: true,
    navPosition: 'above-header',
    navSpacing: 'normal',
    navType: 'basic',
    showFooter: true,
    showHeader: true,
    showJumbo: true,
    siteTitle: 'Preaction CMS',
    init: true,
    includeInNav: true,
    site: false,
    navOrdering: '',
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
            settings: {
              includeInNav: true,
              site: false,
              navOrdering: '',
              navPosition: 'above-header',
            },
            parentId: 4,
            createdAt: '2020-09-08T14:39:13.303Z',
            updatedAt: '2020-09-08T20:52:03.317Z',
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
    id: 19,
    key: '789',
    title: '789',
    pageType: 'content',
    userCreated: true,
    settings: { includeInNav: true },
    parentId: 7,
    createdAt: '2020-09-09T21:07:57.016Z',
    updatedAt: '2020-09-09T21:07:57.016Z',
    children: [],
    path: 'foo-1/abc/789',
  },
}
const server = setupServer(
  rest.get('/api/page/by-key/foo-1/abc/123', (req, res, ctx) => {
    return res(ctx.json(mockPage1))
  }),
  rest.get('/api/page/by-key/foo-1/abc/456', (req, res, ctx) => {
    return res(ctx.json(mockPage2))
  }),
  rest.get('/api/page/by-key/foo-1/abc/789', (req, res, ctx) => {
    return res(ctx.json(mockPage3))
  }),
  rest.post('/api/page/13/blocks', (req, res, ctx) => {
    return res(
      ctx.json({
        id: Math.random(),
        pageId: '13',
        blockType: req.body.blockType,
        ordering: 0,
        settings: {
          header: '',
          headerLevel: 0,
          lgWidth: 12,
          mdWidth: 12,
          smWidth: 12,
          xsWidth: 12,
          iframeSrc: 'about:blank',
        },
        pageblockcontents: [],
        updatedAt: '2020-09-09T12:37:02.016Z',
        createdAt: '2020-09-09T12:37:02.016Z',
      })
    )
  }),
  rest.delete('/api/page/blocks/16', (req, res, ctx) => {
    return res(ctx.json({}))
  }),
  rest.put('/api/page/blocks/16', (req, res, ctx) => {
    return res(ctx.json({}))
  }),
  rest.put('/api/page/blocks/17', (req, res, ctx) => {
    return res(ctx.json({}))
  }),
  rest.put('/api/page/blocks/18', (req, res, ctx) => {
    return res(ctx.json({}))
  }),
  rest.get('/api/page/blocks/18', (req, res, ctx) => {
    return res(
      ctx.json({
        id: 18,
        blockType: 'iframe',
        ordering: 2,
        settings: {
          header: '',
          headerLevel: 0,
          lgWidth: 12,
          mdWidth: 12,
          smWidth: 12,
          xsWidth: 12,
          iframeSrc: 'about:blank?test=foobar',
        },
        createdAt: '2020-09-09T13:54:33.714Z',
        updatedAt: '2020-09-09T13:54:51.736Z',
        pageId: 16,
        pageblockcontents: [],
      })
    )
  }),
  rest.put('/api/page/blocks/content/26', (req, res, ctx) => {
    return res(ctx.json({}))
  }),
  rest.post('/api/page/blocks/19/content', (req, res, ctx) => {
    return res(
      ctx.json({
        id: -1,
        settings: {},
      })
    )
  }),
  rest.delete('/api/page/19', (req, res, ctx) => {
    return res(ctx.json({}))
  }),
  rest.delete('/api/page/blocks/content/26', (req, res, ctx) => {
    return res(ctx.json({}))
  }),
  rest.put('/api/page/blocks/content/26', (req, res, ctx) => {
    return res(ctx.json({}))
  }),
  rest.put('/api/page/blocks/content/27', (req, res, ctx) => {
    return res(ctx.json({}))
  }),
  rest.put('/api/page/blocks/content/28', (req, res, ctx) => {
    return res(ctx.json({}))
  }),
  rest.put('/api/page/19', (req, res, ctx) => {
    return res(ctx.json({}))
  }),
  rest.get('/api/page/by-key/foobar/', (req, res, ctx) => {
    return res(ctx.status(400), ctx.json({ error: 'foobar' }))
  }),
  rest.get('/api/page/by-key/notfound/', (req, res, ctx) => {
    return res(ctx.status(404), ctx.json({ error: 'foobar' }))
  }),
  rest.get(/.*/, (req, res, ctx) => {
    console.debug(req.url.toString())
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function getResult(overrideProps = {}) {
  const props = {
    appRoot: '',
    deletePage: () => {},
    editable: true,
    emitSave: () => {},
    fallbackSettings: {},
    footerControl: () => {},
    headerControl: () => {},
    jumboControl: () => {},
    navigate: () => {},
    onError: () => {},
    onNotFound: () => {},
    path: '/foo-1/abc/123/',
    setActivePage: () => {},
    setActivePathname: () => {},
    token: 'foobar',
  }
  Object.assign(props, overrideProps)
  const e = (props) => (
    <StaticRouter>
      <Page {...props} />
    </StaticRouter>
  )
  const result = render(e(props))
  const rerender = (overrideProps) => {
    Object.assign(props, overrideProps)
    result.rerender(e(props))
  }
  return { result, rerender }
}

test('blank page', async () => {
  const { result } = getResult()
  expect(result.container.firstChild).toHaveClass('page')
  await waitFor(() =>
    expect(result.container.querySelector('.row')).toBeInTheDocument()
  )
})

test('add page block', async () => {
  const { result } = getResult()
  await waitFor(() =>
    expect(result.container.querySelector('.row')).toBeInTheDocument()
  )
  expect(
    result.container.querySelector('.block-type-iframe')
  ).not.toBeInTheDocument()
  userEvent.click(result.container.querySelector('.add-iframe-block'))
  await waitFor(() =>
    expect(
      result.container.querySelector('.block-type-iframe')
    ).toBeInTheDocument()
  )
  userEvent.click(result.container.querySelector('.add-nav-block'))
  await waitFor(() =>
    expect(
      result.container.querySelector('.block-type-nav')
    ).toBeInTheDocument()
  )
  userEvent.click(result.container.querySelector('.add-content-block'))
  await waitFor(() =>
    expect(
      result.container.querySelector('.block-type-content')
    ).toBeInTheDocument()
  )
})

test('blockControl:delete', async () => {
  let emitSaveCalled = false
  const { result } = getResult({
    path: '/foo-1/abc/456/',
    emitSave: () => {
      emitSaveCalled = true
    },
  })
  expect(result.container.firstChild).toHaveClass('page')
  await waitFor(() =>
    expect(result.container.querySelector('.row')).toBeInTheDocument()
  )
  expect(result.container.querySelectorAll('.block-type-iframe').length).toBe(3)
  userEvent.click(result.container.querySelectorAll('.delete-block')[0])
  await waitFor(() =>
    expect(result.container.querySelectorAll('.block-type-iframe').length).toBe(
      2
    )
  )
  await waitFor(() => expect(emitSaveCalled).toBe(true))
})

test('blockControl:next', async () => {
  let emitSaveCalled = false
  const { result } = getResult({
    path: '/foo-1/abc/456/',
    emitSave: () => {
      emitSaveCalled = true
    },
  })
  expect(result.container.firstChild).toHaveClass('page')
  await waitFor(() =>
    expect(result.container.querySelector('.row')).toBeInTheDocument()
  )
  expect(result.container.querySelectorAll('.block-type-iframe').length).toBe(3)
  expect(
    result.container.querySelectorAll('.block-type-iframe iframe').length
  ).toBe(3)
  expect(
    result.container.querySelectorAll('.block-type-iframe iframe')[0].src
  ).toBe('about:blank?test=1')
  expect(
    result.container.querySelectorAll('.block-type-iframe iframe')[1].src
  ).toBe('about:blank?test=2')
  expect(
    result.container.querySelectorAll('.block-type-iframe iframe')[2].src
  ).toBe('about:blank?test=3')
  userEvent.click(result.container.querySelectorAll('.move-block.next')[0])
  expect(
    result.container.querySelectorAll('.block-type-iframe iframe')[0].src
  ).toBe('about:blank?test=2')
  expect(
    result.container.querySelectorAll('.block-type-iframe iframe')[1].src
  ).toBe('about:blank?test=1')
  expect(
    result.container.querySelectorAll('.block-type-iframe iframe')[2].src
  ).toBe('about:blank?test=3')
  await waitFor(() => expect(emitSaveCalled).toBe(true))
})

test('blockControl:previous', async () => {
  let emitSaveCalled = false
  const { result } = getResult({
    path: '/foo-1/abc/456/',
    emitSave: () => {
      emitSaveCalled = true
    },
  })
  expect(result.container.firstChild).toHaveClass('page')
  await waitFor(() =>
    expect(result.container.querySelector('.row')).toBeInTheDocument()
  )
  expect(result.container.querySelectorAll('.block-type-iframe').length).toBe(3)
  expect(
    result.container.querySelectorAll('.block-type-iframe iframe')[0].src
  ).toBe('about:blank?test=1')
  expect(
    result.container.querySelectorAll('.block-type-iframe iframe')[1].src
  ).toBe('about:blank?test=2')
  expect(
    result.container.querySelectorAll('.block-type-iframe iframe')[2].src
  ).toBe('about:blank?test=3')
  userEvent.click(result.container.querySelectorAll('.move-block.previous')[2])
  expect(
    result.container.querySelectorAll('.block-type-iframe iframe')[0].src
  ).toBe('about:blank?test=1')
  expect(
    result.container.querySelectorAll('.block-type-iframe iframe')[1].src
  ).toBe('about:blank?test=3')
  expect(
    result.container.querySelectorAll('.block-type-iframe iframe')[2].src
  ).toBe('about:blank?test=2')
  await waitFor(() => expect(emitSaveCalled).toBe(true))
})

test('blockControl:refresh', async () => {
  const { result } = getResult({
    path: '/foo-1/abc/456/',
  })
  expect(result.container.firstChild).toHaveClass('page')
  await waitFor(() =>
    expect(result.container.querySelector('.row')).toBeInTheDocument()
  )
  expect(result.container.querySelectorAll('.block-type-iframe').length).toBe(3)
  expect(
    result.container.querySelectorAll('.block-type-iframe iframe')[2].src
  ).toBe('about:blank?test=3')
  result.container.firstChild.blockControl(18, 'refresh') // FIXME not best practice
  await waitFor(() =>
    expect(
      result.container.querySelectorAll('.block-type-iframe iframe')[2].src
    ).toBe('about:blank?test=foobar')
  )
})

test('getContentSettingsValueHandler', async () => {
  let emitSaveCalled = false
  const { result } = getResult({
    path: '/foo-1/abc/789/',
    emitSave: () => {
      emitSaveCalled = true
    },
  })
  expect(result.container.firstChild).toHaveClass('page')
  await waitFor(() =>
    expect(result.container.querySelector('.row')).toBeInTheDocument()
  )
  userEvent.click(result.container.querySelectorAll('.btn.content-settings')[0])
  expect(result.getByText('Content Type "image" Settings')).toBeInTheDocument()
  expect(result.getByLabelText('Alt Text')).toBeInTheDocument()
  userEvent.type(result.getByLabelText('Alt Text'), '!')
  await waitFor(
    () =>
      new Promise((resolve, reject) => {
        setTimeout(resolve, 1250)
      })
  )
  expect(emitSaveCalled).toBe(true)
})

test('getPageBlockSettingsValueHandler', async () => {
  let emitSaveCalled = false
  const { result } = getResult({
    path: '/foo-1/abc/456/',
    emitSave: () => {
      emitSaveCalled = true
    },
  })
  expect(result.container.firstChild).toHaveClass('page')
  await waitFor(() =>
    expect(result.container.querySelector('.row')).toBeInTheDocument()
  )
  userEvent.click(result.container.querySelectorAll('.btn.block-settings')[0])
  expect(result.getByText('Block Type "iframe" Settings')).toBeInTheDocument()
  expect(result.getByLabelText('URL')).toBeInTheDocument()
  userEvent.type(result.getByLabelText('URL'), '!')
  await waitFor(
    () =>
      new Promise((resolve, reject) => {
        setTimeout(resolve, 1250)
      })
  )
  expect(emitSaveCalled).toBe(true)
})

test('addContent', async () => {
  let emitSaveCalled = false
  const { result } = getResult({
    path: '/foo-1/abc/789/',
    emitSave: () => {
      emitSaveCalled = true
    },
  })
  expect(result.container.firstChild).toHaveClass('page')
  await waitFor(() =>
    expect(result.container.querySelector('.row')).toBeInTheDocument()
  )
  userEvent.click(result.container.querySelector('.btn.add-wysiwyg'))
  await waitFor(() => expect(emitSaveCalled).toBe(true))
})

test('deletePage', async () => {
  let deletePageCalled = false
  const { result } = getResult({
    path: '/foo-1/abc/789/',
    deletePage: () => {
      deletePageCalled = true
    },
  })
  expect(result.container.firstChild).toHaveClass('page')
  await waitFor(() =>
    expect(result.container.querySelector('.row')).toBeInTheDocument()
  )
  result.container.firstChild.deletePage()
  await waitFor(() => expect(deletePageCalled).toBe(true))
})

test('blank page on init404', async () => {
  let notFoundCalled = false
  const { result } = getResult({
    init404: true,
    onNotFound: () => {
      notFoundCalled = true
    },
  })
  expect(result).toBeTruthy()
  expect(result.container.firstChild).toHaveClass('page')
  expect(notFoundCalled).toBe(true)
})

test('contentControl:delete', async () => {
  let emitSaveCalled = false
  const { result } = getResult({
    path: '/foo-1/abc/789/',
    emitSave: () => {
      emitSaveCalled = true
    },
  })
  expect(result.container.firstChild).toHaveClass('page')
  await waitFor(() =>
    expect(result.container.querySelector('.row')).toBeInTheDocument()
  )
  expect(result.container.querySelectorAll('.page-block-content').length).toBe(
    3
  )
  userEvent.click(result.container.querySelectorAll('.delete-content')[0])
  await waitFor(() =>
    expect(
      result.container.querySelectorAll('.page-block-content').length
    ).toBe(2)
  )
  await waitFor(() => expect(emitSaveCalled).toBe(true))
})

test('contentControl:next', async () => {
  let emitSaveCalled = false
  const { result } = getResult({
    path: '/foo-1/abc/789/',
    emitSave: () => {
      emitSaveCalled = true
    },
  })
  expect(result.container.firstChild).toHaveClass('page')
  await waitFor(() =>
    expect(result.container.querySelector('.row')).toBeInTheDocument()
  )
  expect(result.container.querySelectorAll('.page-block-content').length).toBe(
    3
  )
  expect(
    result.container.querySelectorAll('.page-block-content img')[0].alt
  ).toBe('tux1')
  expect(
    result.container.querySelectorAll('.page-block-content img')[1].alt
  ).toBe('tux2')
  expect(
    result.container.querySelectorAll('.block-type-content img')[2].alt
  ).toBe('tux3')
  userEvent.click(result.container.querySelectorAll('.move-content.next')[0])
  expect(
    result.container.querySelectorAll('.page-block-content img')[0].alt
  ).toBe('tux2')
  expect(
    result.container.querySelectorAll('.page-block-content img')[1].alt
  ).toBe('tux1')
  expect(
    result.container.querySelectorAll('.page-block-content img')[2].alt
  ).toBe('tux3')
  await waitFor(() => expect(emitSaveCalled).toBe(true))
})

test('contentControl:previous', async () => {
  let emitSaveCalled = false
  const { result } = getResult({
    path: '/foo-1/abc/789/',
    emitSave: () => {
      emitSaveCalled = true
    },
  })
  expect(result.container.firstChild).toHaveClass('page')
  await waitFor(() =>
    expect(result.container.querySelector('.row')).toBeInTheDocument()
  )
  expect(result.container.querySelectorAll('.page-block-content').length).toBe(
    3
  )
  expect(
    result.container.querySelectorAll('.page-block-content img')[0].alt
  ).toBe('tux1')
  expect(
    result.container.querySelectorAll('.page-block-content img')[1].alt
  ).toBe('tux2')
  expect(
    result.container.querySelectorAll('.page-block-content img')[2].alt
  ).toBe('tux3')
  userEvent.click(
    result.container.querySelectorAll('.move-content.previous')[2]
  )
  expect(
    result.container.querySelectorAll('.page-block-content img')[0].alt
  ).toBe('tux1')
  expect(
    result.container.querySelectorAll('.page-block-content img')[1].alt
  ).toBe('tux3')
  expect(
    result.container.querySelectorAll('.page-block-content img')[2].alt
  ).toBe('tux2')
  await waitFor(() => expect(emitSaveCalled).toBe(true))
})

test('getPageValueHandler', async () => {
  let emitSaveCalled = false
  const { result } = getResult({
    path: '/foo-1/abc/789/',
    emitSave: () => {
      emitSaveCalled = true
    },
  })
  expect(result.container.firstChild).toHaveClass('page')
  await waitFor(() =>
    expect(result.container.querySelector('.row')).toBeInTheDocument()
  )
  result.container.firstChild.toggleSettings()
  expect(result.getByText('Page Settings')).toBeInTheDocument()
  expect(result.getByLabelText('Page Title')).toBeInTheDocument()
  userEvent.type(result.getByLabelText('Page Title'), '!')
  await waitFor(
    () =>
      new Promise((resolve, reject) => {
        setTimeout(resolve, 1250)
      })
  )
  expect(emitSaveCalled).toBe(true)
})

test('getPageSettingsValueHandler and getPageSettingsResetter', async () => {
  let x = false
  let headerControlCalled = false
  let footerControlCalled = false
  let jumboControlCalled = false
  const { result } = getResult({
    path: '/foo-1/abc/789/',
    emitSave: () => {
      x = !x
    },
    headerControl: () => {
      headerControlCalled = true
    },
    footerControl: () => {
      footerControlCalled = true
    },
    jumboControl: () => {
      jumboControlCalled = true
    },
  })
  expect(result.container.firstChild).toHaveClass('page')
  await waitFor(() =>
    expect(result.container.querySelector('.row')).toBeInTheDocument()
  )
  result.container.firstChild.toggleSettings()
  expect(result.getByText('Page Settings')).toBeInTheDocument()
  expect(result.getByLabelText('Nav Position')).toBeInTheDocument()
  expect(x).toBe(false)
  userEvent.click(result.getByLabelText('Nav Position'))
  userEvent.selectOptions(result.getByLabelText('Nav Position'), 'below-header')
  await waitFor(
    () =>
      new Promise((resolve, reject) => {
        setTimeout(resolve, 1250)
      })
  )
  expect(x).toBe(true)
  userEvent.click(result.container.querySelector('.nav-position-field button'))
  await waitFor(
    () =>
      new Promise((resolve, reject) => {
        setTimeout(resolve, 1250)
      })
  )
  expect(x).toBe(false)
  userEvent.click(result.getByLabelText('Show Header'))
  expect(headerControlCalled).toBe(true)
  userEvent.click(result.getByLabelText('Show Footer'))
  expect(footerControlCalled).toBe(true)
  userEvent.click(result.getByLabelText('Show Jumbotron'))
  expect(jumboControlCalled).toBe(true)
})

test('onNotFound', async () => {
  let onNotFoundCalled = false
  const { result } = getResult({
    path: '/notfound/',
    onNotFound: () => {
      onNotFoundCalled = true
    },
  })
  expect(result.container.firstChild).toHaveClass('page')
  await waitFor(() => expect(onNotFoundCalled).toBe(true))
})

test('onError', async () => {
  let onErrorCalled = false
  const { result } = getResult({
    path: '/foobar/',
    onError: () => {
      onErrorCalled = true
    },
  })
  expect(result.container.firstChild).toHaveClass('page')
  await waitFor(() => expect(onErrorCalled).toBe(true))
})

test('path prop change', async () => {
  const { result, rerender } = getResult({
    path: '/foo-1/abc/456/',
  })
  expect(result.container.firstChild).toHaveClass('page')
  await waitFor(() =>
    expect(result.container.querySelector('.row')).toBeInTheDocument()
  )
  expect(result.container.querySelectorAll('.block-type-iframe').length).toBe(3)
  expect(result.container.querySelectorAll('.block-type-content').length).toBe(
    0
  )
  rerender({
    path: '/foo-1/abc/789/',
  })
  await waitFor(() =>
    expect(result.container.querySelector('.row')).toBeInTheDocument()
  )
  expect(result.container.querySelectorAll('.block-type-iframe').length).toBe(0)
  expect(result.container.querySelectorAll('.block-type-content').length).toBe(
    1
  )
})

test('fast path prop change', async () => {
  const { result, rerender } = getResult({
    path: '/foo-1/abc/456/',
  })
  expect(result.container.firstChild).toHaveClass('page')
  rerender({
    path: '/foo-1/abc/789/',
  })
  await waitFor(() =>
    expect(result.container.querySelector('.row')).toBeInTheDocument()
  )
  expect(result.container.querySelectorAll('.block-type-iframe').length).toBe(0)
  expect(result.container.querySelectorAll('.block-type-content').length).toBe(
    1
  )
})
