#!/bin/bash
# mongo/bin must be in path
BASE_DIR=`dirname $0`

echo "Loading users..."
mongoimport -h localhost --port 27017 -d scratchminder -c users --drop --jsonArray --stopOnError --file $BASE_DIR/../tests/seed/users.json

echo "Loading tokens..."
mongoimport -h localhost --port 27017 -d scratchminder -c tokens --drop --jsonArray --stopOnError --file $BASE_DIR/../tests/seed/tokens.json
