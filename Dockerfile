ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-bookworm-slim AS base

WORKDIR /app

FROM base AS dependencies

COPY package.json package-lock.json* ./
RUN npm ci --include=prod

FROM base AS builder

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM gcr.io/distroless/nodejs${NODE_VERSION}-debian12 AS release

WORKDIR /app

COPY --from=builder /app/dist .
COPY --from=dependencies /app/package*.json ./
COPY --from=dependencies /app/node_modules ./node_modules

ARG PORT

ENV NODE_ENV=production
ENV PORT=$PORT

EXPOSE $PORT

HEALTHCHECK --interval=15s --timeout=15s --start-period=30s \
  CMD node config/healthcheck.js

CMD [ "index.js" ]
