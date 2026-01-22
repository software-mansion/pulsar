#!/bin/bash

npm run dev &
DOCS_PID=$!

# Start the main server
cd ./server

npm run watch &
TSC_PID=$!

npx nodemon &
SERVER_PID=$!

echo "Starting Pulsar docs and server..."
echo "Docs PID: $DOCS_PID"
echo "Server PID: $SERVER_PID"
echo "TSC Watch PID: $SERVER_PID"

# Cleanup function
cleanup() {
  echo "Stopping servers..."
  kill $DOCS_PID $SERVER_PID TSC_PID
  exit 0
}

trap cleanup SIGINT

wait