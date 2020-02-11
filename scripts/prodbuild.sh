#!/bin/sh

RED='\033[1;33m'

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

build() {
  echo "Building production ready container image: ${PACKAGE_NAME}:${PACKAGE_VERSION}";
  docker build \
    --rm \
    -t $PACKAGE_NAME:$PACKAGE_VERSION \
    -f docker/api.dockerfile .
  echo "\n${RED}Make sure to set your environment variables on your container/instance!!\n";
}

build;