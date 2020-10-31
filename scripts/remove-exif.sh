#!/bin/bash

if $(which exiftool); then
  exiftool -overwrite_original -all= $1
fi
