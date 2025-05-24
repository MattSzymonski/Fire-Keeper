#!/bin/sh

if [ "$NODE_ENV" = "production" ]; then
  npm --prefix frontend run build
  npm --prefix backend run build
  node backend/dist/server.js
else
  npm --prefix frontend run dev -- --host &
  npm --prefix backend run dev &
  wait
fi
