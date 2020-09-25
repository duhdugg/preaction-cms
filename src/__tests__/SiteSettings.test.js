import React from 'react'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import SiteSettings from '../SiteSettings.jsx'

let editRedirect
let newRedirect
let deleteRedirect
const server = setupServer(
  rest.get('/api/backups', (req, res, ctx) => {
    return res(
      ctx.json([
        '2020-08-21T03:29:20.944Z-bb52d3887ddd51921ff4b4341a32d446a1c90ba471af64ba9738541a7d9c59a5.sqlite',
        '2020-08-10T22:37:53.439Z-b099ae488be3e15ef968dd9fc53f6954bc8f0dc63f8da6687c94f0a77d810116.sqlite',
      ])
    )
  }),
  rest.post('/api/backups', (req, res, ctx) => {
    return res(ctx.json({}))
  }),
  rest.get('/api/redirect', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: 1,
          match: '/foobish',
          location: '/barish',
          createdAt: '2020-09-08T21:48:42.369Z',
          updatedAt: '2020-09-08T21:48:42.369Z',
        },
      ])
    )
  }),
  rest.delete('/api/redirect/:redirectId', (req, res, ctx) => {
    deleteRedirect = req.params.redirectId
    return res(ctx.json({}))
  }),
  rest.put('/api/redirect/:redirectId', (req, res, ctx) => {
    editRedirect = req.body
    return res(ctx.json({}))
  }),
  rest.post('/api/redirect/', (req, res, ctx) => {
    newRedirect = req.body
    return res(ctx.json({}))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function getResults() {
  const state = {
    forceReloadCalled: false,
  }
  const mockEmitForceReload = () => {
    state.forceReloadCalled = true
  }
  const mockGetSettingsValueHandler = (key) => (value) => {
    mockSettings[key] = value
  }
  const mockSettings = {
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
  }
  const result = render(
    <SiteSettings
      admin
      appRoot=''
      emitForceReload={mockEmitForceReload}
      getSettingsValueHandler={mockGetSettingsValueHandler}
      settings={mockSettings}
      token='foobar'
    />
  )
  const rerender = () =>
    result.rerender(
      <SiteSettings
        admin
        appRoot=''
        emitForceReload={mockEmitForceReload}
        getSettingsValueHandler={mockGetSettingsValueHandler}
        settings={mockSettings}
        token='foobar'
      />
    )
  return {
    result,
    rerender,
    state,
  }
}

test('SiteSettings renders without crashing', async () => {
  const { result } = getResults()
  expect(result.getByText('Site Name')).toBeInTheDocument()
  await waitFor(
    () =>
      new Promise((resolve, reject) => {
        setTimeout(resolve, 1000)
      })
  )
})

test('restore backup', async () => {
  const { result, rerender, state } = getResults()
  await waitFor(
    () =>
      new Promise((resolve, reject) => {
        setTimeout(resolve, 1000)
      })
  )
  userEvent.selectOptions(
    result.getByLabelText('Restore File'),
    '2020-08-21T03:29:20.944Z-bb52d3887ddd51921ff4b4341a32d446a1c90ba471af64ba9738541a7d9c59a5.sqlite'
  )
  rerender()
  userEvent.click(result.getByText('Restore'))
  await waitFor(() => expect(state.forceReloadCalled).toBe(true))
})

test('edit redirect', async () => {
  const { result, rerender } = getResults()
  expect(result.getByText('Site Name')).toBeInTheDocument()
  await waitFor(
    () =>
      new Promise((resolve, reject) => {
        setTimeout(resolve, 1000)
      })
  )
  userEvent.click(result.container.querySelector('.redirects .btn-light'))
  rerender()
  userEvent.type(
    result.container.querySelector('.redirects td:nth-child(3) input'),
    '1'
  )
  rerender()
  userEvent.click(result.container.querySelector('.redirects .btn-success'))
  await waitFor(() => expect(editRedirect.location).toBe('/barish1'))
})

test('create redirect', async () => {
  const { result, rerender } = getResults()
  expect(result.getByText('Site Name')).toBeInTheDocument()
  await waitFor(
    () =>
      new Promise((resolve, reject) => {
        setTimeout(resolve, 1000)
      })
  )
  userEvent.click(result.container.querySelector('.redirects .btn-primary'))
  rerender()
  const typeString = (target, str) => {
    for (let char of str) {
      userEvent.type(target, char)
      rerender()
    }
  }
  typeString(
    result.container.querySelector('.redirects td:nth-child(2) input'),
    '/testing'
  )
  typeString(
    result.container.querySelector('.redirects td:nth-child(3) input'),
    '/123'
  )
  userEvent.click(result.container.querySelector('.redirects .btn-success'))
  await waitFor(() => expect(newRedirect.match).toBe('/testing'))
  await waitFor(() => expect(newRedirect.location).toBe('/123'))
})

test('delete redirect', async () => {
  const { result } = getResults()
  expect(result.getByText('Site Name')).toBeInTheDocument()
  await waitFor(
    () =>
      new Promise((resolve, reject) => {
        setTimeout(resolve, 1000)
      })
  )
  userEvent.click(result.container.querySelector('.redirects .btn-danger'))
  await waitFor(() => expect(deleteRedirect).toBe('1'))
})
