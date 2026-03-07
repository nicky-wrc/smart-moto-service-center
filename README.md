# 🏍️ Smart Moto Service Center

ระบบบริหารจัดการศูนย์บริการรถจักรยานยนต์ครบวงจร

**Workflow:** Reception (SA) → Workshop (ช่าง) → Inventory (คลัง) → Billing/CRM (การเงิน) → Admin/Dashboard

---

## 🎯 ภาพรวมโปรเจค

ระบบนี้เป็นระบบจัดการศูนย์บริการรถจักรยานยนต์ที่ครอบคลุมทุกขั้นตอน ตั้งแต่การรับรถไปจนถึงการคิดเงินและรายงาน

### Features หลัก

- ✅ **Reception Module** - รับรถ, ลงทะเบียนลูกค้า, นัดหมาย, Fast Track, Warranty Check
- ✅ **Workshop Module** - Job Queue, Labor Time Tracking, Checklist, Outsource
- ✅ **Inventory Module** - Part Master, Stock Management, Requisition, Package/Kit
- ✅ **Billing/CRM Module** - Quotation, Payment, Invoice, Membership & Points
- ✅ **Admin/Dashboard** - Reports, Analytics, User Management

---

## 🛠️ Tech Stack

### Frontend
- **React** + **Vite** + **TypeScript**
- **Tailwind CSS** (UI styling)

### Backend
- **Node.js** + **NestJS** (Framework)
- **PostgreSQL** (Database via Docker)
- **Prisma** (ORM)
- **JWT** + **RBAC** (Authentication & Authorization)

### DevOps
- **Docker** (Database)
- **GitHub Actions** (CI/CD)
- **Swagger/OpenAPI** (API Documentation)

---

## 📁 โครงสร้างโปรเจค

```
smart-moto-service-center/
├── frontend/          # React + Vite + TypeScript
├── backend/           # NestJS + Prisma
│   ├── src/          # Source code
│   ├── prisma/       # Database schema & migrations
│   └── test/         # Tests
├── docs/             # Documentation
│   ├── QUICK_START_GUIDE.md
│   └── TEAM_ASSIGNMENT_DETAILED.md
├── .github/          # GitHub Actions workflows
└── README.md         # This file
```

---

## 🚀 เริ่มต้นใช้งาน

### ⚡ Quick Start

**👉 สำหรับเพื่อนใหม่: อ่านคู่มือเริ่มต้นแบบละเอียดที่ [`docs/QUICK_START_GUIDE.md`](docs/QUICK_START_GUIDE.md)**

### สรุปขั้นตอน:

#### 1. Prerequisites

ตรวจสอบว่ามี tools เหล่านี้:
- ✅ **Git** - `git --version`
- ✅ **Node.js** (LTS) - `node -v` และ `npm -v`
- ✅ **Docker Desktop** - ต้องเปิดอยู่
- ✅ **VS Code** (แนะนำ)

#### 2. Clone & Setup

```bash
# Clone repository
git clone https://github.com/nicky-wrc/smart-moto-service-center.git
cd smart-moto-service-center

# Switch to develop branch
git checkout develop
git pull

# Install dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

#### 3. Environment Setup

```bash
# สร้างไฟล์ .env ใน backend/
cd backend

# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

แก้ไข `backend/.env`:
```env
DATABASE_URL="postgresql://smartmoto:smartmoto_pw@127.0.0.1:5433/smartmoto?schema=public"
JWT_SECRET="your_secret_key_here_change_me"
JWT_EXPIRES_IN="1d"
PORT=4000
NODE_ENV=development
```

#### 4. Database Setup

```bash
# กลับไปที่ root ของ repo
cd ..

# เปิด Docker container (PostgreSQL)
docker compose up -d

# ตรวจสอบว่าเปิดสำเร็จ
docker ps

# สร้าง database schema
cd backend
npx prisma generate
npx prisma db push

# (Optional) Seed ข้อมูลทดสอบ
npm run prisma:seed
```

#### 5. รันระบบ

**Terminal 1: Backend**
```bash
cd backend
npm run start:dev
```
→ เปิดที่ `http://localhost:4000/api`
→ Swagger UI: `http://localhost:4000/docs`

**Terminal 2: Frontend**
```bash
cd frontend
npm run dev
```
→ เปิดที่ `http://localhost:5173`

---

## 📚 เอกสารสำคัญ

### สำหรับทุกคน
- 📖 **[Quick Start Guide](docs/QUICK_START_GUIDE.md)** - คู่มือเริ่มต้นแบบละเอียด
- 📋 **[Team Assignment](docs/TEAM_ASSIGNMENT_DETAILED.md)** - แบ่งหน้าที่ละเอียดของแต่ละคน
- 🤝 **[Contributing Guide](CONTRIBUTING.md)** - วิธีทำงานร่วมกัน

### สำหรับ Backend Developers
- 🔧 **[API Testing Guide](backend/COMPLETE_API_TESTING_GUIDE.md)** - คู่มือทดสอบ API แบบละเอียด
- 📝 **[Swagger Usage](backend/SWAGGER_USAGE.md)** - วิธีใช้ Swagger UI
- 🔄 **[CI/CD Guide](backend/CI_CD_GUIDE.md)** - CI/CD workflow
- 📊 **[Project Status](backend/PROJECT_STATUS_REPORT.md)** - สถานะโปรเจค
- 🔐 **[Git Conventions](backend/GIT_CONVENTIONS.md)** - Git conventions

### สำหรับ Frontend Developers
- 🎨 **[Frontend README](frontend/README.md)** - Frontend setup

---

## 🔑 Test Accounts

หลังจาก seed ข้อมูลแล้ว สามารถใช้ account ต่อไปนี้:

| Username | Password | Role |
|----------|----------|------|
| admin | password123 | ADMIN |
| sa1 | password123 | SERVICE_ADVISOR |
| tech1 | password123 | TECHNICIAN |
| cashier1 | password123 | CASHIER |
| stock1 | password123 | STOCK_KEEPER |

---

## 🌿 Git Workflow

### Branch Strategy

- `main` - Production-ready code (อย่า push ตรง)
- `develop` - Integration branch สำหรับรวมงานของทีม
- `feature/<name>` - Feature branches (ทำงานบนนี้)
- `bugfix/<issue-id>-<description>` - Bug fixes

### สร้าง Feature Branch

```bash
# อัปเดต develop ก่อน
git checkout develop
git pull origin develop

# สร้าง branch ใหม่
git checkout -b feature/your-feature-name

# ตัวอย่าง:
git checkout -b feature/inventory-package
git checkout -b feature/billing-invoice
```

### Commit & Push

```bash
# ทำงานเสร็จแล้ว
git add .
git commit -m "feat(inventory): add package management API"
git push -u origin feature/your-feature-name
```

### สร้าง Pull Request

1. ไปที่ GitHub repository
2. คลิก "New Pull Request"
3. เลือก base: `develop`, compare: `feature/your-feature-name`
4. กรอก PR description ตาม template
5. รอ review และ approval
6. Merge หลังจากได้รับการ approve

**อ่านเพิ่มเติม:** [`backend/GIT_CONVENTIONS.md`](backend/GIT_CONVENTIONS.md)

---

## 🧠 คำสั่งที่ใช้บ่อย

### Database
```bash
# เปิด DB
docker compose up -d

# ปิด DB
docker compose down

# ล้าง DB (ลบข้อมูลหมด)
docker compose down -v
```

### Prisma
```bash
# Sync schema → DB
npx prisma db push

# Generate Prisma Client
npx prisma generate

# เปิด Prisma Studio (ดูข้อมูลแบบ UI)
npx prisma studio
```

### Development
```bash
# Backend
cd backend
npm run start:dev

# Frontend
cd frontend
npm run dev

# Tests
npm run test

# Linter
npm run lint
```

---

## 🧯 Troubleshooting

### 1. Database ไม่สามารถเชื่อมต่อได้

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

### 2. Port ชน

**Backend (4000):**
- เปลี่ยน `PORT` ใน `backend/.env`

**Frontend (5173):**
- Vite จะ auto-increment port

**Database (5433):**
- ถ้าจำเป็น เปลี่ยน port ใน `docker-compose.yml` และ `backend/.env`

### 3. Prisma Errors

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

### 4. Dependencies Conflicts

```bash
# ลบ node_modules ทั้งหมด
rm -rf backend/node_modules frontend/node_modules

# ลบ package-lock.json
rm -f backend/package-lock.json frontend/package-lock.json

# ติดตั้งใหม่
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

**อ่านเพิ่มเติม:** [`docs/QUICK_START_GUIDE.md`](docs/QUICK_START_GUIDE.md) - Troubleshooting section

---

## 📊 API Endpoints

### Base URL
- **API:** `http://localhost:4000/api`
- **Swagger UI:** `http://localhost:4000/docs`
- **Health Check:** `http://localhost:4000/api`

### เอกสาร API
- 📖 **[API Testing Guide](backend/COMPLETE_API_TESTING_GUIDE.md)** - คู่มือทดสอบ API แบบละเอียด
- 📝 **[Swagger UI](http://localhost:4000/docs)** - Interactive API documentation

---

## 👥 ทีมพัฒนา

| คน | หน้าที่ | เอกสาร |
|-----|--------|--------|
| 1 | Backend Lead / System Integrator | [`backend/PROJECT_STATUS_REPORT.md`](backend/PROJECT_STATUS_REPORT.md) |
| 2 | Backend – Inventory & Stock | [`docs/TEAM_ASSIGNMENT_DETAILED.md`](docs/TEAM_ASSIGNMENT_DETAILED.md) |
| 3 | Backend – Billing/CRM & Reports | [`docs/TEAM_ASSIGNMENT_DETAILED.md`](docs/TEAM_ASSIGNMENT_DETAILED.md) |
| 4 | Frontend Lead – Reception + Technician | [`docs/TEAM_ASSIGNMENT_DETAILED.md`](docs/TEAM_ASSIGNMENT_DETAILED.md) |
| 5 | Frontend – Inventory + Billing/Admin | [`docs/TEAM_ASSIGNMENT_DETAILED.md`](docs/TEAM_ASSIGNMENT_DETAILED.md) |

**👉 ดูหน้าที่ละเอียด:** [`docs/TEAM_ASSIGNMENT_DETAILED.md`](docs/TEAM_ASSIGNMENT_DETAILED.md)

---

## ✅ Status

### Backend
- ✅ **99% Complete** - Core workflows พร้อมใช้งาน
- ✅ CI/CD ทำงานแล้ว
- ✅ API Documentation ครบถ้วน

### Frontend
- 🚧 **In Progress** - กำลังพัฒนา

**ดูสถานะละเอียด:** [`backend/PROJECT_STATUS_REPORT.md`](backend/PROJECT_STATUS_REPORT.md)

---

## 🔒 ข้อห้ามสำคัญ

- ❌ **ห้าม commit `.env`** หรือ key/secret ขึ้น GitHub
- ❌ **ห้ามเอา `node_modules`** ขึ้น repo
- ❌ **อย่าแก้ `develop`** แบบ force push (ถ้าไม่รู้ว่าทำอะไรอยู่)
- ❌ **อย่า push ตรงไป `main`** (ต้องผ่าน PR)

---

## 📞 ติดต่อ & Support

- 📝 สร้าง Issue บน GitHub สำหรับ bugs หรือ questions
- 📖 อ่านเอกสารใน `docs/` folder
- 🔍 ดู Swagger UI ที่ `http://localhost:4000/docs`

---

## 📄 License

This project is for educational purposes.

---

## 🎯 Next Steps

1. ✅ อ่าน [`docs/QUICK_START_GUIDE.md`](docs/QUICK_START_GUIDE.md)
2. ✅ ดูหน้าที่ของตัวเองใน [`docs/TEAM_ASSIGNMENT_DETAILED.md`](docs/TEAM_ASSIGNMENT_DETAILED.md)
3. ✅ Setup environment ตาม Quick Start Guide
4. ✅ สร้าง branch ของตัวเอง
5. ✅ เริ่มทำงาน!

---

**🎉 Happy Coding!**

**หมายเหตุ:** ถ้ามีปัญหาอะไร ให้อ่าน [`docs/QUICK_START_GUIDE.md`](docs/QUICK_START_GUIDE.md) และ [`CONTRIBUTING.md`](CONTRIBUTING.md) ก่อน
