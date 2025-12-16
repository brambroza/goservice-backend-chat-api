FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json tsconfig*.json ./
RUN npm install
COPY src ./src
RUN npm run build || npm run build --if-present

FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 8082
CMD ["node", "dist/server.js"]
