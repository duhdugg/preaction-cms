import axios from 'axios'
import PropTypes from 'prop-types'
import React from 'react'
import { Spinner } from '@preaction/bootstrap-clips'
import { Textarea, Wysiwyg } from '@preaction/inputs'
import env from './lib/env.js'
import wysiwygToolbar from './lib/wysiwygToolbar.js'

const test = env.NODE_ENV === 'test'

function PageBlockWysiwyg(props) {
  const theme = props.editable ? props.theme : 'bubble'
  const [wysiwygValue, setWysiwygValue] = React.useState(
    props.content.wysiwyg || ''
  )
  const [savingState, setSavingState] = React.useState(false)
  const { emitSave } = props
  const handleWysiwyg = React.useCallback(
    (value) => {
      const dirtyEnough = (pval, nval) => {
        // quill will make some iconsequential formatting adjustments to html,
        // which causes the PUT request to fire unnecessarily.
        // workaround this by assuming some replacements made and comparing length
        pval = pval.replace(/<br \/>/g, '<br>')
        return pval.length !== nval.length
      }
      if (dirtyEnough(wysiwygValue, value)) {
        setWysiwygValue(value)
        if (props.editable) {
          setSavingState(true)
        }
        globalThis.clearTimeout(timer.current)
        timer.current = globalThis.setTimeout(() => {
          if (props.editable) {
            axios
              .put(
                `${props.appRoot}/api/page/blocks/content/${props.content.id}?token=${props.token}`,
                {
                  wysiwyg: value,
                }
              )
              .then(() => {
                setSavingState(false)
                emitSave({
                  action: 'update-content',
                  contentId: props.content.id,
                  blockId: props.block.id,
                  pageId: props.block.pageId,
                })
              })
          }
        }, 1000)
      }
    },
    [
      props.appRoot,
      props.editable,
      props.token,
      wysiwygValue,
      emitSave,
      props.block,
      props.content,
    ]
  )
  const timer = React.useRef()
  return (
    <div className='page-block-content-type-wysiwyg'>
      {props.editable && props.sourceMode ? (
        <Textarea
          value={wysiwygValue}
          valueHandler={handleWysiwyg}
          readOnly={!props.editable}
        />
      ) : (
        <Wysiwyg
          // allowDangerousFallback as the value was sanitized by server,
          // but the error message is preferred if component fails when editing
          allowDangerousFallback={!props.editable || test}
          fallbackMode={!props.editable || test}
          loadableFallback={<Spinner />}
          theme={theme}
          toolbar={wysiwygToolbar}
          value={wysiwygValue}
          valueHandler={handleWysiwyg}
          readOnly={!props.editable}
        />
      )}
      {savingState ? (
        <div
          style={{
            position: 'relative',
          }}
        >
          <div
            style={{
              fontSize: '0.8em',
              fontStyle: 'italic',
              position: 'absolute',
              top: '-1.25em',
              width: '100%',
              textAlign: 'right',
            }}
          >
            saving...
          </div>
        </div>
      ) : (
        ''
      )}
    </div>
  )
}

PageBlockWysiwyg.propTypes = {
  appRoot: PropTypes.string.isRequired,
  block: PropTypes.object.isRequired,
  content: PropTypes.object.isRequired,
  emitSave: PropTypes.func.isRequired,
  editable: PropTypes.bool,
  sourceMode: PropTypes.bool,
  theme: PropTypes.string.isRequired,
  token: PropTypes.string,
}

export default PageBlockWysiwyg
