# Smart Moto Service Center

ระบบบริหารจัดการศูนย์บริการรถจักรยานยนต์ครบวงจร รองรับตั้งแต่การรับรถ งานซ่อม การจัดการอะไหล่ การชำระเงิน ไปจนถึงรายงานและการบริหารบุคลากร

Workflow หลักของระบบ:

Reception (Service Advisor) → Foreman / Mechanic (Workshop) → Inventory (Stock) → Accounting / Billing → Owner / Admin (Dashboard & Reports)

---

## ภาพรวมระบบ

Smart Moto Service Center ถูกออกแบบมาเพื่อใช้งานจริงในศูนย์บริการ มีการกำหนดบทบาทผู้ใช้ (Role) และสิทธิ์การเข้าถึง (RBAC) อย่างชัดเจน พร้อม Flow การทำงานที่เชื่อมโยงกันทุกฝ่าย

### โมดูลหลัก

1. Reception Module
   - ลงทะเบียนลูกค้าและรถจักรยานยนต์
   - แจ้งซ่อมครั้งแรก / ลูกค้าเดิม / รถคันใหม่
   - นัดหมายเข้ารับบริการ
   - ส่งใบแจ้งซ่อมเข้าสู่ระบบใบงาน (Job) สำหรับ Foreman
   - ประวัติการเข้ารับบริการของลูกค้า

2. Foreman & Workshop Module
   - รายการใบงานที่รอวินิจฉัย / รอลูกค้าอนุมัติ / พร้อมซ่อม / ระหว่างซ่อม / QC / พร้อมส่งมอบ
   - บันทึกอาการและการวินิจฉัยจาก Foreman
   - บันทึกรายงานจากช่าง (Mechanic Notes)
   - ติดตาม Job Status ตามขั้นตอนการซ่อม
   - แจ้งซ่อมซ้ำ / ประเมินรอบสอง
   - บริหารคิวงานและมอบหมายช่าง

3. Inventory Module
   - รายการอะไหล่ (Part Master) พร้อมสต็อกคงเหลือ
   - เบิกอะไหล่ (Part Requisition) จากใบงาน:
     - สร้างคำขอเบิก
     - อนุมัติ/ไม่อนุมัติ
     - ตัดสต็อกเมื่อจ่ายของ
     - บันทึกการคืนอะไหล่ที่เหลือ
   - ใบสั่งซื้ออะไหล่ (Purchase Order):
     - สร้างแบบร่าง (Draft)
     - ส่งคำขออนุมัติ (Pending Approval)
     - อนุมัติ / ยกเลิก โดย Owner/Admin
     - เมื่ออนุมัติแล้วระบบเพิ่มสต็อกอัตโนมัติ
   - รายงานการเคลื่อนไหวสต็อก (Stock Movement)
   - รายการประวัติการเบิกและสต็อกย้อนหลัง

4. Billing / Accounting Module
   - สร้าง Payment จากใบงานที่สถานะพร้อมส่งมอบ
   - คิดค่าบริการจาก:
     - ค่าแรง (Labor Time Tracking)
     - ค่าอะไหล่ที่เบิกจริง (ISSUED)
     - ค่า Outsource
     - Quotation (ใช้เป็นฐานคำนวณกรณีไม่มีข้อมูลละเอียด)
   - คำนวณยอดรวม ยอดภาษีมูลค่าเพิ่ม (VAT) ยอดสุทธิ
   - กระบวนการชำระเงิน (Pending → Paid)
   - ประวัติการชำระเงิน และรายละเอียดใบเสร็จ

5. Owner / Admin Module
   - Dashboard ภาพรวมรายได้ กำไร งานค้าง และยอดรอชำระ
   - รายงานการเงินแบบรายวัน รายสัปดาห์ รายเดือน พร้อมกราฟ
   - รายงานงานค้าง แยกตามสถานะของใบงาน
   - รายงานสต็อกและอะไหล่ใกล้หมด
   - รายงานคำสั่งซื้อและการรับสินค้าเข้าสต็อก
   - จัดการพนักงาน (User Management):
     - สร้าง/แก้ไขผู้ใช้
     - กำหนด Role และเงินเดือน
   - หน้าผู้ดูแลระบบ (Admin) ที่สามารถเข้าถึงทุกโมดูลผ่าน Dashboard เดียว

---

## เทคโนโลยีที่ใช้

### Frontend

- React (Vite + TypeScript)
- React Router
- Tailwind CSS
- Context API (AuthContext, RequestHistoryContext)
- Custom hooks และ services สำหรับเรียกใช้งาน API
- Recharts ใช้สำหรับกราฟ Dashboard และ Reports

### Backend

- Node.js
- NestJS (Modular Architecture)
- PostgreSQL (ผ่าน Docker)
- Prisma ORM
- JWT Authentication + Role-based Access Control (RBAC)
- Swagger / OpenAPI สำหรับเอกสาร API

### DevOps / Tools

- Docker (สำหรับ PostgreSQL)
- Prisma Migrate / db push
- Git และ GitHub
- GitHub Actions (CI/CD – ตามที่กำหนดใน `.github/`)

---

## โครงสร้างโปรเจกต์
bash
smart-moto-service-center/
├── backend/ # NestJS + Prisma
│ ├── src/
│ │ ├── auth/ # Login / JWT
│ │ ├── users/ # ผู้ใช้งานระบบ + บทบาท
│ │ ├── customers/ # ลูกค้า + คะแนนสะสม
│ │ ├── motorcycles/ # รถจักรยานยนต์
│ │ ├── jobs/ # ใบงานซ่อม
│ │ ├── parts/ # อะไหล่ + เบิกอะไหล่
│ │ ├── purchase-orders/ # ใบสั่งซื้ออะไหล่
│ │ ├── payments/ # การชำระเงิน
│ │ ├── reports/ # รายงาน / Dashboard owner
│ │ └── common/ # Guards, decorators, shared utils
│ ├── prisma/
│ │ ├── schema.prisma # โมเดลฐานข้อมูล
│ │ └── migrations/ # ไฟล์ migration
│ └── test/
│
├── frontend/ # React + Vite + TS
│ ├── src/
│ │ ├── pages/
│ │ │ ├── login/ # หน้า Login
│ │ │ ├── reception/ # Reception flow
│ │ │ ├── foreman/ # Foreman dashboard & jobs
│ │ │ ├── mechanic/ # Mechanic job views
│ │ │ ├── inventory/ # Parts, Requests, POs
│ │ │ ├── accountant/ # Pending payments, history
│ │ │ ├── owner/ # Owner dashboards & reports
│ │ │ ├── admin/ # Admin dashboard
│ │ │ └── workshop/ # Workshop queue view
│ │ ├── components/ # UI components เช่น Sidebar, AppHeader
│ │ ├── services/ # เรียก backend API (payments, parts ฯลฯ)
│ │ ├── contexts/ # AuthContext, RequestHistoryContext
│ │ ├── hooks/ # custom hooks
│ │ └── lib/ # api client, helpers
│ └── public/ # assets (logo, background)
│
├── docs/ # เอกสารเสริม
│ ├── QUICK_START_GUIDE.md
│ └── TEAM_ASSIGNMENT_DETAILED.md
│
├── .github/ # GitHub Actions workflows
└── README.md # ไฟล์นี

---

## การเริ่มต้นใช้งาน

รายละเอียดแบบ step-by-step ดูได้ใน `docs/QUICK_START_GUIDE.md` ส่วนนี้จะเป็นสรุปภาพรวม

### 1. สิ่งที่ต้องมี

- Git
- Node.js เวอร์ชัน LTS (เช่น 18.x หรือ 20.x)
- npm
- Docker Desktop
- เครื่องมือแก้ไขโค้ด (เช่น VS Code)

### 2. Clone และติดตั้ง dependencies
bash
git clone https://github.com/nicky-wrc/smart-moto-service-center.git
cd smart-moto-service-center
แนะนำให้ใช้ branch develop
git checkout develop
git pull
ติดตั้ง backend
cd backend
npm install
cd ..
ติดตั้ง frontend
cd frontend
npm install
cd ..

### 3. ตั้งค่า Environment

ในโฟลเดอร์ `backend` สร้างไฟล์ `.env` จากตัวอย่าง
bash
cd backend
Windows
copy .env.example .env
macOS / Linux
cp .env.example .env

ปรับค่า `backend/.env` ให้ตรงกับเครื่องคุณ เช่น
env
DATABASE_URL="postgresql://smartmoto:smartmoto_pw@127.0.0.1:5433/smartmoto?schema=public"
JWT_SECRET="your_secret_key_here_change_me"
JWT_EXPIRES_IN="1d"
PORT=4000
NODE_ENV=development

### 4. ตั้งค่า Database

จาก root ของโปรเจกต์:
bash
เปิด PostgreSQL ผ่าน Docker
docker compose up -d
ตรวจ container
docker ps

จากนั้น

bash
cd backend
Generate Prisma Client
npx prisma generate
Push schema เข้าฐานข้อมูล
npx prisma db push
(ถ้ามีสคริปต์ seed) เติมข้อมูลตัวอย่าง
npm run prisma:seed


### 5. รันระบบ

Backend:

bash
cd backend
npm run start:dev


Frontend:

bash
cd frontend
npm run dev


การเข้าถึง:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000/api`
- Swagger UI: `http://localhost:4000/docs`

---

## บัญชีทดสอบ

หลังจาก seed ข้อมูลแล้ว (หรือใช้ข้อมูลตัวอย่างที่เตรียมไว้) สามารถใช้บัญชีต่อไปนี้:

| Username | Password    | Role             |
|----------|-------------|------------------|
| admin    | password123 | ADMIN            |
| owner1   | password123 | MANAGER / OWNER  |
| sa1      | password123 | SERVICE_ADVISOR  |
| foreman1 | password123 | FOREMAN          |
| tech1    | password123 | TECHNICIAN       |
| cashier1 | password123 | CASHIER          |
| stock1   | password123 | STOCK_KEEPER     |

แต่ละ Role จะถูก redirect ไปยังหน้าเริ่มต้นที่เหมาะสม (เช่น Admin → `/admin/dashboard`, Owner → `/owner/dashboard`, Cashier → `/accountant/dashboard` เป็นต้น)

---

## Git Workflow ที่ใช้

### Branch Strategy

- `main`  
  โค้ดสำหรับ production ห้าม push ตรง ให้ใช้ Pull Request เท่านั้น

- `develop`  
  Branch สำหรับรวมงานจากทีม ใช้เป็น base ในการสร้าง feature branch

- `feature/<name>`  
  งานฟีเจอร์ใหม่ เช่น `feature/inventory-package`

- `bugfix/<issue-id>-<description>`  
  ใช้แก้บั๊กเฉพาะจุด

### ตัวอย่างการทำงาน

bash
อัปเดต develop
git checkout develop
git pull origin develop
สร้าง feature branch
git checkout -b feature/owner-dashboard-chart
พัฒนา และ commit
git add .
git commit -m "feat(owner): add daily revenue chart"
Push ขึ้น remote
git push -u origin feature/owner-dashboard-chart


จากนั้นสร้าง Pull Request ไปที่ `develop` บน GitHub ตาม template ที่กำหนด

รายละเอียดเพิ่มเติมดูได้ที่ `backend/GIT_CONVENTIONS.md`

---

## คำสั่งที่ใช้บ่อย

### Database / Docker

bash
เปิดฐานข้อมูล
docker compose up -d
ปิดฐานข้อมูล
docker compose down
ล้างฐานข้อมูลทั้งหมด (รวม volume)
docker compose down -v


### Prisma

bash
Sync schema ไปที่ DB
npx prisma db push
Generate Prisma Client
npx prisma generate
เปิด Prisma Studio (UI ดูข้อมูล)
npx prisma studio


### Development

bash
Backend
cd backend
npm run start:dev
Frontend
cd frontend
npm run dev
Backend tests
cd backend
npm run test
Lint
npm run lint


---

## แนวทางการแก้ปัญหาเบื้องต้น

1. Database เชื่อมต่อไม่ได้
   - ตรวจสอบว่า Docker container ของ PostgreSQL ทำงานอยู่ (`docker ps`)
   - ตรวจสอบค่า `DATABASE_URL` ใน `.env` ว่าถูกต้อง และ port ตรงกับ `docker-compose.yml`

2. Error จาก Prisma (เช่น generate ไม่ผ่าน)
   - ลบ `node_modules` ของ backend แล้วติดตั้งใหม่
   - รัน `npx prisma generate` และ `npx prisma db push` อีกครั้ง
   - ตรวจสอบว่าไม่มี process อื่นล็อกไฟล์ของ Prisma อยู่ (โดยเฉพาะบน Windows)

3. Port ชน
   - Backend: แก้ไข `PORT` ใน `backend/.env`
   - Frontend (Vite): จะเพิ่ม port ให้เองโดยอัตโนมัติ แต่สามารถกำหนดเองได้ใน `vite.config.ts` ถ้าต้องการ

---

## ข้อควรระวัง

- ห้าม commit ไฟล์ที่มีข้อมูลสำคัญ เช่น `.env`, key, secret, หรือ credential ใด ๆ ลง Git
- ไม่ควร commit `node_modules` หรือไฟล์ที่ build แล้ว
- หลีกเลี่ยงการใช้ `git push --force` กับ branch ที่ใช้ร่วมกัน (โดยเฉพาะ `develop` และ `main`)
- การเปลี่ยนแปลง schema ของฐานข้อมูลควรตรวจสอบผลกระทบกับ Flow ทั้งระบบเสมอ

---

## สถานะโดยรวมของระบบ (ภาพรวมปัจจุบัน)

- Backend
  - Core workflow ครบแล้ว (Reception → Jobs → Parts → Payments → Reports)
  - การตัดสต็อกและเพิ่มสต็อกจาก PO ทำงานตาม business logic
  - Payment flow รองรับการสร้าง Payment จากงานที่พร้อมส่งมอบ และการ Process Payment ที่อัปเดตทั้งสถานะ Payment และ Job
  - Reports API รองรับรายงานรายวัน รายเดือน กำไร และสถานะงานค้าง

- Frontend
  - ทุก Role หลัก (Admin, Owner, Service Advisor, Foreman, Mechanic, Stock Keeper, Cashier) มีหน้าใช้งานครบตาม Flow
  - การเชื่อมต่อ API ตรงตาม DTO และ business rule ล่าสุด
  - Dashboard / Reports แสดงผลจากข้อมูลจริงในระบบ พร้อมกราฟและสามารถดาวน์โหลดรายการเป็น PDF

รายละเอียดเชิงลึกของสถานะงาน ดูเพิ่มเติมได้ที่ `backend/PROJECT_STATUS_REPORT.md`

---

## เอกสารประกอบเพิ่มเติม

- `docs/QUICK_START_GUIDE.md`  
  คู่มือเริ่มต้นแบบละเอียดสำหรับการตั้งค่าสภาพแวดล้อมและรันระบบ

- `docs/TEAM_ASSIGNMENT_DETAILED.md`  
  รายละเอียดหน้าที่ของสมาชิกทีมแต่ละคน

- `backend/COMPLETE_API_TESTING_GUIDE.md`  
  แนวทางการทดสอบ API แต่ละชุด พร้อมตัวอย่าง request/response

- `frontend/README.md`  
  รายละเอียดเพิ่มเติมฝั่ง Frontend

- `backend/GIT_CONVENTIONS.md`  
  มาตรฐานการตั้งชื่อ branch, commit message, และ Pull Request

---

This project is intended for educational and demonstration purposes.  
หากมีการเปลี่ยนแปลง business logic หรือ Flow ใหม่ ควรอัปเดต README และเอกสารใน `docs/` ให้สอดคล้องกับระบบทุกครั้ง

