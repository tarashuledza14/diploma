FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages/backend/package.json packages/backend/
COPY packages/frontend/package.json packages/frontend/

RUN pnpm install --frozen-lockfile

COPY packages/backend packages/backend
WORKDIR /app/packages/backend
RUN npx prisma generate
RUN pnpm build

FROM node:20-alpine
RUN npm install -g pnpm
WORKDIR /app
COPY --from=builder /app /app
WORKDIR /app/packages/backend
EXPOSE 3000
CMD ["node", "dist/src/main.js"]
