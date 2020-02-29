import PropTypes from 'prop-types'
import React from 'react'
import { Card } from '@preaction/bootstrap-clips'
import PageBlockWysiwyg from './PageBlockWysiwyg.jsx'

class PageBlockContent extends React.Component {
  render() {
    return (
      <div>
        {this.props
          .getContents(this.props.data.pageblockcontents)
          .map((content, index) => {
            return (
              <div key={content.id}>
                <Card>
                  <PageBlockWysiwyg
                    data={content}
                    emitSave={this.props.emitSave}
                  />
                </Card>
              </div>
            )
          })}
      </div>
    )
  }
}

PageBlockContent.propTypes = {
  data: PropTypes.object.isRequired,
  emitSave: PropTypes.func.isRequired,
  editable: PropTypes.bool,
  contentControl: PropTypes.func.isRequired,
  getContents: PropTypes.func.isRequired,
  getPageBlockSettingsValueHandler: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired
}

export default PageBlockContent
