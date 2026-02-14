FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy root package files
COPY package.json package-lock.json* ./

# Copy shared workspace
COPY packages/shared ./packages/shared
COPY apps/mobile/package.json ./apps/mobile/package.json

# Install dependencies for all workspaces
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
# Copy root config just in case
COPY package.json ./
# Copy mobile source
COPY apps/mobile ./apps/mobile

WORKDIR /app/apps/mobile

# Export the app for web
RUN npx expo export -p web

# Production image, serve the static files
FROM node:18-alpine AS runner
WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/apps/mobile/dist ./dist

EXPOSE 8081

# Serve on port 8081
CMD ["serve", "-s", "dist", "-l", "8081"]
