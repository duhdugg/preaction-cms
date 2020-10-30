#!/bin/bash

files=$(node scripts/list-unused-uploads.js)
if test "$files"; then
  for file in $files; do
    rm "$file"
  done
fi
