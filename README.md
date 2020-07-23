## Preaction CMS

Preaction CMS is a barebones, developer-friendly Content Management System built on top of simple JavaScript libraries.

### Running

clone the repo:

`git clone https://github.com/duhdugg/preaction-cms.git`

install dependencies:

`yarn`

build the client:

`yarn build`

run the server:

`yarn start`

### Administrative Scripts

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

`PREACTION_COOKIE_SECRET=secret` sets the cookie signing secret string

`PREACTION_COOKIE_SECURE=1` sets cookies to require https

`PREACTION_DB_BACKUP=1` enables automatic backup of Sqlite database

`PREACTION_DB_LOGGING=1` enables logging from Sequelize ORM

`PREACTION_PROXY=1` trust the X-Forwarded-Proto header

`PREACTION_READONLY=1` force admin-required and csrf-protected middleware to return HTTP 403

`PREACTION_ROOT=/preaction` sets root URL for running behind nginx subpath

`PREACTION_PORT=8080` configures the port to listen on

`PREACTION_SESSION_COOKIE_NAME=session` sets the name of the session cookie

`PREACTION_SOCKET_MODE=1` enables socket.io-enabled features (alpha)

`PREACTION_SITEMAP_HOSTNAME=http://example.com` enables the /sitemap.xml path and configures the protocol and hostname

### Development Scripts

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

### Nginx Example Configurations

These location blocks are what you need to run Preaction CMS on a production server behind an Nginx reverse proxy.
This example assumes that Preaction CMS is running on the default port of 8999 and has been cloned to the path: `/var/www/preaction-cms`

The first block tells Nginx to pass requests to the application.
The second and third blocks are necessary to serve static and uploaded files via Nginx, which performs better than ExpressJS static middleware.

```
location / {
  proxy_pass http://localhost:8999;
  proxy_set_header Host $host;
  proxy_cache_bypass $http_upgrade;
}

location /static {
  rewrite /static/(.*)$ /$1 break;
  proxy_cache_bypass 1;
  root /var/www/preaction-cms/build/static;
}

location /uploads {
  rewrite /uploads/(.*)$ /$1 break;
  proxy_cache_bypass 1;
  root /var/www/preaction-cms/uploads;
}
```

If you need Preaction CMS to run behind a subpath on your server, you should do something such as the following.
This example makes the same assumptions as above, in addition to the `PREACTION_ROOT` environment variable being set to `/example`.
Currently, running Preaction CMS in this way will prevent the site icon from working unless the fourth block is included.

```
location /example {
  rewrite ^/example/(.*)$ /$1 break;
  proxy_pass http://localhost:8999;
  proxy_set_header Host $host;
  proxy_cache_bypass $http_upgrade;
}

location /example/static {
  rewrite /example/static/(.*)$ /$1 break;
  proxy_cache_bypass 1;
  root /var/www/preaction-cms/build/static;
}

location /example/uploads {
  rewrite /example/uploads/(.*)$ /$1 break;
  proxy_cache_bypass 1;
  root /var/www/preaction-cms/uploads;
}

location /icon {
  return 302 /example/icon$is_args$args;
}
```
