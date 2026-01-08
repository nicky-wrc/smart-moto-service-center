# CI Troubleshooting Guide

## ปัญหาที่พบบ่อย

### 1. CI Fails: Prisma Generate Error

**อาการ:** 
```
Error: Can't reach database server
```

**สาเหตุ:** Prisma generate ไม่ต้องการ database connection แต่บางครั้งอาจมีปัญหากับ path

**แก้ไข:**
- ใช้ `npx prisma generate` แทน `npm run prisma:generate`
- ตรวจสอบว่า `schema.prisma` อยู่ที่ `backend/prisma/schema.prisma`

### 2. CI Fails: Tests Fail

**อาการ:**
```
Tests fail because no database connection
```

**สาเหตุ:** Tests ต้องการ database แต่ CI ไม่มี database setup

**แก้ไข:**
- ตั้งค่า `continue-on-error: true` สำหรับ test step ชั่วคราว
- หรือ setup test database ใน CI (ต้องมี PostgreSQL service)
- หรือ skip tests ที่ต้องใช้ database

### 3. CI Fails: Linter Errors

**อาการ:**
```
ESLint errors found
```

**แก้ไข:**
```bash
cd backend
npm run lint  # auto-fix บาง errors
# แก้ไข errors ที่เหลือ
git add .
git commit -m "fix: resolve linter errors"
git push
```

### 4. CI Fails: npm ci Error

**อาการ:**
```
npm ERR! code ENOENT
npm ERR! syscall open
npm ERR! path package-lock.json
```

**สาเหตุ:** `package-lock.json` ไม่มีใน repository หรือ path ผิด

**แก้ไข:**
- ตรวจสอบว่า `backend/package-lock.json` มีอยู่
- Commit `package-lock.json` ถ้ายังไม่ได้ commit

## การแก้ไข CI Workflow

### Option 1: Skip Tests (Temporary)

ถ้ายังไม่มี database setup สามารถ skip tests ชั่วคราว:

```yaml
- name: Run tests
  working-directory: ./backend
  run: npm run test
  continue-on-error: true  # ไม่ fail CI ถ้า tests fail
```

### Option 2: Setup Test Database

ถ้าต้องการรัน tests จริงๆ ต้อง setup PostgreSQL ใน CI:

```yaml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: test_db
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5

env:
  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

steps:
  # ... other steps
  - name: Run migrations
    working-directory: ./backend
    run: npx prisma migrate deploy
  - name: Run tests
    working-directory: ./backend
    run: npm run test
```

### Option 3: Mock Database in Tests

ใช้ in-memory database หรือ mocks สำหรับ tests

## ตรวจสอบ CI Logs

1. ไปที่ GitHub repository → Actions tab
2. คลิก workflow run ที่ล้มเหลว
3. ดู logs ในแต่ละ step
4. หาข้อความ error (สีแดง)

## Best Practices

1. **Run locally ก่อน push:**
   ```bash
   cd backend
   npm run lint
   npm run test
   ```

2. **Fix linter errors ทันที:**
   - Linter errors ควรแก้ไขทันที
   - อย่า push code ที่มี linter errors

3. **Tests ควรผ่าน:**
   - ถ้า tests fail ต้องแก้ไขก่อน merge
   - ใช้ `continue-on-error: true` เฉพาะกรณีจำเป็น

4. **Keep CI fast:**
   - ใช้ cache สำหรับ dependencies
   - ใช้ parallel jobs ถ้าเป็นไปได้

---

**Note:** สำหรับตอนนี้ CI จะรัน linter และ tests แต่ tests อาจ fail ถ้าไม่มี database setup (ใช้ `continue-on-error: true` ชั่วคราว)


