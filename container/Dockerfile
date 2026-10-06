# Build from the REPO ROOT so the image can reuse backend/src files:
#   docker build -f container/Dockerfile -t crc-api:dev .
FROM node:22-alpine

# Production mode: fewer debug features, libraries behave as in real life.
ENV NODE_ENV=production
WORKDIR /app

# 1. Dependencies first. This layer only rebuilds when package*.json changes,
#    so most builds reuse it from cache (fast).
COPY container/package.json container/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# 2. Then the code. The shared files keep the same relative paths they have in the repo,
#    so `require('../../backend/src/visitor')` works both locally and in the image.
COPY backend/src/visitor.js backend/src/events.js backend/src/tables.js ./backend/src/
COPY container/src ./container/src

# 3. Don't run as root: if the app is ever compromised, the attacker is not an admin.
USER node

# Documentation only: the app listens on PORT (default 8080).
EXPOSE 8080
CMD ["node", "container/src/server.js"]
