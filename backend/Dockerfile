FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

# Install ONLY production dependencies for smaller image
RUN npm ci --only=production
RUN npx prisma generate

# Copy compiled JS
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

# Run migrations before starting
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
