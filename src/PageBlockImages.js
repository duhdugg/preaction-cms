import React from 'react'

class PageBlockImages extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      uploading: false,
      uploads: [],
      viewUpload: undefined
    }
    this.uploadForm = React.createRef()
    this.photosInput = React.createRef()
  }

  render () {
    return (
      <div className="page-block-images">
        {this.props.authenticated ? (
          <div>
            <form
              method="POST"
              action="/api/upload"
              encType="multipart/form-data"
              ref={this.uploadForm}
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
              <div className="form-group">
                <button
                  type="button"
                  className="btn btn-success d-block ml-auto mr-auto"
                  onClick={() => {
                    this.photosInput.current.click()
                  }}
                  disabled={this.state.uploading}
                >
                  Add Pictures
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
            </form>
          </div>
        ) : (
          ''
        )}
      </div>
    )
  }
}

export default PageBlockImages
