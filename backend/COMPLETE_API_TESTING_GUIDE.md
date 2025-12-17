# 📖 คู่มือการทดสอบ API ฉบับสมบูรณ์ - Smart Moto Service Center

## 📋 สารบัญ

1. [Prerequisites](#prerequisites)
2. [Setup เบื้องต้น](#setup-เบื้องต้น)
3. [Authentication](#1-authentication)
4. [Reception Workflow (ขั้นตอนการรับงาน)](#2-reception-workflow-ขั้นตอนการรับงาน)
5. [Workshop Workflow (ขั้นตอนการซ่อม)](#3-workshop-workflow-ขั้นตอนการซ่อม)
6. [Inventory Management (การจัดการสต็อก)](#4-inventory-management-การจัดการสต็อก)
7. [Billing & Payment (การชำระเงิน)](#5-billing--payment-การชำระเงิน)
8. [Quotation Workflow (ใบเสนอราคา)](#6-quotation-workflow-ใบเสนอราคา)
9. [Testing Checklist](#testing-checklist)

---

## Prerequisites

- ✅ Backend server running (`npm run start:dev`)
- ✅ Database connected and seeded (`npm run prisma:seed`)
- ✅ Swagger UI available at `http://localhost:4000/docs`
- ✅ Browser สำหรับเปิด Swagger UI

---

## Setup เบื้องต้น

### 1. ตรวจสอบว่า Server ทำงาน

เปิดเบราว์เซอร์ไปที่: `http://localhost:4000/docs`

**Expected:** ควรเห็น Swagger UI พร้อม API endpoints ทั้งหมด

### 2. ตรวจสอบ Health Check (Optional)

**Endpoint:** `GET /api`

**Request:**
- ไม่ต้องใส่ parameters
- ไม่ต้อง authorize

**Expected Response:**
```json
{
  "message": "Smart Moto Service Center API"
}
```

---

## 1. Authentication

### Step 1.1: Login เพื่อรับ JWT Token

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**ขั้นตอน:**
1. เปิด `/api/auth/login` endpoint ใน Swagger UI
2. คลิก "Try it out"
3. ใส่ข้อมูล username และ password
4. คลิก "Execute"
5. **สำคัญ:** คัดลอก `access_token` จาก response

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "name": "ผู้ดูแลระบบ",
    "role": "ADMIN"
  }
}
```

**Status Code:** `200 OK`

### Step 1.2: Authorize ใน Swagger UI

**ขั้นตอน:**
1. คลิกปุ่ม **"Authorize"** (รูปแม่กุญแจ 🔒) ที่มุมบนขวาของ Swagger UI
2. ในช่อง "Value" ใส่ **token ที่ได้จาก Step 1.1** (ใส่แค่ token ไม่ต้องใส่ "Bearer")
3. คลิก **"Authorize"**
4. คลิก **"Close"**

**ผลลัพธ์:** ทุก API endpoint ที่ต้องการ authentication จะใช้ token นี้อัตโนมัติ

**หมายเหตุ:** Token จะหมดอายุหลังจาก 1 วัน หรือเมื่อ logout

---

## 2. Reception Workflow (ขั้นตอนการรับงาน)

### Step 2.1: สร้าง Customer (ลงทะเบียนลูกค้า)

**Endpoint:** `POST /api/customers`

**Authorization:** ✅ Required (JWT Token)

**Request Body:**
```json
{
  "phoneNumber": "0812345678",
  "title": "นาย",
  "firstName": "สมชาย",
  "lastName": "ใจดี",
  "address": "123 ถนนสุขุมวิท กรุงเทพฯ 10110"
}
```

**ขั้นตอน:**
1. เปิด `/api/customers` endpoint (POST)
2. คลิก "Try it out"
3. ใส่ข้อมูลตาม Request Body
4. คลิก "Execute"

**Expected Response:**
```json
{
  "id": 1,
  "phoneNumber": "0812345678",
  "title": "นาย",
  "firstName": "สมชาย",
  "lastName": "ใจดี",
  "address": "123 ถนนสุขุมวิท กรุงเทพฯ 10110",
  "taxId": null,
  "points": 0,
  "createdAt": "2024-12-18T02:30:00.000Z",
  "updatedAt": "2024-12-18T02:30:00.000Z"
}
```

**Status Code:** `201 Created`

**📝 จด ID:** `1` (จะใช้ในขั้นตอนต่อไป)

---

### Step 2.2: สร้าง Motorcycle (ลงทะเบียนรถ)

**Endpoint:** `POST /api/motorcycles`

**Authorization:** ✅ Required

**Request Body:**
```json
{
  "vin": "VIN123456789",
  "licensePlate": "กข 1234",
  "brand": "Honda",
  "model": "Wave 110i",
  "color": "แดง",
  "year": 2022,
  "engineNo": "ENG123456",
  "mileage": 5000,
  "ownerId": 1
}
```

**ขั้นตอน:**
1. เปิด `/api/motorcycles` endpoint (POST)
2. คลิก "Try it out"
3. ใส่ข้อมูลตาม Request Body (ownerId ใช้ ID จาก Step 2.1)
4. คลิก "Execute"

**Expected Response:**
```json
{
  "id": 1,
  "vin": "VIN123456789",
  "licensePlate": "กข 1234",
  "brand": "Honda",
  "model": "Wave 110i",
  "color": "แดง",
  "year": 2022,
  "engineNo": "ENG123456",
  "mileage": 5000,
  "ownerId": 1,
  "createdAt": "2024-12-18T02:31:00.000Z",
  "updatedAt": "2024-12-18T02:31:00.000Z"
}
```

**Status Code:** `201 Created`

**📝 จด ID:** `1` (จะใช้ในขั้นตอนต่อไป)

---

### Step 2.3: ตรวจสอบ Warranty (Warranty Check)

**Endpoint:** `GET /api/warranties/check/motorcycle/{motorcycleId}`

**Authorization:** ✅ Required

**Path Parameters:**
- `motorcycleId`: `1` (ID จาก Step 2.2)

**Query Parameters (Optional):**
- `currentMileage`: `5000`

**ขั้นตอน:**
1. เปิด `/api/warranties/check/motorcycle/{motorcycleId}` endpoint
2. คลิก "Try it out"
3. ใส่ `motorcycleId` = `1`
4. ใส่ `currentMileage` = `5000` (optional)
5. คลิก "Execute"

**Expected Response (ไม่มี Warranty):**
```json
{
  "hasWarranty": false,
  "message": "ไม่พบการรับประกัน",
  "warranties": []
}
```

**Status Code:** `200 OK`

---

### Step 2.4: สร้าง Appointment (นัดหมายซ่อม)

**Endpoint:** `POST /api/appointments`

**Authorization:** ✅ Required (Role: SERVICE_ADVISOR, ADMIN, MANAGER)

**Request Body:**
```json
{
  "motorcycleId": 1,
  "scheduledDate": "2024-12-25",
  "scheduledTime": "10:00",
  "notes": "นัดเช็คระยะ 5,000 กม."
}
```

**ขั้นตอน:**
1. เปิด `/api/appointments` endpoint (POST)
2. คลิก "Try it out"
3. ใส่ข้อมูลตาม Request Body
4. คลิก "Execute"

**Expected Response:**
```json
{
  "id": 1,
  "appointmentNo": "APT-20241218-0001",
  "motorcycleId": 1,
  "scheduledDate": "2024-12-25T10:00:00.000Z",
  "scheduledTime": "10:00",
  "status": "SCHEDULED",
  "notes": "นัดเช็คระยะ 5,000 กม.",
  "scheduledById": 1,
  "jobId": null,
  "createdAt": "2024-12-18T02:32:00.000Z",
  "updatedAt": "2024-12-18T02:32:00.000Z",
  "motorcycle": {
    "id": 1,
    "vin": "VIN123456789",
    "licensePlate": "กข 1234",
    "brand": "Honda",
    "model": "Wave 110i",
    "owner": {
      "id": 1,
      "phoneNumber": "0812345678",
      "firstName": "สมชาย",
      "lastName": "ใจดี"
    }
  },
  "scheduledBy": {
    "id": 1,
    "name": "ผู้ดูแลระบบ"
  }
}
```

**Status Code:** `201 Created`

**📝 จด ID:** `1` (จะใช้ใน Step 2.5)

---

### Step 2.5: แปลง Appointment เป็น Job Order

**Endpoint:** `POST /api/appointments/{id}/convert-to-job`

**Authorization:** ✅ Required (Role: SERVICE_ADVISOR, ADMIN, MANAGER)

**Path Parameters:**
- `id`: `1` (ID จาก Step 2.4)

**Request Body:**
```json
{
  "symptom": "เช็คระยะตามกำหนด",
  "jobType": "NORMAL",
  "fuelLevel": 70,
  "valuables": "ไม่มี"
}
```

**ขั้นตอน:**
1. เปิด `/api/appointments/{id}/convert-to-job` endpoint
2. คลิก "Try it out"
3. ใส่ `id` = `1`
4. ใส่ข้อมูลตาม Request Body
5. คลิก "Execute"

**Expected Response:**
```json
{
  "id": 1,
  "jobNo": "JOB-20241218-0001",
  "motorcycleId": 1,
  "appointmentId": 1,
  "receptionId": 1,
  "technicianId": null,
  "symptom": "เช็คระยะตามกำหนด",
  "jobType": "NORMAL",
  "status": "PENDING",
  "fuelLevel": 70,
  "valuables": "ไม่มี",
  "createdAt": "2024-12-18T02:33:00.000Z",
  "updatedAt": "2024-12-18T02:33:00.000Z",
  "motorcycle": {
    "id": 1,
    "vin": "VIN123456789",
    "licensePlate": "กข 1234",
    "brand": "Honda",
    "model": "Wave 110i",
    "owner": {
      "id": 1,
      "phoneNumber": "0812345678",
      "firstName": "สมชาย",
      "lastName": "ใจดี"
    }
  },
  "appointment": {
    "id": 1,
    "appointmentNo": "APT-20241218-0001",
    "scheduledDate": "2024-12-25T10:00:00.000Z"
  }
}
```

**Status Code:** `201 Created`

**📝 จด Job ID:** `1` และ **Job No:** `JOB-20241218-0001`

**หมายเหตุ:** 
- Appointment status จะเปลี่ยนเป็น `COMPLETED`
- Job status เป็น `PENDING` (รอช่างรับงาน)

---

### Step 2.6: สร้าง Job โดยตรง (Fast Track - งานด่วน)

**Endpoint:** `POST /api/jobs`

**Authorization:** ✅ Required (Role: SERVICE_ADVISOR, ADMIN, MANAGER)

**Request Body:**
```json
{
  "motorcycleId": 1,
  "symptom": "เครื่องสตาร์ทไม่ติด มีเสียงดังแก๊กๆ",
  "jobType": "FAST_TRACK",
  "fuelLevel": 50,
  "valuables": "หมวกกันน็อค 1 ใบ"
}
```

**ขั้นตอน:**
1. เปิด `/api/jobs` endpoint (POST)
2. คลิก "Try it out"
3. ใส่ข้อมูลตาม Request Body
4. คลิก "Execute"

**Expected Response:**
```json
{
  "id": 2,
  "jobNo": "JOB-20241218-0002",
  "motorcycleId": 1,
  "receptionId": 1,
  "technicianId": null,
  "symptom": "เครื่องสตาร์ทไม่ติด มีเสียงดังแก๊กๆ",
  "jobType": "FAST_TRACK",
  "status": "PENDING",
  "fuelLevel": 50,
  "valuables": "หมวกกันน็อค 1 ใบ",
  "createdAt": "2024-12-18T02:34:00.000Z",
  "updatedAt": "2024-12-18T02:34:00.000Z",
  "motorcycle": {
    "id": 1,
    "vin": "VIN123456789",
    "licensePlate": "กข 1234",
    "brand": "Honda",
    "model": "Wave 110i",
    "owner": {
      "id": 1,
      "phoneNumber": "0812345678",
      "firstName": "สมชาย",
      "lastName": "ใจดี"
    }
  },
  "reception": {
    "id": 1,
    "name": "ผู้ดูแลระบบ"
  }
}
```

**Status Code:** `201 Created`

**📝 จด Job ID:** `2`

**หมายเหตุ:** 
- `jobType: "FAST_TRACK"` จะถูกจัดลำดับก่อน `NORMAL` ใน Job Queue

---

### Step 2.7: ดู Job Queue (สำหรับช่าง)

**Endpoint:** `GET /api/jobs/queue`

**Authorization:** ✅ Required (Role: TECHNICIAN, FOREMAN, ADMIN, MANAGER)

**Query Parameters (Optional):**
- `technicianId`: ไม่ต้องใส่ (ถ้าต้องการดู queue เฉพาะช่างคนนั้น)

**ขั้นตอน:**
1. เปิด `/api/jobs/queue` endpoint
2. คลิก "Try it out"
3. คลิก "Execute"

**Expected Response:**
```json
[
  {
    "id": 2,
    "jobNo": "JOB-20241218-0002",
    "jobType": "FAST_TRACK",
    "status": "PENDING",
    "symptom": "เครื่องสตาร์ทไม่ติด มีเสียงดังแก๊กๆ",
    "motorcycle": {
      "id": 1,
      "licensePlate": "กข 1234",
      "brand": "Honda",
      "model": "Wave 110i",
      "owner": {
        "id": 1,
        "firstName": "สมชาย",
        "lastName": "ใจดี",
        "phoneNumber": "0812345678"
      }
    },
    "technician": null,
    "appointment": null
  },
  {
    "id": 1,
    "jobNo": "JOB-20241218-0001",
    "jobType": "NORMAL",
    "status": "PENDING",
    "symptom": "เช็คระยะตามกำหนด",
    "motorcycle": {
      "id": 1,
      "licensePlate": "กข 1234",
      "brand": "Honda",
      "model": "Wave 110i",
      "owner": {
        "id": 1,
        "firstName": "สมชาย",
        "lastName": "ใจดี",
        "phoneNumber": "0812345678"
      }
    },
    "technician": null,
    "appointment": {
      "appointmentNo": "APT-20241218-0001",
      "scheduledDate": "2024-12-25T10:00:00.000Z"
    }
  }
]
```

**Status Code:** `200 OK`

**หมายเหตุ:** 
- FAST_TRACK jobs จะมาก่อน NORMAL jobs
- จะแสดงเฉพาะ jobs ที่มี status: `PENDING`, `IN_PROGRESS`, หรือ `WAITING_PARTS`

---

## 3. Workshop Workflow (ขั้นตอนการซ่อม)

### Step 3.1: Assign Technician ให้ Job

**Endpoint:** `PATCH /api/jobs/{id}/assign`

**Authorization:** ✅ Required (Role: FOREMAN, ADMIN, MANAGER)

**Path Parameters:**
- `id`: `1` (Job ID)

**Request Body:**
```json
{
  "technicianId": 3
}
```

**ขั้นตอน:**
1. เปิด `/api/jobs/{id}/assign` endpoint
2. คลิก "Try it out"
3. ใส่ `id` = `1`
4. ใส่ `technicianId` = `3` (ต้องเป็น user ที่มี role = TECHNICIAN หรือ FOREMAN)
5. คลิก "Execute"

**Expected Response:**
```json
{
  "id": 1,
  "jobNo": "JOB-20241218-0001",
  "technicianId": 3,
  "status": "IN_PROGRESS",
  "technician": {
    "id": 3,
    "name": "ช่างสมศักดิ์",
    "role": "TECHNICIAN"
  },
  "motorcycle": {
    "id": 1,
    "licensePlate": "กข 1234",
    "brand": "Honda",
    "model": "Wave 110i",
    "owner": {
      "id": 1,
      "firstName": "สมชาย",
      "lastName": "ใจดี"
    }
  }
}
```

**Status Code:** `200 OK`

**หมายเหตุ:** 
- Job status จะเปลี่ยนเป็น `IN_PROGRESS` อัตโนมัติเมื่อ assign
- ถ้า technicianId ไม่มี role ที่ถูกต้อง จะได้ error 400

---

### Step 3.2: เริ่มงาน (Start Job)

**Endpoint:** `PATCH /api/jobs/{id}/start`

**Authorization:** ✅ Required (Role: TECHNICIAN, FOREMAN, ADMIN, MANAGER)

**Path Parameters:**
- `id`: `1` (Job ID)

**Request Body:**
- ไม่ต้องใส่ body (แต่ต้องมี CurrentUser จาก token)

**ขั้นตอน:**
1. เปิด `/api/jobs/{id}/start` endpoint
2. คลิก "Try it out"
3. ใส่ `id` = `1`
4. คลิก "Execute"

**Expected Response:**
```json
{
  "id": 1,
  "jobNo": "JOB-20241218-0001",
  "status": "IN_PROGRESS",
  "startedAt": "2024-12-18T02:40:00.000Z",
  "technician": {
    "id": 1,
    "name": "ผู้ดูแลระบบ"
  },
  "motorcycle": {
    "id": 1,
    "licensePlate": "กข 1234",
    "brand": "Honda",
    "model": "Wave 110i",
    "owner": {
      "id": 1,
      "firstName": "สมชาย",
      "lastName": "ใจดี"
    }
  }
}
```

**Status Code:** `200 OK`

**หมายเหตุ:** 
- Endpoint นี้ idempotent (เรียกหลายครั้งได้ ไม่ error)
- ถ้า job status เป็น `IN_PROGRESS` อยู่แล้ว จะ return job เดิม

---

### Step 3.3: เพิ่ม Job Checklist Items

**Endpoint:** `POST /api/job-checklists/job/{jobId}`

**Authorization:** ✅ Required (Role: TECHNICIAN, FOREMAN, SERVICE_ADVISOR, ADMIN, MANAGER)

**Path Parameters:**
- `jobId`: `1` (Job ID)

**Request Body:**
```json
[
  {
    "itemName": "น้ำมันเครื่อง",
    "condition": "ปกติ",
    "notes": "สีปกติ ไม่มีกลิ่น"
  },
  {
    "itemName": "เบรกหน้า",
    "condition": "ต้องเปลี่ยน",
    "notes": "เสื่อมสภาพ 50%"
  },
  {
    "itemName": "โซ่สเตอร์",
    "condition": "ปกติ",
    "notes": "ยังใช้ได้ดี"
  }
]
```

**ขั้นตอน:**
1. เปิด `/api/job-checklists/job/{jobId}` endpoint
2. คลิก "Try it out"
3. ใส่ `jobId` = `1`
4. ใส่ข้อมูล checklist items เป็น array
5. คลิก "Execute"

**Expected Response:**
```json
[
  {
    "id": 1,
    "jobId": 1,
    "itemName": "น้ำมันเครื่อง",
    "condition": "ปกติ",
    "notes": "สีปกติ ไม่มีกลิ่น",
    "createdAt": "2024-12-18T02:41:00.000Z"
  },
  {
    "id": 2,
    "jobId": 1,
    "itemName": "เบรกหน้า",
    "condition": "ต้องเปลี่ยน",
    "notes": "เสื่อมสภาพ 50%",
    "createdAt": "2024-12-18T02:41:00.000Z"
  },
  {
    "id": 3,
    "jobId": 1,
    "itemName": "โซ่สเตอร์",
    "condition": "ปกติ",
    "notes": "ยังใช้ได้ดี",
    "createdAt": "2024-12-18T02:41:00.000Z"
  }
]
```

**Status Code:** `201 Created`

---

### Step 3.4: เริ่มจับเวลาแรงงาน (Start Labor Time)

**Endpoint:** `POST /api/labor-times/start`

**Authorization:** ✅ Required (Role: TECHNICIAN, FOREMAN, ADMIN, MANAGER)

**Request Body:**
```json
{
  "jobId": 1,
  "taskDescription": "เปลี่ยนเบรกหน้า",
  "hourlyRate": 500,
  "standardMinutes": 30
}
```

**ขั้นตอน:**
1. เปิด `/api/labor-times/start` endpoint
2. คลิก "Try it out"
3. ใส่ข้อมูลตาม Request Body
4. คลิก "Execute"

**Expected Response:**
```json
{
  "id": 1,
  "jobId": 1,
  "technicianId": 1,
  "taskDescription": "เปลี่ยนเบรกหน้า",
  "standardMinutes": 30,
  "actualMinutes": 0,
  "hourlyRate": 500,
  "laborCost": 0,
  "startedAt": "2024-12-18T02:42:00.000Z",
  "pausedAt": null,
  "resumedAt": null,
  "finishedAt": null,
  "createdAt": "2024-12-18T02:42:00.000Z",
  "updatedAt": "2024-12-18T02:42:00.000Z",
  "technician": {
    "id": 1,
    "name": "ผู้ดูแลระบบ"
  },
  "job": {
    "id": 1,
    "jobNo": "JOB-20241218-0001"
  }
}
```

**Status Code:** `201 Created`

**📝 จด Labor Time ID:** `1`

**หมายเหตุ:** 
- `technicianId` จะดึงจาก token (CurrentUser) อัตโนมัติ
- `startedAt` จะถูกตั้งค่าอัตโนมัติ

---

### Step 3.5: หยุดจับเวลา (Pause Labor Time) - Optional

**Endpoint:** `PATCH /api/labor-times/{id}/pause`

**Authorization:** ✅ Required (Role: TECHNICIAN, FOREMAN, ADMIN, MANAGER)

**Path Parameters:**
- `id`: `1` (Labor Time ID จาก Step 3.4)

**Request Body:**
- ไม่ต้องใส่

**ขั้นตอน:**
1. เปิด `/api/labor-times/{id}/pause` endpoint
2. คลิก "Try it out"
3. ใส่ `id` = `1`
4. คลิก "Execute"

**Expected Response:**
```json
{
  "id": 1,
  "actualMinutes": 15,
  "laborCost": 125,
  "pausedAt": "2024-12-18T02:57:00.000Z",
  "technician": {
    "id": 1,
    "name": "ผู้ดูแลระบบ"
  }
}
```

**Status Code:** `200 OK`

**หมายเหตุ:** 
- `actualMinutes` และ `laborCost` จะถูกคำนวณอัตโนมัติตามเวลาที่ผ่านไป

---

### Step 3.6: เริ่มจับเวลาต่อ (Resume Labor Time) - Optional

**Endpoint:** `PATCH /api/labor-times/{id}/resume`

**Authorization:** ✅ Required (Role: TECHNICIAN, FOREMAN, ADMIN, MANAGER)

**Path Parameters:**
- `id`: `1` (Labor Time ID)

**Request Body:**
- ไม่ต้องใส่

**ขั้นตอน:**
1. เปิด `/api/labor-times/{id}/resume` endpoint
2. คลิก "Try it out"
3. ใส่ `id` = `1`
4. คลิก "Execute"

**Expected Response:**
```json
{
  "id": 1,
  "resumedAt": "2024-12-18T03:00:00.000Z",
  "pausedAt": null,
  "technician": {
    "id": 1,
    "name": "ผู้ดูแลระบบ"
  }
}
```

**Status Code:** `200 OK`

---

### Step 3.7: เสร็จสิ้นการจับเวลา (Finish Labor Time)

**Endpoint:** `PATCH /api/labor-times/{id}/finish`

**Authorization:** ✅ Required (Role: TECHNICIAN, FOREMAN, ADMIN, MANAGER)

**Path Parameters:**
- `id`: `1` (Labor Time ID)

**Request Body:**
- ไม่ต้องใส่

**ขั้นตอน:**
1. เปิด `/api/labor-times/{id}/finish` endpoint
2. คลิก "Try it out"
3. ใส่ `id` = `1`
4. คลิก "Execute"

**Expected Response:**
```json
{
  "id": 1,
  "jobId": 1,
  "technicianId": 1,
  "taskDescription": "เปลี่ยนเบรกหน้า",
  "standardMinutes": 30,
  "actualMinutes": 45,
  "hourlyRate": 500,
  "laborCost": 375,
  "startedAt": "2024-12-18T02:42:00.000Z",
  "finishedAt": "2024-12-18T03:27:00.000Z",
  "pausedAt": null,
  "resumedAt": null,
  "technician": {
    "id": 1,
    "name": "ผู้ดูแลระบบ"
  },
  "job": {
    "id": 1,
    "jobNo": "JOB-20241218-0001"
  }
}
```

**Status Code:** `200 OK`

**หมายเหตุ:** 
- `actualMinutes` และ `laborCost` จะถูกคำนวณอัตโนมัติ
- `finishedAt` จะถูกตั้งค่าอัตโนมัติ

---

### Step 3.8: ดูค่าแรงรวมของ Job

**Endpoint:** `GET /api/labor-times/job/{jobId}/total`

**Authorization:** ✅ Required

**Path Parameters:**
- `jobId`: `1` (Job ID)

**ขั้นตอน:**
1. เปิด `/api/labor-times/job/{jobId}/total` endpoint
2. คลิก "Try it out"
3. ใส่ `jobId` = `1`
4. คลิก "Execute"

**Expected Response:**
```json
{
  "totalCost": 375,
  "totalMinutes": 45,
  "standardMinutes": 30,
  "laborTimes": 1,
  "efficiency": 66.67
}
```

**Status Code:** `200 OK`

**หมายเหตุ:** 
- `totalCost` = ค่าแรงรวม (บาท)
- `totalMinutes` = เวลาจริงที่ใช้ (นาที)
- `standardMinutes` = เวลามาตรฐาน (นาที)
- `efficiency` = (standardMinutes / totalMinutes) * 100 (%)

---

### Step 3.9: เพิ่ม Outsource (ส่งงานซ่อมข้างนอก)

**Endpoint:** `POST /api/outsources`

**Authorization:** ✅ Required (Role: TECHNICIAN, FOREMAN, ADMIN, MANAGER)

**Request Body:**
```json
{
  "jobId": 1,
  "vendorName": "ร้านย้อมสีมอเตอร์ไซค์",
  "workDescription": "ย้อมสีถัง",
  "cost": 2000,
  "sellingPrice": 2500,
  "estimatedDays": 3,
  "notes": "ส่งงาน 25 ธ.ค. 64"
}
```

**ขั้นตอน:**
1. เปิด `/api/outsources` endpoint (POST)
2. คลิก "Try it out"
3. ใส่ข้อมูลตาม Request Body
4. คลิก "Execute"

**Expected Response:**
```json
{
  "id": 1,
  "jobId": 1,
  "vendorName": "ร้านย้อมสีมอเตอร์ไซค์",
  "workDescription": "ย้อมสีถัง",
  "cost": 2000,
  "sellingPrice": 2500,
  "estimatedDays": 3,
  "completedAt": null,
  "notes": "ส่งงาน 25 ธ.ค. 64",
  "createdAt": "2024-12-18T03:30:00.000Z",
  "updatedAt": "2024-12-18T03:30:00.000Z",
  "job": {
    "id": 1,
    "jobNo": "JOB-20241218-0001",
    "motorcycle": {
      "id": 1,
      "licensePlate": "กข 1234",
      "brand": "Honda",
      "model": "Wave 110i",
      "owner": {
        "id": 1,
        "firstName": "สมชาย",
        "lastName": "ใจดี"
      }
    }
  }
}
```

**Status Code:** `201 Created`

**หมายเหตุ:** 
- ถ้าไม่ใส่ `sellingPrice` ระบบจะคำนวณเป็น `cost * 1.2` (เพิ่ม 20%)

---

### Step 3.10: เสร็จสิ้นงาน (Complete Job)

**Endpoint:** `PATCH /api/jobs/{id}/complete`

**Authorization:** ✅ Required (Role: TECHNICIAN, FOREMAN, ADMIN, MANAGER)

**Path Parameters:**
- `id`: `1` (Job ID)

**Request Body (Optional):**
```json
{
  "diagnosisNotes": "เปลี่ยนเบรกหน้าเรียบร้อย ตรวจสอบระบบอื่นปกติ"
}
```

**ขั้นตอน:**
1. เปิด `/api/jobs/{id}/complete` endpoint
2. คลิก "Try it out"
3. ใส่ `id` = `1`
4. ใส่ diagnosisNotes (optional)
5. คลิก "Execute"

**Expected Response:**
```json
{
  "id": 1,
  "jobNo": "JOB-20241218-0001",
  "status": "COMPLETED",
  "completedAt": "2024-12-18T03:35:00.000Z",
  "diagnosisNotes": "เปลี่ยนเบรกหน้าเรียบร้อย ตรวจสอบระบบอื่นปกติ",
  "technician": {
    "id": 1,
    "name": "ผู้ดูแลระบบ"
  },
  "motorcycle": {
    "id": 1,
    "licensePlate": "กข 1234",
    "brand": "Honda",
    "model": "Wave 110i",
    "owner": {
      "id": 1,
      "firstName": "สมชาย",
      "lastName": "ใจดี"
    }
  }
}
```

**Status Code:** `200 OK`

**หมายเหตุ:** 
- Job status จะเปลี่ยนเป็น `COMPLETED`
- Job นี้พร้อมสำหรับการคำนวณและชำระเงินแล้ว

---

## 4. Inventory Management (การจัดการสต็อก)

### Step 4.1: สร้าง Part (อะไหล่)

**Endpoint:** `POST /api/parts`

**Authorization:** ✅ Required (Role: STOCK_KEEPER, ADMIN, MANAGER)

**Request Body:**
```json
{
  "partNo": "BRAKE-PAD-001",
  "name": "เบรกหน้าชุด",
  "description": "เบรกหน้า Honda Wave 110i",
  "brand": "Honda",
  "category": "เบรก",
  "unit": "ชุด",
  "unitPrice": 350,
  "stockQuantity": 10,
  "reorderPoint": 5,
  "reorderQuantity": 10
}
```

**ขั้นตอน:**
1. เปิด `/api/parts` endpoint (POST)
2. คลิก "Try it out"
3. ใส่ข้อมูลตาม Request Body
4. คลิก "Execute"

**Expected Response:**
```json
{
  "id": 1,
  "partNo": "BRAKE-PAD-001",
  "name": "เบรกหน้าชุด",
  "description": "เบรกหน้า Honda Wave 110i",
  "brand": "Honda",
  "category": "เบรก",
  "unit": "ชุด",
  "unitPrice": 350,
  "stockQuantity": 10,
  "reorderPoint": 5,
  "reorderQuantity": 10,
  "isActive": true,
  "createdAt": "2024-12-18T04:00:00.000Z",
  "updatedAt": "2024-12-18T04:00:00.000Z"
}
```

**Status Code:** `201 Created`

**📝 จด Part ID:** `1`

---

### Step 4.2: ดูรายการ Parts

**Endpoint:** `GET /api/parts`

**Authorization:** ✅ Required

**Query Parameters (Optional):**
- `category`: `เบรก`
- `brand`: `Honda`
- `isActive`: `true`
- `lowStock`: `true` (ดูเฉพาะสต็อกต่ำ)
- `search`: `เบรก` (ค้นหาตาม partNo, name, description)

**ขั้นตอน:**
1. เปิด `/api/parts` endpoint (GET)
2. คลิก "Try it out"
3. ใส่ query parameters (optional)
4. คลิก "Execute"

**Expected Response:**
```json
[
  {
    "id": 1,
    "partNo": "BRAKE-PAD-001",
    "name": "เบรกหน้าชุด",
    "description": "เบรกหน้า Honda Wave 110i",
    "brand": "Honda",
    "category": "เบรก",
    "unit": "ชุด",
    "unitPrice": 350,
    "stockQuantity": 10,
    "reorderPoint": 5,
    "reorderQuantity": 10,
    "isActive": true
  }
]
```

**Status Code:** `200 OK`

---

### Step 4.3: ดู Parts สต็อกต่ำ (Low Stock)

**Endpoint:** `GET /api/parts/low-stock`

**Authorization:** ✅ Required (Role: STOCK_KEEPER, ADMIN, MANAGER)

**ขั้นตอน:**
1. เปิด `/api/parts/low-stock` endpoint
2. คลิก "Try it out"
3. คลิก "Execute"

**Expected Response:**
```json
[
  {
    "id": 2,
    "partNo": "OIL-FILTER-001",
    "name": "กรองน้ำมันเครื่อง",
    "stockQuantity": 3,
    "reorderPoint": 5
  }
]
```

**Status Code:** `200 OK`

**หมายเหตุ:** 
- จะแสดงเฉพาะ parts ที่ `stockQuantity <= reorderPoint`

---

### Step 4.4: ปรับสต็อก (Stock Adjustment)

**Endpoint:** `PATCH /api/parts/{id}/adjust-stock`

**Authorization:** ✅ Required (Role: STOCK_KEEPER, ADMIN, MANAGER)

**Path Parameters:**
- `id`: `1` (Part ID)

**Request Body:**
```json
{
  "quantity": -2,
  "notes": "เบิกใช้สำหรับ Job #1"
}
```

**ขั้นตอน:**
1. เปิด `/api/parts/{id}/adjust-stock` endpoint
2. คลิก "Try it out"
3. ใส่ `id` = `1`
4. ใส่ `quantity` = `-2` (ลบ 2 ชิ้น) หรือ `+5` (เพิ่ม 5 ชิ้น)
5. ใส่ `notes` (optional)
6. คลิก "Execute"

**Expected Response:**
```json
{
  "id": 1,
  "partNo": "BRAKE-PAD-001",
  "name": "เบรกหน้าชุด",
  "stockQuantity": 8,
  "unitPrice": 350
}
```

**Status Code:** `200 OK`

**หมายเหตุ:** 
- `quantity` เป็นบวก = เพิ่มสต็อก, เป็นลบ = ลบสต็อก
- ระบบจะสร้าง StockMovement record อัตโนมัติ
- ถ้า stockQuantity ติดลบ จะได้ error

---

## 5. Billing & Payment (การชำระเงิน)

### Step 5.1: คำนวณค่าใช้จ่ายของ Job

**Endpoint:** `GET /api/payments/job/{jobId}/calculate`

**Authorization:** ✅ Required (Role: CASHIER, ADMIN, MANAGER)

**Path Parameters:**
- `jobId`: `1` (Job ID)

**ขั้นตอน:**
1. เปิด `/api/payments/job/{jobId}/calculate` endpoint
2. คลิก "Try it out"
3. ใส่ `jobId` = `1`
4. คลิก "Execute"

**Expected Response:**
```json
{
  "jobId": 1,
  "jobNo": "JOB-20241218-0001",
  "owner": {
    "id": 1,
    "phoneNumber": "0812345678",
    "firstName": "สมชาย",
    "lastName": "ใจดี",
    "points": 0
  },
  "breakdown": {
    "laborCost": 375,
    "partsCost": 0,
    "outsourceCost": 2500,
    "subtotal": 2875,
    "discount": 0,
    "pointsUsed": 0,
    "vat": 201.25,
    "totalAmount": 3076.25
  },
  "pointsEarned": 30,
  "existingPayment": null
}
```

**Status Code:** `200 OK`

**หมายเหตุ:** 
- `laborCost` = ค่าแรงรวมจาก Labor Times
- `partsCost` = ราคาอะไหล่ (ยังไม่ได้ implement)
- `outsourceCost` = ราคา Outsource รวม
- `vat` = VAT 7%
- `pointsEarned` = คะแนนที่จะได้ (1 point ต่อ 100 baht)

---

### Step 5.2: สร้าง Payment

**Endpoint:** `POST /api/payments`

**Authorization:** ✅ Required (Role: CASHIER, ADMIN, MANAGER)

**Request Body:**
```json
{
  "jobId": 1,
  "paymentMethod": "CASH",
  "subtotal": 2875,
  "discount": 0,
  "pointsUsed": 0,
  "vat": 201.25,
  "totalAmount": 3076.25,
  "notes": "รับเงินสด"
}
```

**ขั้นตอน:**
1. เปิด `/api/payments` endpoint (POST)
2. คลิก "Try it out"
3. ใส่ข้อมูลตาม Request Body (ใช้ข้อมูลจาก Step 5.1)
4. คลิก "Execute"

**Expected Response:**
```json
{
  "id": 1,
  "paymentNo": "PAY-20241218-0001",
  "jobId": 1,
  "customerId": 1,
  "paymentMethod": "CASH",
  "subtotal": 2875,
  "discount": 0,
  "pointsUsed": 0,
  "pointsEarned": 30,
  "vat": 201.25,
  "totalAmount": 3076.25,
  "paymentStatus": "PENDING",
  "paidAt": null,
  "notes": "รับเงินสด",
  "createdAt": "2024-12-18T04:30:00.000Z",
  "updatedAt": "2024-12-18T04:30:00.000Z",
  "job": {
    "id": 1,
    "jobNo": "JOB-20241218-0001",
    "motorcycle": {
      "id": 1,
      "licensePlate": "กข 1234",
      "brand": "Honda",
      "model": "Wave 110i",
      "owner": {
        "id": 1,
        "phoneNumber": "0812345678",
        "firstName": "สมชาย",
        "lastName": "ใจดี"
      }
    }
  }
}
```

**Status Code:** `201 Created`

**📝 จด Payment ID:** `1`

**หมายเหตุ:** 
- `paymentStatus` = `PENDING` (ยังไม่ได้ชำระเงิน)
- Job status ยังเป็น `COMPLETED` อยู่

---

### Step 5.3: ยืนยันการชำระเงิน (Process Payment)

**Endpoint:** `PATCH /api/payments/{id}/process`

**Authorization:** ✅ Required (Role: CASHIER, ADMIN, MANAGER)

**Path Parameters:**
- `id`: `1` (Payment ID จาก Step 5.2)

**Request Body:**
- ไม่ต้องใส่

**ขั้นตอน:**
1. เปิด `/api/payments/{id}/process` endpoint
2. คลิก "Try it out"
3. ใส่ `id` = `1`
4. คลิก "Execute"

**Expected Response:**
```json
{
  "id": 1,
  "paymentNo": "PAY-20241218-0001",
  "jobId": 1,
  "customerId": 1,
  "paymentMethod": "CASH",
  "subtotal": 2875,
  "discount": 0,
  "pointsUsed": 0,
  "pointsEarned": 30,
  "vat": 201.25,
  "totalAmount": 3076.25,
  "paymentStatus": "PAID",
  "paidAt": "2024-12-18T04:35:00.000Z",
  "notes": "รับเงินสด",
  "job": {
    "id": 1,
    "jobNo": "JOB-20241218-0001",
    "status": "PAID",
    "motorcycle": {
      "id": 1,
      "licensePlate": "กข 1234",
      "brand": "Honda",
      "model": "Wave 110i",
      "owner": {
        "id": 1,
        "phoneNumber": "0812345678",
        "firstName": "สมชาย",
        "lastName": "ใจดี",
        "points": 30
      }
    }
  }
}
```

**Status Code:** `200 OK`

**หมายเหตุ:** 
- `paymentStatus` จะเปลี่ยนเป็น `PAID`
- `paidAt` จะถูกตั้งค่า
- Job status จะเปลี่ยนเป็น `PAID`
- Customer points จะเพิ่มขึ้นตาม `pointsEarned`

---

### Step 5.4: ดูรายการ Payments

**Endpoint:** `GET /api/payments`

**Authorization:** ✅ Required

**Query Parameters (Optional):**
- `paymentStatus`: `PAID`, `PENDING`, `PARTIAL`, `REFUNDED`
- `paymentMethod`: `CASH`, `CREDIT_CARD`, `DEBIT_CARD`, `TRANSFER`, `POINTS`
- `customerId`: `1`
- `dateFrom`: `2024-12-01`
- `dateTo`: `2024-12-31`

**ขั้นตอน:**
1. เปิด `/api/payments` endpoint (GET)
2. คลิก "Try it out"
3. ใส่ query parameters (optional)
4. คลิก "Execute"

**Expected Response:**
```json
[
  {
    "id": 1,
    "paymentNo": "PAY-20241218-0001",
    "jobId": 1,
    "customerId": 1,
    "paymentMethod": "CASH",
    "totalAmount": 3076.25,
    "paymentStatus": "PAID",
    "paidAt": "2024-12-18T04:35:00.000Z",
    "job": {
      "jobNo": "JOB-20241218-0001",
      "motorcycle": {
        "licensePlate": "กข 1234",
        "owner": {
          "firstName": "สมชาย",
          "lastName": "ใจดี"
        }
      }
    }
  }
]
```

**Status Code:** `200 OK`

---

## 6. Quotation Workflow (ใบเสนอราคา)

### Step 6.1: สร้าง Quotation

**Endpoint:** `POST /api/quotations`

**Authorization:** ✅ Required (Role: SERVICE_ADVISOR, CASHIER, ADMIN, MANAGER)

**Request Body:**
```json
{
  "customerId": 1,
  "motorcycleId": 1,
  "items": [
    {
      "itemType": "LABOR",
      "itemName": "เปลี่ยนเบรกหน้า",
      "quantity": 1,
      "unitPrice": 500
    },
    {
      "itemType": "PART",
      "itemName": "เบรกหน้าชุด",
      "quantity": 1,
      "unitPrice": 350,
      "partId": 1
    }
  ],
  "validUntil": "2024-12-31T23:59:59Z",
  "notes": "ใบเสนอราคาเบื้องต้น"
}
```

**ขั้นตอน:**
1. เปิด `/api/quotations` endpoint (POST)
2. คลิก "Try it out"
3. ใส่ข้อมูลตาม Request Body
4. คลิก "Execute"

**Expected Response:**
```json
{
  "id": 1,
  "quotationNo": "QT-20241218-0001",
  "customerId": 1,
  "motorcycleId": 1,
  "status": "DRAFT",
  "totalAmount": 0,
  "validUntil": "2024-12-31T23:59:59.000Z",
  "notes": "ใบเสนอราคาเบื้องต้น",
  "createdById": 1,
  "jobId": null,
  "createdAt": "2024-12-18T05:00:00.000Z",
  "updatedAt": "2024-12-18T05:00:00.000Z",
  "customer": {
    "id": 1,
    "phoneNumber": "0812345678",
    "firstName": "สมชาย",
    "lastName": "ใจดี"
  },
  "motorcycle": {
    "id": 1,
    "licensePlate": "กข 1234",
    "brand": "Honda",
    "model": "Wave 110i",
    "owner": {
      "id": 1,
      "phoneNumber": "0812345678"
    }
  },
  "items": [
    {
      "id": 1,
      "quotationId": 1,
      "itemType": "LABOR",
      "itemName": "เปลี่ยนเบรกหน้า",
      "quantity": 1,
      "unitPrice": 500,
      "totalPrice": 500
    },
    {
      "id": 2,
      "quotationId": 1,
      "itemType": "PART",
      "itemName": "เบรกหน้าชุด",
      "quantity": 1,
      "unitPrice": 350,
      "totalPrice": 350
    }
  ],
  "createdBy": {
    "id": 1,
    "name": "ผู้ดูแลระบบ"
  }
}
```

**Status Code:** `201 Created`

**📝 จด Quotation ID:** `1`

---

### Step 6.2: ส่ง Quotation ให้ลูกค้า

**Endpoint:** `PATCH /api/quotations/{id}/send`

**Authorization:** ✅ Required (Role: SERVICE_ADVISOR, CASHIER, ADMIN, MANAGER)

**Path Parameters:**
- `id`: `1` (Quotation ID)

**Request Body:**
- ไม่ต้องใส่

**ขั้นตอน:**
1. เปิด `/api/quotations/{id}/send` endpoint
2. คลิก "Try it out"
3. ใส่ `id` = `1`
4. คลิก "Execute"

**Expected Response:**
```json
{
  "id": 1,
  "quotationNo": "QT-20241218-0001",
  "status": "SENT",
  "customer": {
    "id": 1,
    "firstName": "สมชาย",
    "lastName": "ใจดี"
  },
  "motorcycle": {
    "id": 1,
    "licensePlate": "กข 1234"
  },
  "items": [
    {
      "id": 1,
      "itemType": "LABOR",
      "itemName": "เปลี่ยนเบรกหน้า",
      "quantity": 1,
      "unitPrice": 500,
      "totalPrice": 500
    },
    {
      "id": 2,
      "itemType": "PART",
      "itemName": "เบรกหน้าชุด",
      "quantity": 1,
      "unitPrice": 350,
      "totalPrice": 350
    }
  ]
}
```

**Status Code:** `200 OK`

**หมายเหตุ:** 
- Status จะเปลี่ยนจาก `DRAFT` → `SENT`

---

### Step 6.3: อนุมัติ Quotation

**Endpoint:** `PATCH /api/quotations/{id}/approve`

**Authorization:** ✅ Required (Role: SERVICE_ADVISOR, CASHIER, ADMIN, MANAGER)

**Path Parameters:**
- `id`: `1` (Quotation ID)

**Request Body:**
- ไม่ต้องใส่

**ขั้นตอน:**
1. เปิด `/api/quotations/{id}/approve` endpoint
2. คลิก "Try it out"
3. ใส่ `id` = `1`
4. คลิก "Execute"

**Expected Response:**
```json
{
  "id": 1,
  "quotationNo": "QT-20241218-0001",
  "status": "APPROVED",
  "customer": {
    "id": 1,
    "firstName": "สมชาย",
    "lastName": "ใจดี"
  },
  "motorcycle": {
    "id": 1,
    "licensePlate": "กข 1234"
  },
  "items": [
    {
      "id": 1,
      "itemType": "LABOR",
      "itemName": "เปลี่ยนเบรกหน้า",
      "quantity": 1,
      "unitPrice": 500,
      "totalPrice": 500
    },
    {
      "id": 2,
      "itemType": "PART",
      "itemName": "เบรกหน้าชุด",
      "quantity": 1,
      "unitPrice": 350,
      "totalPrice": 350
    }
  ]
}
```

**Status Code:** `200 OK`

**หมายเหตุ:** 
- Status จะเปลี่ยนจาก `SENT` → `APPROVED`
- Quotation ที่ approve แล้วสามารถ convert เป็น Job ได้

---

### Step 6.4: แปลง Quotation เป็น Job

**Endpoint:** `POST /api/quotations/{id}/convert-to-job`

**Authorization:** ✅ Required (Role: SERVICE_ADVISOR, ADMIN, MANAGER)

**Path Parameters:**
- `id`: `1` (Quotation ID)

**Request Body:**
```json
{
  "symptom": "เบรกหน้าไม่ค่อยมีแรง"
}
```

**ขั้นตอน:**
1. เปิด `/api/quotations/{id}/convert-to-job` endpoint
2. คลิก "Try it out"
3. ใส่ `id` = `1`
4. ใส่ `symptom`
5. คลิก "Execute"

**Expected Response:**
```json
{
  "id": 3,
  "jobNo": "JOB-20241218-0003",
  "motorcycleId": 1,
  "quotationId": 1,
  "receptionId": 1,
  "technicianId": null,
  "symptom": "เบรกหน้าไม่ค่อยมีแรง",
  "jobType": "NORMAL",
  "status": "PENDING",
  "createdAt": "2024-12-18T05:10:00.000Z",
  "updatedAt": "2024-12-18T05:10:00.000Z",
  "motorcycle": {
    "id": 1,
    "vin": "VIN123456789",
    "licensePlate": "กข 1234",
    "brand": "Honda",
    "model": "Wave 110i",
    "owner": {
      "id": 1,
      "phoneNumber": "0812345678",
      "firstName": "สมชาย",
      "lastName": "ใจดี"
    }
  },
  "quotation": {
    "id": 1,
    "quotationNo": "QT-20241218-0001",
    "items": [
      {
        "id": 1,
        "itemType": "LABOR",
        "itemName": "เปลี่ยนเบรกหน้า",
        "quantity": 1,
        "unitPrice": 500
      },
      {
        "id": 2,
        "itemType": "PART",
        "itemName": "เบรกหน้าชุด",
        "quantity": 1,
        "unitPrice": 350
      }
    ]
  }
}
```

**Status Code:** `201 Created`

**หมายเหตุ:** 
- Job ใหม่จะถูกสร้างขึ้น
- Quotation จะถูกเชื่อมโยงกับ Job นี้
- Job status เป็น `PENDING` (รอช่างรับงาน)
- ต่อไปสามารถทำตาม Workshop Workflow ได้เลย

---

## Testing Checklist

### ✅ Authentication
- [ ] Login สำเร็จ
- [ ] ได้ JWT token
- [ ] Authorize ใน Swagger UI สำเร็จ
- [ ] Token ใช้ได้กับ protected endpoints

### ✅ Reception Workflow
- [ ] สร้าง Customer สำเร็จ
- [ ] สร้าง Motorcycle สำเร็จ
- [ ] ตรวจสอบ Warranty สำเร็จ
- [ ] สร้าง Appointment สำเร็จ
- [ ] Convert Appointment to Job สำเร็จ
- [ ] สร้าง Job โดยตรงสำเร็จ (Fast Track)
- [ ] ดู Job Queue สำเร็จ (Fast Track มาก่อน)

### ✅ Workshop Workflow
- [ ] Assign Technician สำเร็จ
- [ ] Start Job สำเร็จ
- [ ] เพิ่ม Checklist Items สำเร็จ
- [ ] Start Labor Time สำเร็จ
- [ ] Pause Labor Time สำเร็จ (Optional)
- [ ] Resume Labor Time สำเร็จ (Optional)
- [ ] Finish Labor Time สำเร็จ
- [ ] ดูค่าแรงรวมสำเร็จ
- [ ] เพิ่ม Outsource สำเร็จ
- [ ] Complete Job สำเร็จ

### ✅ Inventory Management
- [ ] สร้าง Part สำเร็จ
- [ ] ดูรายการ Parts สำเร็จ
- [ ] ดู Low Stock สำเร็จ
- [ ] Adjust Stock สำเร็จ (เพิ่ม/ลด)
- [ ] ค้นหา Part สำเร็จ

### ✅ Billing & Payment
- [ ] Calculate Billing สำเร็จ
- [ ] สร้าง Payment สำเร็จ
- [ ] Process Payment สำเร็จ
- [ ] Job status เปลี่ยนเป็น PAID
- [ ] Customer points เพิ่มขึ้น
- [ ] ดูรายการ Payments สำเร็จ

### ✅ Quotation Workflow
- [ ] สร้าง Quotation สำเร็จ
- [ ] Send Quotation สำเร็จ
- [ ] Approve Quotation สำเร็จ
- [ ] Convert to Job สำเร็จ

---

## 🔍 Tips สำหรับการทดสอบ

1. **เก็บ Token ไว้:** ใช้ Bearer token ในทุก request (ยกเว้น login)
2. **จด IDs:** จด ID ของ records ที่สร้างไว้ (customer, motorcycle, job, etc.)
3. **ตรวจสอบ Status:** ดู job status เปลี่ยนตาม workflow
4. **ตรวจสอบ Relations:** ดูว่า relations ถูกต้อง (job → motorcycle → customer)
5. **Test Error Cases:** ลองส่งข้อมูลผิด format, ID ไม่มี, etc.
6. **Test Role-Based Access:** ลอง login ด้วย role ต่างๆ แล้วทดสอบ endpoint

---

## 🐛 Common Issues & Solutions

### Issue 1: 401 Unauthorized
**Solution:** 
- ตรวจสอบว่า authorize ใน Swagger UI แล้ว
- ตรวจสอบว่า token ยังไม่หมดอายุ
- ตรวจสอบว่า token ถูกต้อง

### Issue 2: 403 Forbidden
**Solution:**
- ตรวจสอบว่า user role มีสิทธิ์เข้าถึง endpoint นี้
- Login ด้วย user ที่มี role ที่เหมาะสม

### Issue 3: 400 Bad Request
**Solution:**
- ตรวจสอบ request body format
- ตรวจสอบ validation rules
- ตรวจสอบ required fields

### Issue 4: 404 Not Found
**Solution:**
- ตรวจสอบว่า ID ถูกต้อง
- ตรวจสอบว่า record มีอยู่ใน database

### Issue 5: 500 Internal Server Error
**Solution:**
- ตรวจสอบ server logs
- ตรวจสอบ database connection
- ตรวจสอบว่าข้อมูลที่ส่งมาถูกต้อง

---

**Happy Testing! 🚀**

---

## 📝 Notes

- ทุก API endpoint ต้องการ JWT authentication ยกเว้น `POST /api/auth/login`
- Job Queue จะเรียงตาม Fast Track priority (FAST_TRACK มาก่อน NORMAL)
- Payment process จะอัพเดต Job status และ Customer points อัตโนมัติ
- Quotation ต้องเป็น status `APPROVED` ถึงจะ convert เป็น Job ได้


