FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json nx.json tsconfig.base.json ./
COPY apps ./apps
COPY libs ./libs
COPY prisma ./prisma

RUN npm ci
RUN npx prisma generate
RUN npx nx build api --configuration=production

FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV API_PORT=4000

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/api ./dist/apps/api
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000

CMD ["node", "dist/apps/api/main.js"]
