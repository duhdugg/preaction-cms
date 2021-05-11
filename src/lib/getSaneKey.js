function getSaneKey(str) {
  return str.toLowerCase().replace(/[^A-z0-9]/gi, '-')
}
export default getSaneKey
