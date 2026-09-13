# Dockerfile for Go Backend
# ------------------------------------------------------------------------------
# Multi-stage build:
# Stage 1: Build binary ด้วย golang
# Stage 2: รัน binary ด้วย alpine ขนาดเล็ก
# ------------------------------------------------------------------------------

# Stage 1: Build binary
FROM golang:1.26-alpine AS builder

WORKDIR /app

# ติดตั้ง git และ build-base เผื่อ dependencies
RUN apk add --no-cache git

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/server ./cmd/main.go

# Stage 2: Run binary
FROM alpine:3.20

WORKDIR /app

# ติดตั้ง tzdata สำหรับ timezone Asia/Bangkok และ ca-certificates
RUN apk add --no-cache tzdata ca-certificates && \
    cp /usr/share/zoneinfo/Asia/Bangkok /etc/localtime && \
    echo "Asia/Bangkok" > /etc/timezone

COPY --from=builder /app/server /app/server
COPY .env.example /app/.env.example

EXPOSE 4000

CMD ["/app/server"]
