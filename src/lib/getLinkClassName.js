const getLinkClassName = (theme) => {
  let retval = ''
  switch (theme) {
    case 'blue':
    case 'danger':
    case 'dark':
    case 'gray':
    case 'gray-dark':
    case 'green':
    case 'indigo':
    case 'orange':
    case 'pink':
    case 'primary':
    case 'purple':
    case 'red':
    case 'secondary':
    case 'success':
      retval = 'pxn-theme-light-links'
      break
    case 'cyan':
    case 'info':
    case 'teal':
    case 'warning':
    case 'yellow':
      retval = 'pxn-theme-dark-links'
      break
    case 'light':
    case 'white':
      retval = 'pxn-theme-blue-links'
      break
    default:
      break
  }
  return retval
}

export default getLinkClassName
