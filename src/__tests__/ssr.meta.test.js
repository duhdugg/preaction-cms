import { render } from '../ssr.meta.js'

test('ssr.meta themeColor', () => {
  expect(render({}).includes('#000000')).toBe(false)
  expect(render({ themeColor: '#000000' }).includes('#000000')).toBe(true)
})

test('ssr.meta title', () => {
  expect(render({}).includes('FooBar')).toBe(false)
  expect(render({ title: 'FooBar' }).includes('FooBar')).toBe(true)
})

test('ssr.meta description', () => {
  expect(render({}).includes('Lorem Ipsum')).toBe(false)
  expect(render({ description: 'Lorem Ipsum' }).includes('Lorem Ipsum')).toBe(
    true
  )
})

test('ssr.meta siteTitle', () => {
  expect(render({}).includes('FooBar')).toBe(false)
  expect(render({ siteTitle: 'FooBar' }).includes('FooBar')).toBe(true)
})

test('ssr.meta ogType', () => {
  expect(render({}).includes('website')).toBe(false)
  expect(render({ ogType: 'website' }).includes('website')).toBe(true)
})

test('ssr.meta ogImage', () => {
  expect(render({}).includes('about:blank.jpg')).toBe(false)
  expect(
    render({ ogImage: 'about:blank.jpg' }).includes('about:blank.jpg')
  ).toBe(true)
})

test('ssr.meta ogUrl', () => {
  expect(render({}).includes('about:blank')).toBe(false)
  expect(render({ ogUrl: 'about:blank' }).includes('about:blank')).toBe(true)
})

test('ssr.meta icons', () => {
  expect(render({}).includes('icon.png')).toBe(false)
  expect(
    render({ icons: [{ href: 'icon.png', rel: 'icon' }] }).includes('icon.png')
  ).toBe(true)
})
