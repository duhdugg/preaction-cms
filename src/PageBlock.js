import React from 'react'
import PageBlockImages from './PageBlockImages.js'
import PageBlockWysiwyg from './PageBlockWysiwyg.js'

class PageBlock extends React.Component {
  render () {
    return (
      <div className={`page-block ${this.props.data.blockType}`}>
        {this.props.data ? (
          <div>
            {this.props.data.blockType === 'wysiwyg' ? (
              <PageBlockWysiwyg
                data={this.props.data.pageblockwysiwyg}
                editable={this.props.editable}
                siteSettings={this.props.siteSettings}
                socket={this.props.socket}
              />
            ) : (
              ''
            )}
            {this.props.data.blockType === 'image' ? (
              <PageBlockImages
                data={this.props.data}
                editable={this.props.editable}
                siteSettings={this.props.siteSettings}
                blockControl={this.props.blockControl}
                galleryControl={this.props.galleryControl}
                getImages={this.props.getImages}
                getPageBlockSettingsValueHandler={
                  this.props.getPageBlockSettingsValueHandler
                }
                socket={this.props.socket}
              />
            ) : (
              ''
            )}
            {this.props.editable ? (
              <div className="page-block-buttons">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={this.props.first}
                  onClick={() => {
                    this.props.blockControl(this.props.data.id, 'previous')
                  }}
                >
                  <i className="ion ion-md-arrow-up" />
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    this.props.blockControl(this.props.data.id, 'delete')
                  }}
                >
                  <i className="ion ion-md-trash" />
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={this.props.last}
                  onClick={() => {
                    this.props.blockControl(this.props.data.id, 'next')
                  }}
                >
                  <i className="ion ion-md-arrow-down" />
                </button>
              </div>
            ) : (
              ''
            )}
          </div>
        ) : (
          ''
        )}
      </div>
    )
  }
}

export default PageBlock
