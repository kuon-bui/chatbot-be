FROM node:25-alpine AS base

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

FROM base AS dev

CMD ["yarn", "start:dev"]

FROM base AS builder
COPY . .
RUN yarn build



FROM node:25-alpine AS runner
WORKDIR /app  
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
RUN yarn install --production --frozen-lockfile
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/main.js"]

EXPOSE 3000

ENV NODE_ENV=production

ENV PORT=3000
