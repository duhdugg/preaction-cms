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
              />
            ) : (
              ''
            )}
            {this.props.data.blockType === 'image' ? (
              <PageBlockImages
                data={this.props.data}
                editable={this.props.editable}
                siteSettings={this.props.siteSettings}
                refreshBlock={this.props.refreshBlock}
                galleryControl={this.props.galleryControl}
                getImages={this.props.getImages}
              />
            ) : (
              ''
            )}
            {this.props.editable ? (
              <div className="page-block-buttons">
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    this.props.deleteBlock(this.props.data)
                  }}
                >
                  <i className="ion ion-md-trash" />
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
