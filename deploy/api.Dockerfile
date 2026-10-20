FROM node:22-bookworm-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /repo
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile --filter @travelos/api... --filter @travelos/shared
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN pnpm --filter @travelos/shared build \
 && pnpm --filter @travelos/api prisma:generate \
 && pnpm --filter @travelos/api build

FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable
ENV NODE_ENV=production
WORKDIR /repo
COPY --from=build /repo /repo
WORKDIR /repo/apps/api
USER node
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && if [ \"$PILOT_SEED\" = \"true\" ]; then npx tsx prisma/seed.ts; fi && node dist/src/main.js"]
