FROM node:20

WORKDIR /app

COPY package.json package-lock.json tsconfig.json  ./

COPY src ./src

COPY prisma ./prisma

RUN npm ci

RUN npx prisma generate --schema ./prisma/schema.prisma

CMD npm run start:dev