import PropTypes from 'prop-types'
import React from 'react'

class PageBlockContent extends React.Component {}

PageBlockContent.propTypes = {
  data: PropTypes.object.isRequired,
  emitSave: PropTypes.func.isRequired,
  editable: PropTypes.bool,
  getPageBlockSettingsValueHandler: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired
}

export default PageBlockContent
