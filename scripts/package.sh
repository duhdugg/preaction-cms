#!/bin/bash

node scripts/clear-sessions.js
rm preaction-cms.tar.gz && echo 'existing package deleted'
uploads=$(node scripts/list-uploads.js)
tar -vcaf preaction-cms.tar.gz build data/db.sqlite $uploads
