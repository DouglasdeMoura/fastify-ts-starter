FROM node:16.14-alpine

WORKDIR /fastify-ts-starter

COPY . .

RUN npm install

CMD ["npm", "start"]
