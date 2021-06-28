import React from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import PageSettings from '../PageSettings.jsx'

function getResults(options = {}) {
  const state = {
    deletePageCalled: false,
    latestNavigatePath: undefined,
  }
  const mockDeletePage = () => {
    state.deletePageCalled = true
  }
  const mockGetPageSettingIsUndefined = (key) =>
    mockPage.settings[key] === undefined
  const mockGetPageValueHandler = () => {}
  const mockGetResetter = (key) => () => {
    delete mockPage.settings[key]
  }
  const mockGetSettingsValueHandler = (key) => (value) => {
    mockPage.settings[key] = value
  }
  const mockNavigate = (path) => {
    state.latestNavigatePath = path
  }
  const mockPage = {
    id: 7,
    key: 'abc',
    title: 'ABC',
    pageType: 'content',
    userCreated: true,
    settings: { includeInNav: true },
    parentId: 4,
    createdAt: '2020-09-08T14:39:13.303Z',
    updatedAt: '2020-09-08T14:39:13.303Z',
    pageblocks: [
      {
        id: 5,
        blockType: 'nav',
        ordering: 0,
        settings: {
          header: 'Nav Block',
          headerLevel: 0,
          xxlWidth: 12,
          lgWidth: 12,
          mdWidth: 12,
          smWidth: 12,
          xsWidth: 12,
          navAlignment: 'vertical',
          navCollapsible: false,
          navType: 'basic',
          subMenu: false,
        },
        createdAt: '2020-09-08T14:40:25.998Z',
        updatedAt: '2020-09-08T19:09:00.895Z',
        pageId: 7,
        pageblockcontents: [],
      },
      {
        id: 9,
        blockType: 'content',
        ordering: 1,
        settings: {
          header: 'Content Block',
          headerLevel: 0,
          xxlWidth: 12,
          lgWidth: 12,
          mdWidth: 12,
          smWidth: 12,
          xsWidth: 12,
        },
        createdAt: '2020-09-08T19:07:56.597Z',
        updatedAt: '2020-09-08T19:08:55.436Z',
        pageId: 7,
        pageblockcontents: [
          {
            id: 9,
            contentType: 'image',
            ordering: 0,
            settings: {
              altText: '',
              header: '',
              headerLevel: 0,
              linkUrl: '',
              src: '/uploads/948b1fb4a2e0f6331c59817fea9cfbc5afebe9af5e6d293f2ec4736c3c418297.png',
              xxlWidth: 12,
              lgWidth: '3',
              mdWidth: '4',
              smWidth: '5',
              xsWidth: '6',
            },
            wysiwyg: 'null',
            createdAt: '2020-09-08T19:08:04.431Z',
            updatedAt: '2020-09-08T19:08:19.338Z',
            pageblockId: 9,
          },
          {
            id: 10,
            contentType: 'image',
            ordering: 1,
            settings: {
              altText: '',
              header: '',
              headerLevel: 0,
              linkUrl: '',
              src: '/uploads/f5c09490c5ff4e6b5d144ffd442e112eb74057a4adfafea1de69dc31a95b2b21.png',
              xxlWidth: 12,
              lgWidth: '3',
              mdWidth: '4',
              smWidth: '5',
              xsWidth: '6',
            },
            wysiwyg: 'null',
            createdAt: '2020-09-08T19:08:33.699Z',
            updatedAt: '2020-09-08T19:08:41.807Z',
            pageblockId: 9,
          },
        ],
      },
      {
        id: 10,
        blockType: 'iframe',
        ordering: 2,
        settings: {
          header: 'Iframe Block',
          headerLevel: 0,
          xxlWidth: 12,
          lgWidth: 12,
          mdWidth: 12,
          smWidth: 12,
          xsWidth: 12,
          iframeSrc: 'about:blank',
        },
        createdAt: '2020-09-08T19:09:15.814Z',
        updatedAt: '2020-09-08T19:09:23.373Z',
        pageId: 7,
        pageblockcontents: [],
      },
    ],
    fallbackSettings: {
      footerPath: '/home/footer/',
      headerPath: '/home/header/',
      jumboPath: '/home/jumbo/',
      navAlignment: 'left',
      navCollapsible: true,
      navPosition: options.navPosition || 'above-header',
      navSpacing: 'normal',
      navType: 'tabs',
      showFooter: true,
      showHeader: true,
      showJumbo: true,
      bodyTheme: '',
      bodyGradient: false,
      mainTheme: '',
      mainGradient: false,
      maxWidthNav: false,
      maxWidthJumboContainer: false,
      maxWidthHeaderContainer: false,
      maxWidthMainContainer: false,
      maxWidthFooterContainer: false,
      navActiveSubmenuTheme: 'primary',
      navActiveTabTheme: 'white',
      navbarTheme: 'dark',
      headerTheme: '',
      headerGradient: false,
      jumboTheme: '',
      jumboGradient: false,
      footerTheme: '',
      footerGradient: false,
      jumboPosition: 'above-header',
      siteTitle: 'Preaction CMS',
      init: true,
      includeInNav: true,
      site: false,
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
  }
  const mockSettings = {
    footerPath: '/home/footer/',
    headerPath: '/home/header/',
    jumboPath: '/home/jumbo/',
    navAlignment: 'left',
    navCollapsible: true,
    navPosition: options.navPosition || 'above-header',
    navSpacing: 'normal',
    navType: 'tabs',
    showFooter: true,
    showHeader: true,
    showJumbo: true,
    bodyTheme: '',
    bodyGradient: false,
    mainTheme: '',
    mainGradient: false,
    maxWidthNav: false,
    maxWidthJumboContainer: false,
    maxWidthHeaderContainer: false,
    maxWidthMainContainer: false,
    maxWidthFooterContainer: false,
    navActiveSubmenuTheme: 'white',
    navActiveTabTheme: 'primary',
    navbarTheme: 'dark',
    headerTheme: '',
    headerGradient: false,
    jumboTheme: '',
    jumboGradient: false,
    footerTheme: '',
    footerGradient: false,
    jumboPosition: 'above-header',
    siteTitle: 'Preaction CMS',
    init: true,
    includeInNav: true,
    site: false,
  }
  const result = render(
    <PageSettings
      admin
      appRoot=''
      deletePage={mockDeletePage}
      getPageSettingIsUndefined={mockGetPageSettingIsUndefined}
      getPageValueHandler={mockGetPageValueHandler}
      getResetter={mockGetResetter}
      getSettingsValueHandler={mockGetSettingsValueHandler}
      navigate={mockNavigate}
      page={mockPage}
      pageId={7}
      path='/foo-1/abc/'
      settings={mockSettings}
      token='foobar'
    />
  )
  const rerender = () =>
    result.rerender(
      <PageSettings
        admin
        appRoot=''
        deletePage={mockDeletePage}
        getPageSettingIsUndefined={mockGetPageSettingIsUndefined}
        getPageValueHandler={mockGetPageValueHandler}
        getResetter={mockGetResetter}
        getSettingsValueHandler={mockGetSettingsValueHandler}
        navigate={mockNavigate}
        page={mockPage}
        pageId={7}
        path='/foo-1/abc/'
        settings={mockSettings}
        token='foobar'
      />
    )
  return {
    result,
    rerender,
    mockPage,
    state,
  }
}

test('PageSettings renders without crashing', () => {
  const { result } = getResults()
  expect(result.getByText('Page-Level Settings')).toBeInTheDocument()
})

test('Override Site Name', () => {
  const { result, rerender, mockPage } = getResults()
  expect(result.getByLabelText('Site Name')).toHaveAttribute('readOnly')
  userEvent.click(result.getByLabelText('Site Name'))
  rerender()
  expect(result.getByLabelText('Site Name')).not.toHaveAttribute('readOnly')
  userEvent.type(result.getByLabelText('Site Name'), '!')
  expect(mockPage.settings.siteTitle).toBe('Preaction CMS!')
  userEvent.click(result.getByText('Reset'))
  expect(mockPage.settings.siteTitle).toBe(undefined)
})

test('Override Show Header', () => {
  const { result, mockPage } = getResults()
  userEvent.click(result.getByText('Show Header'))
  expect(mockPage.settings.showHeader).toBe(false)
})

test('Override Show Footer', () => {
  const { result, mockPage } = getResults()
  userEvent.click(result.getByText('Show Footer'))
  expect(mockPage.settings.showFooter).toBe(false)
})

test('Override Show Jumbotron', () => {
  const { result, mockPage } = getResults()
  userEvent.click(result.getByText('Show Jumbotron'))
  expect(mockPage.settings.showJumbo).toBe(false)
})

test('Click to confirm delete', () => {
  const { result, state } = getResults()
  userEvent.click(result.container.querySelector('.btn-danger'))
  expect(state.deletePageCalled).toBe(false)
  userEvent.click(result.getByLabelText('Confirm to delete this page'))
  userEvent.click(result.container.querySelector('.btn-danger'))
  expect(state.deletePageCalled).toBe(true)
})

test('Override Header Path', () => {
  const { result, rerender, mockPage } = getResults()
  expect(
    result.container.querySelector('.header-path-field input')
  ).toHaveAttribute('readOnly')
  userEvent.click(result.container.querySelector('.header-path-field input'))
  rerender()
  expect(
    result.container.querySelector('.header-path-field input')
  ).not.toHaveAttribute('readOnly')
  result.container.querySelector('.header-path-field input').value =
    '/foo-1/abc/header'
  userEvent.type(
    result.container.querySelector('.header-path-field input'),
    '/'
  )
  expect(mockPage.settings.headerPath).toBe('/foo-1/abc/header/')
})

test('Override Footer Path', () => {
  const { result, rerender, mockPage } = getResults()
  expect(
    result.container.querySelector('.footer-path-field input')
  ).toHaveAttribute('readOnly')
  userEvent.click(result.container.querySelector('.footer-path-field input'))
  rerender()
  expect(
    result.container.querySelector('.footer-path-field input')
  ).not.toHaveAttribute('readOnly')
  result.container.querySelector('.footer-path-field input').value =
    '/foo-1/abc/footer'
  userEvent.type(
    result.container.querySelector('.footer-path-field input'),
    '/'
  )
  expect(mockPage.settings.footerPath).toBe('/foo-1/abc/footer/')
})

test('Override Jumbotron Path', () => {
  const { result, rerender, mockPage } = getResults()
  expect(
    result.container.querySelector('.jumbo-path-field input')
  ).toHaveAttribute('readOnly')
  userEvent.click(result.container.querySelector('.jumbo-path-field input'))
  rerender()
  expect(
    result.container.querySelector('.jumbo-path-field input')
  ).not.toHaveAttribute('readOnly')
  result.container.querySelector('.jumbo-path-field input').value =
    '/foo-1/abc/jumbo'
  userEvent.type(result.container.querySelector('.jumbo-path-field input'), '/')
  expect(mockPage.settings.jumboPath).toBe('/foo-1/abc/jumbo/')
})

test('Override Jumbotron Position', () => {
  const { result, rerender, mockPage } = getResults()
  expect(result.getByLabelText('Jumbotron Position')).toHaveAttribute(
    'readOnly'
  )
  userEvent.click(result.getByLabelText('Jumbotron Position'))
  rerender()
  expect(result.getByLabelText('Jumbotron Position')).not.toHaveAttribute(
    'readOnly'
  )
  userEvent.selectOptions(
    result.getByLabelText('Jumbotron Position'),
    'below-header'
  )
  expect(mockPage.settings.jumboPosition).toBe('below-header')
})

test('Override Nav Position', () => {
  const { result, rerender, mockPage } = getResults()
  expect(result.getByLabelText('Nav Position')).toHaveAttribute('readOnly')
  userEvent.click(result.getByLabelText('Nav Position'))
  rerender()
  expect(result.getByLabelText('Nav Position')).not.toHaveAttribute('readOnly')
  userEvent.selectOptions(result.getByLabelText('Nav Position'), 'below-header')
  expect(mockPage.settings.navPosition).toBe('below-header')
})

test('Override Nav Type', () => {
  const { result, rerender, mockPage } = getResults()
  expect(result.getByLabelText('Nav Type')).toHaveAttribute('readOnly')
  userEvent.click(result.getByLabelText('Nav Type'))
  rerender()
  expect(result.getByLabelText('Nav Type')).not.toHaveAttribute('readOnly')
  userEvent.selectOptions(result.getByLabelText('Nav Type'), 'pills')
  expect(mockPage.settings.navType).toBe('pills')
})

test('Override Nav Alignment', () => {
  const { result, rerender, mockPage } = getResults()
  expect(result.getByLabelText('Nav Alignment')).toHaveAttribute('readOnly')
  userEvent.click(result.getByLabelText('Nav Alignment'))
  rerender()
  expect(result.getByLabelText('Nav Alignment')).not.toHaveAttribute('readOnly')
  userEvent.selectOptions(result.getByLabelText('Nav Alignment'), 'center')
  expect(mockPage.settings.navAlignment).toBe('center')
})

test('Override Nav Spacing', () => {
  const { result, rerender, mockPage } = getResults()
  expect(result.getByLabelText('Nav Spacing')).toHaveAttribute('readOnly')
  userEvent.click(result.getByLabelText('Nav Spacing'))
  rerender()
  expect(result.getByLabelText('Nav Spacing')).not.toHaveAttribute('readOnly')
  userEvent.selectOptions(result.getByLabelText('Nav Spacing'), 'fill')
  expect(mockPage.settings.navSpacing).toBe('fill')
})

test('Override Collapse Nav', () => {
  const { result, mockPage } = getResults()
  userEvent.click(result.getByLabelText('Collapse nav for smaller screens'))
  expect(mockPage.settings.navCollapsible).toBe(false)
})

test('Override NavBar Theme', () => {
  const { rerender, result, mockPage } = getResults({
    navPosition: 'fixed-top',
  })
  userEvent.click(result.getByLabelText('NavBar Theme'))
  rerender()
  expect(result.getByLabelText('NavBar Theme')).not.toHaveAttribute('readOnly')
  userEvent.selectOptions(result.getByLabelText('NavBar Theme'), 'danger')
  expect(mockPage.settings.navbarTheme).toBe('danger')
})

test('Override Body Theme', () => {
  const { rerender, result, mockPage } = getResults()
  userEvent.click(result.getByLabelText('Body Theme'))
  rerender()
  expect(result.getByLabelText('Body Theme')).not.toHaveAttribute('readOnly')
  userEvent.selectOptions(result.getByLabelText('Body Theme'), 'dark')
  expect(mockPage.settings.bodyTheme).toBe('dark')
})

test('Override Main Theme', () => {
  const { rerender, result, mockPage } = getResults()
  userEvent.click(result.getByLabelText('Main Theme'))
  rerender()
  expect(result.getByLabelText('Main Theme')).not.toHaveAttribute('readOnly')
  userEvent.selectOptions(result.getByLabelText('Main Theme'), 'dark')
  expect(mockPage.settings.mainTheme).toBe('dark')
})

test('Override Active Nav Tab Theme', () => {
  const { rerender, result, mockPage } = getResults()
  userEvent.click(result.getByLabelText('Active Nav Tab Theme'))
  rerender()
  expect(result.getByLabelText('Active Nav Tab Theme')).not.toHaveAttribute(
    'readOnly'
  )
  userEvent.selectOptions(result.getByLabelText('Active Nav Tab Theme'), 'dark')
  expect(mockPage.settings.navActiveTabTheme).toBe('dark')
})

test('Override Active Submenu Theme', () => {
  const { rerender, result, mockPage } = getResults()
  userEvent.click(result.getByLabelText('Active Submenu Theme'))
  rerender()
  expect(result.getByLabelText('Active Submenu Theme')).not.toHaveAttribute(
    'readOnly'
  )
  userEvent.selectOptions(result.getByLabelText('Active Submenu Theme'), 'dark')
  expect(mockPage.settings.navActiveSubmenuTheme).toBe('dark')
})

test('Override Header Theme', () => {
  const { rerender, result, mockPage } = getResults()
  userEvent.click(result.getByLabelText('Header Theme'))
  rerender()
  expect(result.getByLabelText('Header Theme')).not.toHaveAttribute('readOnly')
  userEvent.selectOptions(result.getByLabelText('Header Theme'), 'dark')
  expect(mockPage.settings.headerTheme).toBe('dark')
})

test('Override Jumbotron Theme', () => {
  const { rerender, result, mockPage } = getResults()
  userEvent.click(result.getByLabelText('Jumbotron Theme'))
  rerender()
  expect(result.getByLabelText('Jumbotron Theme')).not.toHaveAttribute(
    'readOnly'
  )
  userEvent.selectOptions(result.getByLabelText('Jumbotron Theme'), 'dark')
  expect(mockPage.settings.jumboTheme).toBe('dark')
})

test('Override Footer Theme', () => {
  const { rerender, result, mockPage } = getResults()
  userEvent.click(result.getByLabelText('Footer Theme'))
  rerender()
  expect(result.getByLabelText('Footer Theme')).not.toHaveAttribute('readOnly')
  userEvent.selectOptions(result.getByLabelText('Footer Theme'), 'dark')
  expect(mockPage.settings.footerTheme).toBe('dark')
})

test('Override Max Width on Navigation Bar', () => {
  const { result, mockPage } = getResults({ navPosition: 'fixed-top' })
  userEvent.click(result.getByText('Max Width on Navigation Bar'))
  expect(mockPage.settings.maxWidthNav).toBe(true)
})

test('Override Max Width on Jumbotron Container', () => {
  const { result, mockPage } = getResults()
  userEvent.click(result.getByText('Max Width on Jumbotron Container'))
  expect(mockPage.settings.maxWidthJumboContainer).toBe(true)
})

test('Override Max Width on Header Container', () => {
  const { result, mockPage } = getResults()
  userEvent.click(result.getByText('Max Width on Header Container'))
  expect(mockPage.settings.maxWidthHeaderContainer).toBe(true)
})

test('Override Max Width on Main Container', () => {
  const { result, mockPage } = getResults()
  userEvent.click(result.getByText('Max Width on Main Container'))
  expect(mockPage.settings.maxWidthMainContainer).toBe(true)
})

test('Override Max Width on Footer Container', () => {
  const { result, mockPage } = getResults()
  userEvent.click(result.getByText('Max Width on Footer Container'))
  expect(mockPage.settings.maxWidthFooterContainer).toBe(true)
})

test('Test navigation', () => {
  const { result, state } = getResults()
  userEvent.click(result.getByText('root page'))
  expect(state.latestNavigatePath).toBe('/')

  userEvent.click(result.getByText('(root page)'))
  expect(state.latestNavigatePath).toBe('/')

  userEvent.click(result.getByText('/foo-1/'))
  expect(state.latestNavigatePath).toBe('/foo-1/')
})
