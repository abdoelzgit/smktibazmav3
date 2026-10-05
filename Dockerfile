# ==========================================
# DEPENDENCIES
# ==========================================
FROM node:20-bookworm-slim AS deps

WORKDIR /app

COPY package.json package-lock.json ./

# Install dependency tanpa menjalankan postinstall script
RUN npm ci --ignore-scripts

# ==========================================
# BUILD
# ==========================================
FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
ENV RAYON_NUM_THREADS=1

# Dummy database URL hanya untuk proses BUILD
ENV DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build

# Generate Prisma Client menggunakan binary di node_modules
RUN node_modules/.bin/prisma generate --schema=prisma/schema.prisma

# Build Next.js
RUN npm run build

# ==========================================
# RUNTIME
# ==========================================
FROM node:20-bookworm-slim AS runner

RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=30000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 30000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:30000').then(r => { if (!r.ok) process.exit(1) }).catch(() => process.exit(1))"

CMD ["node_modules/.bin/next", "start", "-p", "30000"]
