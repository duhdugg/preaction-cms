const socketIo = require('socket.io')
const exp = { io: null }
exp.setHttp = (http) => {
  exp.io = socketIo(http)
  exp.io.on('connection', (socket) => {
    socket.on('save', (data, fn) => {
      if (fn) {
        fn()
      }
      if (socket.conn.request.session.admin) {
        exp.io.emit('load', data)
      }
    })
    socket.on('force-reload', (fn) => {
      if (fn) {
        fn()
      }
      if (socket.conn.request.session.admin) {
        exp.io.emit('reload-app')
      }
    })
  })
}
module.exports = exp
