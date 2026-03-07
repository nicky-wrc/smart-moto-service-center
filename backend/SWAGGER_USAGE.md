# 🔐 คู่มือการใช้งาน Swagger UI สำหรับ Smart Moto Service Center API

## 📋 วิธีการ Login และใช้ Token ใน Swagger UI

### ขั้นตอนที่ 1: Login เพื่อรับ Token

1. เปิด Swagger UI: `http://localhost:4000/docs`
2. หา endpoint: **`POST /api/auth/login`**
3. กด **"Try it out"**
4. กรอกข้อมูล:
   ```json
   {
     "username": "admin",
     "password": "password123"
   }
   ```
5. กด **"Execute"**
6. **คัดลอก `access_token`** จาก response (จะเป็น string ยาวๆ เช่น `eyJhbGci...`)

### ขั้นตอนที่ 2: Authorize ใน Swagger UI

1. กดปุ่ม **"Authorize"** (🔒) ด้านบนขวาของหน้า Swagger UI
2. จะเห็น popup "Available authorizations"
3. ในช่อง **"Value"** ของ **JWT-auth**:
   - **ใส่เฉพาะ token** (ไม่ต้องใส่ "Bearer")
   - ตัวอย่าง: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - ❌ **ไม่ใส่แบบนี้**: `Bearer eyJhbGci...` (ผิด!)
4. กด **"Authorize"**
5. กด **"Close"**

### ขั้นตอนที่ 3: ทดสอบ API Endpoints อื่นๆ

หลังจาก Authorize แล้ว:
- Token จะถูกเก็บไว้ใน browser (localStorage)
- ทุก request จะมี Authorization header อัตโนมัติ
- ไม่ต้องใส่ token ใหม่ทุกครั้ง

## ✅ ตัวอย่างการใช้งาน

### Login Success Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwic3ViIjoxLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NjYwMDMzMTAsImV4cCI6MTc2NjA4OTcxMH0.puA3Bwg0An8PgY5JZ7zfIujdpRMkfmc_BQ11_ay",
  "user": {
    "id": 1,
    "username": "admin",
    "name": "ผู้ดูแลระบบ",
    "role": "ADMIN"
  }
}
```

### Token Format ที่ถูกต้อง:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwic3ViIjoxLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NjYwMDMzMTAsImV4cCI6MTc2NjA4OTcxMH0.puA3Bwg0An8PgY5JZ7zfIujdpRMkfmc_BQ11_ay
```

## ❌ ปัญหาที่พบบ่อย

### 1. ได้ 401 Unauthorized
**สาเหตุ:**
- ยังไม่ได้ Authorize
- Token หมดอายุ (Token มีอายุ 1 วัน)
- Token format ผิด (ใส่ "Bearer" ซ้ำ)

**แก้ไข:**
- Login ใหม่และ Authorize อีกครั้ง
- ตรวจสอบว่าใส่ token ถูกต้อง (ไม่ใส่ "Bearer")

### 2. ได้ 403 Forbidden
**สาเหตุ:**
- Role ไม่มีสิทธิ์ (ดู `@Roles()` ใน controller)

**แก้ไข:**
- Login ด้วย user ที่มี role ที่ถูกต้อง
- ดู role ที่ต้องการใน Swagger documentation

### 3. Token ไม่ถูกเก็บไว้
**สาเหตุ:**
- Browser settings block localStorage
- Swagger UI cache ถูกล้าง

**แก้ไข:**
- Authorize ใหม่ทุกครั้งที่ refresh หน้า

## 🔑 Test Accounts

| Username | Password | Role |
|----------|----------|------|
| admin | password123 | ADMIN |
| sa1 | password123 | SERVICE_ADVISOR |
| tech1 | password123 | TECHNICIAN |
| cashier1 | password123 | CASHIER |

## 📝 หมายเหตุ

- Token มีอายุ **1 วัน** (24 ชั่วโมง)
- ถ้า Token หมดอายุ ต้อง Login ใหม่
- `persistAuthorization: true` ทำให้ Token ถูกเก็บไว้ใน browser localStorage
- Authorization header จะถูกส่งอัตโนมัติในทุก request ที่มี `@ApiBearerAuth('JWT-auth')`

