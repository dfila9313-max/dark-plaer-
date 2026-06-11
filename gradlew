#!/bin/sh
GRADLE_OPTS="${GRADLE_OPTS:-"-Xmx2g -Xms512m"}"
exec gradle "$@"
