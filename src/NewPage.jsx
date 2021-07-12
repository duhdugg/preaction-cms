import PropTypes from 'prop-types'
import React from 'react'
import { Form, Input } from '@preaction/inputs'

function NewPageForm(props) {
  return (
    <Form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        if (e.target.checkValidity()) {
          props.submit()
        }
      }}
    >
      <Input
        type='text'
        label='Page Title'
        labelFloat
        value={props.newPage.title}
        valueHandler={props.getValueHandler('title')}
        required
      />
      <Input
        type='text'
        label='URL Path'
        labelFloat
        value={props.newPage.key}
        valueHandler={props.getValueHandler('key')}
        required
      />
      {props.newPage.key ? (
        <Input
          type='text'
          label='Full Path'
          labelFloat
          value={`${props.activePathname.replace(/^\/home\//, '/')}${
            props.newPage.key
          }/`}
          readOnly
        />
      ) : (
        ''
      )}
      <button type='submit' className='btn btn-default d-none'>
        Submit
      </button>
    </Form>
  )
}

NewPageForm.propTypes = {
  activePathname: PropTypes.string.isRequired,
  getValueHandler: PropTypes.func.isRequired,
  newPage: PropTypes.object.isRequired,
  submit: PropTypes.func.isRequired,
}

export default NewPageForm
