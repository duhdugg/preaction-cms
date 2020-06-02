#!/bin/bash

read -sp "Password: " adminpw
node -e "require('./lib/session.js').updateAdminPassword('$adminpw').then(() => {})"
echo ""
echo "--- password set! ---"
echo "password: $adminpw"
echo "see README.md to change"
echo "---"
