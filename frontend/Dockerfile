# Dockerfile (frontend)
# ------------------------------------------------------------------------------
# ใช้ multi-stage build:
#   Stage 1 (build)  -> ใช้ Node.js build React app ให้เป็นไฟล์ static
#   Stage 2 (nginx)  -> เอาเฉพาะไฟล์ static ไปเสิร์ฟด้วย nginx (image เล็กและเร็ว)
# ------------------------------------------------------------------------------

# ---------- Stage 1: Build ----------
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# VITE_API_URL ต้องกำหนดตอน build (Vite inject ค่าตอน build time ไม่ใช่ runtime)
ARG VITE_API_URL=http://localhost:4000/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---------- Stage 2: Serve ----------
FROM nginx:1.27-alpine

# คัดลอกไฟล์ static ที่ build เสร็จแล้วไปไว้ในโฟลเดอร์ของ nginx
COPY --from=build /app/dist /usr/share/nginx/html

# ใช้ config พิเศษเพื่อรองรับ React Router (ถ้ามีในอนาคต) ไม่ให้ refresh หน้าแล้ว 404
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
