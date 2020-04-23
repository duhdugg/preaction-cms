export default (url) => {
  return new RegExp('(?:^[a-z][a-z0-9+.-]*:|//)', 'i').test(url)
}
