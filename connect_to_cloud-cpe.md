# 🎡 Project Random Core — Service Deployment Specification

สรุปการตั้งค่าสถาปัตยกรรมทั้ง 3 ส่วน: **Database**, **Backend**, และ **Frontend** พร้อมการกำหนดค่า Environment Variables และ Port Mapping

---

## 🗄️ 1. Database (PostgreSQL)

| รายการ (Attribute) | ค่าที่กำหนด (Value) |
| :--- | :--- |
| **Image** | `postgres:16-alpine` |
| **Service Name** | `db-random-core` |
| **Container Port** | `5432` |
| **Volume (Data Path)** | `/var/lib/postgresql/data` |

### Environment Variables
```env
POSTGRES_DB=random_wheel
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```

---

## ⚙️ 2. Backend (Go API)

| รายการ (Attribute) | ค่าที่กำหนด (Value) |
| :--- | :--- |
| **Image** | `bisket77/project_random-backend` *(หรือ `bisket77/test_back:v1`)* |
| **Service Name** | `backend-random-core` |
| **Container Port** | `4000` |
| **NodePort (K8s / External)** | `<Node-IP>:30328` ➔ `:4000` |

### Environment Variables
* **รูปแบบมาตรฐาน:** `postgresql://[user[:password]@][host][:port][/dbname]`

```env
# ค่าหลักที่ใช้เชื่อมต่อ (Required)
DATABASE_URL=postgresql://postgres:postgres@db-random-core:5432/random_wheel
PORT=4000

# ค่าแยกส่วน (Optional / สำรองไว้ดูเฉยๆ)
DB_HOST=db-random-core
DB_PORT=5432
DB_NAME=random_wheel
DB_USER=postgres
DB_PASSWORD=postgres
```

---

## 💻 3. Frontend (React + Nginx)

| รายการ (Attribute) | ค่าที่กำหนด (Value) |
| :--- | :--- |
| **Image** | `bisket77/random-wheel-frontend:v1` |
| **Service Name** | `frontend-random-core` |
| **Container Port** | `80` *(ดูที่ frontend/Dockerfile -> `EXPOSE 80`)* |

### Environment Variables
```env
VITE_API_URL=https://192.168.162.130:30328
BACKEND_URL=https://192.168.162.130:30328
```

---

## 🌐 4. ช่องทางการเข้าใช้งาน (Access URLs)

รายการ Port สำหรับเข้าใช้งานของแต่ละสมาชิกในระบบ:

* 👤 **Bun:** `https://192.168.162.130:32235`
* 👤 **Kanin:** `https://192.168.162.130:31423`
* 👤 **Mak:** `https://192.168.162.130:31423`

---

## 🛠️ 5. คำสั่ง Build และ Push Docker Image

### ฝั่ง Backend:
```bash
# สั่ง Build Image
docker build -t bisket77/test_back:v1 .

# สั่ง Push ขึ้น Docker Hub
docker push bisket77/test_back:v1
```

### ฝั่ง Frontend:
```bash
# สั่ง Build Image
docker build -t bisket77/random-wheel-frontend:v1 .

# สั่ง Push ขึ้น Docker Hub
docker push bisket77/random-wheel-frontend:v1
```
