import React from 'react'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { StaticRouter } from 'react-router-dom'
import PageBlockNav from '../PageBlockNav.jsx'

test('PageBlockNav basic', async () => {
  const mockBlock = {
    id: 4,
    blockType: 'nav',
    ordering: 0,
    settings: {
      header: '',
      headerLevel: 0,
      xxlWidth: 12,
      lgWidth: 12,
      mdWidth: 12,
      smWidth: 12,
      xsWidth: 12,
      navAlignment: 'left',
      navCollapsible: true,
      subMenu: true,
    },
    createdAt: '2020-09-08T14:39:57.277Z',
    updatedAt: '2020-09-08T14:40:04.052Z',
    pageId: 4,
    pageblockcontents: [],
  }

  const mockPage = {
    id: 4,
    key: 'foo-1',
    title: 'Foo 1',
    pageType: 'content',
    userCreated: true,
    settings: { includeInNav: true },
    parentId: null,
    createdAt: '2020-09-08T14:39:05.800Z',
    updatedAt: '2020-09-08T14:39:05.800Z',
    pageblocks: [
      {
        id: 4,
        blockType: 'nav',
        ordering: 0,
        settings: {
          header: '',
          headerLevel: 0,
          xxlWidth: 12,
          lgWidth: 12,
          mdWidth: 12,
          smWidth: 12,
          xsWidth: 12,
          navAlignment: 'left',
          navCollapsible: true,
          subMenu: true,
        },
        createdAt: '2020-09-08T14:39:57.277Z',
        updatedAt: '2020-09-08T14:40:04.052Z',
        pageId: 4,
        pageblockcontents: [],
      },
    ],
    fallbackSettings: {
      footerPath: '/home/footer/',
      headerPath: '/home/header/',
      heroPath: '/home/hero/',
      navAlignment: 'left',
      navCollapsible: true,
      navPosition: 'fixed-top',
      navSpacing: 'normal',
      navType: 'basic',
      showFooter: true,
      showHeader: true,
      showHero: true,
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
  }

  let navigatePath
  const mockNavigate = (path) => {
    navigatePath = path
  }

  const result = render(
    <StaticRouter>
      <PageBlockNav block={mockBlock} page={mockPage} navigate={mockNavigate} />
    </StaticRouter>
  )
  expect(result.getByText('ABC')).toBeInTheDocument()
  userEvent.click(result.getByText('DEF'))
  await waitFor(() => expect(navigatePath).toBe('/foo-1/def/'))
  userEvent.click(result.getByText('456'))
  await waitFor(() => expect(navigatePath).toBe('/foo-1/abc/456/'))
})
