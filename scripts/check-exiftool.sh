#!/bin/bash

exiftoolpath=$(which exiftool)

if $(test "$exiftoolpath")
then
  echo ''
  echo "exiftool binary: $exiftoolpath"
else
  echo ''
  echo 'WARNING: exiftool command not installed.'
  echo 'EXIF data will not be removed from images upon upload.'
fi
