# GRACE AI Backend — production image (MongoDB Atlas via MONGODB_URI)
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

RUN addgroup -g 1001 -S nodejs && adduser -S grace -u 1001 -G nodejs
USER grace

EXPOSE 5000

CMD ["node", "dist/server.js"]
