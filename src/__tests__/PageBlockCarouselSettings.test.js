import React from 'react'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import PageBlockCarouselSettings from '../PageBlockCarouselSettings.jsx'

function getResult() {
  const block = {
    pageblockcontents: [
      { id: 1, settings: {} },
      { id: 2, settings: {} },
      { id: 3, settings: {} },
    ],
    settings: {},
  }
  function contentControl(block, index, action) {
    state.contentControlAction = action
  }
  function getContents(contents) {
    return contents
  }
  function getContentSettingsValueHandler() {
    return () => {}
  }
  function getPageBlockSettingsValueHandler() {
    return () => {}
  }
  const state = {
    contentControlAction: '',
  }
  const result = render(
    <PageBlockCarouselSettings
      block={block}
      contentControl={contentControl}
      getContents={getContents}
      getContentSettingsValueHandler={getContentSettingsValueHandler}
      getPageBlockSettingsValueHandler={getPageBlockSettingsValueHandler}
    />
  )
  return {
    result,
    state,
  }
}

test('PageBlockCarouselSettings renders without crashing', () => {
  const { result } = getResult()
  expect(
    result.container.querySelector('.carousel-primary')
  ).toBeInTheDocument()
})

test('PageBlockCarouselSettings move-previous', async () => {
  const { result, state } = getResult()
  userEvent.click(
    result.container.querySelectorAll('.btn.move-content.previous')[1]
  )
  await waitFor(() => expect(state.contentControlAction).toBe('previous'))
})

test('PageBlockCarouselSettings move-next', async () => {
  const { result, state } = getResult()
  userEvent.click(
    result.container.querySelectorAll('.btn.move-content.next')[1]
  )
  await waitFor(() => expect(state.contentControlAction).toBe('next'))
})

test('PageBlockCarouselSettings delete', async () => {
  const { result, state } = getResult()
  userEvent.click(result.container.querySelectorAll('.btn.delete-content')[1])
  await waitFor(() => expect(state.contentControlAction).toBe('delete'))
})
