# ---------- Stage 1: deps (reproducible npm ci)
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ---------- Stage 2: builder (TS -> JS)
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# your build already writes dist/package.json via tools/prepare-function-package.js
RUN npm run build

# ---------- Stage 3: dev (hot reload)
FROM node:20-alpine AS dev
WORKDIR /app
ENV NODE_ENV=development \
    PORT=3000
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000 9229
CMD ["npm", "run", "start:dev"]
