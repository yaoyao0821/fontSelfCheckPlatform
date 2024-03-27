#!/bin/bash
#Used to set the version so it can be used in the docker image tag
export VERSION=$(npm run --silent version:display)
echo $VERSION