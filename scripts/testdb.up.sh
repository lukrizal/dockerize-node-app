#!/bin/sh

containerReset() {
  docker stop $DB_CONTAINER_NAME &> /dev/null && docker rm $DB_CONTAINER_NAME &> /dev/null
}

containerRun() {
  docker run -d --name $DB_CONTAINER_NAME \
    -p 127.0.0.1:$DB_PORT:27017/tcp \
    -e MONGO_INITDB_ROOT_USERNAME=$MONGO_USERNAME \
    -e MONGO_INITDB_ROOT_PASSWORD=$MONGO_PASSWORD \
    mongo
  docker ps -f name=$DB_CONTAINER_NAME
}

source ./scripts/load-env.sh
sleep 1s;
containerReset;
echo "Running container ${DB_CONTAINER_NAME}" && containerRun;
source ./scripts/wait-for 127.0.0.1:$DB_PORT -- echo "Database is up!"