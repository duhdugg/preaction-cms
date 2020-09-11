import React from 'react'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import PageBlockWysiwyg from '../PageBlockWysiwyg.jsx'

let foo
const server = setupServer(
  rest.put('/api/page/blocks/content/:contentId', (req, res, ctx) => {
    foo = req.body.wysiwyg
    return res(ctx.json([req.params.contentId]))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

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
        header: '',
        headerLevel: 0,
        lgWidth: 12,
        mdWidth: 12,
        smWidth: 12,
        xsWidth: 12,
      },
      wysiwyg: '<h1>FooBar</h1>',
      createdAt: '2020-09-07T21:52:14.189Z',
      updatedAt: '2020-09-07T21:52:19.926Z',
      pageblockId: 3,
    },
  ],
}

const mockContent = {
  id: 3,
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
  wysiwyg: '<h1>FooBar</h1>',
  createdAt: '2020-09-07T21:52:14.189Z',
  updatedAt: '2020-09-07T21:52:19.926Z',
  pageblockId: 3,
}

let saved = false
const mockEmitSave = () => {
  saved = true
}

test('PageBlockWysiwyg basic editable sourceMode', async () => {
  const result = render(
    <PageBlockWysiwyg
      appRoot=''
      block={mockBlock}
      content={mockContent}
      editable
      sourceMode
      emitSave={mockEmitSave}
      theme='bubble'
      token='foobar'
    />
  )
  const rerender = () => {
    result.rerender(
      <PageBlockWysiwyg
        appRoot=''
        block={mockBlock}
        content={mockContent}
        editable
        sourceMode
        emitSave={mockEmitSave}
        theme='bubble'
        token='foobar'
      />
    )
  }
  await waitFor(() =>
    expect(result.container.querySelector('textarea')).toBeInTheDocument()
  )
  userEvent.type(
    result.container.querySelector('textarea'),
    '{selectall}{backspace}'
  )
  await waitFor(() =>
    expect(result.container.querySelector('textarea').value).toBe('')
  )
  userEvent.type(result.container.querySelector('textarea'), '<')
  rerender()
  userEvent.type(result.container.querySelector('textarea'), 'p')
  rerender()
  userEvent.type(result.container.querySelector('textarea'), '>')
  rerender()
  userEvent.type(result.container.querySelector('textarea'), 't')
  rerender()
  userEvent.type(result.container.querySelector('textarea'), 'e')
  rerender()
  userEvent.type(result.container.querySelector('textarea'), 's')
  rerender()
  userEvent.type(result.container.querySelector('textarea'), 't')
  rerender()
  userEvent.type(result.container.querySelector('textarea'), '<')
  rerender()
  userEvent.type(result.container.querySelector('textarea'), '/')
  rerender()
  userEvent.type(result.container.querySelector('textarea'), 'p')
  rerender()
  userEvent.type(result.container.querySelector('textarea'), '>')
  rerender()
  await waitFor(() =>
    expect(result.container.querySelector('textarea').value).toBe('<p>test</p>')
  )
  await waitFor(
    () =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(expect(foo).toBe('<p>test</p>'))
        }, 1250)
      })
  )
  expect(saved).toBe(true)
})
