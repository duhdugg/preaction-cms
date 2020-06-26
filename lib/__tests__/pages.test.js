// global test, expect
const request = require('supertest')
const pages = require('../pages.js')
const server = require('../../server.js')
const session = require('../session.js')

test('imports', () => {
  expect(typeof pages).toBe('object')
})
test('exports middleware', () => {
  expect(typeof pages.middleware).toBe('function')
})
test('exports funcs', () => {
  expect(typeof pages.funcs).toBe('object')
  expect(typeof pages.funcs.copyPage).toBe('function')
  expect(typeof pages.funcs.copyPageWithChildren).toBe('function')
  expect(typeof pages.funcs.getAppliedPageSettings).toBe('function')
  expect(typeof pages.funcs.getFullPageById).toBe('function')
  expect(typeof pages.funcs.getPageByPath).toBe('function')
  expect(typeof pages.funcs.getPagePath).toBe('function')
})
test('exports model', () => {
  expect(typeof pages.model).toBe('object')
})
test('exports sync', () => {
  expect(typeof pages.sync).toBe('function')
})

const agent = request.agent(server.http)
let token

const login = async () => {
  await session.updateAdminPassword('admin')
  const tokenResponse = await agent.get('/api/token')
  expect(tokenResponse.statusCode).toBe(200)
  token = tokenResponse.body
  const username = 'admin'
  const password = 'admin'
  const loginResponse = await agent.post(`/api/login?token=${token}`).send({
    username,
    password,
  })
  const sessionResponse = await agent.get('/api/session')
  expect(loginResponse.statusCode).toBe(200)
  expect(loginResponse.body.authenticated).toBe(true)
  expect(sessionResponse.statusCode).toBe(200)
  expect(sessionResponse.body.authenticated).toBe(true)
  return token
}

test('default pages are created', async () => {
  await server.sync()
  const homeResponse = await agent.get('/api/page/by-key/home/')
  const headerResponse = await agent.get('/api/page/by-key/home/header/')
  const footerResponse = await agent.get('/api/page/by-key/home/footer/')
  expect(homeResponse.statusCode).toBe(200)
  expect(headerResponse.statusCode).toBe(200)
  expect(footerResponse.statusCode).toBe(200)
})
test('missing pages return 404', async () => {
  await server.sync()
  const response = await agent.get('/api/page/by-key/nonsense/')
  expect(response.statusCode).toBe(404)
})
test('create test pages', async () => {
  const token = await login()
  const pages = [
    {
      key: 'test0',
      title: 'Test 0',
      pageType: 'content',
      children: [
        { key: 'test0a', title: 'Test 0a', pageType: 'content' },
        { key: 'test0b', title: 'Test 0b', pageType: 'content' },
      ],
    },
    {
      key: 'test1',
      title: 'Test 1',
      pageType: 'content',
      children: [
        { key: 'test1a', title: 'Test 1a', pageType: 'content' },
        { key: 'test1b', title: 'Test 1b', pageType: 'content' },
        {
          key: 'test1c',
          title: 'Test 1c',
          pageType: 'content',
          children: [
            {
              key: 'test1cI',
              title: 'Test 1cI',
              pageType: 'content',
              settings: { navOrdering: 0 },
            },
            {
              key: 'test1cII',
              title: 'Test 1cII',
              pageType: 'content',
              settings: { navOrdering: 1 },
              children: [
                {
                  key: 'test1cII:01',
                  title: 'Test 1cII:01',
                  pageType: 'content',
                },
                {
                  key: 'test1cII:02',
                  title: 'Test 1cII:02',
                  pageType: 'content',
                },
                {
                  key: 'test1cII:03',
                  title: 'Test 1cII:03',
                  pageType: 'content',
                  children: [
                    {
                      key: 'test1cII:03:aa',
                      title: 'Test 1cII:03:aa',
                      pageType: 'content',
                    },
                  ],
                },
              ],
            },
            {
              key: 'test1cIII',
              title: 'Test 1cIII',
              pageType: 'content',
              settings: { navOrdering: 2 },
            },
            {
              key: 'test1cIV',
              title: 'Test 1cIV',
              pageType: 'content',
              settings: { navOrdering: 3 },
            },
          ],
        },
      ],
    },
  ]
  const createPage = async (data) => {
    let response = await agent.post(`/api/page?token=${token}`).send(data)
    expect(response.statusCode).toBe(200)
    return response.body
  }
  const createPages = async (data, parentId) => {
    let pages = []
    for (let pageData of data) {
      pageData.parentId = parentId
      let page = await createPage(pageData)
      if (pageData.children && pageData.children.length) {
        page.children = await createPages(pageData.children, page.id)
      }
      pages.push(page)
    }
    return pages
  }
  await createPages(pages)
})
test('get created page', async () => {
  let response = await agent.get(
    '/api/page/by-key/test1/test1c/test1cii/test1cii:03/test1cii:03:aa/'
  )
  expect(response.statusCode).toBe(200)
})
