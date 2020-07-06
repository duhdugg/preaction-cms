// global describe, jest, test, expect
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
  let response
  response = await agent.get('/api/page/by-key/nonsense/')
  expect(response.statusCode).toBe(404)
  response = await agent.get('/nonsense/')
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
    {
      key: 'test2',
      title: 'Test 2',
      pageType: 'content',
      children: [
        {
          key: 'test2a',
          title: 'Test 2A',
          pageType: 'content',
          children: [
            { key: 'test2ai', title: 'Test 2AI', pageType: 'content' },
          ],
        },
        { key: 'test3a', title: 'Test 3A', pageType: 'content' },
      ],
    },
  ]
  const createPage = async (data) => {
    const response = await agent.post(`/api/page?token=${token}`).send(data)
    expect(response.statusCode).toBe(200)
    return response.body
  }
  const createPages = async (data, parentId) => {
    const pages = []
    for (const pageData of data) {
      pageData.parentId = parentId
      const page = await createPage(pageData)
      if (pageData.children && pageData.children.length) {
        page.children = await createPages(pageData.children, page.id)
      }
      pages.push(page)
    }
    return pages
  }
  await createPages(pages)
})
test('verify created page', async () => {
  const response = await agent.get(
    '/api/page/by-key/test1/test1c/test1cii/test1cii:03/test1cii:03:aa/'
  )
  expect(response.statusCode).toBe(200)
  expect(response.body.tree.path).toBe(
    'test1/test1c/test1cii/test1cii:03/test1cii:03:aa'
  )
})
test('update created page', async () => {
  const getResponse = await agent.get('/api/page/by-key/test0')
  const page = getResponse.body
  page.key = 'test00'
  page.title = 'Test 00'
  const updateResponse = await agent
    .put(`/api/page/4?token=${token}`)
    .send(page)
  expect(updateResponse.statusCode).toBe(200)
  expect(updateResponse.body.key).toBe('test00')
  expect(updateResponse.body.title).toBe('Test 00')
})
test('delete created page', async () => {
  const getResponse = await agent.get('/api/page/by-key/test2')
  const page = getResponse.body
  const deleteResponse = await agent.delete(
    `/api/page/${page.id}?token=${token}`
  )
  expect(deleteResponse.statusCode).toBe(200)
  const getResponse2 = await agent.get('/api/page/by-key/test2')
  expect(getResponse2.statusCode).toBe(404)
})
test('add block to page', async () => {
  let response
  response = await agent.post(`/api/page/4/blocks?token=${token}`).send({
    blockType: 'content',
  })
  expect(response.statusCode).toBe(200)
  expect(response.body.ordering).toBe(0)
  expect(response.body.pageblockcontents.length).toBe(1)
  expect(response.body.pageblockcontents[0].contentType).toBe('wysiwyg')
  response = await agent.post(`/api/page/4/blocks?token=${token}`).send({
    blockType: 'nav',
  })
  expect(response.statusCode).toBe(200)
  expect(response.body.ordering).toBe(1)
  expect(response.body.blockType).toBe('nav')
  response = await agent
    .post(`/api/page/4/blocks?token=${token}`)
    .send({ blockType: 'iframe' })
  expect(response.statusCode).toBe(200)
  expect(response.body.blockType).toBe('iframe')
  response = await agent.get('/api/page/by-key/test00')
  expect(response.body.pageblocks.length).toBe(3)
  expect(response.body.pageblocks[0].blockType).toBe('content')
  expect(response.body.pageblocks[1].blockType).toBe('nav')
  expect(response.body.pageblocks[2].blockType).toBe('iframe')
})
test('update wysiwyg content', async () => {
  const getResponse = await agent.get('/api/page/by-key/test00')
  const page = getResponse.body
  const content = page.pageblocks[0].pageblockcontents[0]
  content.wysiwyg = '<h1>Hello World!</h1>'
  const putResponse = await agent
    .put(`/api/page/blocks/content/${content.id}?token=${token}`)
    .send(content)
  expect(putResponse.statusCode).toBe(200)
  const getResponse2 = await agent.get('/api/page/by-key/test00')
  expect(getResponse2.body.pageblocks[0].pageblockcontents[0].wysiwyg).toBe(
    content.wysiwyg
  )
})
test('update block settings', async () => {
  const getResponse = await agent.get('/api/page/by-key/test00')
  const page = getResponse.body
  const block = page.pageblocks[1]
  block.settings.header = 'Navigation'
  block.settings.headerLevel = 2
  block.settings.showBorder = true
  block.settings.showContainer = true
  const putResponse = await agent
    .put(`/api/page/blocks/${block.id}?token=${token}`)
    .send(block)
  expect(putResponse.statusCode).toBe(200)
  const getResponse2 = await agent.get('/api/page/by-key/test00')
  expect(getResponse2.body.pageblocks[1].settings.header).toBe(
    block.settings.header
  )
  expect(getResponse2.body.pageblocks[1].settings.headerLevel).toBe(
    block.settings.headerLevel
  )
  expect(getResponse2.body.pageblocks[1].settings.showBorder).toBe(
    block.settings.showBorder
  )
  expect(getResponse2.body.pageblocks[1].settings.showContainer).toBe(
    block.settings.showContainer
  )
})
test('add content to block', async () => {
  const getResponse = await agent.get('/api/page/by-key/test00')
  const page = getResponse.body
  const block = page.pageblocks[0]
  const postResponse = await agent
    .post(`/api/page/blocks/${block.id}/content?token=${token}`)
    .send({
      contentType: 'wysiwyg',
    })
  expect(postResponse.statusCode).toBe(200)
  expect(postResponse.body.wysiwyg).toBe('')
})
test('delete content from block', async () => {
  const getResponse = await agent.get('/api/page/by-key/test00')
  const page = getResponse.body
  const block = page.pageblocks[0]
  const content = block.pageblockcontents[1]
  const deleteResponse = await agent.delete(
    `/api/page/blocks/content/${content.id}?token=${token}`
  )
  expect(deleteResponse.statusCode).toBe(200)
  const getResponse2 = await agent.get('/api/page/by-key/test00')
  expect(getResponse2.body.pageblocks[0].pageblockcontents.length).toBe(1)
})
test('delete block from page', async () => {
  const getResponse = await agent.get('/api/page/by-key/test00')
  const page = getResponse.body
  const block = page.pageblocks[2]
  const deleteResponse = await agent.delete(
    `/api/page/blocks/${block.id}?token=${token}`
  )
  expect(deleteResponse.statusCode).toBe(200)
  const getResponse2 = await agent.get('/api/page/by-key/test00')
  expect(getResponse2.body.pageblocks.length).toBe(2)
})
test('/api/page/settings/by-key', async () => {
  let response
  response = await request(server.http).get('/api/page/settings/by-key/test00')
  expect(response.statusCode).toBe(200)
  response = await request(server.http).get(
    '/api/page/settings/by-key/test00/test0a'
  )
  expect(response.statusCode).toBe(200)
})
test('/api/page/sitemap/by-key', async () => {
  let response
  response = await request(server.http).get('/api/page/sitemap/by-key/test00')
  expect(response.statusCode).toBe(200)
  response = await request(server.http).get(
    '/api/page/sitemap/by-key/test1/test1c/test1cii'
  )
  expect(response.statusCode).toBe(200)
})
test('/api/page/:id/settings', async () => {
  const response = await agent.get('/api/page/4/settings')
  expect(response.statusCode).toBe(200)
})
test('/api/page/:id/sitemap', async () => {
  const response = await agent.get('/api/page/4/sitemap')
  expect(response.statusCode).toBe(200)
})

test('deep copy page', async () => {
  jest.setTimeout(30000)
  const page = await pages.funcs.getFullPageByPath('/test00/')
  const newPage = await pages.funcs.copyPageWithChildren(page, null, 'test3')
  expect(newPage.id).not.toBe(page.id)
})

describe('/api/page error responses', () => {
  test('get method not allowed', async () => {
    const response = await agent.get('/api/page')
    expect(response.statusCode).toBe(404)
  })
  test('admin required', async () => {
    const response = await request(server.http).post('/api/page').send({})
    expect(response.statusCode).toBe(403)
    expect(response.body.error).toBe('forbidden')
  })
  test('csrf protection', async () => {
    const response = await agent.post('/api/page').send({})
    expect(response.statusCode).toBe(403)
    expect(response.body.error).toBe('invalid csrf token')
  })
  test('pageType required', async () => {
    const response = await agent.post(`/api/page?token=${token}`).send({
      key: 'test4',
      title: 'Test 4',
    })
    expect(response.statusCode).toBe(400)
    expect(response.body.error).toBe('missing pageType')
  })
  test('key required', async () => {
    const response = await agent.post(`/api/page?token=${token}`).send({
      pageType: 'content',
      title: 'Test 4',
    })
    expect(response.statusCode).toBe(400)
    expect(response.body.error).toBe('missing key')
  })
  test('title required', async () => {
    const response = await agent.post(`/api/page?token=${token}`).send({
      pageType: 'content',
      key: 'test4',
    })
    expect(response.statusCode).toBe(400)
    expect(response.body.error).toBe('missing title')
  })
  test('valid pageTypes only', async () => {
    const response = await agent.post(`/api/page?token=${token}`).send({
      pageType: 'foobar',
      key: 'test4',
      title: 'Test 4',
    })
    expect(response.statusCode).toBe(400)
    expect(response.body.error).toBe('invalid pageType')
  })
  test('no reserved keys', async () => {
    let response
    const body = {
      pageType: 'content',
      key: 'login',
      title: 'Title',
    }
    response = await agent.post(`/api/page?token=${token}`).send(body)
    expect(response.statusCode).toBe(400)
    expect(response.body.error).toBe('login is reserved')
    body.key = 'header'
    response = await agent.post(`/api/page?token=${token}`).send(body)
    expect(response.statusCode).toBe(400)
    expect(response.body.error).toBe('header is reserved')
    body.key = 'footer'
    response = await agent.post(`/api/page?token=${token}`).send(body)
    expect(response.statusCode).toBe(400)
    expect(response.body.error).toBe('footer is reserved')
    body.key = 'home'
    response = await agent.post(`/api/page?token=${token}`).send(body)
    expect(response.statusCode).toBe(400)
    expect(response.body.error).toBe('home is reserved')
  })
  test('unique keys only', async () => {
    const response = await agent.post(`/api/page?token=${token}`).send({
      pageType: 'content',
      key: 'test1',
      title: 'Test 4',
    })
    expect(response.statusCode).toBe(400)
    expect(response.body.error).toBe('test1 already exists')
  })
})

describe('/api/page/:id error responses', () => {
  test('get method not allowed', async () => {
    const response = await agent.get('/api/page/4')
    expect(response.statusCode).toBe(404)
  })
  test('admin required for PUT method', async () => {
    const response = await request(server.http).put('/api/page/4').send({})
    expect(response.statusCode).toBe(403)
    expect(response.body.error).toBe('forbidden')
  })
  test('admin required for DELETE method', async () => {
    const response = await request(server.http).delete('/api/page/4')
    expect(response.statusCode).toBe(403)
    expect(response.body.error).toBe('forbidden')
  })
  test('csrf protection for PUT method', async () => {
    const response = await agent.put('/api/page/4').send({})
    expect(response.statusCode).toBe(403)
    expect(response.body.error).toBe('invalid csrf token')
  })
  test('csrf protection for DELETE method', async () => {
    const response = await agent.delete('/api/page/4')
    expect(response.statusCode).toBe(403)
    expect(response.body.error).toBe('invalid csrf token')
  })
  test('404 for incorrect id on PUT method', async () => {
    const response = await agent.put(`/api/page/1234?token=${token}`).send({
      pageType: 'content',
      key: 'testkey',
      title: 'Title',
    })
    expect(response.statusCode).toBe(404)
    expect(response.body.error).toBe('not found')
  })
  test('404 for incorrect id on DELETE method', async () => {
    const response = await agent.delete(`/api/page/1234?token=${token}`)
    expect(response.statusCode).toBe(404)
    expect(response.body.error).toBe('not found')
  })
  test('no reserved keys on PUT method', async () => {
    let response
    const body = {
      pageType: 'content',
      key: 'login',
      title: 'Title',
    }
    response = await agent.put(`/api/page/4?token=${token}`).send(body)
    expect(response.statusCode).toBe(400)
    expect(response.body.error).toBe('login is reserved')
    body.key = 'header'
    response = await agent.put(`/api/page/4?token=${token}`).send(body)
    expect(response.statusCode).toBe(400)
    expect(response.body.error).toBe('header is reserved')
    body.key = 'footer'
    response = await agent.put(`/api/page/4?token=${token}`).send(body)
    expect(response.statusCode).toBe(400)
    expect(response.body.error).toBe('footer is reserved')
    body.key = 'home'
    response = await agent.put(`/api/page/4?token=${token}`).send(body)
    expect(response.statusCode).toBe(400)
    expect(response.body.error).toBe('home is reserved')
  })
  test('no existing keys on PUT method', async () => {
    const response = await agent.put(`/api/page/4?token=${token}`).send({
      pageType: 'content',
      key: 'test1',
      title: 'Title',
    })
    expect(response.statusCode).toBe(400)
    expect(response.body.error).toBe('test1 already exists')
  })
})

describe('/api/page/:id/settings error responses', () => {
  test('admin required', async () => {
    const response = await request(server.http).get('/api/page/4/settings')
    expect(response.statusCode).toBe(403)
    expect(response.body.error).toBe('forbidden')
  })
  test('404 on invalid id', async () => {
    const response = await agent.get('/api/page/1234/settings')
    expect(response.statusCode).toBe(404)
    expect(response.body.error).toBe('not found')
  })
})
describe('/api/page/:id/sitemap error responses', () => {
  test('admin required', async () => {
    const response = await request(server.http).get('/api/page/4/sitemap')
    expect(response.statusCode).toBe(403)
    expect(response.body.error).toBe('forbidden')
  })
  test('404 on invalid id', async () => {
    const response = await agent.get('/api/page/1234/sitemap')
    expect(response.statusCode).toBe(404)
    expect(response.body.error).toBe('not found')
  })
})
