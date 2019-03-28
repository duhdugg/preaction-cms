import React from 'react'
import { Card } from 'preaction-bootstrap-clips'
import { Checkbox, Select } from 'preaction-inputs'

class PageBlockImages extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      showSettings: false,
      uploading: false,
      viewImage: undefined
    }
    this.uploadForm = React.createRef()
    this.photosInput = React.createRef()
  }

  clearImageViewer () {
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

  galleryControl (index, action) {
    return () => {
      this.props.galleryControl(this.props.data, index, action)
    }
  }

  getPageBlockSettingsValueHandler (key) {
    return this.props.getPageBlockSettingsValueHandler(this.props.data.id, key)
  }

  get cardWidth () {
    let width
    if (this.props.data.settings.autoCollapseColumns) {
      switch (this.props.data.settings.maxWidth) {
        case '50%':
          width = {
            xs: 1,
            sm: 1 / 2
          }
          break
        case '33%':
          width = {
            xs: 1,
            sm: 1 / 2,
            lg: 1 / 3
          }
          break
        case '25%':
          width = {
            xs: 1,
            sm: 1 / 2,
            lg: 1 / 3,
            xl: 1 / 4
          }
          break
        default:
          width = { xs: 1 }
          break
      }
    } else {
      switch (this.props.data.settings.maxWidth) {
        case '50%':
          width = 1 / 2
          break
        case '33%':
          width = 1 / 3
          break
        case '25%':
          width = 1 / 4
          break
        default:
          width = 1
          break
      }
    }
    return width
  }

  refreshBlock () {
    this.props.blockControl(this.props.data.id, 'refresh')
  }

  toggleSettings () {
    this.setState(state => {
      state.showSettings = !state.showSettings
      return state
    })
  }

  viewImage (image) {
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

  render () {
    return (
      <div
        className="page-block-images"
        id={`page-block-${this.props.data.id}`}
      >
        {this.props.editable ? (
          <div>
            <form
              method="POST"
              action="/api/upload"
              encType="multipart/form-data"
              ref={this.uploadForm}
              target={`upload-frame-${this.props.data.id}`}
              className="d-none"
            >
              <input
                name="photos"
                type="file"
                multiple
                accept="image/*"
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
                name="target"
                type="hidden"
                value={`page-block/${this.props.data.id}`}
              />
            </form>
            <iframe
              name={`upload-frame-${this.props.data.id}`}
              title="upload"
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
              className="d-none"
            />
          </div>
        ) : (
          ''
        )}
        <div className="row">
          {this.props
            .getImages(this.props.data.pageblockimages || [])
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
                style={{
                  card: {
                    backgroundColor: this.props.siteSettings.containerRgba
                      .string
                  }
                }}
                key={image.id}
                footer={
                  this.props.editable ? (
                    <div className="btn-group d-flex">
                      <button
                        type="button"
                        className="btn btn-sm btn-info d-block mr-auto"
                        onClick={this.galleryControl(index, 'previous')}
                        disabled={index === 0}
                      >
                        <i className="icon ion-md-arrow-dropleft-circle" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger d-block ml-auto mr-auto"
                        onClick={this.galleryControl(index, 'delete')}
                      >
                        <i className="icon ion-md-trash" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-info d-block ml-auto"
                        onClick={this.galleryControl(index, 'next')}
                        disabled={
                          index >= this.props.data.pageblockimages.length - 1
                        }
                      >
                        <i className="icon ion-md-arrow-dropright-circle" />
                      </button>
                    </div>
                  ) : (
                    ''
                  )
                }
              >
                <a href="." onClick={this.viewImage(image).bind(this)}>
                  <img
                    src={`/uploads/${image.filename}`}
                    style={{
                      maxWidth: '100%'
                    }}
                    alt=""
                  />
                </a>
              </Card>
            ))}
        </div>
        {this.props.editable ? (
          <div>
            <button
              type="button"
              className="btn btn-info"
              onClick={this.toggleSettings.bind(this)}
            >
              <i className="ion ion-md-cog" />
            </button>
            {this.state.showSettings ? (
              <div className="mt-2">
                <div className="col-sm-6 pl-0">
                  <Select
                    label="Max Width"
                    value={this.props.data.settings.maxWidth}
                    valueHandler={this.getPageBlockSettingsValueHandler(
                      'maxWidth'
                    )}
                  >
                    <option>100%</option>
                    <option>50%</option>
                    <option>33%</option>
                    <option>25%</option>
                  </Select>
                </div>
                <Checkbox
                  label="Automatically collapse columns for smaller screens"
                  checked={this.props.data.settings.autoCollapseColumns}
                  valueHandler={this.getPageBlockSettingsValueHandler(
                    'autoCollapseColumns'
                  )}
                />
                <Checkbox
                  label="Center/Justify"
                  checked={this.props.data.settings.center}
                  valueHandler={this.getPageBlockSettingsValueHandler('center')}
                />
                <Checkbox
                  label="Show Container"
                  checked={this.props.data.settings.showContainer}
                  valueHandler={this.getPageBlockSettingsValueHandler(
                    'showContainer'
                  )}
                />
                <Checkbox
                  label="Push to Zoom"
                  checked={this.props.data.settings.pushToZoom}
                  valueHandler={this.getPageBlockSettingsValueHandler(
                    'pushToZoom'
                  )}
                />
              </div>
            ) : (
              <div />
            )}
            <div className="btn-group pt-1">
              <button
                type="button"
                className="btn btn-info d-block"
                onClick={() => {
                  this.photosInput.current.click()
                }}
                disabled={this.state.uploading}
              >
                Add Images
                {this.state.uploading ? (
                  <span>
                    <span> </span>
                    <i className="icon ion-md-hourglass spinner" />
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
            className={`animated zoom${
              this.state.modalAnimationDirection
            } faster`}
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
                alt=""
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

export default PageBlockImages
