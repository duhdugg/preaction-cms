const request = require('supertest')
const server = require('../server.js')
const session = require('../lib/session.js')

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

test('sync and login', async () => {
  await server.sync()
  expect(server.app).toBeTruthy()
  const token = await login()
  expect(token).toBeTruthy()
})

test('GET /icon before setting returns 404', async () => {
  const response = await request(server.http).get('/icon')
  expect(response.statusCode).toBe(404)
})

test('/sitemap.xml', async () => {
  for (let i = 0; i < 3; i++) {
    const response = await agent.post(`/api/page?token=${token}`).send({
      pageType: 'content',
      key: `sitemap-test-${i}`,
      title: `Sitemap Test Page ${i}`,
    })
    expect(response.statusCode).toBe(200)
  }
  const response = await request(server.http).get('/sitemap.xml')
  expect(response.statusCode).toBe(200)
})

test('GET /', async () => {
  for (let i = 0; i < 2; i++) {
    const blockResponse = await agent
      .post(`/api/page/1/blocks?token=${token}`)
      .send({
        blockType: 'content',
      })
    expect(blockResponse.statusCode).toBe(200)
    const block = blockResponse.body
    const content1 = block.pageblockcontents[0]
    const content2response = await agent
      .post(`/api/page/blocks/${block.id}/content?token=${token}`)
      .send({
        contentType: 'wysiwyg',
      })
    expect(content2response.statusCode).toBe(200)
    const content2 = content2response.body
    const update1response = await agent
      .put(`/api/page/blocks/content/${content1.id}?token=${token}`)
      .send({
        wysiwyg: '<p>Hello World 1</p>',
      })
    expect(update1response.statusCode).toBe(200)
    const update2response = await agent
      .put(`/api/page/blocks/content/${content2.id}?token=${token}`)
      .send({
        wysiwyg: '<p>HW2</p>',
      })
    expect(update2response.statusCode).toBe(200)
  }
  const response = await request(server.http).get('/')
  expect(response.statusCode).toBe(200)
})

test('GET /test', async () => {
  const pageResponse = await agent.post(`/api/page?token=${token}`).send({
    pageType: 'content',
    key: 'test',
    title: 'Test',
  })
  expect(pageResponse.statusCode).toBe(200)
  const page = pageResponse.body
  for (let i = 0; i < 2; i++) {
    const blockResponse = await agent
      .post(`/api/page/${page.id}/blocks?token=${token}`)
      .send({
        blockType: 'content',
      })
    expect(blockResponse.statusCode).toBe(200)
    const block = blockResponse.body
    const content1 = block.pageblockcontents[0]
    const content2response = await agent
      .post(`/api/page/blocks/${block.id}/content?token=${token}`)
      .send({
        contentType: 'wysiwyg',
      })
    expect(content2response.statusCode).toBe(200)
    const content2 = content2response.body
    const update1response = await agent
      .put(`/api/page/blocks/content/${content1.id}?token=${token}`)
      .send({
        wysiwyg: '<p>Hello World 1</p>',
      })
    expect(update1response.statusCode).toBe(200)
    const update2response = await agent
      .put(`/api/page/blocks/content/${content2.id}?token=${token}`)
      .send({
        wysiwyg: '<p>HW2</p>',
      })
    expect(update2response.statusCode).toBe(200)
  }
  const response = await request(server.http).get('/test')
  expect(response.statusCode).toBe(200)
})
