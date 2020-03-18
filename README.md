## Preaction CMS

Preaction CMS is a CMS intended to be super cool and user friendly.

### Current State

Development is active. Documentation needs improvement. There is no backwards-compatibility guarantee. There are certainly bugs. The UI needs some serious triage. Pull requests welcome!

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

### Features

- [x] authentication
  - [x] user+pw login, bcrypted
  - [ ] email+pw login, bcrypted, registered, verified, self-service, reset
- [x] automatic reload on updates
  - [x] reload page data with updates
  - [ ] reload only specific block with updates
- [x] automatic saving of updates
- [x] block types
  - [x] content
  - [ ] iframe
  - [x] navigation
- [x] editable page footers
- [x] editable page headers
- [x] image block controls
  - [x] add image
  - [x] delete image
  - [x] move image
- [x] page management
  - [x] create page
  - [x] delete blocks
  - [x] delete page
  - [x] rearrange blocks
  - [x] rename page
  - [x] view page
- [x] page settings
  - [x] override parent settings
  - [x] css overrides inherit from parent
- [x] redirects
  - [x] create redirect
  - [x] update redirect
  - [x] delete redirect
  - [x] handle redirect
- [x] site settings management
  - [x] site name setting
  - [x] analytics
- [x] style settings
  - [x] background color
  - [x] background image
  - [x] background image tile
  - [x] border color
  - [x] border opacity
  - [x] container color
  - [x] container header theme
  - [x] container opacity
  - [x] CSS overrides
  - [x] favicon image
  - [x] link color
  - [x] navigation type
  - [x] show footer
  - [x] show header
  - [x] text color
  - [ ] uncontained link color
  - [ ] uncontained text color
  - [ ] submenu item background color
  - [ ] font families
  - [ ] font scaling
- [ ] extension API
- [ ] user documentation
- [ ] developer documentation
