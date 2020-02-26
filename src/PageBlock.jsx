import PropTypes from 'prop-types'
import React from 'react'
import PageBlockImages from './PageBlockImages.jsx'
import PageBlockWysiwyg from './PageBlockWysiwyg.jsx'

class PageBlock extends React.Component {
  render() {
    return (
      <div className={`page-block ${this.props.data.blockType}`}>
        {this.props.data ? (
          <div>
            {this.props.data.blockType === 'wysiwyg' ? (
              <PageBlockWysiwyg
                data={this.props.data.pageblockwysiwyg}
                editable={this.props.editable}
                emitSave={this.props.emitSave}
                settings={this.props.settings}
              />
            ) : (
              ''
            )}
            {this.props.data.blockType === 'image' ? (
              <PageBlockImages
                data={this.props.data}
                editable={this.props.editable}
                emitSave={this.props.emitSave}
                settings={this.props.settings}
                blockControl={this.props.blockControl}
                galleryControl={this.props.galleryControl}
                getImages={this.props.getImages}
                getPageBlockSettingsValueHandler={
                  this.props.getPageBlockSettingsValueHandler
                }
              />
            ) : (
              ''
            )}
            {this.props.editable ? (
              <div className='page-block-buttons'>
                <button
                  type='button'
                  className='btn btn-primary btn-sm'
                  disabled={this.props.first}
                  onClick={() => {
                    this.props.blockControl(this.props.data.id, 'previous')
                  }}
                >
                  <i className='ion ion-md-arrow-up' /> move block up
                </button>
                <button
                  type='button'
                  className='btn btn-danger btn-sm'
                  onClick={() => {
                    this.props.blockControl(this.props.data.id, 'delete')
                  }}
                >
                  <i className='ion ion-md-trash' /> delete block
                </button>
                <button
                  type='button'
                  className='btn btn-primary btn-sm'
                  disabled={this.props.last}
                  onClick={() => {
                    this.props.blockControl(this.props.data.id, 'next')
                  }}
                >
                  <i className='ion ion-md-arrow-down' /> move block down
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

PageBlock.propTypes = {
  blockControl: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
  editable: PropTypes.bool,
  emitSave: PropTypes.func.isRequired,
  first: PropTypes.bool,
  galleryControl: PropTypes.func.isRequired,
  getImages: PropTypes.func.isRequired,
  getPageBlockSettingsValueHandler: PropTypes.func.isRequired,
  last: PropTypes.bool,
  settings: PropTypes.object.isRequired
}

export default PageBlock
