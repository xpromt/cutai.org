# syntax=docker/dockerfile:1
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json ./
COPY apps/api/package.json apps/api/
COPY packages/slop-rules/package.json packages/slop-rules/
RUN npm install --workspaces --no-audit --no-fund

# Copy source
COPY . .
RUN npm run build --workspaces --if-present

# Prisma generate
RUN cd apps/api && npx prisma generate

FROM node:20-alpine AS runner
WORKDIR /app

# Copy built artifacts
COPY --from=builder /app/package.json ./
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/node_modules/.prisma ./apps/api/node_modules/.prisma
COPY --from=builder /app/packages/slop-rules/package.json ./packages/slop-rules/
COPY --from=builder /app/packages/slop-rules/dist ./packages/slop-rules/dist
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Install production deps in api
RUN cd apps/api && npm install --omit=dev --no-audit --no-fund

EXPOSE 3002

# Default command (override in docker-compose for worker)
CMD ["node", "apps/api/dist/server.js"]
