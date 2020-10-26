import PropTypes from 'prop-types'
import React from 'react'
import { MdArrowBack, MdArrowForward, MdDelete } from 'react-icons/md'
import { Alert, Card } from '@preaction/bootstrap-clips'
import { Checkbox, Input } from '@preaction/inputs'

function PageBlockCarouselSettings(props) {
  return (
    <div>
      <div className='carousel-primary row'>
        <Card
          header='Animation'
          headerTheme='dark'
          className={{ card: 'carousel-animation-settings mb-3' }}
          column
          width={{ sm: 1 / 2 }}
        >
          <div className='carousel-speed-field'>
            <Input
              type='number'
              label='Animation Speed (in milliseconds)'
              placeholder='300'
              value={props.block.settings.speed || ''}
              valueHandler={props.getPageBlockSettingsValueHandler('speed')}
            />
          </div>
          <div className='carousel-fade-field'>
            <Checkbox
              label='Fade Animation (instead of slide)'
              checked={props.block.settings.fade || false}
              valueHandler={props.getPageBlockSettingsValueHandler('fade')}
            />
          </div>
        </Card>
        <Card
          className={{ card: 'carousel-autoplay-settings mb-3' }}
          header='Autoplay'
          headerTheme='dark'
          column
          width={{ sm: 1 / 2 }}
        >
          <div className='carousel-autoplay-field'>
            <Checkbox
              label='Autoplay'
              checked={props.block.settings.autoplay || false}
              valueHandler={props.getPageBlockSettingsValueHandler('autoplay')}
            />
          </div>
          {props.block.settings.autoplay ? (
            <div className='carousel-autoplay-speed-field'>
              <Input
                type='number'
                step='1'
                min='1'
                placeholder='3000'
                label='Autoplay Speed (in milliseconds)'
                value={props.block.settings.autoplaySpeed || ''}
                valueHandler={props.getPageBlockSettingsValueHandler(
                  'autoplaySpeed'
                )}
              />
            </div>
          ) : (
            ''
          )}
          {props.block.settings.autoplay ? (
            <div className='carousel-autoplay-pause-on-hover-field'>
              <Checkbox
                label='Pause Autoplay on Hover'
                checked={props.block.settings.autoplayPauseOnHover || false}
                valueHandler={props.getPageBlockSettingsValueHandler(
                  'autoplayPauseOnHover'
                )}
              />
            </div>
          ) : (
            ''
          )}
        </Card>
        <Card
          className={{ card: 'carousel-layout-settings mb-3' }}
          header='Layout'
          headerTheme='dark'
          column
          width={{ sm: 1 / 2 }}
        >
          <div className='carousel-rows-field'>
            <Input
              type='number'
              min='1'
              step='1'
              label='Rows'
              placeholder='1'
              value={props.block.settings.rows || ''}
              valueHandler={props.getPageBlockSettingsValueHandler('rows')}
            />
            {props.block.settings.thumbnailPagination ? (
              <Alert>
                The <strong>Rows</strong> setting is ignored when{' '}
                <strong>Thumbnail Pagination</strong> is enabled.
              </Alert>
            ) : (
              ''
            )}
          </div>
          <div className='carousel-slides-per-row-field'>
            <Input
              type='number'
              min='1'
              step='1'
              label='Slides per Row'
              placeholder='1'
              value={props.block.settings.slidesPerRow || ''}
              valueHandler={props.getPageBlockSettingsValueHandler(
                'slidesPerRow'
              )}
            />
            {props.block.settings.thumbnailPagination ? (
              <Alert>
                The <strong>Slides per Row</strong> setting is ignored when{' '}
                <strong>Thumbnail Pagination</strong> is enabled.
              </Alert>
            ) : (
              ''
            )}
          </div>
          <div className='carousel-slides-to-show-field'>
            <Input
              type='number'
              min='1'
              step='1'
              label='Slides to Show'
              placeholder='1'
              value={props.block.settings.slidesToShow || ''}
              valueHandler={props.getPageBlockSettingsValueHandler(
                'slidesToShow'
              )}
            />
            {props.block.settings.fade ? (
              <Alert>
                The <strong>Slides to Show</strong> setting is ignored when{' '}
                <strong>Fade Animation</strong> is enabled.
              </Alert>
            ) : (
              ''
            )}
          </div>
          <div className='carousel-slides-to-scroll-field'>
            <Input
              type='number'
              min='1'
              step='1'
              label='Slides to Scroll'
              placeholder='1'
              value={props.block.settings.slidesToScroll || ''}
              valueHandler={props.getPageBlockSettingsValueHandler(
                'slidesToScroll'
              )}
            />
            {props.block.settings.fade ||
            props.block.settings.centerMode ||
            props.block.settings.thumbnailPagination ? (
              <Alert>
                The <strong>Slides to Scroll</strong> setting is ignored when{' '}
                <strong>Fade Animation</strong>, <strong>Center Mode</strong>,
                and/or <strong>Thumbnail Pagination</strong> are enabled.
              </Alert>
            ) : (
              ''
            )}
          </div>
        </Card>
        <Card
          className={{ card: 'carousel-behavior-settings mb-3' }}
          header='Behavior'
          headerTheme='dark'
          column
          width={{ sm: 1 / 2 }}
        >
          <div className='carousel-arrows-field'>
            <Checkbox
              label='Arrows'
              checked={props.block.settings.arrows || false}
              valueHandler={props.getPageBlockSettingsValueHandler('arrows')}
            />
          </div>
          <div className='carousel-pagination-dots-field'>
            <Checkbox
              label='Pagination Dots'
              checked={props.block.settings.paginationDots || false}
              valueHandler={props.getPageBlockSettingsValueHandler(
                'paginationDots'
              )}
            />
          </div>
          <div className='carousel-thumbnail-pagination-field'>
            <Checkbox
              label='Thumbnail Pagination'
              checked={props.block.settings.thumbnailPagination || false}
              valueHandler={props.getPageBlockSettingsValueHandler(
                'thumbnailPagination'
              )}
            />
          </div>
          <div className='carousel-swipe-field'>
            <Checkbox
              label='Swipe'
              checked={props.block.settings.swipe || false}
              valueHandler={props.getPageBlockSettingsValueHandler('swipe')}
            />
          </div>
          <div className='carousel-focus-on-select-field'>
            <Checkbox
              label='Focus on Select'
              checked={props.block.settings.focusOnSelect || false}
              valueHandler={props.getPageBlockSettingsValueHandler(
                'focusOnSelect'
              )}
            />
          </div>
          <div className='carousel-keyboard-navigation-field'>
            <Checkbox
              label='Keyboard Navigation'
              checked={props.block.settings.keyboardNavigation || false}
              valueHandler={props.getPageBlockSettingsValueHandler(
                'keyboardNavigation'
              )}
            />
          </div>
          <div className='carousel-center-mode-field'>
            <Checkbox
              label='Center Mode'
              checked={props.block.settings.centerMode || false}
              valueHandler={props.getPageBlockSettingsValueHandler(
                'centerMode'
              )}
            />
          </div>
          <div className='carousel-infinite-field'>
            <Checkbox
              label='Infinite'
              checked={props.block.settings.infinite || false}
              valueHandler={props.getPageBlockSettingsValueHandler('infinite')}
            />
          </div>
        </Card>
      </div>
      {props.block.settings.thumbnailPagination ? (
        <Card
          header='Thumbnail Pagination Options'
          theme='secondary'
          className={{ card: 'mb-3 carousel-secondary' }}
        >
          <div className='carousel-speed-field'>
            <Input
              type='number'
              label='Animation Speed (in milliseconds)'
              placeholder='300'
              value={props.block.settings.speed2 || ''}
              valueHandler={props.getPageBlockSettingsValueHandler('speed2')}
            />
          </div>
          <div className='carousel-slides-to-show-field'>
            <Input
              type='number'
              min='1'
              step='1'
              label='Slides to Show'
              placeholder='3'
              value={props.block.settings.slidesToShow2 || ''}
              valueHandler={props.getPageBlockSettingsValueHandler(
                'slidesToShow2'
              )}
            />
          </div>
          <div className='carousel-arrows-field'>
            <Checkbox
              label='Arrows'
              checked={props.block.settings.arrows2 || false}
              valueHandler={props.getPageBlockSettingsValueHandler('arrows2')}
            />
          </div>
        </Card>
      ) : (
        ''
      )}
      <Card header='Image Width:Height Ratio' headerTheme='dark'>
        <div className='row'>
          <div className='col-md-6'>
            <Input
              type='number'
              min='0.01'
              step='0.01'
              label='Ratio Width'
              placeholder='16'
              value={props.block.settings.ratioWidth}
              valueHandler={props.getPageBlockSettingsValueHandler(
                'ratioWidth'
              )}
            />
          </div>
          <div className='col-md-6'>
            <Input
              type='number'
              min='0.01'
              step='0.01'
              label='Ratio Height'
              placeholder='9'
              value={props.block.settings.ratioHeight}
              valueHandler={props.getPageBlockSettingsValueHandler(
                'ratioHeight'
              )}
            />
          </div>
        </div>
      </Card>
      <Card header='Images' headerTheme='dark'>
        <Alert>
          For best results, image dimensions should match the specified ratio.
          Also, the total number of images should equal a multiple of{' '}
          <strong>Rows</strong> &times; <strong>Slides per Row</strong> &times;{' '}
          <strong>Slides to Show</strong>.
        </Alert>
        <div className='row'>
          {props
            .getContents(props.block.pageblockcontents || [])
            .map((content, index) => (
              <Card
                className={{ card: 'mb-3', footer: 'p-0' }}
                key={content.id}
                headerTheme='white'
                footerTheme='dark'
                column
                width={{
                  xs: 1,
                  md: 1 / 2,
                }}
                header={<img width='100%' src={content.settings.src} alt='' />}
                footer={
                  <div className='btn-group d-block'>
                    <button
                      type='button'
                      className='btn btn-sm btn-secondary move-content previous'
                      disabled={index === 0}
                      onClick={() => {
                        props.contentControl(props.block, index, 'previous')
                      }}
                      title='Move Content: Previous'
                    >
                      <MdArrowBack />
                    </button>
                    <button
                      type='button'
                      disabled={
                        index === props.block.pageblockcontents.length - 1
                      }
                      className='btn btn-sm btn-secondary move-content next'
                      onClick={() => {
                        props.contentControl(props.block, index, 'next')
                      }}
                      title='Move Content: Next'
                    >
                      <MdArrowForward />
                    </button>
                    <button
                      type='button'
                      className='btn btn-sm btn-danger delete-content'
                      onClick={() => {
                        props.contentControl(props.block, index, 'delete')
                      }}
                      title='Delete Content'
                    >
                      <MdDelete />
                    </button>
                  </div>
                }
              >
                <div className='img-src-field'>
                  <Input
                    label='Image Source'
                    value={content.settings.src}
                    valueHandler={props.getContentSettingsValueHandler(
                      content.id
                    )('src')}
                  />
                </div>
              </Card>
            ))}
        </div>
      </Card>
    </div>
  )
}

PageBlockCarouselSettings.propTypes = {
  block: PropTypes.object.isRequired,
  contentControl: PropTypes.func.isRequired,
  getContents: PropTypes.func.isRequired,
  getContentSettingsValueHandler: PropTypes.func.isRequired,
  getPageBlockSettingsValueHandler: PropTypes.func.isRequired,
}

export default PageBlockCarouselSettings
