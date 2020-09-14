import React from 'react'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import App from '../App.jsx'

const mockHomeHeader = {
  id: 2,
  key: 'header',
  title: null,
  pageType: 'content',
  userCreated: false,
  settings: {},
  parentId: 1,
  createdAt: '2020-09-07T21:48:42.932Z',
  updatedAt: '2020-09-07T21:48:42.932Z',
  pageblocks: [
    {
      id: 1,
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
      createdAt: '2020-09-07T21:49:00.342Z',
      updatedAt: '2020-09-07T21:49:00.342Z',
      pageId: 2,
      pageblockcontents: [
        {
          id: 1,
          contentType: 'wysiwyg',
          ordering: 0,
          settings: {
            header: '',
            headerLevel: 0,
            lgWidth: 12,
            mdWidth: 12,
            smWidth: 12,
            xsWidth: 12,
          },
          wysiwyg: '<p>foo-header</p>',
          createdAt: '2020-09-07T21:49:00.382Z',
          updatedAt: '2020-09-07T21:49:04.994Z',
          pageblockId: 1,
        },
      ],
    },
  ],
}
const mockHomeFooter = {
  id: 3,
  key: 'footer',
  title: null,
  pageType: 'content',
  userCreated: false,
  settings: {},
  parentId: 1,
  createdAt: '2020-09-07T21:48:42.994Z',
  updatedAt: '2020-09-07T21:48:42.994Z',
  pageblocks: [
    {
      id: 2,
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
      createdAt: '2020-09-07T21:49:05.788Z',
      updatedAt: '2020-09-07T21:49:05.788Z',
      pageId: 3,
      pageblockcontents: [
        {
          id: 2,
          contentType: 'wysiwyg',
          ordering: 0,
          settings: {
            header: '',
            headerLevel: 0,
            lgWidth: 12,
            mdWidth: 12,
            smWidth: 12,
            xsWidth: 12,
          },
          wysiwyg: '<p>bar-footer</p>',
          createdAt: '2020-09-07T21:49:05.838Z',
          updatedAt: '2020-09-07T21:49:15.347Z',
          pageblockId: 2,
        },
      ],
    },
  ],
}
const mockHomePage = {
  id: 1,
  key: 'home',
  title: null,
  pageType: 'content',
  userCreated: false,
  settings: {},
  parentId: null,
  createdAt: '2020-09-07T21:51:52.043Z',
  updatedAt: '2020-09-07T21:51:52.043Z',
  pageblocks: [
    {
      id: 8,
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
      createdAt: '2020-09-08T19:07:43.157Z',
      updatedAt: '2020-09-08T19:07:43.157Z',
      pageId: 1,
      pageblockcontents: [
        {
          id: 7,
          contentType: 'wysiwyg',
          ordering: 0,
          settings: {
            header: '',
            headerLevel: 0,
            lgWidth: 12,
            mdWidth: 12,
            smWidth: 12,
            xsWidth: 12,
          },
          wysiwyg: '<h1>Home Page</h1>',
          createdAt: '2020-09-08T19:07:43.203Z',
          updatedAt: '2020-09-10T14:58:22.434Z',
          pageblockId: 8,
        },
        {
          id: 31,
          contentType: 'wysiwyg',
          ordering: 1,
          settings: {
            header: '',
            headerLevel: 0,
            lgWidth: 12,
            mdWidth: 12,
            smWidth: 12,
            xsWidth: 12,
          },
          wysiwyg:
            '<p><a href="/test/" rel="noopener noreferrer" target="_blank">Go to Test Page</a></p>',
          createdAt: '2020-09-10T14:57:20.289Z',
          updatedAt: '2020-09-10T14:58:38.590Z',
          pageblockId: 8,
        },
        {
          id: 33,
          contentType: 'wysiwyg',
          ordering: 2,
          settings: {
            header: '',
            headerLevel: 0,
            lgWidth: 12,
            mdWidth: 12,
            smWidth: 12,
            xsWidth: 12,
          },
          wysiwyg:
            '<p><a href="/login/" rel="noopener noreferrer" target="_blank">Login</a></p>',
          createdAt: '2020-09-10T19:26:38.411Z',
          updatedAt: '2020-09-10T19:26:50.720Z',
          pageblockId: 8,
        },
      ],
    },
  ],
  fallbackSettings: {
    footerPath: '/home/footer/',
    headerPath: '/home/header/',
    navAlignment: 'left',
    navCollapsible: true,
    navPosition: 'fixed-top',
    navSpacing: 'normal',
    navType: 'basic',
    showFooter: true,
    showHeader: true,
    siteTitle: 'Preaction CMS',
    init: true,
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
            settings: { includeInNav: true, site: false, navOrdering: '' },
            parentId: 4,
            createdAt: '2020-09-08T14:39:13.303Z',
            updatedAt: '2020-09-10T14:18:01.633Z',
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
      {
        id: 22,
        key: 'test',
        title: 'Test',
        pageType: 'content',
        userCreated: true,
        settings: { includeInNav: true },
        parentId: null,
        createdAt: '2020-09-10T14:57:49.264Z',
        updatedAt: '2020-09-10T14:57:49.264Z',
        children: [],
        path: 'test',
      },
    ],
  },
  tree: {
    id: 1,
    key: 'home',
    title: null,
    pageType: 'content',
    userCreated: false,
    settings: {},
    parentId: null,
    createdAt: '2020-09-07T21:51:52.043Z',
    updatedAt: '2020-09-07T21:51:52.043Z',
    children: [],
    path: 'home',
  },
}
const mockSettings = {
  footerPath: '/home/footer/',
  headerPath: '/home/header/',
  init: true,
  isNavParent: false,
  navAlignment: 'left',
  navCollapsible: true,
  navPosition: 'fixed-top',
  navSpacing: 'normal',
  navType: 'basic',
  showFooter: true,
  showHeader: true,
  siteTitle: 'Preaction CMS',
}
const mockSession = {
  cookie: {
    originalMaxAge: 31536000000,
    expires: '2021-09-07T21:48:52.236Z',
    secure: false,
    httpOnly: true,
    path: '/',
  },
}
const mockTestPage = {
  id: 22,
  key: 'test',
  title: 'Test',
  pageType: 'content',
  userCreated: true,
  settings: { includeInNav: true },
  parentId: null,
  createdAt: '2020-09-10T14:57:49.264Z',
  updatedAt: '2020-09-10T14:57:49.264Z',
  pageblocks: [
    {
      id: 20,
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
      createdAt: '2020-09-10T14:58:06.036Z',
      updatedAt: '2020-09-10T14:58:06.036Z',
      pageId: 22,
      pageblockcontents: [
        {
          id: 32,
          contentType: 'wysiwyg',
          ordering: 0,
          settings: {
            header: '',
            headerLevel: 0,
            lgWidth: 12,
            mdWidth: 12,
            smWidth: 12,
            xsWidth: 12,
          },
          wysiwyg: '<h1>Test Page</h1>',
          createdAt: '2020-09-10T14:58:06.086Z',
          updatedAt: '2020-09-10T14:58:14.174Z',
          pageblockId: 20,
        },
      ],
    },
  ],
  fallbackSettings: {
    footerPath: '/home/footer/',
    headerPath: '/home/header/',
    navAlignment: 'left',
    navCollapsible: true,
    navPosition: 'fixed-top',
    navSpacing: 'normal',
    navType: 'basic',
    showFooter: true,
    showHeader: true,
    siteTitle: 'Preaction CMS',
    init: true,
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
            },
            parentId: 4,
            createdAt: '2020-09-08T14:39:13.303Z',
            updatedAt: '2020-09-10T14:18:01.633Z',
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
      {
        id: 22,
        key: 'test',
        title: 'Test',
        pageType: 'content',
        userCreated: true,
        settings: { includeInNav: true },
        parentId: null,
        createdAt: '2020-09-10T14:57:49.264Z',
        updatedAt: '2020-09-10T14:57:49.264Z',
        children: [],
        path: 'test',
      },
    ],
  },
  tree: {
    id: 22,
    key: 'test',
    title: 'Test',
    pageType: 'content',
    userCreated: true,
    settings: { includeInNav: true },
    parentId: null,
    createdAt: '2020-09-10T14:57:49.264Z',
    updatedAt: '2020-09-10T14:57:49.264Z',
    children: [],
    path: 'test',
  },
}
const mockNewPage = {
  id: 25,
  pageType: 'content',
  key: 'foobar',
  title: 'FooBar',
  parentId: null,
  userCreated: true,
  settings: { includeInNav: true },
  updatedAt: '2020-09-10T20:37:01.387Z',
  createdAt: '2020-09-10T20:37:01.387Z',
}
const serverCalls = []
const server = setupServer(
  rest.get(/./, (req, res, ctx) => {
    serverCalls.push({ method: 'GET', url: req.url.toString() })
  }),
  rest.put(/./, (req, res, ctx) => {
    serverCalls.push({ method: 'PUT', url: req.url.toString() })
  }),
  rest.post(/./, (req, res, ctx) => {
    serverCalls.push({ method: 'POST', url: req.url.toString() })
  }),
  rest.delete(/./, (req, res, ctx) => {
    serverCalls.push({ method: 'DELETE', url: req.url.toString() })
  }),
  rest.get('/api/settings', (req, res, ctx) => {
    return res(ctx.json(mockSettings))
  }),
  rest.get('/api/session', (req, res, ctx) => {
    return res(ctx.json(mockSession))
  }),
  rest.get('/api/page/by-key/home/header/', (req, res, ctx) => {
    return res(ctx.json(mockHomeHeader))
  }),
  rest.get('/api/page/by-key/home/footer/', (req, res, ctx) => {
    return res(ctx.json(mockHomeFooter))
  }),
  rest.get('/api/page/by-key/home/', (req, res, ctx) => {
    return res(ctx.json(mockHomePage))
  }),
  rest.get('/api/page/by-key/test/', (req, res, ctx) => {
    return res(ctx.json(mockTestPage))
  }),
  rest.get('/api/page/by-key/notfound/', (req, res, ctx) => {
    return res(ctx.status(404), ctx.json({ error: 'not found' }))
  }),
  rest.get('/api/page/by-key/failbar/', (req, res, ctx) => {
    return res(ctx.status(500), ctx.json({ error: 'failbar' }))
  }),
  rest.get('/api/page/settings/by-key/notfound/', (req, res, ctx) => {
    return res(ctx.json(mockSettings))
  }),
  rest.get('/api/page/sitemap/by-key/notfound/', (req, res, ctx) => {
    return res(ctx.json(mockHomePage.siteMap))
  }),
  rest.get('/api/token', (req, res, ctx) => {
    return res(ctx.json('foobar'))
  }),
  rest.post('/api/login', (req, res, ctx) => {
    mockSession.token = 'foobar'
    mockSession.userId = 1
    mockSession.admin = true
    mockSession.authenticated = true
    return res(ctx.json(mockSession))
  }),
  rest.post('/api/page', (req, res, ctx) => {
    mockHomePage.siteMap.children.push(
      Object.assign({}, mockNewPage, { children: [] })
    )
    return res(ctx.json(mockNewPage))
  }),
  rest.get('/api/page/1/sitemap', (req, res, ctx) => {
    return res(ctx.json(mockHomePage.siteMap))
  }),
  rest.get('/api/backups', (req, res, ctx) => {
    return res(ctx.json([]))
  }),
  rest.get('/api/redirect', (req, res, ctx) => {
    return res(ctx.json([]))
  }),
  rest.post('/api/settings', (req, res, ctx) => {
    Object.assign(mockSettings, req.body)
    return res(ctx.json(mockSettings))
  }),
  rest.delete('/api/page/22', (req, res, ctx) => {
    return res(ctx.json(true))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

window.confirm = jest.fn(() => true)

test('renders without crashing', async () => {
  const result = render(<App initPath='/' />)
  expect(result.container.firstChild).toHaveClass('App')
  await waitFor(() => expect(result.getByText('Home Page')).toBeInTheDocument())
})

test('server-side rendering', () => {
  const mockPage = Object.assign({}, mockHomePage, {
    header: mockHomeHeader,
    footer: mockHomeFooter,
  })
  const result = render(
    <App initPath='/' initPage={mockPage} initSettings={mockSettings} />
  )
  expect(result.getByText('Home Page')).toBeInTheDocument()
})

test('relative links are handled by navigate function', async () => {
  const result = render(<App initPath='/' />)
  expect(result.container.firstChild).toHaveClass('App')
  await waitFor(() => expect(result.getByText('Home Page')).toBeInTheDocument())
  userEvent.click(result.getByText('Go to Test Page'))
  await waitFor(() => expect(result.getByText('Test Page')).toBeInTheDocument())
})

test('404 renders NotFound', async () => {
  const result = render(<App initPath='/notfound/' />)
  expect(result.container.firstChild).toHaveClass('App')
  await waitFor(() =>
    expect(result.container.querySelector('.not-found')).toBeInTheDocument()
  )
  await waitFor(() =>
    expect(
      serverCalls.some((call) => {
        return (
          call.method === 'GET' &&
          call.url.match(new RegExp('/api/page/settings/by-key/notfound/'))
        )
      })
    ).toBe(true)
  )
})

test('/home renders NotFound', async () => {
  const result = render(<App initPath='/home/' />)
  expect(result.container.firstChild).toHaveClass('App')
  await waitFor(() =>
    expect(result.container.querySelector('.not-found')).toBeInTheDocument()
  )
})

test('5xx renders ErrorMessage', async () => {
  const result = render(<App initPath='/failbar/' />)
  expect(result.container.firstChild).toHaveClass('App')
  await waitFor(() =>
    expect(
      result.container.querySelector('.page-error-message')
    ).toBeInTheDocument()
  )
})

test('login', async () => {
  const result = render(<App initPath='/login/' />)
  expect(result.container.firstChild).toHaveClass('App')
  expect(result.container.querySelector('.nav-user')).not.toBeInTheDocument()
  await waitFor(() =>
    expect(result.getByLabelText('Username')).toBeInTheDocument()
  )
  userEvent.type(result.getByLabelText('Username'), 'admin')
  userEvent.type(result.getByLabelText('Password'), 'admin')
  userEvent.click(result.getByText('Log In'))
  await waitFor(() => expect(result.getByText('Home Page')).toBeInTheDocument())
  expect(result.container.querySelector('.nav-user')).toBeInTheDocument()
})

test('create new page', async () => {
  const result = render(<App initPath='/login/' />)
  expect(result.container.firstChild).toHaveClass('App')
  expect(result.container.querySelector('.nav-user')).not.toBeInTheDocument()
  await waitFor(() =>
    expect(result.getByLabelText('Username')).toBeInTheDocument()
  )
  userEvent.type(result.getByLabelText('Username'), 'admin')
  userEvent.type(result.getByLabelText('Password'), 'admin')
  userEvent.click(result.getByText('Log In'))
  await waitFor(() => expect(result.getByText('Home Page')).toBeInTheDocument())
  expect(result.container.querySelector('.nav-user')).toBeInTheDocument()
  userEvent.click(result.container.querySelector('.nav-toggle-edit a'))
  expect(result.container.querySelector('.nav-new-page')).toBeInTheDocument()
  userEvent.click(result.container.querySelector('.nav-new-page a'))
  expect(result.getByLabelText('Page Title')).toBeInTheDocument()
  expect(result.getByLabelText('URL Path')).toBeInTheDocument()
  userEvent.type(result.getByLabelText('Page Title'), 'FooBar')
  userEvent.click(
    result.container.querySelector('.new-page-modal-container .btn-success')
  )
  await waitFor(() =>
    expect(result.container.querySelectorAll('.nav-page-foobar').length).toBe(2)
  )
})

test('edit site settings', async () => {
  jest.setTimeout(10000)
  const result = render(<App initPath='/login/' />)
  expect(result.container.firstChild).toHaveClass('App')
  expect(result.container.querySelector('.nav-user')).not.toBeInTheDocument()
  await waitFor(() =>
    expect(result.getByLabelText('Username')).toBeInTheDocument()
  )
  userEvent.type(result.getByLabelText('Username'), 'admin')
  userEvent.type(result.getByLabelText('Password'), 'admin')
  await waitFor(
    () =>
      new Promise((resolve, reject) => {
        setTimeout(resolve, 1200)
      })
  )
  userEvent.click(result.getByText('Log In'))
  await waitFor(() => expect(result.getByText('Home Page')).toBeInTheDocument())
  expect(result.container.querySelector('.nav-user')).toBeInTheDocument()
  userEvent.click(result.container.querySelector('.nav-toggle-edit a'))
  expect(result.container.querySelector('.nav-new-page')).toBeInTheDocument()
  userEvent.click(result.container.querySelector('.nav-settings a'))
  expect(result.getByText('Site Settings')).toBeInTheDocument()
  expect(result.getByLabelText('Nav Position')).toBeInTheDocument()
  await waitFor(
    () =>
      new Promise((resolve, reject) => {
        setTimeout(resolve, 1000)
      })
  )
  userEvent.selectOptions(result.getByLabelText('Nav Position'), 'above-header')
  expect(result.getByLabelText('Nav Type')).toBeInTheDocument()
  await waitFor(
    () =>
      new Promise((resolve, reject) => {
        setTimeout(resolve, 1000)
      })
  )
  await waitFor(() =>
    expect(
      serverCalls.some(
        (call) =>
          call.method === 'POST' && call.url.match(new RegExp('/api/settings'))
      )
    )
  )
  await waitFor(() =>
    expect(
      serverCalls.some(
        (call) =>
          call.method === 'GET' && call.url.match(new RegExp('/api/backups'))
      )
    )
  )
  await waitFor(() =>
    expect(
      serverCalls.some(
        (call) =>
          call.method === 'GET' && call.url.match(new RegExp('/api/redirect'))
      )
    )
  )
  userEvent.click(
    result.container.querySelector(
      '.site-settings-modal-container .btn-secondary'
    )
  )
  userEvent.click(result.container.querySelector('.nav-page-home'))
  await waitFor(
    () =>
      new Promise((resolve, reject) => {
        setTimeout(resolve, 1000)
      })
  )
})

test('delete page', async () => {
  const result = render(<App initPath='/login/' />)
  expect(result.container.firstChild).toHaveClass('App')
  expect(result.container.querySelector('.nav-user')).not.toBeInTheDocument()
  await waitFor(() =>
    expect(result.getByLabelText('Username')).toBeInTheDocument()
  )
  userEvent.type(result.getByLabelText('Username'), 'admin')
  userEvent.type(result.getByLabelText('Password'), 'admin')
  userEvent.click(result.getByText('Log In'))
  await waitFor(() => expect(result.getByText('Home Page')).toBeInTheDocument())
  expect(result.container.querySelector('.nav-user')).toBeInTheDocument()
  userEvent.click(result.getByText('Go to Test Page'))
  await waitFor(() => expect(result.getByText('Test Page')).toBeInTheDocument())
  userEvent.click(result.container.querySelector('.nav-toggle-edit a'))
  expect(result.container.querySelector('.nav-settings')).toBeInTheDocument()
  userEvent.click(result.container.querySelector('.nav-settings a'))
  expect(result.getByText('Page Settings')).toBeInTheDocument()
  userEvent.click(result.getByLabelText('Confirm to delete this page'))
  userEvent.click(result.container.querySelector('.delete-page .btn-danger'))
  await waitFor(() =>
    expect(
      serverCalls.some(
        (call) =>
          call.method === 'DELETE' && call.url.match(new RegExp('/api/page/22'))
      )
    ).toBe(true)
  )
  await waitFor(() => expect(result.getByText('Home Page')).toBeInTheDocument())
})

test('globalThis.preaction.reload', async () => {
  const result = render(<App initPath='/' />)
  expect(result.container.firstChild).toHaveClass('App')
  await waitFor(() =>
    expect(result.container.querySelector('.page')).toBeInTheDocument()
  )

  window.preaction.reload()
  expect(
    result.container.querySelector('.spinner-container')
  ).toBeInTheDocument()
  await waitFor(() =>
    expect(result.container.querySelector('.row')).toBeInTheDocument()
  )

  window.preaction.reload({ action: 'add-page' })
  expect(
    result.container.querySelector('.spinner-container')
  ).toBeInTheDocument()
  await waitFor(() =>
    expect(result.container.querySelector('.row')).toBeInTheDocument()
  )

  window.preaction.reload({ action: 'delete-page' })
  expect(
    result.container.querySelector('.spinner-container')
  ).toBeInTheDocument()
  await waitFor(() =>
    expect(result.container.querySelector('.row')).toBeInTheDocument()
  )

  window.preaction.reload({ action: 'update-settings' })
  expect(
    result.container.querySelector('.spinner-container')
  ).toBeInTheDocument()
  await waitFor(() =>
    expect(result.container.querySelector('.row')).toBeInTheDocument()
  )
})
