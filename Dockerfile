# ---------- Build Stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
RUN cd backend && npm ci
RUN cd frontend && npm ci

# Copy source and build
COPY backend ./backend
COPY frontend ./frontend
RUN cd backend && npm run build
RUN cd frontend && npm run build

# ---------- Runtime Stage ----------
FROM node:20-alpine

WORKDIR /app

# Copy only built files and production dependencies
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/frontend/dist ./frontend/dist

# Reinstall only prod deps (optional)
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
RUN cd backend && npm ci --omit=dev
RUN cd frontend && npm ci --omit=dev

RUN apk add --no-cache docker-cli curl

# Optional: scripts
COPY entrypoint.sh ./entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]
