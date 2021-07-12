import React from 'react'
import { render, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import PageBlockIframe from '../PageBlockIframe.jsx'

test('PageBlockIframe basic', async () => {
  const mockBlock = {
    id: 6,
    blockType: 'iframe',
    ordering: 1,
    settings: {
      header: '',
      headerLevel: 0,
      xxlWidth: 12,
      lgWidth: 12,
      mdWidth: 12,
      smWidth: 12,
      xsWidth: 12,
      iframeSrc: 'about:blank',
    },
    createdAt: '2020-09-08T15:18:23.278Z',
    updatedAt: '2020-09-08T15:18:23.278Z',
    pageId: 1,
    pageblockcontents: [],
  }
  const result = render(<PageBlockIframe block={mockBlock} />)
  expect(result.container.querySelector('iframe')).toBeInTheDocument()
  await waitFor(
    () =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(
            expect(result.container.querySelector('iframe')).toHaveStyle({
              height: '0px',
            })
          )
        }, 250)
      })
  )
})
