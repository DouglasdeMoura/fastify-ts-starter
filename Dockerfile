ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-bookworm-slim AS base
LABEL maintainer="Douglas Moura <douglas.ademoura@gmail.com>"

WORKDIR /app

FROM base AS dependencies

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

FROM base AS builder

COPY --from=dependencies /app/package*.json /app/package-lock.json* ./
COPY . .
RUN npm ci --include=dev && npm run build

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
