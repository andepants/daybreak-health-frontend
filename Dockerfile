# Dockerfile for Daybreak Health Frontend
# Deploys Next.js standalone build to Aptible

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Copy .aptible.env if it exists (written by Aptible before build)
# These NEXT_PUBLIC_* vars need to be available at build time
COPY .aptible.env* ./

# Source .aptible.env if it exists, then build Next.js
# This makes NEXT_PUBLIC_* variables available during the build
RUN if [ -f .aptible.env ]; then \
      echo "Loading .aptible.env for build..."; \
      export $(grep -v '^#' .aptible.env | xargs); \
    fi && \
    npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
