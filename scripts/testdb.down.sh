#!/bin/sh

containerReset() {
  docker stop $DB_CONTAINER_NAME &> /dev/null && docker rm $DB_CONTAINER_NAME &> /dev/null
}

source ./scripts/load-env.sh
sleep 1s;
echo "Stopping and removing ${DB_CONTAINER_NAME}" && containerReset