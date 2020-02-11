#!/bin/sh

ENV_PATH=./envs/${NODE_ENV}.env

if [ -f $ENV_PATH ]
then
  export $(cat $ENV_PATH | sed 's/#.*//g' | xargs);
  echo "Loading env variables in ${ENV_PATH}";
  sleep 1s;
else
  echo "Missing ${ENV_PATH}"
fi