# -----------------------------------------------------
# 1) Build Frontend (Angular)
# -----------------------------------------------------
FROM node:22-alpine AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY frontend ./frontend
RUN cd frontend && npm run build -- --project frontend

# -----------------------------------------------------
# 2) Build Backend (NestJS)
# -----------------------------------------------------
FROM node:22-alpine AS backend-build
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm install
COPY backend ./backend
RUN cd backend && npm run build

# -----------------------------------------------------
# 3) Final Runtime Container
# -----------------------------------------------------
FROM node:22-alpine AS production
WORKDIR /app

COPY --from=backend-build /app/backend/dist ./dist
COPY --from=backend-build /app/backend/node_modules ./node_modules

COPY --from=frontend-build /app/frontend/dist/frontend ./dist/frontend/browser

ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "dist/main.js"]
