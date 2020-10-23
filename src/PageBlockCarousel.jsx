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
  const [carouselContainer, setCarouselContainer] = React.useState(null)
  const [containerWidth, setContainerWidth] = React.useState(0)
  const [primarySlider, setPrimarySlider] = React.useState(null)
  const [secondarySlider, setSecondarySlider] = React.useState(null)

  const primarySliderProps = {
    accessibility:
      props.block.settings.keyboardNavigation !== undefined
        ? props.block.settings.keyboardNavigation
        : true,
    adaptiveHeight: false,
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
    lazyLoad: true,
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
    adaptiveHeight: false,
    arrows: props.block.settings.arrows2 || false,
    asNavFor: primarySlider,
    centerMode: true,
    dots: props.block.settings.paginationDots || false,
    draggable: true,
    fade: false,
    focusOnSelect: true,
    infinite: true,
    lazyLoad: true,
    ref: (slider) => setSecondarySlider(slider),
    rows: 1,
    slidesPerRow: 1,
    slidesToScroll: 1,
    slidesToShow: parseIntFallback(props.block.settings.slidesToShow2, 3),
    speed: parseIntFallback(props.block.settings.speed2, 300),
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

  // resize appropriately
  React.useEffect(() => {
    function handleResize() {
      if (carouselContainer) {
        setContainerWidth(carouselContainer.clientWidth)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  })

  if (carouselContainer && containerWidth !== carouselContainer.clientWidth) {
    setContainerWidth(carouselContainer.clientWidth)
  }

  const ratio =
    Number(props.block.settings.ratioHeight || 9) /
    Number(props.block.settings.ratioWidth || 16)
  let width = 0
  let previewWidth = 0
  if (containerWidth) {
    let dividend = 1
    if (!props.block.settings.thumbnailPagination) {
      dividend = parseIntFallback(props.block.settings.slidesPerRow, 1)
    }
    if (!props.block.settings.fade) {
      dividend =
        dividend * parseIntFallback(props.block.settings.slidesToShow, 1)
    }
    width =
      (containerWidth - (props.block.settings.centerMode ? 100 : 0)) / dividend
    let previewDividend = parseIntFallback(
      props.block.settings.slidesToShow2,
      3
    )
    previewWidth = (containerWidth - 100) / previewDividend
  }
  const height = width * ratio
  const previewHeight = previewWidth * ratio

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
      <div ref={(carousel) => setCarouselContainer(carousel)}>
        <Slider {...primarySliderProps}>
          {props
            .getContents(props.block.pageblockcontents || [])
            .map((content) => (
              <div key={content.id}>
                <div
                  className='img'
                  style={{
                    backgroundImage: `url("${content.settings.src}")`,
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'contain',
                    fontSize: '1rem',
                    height: `${height}px`,
                  }}
                ></div>
              </div>
            ))}
        </Slider>
      </div>
      {props.block.settings.thumbnailPagination ? (
        <div className='thumbnail-pagination'>
          <Slider {...secondarySliderProps}>
            {props
              .getContents(props.block.pageblockcontents || [])
              .map((content) => (
                <div key={content.id}>
                  <div
                    className='img'
                    style={{
                      backgroundImage: `url("${content.settings.src}")`,
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: 'contain',
                      fontSize: '1rem',
                      height: `${previewHeight}px`,
                    }}
                  ></div>
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
