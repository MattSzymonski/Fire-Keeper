#!/bin/sh

if [ "$NODE_ENV" = "production" ]; then
  echo "Starting backend (serving frontend)..."
  node backend/dist/server.js
else
  echo "Starting frontend and backend in dev mode..."
  npm --prefix frontend run dev -- --host &
  npm --prefix backend run dev &
  wait
fi