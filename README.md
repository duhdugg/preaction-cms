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

### Features

- [x] authentication
  - [x] user+pw login, bcrypted
  - [ ] email+pw login, bcrypted, registered, verified, self-service, reset
- [x] automatic reload on updates
  - [x] reload page data with updates
  - [ ] reload only specific block with updates
- [x] automatic saving of updates
- [x] block types
  - [ ] bio (photo, name, subtitle, description)
  - [x] contained wysiwyg
  - [ ] embedded frame
  - [x] images
  - [ ] panel
  - [ ] social links
  - [ ] storefront info (address, phone, hours)
  - [ ] uncontained wysiwyg
  - [ ] youtube
- [x] editable page footers
- [x] editable page headers
- [x] image block controls
  - [x] add image
  - [x] delete image
  - [x] move image
- [x] image block settings
  - [x] center/justify
  - [x] collapse columns responsively
  - [x] push to zoom
  - [x] show container
  - [x] width percentage
- [ ] wysiwyg block settings
  - [ ] show container
  - [ ] show timestamp
- [x] page management
  - [x] create page
  - [x] delete blocks
  - [x] delete page
  - [x] rearrange blocks
  - [x] rename page
  - [x] view page
- [x] module types
  - [x] page
  - [x] subpage
- [x] page settings
  - [x] show footer
  - [x] show header
- [x] redirects
  - [x] create redirect
  - [x] update redirect
  - [x] delete redirect
  - [x] handle redirect
- [x] site settings management
  - [x] site name setting
  - [ ] analytics
- [x] style settings
  - [x] background color
  - [x] background image
  - [x] background image tile
  - [x] container color
  - [x] container opacity
  - [x] favicon image
  - [x] link color
  - [x] navigation type
  - [x] text color
  - [ ] uncontained link color
  - [ ] uncontained text color
  - [ ] submenu item background color
  - [ ] font families
  - [ ] font scaling
  - [x] CSS overrides
- [ ] extension API
- [ ] user documentation
- [ ] developer documentation
