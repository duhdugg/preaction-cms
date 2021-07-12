const ssr = typeof window === 'undefined'
if (!ssr) {
  require('bootstrap/dist/css/bootstrap.min.css')
  require('react-quill/dist/quill.bubble.css')
  require('react-quill/dist/quill.snow.css')
  require('@preaction/bootstrap-clips/dist/preaction-bootstrap-clips.css')
}
