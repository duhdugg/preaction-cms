import React from 'react'
import { render, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import App from '../App.jsx'

const server = setupServer(
  rest.get('/api/settings', (req, res, ctx) => {
    return res(
      ctx.json({
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
      })
    )
  }),
  rest.get('/api/session', (req, res, ctx) => {
    return res(
      ctx.json({
        cookie: {
          originalMaxAge: 31536000000,
          expires: '2021-09-07T21:48:52.236Z',
          secure: false,
          httpOnly: true,
          path: '/',
        },
        token: '1599515329927:0.6455497085802808',
        userId: 1,
        authenticated: true,
        admin: true,
      })
    )
  }),
  rest.get('/api/page/by-key/home/header/', (req, res, ctx) => {
    return res(
      ctx.json({
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
                filename: null,
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
      })
    )
  }),
  rest.get('/api/page/by-key/home/footer/', (req, res, ctx) => {
    return res(
      ctx.json({
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
                filename: null,
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
      })
    )
  }),
  rest.get('/api/page/by-key/home/', (req, res, ctx) => {
    return res(
      ctx.json({
        id: 1,
        key: 'home',
        title: null,
        pageType: 'content',
        userCreated: false,
        settings: {},
        parentId: null,
        createdAt: '2020-09-07T21:48:42.891Z',
        updatedAt: '2020-09-07T21:48:42.891Z',
        pageblocks: [
          {
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
            createdAt: '2020-09-07T21:49:16.177Z',
            updatedAt: '2020-09-07T21:49:16.177Z',
            pageId: 1,
            pageblockcontents: [
              {
                id: 3,
                contentType: 'wysiwyg',
                filename: null,
                ordering: 0,
                settings: {
                  header: '',
                  headerLevel: 0,
                  lgWidth: 12,
                  mdWidth: 12,
                  smWidth: 12,
                  xsWidth: 12,
                },
                wysiwyg: '<h1>FooBar</h1>',
                createdAt: '2020-09-07T21:49:16.217Z',
                updatedAt: '2020-09-07T21:49:28.555Z',
                pageblockId: 3,
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
        siteMap: { key: 'home', path: '', children: [] },
        tree: {
          id: 1,
          key: 'home',
          title: null,
          pageType: 'content',
          userCreated: false,
          settings: {},
          parentId: null,
          createdAt: '2020-09-07T21:48:42.891Z',
          updatedAt: '2020-09-07T21:48:42.891Z',
          children: [],
          path: 'home',
        },
      })
    )
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('renders without crashing', async () => {
  const result = render(<App initPath='/' />)
  expect(result).toBeTruthy()
  await waitFor(() => expect(result.getByText('FooBar')).toBeInTheDocument())
})
