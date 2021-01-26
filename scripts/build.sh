#!/bin/bash

PUBLIC_URL=/cms yarn init-client && yarn build-csr && yarn build-ssr && yarn build-meta
