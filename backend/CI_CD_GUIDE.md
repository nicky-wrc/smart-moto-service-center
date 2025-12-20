# CI/CD Guide - Smart Moto Service Center

## 📋 Overview

ระบบใช้ GitHub Actions สำหรับ Continuous Integration (CI) เพื่อ:
- ✅ ตรวจสอบ code quality (linting)
- ✅ รัน automated tests
- ✅ ตรวจสอบ build success

## 🔄 CI Workflow

### Trigger Events

CI จะทำงานอัตโนมัติเมื่อ:
- Push code ไปยัง branches: `main`, `develop`, `Nicky_dev`
- สร้าง Pull Request ไปยัง `main` หรือ `develop`

### Workflow Steps

1. **Checkout code** - ดึง code จาก repository
2. **Setup Node.js** - ติดตั้ง Node.js 20 และ cache dependencies
3. **Install dependencies** - ติดตั้ง npm packages (`npm ci`)
4. **Generate Prisma Client** - Generate Prisma client
5. **Run linter** - ตรวจสอบ code style (`npm run lint`)
6. **Run tests** - รัน unit tests (`npm run test`)
7. **Check coverage** - ตรวจสอบ test coverage (optional, ไม่ fail build)

### Workflow File

Location: `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [ main, develop, Nicky_dev ]
  pull_request:
    branches: [ main, develop ]

jobs:
  lint-and-test:
    name: Lint and Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci --prefix backend
      - run: npm run prisma:generate --prefix backend
      - run: npm run lint --prefix backend
      - run: npm run test --prefix backend
```

## ✅ Status Checks

CI จะแสดง status ใน:
- **GitHub PR page** - ดู CI status ด้านล่าง PR
- **GitHub Actions tab** - ดู logs และ details

### Required Checks

PR ต้องผ่าน checks เหล่านี้ก่อน merge:
- ✅ Linter passes
- ✅ Tests pass

## 🐛 Troubleshooting

### CI Fails: Linter Errors

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

### CI Fails: Tests Fail

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

### CI Fails: Prisma Generate Error

**ปัญหา:** Prisma client generate ไม่สำเร็จ

**แก้ไข:**
```bash
cd backend
npm run prisma:generate  # ตรวจสอบ schema.prisma
# แก้ไข schema ถ้าจำเป็น
git add .
git commit -m "fix: update prisma schema"
git push
```

## 🔧 Local Testing

ก่อน push code ควรรัน checks เหล่านี้ใน local:

```bash
cd backend

# 1. Lint check
npm run lint

# 2. Run tests
npm run test

# 3. (Optional) Check coverage
npm run test:cov
```

## 📊 Test Coverage

ปัจจุบัน CI จะรัน coverage แต่ไม่ enforce minimum threshold

ถ้าต้องการ enforce coverage:

1. แก้ไข `package.json`:
```json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

2. แก้ไข CI workflow ให้ fail ถ้า coverage ต่ำกว่า threshold

## 🚀 Future Enhancements

แผนการพัฒนาต่อ:
- [ ] Add build step (ตรวจสอบว่า build สำเร็จ)
- [ ] Add deployment workflow (CD)
- [ ] Add database migration checks
- [ ] Add security scanning
- [ ] Add dependency vulnerability checks

---

**หมายเหตุ:** CI/CD ยังอยู่ในขั้นเบื้องต้น อาจจะเพิ่ม features เพิ่มเติมในอนาคต

