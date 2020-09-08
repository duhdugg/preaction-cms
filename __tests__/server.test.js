const client = require('./client.test.js')

test('/sitemap.xml', async () => {
  const { auth, token, unauth } = await client.init()
  for (let i = 0; i < 3; i++) {
    const response = await auth.post(`/api/page?token=${token}`).send({
      pageType: 'content',
      key: `sitemap-test-${i}`,
      title: `Sitemap Test Page ${i}`,
    })
    expect(response.statusCode).toBe(200)
  }
  const response = await unauth.get('/sitemap.xml')
  expect(response.statusCode).toBe(200)
})

test('GET /', async () => {
  const { auth, token, unauth } = await client.init()
  for (let i = 0; i < 2; i++) {
    const blockResponse = await auth
      .post(`/api/page/1/blocks?token=${token}`)
      .send({
        blockType: 'content',
      })
    expect(blockResponse.statusCode).toBe(200)
    const block = blockResponse.body
    const content1 = block.pageblockcontents[0]
    const content2response = await auth
      .post(`/api/page/blocks/${block.id}/content?token=${token}`)
      .send({
        contentType: 'wysiwyg',
      })
    expect(content2response.statusCode).toBe(200)
    const content2 = content2response.body
    const update1response = await auth
      .put(`/api/page/blocks/content/${content1.id}?token=${token}`)
      .send({
        wysiwyg: '<p>Hello World 1</p>',
      })
    expect(update1response.statusCode).toBe(200)
    const update2response = await auth
      .put(`/api/page/blocks/content/${content2.id}?token=${token}`)
      .send({
        wysiwyg: '<p>HW2</p>',
      })
    expect(update2response.statusCode).toBe(200)
  }
  const response = await unauth.get('/')
  expect(response.statusCode).toBe(200)
})

test('GET /test/', async () => {
  const { auth, token, unauth } = await client.init()
  const pageResponse = await auth.post(`/api/page?token=${token}`).send({
    pageType: 'content',
    key: 'test',
    title: 'Test',
  })
  expect(pageResponse.statusCode).toBe(200)
  const page = pageResponse.body
  for (let i = 0; i < 2; i++) {
    const blockResponse = await auth
      .post(`/api/page/${page.id}/blocks?token=${token}`)
      .send({
        blockType: 'content',
      })
    expect(blockResponse.statusCode).toBe(200)
    const block = blockResponse.body
    const content1 = block.pageblockcontents[0]
    const content2response = await auth
      .post(`/api/page/blocks/${block.id}/content?token=${token}`)
      .send({
        contentType: 'wysiwyg',
      })
    expect(content2response.statusCode).toBe(200)
    const content2 = content2response.body
    const update1response = await auth
      .put(`/api/page/blocks/content/${content1.id}?token=${token}`)
      .send({
        wysiwyg: '<p>Hello World 1</p>',
      })
    expect(update1response.statusCode).toBe(200)
    const update2response = await auth
      .put(`/api/page/blocks/content/${content2.id}?token=${token}`)
      .send({
        wysiwyg: '<p>HW2</p>',
      })
    expect(update2response.statusCode).toBe(200)
  }
  const response = await unauth.get('/test/')
  expect(response.statusCode).toBe(200)
})
