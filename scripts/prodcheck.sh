#!/bin/sh

GREEN='\033[0;32m'
NC='\033[0m'

# Setting env to test since we are just testing the production image
export NODE_ENV=test

# Version key/value should be on his own line
PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

# Version key/value should be on his own line
PACKAGE_NAME=$(cat package.json \
  | grep name \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g')

startTestDb() {
  bash ./scripts/testdb.up.sh
}

stopTestDb() {
  source ./scripts/testdb.down.sh
}

loadEnv() {
  source ./scripts/load-env.sh
}

stopContainer() {
  echo "Stopping and removing container ${PACKAGE_NAME}:${PACKAGE_VERSION}..";
  docker stop $PACKAGE_NAME-prodcheck &> /dev/null;
  docker rm $PACKAGE_NAME-prodcheck &> /dev/null;
  echo "Stopped and removed.";
}

startContainer() {
  echo "Running a container instance using image ${PACKAGE_NAME}:${PACKAGE_VERSION}";
  # will be updating the MONGODB_URI since we are using test db instance for this
  docker stop $PACKAGE_NAME-prodcheck &> /dev/null;
  docker rm $PACKAGE_NAME-prodcheck &> /dev/null;
  loadEnv; # load test env to get DB_CONTAINER_NAME variable
  docker run \
    --link $DB_CONTAINER_NAME:db \
    -p 127.0.0.1:80:$APP_PORT/tcp \
    --env-file envs/test.env \
    --env MONGODB_URI=mongodb://$MONGO_USERNAME:$MONGO_PASSWORD@db:27017/sidechatter?authSource=admin \
    --env NODE_ENV=local \
    --name $PACKAGE_NAME-prodcheck \
    --detach \
    $PACKAGE_NAME:$PACKAGE_VERSION
  docker ps -f name=$PACKAGE_NAME-prodcheck;
}

check() {
  echo "Checking online state on host 127.0.0.1 at port 80";
  bash ./scripts/wait-for 127.0.0.1:80 -- echo ""
  echo "${GREEN}Instance is responding!${NC}"
}

startTestDb;
startContainer;
sleep 1s;
check;
sleep 1s;
# stopContainer;
# stopTestDb;