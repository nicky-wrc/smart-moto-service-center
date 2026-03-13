# 🧪 Frontend Testing Guide - Smart Moto Service Center

คู่มือการทดสอบฟีเจอร์ต่างๆ ของระบบ

## 📋 บัญชีทดสอบ

### Users
| Username | Password | Role | สิทธิ์ |
|----------|----------|------|-------|
| `admin` | `password123` | ADMIN | ทุกอย่าง |
| `sa1` | `password123` | SERVICE_ADVISOR | Reception, Customer, Jobs |
| `tech1` | `password123` | TECHNICIAN | Workshop, Job Queue |
| `stock1` | `password123` | STOCK_KEEPER | Inventory |
| `cashier1` | `password123` | CASHIER | Billing, Payments |

---

## 1️⃣ ทดสอบ Authentication & Authorization

### ✅ Login/Logout
1. **ทดสอบ Login**
   - เปิด `http://localhost:5173/login`
   - ลอง login ด้วยบัญชีต่างๆ:
     - `admin` / `password123` → ควรเห็น Dashboard พร้อมทุกเมนู
     - `sa1` / `password123` → ควรเห็น Dashboard พร้อมเมนู Reception
     - `tech1` / `password123` → ควรเห็น Dashboard พร้อมเมนู Workshop
   - ลอง login ด้วย username/password ผิด → ควรแสดง error message

2. **ทดสอบ Logout**
   - คลิกที่ user menu (มุมขวาบน)
   - คลิก "ออกจากระบบ"
   - ควร redirect ไปหน้า login

3. **ทดสอบ Role-based Navigation**
   - Login ด้วย `sa1` → ควรเห็นเมนู "รับรถ / SA" เท่านั้น
   - Login ด้วย `tech1` → ควรเห็นเมนู "งานช่าง" เท่านั้น
   - Login ด้วย `admin` → ควรเห็นทุกเมนู

4. **ทดสอบ Route Protection**
   - Logout
   - พยายามเข้า URL โดยตรง: `http://localhost:5173/dashboard`
   - ควร redirect ไปหน้า login

---

## 2️⃣ ทดสอบ Reception Workflow (SA)

**Login ด้วย:** `sa1` / `password123`

### ✅ 2.1 Customer Management

1. **ค้นหาลูกค้า**
   - ไปที่ "รับรถ / SA" → "จัดการลูกค้า" หรือ `/reception/customers`
   - พิมพ์ใน search box:
     - `สมชาย` → ควรพบ "สมชาย ใจดี" (จาก seed data)
     - `0812345678` → ควรพบลูกค้าที่มีเบอร์นี้
     - `ไม่มีข้อมูล` → ควรแสดง "ไม่พบลูกค้า"

2. **เพิ่มลูกค้าใหม่**
   - คลิก "เพิ่มลูกค้าใหม่"
   - กรอกข้อมูล:
     ```
     เบอร์โทร: 0912345678
     คำนำหน้า: นาย
     ชื่อ: สมเกียรติ
     นามสกุล: รักดี
     ที่อยู่: 456 ถนนเพชรบุรี กรุงเทพฯ 10400
     ```
   - คลิก "บันทึก"
   - ควร redirect ไปหน้ารายละเอียดลูกค้า

3. **ดูรายละเอียดลูกค้า**
   - คลิกที่ customer card หรือ search แล้วคลิก
   - ควรเห็นข้อมูลลูกค้า
   - ควรเห็นรถที่ลงทะเบียน (ถ้ามี)

### ✅ 2.2 Motorcycle Registration

1. **เพิ่มรถใหม่ให้ลูกค้า**
   - ไปหน้ารายละเอียดลูกค้า
   - คลิก "เพิ่มรถใหม่"
   - กรอกข้อมูล:
     ```
     เลขตัวถัง (VIN): VIN987654321
     ทะเบียนรถ: ขค 5678
     ยี่ห้อ: Yamaha
     รุ่น: Filano
     สี: ฟ้า-ขาว
     ปี: 2023
     เลขเครื่อง: ENG987654
     ```
   - คลิก "บันทึก"
   - ควรกลับมาหน้าลูกค้าและเห็นรถที่เพิ่ม

### ✅ 2.3 Create Job Order

1. **เปิดงานซ่อมใหม่**
   - ไปที่ "เปิดงานซ่อม" หรือ `/reception/jobs/new`
   - เลือกรถจาก dropdown (ควรมีรถที่ลงทะเบียนแล้ว)
   - เลือกประเภทงาน:
     - **งานปกติ** (NORMAL)
     - **งานเร่งด่วน** (FAST_TRACK) - ควรแสดง badge สีส้ม
   - กรอกอาการ/ปัญหา:
     ```
     สตาร์ทไม่ติด ต้องเข็นถึงจะติด
     มีเสียงผิดปกติที่ท่อไอเสีย
     ```
   - กรอกข้อมูลเพิ่มเติม (ถ้ามี):
     - ระดับน้ำมัน: `50%`
     - ของมีค่าในรถ: `กระเป๋า, แว่นตา`
   - คลิก "ตรวจสอบประกัน" → ควรแสดงสถานะประกัน
   - คลิก "สร้างงานซ่อม"
   - ควรสร้างงานสำเร็จ (ดูจาก Network tab หรือ redirect)

2. **ทดสอบ Validation**
   - พยายามสร้างงานโดยไม่เลือกรถ → ควรแสดง error
   - พยายามสร้างงานโดยไม่กรอกอาการ → ควรแสดง error

---

## 3️⃣ ทดสอบ Workshop Workflow (Technician)

**Login ด้วย:** `tech1` / `password123` หรือ `admin` / `password123`

### ✅ 3.1 Job Queue

1. **ดูคิวงาน**
   - ไปที่ "งานช่าง" → "คิวงาน" หรือ `/workshop/queue`
   - ควรเห็นงานทั้งหมดที่ status = `PENDING` หรือ `IN_PROGRESS`
   - งาน Fast Track ควรแสดงแยกออกมาก่อน และมี badge สีแดง
   - งานปกติควรแสดงตามลำดับ

2. **ดูรายละเอียดงาน**
   - คลิกที่ job card
   - ควรเห็น:
     - Job No
     - ข้อมูลรถ (ทะเบียน, ยี่ห้อ, รุ่น)
     - ข้อมูลลูกค้า
     - อาการ/ปัญหา
     - สถานะงาน
     - วันที่สร้าง

3. **เริ่มงาน**
   - คลิก "เริ่มงาน" (ถ้ามี)
   - ควรเปลี่ยนสถานะเป็น `IN_PROGRESS`

---

## 4️⃣ ทดสอบ Dashboard

**Login ด้วย:** `admin` / `password123`

### ✅ 4.1 Dashboard Cards

1. **Summary Cards**
   - ดูที่ dashboard ควรมี cards แสดง:
     - งานรอรับ (Pending Jobs)
     - นัดหมายวันนี้ (Today's Appointments)
     - งานในคิว (Jobs in Queue)
     - งานเสร็จแล้ววันนี้ (Completed Today)
     - อะไหล่สต็อกต่ำ (Low Stock)
     - ยอดขายวันนี้ (Today's Sales)
   - คลิกที่ card → ควร navigate ไปหน้าที่เกี่ยวข้อง

2. **Quick Actions (เมนูหลัก)**
   - ควรเห็น grid ของเมนูหลัก:
     - จัดการลูกค้า
     - เปิดงานซ่อม
     - นัดหมาย
     - คิวงาน
     - Checklist
     - จัดการสต็อก
     - การชำระเงิน
     - ใบเสนอราคา
     - รายงาน
   - คลิกแต่ละเมนู → ควร navigate ไปหน้าที่ถูกต้อง

---

## 5️⃣ ทดสอบ UI/UX

### ✅ 5.1 Responsive Design
1. เปิด DevTools (F12)
2. เปลี่ยนขนาดหน้าจอ:
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)
3. ตรวจสอบว่า layout แสดงถูกต้องในทุกขนาด

### ✅ 5.2 Navigation
1. ทดสอบ navigation bar:
   - คลิกเมนูต่างๆ → ควรเปลี่ยนหน้าได้
   - เมนูที่ active ควร highlight
2. ทดสอบ breadcrumb (ถ้ามี):
   - คลิก back button → ควรกลับไปหน้าหลัง
3. ทดสอบ search bar:
   - พิมพ์ใน search box → ควรทำงาน (แม้ยังไม่ได้ implement)

### ✅ 5.3 Error Handling
1. ทดสอบเมื่อ API error:
   - หยุด backend server
   - ลอง search customer หรือสร้าง job
   - ควรแสดง error message ที่เหมาะสม
2. ทดสอบ validation errors:
   - ลอง submit form โดยไม่กรอก required fields
   - ควรแสดง validation messages

---

## 6️⃣ ทดสอบ Integration

### ✅ 6.1 API Integration
1. เปิด Browser DevTools → Network tab
2. ทดสอบแต่ละ action:
   - Login → ควรเห็น POST `/api/auth/login`
   - Search customer → ควรเห็น GET `/api/customers?search=...`
   - Create customer → ควรเห็น POST `/api/customers`
   - Create job → ควรเห็น POST `/api/jobs`
3. ตรวจสอบ request headers:
   - ควรมี `Authorization: Bearer <token>` หลัง login
4. ตรวจสอบ response:
   - Status code ควรเป็น 200, 201 สำหรับ success
   - ควรมี error handling สำหรับ 400, 401, 500

### ✅ 6.2 State Management
1. ทดสอบ localStorage:
   - Login แล้วเปิด Application tab → Local Storage
   - ควรเห็น `token` และ `user`
2. ทดสอบ auto-login:
   - Login แล้ว refresh page
   - ควรยัง login อยู่ (ไม่ต้อง login ใหม่)
3. ทดสอบ token expiration:
   - ลบ token จาก localStorage
   - ลองเรียก API → ควร redirect ไป login

---

## 7️⃣ ทดสอบ Performance

### ✅ 7.1 Loading States
1. ตรวจสอบว่ามี loading indicators:
   - เมื่อ search customer
   - เมื่อ submit form
   - เมื่อ load data
2. ตรวจสอบว่าไม่มีการ loading นานเกินไป

### ✅ 7.2 Optimistic Updates
1. ทดสอบว่า UI update ทันทีหลัง action:
   - สร้าง customer → ควรเห็นใน list ทันที
   - สร้าง job → ควรเห็นใน queue ทันที

---

## 8️⃣ Checklist การทดสอบ

### Authentication ✅
- [ ] Login สำเร็จ
- [ ] Logout สำเร็จ
- [ ] Login ผิดแสดง error
- [ ] Route protection ทำงาน
- [ ] Role-based navigation ถูกต้อง

### Reception (SA) ✅
- [ ] Search customer ทำงาน
- [ ] Create customer สำเร็จ
- [ ] View customer detail สำเร็จ
- [ ] Create motorcycle สำเร็จ
- [ ] Create job สำเร็จ
- [ ] Warranty check ทำงาน

### Workshop (Technician) ✅
- [ ] View job queue สำเร็จ
- [ ] Job cards แสดงข้อมูลถูกต้อง
- [ ] Fast Track แสดงแยกออกมา
- [ ] Click job → navigate ถูกต้อง

### Dashboard ✅
- [ ] Summary cards แสดงข้อมูล
- [ ] Quick actions navigate ถูกต้อง
- [ ] Welcome message แสดงถูกต้อง

### UI/UX ✅
- [ ] Responsive design ทำงาน
- [ ] Navigation ทำงานถูกต้อง
- [ ] Error messages แสดงถูกต้อง
- [ ] Loading states มีอยู่
- [ ] Form validation ทำงาน

### Integration ✅
- [ ] API calls ถูกต้อง
- [ ] Authentication headers ส่งถูกต้อง
- [ ] Error handling ทำงาน
- [ ] localStorage เก็บข้อมูลถูกต้อง

---

## 🐛 การ Report Bug

เมื่อพบ bug ให้บันทึก:
1. **Browser & Version:** เช่น Chrome 120
2. **OS:** เช่น Windows 10
3. **Steps to Reproduce:** ขั้นตอนทำซ้ำได้
4. **Expected:** ผลลัพธ์ที่คาดหวัง
5. **Actual:** ผลลัพธ์ที่เกิดขึ้นจริง
6. **Screenshot:** ภาพหน้าจอ (ถ้ามี)

---

## 🎯 Tips สำหรับ Testing

1. **ใช้ Browser DevTools:**
   - Network tab: ดู API calls
   - Console tab: ดู errors
   - Application tab: ดู localStorage, cookies

2. **ทดสอบด้วย User หลาย Role:**
   - ทดสอบด้วย ADMIN, SA, TECHNICIAN
   - ตรวจสอบว่าแต่ละ role เห็นเมนูที่ถูกต้อง

3. **ทดสอบ Edge Cases:**
   - กรอกข้อมูลผิดรูปแบบ
   - กรอกข้อมูลว่าง
   - กรอกข้อมูลยาวมาก
   - Network หลุด

4. **ทดสอบ Cross-browser:**
   - Chrome
   - Firefox
   - Edge

---

**Happy Testing! 🚀**
