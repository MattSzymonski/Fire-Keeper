FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/
RUN cd frontend && npm install
RUN cd backend && npm install

# Copy the source code
COPY frontend ./frontend
COPY backend ./backend

RUN apk add --no-cache docker-cli

# Expose frontend and backend ports
EXPOSE 5173 3001

# Run based on NODE_ENV
COPY entrypoint.sh /app/entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]