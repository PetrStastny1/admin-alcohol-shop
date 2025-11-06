# ------------------------------
# 1) Build Angular frontend
# ------------------------------
FROM node:18 AS frontend-build

WORKDIR /app

COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

COPY frontend ./frontend
RUN cd frontend && npm run build --configuration production

# ------------------------------
# 2) Build NestJS backend
# ------------------------------
FROM node:18 AS backend-build

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm install

COPY backend ./backend
RUN cd backend && npm run build

# Copy Angular build into NestJS dist
RUN mkdir -p /app/backend/dist/frontend
COPY --from=frontend-build /app/frontend/dist/frontend /app/backend/dist/frontend

# ------------------------------
# 3) Final production image
# ------------------------------
FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm install --omit=dev

COPY --from=backend-build /app/backend/dist ./dist

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/main.js"]
