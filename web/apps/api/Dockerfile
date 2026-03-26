# ═══════════════════════════════════════════════════════
#  Sahayak API — Multi-stage Docker Build
# ═══════════════════════════════════════════════════════

# ── Stage 1: Install dependencies ──────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/db/package.json packages/db/
COPY apps/api/package.json apps/api/

RUN corepack enable pnpm && pnpm install --frozen-lockfile

# ── Stage 2: Build ─────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/db/node_modules ./packages/db/node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules

COPY packages/db packages/db
COPY apps/api apps/api
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

RUN corepack enable pnpm && pnpm turbo build --filter=@sahayak/api

# ── Stage 3: Production runner ─────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

RUN addgroup --system --gid 1001 sahayak && \
    adduser --system --uid 1001 sahayak

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/db ./packages/db

USER sahayak

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

CMD ["node", "dist/server.js"]
