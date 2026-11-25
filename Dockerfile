FROM node:22-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html tsconfig.json vite.config.ts ./
COPY src ./src
COPY public ./public
RUN npm run build

FROM golang:1.27-alpine AS backend
WORKDIR /src
COPY go.mod ./
COPY server ./server
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/habit-garden ./server

FROM scratch
WORKDIR /app
COPY --from=backend /out/habit-garden ./habit-garden
COPY --from=frontend /app/dist ./dist
EXPOSE 8080
ENTRYPOINT ["/app/habit-garden"]
