#!/bin/sh

# Please do not change the OLD_IP variable,
# it ip will be replaced by the NEW_IP when up the docker container with the docker-compose
OLD_IP='127.0.0.1:8080'
NEW_IP=$BACKEND_IP

if [ -z "$NEW_IP" ]; then
  echo "The BACKEND_IP environment variable is required"
  exit 1
fi

find /var/www/app -type f -name '*.js' -exec sed -i "s|$OLD_IP|$NEW_IP|g" {} +

echo "The ip address has been updated to $NEW_IP"
