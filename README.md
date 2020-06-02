## Preaction CMS

Preaction CMS is a barebones, customizeable CMS built on top of simple libraries.

### Running

clone the repo:

`git clone https://github.com/duhdugg/preaction-cms.git`

install dependencies:

`yarn`

build the client:

`yarn build`

run the server:

`yarn start`

### Scripts

#### For Admins

copy the data/db.sqlite database to a timestamped and hashed file in the data/backups directory:

`yarn backup-db`

delete all sessions from the database:

`yarn clear-sessions`

generate a new randomly-generated password for the admin user:

`yarn randomize-password`

set password by prompt:

`yarn set-password`

the above will also accept whatever is piped into it, so this example is one way to generate and set a random password that is 8,192 alphanumeric characters in length:

`dd if=/dev/urandom | strings -e s | sed 's/[^a-za-z0-9]//g' | tr -d '\n' | dd count=1 bs=8192 2> /dev/null | yarn set-password`

create a gzipped tarball named preaction-cms.tar.gz containing data/db.sqlite, the build directory, and any db-referenced files in the uploads directory:

`yarn package`

### Environment Variables

`PREACTION_COOKIE_SAMESITE=strict` sets cookies to samesite strict

`PREACTION_COOKIE_SECURE=1` sets cookies to require https

`PREACTION_DB_BACKUP=1` enables automatic backup of Sqlite database

`PREACTION_DB_LOGGING=1` enables logging from Sequelize ORM

`PREACTION_PROXY=1` trust the X-Forwarded-Proto header

`PREACTION_READONLY=1` disables all admin-required middleware

`PREACTION_PATH=/preaction` sets root URL for running behind nginx subdirectory

`PREACTION_PORT=8080` configures the port to listen on

`PREACTION_SOCKET_MODE=1` enables socket.io-enabled features (alpha)

### Development

run the server with automatic reloading of server-side code:

`yarn dev-server`

apply prettier requirements to source:

`yarn makeover`

run tests:

`yarn test`

run server with nodejs inspection:

`yarn start-inspect`

run server with nodejs profiling:

`yarn start-profile`

start the react development server for automatic client-side code reloading:

`yarn dev-client`
