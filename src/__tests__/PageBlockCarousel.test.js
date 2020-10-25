import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import PageBlockCarousel from '../PageBlockCarousel.jsx'

function getResult() {
  const block = { pageblockcontents: [], settings: {} }
  function getContents(contents) {
    return contents
  }
  const result = render(
    <PageBlockCarousel block={block} getContents={getContents} />
  )
  return {
    result,
  }
}

test('PageBlockCarousel renders without crashing', () => {
  const { result } = getResult()
  expect(result.container.querySelector('.slick-list')).toBeInTheDocument()
})
