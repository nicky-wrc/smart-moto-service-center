# 🧪 คู่มือทดสอบระบบ - Smart Moto Service Center

**อัปเดตล่าสุด:** 2024-12-20

---

## 📋 สารบัญ

1. [Test Accounts](#test-accounts)
2. [ทดสอบ Authentication](#ทดสอบ-authentication)
3. [ทดสอบ Reception Module](#ทดสอบ-reception-module)
4. [ทดสอบ Workshop Module](#ทดสอบ-workshop-module)
5. [ทดสอบ Inventory Module](#ทดสอบ-inventory-module)
6. [ทดสอบ Billing/CRM Module](#ทดสอบ-billingcrm-module)
7. [ทดสอบ Admin/Dashboard](#ทดสอบ-admindashboard)

---

## 🔑 Test Accounts

หลังจาก seed ข้อมูลแล้ว ใช้ account เหล่านี้:

| Username | Password | Role | คำอธิบาย |
|----------|----------|------|----------|
| `admin` | `password123` | ADMIN | ผู้ดูแลระบบ - เข้าถึงได้ทุกอย่าง |
| `sa1` | `password123` | SERVICE_ADVISOR | พนักงานรับรถ - Reception |
| `tech1` | `password123` | TECHNICIAN | ช่าง - Workshop |
| `cashier1` | `password123` | CASHIER | การเงิน - Billing |
| `stock1` | `password123` | STOCK_KEEPER | คลัง - Inventory |

---

## 1. ทดสอบ Authentication

### 1.1 Login

**ขั้นตอน:**
1. เปิด `http://localhost:5173`
2. จะถูก redirect ไป `/login` อัตโนมัติ
3. Login ด้วย `sa1` / `password123`
4. ✅ ควร redirect ไป `/dashboard` และเห็น Dashboard

**ตรวจสอบ:**
- [ ] Login สำเร็จ
- [ ] Token ถูกบันทึกใน localStorage
- [ ] User info แสดงใน Header
- [ ] Navigation bar แสดงเมนูตาม Role

### 1.2 Logout

**ขั้นตอน:**
1. คลิกที่ user menu (มุมขวาบน)
2. คลิก "ออกจากระบบ"
3. ✅ ควร redirect ไป `/login` และ token ถูกลบ

---

## 2. ทดสอบ Reception Module

### 2.1 ค้นหาลูกค้า

**Account:** `sa1` / `password123`

**ขั้นตอน:**
1. Login ด้วย `sa1`
2. ไปที่ `/reception/customers` หรือคลิก "จัดการลูกค้า" จาก Dashboard
3. ✅ ควรเห็นหน้าค้นหาลูกค้า
4. พิมพ์ค้นหา (เช่น "ฟ") ในช่องค้นหา
5. ✅ ควรเห็นรายการลูกค้า

**ตรวจสอบ:**
- [ ] หน้าโหลดสำเร็จ
- [ ] แสดงรายการลูกค้า
- [ ] ค้นหาได้
- [ ] คลิกที่ลูกค้าเพื่อดูรายละเอียดได้

### 2.2 สร้างลูกค้าใหม่

**ขั้นตอน:**
1. ไปที่ `/reception/customers`
2. คลิกปุ่ม "+ เพิ่มลูกค้าใหม่"
3. กรอกข้อมูล:
   - เบอร์โทร: `0812345678`
   - คำนำหน้า: `นาย`
   - ชื่อ: `ทดสอบ`
   - นามสกุล: `ระบบ`
   - ที่อยู่: `123 ถนนทดสอบ`
4. คลิก "บันทึก"
5. ✅ ควรสร้างสำเร็จและ redirect ไปหน้า detail

**ตรวจสอบ:**
- [ ] Form validation ทำงาน
- [ ] สร้างสำเร็จ
- [ ] Redirect ไปหน้า detail
- [ ] ข้อมูลแสดงถูกต้อง

### 2.3 เพิ่มรถจักรยานยนต์

**ขั้นตอน:**
1. ไปที่หน้า detail ของลูกค้า
2. คลิก "+ เพิ่มรถจักรยานยนต์"
3. กรอกข้อมูล:
   - เลข VIN: `VIN123456789`
   - ทะเบียน: `กก 1234`
   - ยี่ห้อ: `Honda`
   - รุ่น: `PCX 160`
   - สี: `ขาว`
   - ปี: `2024`
4. คลิก "บันทึก"
5. ✅ ควรเพิ่มสำเร็จ

**ตรวจสอบ:**
- [ ] เพิ่มสำเร็จ
- [ ] รถแสดงในรายการรถของลูกค้า

### 2.4 สร้าง Job Order

**ขั้นตอน:**
1. ไปที่ `/reception/jobs/new`
2. เลือกรถที่เพิ่งสร้าง
3. กรอกข้อมูล:
   - ประเภทงาน: `ปกติ`
   - อาการ/ปัญหา: `มีเสียงผิดปกติที่ล้อหน้า`
   - ระดับน้ำมัน: `80`
   - ของมีค่าในรถ: `ไม่มี`
4. คลิก "สร้างงานซ่อม"
5. ✅ ควรสร้างสำเร็จและได้ Job No

**ตรวจสอบ:**
- [ ] สร้างสำเร็จ
- [ ] ได้ Job No (เช่น JOB-20241220-0001)
- [ ] Job status = PENDING
- [ ] สามารถดูรายละเอียดได้

### 2.5 ดูนัดหมาย

**ขั้นตอน:**
1. ไปที่ `/reception/appointments`
2. ✅ ควรเห็นรายการนัดหมาย
3. คลิก filter "วันนี้", "ที่จะมาถึง", "เสร็จแล้ว"
4. ✅ ควร filter ได้ถูกต้อง

**ตรวจสอบ:**
- [ ] แสดงรายการนัดหมาย
- [ ] Filter ทำงาน
- [ ] แสดงสถานะ badge
- [ ] คลิกดูรายละเอียดได้

### 2.6 ปฏิทินนัดหมาย

**ขั้นตอน:**
1. ไปที่ `/reception/appointments/calendar`
2. ✅ ควรเห็นปฏิทิน
3. คลิกวันที่ที่มีนัดหมาย
4. ✅ ควรเห็นรายการนัดหมายของวันนั้น

**ตรวจสอบ:**
- [ ] ปฏิทินแสดงถูกต้อง
- [ ] แสดงจำนวนนัดหมายในแต่ละวัน
- [ ] คลิกวันที่แล้วแสดงรายการได้
- [ ] ปุ่ม Next/Prev เดือนทำงาน

---

## 3. ทดสอบ Workshop Module

### 3.1 ดู Job Queue

**Account:** `tech1` / `password123`

**ขั้นตอน:**
1. Logout และ login ด้วย `tech1`
2. ไปที่ `/workshop/queue` หรือคลิก "คิวงาน" จาก Dashboard
3. ✅ ควรเห็น Job Queue
4. ตรวจสอบว่า Fast Track jobs แสดงก่อน Normal jobs

**ตรวจสอบ:**
- [ ] แสดงรายการงาน
- [ ] Fast Track แสดงก่อน
- [ ] แสดงสถานะ badge
- [ ] คลิกดูรายละเอียดได้

### 3.2 ดูรายละเอียดงาน

**ขั้นตอน:**
1. คลิกงานจาก Job Queue
2. ✅ ควรเห็นหน้า Job Detail
3. ตรวจสอบข้อมูล:
   - ข้อมูลลูกค้าและรถ
   - อาการ/ปัญหา
   - สถานะงาน

**ตรวจสอบ:**
- [ ] แสดงข้อมูลครบถ้วน
- [ ] แสดงปุ่ม Actions

### 3.3 เพิ่ม Checklist

**ขั้นตอน:**
1. ในหน้า Job Detail
2. คลิก "+ เพิ่มรายการ" ในส่วน Checklist
3. กรอกข้อมูล:
   - รายการ: `ไฟหน้า`
   - สภาพ: `ต้องซ่อม`
   - หมายเหตุ: `ไฟไม่สว่าง`
4. คลิก checkmark เพื่อบันทึก
5. ✅ ควรเพิ่มสำเร็จ

**ตรวจสอบ:**
- [ ] เพิ่มรายการได้
- [ ] แสดงในรายการ Checklist
- [ ] ลบรายการได้ (ถ้า status ไม่ใช่ COMPLETED/PAID)

### 3.4 ขอเบิกอะไหล่

**ขั้นตอน:**
1. ในหน้า Job Detail
2. คลิก "ขอเบิกอะไหล่"
3. ✅ ควรไปหน้า Part Requisition
4. เลือกประเภท: "อะไหล่" หรือ "ชุดอะไหล่"
5. เลือกอะไหล่จาก dropdown
6. ใส่จำนวน
7. คลิก "เพิ่ม"
8. ✅ ควรเห็นในรายการ
9. คลิก "ส่งคำขอเบิก"
10. ✅ ควรสร้าง Requisition สำเร็จ

**ตรวจสอบ:**
- [ ] เลือกอะไหล่ได้
- [ ] เพิ่มรายการได้
- [ ] แสดงสต็อก (ถ้าสต็อกไม่พอจะแจ้งเตือน)
- [ ] สร้าง Requisition สำเร็จ
- [ ] Status = PENDING

---

## 4. ทดสอบ Inventory Module

### 4.1 ดูและจัดการอะไหล่ (Part Master)

**Account:** `stock1` / `password123`

**ขั้นตอน:**
1. Logout และ login ด้วย `stock1`
2. ไปที่ `/inventory/parts` หรือคลิก "จัดการอะไหล่" จาก Inventory
3. ✅ ควรเห็นหน้ารายการอะไหล่
4. ค้นหาอะไหล่ (เช่น "oil")
5. ✅ ควร filter ได้

**ตรวจสอบ:**
- [ ] แสดงรายการอะไหล่
- [ ] ค้นหาได้
- [ ] แสดงสต็อกและจุดสั่งซื้อ
- [ ] แสดง alert ถ้าสต็อกต่ำ (Low Stock)

### 4.2 เพิ่มอะไหล่ใหม่

**ขั้นตอน:**
1. ในหน้า Part Master
2. คลิก "+ เพิ่มอะไหล่"
3. กรอกข้อมูล:
   - รหัสอะไหล่: `PART-001`
   - ชื่ออะไหล่: `น้ำมันเครื่อง`
   - ยี่ห้อ: `Shell`
   - หมวดหมู่: `น้ำมัน`
   - หน่วย: `ลิตร`
   - ราคาต่อหน่วย: `350`
   - จำนวนสต็อก: `10`
   - จุดสั่งซื้อ: `5`
   - จำนวนสั่งซื้อ: `20`
4. คลิก "บันทึก"
5. ✅ ควรสร้างสำเร็จ

**ตรวจสอบ:**
- [ ] Form validation ทำงาน
- [ ] สร้างสำเร็จ
- [ ] แสดงในรายการ
- [ ] แก้ไขได้
- [ ] ลบได้ (Soft delete)

### 4.3 รับของเข้า (Goods Receipt)

**ขั้นตอน:**
1. ไปที่ `/inventory/receipts` (กำลังพัฒนา - placeholder)
2. หรือใช้ API โดยตรงผ่าน Swagger

**หมายเหตุ:** หน้าอาจยังไม่พร้อม ให้ทดสอบผ่าน API ก่อน

### 4.4 อนุมัติและเบิกอะไหล่

**ขั้นตอน:**
1. ไปที่ `/inventory/issue` (กำลังพัฒนา - placeholder)
2. หรือใช้ API โดยตรงผ่าน Swagger

**หมายเหตุ:** หน้าอาจยังไม่พร้อม ให้ทดสอบผ่าน API ก่อน

---

## 5. ทดสอบ Billing/CRM Module

### 5.1 สร้าง Invoice

**Account:** `cashier1` / `password123`

**ขั้นตอน:**
1. Logout และ login ด้วย `cashier1`
2. ไปที่ `/billing` (กำลังพัฒนา - placeholder)
3. หรือใช้ API โดยตรงผ่าน Swagger

**หมายเหตุ:** หน้าอาจยังไม่พร้อม ให้ทดสอบผ่าน API ก่อน

### 5.2 จัดการแต้มสะสม

**ขั้นตอน:**
1. ใช้ API โดยตรงผ่าน Swagger

**หมายเหตุ:** หน้าอาจยังไม่พร้อม ให้ทดสอบผ่าน API ก่อน

---

## 6. ทดสอบ Admin/Dashboard

### 6.1 Dashboard Overview

**Account:** `admin` / `password123`

**ขั้นตอน:**
1. Login ด้วย `admin`
2. ไปที่ `/dashboard`
3. ✅ ควรเห็น Dashboard พร้อม:
   - Welcome message
   - Summary cards (งานรอรับ, นัดหมายวันนี้, งานในคิว, etc.)
   - Main menu cards

**ตรวจสอบ:**
- [ ] Dashboard โหลดสำเร็จ
- [ ] แสดง summary cards ตาม role
- [ ] Main menu cards แสดงถูกต้อง
- [ ] คลิกเมนูไปหน้าต่างๆ ได้

### 6.2 Reports

**ขั้นตอน:**
1. ไปที่ `/admin` (กำลังพัฒนา - placeholder)
2. หรือใช้ API โดยตรงผ่าน Swagger

**หมายเหตุ:** หน้าอาจยังไม่พร้อม ให้ทดสอบผ่าน API ก่อน

---

## 🔧 ทดสอบผ่าน Swagger UI

### เปิด Swagger:

1. รัน Backend: `cd backend && npm run start:dev`
2. เปิด browser: `http://localhost:4000/docs`
3. Login เพื่อรับ Token:
   - POST `/api/auth/login`
   - Body: `{ "username": "sa1", "password": "password123" }`
   - Copy `access_token`
4. คลิกปุ่ม "Authorize" (มุมขวาบน)
5. ใส่ `Bearer <access_token>`
6. ✅ ตอนนี้สามารถทดสอบ API ได้ทั้งหมด

### APIs ที่ควรทดสอบ:

#### Reception:
- ✅ `GET /api/customers` - ดูรายการลูกค้า
- ✅ `POST /api/customers` - สร้างลูกค้าใหม่
- ✅ `GET /api/motorcycles` - ดูรายการรถ
- ✅ `POST /api/motorcycles` - เพิ่มรถ
- ✅ `POST /api/jobs` - สร้าง Job
- ✅ `GET /api/appointments` - ดูนัดหมาย
- ✅ `POST /api/appointments` - สร้างนัดหมาย

#### Workshop:
- ✅ `GET /api/jobs/queue` - ดู Job Queue
- ✅ `PATCH /api/jobs/:id/start` - เริ่มงาน
- ✅ `GET /api/job-checklists/job/:jobId` - ดู Checklist
- ✅ `POST /api/job-checklists/job/:jobId/item` - เพิ่ม Checklist Item
- ✅ `POST /api/part-requisitions` - ขอเบิกอะไหล่

#### Inventory:
- ✅ `GET /api/parts` - ดูรายการอะไหล่
- ✅ `POST /api/parts` - เพิ่มอะไหล่
- ✅ `POST /api/parts/receipts` - รับของเข้า (Goods Receipt)
- ✅ `GET /api/part-requisitions` - ดู Requisitions
- ✅ `PATCH /api/part-requisitions/:id/approve` - อนุมัติ
- ✅ `PATCH /api/part-requisitions/:id/issue` - เบิกอะไหล่
- ✅ `GET /api/part-packages` - ดูชุดอะไหล่
- ✅ `POST /api/part-packages` - สร้างชุดอะไหล่

#### Billing/CRM:
- ✅ `POST /api/invoices` - สร้าง Invoice
- ✅ `GET /api/payments` - ดู Payments
- ✅ `POST /api/customers/points/earn` - สะสมแต้ม
- ✅ `GET /api/customers/:id/points` - ดูแต้ม

#### Reports:
- ✅ `GET /api/reports/dashboard/sales-summary` - สรุปยอดขาย
- ✅ `GET /api/reports/dashboard/top-parts` - อะไหล่ขายดี
- ✅ `GET /api/reports/dashboard/technician-performance` - ประสิทธิภาพช่าง

---

## 📝 Checklist การทดสอบ

### ✅ Reception Module
- [ ] Login ด้วย SA account
- [ ] ค้นหาลูกค้า
- [ ] สร้างลูกค้าใหม่
- [ ] เพิ่มรถจักรยานยนต์
- [ ] สร้าง Job Order
- [ ] ดูนัดหมาย (List & Calendar)
- [ ] สร้างนัดหมาย (ผ่าน API)

### ✅ Workshop Module
- [ ] Login ด้วย Technician account
- [ ] ดู Job Queue
- [ ] ดูรายละเอียดงาน
- [ ] เพิ่ม Checklist Items
- [ ] ขอเบิกอะไหล่ (Part Requisition)

### ✅ Inventory Module
- [ ] Login ด้วย Stock Keeper account
- [ ] ดูและจัดการอะไหล่
- [ ] เพิ่ม/แก้ไข/ลบอะไหล่
- [ ] รับของเข้า (Goods Receipt) - ผ่าน API
- [ ] อนุมัติ/ปฏิเสธ Requisition - ผ่าน API
- [ ] เบิกอะไหล่ (Issue) - ผ่าน API

### ✅ Billing/CRM Module
- [ ] Login ด้วย Cashier account
- [ ] สร้าง Invoice - ผ่าน API
- [ ] จัดการ Payment - ผ่าน API
- [ ] สะสม/ใช้แต้ม - ผ่าน API

### ✅ Admin/Dashboard
- [ ] Login ด้วย Admin account
- [ ] ดู Dashboard
- [ ] ดู Reports - ผ่าน API

---

## 🐛 การ Debug

### ปัญหาที่พบบ่อย:

#### 1. "Cannot connect to API"
- **แก้ไข:** ตรวจสอบว่า Backend กำลังรันอยู่ที่ `http://localhost:4000`
- ตรวจสอบ `.env` ว่า `VITE_API_URL` ถูกต้องหรือไม่

#### 2. "401 Unauthorized"
- **แก้ไข:** Token หมดอายุ หรือไม่ได้ใส่ Token
- Logout และ Login ใหม่
- ตรวจสอบใน DevTools > Application > Local Storage

#### 3. "404 Not Found"
- **แก้ไข:** ตรวจสอบ route ว่าใส่ถูกต้อง
- ตรวจสอบว่า Backend route มี prefix `/api`

#### 4. "CORS Error"
- **แก้ไข:** ตรวจสอบว่า Backend มี `app.enableCors()` ใน `main.ts`

---

## 🎯 Workflow การทดสอบแบบ End-to-End

### Scenario: รับรถ → ซ่อม → เบิกอะไหล่ → คิดเงิน

1. **SA รับรถ:**
   - Login ด้วย `sa1`
   - ค้นหาหรือสร้างลูกค้า
   - เพิ่มรถ (ถ้ายังไม่มี)
   - สร้าง Job Order (อาการ: "มีเสียงผิดปกติ")

2. **ช่างรับงาน:**
   - Login ด้วย `tech1`
   - ดู Job Queue
   - เปิด Job Detail
   - เพิ่ม Checklist Items
   - ขอเบิกอะไหล่ (Part Requisition)

3. **คลังอนุมัติและเบิก:**
   - Login ด้วย `stock1`
   - ดู Requisitions (ผ่าน API หรือหน้า Issue)
   - อนุมัติ Requisition
   - เบิกอะไหล่ (Issue)

4. **ช่างเสร็จงาน:**
   - กลับไปหน้า Job Detail
   - ตรวจสอบว่า Checklist เสร็จแล้ว
   - ปิดงาน (Complete Job) - ผ่าน API

5. **การเงินคิดเงิน:**
   - Login ด้วย `cashier1`
   - สร้าง Invoice (ผ่าน API)
   - Process Payment (ผ่าน API)
   - ✅ แต้มควรสะสมอัตโนมัติ

---

## 📊 สรุปผลการทดสอบ

หลังจากทดสอบเสร็จแล้ว ให้บันทึก:

- ✅ Features ที่ทำงานได้ดี
- ⚠️ Features ที่มีปัญหา/ต้องปรับปรุง
- ❌ Features ที่ยังไม่ได้ทำ

---

**Happy Testing! 🚀**
