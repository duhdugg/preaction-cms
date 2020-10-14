import PropTypes from 'prop-types'
import React from 'react'
import Slider from 'react-slick'

const parseIntFallback = (x, fallback) => {
  let retval = parseInt(x)
  if (isNaN(retval)) {
    retval = fallback
  }
  return retval
}

function PageBlockCarousel(props) {
  const [primarySlider, setPrimarySlider] = React.useState(null)
  const [secondarySlider, setSecondarySlider] = React.useState(null)

  const primarySliderProps = {
    accessibility:
      props.block.settings.keyboardNavigation !== undefined
        ? props.block.settings.keyboardNavigation
        : true,
    adaptiveHeight: true,
    arrows: props.block.settings.arrows || false,
    asNavFor: secondarySlider,
    autoplay: props.block.settings.autoplay || false,
    autoplaySpeed: parseIntFallback(props.block.settings.autoplaySpeed, 3000),
    centerMode: props.block.settings.centerMode || false,
    dots:
      (props.block.settings.paginationDots &&
        !props.block.settings.thumbnailPagination) ||
      false,
    draggable: props.block.settings.swipe || false,
    fade: props.block.settings.fade || false,
    focusOnSelect: props.block.settings.focusOnSelect || false,
    infinite: props.block.settings.infinite || false,
    pauseOnDotsHover: props.block.settings.autoplayPauseOnHover || false,
    pauseOnHover: props.block.settings.autoplayPauseOnHover || false,
    pauseOnFocus: props.block.settings.autoplayPauseOnHover || false,
    ref: (slider) => setPrimarySlider(slider),
    rows: props.block.settings.thumbnailPagination
      ? 1
      : parseIntFallback(props.block.settings.rows, 1),
    slidesPerRow: props.block.settings.thumbnailPagination
      ? 1
      : parseIntFallback(props.block.settings.slidesPerRow, 1),
    slidesToScroll:
      props.block.settings.fade ||
      props.block.settings.centerMode ||
      props.block.settings.thumbnailPagination
        ? 1
        : parseIntFallback(props.block.settings.slidesToScroll, 1),
    slidesToShow: props.block.settings.fade
      ? 1
      : parseIntFallback(props.block.settings.slidesToShow, 1),
    speed: parseIntFallback(props.block.settings.speed, 300),
    swipe: props.block.settings.swipe || false,
    swipeToSlide: props.block.settings.swipe || false,
    waitForAnimate: false,
  }

  const secondarySliderProps = {
    accessibility: true,
    adaptiveHeight: true,
    arrows: props.block.settings.arrows2 || false,
    asNavFor: primarySlider,
    centerMode: true,
    dots: props.block.settings.paginationDots || false,
    draggable: true,
    fade: false,
    focusOnSelect: true,
    infinite: true,
    ref: (slider) => setSecondarySlider(slider),
    rows: 1,
    slidesPerRow: 1,
    slidesToScroll: 1,
    slidesToShow: parseIntFallback(props.block.settings.slidesToShow2 || 3),
    speed: parseIntFallback(props.block.settings.speed2 || 300),
    swipe: true,
    swipeToSlide: true,
    waitForAnimate: false,
  }

  // fix slick not autoplaying when autoplay is enabled without reloading
  const prevAutoplay = React.useRef()
  React.useEffect(() => {
    prevAutoplay.current = props.block.settings.autoplay
    if (props.block.settings.autoplay && primarySlider) {
      primarySlider.slickPlay()
    }
  }, [props.block.settings.autoplay, primarySlider])

  return (
    <div
      className={[
        'carousel-container',
        props.block.settings.centerMode ? 'carousel-center-mode' : '',
        props.block.settings.focusOnSelect ? 'carousel-focus-on-select' : '',
      ]
        .filter((x) => !!x.length)
        .join(' ')}
      style={{
        paddingLeft:
          props.block.settings.arrows ||
          (props.block.settings.thumbnailPagination &&
            props.block.settings.arrows2)
            ? '1em'
            : 0,
        paddingRight:
          props.block.settings.arrows ||
          (props.block.settings.thumbnailPagination &&
            props.block.settings.arrows2)
            ? '1em'
            : 0,
        paddingBottom: props.block.settings.paginationDots ? '1em' : 0,
      }}
      onMouseEnter={
        props.block.settings.autoplay &&
        props.block.settings.autoplayPauseOnHover
          ? () => primarySlider.slickPause()
          : () => {}
      }
      onMouseLeave={
        props.block.settings.autoplay &&
        props.block.settings.autoplayPauseOnHover
          ? () => primarySlider.slickPlay()
          : () => {}
      }
    >
      <Slider {...primarySliderProps}>
        {props
          .getContents(props.block.pageblockcontents || [])
          .map((content) => (
            <div key={content.id}>
              <img
                style={{
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  width: '100%',
                }}
                src={content.settings.src}
                alt={content.settings.altText || ''}
                title={content.settings.altText || ''}
              />
            </div>
          ))}
      </Slider>
      {props.block.settings.thumbnailPagination ? (
        <div className='thumbnail-pagination'>
          <Slider {...secondarySliderProps}>
            {props
              .getContents(props.block.pageblockcontents || [])
              .map((content) => (
                <div key={content.id}>
                  <img
                    style={{
                      marginLeft: 'auto',
                      marginRight: 'auto',
                      width: '100%',
                    }}
                    src={content.settings.src}
                    alt={content.settings.altText || ''}
                    title={content.settings.altText || ''}
                  />
                </div>
              ))}
          </Slider>
        </div>
      ) : (
        ''
      )}
      <link
        rel='stylesheet'
        type='text/css'
        charSet='UTF-8'
        href='https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css'
      />
      <link
        rel='stylesheet'
        type='text/css'
        href='https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css'
      />
    </div>
  )
}

PageBlockCarousel.propTypes = {
  block: PropTypes.object.isRequired,
  getContents: PropTypes.func.isRequired,
}

export default PageBlockCarousel
