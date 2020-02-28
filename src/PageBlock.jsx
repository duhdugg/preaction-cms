import PropTypes from 'prop-types'
import React from 'react'
import PageBlockImages from './PageBlockImages.jsx'
import PageBlockWysiwyg from './PageBlockWysiwyg.jsx'
import { MdArrowUpward, MdArrowDownward, MdDelete } from 'react-icons/md'

class PageBlock extends React.Component {
  render() {
    return (
      <div className={`page-block ${this.props.data.blockType}`}>
        {this.props.data ? (
          <div>
            {this.props.data.blockType === 'content' ? (
              <PageBlockWysiwyg
                data={this.props.data}
                editable={this.props.editable}
                emitSave={this.props.emitSave}
                getContents={this.props.getContents}
                settings={this.props.settings}
                getPageBlockSettingsValueHandler={
                  this.props.getPageBlockSettingsValueHandler
                }
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
                getContents={this.props.getContents}
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
                  <MdArrowUpward /> move block up
                </button>
                <button
                  type='button'
                  className='btn btn-danger btn-sm'
                  onClick={() => {
                    this.props.blockControl(this.props.data.id, 'delete')
                  }}
                >
                  <MdDelete /> delete block
                </button>
                <button
                  type='button'
                  className='btn btn-primary btn-sm'
                  disabled={this.props.last}
                  onClick={() => {
                    this.props.blockControl(this.props.data.id, 'next')
                  }}
                >
                  <MdArrowDownward /> move block down
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
  getContents: PropTypes.func.isRequired,
  getPageBlockSettingsValueHandler: PropTypes.func.isRequired,
  last: PropTypes.bool,
  settings: PropTypes.object.isRequired
}

export default PageBlock
