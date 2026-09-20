# syntax=docker/dockerfile:1

# ---------- base: shared tooling ----------
FROM node:24-alpine AS base
# Pull in the latest Alpine security patches at build time, not just
# whatever was baked into the node:24-alpine image when it was published.
RUN apk update && apk upgrade --no-cache \
  && apk add --no-cache libc6-compat openssl
ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH"
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate

# ---------- deps: full install (includes dev deps + prisma CLI) ----------
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---------- prod-deps: production-only install for the runtime image ----------
# Kept separate from the builder so the final image never ships devDependencies
# (they carry HIGH/CRITICAL CVEs that make the Trivy image scan fail).
FROM base AS prod-deps
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN pnpm install --prod --frozen-lockfile \
  && pnpm exec prisma generate

# ---------- builder: generate client + build app ----------
FROM base AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm exec prisma generate
RUN pnpm build

# ---------- runner: slim production image ----------
FROM node:24-alpine AS runner
WORKDIR /app
RUN apk update && apk upgrade --no-cache \
  && apk add --no-cache libc6-compat openssl
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000

# Bundled npm/corepack ship vulnerable tar/ip-address/brace-expansion and are
# not needed at runtime (the entrypoint runs node + the prisma CLI directly).
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
  && rm -f /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack /usr/local/bin/corepackx

# Non-root user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER nextjs
EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]