FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache bash curl procps git iproute2

COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts || true

COPY . .

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=450"
ENV PORT=3000
ENV MEMORY_MAX="650M"

EXPOSE 3000 6379

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
