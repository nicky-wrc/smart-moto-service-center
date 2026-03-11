# 🔍 DevTools Debugging Guide

คู่มือตรวจสอบและแก้ไขปัญหาด้วย Browser DevTools

## 📋 สิ่งที่ควรตรวจสอบใน Console

### ✅ 1. React Router Warnings (แก้ไขแล้ว)
- **Warning:** React Router Future Flag Warning
- **สถานะ:** ✅ แก้ไขแล้วโดยเพิ่ม `future` flags ใน `BrowserRouter`
- **วิธีตรวจสอบ:**
  ```javascript
  // เปิด Console (F12) แล้วดูว่ามี warnings เหล่านี้หรือไม่:
  // ❌ ควรไม่มี warnings เหล่านี้อีกแล้ว:
  // - "React Router will begin wrapping state updates in React.startTransition"
  // - "Relative route resolution within Splat routes is changing"
  ```

### ✅ 2. React DevTools Warning
- **Warning:** "Download the React DevTools..."
- **สถานะ:** ⚠️ Warning ธรรมดา ไม่ใช่ error
- **วิธีแก้ (ถ้าต้องการ):**
  - ติดตั้ง React DevTools Extension:
    - Chrome: https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi
    - Firefox: https://addons.mozilla.org/en-US/firefox/addon/react-devtools/
  - หรือไม่ต้องทำอะไรก็ได้ (warning นี้ไม่ส่งผลต่อการทำงาน)

---

## 🔍 การตรวจสอบใน DevTools

### 1. Console Tab

#### ✅ ตรวจสอบ Errors (สีแดง)
```
❌ ERROR: ควรไม่มี errors สีแดง
✅ ถ้ามี errors:
  - ดู error message
  - ดู stack trace
  - ตรวจสอบว่า API ทำงานหรือไม่
```

#### ⚠️ ตรวจสอบ Warnings (สีเหลือง)
```
⚠️ WARNINGS: อาจมี warnings บางตัวที่ OK:
  - React DevTools warning → OK (ไม่กระทบ)
  - React Router warnings → แก้ไขแล้ว
  - Deprecation warnings → ควรแก้ไขในอนาคต
```

#### ℹ️ ตรวจสอบ Info/Logs (สีเทา)
```
ℹ️ LOGS: ดูว่า API calls ทำงานถูกต้องหรือไม่
```

### 2. Network Tab

#### ✅ ตรวจสอบ API Calls เมื่อ Login

**Login Request:**
```
1. เปิด Network tab (F12 → Network)
2. Login ด้วย admin / password123
3. ตรวจสอบ:

✅ POST /api/auth/login
   Status: 200 OK
   Request Payload: { username: "admin", password: "password123" }
   Response: { access_token: "...", user: {...} }
```

**หลังจาก Login:**
```
✅ ตรวจสอบว่ามี Authorization header หรือไม่:
   Headers → Request Headers → Authorization: Bearer <token>
```

**ถ้า API Call Fail:**
```
❌ Status: 400, 401, 500
   → ดู Response tab สำหรับ error message
   → ตรวจสอบ backend ว่าทำงานหรือไม่
   → ตรวจสอบ DATABASE_URL ใน backend/.env
```

### 3. Application Tab

#### ✅ ตรวจสอบ LocalStorage

**หลังจาก Login:**
```
1. เปิด Application tab (F12 → Application)
2. ไปที่ Storage → Local Storage → http://localhost:5173
3. ตรวจสอบว่ามี:
   ✅ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ✅ user: {"id":1,"username":"admin","name":"ผู้ดูแลระบบ","role":"ADMIN"}
```

**ถ้าไม่มี token:**
```
❌ Login ไม่สำเร็จ
   → ตรวจสอบ Network tab ว่า login API ทำงานหรือไม่
   → ตรวจสอบ console สำหรับ errors
```

### 4. React DevTools (ถ้าติดตั้งแล้ว)

#### ✅ ตรวจสอบ Component State

**หลังจาก Login:**
```
1. เปิด React DevTools
2. คลิกที่ <AuthProvider>
3. ตรวจสอบ hooks:
   ✅ user: { id: 1, username: "admin", ... }
   ✅ isAuthenticated: true
   ✅ loading: false
```

**ตรวจสอบ Route:**
```
1. ดู <AppRoutes> component
2. ตรวจสอบว่า isAuthenticated = true
3. ตรวจสอบว่าแสดง <DashboardPage> หรือไม่
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Console มี Red Errors

**ตัวอย่าง Error:**
```
❌ Uncaught TypeError: Cannot read property 'map' of undefined
   → ตรวจสอบว่า API response ถูกต้องหรือไม่
   → ตรวจสอบว่า state มี default value หรือไม่
```

**วิธีแก้:**
```typescript
// ใน component:
const [data, setData] = useState([]); // กำหนด default เป็น []

// ตรวจสอบก่อนใช้ map:
{data && data.length > 0 && data.map(...)}
```

---

### Issue 2: Network Request Failed / CORS Error

**Error:**
```
❌ Access to XMLHttpRequest has been blocked by CORS policy
   → Backend ไม่ได้ตั้งค่า CORS ถูกต้อง
```

**วิธีแก้:**
```typescript
// backend/src/main.ts
app.enableCors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true,
});
```

---

### Issue 3: 401 Unauthorized

**Error:**
```
❌ POST /api/customers 401 (Unauthorized)
   → Token หมดอายุ หรือไม่ได้ส่ง token
```

**วิธีตรวจสอบ:**
```
1. ไปที่ Application → Local Storage
2. ตรวจสอบว่ามี token หรือไม่
3. ตรวจสอบ Network → Request Headers → Authorization
4. ถ้าไม่มี token → Login ใหม่
```

---

### Issue 4: 404 Not Found

**Error:**
```
❌ GET /api/customers 404 (Not Found)
   → API endpoint ไม่ถูกต้อง หรือ backend ไม่มี route นี้
```

**วิธีแก้:**
```
1. ตรวจสอบ API URL ใน frontend/src/services/api/client.ts
2. ตรวจสอบ backend routes ว่า path ถูกต้องหรือไม่
3. ตรวจสอบ backend ว่าทำงานที่ port 4000 หรือไม่
```

---

### Issue 5: Token ไม่ถูกเก็บใน LocalStorage

**ปัญหา:**
```
❌ Login สำเร็จ แต่ไม่มี token ใน localStorage
```

**วิธีตรวจสอบ:**
```typescript
// frontend/src/services/api/auth.service.ts
// ตรวจสอบว่า setAuth ถูกเรียกหรือไม่

setAuth(token: string, user: User) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}
```

---

## 📊 Checklist การตรวจสอบหลัง Login

### Console Tab ✅
- [ ] ไม่มี errors สีแดง
- [ ] Warnings เป็นแค่ React DevTools (ไม่กระทบ)
- [ ] ไม่มี React Router warnings (แก้ไขแล้ว)

### Network Tab ✅
- [ ] POST /api/auth/login → 200 OK
- [ ] Response มี `access_token` และ `user`
- [ ] API calls อื่นๆ มี Authorization header

### Application Tab ✅
- [ ] localStorage มี `token`
- [ ] localStorage มี `user` object
- [ ] token เป็น JWT string ที่ถูกต้อง

### Page Display ✅
- [ ] Redirect ไปหน้า /dashboard
- [ ] แสดง Dashboard page
- [ ] แสดง Welcome message พร้อมชื่อ user
- [ ] แสดง Summary cards
- [ ] แสดง Quick actions menu

---

## 🎯 Quick Debug Commands

**ใน Browser Console (F12 → Console):**

```javascript
// ตรวจสอบ token
localStorage.getItem('token')

// ตรวจสอบ user
JSON.parse(localStorage.getItem('user'))

// ลบ token (เพื่อ logout)
localStorage.removeItem('token')
localStorage.removeItem('user')

// ตรวจสอบ API base URL
import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

// ตรวจสอบว่า authenticated หรือไม่
// (ต้อง login ก่อน)
```

---

## 🔧 การ Clear Cache

**ถ้ามีปัญหาแปลกๆ ให้ลอง clear cache:**

1. **Clear Browser Cache:**
   ```
   Ctrl + Shift + Delete
   → เลือก "Cached images and files"
   → Clear data
   ```

2. **Clear Vite Cache:**
   ```bash
   # หยุด dev server
   # ลบ cache
   Remove-Item -Recurse -Force frontend\node_modules\.vite
   # รันใหม่
   npm run dev
   ```

3. **Hard Refresh:**
   ```
   Ctrl + Shift + R (Windows/Linux)
   Cmd + Shift + R (Mac)
   ```

---

## 📝 การบันทึก Bug Report

**เมื่อพบ bug ให้บันทึก:**

1. **Console Errors:**
   - Copy error message ทั้งหมด
   - Copy stack trace

2. **Network Requests:**
   - Screenshot Network tab
   - ดู Request และ Response

3. **Steps to Reproduce:**
   - ขั้นตอนที่ทำให้เกิด bug

4. **Environment:**
   - Browser & Version
   - OS
   - Frontend URL
   - Backend URL

---

**Happy Debugging! 🐛🔍**
