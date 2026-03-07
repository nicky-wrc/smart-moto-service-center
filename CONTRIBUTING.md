# Contributing to Smart Moto Service Center

ขอบคุณที่สนใจช่วยพัฒนาระบบ! กรุณาอ่านเอกสารนี้ก่อนเริ่มทำงาน

## 📋 Getting Started

1. **Fork และ Clone repository**
   ```bash
   git clone https://github.com/your-org/smart-moto-service-center.git
   cd smart-moto-service-center
   ```

2. **Setup environment**
   ```bash
   # Backend
   cd backend
   npm install
   cp .env.example .env  # แก้ไข .env ให้ถูกต้อง
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```

3. **Run development server**
   ```bash
   npm run start:dev
   ```

## 🌿 Branch Strategy

ใช้ Git Flow แบบง่าย:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/<feature-name>` - New features
- `bugfix/<issue-id>-<description>` - Bug fixes
- `hotfix/<issue-id>-<description>` - Urgent production fixes

### การสร้าง Branch

```bash
# สร้าง feature branch จาก develop
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# หรือ bugfix
git checkout -b bugfix/123-description
```

## 💬 Commit Messages

ใช้ [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

### Examples:

```bash
feat(auth): add JWT authentication
fix(payments): correct total amount calculation
docs(api): update Swagger documentation
refactor(services): extract common validation logic
```

### Subject Guidelines:
- ใช้ imperative mood ("add" not "added")
- ไม่ต้อง capitalize ตัวแรก
- ไม่ต้องใส่ period ท้าย
- ควรสั้น (50 ตัวอักษรหรือน้อยกว่า)

## 📝 Pull Request Process

1. **เตรียม Code**
   - ตรวจสอบว่า code ผ่าน linter (`npm run lint`)
   - ตรวจสอบว่า tests ผ่าน (`npm run test`)
   - อัปเดต documentation ถ้าจำเป็น

2. **สร้าง PR**
   - Target branch: `develop` (หรือ `main` สำหรับ hotfix)
   - ใช้ PR template ที่มีอยู่
   - อธิบายสิ่งที่เปลี่ยนแปลงให้ชัดเจน

3. **รอ Review**
   - ต้องมี approval อย่างน้อย 1 คน
   - แก้ไขตาม comments
   - ทดสอบอีกครั้งหลังแก้ไข

4. **Merge**
   - ใช้ "Squash and merge" (แนะนำ)
   - หรือ "Rebase and merge"
   - ลบ branch หลังจาก merge

## ✅ Code Standards

### TypeScript
- ใช้ TypeScript strict mode
- ใช้ interfaces และ types ให้ถูกต้อง
- หลีกเลี่ยง `any` ถ้าเป็นไปได้

### NestJS Patterns
- ใช้ Dependency Injection
- Service layer สำหรับ business logic
- Controller สำหรับ HTTP handling
- DTOs สำหรับ validation

### Testing
- เขียน unit tests สำหรับ services
- เขียน e2e tests สำหรับ critical paths
- เป้าหมาย coverage: >80%

### Documentation
- อัปเดต Swagger documentation
- เพิ่ม comments สำหรับ complex logic
- อัปเดต README ถ้าจำเป็น

## 🐛 Reporting Bugs

เมื่อพบ bug:

1. ตรวจสอบว่าเป็น bug ใหม่ (ยังไม่มี issue)
2. สร้าง issue พร้อม:
   - Description ที่ชัดเจน
   - Steps to reproduce
   - Expected vs Actual behavior
   - Screenshots (ถ้ามี)

## 💡 Suggesting Features

1. สร้าง issue พร้อม:
   - Problem statement
   - Proposed solution
   - Use cases

2. รอ discussion และ approval

3. เริ่มทำงานหลังจากได้รับการ approve

## 📚 Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Conventions](./backend/GIT_CONVENTIONS.md)

## ❓ Questions?

ติดต่อทีมผ่าน:
- GitHub Issues
- Team chat
- Email

---

**ขอบคุณที่ช่วยพัฒนาระบบ! 🚀**


