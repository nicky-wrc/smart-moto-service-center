# 🚀 Quick Start Guide - สำหรับเพื่อนในทีม

**อัปเดตล่าสุด:** 2024-12-20

---

## ✅ สิ่งที่ต้องมีก่อนเริ่ม

1. **Git** - `git --version`
2. **Node.js** (LTS) - `node -v` และ `npm -v`
3. **Docker Desktop** - ต้องเปิดอยู่
4. **VS Code** (แนะนำ)

---

## 📥 ขั้นตอนที่ 1: Clone Project

```bash
# Clone repository
git clone https://github.com/nicky-wrc/smart-moto-service-center.git

# เข้าไปในโฟลเดอร์
cd smart-moto-service-center

# Switch ไปที่ branch develop
git checkout develop
git pull
```

---

## 📦 ขั้นตอนที่ 2: ติดตั้ง Dependencies

### Frontend
```bash
cd frontend
npm install
cd ..
```

### Backend
```bash
cd backend
npm install
cd ..
```

---

## ⚙️ ขั้นตอนที่ 3: ตั้งค่า Environment Variables

### Backend (.env)

```bash
# เข้าไปที่ backend/
cd backend

# สร้างไฟล์ .env จาก .env.example

# Windows (CMD/PowerShell)
copy .env.example .env

# macOS/Linux/Git Bash
cp .env.example .env
```

**แก้ไข `backend/.env`:**

```env
DATABASE_URL="postgresql://smartmoto:smartmoto_pw@127.0.0.1:5433/smartmoto?schema=public"
JWT_SECRET="your_secret_key_here_change_me"
JWT_EXPIRES_IN="1d"
PORT=4000
NODE_ENV=development
```

**⚠️ สำคัญ:** เปลี่ยน `JWT_SECRET` เป็นค่าที่ปลอดภัย (random string)

---

## 🗄️ ขั้นตอนที่ 4: เปิด Database (PostgreSQL)

```bash
# กลับไปที่ root ของ repo (ที่มี docker-compose.yml)
cd ..

# เปิด Docker container
docker compose up -d

# ตรวจสอบว่าเปิดสำเร็จ
docker ps
```

**Expected Output:**
```
CONTAINER ID   IMAGE             PORTS                      NAMES
xxxxx          postgres:15      0.0.0.0:5433->5432/tcp    smartmoto_db
```

---

## 🗃️ ขั้นตอนที่ 5: สร้าง Database Schema

```bash
cd backend

# สร้างตารางใน database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# (Optional) Seed ข้อมูลทดสอบ
npm run prisma:seed
```

**Expected Output:**
```
✔ Generated Prisma Client
The database is now in sync with your schema.
```

---

## 🎯 ขั้นตอนที่ 6: รันระบบ

### Terminal 1: Backend
```bash
cd backend
npm run start:dev
```

**Expected Output:**
```
API: http://localhost:4000/api
Swagger: http://localhost:4000/docs
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

---

## ✅ ตรวจสอบว่าระบบทำงาน

1. **Backend:**
   - เปิด: `http://localhost:4000/api` → ควรเห็น `{"message":"Smart Moto Service Center API"}`
   - เปิด: `http://localhost:4000/docs` → ควรเห็น Swagger UI

2. **Frontend:**
   - เปิด: `http://localhost:5173` → ควรเห็นหน้าแรก

3. **Database:**
   - รัน: `npx prisma studio` (ใน backend/)
   - เปิด: `http://localhost:5555` → ควรเห็น Prisma Studio

---

## 🔑 ข้อมูลเข้าสู่ระบบ (Test Accounts)

หลังจาก seed ข้อมูลแล้ว สามารถใช้ account ต่อไปนี้:

| Username | Password | Role |
|----------|----------|------|
| admin | password123 | ADMIN |
| sa1 | password123 | SERVICE_ADVISOR |
| tech1 | password123 | TECHNICIAN |
| cashier1 | password123 | CASHIER |
| stock1 | password123 | STOCK_KEEPER |

---

## 📚 เอกสารที่ควรอ่าน

### สำหรับทุกคน:
- `README.md` - ภาพรวมโปรเจค
- `CONTRIBUTING.md` - วิธีทำงานร่วมกัน
- `backend/GIT_CONVENTIONS.md` - Git conventions

### สำหรับ Backend:
- `backend/COMPLETE_API_TESTING_GUIDE.md` - คู่มือทดสอบ API
- `backend/SWAGGER_USAGE.md` - วิธีใช้ Swagger UI
- `backend/CI_CD_GUIDE.md` - CI/CD workflow
- `docs/TEAM_ASSIGNMENT_DETAILED.md` - แบ่งหน้าที่ละเอียด

### สำหรับ Frontend:
- `frontend/README.md` - Frontend setup
- `docs/TEAM_ASSIGNMENT_DETAILED.md` - แบ่งหน้าที่ละเอียด

---

## 🌿 ขั้นตอนการทำงาน (Git Workflow)

### 1. สร้าง Branch ของตัวเอง

```bash
# อัปเดต develop ก่อน
git checkout develop
git pull origin develop

# สร้าง branch ใหม่
git checkout -b feature/your-feature-name

# ตัวอย่าง:
git checkout -b feature/inventory-package-management
git checkout -b feature/billing-invoice
```

### 2. ทำงานและ Commit

```bash
# ทำงานเสร็จแล้ว
git add .

# Commit ตาม convention
git commit -m "feat(inventory): add package management API"

# Push ขึ้น GitHub
git push -u origin feature/your-feature-name
```

### 3. สร้าง Pull Request

1. ไปที่ GitHub repository
2. คลิก "New Pull Request"
3. เลือก base: `develop`, compare: `feature/your-feature-name`
4. กรอก PR description
5. รอ review และ approval
6. Merge หลังจากได้รับการ approve

---

## 🧪 ทดสอบ API

### วิธีที่ 1: Swagger UI

1. เปิด: `http://localhost:4000/docs`
2. Login เพื่อรับ token:
   - POST `/api/auth/login`
   - ใส่ username/password
   - คัดลอก `access_token`
3. Authorize:
   - คลิกปุ่ม "Authorize" (🔒)
   - ใส่ token
   - คลิก "Authorize"
4. ทดสอบ API endpoints อื่นๆ

### วิธีที่ 2: Postman/Insomnia

1. Import collection จาก Swagger: `http://localhost:4000/docs-json`
2. Login เพื่อรับ token
3. ตั้งค่า Authorization: Bearer Token
4. ทดสอบ API endpoints

---

## 🐛 Troubleshooting

### ปัญหา: Database ไม่สามารถเชื่อมต่อได้

**สาเหตุ:** Docker ไม่ได้เปิด หรือ port ไม่ตรง

**แก้ไข:**
```bash
# ตรวจสอบ Docker
docker ps

# ถ้าไม่เห็น container
docker compose up -d

# ตรวจสอบ .env ว่าใช้ port 5433
cat backend/.env | grep DATABASE_URL
```

### ปัญหา: Port ชน

**Backend (4000):**
- เปลี่ยน `PORT` ใน `backend/.env`

**Frontend (5173):**
- Vite จะ auto-increment port

**Database (5433):**
- ถ้าจำเป็น เปลี่ยน port ใน `docker-compose.yml` และ `backend/.env`

### ปัญหา: Prisma errors

```bash
# ลบ node_modules และ reinstall
cd backend
rm -rf node_modules
npm install

# Generate Prisma Client ใหม่
npx prisma generate

# Push schema ใหม่
npx prisma db push
```

### ปัญหา: Dependencies conflicts

```bash
# ลบ node_modules ทั้งหมด
rm -rf backend/node_modules frontend/node_modules

# ลบ package-lock.json
rm -f backend/package-lock.json frontend/package-lock.json

# ติดตั้งใหม่
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

---

## 📋 Checklist สำหรับเพื่อนใหม่

- [ ] Clone repository สำเร็จ
- [ ] ติดตั้ง dependencies สำเร็จ (backend + frontend)
- [ ] สร้างไฟล์ `.env` และตั้งค่าเรียบร้อย
- [ ] เปิด Docker และ database สำเร็จ
- [ ] รัน `npx prisma db push` สำเร็จ
- [ ] รัน backend สำเร็จ (`npm run start:dev`)
- [ ] รัน frontend สำเร็จ (`npm run dev`)
- [ ] เปิด Swagger UI ได้ (`http://localhost:4000/docs`)
- [ ] Login ได้และทดสอบ API ได้
- [ ] อ่านเอกสารแบ่งหน้าที่ (`docs/TEAM_ASSIGNMENT_DETAILED.md`)
- [ ] สร้าง branch ของตัวเองแล้ว

---

## 💡 Tips

1. **ใช้ Swagger UI** - เป็นเครื่องมือที่ดีที่สุดสำหรับทดสอบ API
2. **ใช้ Prisma Studio** - สำหรับดู/แก้ไขข้อมูลใน database
3. **Commit บ่อยๆ** - แบ่ง commit เป็นส่วนย่อยๆ
4. **Pull ก่อน Push** - `git pull` ก่อน `git push` เสมอ
5. **ทดสอบใน Local** - ทดสอบก่อนสร้าง PR
6. **อ่าน Error Messages** - Error messages จะบอกปัญหาชัดเจน

---

## 📞 ติดต่อ

ถ้ามีปัญหาหรือคำถาม:
- สร้าง Issue บน GitHub
- ติดต่อ Backend Lead (คนที่ 1)
- ดูเอกสารเพิ่มเติมใน `docs/` folder

---

**🎉 พร้อมแล้ว! เริ่มทำงานได้เลย!**

**หมายเหตุ:** ถ้ามีปัญหาอะไร ให้ดู `README.md` และ `CONTRIBUTING.md` ก่อน
