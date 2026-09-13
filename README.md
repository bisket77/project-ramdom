# 🎡 Lucky Spin — โปรเจ็คระบบวงล้อสุ่มรางวัล

โปรเจ็คตัวอย่างเต็มระบบ: Frontend (React) + Backend (Go / Gin / GORM) + Database (PostgreSQL)
ครบทั้ง Docker, Docker Compose, การ push ขึ้น Docker Hub และแนวทาง deploy ขึ้น Google Cloud

---

## 1. โครงสร้างโปรเจ็ค

```
project_random/
├── backend/                    # Go (Gin Web Framework + GORM + PostgreSQL)
│   ├── cmd/
│   │   └── main.go             # จุดเริ่มต้นของ backend
│   ├── internal/
│   │   ├── config/             # การโหลด env และต่อฐานข้อมูล GORM + Connection Pool
│   │   │   ├── config.go
│   │   │   └── db.go
│   │   ├── controllers/        # logic การทำงานของแต่ละ endpoint (Prize, Spin)
│   │   │   ├── prize_controller.go
│   │   │   └── spin_controller.go
│   │   ├── middleware/         # CORS middleware
│   │   │   └── cors.go
│   │   ├── models/             # GORM Model: Prize, SpinHistory
│   │   │   ├── prize.go
│   │   │   └── spin_history.go
│   │   └── routes/             # กำหนดเส้นทาง API
│   │       └── routes.go
│   ├── Dockerfile              # Multi-stage build (golang -> alpine)
│   ├── go.mod
│   ├── go.sum
│   ├── .env
│   └── .env.example
│
├── frontend/                   # React (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Wheel/            # WheelCanvas, SpinButton
│   │   │   ├── PrizeList/        # PrizeForm, PrizeCard
│   │   │   ├── History/          # SpinHistoryTable
│   │   │   └── Layout/           # Navbar
│   │   ├── hooks/useWheelSpin.js # logic การหมุน/คำนวณมุม
│   │   ├── services/api.js       # เรียก backend API
│   │   ├── pages/HomePage.jsx
│   │   └── App.jsx
│   ├── Dockerfile                # multi-stage build -> nginx
│   └── nginx.conf
│
├── docker-compose.yml           # รวม db + backend + frontend
├── .env.example
└── README.md
```

### แนวคิดสถาปัตยกรรม
- **การสุ่มผลทำที่ backend เท่านั้น** — ป้องกันการโกงผลลัพธ์จากฝั่ง client
- **Frontend รับผิดชอบแค่แอนิเมชัน** — คำนวณมุมหมุนให้ตรงกับผลที่ backend ส่งมา
- **weight (น้ำหนัก)** ต่อรางวัลกำหนดโอกาสสุ่ม ทำให้ปรับความน่าจะเป็นของแต่ละรางวัลได้จริง
- **SpinHistory เก็บ snapshot ชื่อรางวัล** ไว้ตอนสุ่ม เพื่อไม่ให้ประวัติเก่าเพี้ยนหากมีการแก้ไข/ลบรางวัลภายหลัง

---

## 2. รันโปรเจ็คในเครื่อง (Local Development)

```bash
# 1. คัดลอกไฟล์ env
cp .env.example .env
cp backend/.env.example backend/.env

# 2. รันทุก service พร้อมกันด้วย Docker Compose
docker compose up --build

# เข้าใช้งานได้ที่
# Frontend: http://localhost:8080
# Backend:  http://localhost:4000/api/health
```

---

## 3. Build และ Push Image ขึ้น Docker Hub

```bash
# ล็อกอิน Docker Hub (ทำครั้งเดียว)
docker login

# ตั้งชื่อ image ให้มี namespace เป็น username ของคุณ
export DOCKERHUB_USER=your-dockerhub-username

# Build image ของ backend
docker build -t $DOCKERHUB_USER/lucky-spin-backend:1.0 ./backend

# Build image ของ frontend (ระบุ URL backend จริงที่จะให้ frontend เรียก)
docker build \
  --build-arg VITE_API_URL=https://your-backend-domain/api \
  -t $DOCKERHUB_USER/lucky-spin-frontend:1.0 ./frontend

# Push ขึ้น Docker Hub
docker push $DOCKERHUB_USER/lucky-spin-backend:1.0
docker push $DOCKERHUB_USER/lucky-spin-frontend:1.0
```

---

## 4. แนวทาง Deploy ขึ้น Google Cloud

มี 2 แนวทางหลัก เลือกตามความถนัด:

### แนวทาง A: Google Cloud Run (แนะนำ — ง่าย จ่ายตามการใช้งานจริง)

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Deploy backend (ดึง image จาก Docker Hub ตรงๆ ได้เลย)
gcloud run deploy lucky-spin-backend \
  --image=docker.io/$DOCKERHUB_USER/lucky-spin-backend:1.0 \
  --platform=managed \
  --region=asia-southeast1 \
  --set-env-vars=DB_HOST=YOUR_DB_HOST,DB_NAME=random_wheel,DB_USER=postgres,DB_PASSWORD=YOUR_PASSWORD \
  --allow-unauthenticated

# Deploy frontend (ต้อง build ใหม่โดยชี้ VITE_API_URL ไปที่ backend URL จริงที่ได้จากขั้นตอนก่อนหน้า)
gcloud run deploy lucky-spin-frontend \
  --image=docker.io/$DOCKERHUB_USER/lucky-spin-frontend:1.0 \
  --platform=managed \
  --region=asia-southeast1 \
  --allow-unauthenticated
```

> หมายเหตุ: Cloud Run เป็น stateless — ไม่เหมาะรัน PostgreSQL เอง แนะนำใช้ **Cloud SQL for PostgreSQL**
> (managed database ของ Google) แล้วเชื่อม backend เข้ากับ Cloud SQL ผ่าน Cloud SQL Auth Proxy
> หรือถ้าต้องการรัน database ใน container จริงๆ ตามที่ระบุไว้ ให้ใช้แนวทาง B ด้านล่าง

### แนวทาง B: Compute Engine (VM) + Docker Compose (รัน database ใน container ได้จริงตามที่ต้องการ)

```bash
# 1. สร้าง VM ที่มี Docker ติดตั้งมาให้แล้ว (Container-Optimized OS)
gcloud compute instances create lucky-spin-vm \
  --image-family=cos-stable \
  --image-project=cos-cloud \
  --machine-type=e2-small \
  --zone=asia-southeast1-a \
  --tags=http-server

# 2. เปิด firewall ให้เข้าถึง port ที่ต้องใช้
gcloud compute firewall-rules create allow-lucky-spin \
  --allow=tcp:80,tcp:8080,tcp:4000 \
  --target-tags=http-server

# 3. SSH เข้า VM แล้ว clone โปรเจ็ค หรือคัดลอก docker-compose.yml ขึ้นไป
gcloud compute ssh lucky-spin-vm --zone=asia-southeast1-a

# 4. บน VM: ดึง image จาก Docker Hub แล้วรันด้วย docker compose
#    (แก้ docker-compose.yml ให้ใช้ image: $DOCKERHUB_USER/lucky-spin-backend:1.0
#     แทนการ build จาก source ในเครื่อง)
docker compose up -d
```

---

## 5. รายการ API หลัก (Backend)

| Method | Endpoint             | คำอธิบาย                          |
|--------|-----------------------|-------------------------------------|
| GET    | `/api/health`          | ตรวจสอบสถานะ server               |
| GET    | `/api/prizes`          | ดึงรางวัลทั้งหมดที่เปิดใช้งาน      |
| POST   | `/api/prizes`          | เพิ่มรางวัลใหม่                    |
| PUT    | `/api/prizes/:id`      | แก้ไขรางวัล                        |
| DELETE | `/api/prizes/:id`      | ลบรางวัล                           |
| POST   | `/api/wheel/spin`      | สุ่มผล 1 ครั้ง (บันทึกประวัติด้วย) |
| GET    | `/api/wheel/history`   | ดึงประวัติการหมุนล่าสุด            |

---

## 6. แผนพัฒนาโปรเจ็ค (Roadmap)

1. ✅ ออกแบบโครงสร้าง frontend/backend/database
2. ✅ Backend: model, API, weighted random logic
3. ✅ Frontend: วงล้อ, ฟอร์มจัดการรางวัล, ประวัติ
4. ✅ Dockerize ทั้งสองฝั่ง + docker-compose สำหรับ dev
5. ⬜ ทดสอบ build & push image ขึ้น Docker Hub จริง
6. ⬜ ตั้งค่า Cloud SQL หรือ VM บน Google Cloud
7. ⬜ Deploy จริงและทดสอบผ่าน public URL
8. ⬜ (ต่อยอด) ระบบ login แอดมิน, จำกัดจำนวนครั้งที่หมุนต่อผู้ใช้, export สถิติ



## 7. สรุปขั้นตอนการ Build Image และ Deploy ขึ้น Cloud

### 🔄 แผนภาพกระบวนการทำงาน (Workflow)

```text
[ 💻 โค้ดในเครื่องเรา (frontend/) ] 
                 ⬇️ (docker build)
[ 📦 Docker Image ในเครื่อง (bisket77/random-wheel-frontend:v1) ] 
                 ⬇️ (docker push)
[ ☁️ Docker Hub (คลังเก็บ Image ออนไลน์) ] 
                 ⬇️ (ดึงไปรัน / Deploy)
[ 🚀 Cloud Server (Render / Cloud Run) ]
                 ⬇️
[ 🌐 ลิงก์เข้าใช้งานจริงผ่านอินเทอร์เน็ต ]
```

---

### 📝 สรุปคำสั่งที่ใช้งานจริง

#### 1. เข้าไปที่โฟลเดอร์โปรเจกต์ (Frontend)
```powershell
cd frontend
```

#### 2. สั่ง Build Docker Image
สร้าง Image จาก Dockerfile ภายในเครื่อง พร้อมตั้งชื่อและแท็กเวอร์ชัน (`v1`):
```powershell
docker build -t bisket77/random-wheel-frontend:v1 .
```

#### 3. ล็อกอินเข้าสู่ Docker Hub
```powershell
docker login
```

#### 4. Push Image ขึ้น Docker Hub
ส่ง Image จากเครื่องขึ้นไปเก็บไว้บนคลังออนไลน์ Docker Hub:
```powershell
docker push bisket77/random-wheel-frontend:v1
```
* ตรวจสอบ Repository ได้ที่: [Docker Hub - bisket77/random-wheel-frontend](https://hub.docker.com/r/bisket77/random-wheel-frontend)

---

### 🚀 การนำไป Deploy รันจริงบน Cloud (Render.com)

1. สมัคร/เข้าสู่ระบบที่ [Render.com](https://render.com) (ฟรี ไม่ต้องผูกบัตรเครดิต)
2. กดสร้าง **`New +`** ➔ **`Web Service`**
3. เลือก **`Existing image`** แล้วใส่ URL:
   ```text
   docker.io/bisket77/random-wheel-frontend:v1
   ```
4. เลือก Instance Type เป็น **`Free`** แล้วกด **`Create Web Service`**
5. รอระบบ Build ประมาณ 1–2 นาที เมื่อสถานะขึ้น **Live** จะได้ URL ใช้งานจริงทันที

---

### 🌐 ลิงก์เว็บไซต์ออนไลน์ (Live Demo)
👉 **เข้าใช้งานวงล้อสุ่ม:** [https://random-core.onrender.com](https://random-core.onrender.com)