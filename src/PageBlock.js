import React from 'react'
import PageBlockWysiwyg from './PageBlockWysiwyg.js'

class PageBlock extends React.Component {
  render () {
    return (
      <div className="page-block">
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
            {this.props.editable ? (
              <div className="pageblock-buttons">
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    this.props.deletePageBlock(this.props.data)
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
