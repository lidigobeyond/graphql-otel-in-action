FROM node:20-alpine as builder

WORKDIR /app

COPY package.json package-lock.json tsconfig.json tsconfig.build.json ./

COPY nest-cli.json instrumentation.ts ./

COPY src ./src

RUN npm ci

RUN npm run build

FROM node:20-alpine as runner

WORKDIR /app

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

CMD npm run start:prod
