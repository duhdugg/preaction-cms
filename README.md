## Preaction CMS

Preaction CMS is a barebones, customizeable CMS built on top of simple libraries.

### Running

clone the repo:

`git clone https://gitlab.com/dougelkin/preaction-cms.git`

install dependencies:

`yarn`

build the client:

`yarn build`

run the server:

`yarn start`

change the admin password:

`node`

```
const updateAdminPassword = require('./lib/session').updateAdminPassword
updateAdminPassword('newpass')
```

### Environment Variables

`PREACTION_DB_LOGGING=1` enables logging from Sequelize ORM
`PREACTION_PATH=/preaction` sets root URL for running behind nginx subdirectory
`PREACTION_PORT=8080` configures the port to listen on
`PREACTION_SOCKET_MODE=1` enables socket features (automatic reload)
