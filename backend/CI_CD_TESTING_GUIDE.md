# 🧪 คู่มือการทดสอบ CI/CD - Smart Moto Service Center

## 📋 สารบัญ

1. [วิธีทดสอบ CI/CD](#วิธีทดสอบ-cicd)
2. [ทดสอบใน Local ก่อน](#ทดสอบใน-local-ก่อน)
3. [ทดสอบใน GitHub Actions](#ทดสอบใน-github-actions)
4. [ตรวจสอบผลลัพธ์](#ตรวจสอบผลลัพธ์)
5. [Troubleshooting](#troubleshooting)

---

## วิธีทดสอบ CI/CD

มี 2 วิธีหลัก:
1. **ทดสอบใน Local** - รัน commands ที่ CI จะรัน (แนะนำทำก่อน)
2. **ทดสอบใน GitHub Actions** - Push code ไป GitHub เพื่อ trigger CI

---

## ทดสอบใน Local ก่อน

### ขั้นตอนที่ 1: ตรวจสอบว่า Dependencies ติดตั้งแล้ว

```bash
cd backend
npm ci
```

**Expected:** ไม่มี error, dependencies ติดตั้งสำเร็จ

---

### ขั้นตอนที่ 2: ทดสอบ Prisma Generate

```bash
cd backend
npx prisma generate
```

**Expected:** 
```
✔ Generated Prisma Client (version 5.22.0) in ./node_modules/.prisma/client
```

---

### ขั้นตอนที่ 3: ทดสอบ Linter

```bash
cd backend
npm run lint
```

**Expected:** 
- ✅ ไม่มี linting errors
- ✅ หรือมี auto-fix errors บางส่วน

**ถ้ามี errors:**
```bash
# ESLint จะพยายาม auto-fix บาง errors
# ถ้ายังมี errors ต้องแก้ไขด้วยตนเอง
```

---

### ขั้นตอนที่ 4: ทดสอบ Tests

```bash
cd backend
npm run test
```

**Expected:**
```
 PASS  src/app.controller.spec.ts
  AppController
    root
      ✓ should return "OK" (X ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
```

**ถ้า tests ไม่ผ่าน:**
- ตรวจสอบ error messages
- แก้ไข tests หรือ code ให้ผ่าน
- รัน `npm run test` อีกครั้ง

---

### ขั้นตอนที่ 5: ทดสอบ Build (Optional)

```bash
cd backend
npm run build
```

**Expected:**
```
✔ Build successful
```

---

## ทดสอบใน GitHub Actions

### วิธีที่ 1: Push Code ไป Branch ที่มี CI

CI จะทำงานอัตโนมัติเมื่อ push ไปยัง:
- `main`
- `develop`
- `Nicky_dev`

**ขั้นตอน:**
```bash
# 1. แก้ไขไฟล์เล็กน้อย (เช่น เพิ่ม comment)
echo "// CI/CD test" >> backend/src/app.controller.ts

# 2. Commit และ Push
git add .
git commit -m "test: trigger CI/CD workflow"
git push origin <branch-name>
```

---

### วิธีที่ 2: สร้าง Pull Request

CI จะทำงานอัตโนมัติเมื่อสร้าง PR ไปยัง:
- `main`
- `develop`

**ขั้นตอน:**
```bash
# 1. สร้าง branch ใหม่
git checkout -b test/ci-cd-workflow

# 2. แก้ไขไฟล์เล็กน้อย
echo "// CI/CD test" >> backend/src/app.controller.ts

# 3. Commit และ Push
git add .
git commit -m "test: trigger CI/CD workflow"
git push origin test/ci-cd-workflow

# 4. สร้าง PR บน GitHub
# ไปที่ GitHub → New Pull Request
# เลือก base: develop, compare: test/ci-cd-workflow
```

---

## ตรวจสอบผลลัพธ์

### 1. ดูใน GitHub Actions Tab

1. ไปที่ GitHub repository
2. คลิกแท็บ **"Actions"**
3. จะเห็น workflow runs ทั้งหมด
4. คลิกที่ workflow run ล่าสุด
5. ดูผลลัพธ์ของแต่ละ step

**Expected Results:**
- ✅ **Checkout code** - Success
- ✅ **Use Node.js** - Success
- ✅ **Install dependencies** - Success
- ✅ **Generate Prisma Client** - Success
- ✅ **Run linter** - Success
- ✅ **Run tests** - Success

---

### 2. ดูใน Pull Request

ถ้าสร้าง PR:
1. ไปที่ PR page
2. ดูที่ด้านล่างของ PR
3. จะเห็น **"Checks"** section
4. จะแสดง CI status:
   - ✅ **All checks have passed** (สีเขียว)
   - ❌ **Some checks were not successful** (สีแดง)

---

### 3. ดู Logs

ถ้า CI fail:
1. คลิกที่ workflow run ที่ fail
2. คลิกที่ job ที่ fail (เช่น "Lint and Test")
3. คลิกที่ step ที่ fail
4. ดู error logs

**ตัวอย่าง Error Logs:**
```
Error: npm run lint failed
...
✖ 1 error found
```

---

## Troubleshooting

### ❌ CI Fail: Linter Errors

**ปัญหา:** Code มี linting errors

**แก้ไข:**
```bash
cd backend
npm run lint  # จะ auto-fix บาง errors
# แก้ไข errors ที่เหลือด้วยตนเอง
git add .
git commit -m "fix: resolve linter errors"
git push
```

---

### ❌ CI Fail: Tests Fail

**ปัญหา:** Tests ไม่ผ่าน

**แก้ไข:**
```bash
cd backend
npm run test  # รัน tests ดู errors
# แก้ไข tests หรือ code ให้ผ่าน
git add .
git commit -m "fix: fix failing tests"
git push
```

---

### ❌ CI Fail: Prisma Generate Error

**ปัญหา:** Prisma client generate ไม่สำเร็จ

**แก้ไข:**
```bash
cd backend
npx prisma generate  # ตรวจสอบ schema.prisma
# แก้ไข schema ถ้าจำเป็น
git add .
git commit -m "fix: update prisma schema"
git push
```

---

### ❌ CI Fail: Install Dependencies Error

**ปัญหา:** `npm ci` ไม่สำเร็จ

**สาเหตุที่เป็นไปได้:**
- `package-lock.json` ไม่ sync กับ `package.json`
- Dependencies มีปัญหา

**แก้ไข:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "fix: update package-lock.json"
git push
```

---

### ⚠️ CI ไม่ทำงาน (ไม่ trigger)

**สาเหตุที่เป็นไปได้:**
1. Push ไป branch ที่ไม่มีใน workflow
2. Workflow file มี syntax error

**ตรวจสอบ:**
```bash
# ตรวจสอบว่า branch อยู่ใน workflow
cat .github/workflows/ci.yml

# ตรวจสอบว่า workflow file ถูกต้อง
# ไปที่ GitHub → Actions → จะเห็น error ถ้ามี
```

---

## ✅ Checklist การทดสอบ CI/CD

- [ ] ทดสอบใน local: `npm ci` สำเร็จ
- [ ] ทดสอบใน local: `npx prisma generate` สำเร็จ
- [ ] ทดสอบใน local: `npm run lint` สำเร็จ
- [ ] ทดสอบใน local: `npm run test` สำเร็จ
- [ ] Push code ไป GitHub
- [ ] ตรวจสอบ GitHub Actions tab
- [ ] ตรวจสอบว่า CI workflow ทำงาน
- [ ] ตรวจสอบว่า CI ผ่าน (สีเขียว)

---

## 🎯 Quick Test Script

สร้างไฟล์ `test-ci.sh` สำหรับทดสอบ CI ใน local:

```bash
#!/bin/bash
echo "🧪 Testing CI/CD locally..."

cd backend

echo "📦 Installing dependencies..."
npm ci

echo "🔧 Generating Prisma Client..."
npx prisma generate

echo "🔍 Running linter..."
npm run lint

echo "🧪 Running tests..."
npm run test

echo "✅ All CI checks passed!"
```

**วิธีใช้:**
```bash
chmod +x test-ci.sh
./test-ci.sh
```

---

## 📚 เอกสารที่เกี่ยวข้อง

- `CI_CD_GUIDE.md` - คู่มือ CI/CD
- `GIT_CONVENTIONS.md` - Git conventions
- `COMPLETE_API_TESTING_GUIDE.md` - คู่มือการทดสอบ API

---

**🎉 สรุป: ทดสอบ CI/CD ได้โดยรัน commands ใน local ก่อน แล้วค่อย push ไป GitHub เพื่อดูผลลัพธ์ใน Actions tab!**
