# Smart Moto Service Center

ระบบบริหารจัดการศูนย์บริการรถจักรยานยนต์ครบวงจร (SA → ช่าง → คลัง → การเงิน/CRM → Admin/Dashboard)

## Tech Stack
- Frontend: React + Vite + TypeScript + Tailwind CSS
- Backend: Node.js (NestJS)
- Database: PostgreSQL (Docker)
- ORM: Prisma
- API: REST (JSON)
- Auth: JWT + RBAC (กำลังทำ/จะทำต่อ)

---

## โครงสร้างโฟลเดอร์
smart-moto-service-center/
frontend/ # React + Vite
backend/ # NestJS + Prisma
docs/ # เอกสาร SAD / diagrams / notes
docker-compose.yml
README.md

yaml
คัดลอกโค้ด

---

## Branch ที่ใช้ทำงาน
- `main` : ไว้ปล่อย/ส่งงาน (อย่า push ตรง ถ้าไม่จำเป็น)
- `develop` : branch รวมงานของทีม
- แนะนำให้ทำงานบน branch ของตัวเอง แล้วค่อย PR เข้า `develop`
  - ตัวอย่าง: `feature/reception-fasttrack`, `feature/billing-quotation`

---

# ✅ สิ่งที่ต้องติดตั้งก่อนเริ่ม
> ถ้าไม่มีอันใดอันหนึ่ง = เดี๋ยวได้หัวร้อนเหมือนหัวหน้าโปรเจค (aka คนทำ repo) 😂

1) **Git**
- เช็ค: `git --version`

2) **Node.js (แนะนำ LTS)**
- เช็ค: `node -v` และ `npm -v`

3) **Docker Desktop**
- เปิดให้รันอยู่ (สำคัญมาก)
- เช็ค: `docker -v` และ `docker compose version`

4) (แนะนำ) **VS Code**

---

# 🚀 วิธีเริ่มทำโปรเจค (สำหรับเพื่อนในทีม)
## 1) Clone repo + checkout develop
```bash
git clone https://github.com/nicky-wrc/smart-moto-service-center.git
cd smart-moto-service-center
git checkout develop
git pull
2) ติดตั้ง dependencies
Frontend
bash
คัดลอกโค้ด
cd frontend
npm install
cd ..
Backend
bash
คัดลอกโค้ด
cd backend
npm install
cd ..
3) ตั้งค่า Environment (.env)
ห้าม commit .env ขึ้น repo เด็ดขาด (มี .gitignore กันไว้แล้ว)

Backend
ไปที่ backend/ แล้วสร้างไฟล์ .env จาก .env.example

Windows (CMD/PowerShell):

bash
คัดลอกโค้ด
cd backend
copy .env.example .env
macOS/Linux/Git Bash:

bash
คัดลอกโค้ด
cd backend
cp .env.example .env
จากนั้นเปิด backend/.env แล้วตั้งค่าเป็น (สำคัญ: port 5433):

env
คัดลอกโค้ด
DATABASE_URL="postgresql://smartmoto:smartmoto_pw@127.0.0.1:5433/smartmoto?schema=public"
JWT_SECRET="change_me"
4) เปิด Database (PostgreSQL) ด้วย Docker
กลับไปที่ root ของ repo (ที่มี docker-compose.yml) แล้วรัน:

bash
คัดลอกโค้ด
cd ..
docker compose up -d
เช็คว่าขึ้นจริง:

bash
คัดลอกโค้ด
docker ps
ต้องเห็นประมาณนี้:

container ชื่อ smartmoto_db

port เป็น 0.0.0.0:5433->5432/tcp

5) สร้างตารางใน DB ด้วย Prisma
เข้าไปที่ backend:

bash
คัดลอกโค้ด
cd backend
npx prisma db push
ถ้าผ่านจะขึ้นประมาณ:

The database is already in sync with the Prisma schema. หรือ push สำเร็จ

6) รันระบบ
รัน Backend (NestJS)
bash
คัดลอกโค้ด
cd backend
npm run start:dev
รัน Frontend (Vite)
เปิด terminal ใหม่:

bash
คัดลอกโค้ด
cd frontend
npm run dev
🧠 คำสั่งที่ใช้บ่อย (Cheat Sheet)
DB
เปิด DB: docker compose up -d

ปิด DB: docker compose down

ล้าง DB (ลบข้อมูลหมด): docker compose down -v

Prisma
sync schema → DB: npx prisma db push

เปิด Prisma Studio (ดูข้อมูลแบบ UI): npx prisma studio

Frontend / Backend
FE dev: npm run dev (ใน frontend/)

BE dev: npm run start:dev (ใน backend/)

🧯 Troubleshooting (ปัญหาฮิตติดชาร์ต)
1) Prisma ขึ้น P1000 / auth failed
เช็คตามลำดับนี้:

Docker เปิดอยู่ไหม

DB ขึ้นไหม:

bash
คัดลอกโค้ด
docker ps
backend/.env ใช้ port 5433 ไหม:

env
คัดลอกโค้ด
...@127.0.0.1:5433/...
ลองรันใหม่:

bash
คัดลอกโค้ด
cd backend
npx prisma db push
หมายเหตุ: เครื่องบางคนมี Postgres ในเครื่องจับ port 5432 อยู่แล้ว เราเลยใช้ 5433 เพื่อเลี่ยงชน

2) Port ชน / เปิด DB ไม่ได้
ถ้าเครื่องคุณมีอะไรจับ port 5432/5433 อยู่ ให้แจ้งในทีมก่อน
(แต่ตอนนี้โปรเจคตั้งใจใช้ 5433 แล้ว)

3) อยากรีเซ็ต DB ใหม่หมด
bash
คัดลอกโค้ด
docker compose down -v
docker compose up -d
cd backend
npx prisma db push
👥 วิธีทำงานร่วมกัน (แนะนำให้ทำตามนี้)
สร้าง branch ของตัวเองจาก develop
bash
คัดลอกโค้ด
git checkout develop
git pull
git checkout -b feature/<your-feature-name>
ทำงานเสร็จ → commit → push
bash
คัดลอกโค้ด
git add -A
git commit -m "feat: <สรุปสั้นๆ>"
git push -u origin feature/<your-feature-name>
แล้วค่อยไปเปิด Pull Request เข้า develop

🔒 ข้อห้าม
ห้าม commit .env หรือ key/secret ขึ้น GitHub

ห้ามเอา node_modules ขึ้น repo

อย่าแก้ develop แบบ force push (ถ้าไม่รู้ว่าทำอะไรอยู่)