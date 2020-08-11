#!/bin/bash

rm preaction-cms.tar.gz && echo 'existing package deleted'
uploads=$(node scripts/list-uploads.js)
tar --exclude-vcs --exclude="src/style/index.template.js" -vcaf preaction-cms.tar.gz build data/db.sqlite src/style $uploads
