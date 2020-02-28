import PropTypes from 'prop-types'
import React from 'react'
import { Card, Modal, Spinner } from '@preaction/bootstrap-clips'
import { Checkbox, Select } from '@preaction/inputs'
import { getRgbaFromSettings } from './lib/getRgba.js'
import {
  MdArrowBack,
  MdArrowForward,
  MdDelete,
  MdImage,
  MdSettings
} from 'react-icons/md'

class PageBlockImages extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showSettings: false,
      uploading: false,
      viewImage: undefined
    }
    this.uploadForm = React.createRef()
    this.photosInput = React.createRef()
  }

  clearImageViewer() {
    this.setState(state => {
      state.modalAnimationDirection = 'Out'
      return state
    })
    setTimeout(() => {
      this.setState(state => {
        delete state.viewImage
        return state
      })
    }, 500)
  }

  galleryControl(index, action) {
    return () => {
      this.props.galleryControl(this.props.data, index, action)
    }
  }

  getPageBlockSettingsValueHandler(key) {
    return this.props.getPageBlockSettingsValueHandler(this.props.data.id, key)
  }

  get cardWidth() {
    let getWidthRatio = desc => {
      let width
      switch (desc) {
        case 'Full Page':
          width = 1
          break
        case 'Half Page':
          width = 1 / 2
          break
        case 'Third Page':
          width = 1 / 3
          break
        case 'Quarter Page':
          width = 1 / 4
          break
        default:
          width = 1
          break
      }
      return width
    }
    let xsWidth = getWidthRatio(this.props.data.settings.xsWidth)
    let smWidth = getWidthRatio(this.props.data.settings.smWidth)
    let mdWidth = getWidthRatio(this.props.data.settings.mdWidth)
    let lgWidth = getWidthRatio(this.props.data.settings.lgWidth)
    let width = {
      xs: xsWidth,
      sm: smWidth,
      md: mdWidth,
      lg: lgWidth
    }
    return width
  }

  refreshBlock() {
    this.props.blockControl(this.props.data.id, 'refresh')
    this.props.emitSave()
  }

  toggleSettings() {
    this.setState(state => {
      state.showSettings = !state.showSettings
      return state
    })
  }

  viewImage(image) {
    return event => {
      event.preventDefault()
      if (this.props.data.settings.pushToZoom) {
        this.setState(state => {
          state.modalAnimationDirection = 'In'
          state.viewImage = image
          return state
        })
      }
    }
  }

  render() {
    return (
      <div
        className='page-block-images'
        id={`page-block-${this.props.data.id}`}
      >
        {this.props.editable ? (
          <div>
            <form
              method='POST'
              action='/api/upload'
              encType='multipart/form-data'
              ref={this.uploadForm}
              target={`upload-frame-${this.props.data.id}`}
              className='d-none'
            >
              <input
                name='photos'
                type='file'
                multiple
                accept='image/*'
                ref={this.photosInput}
                onChange={() => {
                  this.uploadForm.current.submit()
                  this.setState(state => {
                    state.uploading = true
                    return state
                  })
                }}
              />
              <input
                name='target'
                type='hidden'
                value={`page-block/${this.props.data.id}`}
              />
            </form>
            <iframe
              name={`upload-frame-${this.props.data.id}`}
              title='upload'
              onLoad={() => {
                this.setState(
                  state => {
                    state.uploading = false
                    return state
                  },
                  () => {
                    this.refreshBlock()
                  }
                )
              }}
              className='d-none'
            />
          </div>
        ) : (
          ''
        )}
        <div className='row'>
          {this.props
            .getContents(this.props.data.pageblockimages || [])
            .map((image, index) => (
              <Card
                className={{
                  card: `image ${
                    this.props.data.settings.showContainer ? '' : 'nocontainer'
                  }`
                }}
                column
                contain={this.props.data.settings.center}
                width={this.cardWidth}
                headerTheme={this.props.settings.containerHeaderTheme}
                footerTheme={this.props.settings.containerHeaderTheme}
                style={{
                  card: {
                    backgroundColor: getRgbaFromSettings(
                      this.props.settings,
                      'container'
                    ).string,
                    border: this.props.settings
                      ? `1px solid ${
                          getRgbaFromSettings(this.props.settings, 'border')
                            .string
                        }`
                      : '0px solid transparent',
                    borderRadius: '0.25rem',
                    transition:
                      'background-color 1s linear, border-color 1s linear'
                  }
                }}
                key={image.id}
                footer={
                  this.props.editable ? (
                    <div className='btn-group d-flex'>
                      <button
                        type='button'
                        className='btn btn-sm btn-info d-block mr-auto'
                        onClick={this.galleryControl(index, 'previous')}
                        disabled={index === 0}
                      >
                        <MdArrowBack />
                      </button>
                      <button
                        type='button'
                        className='btn btn-sm btn-danger d-block ml-auto mr-auto'
                        onClick={this.galleryControl(index, 'delete')}
                      >
                        <MdDelete />
                      </button>
                      <button
                        type='button'
                        className='btn btn-sm btn-info d-block ml-auto'
                        onClick={this.galleryControl(index, 'next')}
                        disabled={
                          index >= this.props.data.pageblockimages.length - 1
                        }
                      >
                        <MdArrowForward />
                      </button>
                    </div>
                  ) : (
                    ''
                  )
                }
              >
                <a
                  href='.'
                  onClick={this.viewImage(image).bind(this)}
                  tabIndex={this.props.data.settings.pushToZoom ? 0 : -1}
                  style={{
                    cursor: this.props.data.settings.pushToZoom
                      ? 'pointer'
                      : 'default'
                  }}
                >
                  <img
                    src={`/uploads/${image.filename}`}
                    style={{
                      width: '100%'
                    }}
                    alt=''
                  />
                </a>
              </Card>
            ))}
        </div>
        {this.props.editable ? (
          <div>
            <button
              type='button'
              className='btn btn-secondary btn-sm'
              onClick={this.toggleSettings.bind(this)}
            >
              <MdSettings /> Image Block Settings
            </button>
            {this.state.showSettings ? (
              <Modal
                title='Image Block Settings'
                closeHandler={this.toggleSettings.bind(this)}
              >
                <div className='row'>
                  <div className='col-md-6'>
                    <Select
                      label='Image Width (phone, portrait mode)'
                      value={this.props.data.settings.xsWidth}
                      valueHandler={this.getPageBlockSettingsValueHandler(
                        'xsWidth'
                      )}
                    >
                      <option>Full Page</option>
                      <option>Half Page</option>
                      <option>Third Page</option>
                      <option>Quarter Page</option>
                    </Select>
                    <Select
                      label='Image Width (phone, landscape mode)'
                      value={this.props.data.settings.smWidth}
                      valueHandler={this.getPageBlockSettingsValueHandler(
                        'smWidth'
                      )}
                    >
                      <option>Full Page</option>
                      <option>Half Page</option>
                      <option>Third Page</option>
                      <option>Quarter Page</option>
                    </Select>
                    <Select
                      label='Image Width (tablet)'
                      value={this.props.data.settings.mdWidth}
                      valueHandler={this.getPageBlockSettingsValueHandler(
                        'mdWidth'
                      )}
                    >
                      <option>Full Page</option>
                      <option>Half Page</option>
                      <option>Third Page</option>
                      <option>Quarter Page</option>
                    </Select>
                    <Select
                      label='Image Width (desktop)'
                      value={this.props.data.settings.lgWidth}
                      valueHandler={this.getPageBlockSettingsValueHandler(
                        'lgWidth'
                      )}
                    >
                      <option>Full Page</option>
                      <option>Half Page</option>
                      <option>Third Page</option>
                      <option>Quarter Page</option>
                    </Select>
                  </div>
                </div>
                <Checkbox
                  label='Automatically collapse columns for smaller screens'
                  checked={this.props.data.settings.autoCollapseColumns}
                  valueHandler={this.getPageBlockSettingsValueHandler(
                    'autoCollapseColumns'
                  )}
                />
                <Checkbox
                  label='Center/Justify'
                  checked={this.props.data.settings.center}
                  valueHandler={this.getPageBlockSettingsValueHandler('center')}
                />
                <Checkbox
                  label='Place each image in a container'
                  checked={this.props.data.settings.showContainer}
                  valueHandler={this.getPageBlockSettingsValueHandler(
                    'showContainer'
                  )}
                />
                <Checkbox
                  label='Push to Zoom'
                  checked={this.props.data.settings.pushToZoom}
                  valueHandler={this.getPageBlockSettingsValueHandler(
                    'pushToZoom'
                  )}
                />
              </Modal>
            ) : (
              <div />
            )}
            <div className='btn-group pt-1'>
              <button
                type='button'
                className='btn btn-info d-block'
                onClick={() => {
                  this.photosInput.current.click()
                }}
                disabled={this.state.uploading}
              >
                <MdImage /> add images
                {this.state.uploading ? (
                  <span>
                    <span> </span>
                    <Spinner />
                  </span>
                ) : (
                  ''
                )}
              </button>
            </div>
          </div>
        ) : (
          ''
        )}
        <div
          className={`animated faster fade${
            this.state.modalAnimationDirection
          } ${this.state.viewImage ? 'd-block' : 'd-none'}`}
          style={{
            backgroundColor: 'rgba(0,0,0,0.8125)',
            cursor: 'pointer',
            width: '100%',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            zIndex: 2000
          }}
          onClick={this.clearImageViewer.bind(this)}
        >
          <div
            className={`animated zoom${this.state.modalAnimationDirection} faster`}
            style={{
              width: '100%',
              height: '100vh',
              display: 'flex',
              alignContent: 'center',
              alignItems: 'center'
            }}
          >
            {this.state.viewImage ? (
              <img
                src={`/uploads/${this.state.viewImage.filename}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100vh',
                  display: 'block',
                  marginLeft: 'auto',
                  marginRight: 'auto'
                }}
                alt=''
              />
            ) : (
              ''
            )}
          </div>
        </div>
      </div>
    )
  }
}

PageBlockImages.propTypes = {
  blockControl: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
  editable: PropTypes.bool,
  emitSave: PropTypes.func.isRequired,
  galleryControl: PropTypes.func.isRequired,
  getContents: PropTypes.func.isRequired,
  getPageBlockSettingsValueHandler: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired
}

export default PageBlockImages
