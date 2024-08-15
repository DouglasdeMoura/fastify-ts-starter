FROM node:20-bookworm-slim AS base

FROM base AS productiondeps

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --include=prod

FROM base AS developmentdeps

WORKDIR /app

COPY --from=productiondeps /app/package*.json ./
RUN npm ci --include=dev

FROM base AS builder

WORKDIR /app

COPY --from=productiondeps /app/node_modules ./node_modules
COPY --from=developmentdeps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM gcr.io/distroless/nodejs20-debian12 AS release

WORKDIR /app

COPY --from=builder /app/dist .
COPY --from=productiondeps /app/package*.json ./
COPY --from=productiondeps /app/node_modules ./node_modules

ARG PORT

ENV NODE_ENV=production
ENV PORT=$PORT

EXPOSE $PORT

HEALTHCHECK --interval=15s --timeout=15s --start-period=30s \
  CMD node config/healthcheck.js

CMD [ "index.js" ]
