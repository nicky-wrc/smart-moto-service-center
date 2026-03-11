# Getting Started — Smart Moto Service Center

---

# 🚀 Quick Start Guide - สำหรับเพื่อนในทีม

**อัปเดตล่าสุด:** 2024-12-20

---

## ✅ สิ่งที่ต้องมีก่อนเริ่ม

1. **Git** - `git --version`
2. **Node.js** (LTS) - `node -v` และ `npm -v`
3. **Docker Desktop** - ต้องเปิดอยู่
4. **VS Code** (แนะนำ)

---

## 📥 ขั้นตอนที่ 1: Clone Project

```bash
# Clone repository
git clone https://github.com/nicky-wrc/smart-moto-service-center.git

# เข้าไปในโฟลเดอร์
cd smart-moto-service-center

# Switch ไปที่ branch develop
git checkout develop
git pull
```

---

## 📦 ขั้นตอนที่ 2: ติดตั้ง Dependencies

### Frontend
```bash
cd frontend
npm install
cd ..
```

### Backend
```bash
cd backend
npm install
cd ..
```

---

## ⚙️ ขั้นตอนที่ 3: ตั้งค่า Environment Variables

### Backend (.env)

```bash
# เข้าไปที่ backend/
cd backend

# สร้างไฟล์ .env จาก .env.example

# Windows (CMD/PowerShell)
copy .env.example .env

# macOS/Linux/Git Bash
cp .env.example .env
```

**แก้ไข `backend/.env`:**

```env
DATABASE_URL="postgresql://smartmoto:smartmoto_pw@127.0.0.1:5433/smartmoto?schema=public"
JWT_SECRET="your_secret_key_here_change_me"
JWT_EXPIRES_IN="1d"
PORT=4000
NODE_ENV=development
```

**⚠️ สำคัญ:** เปลี่ยน `JWT_SECRET` เป็นค่าที่ปลอดภัย (random string)

---

## 🗄️ ขั้นตอนที่ 4: เปิด Database (PostgreSQL)

```bash
# กลับไปที่ root ของ repo (ที่มี docker-compose.yml)
cd ..

# เปิด Docker container
docker compose up -d

# ตรวจสอบว่าเปิดสำเร็จ
docker ps
```

**Expected Output:**
```
CONTAINER ID   IMAGE             PORTS                      NAMES
xxxxx          postgres:15      0.0.0.0:5433->5432/tcp    smartmoto_db
```

---

## 🗃️ ขั้นตอนที่ 5: สร้าง Database Schema

```bash
cd backend

# สร้างตารางใน database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# (Optional) Seed ข้อมูลทดสอบ
npm run prisma:seed
```

**Expected Output:**
```
✔ Generated Prisma Client
The database is now in sync with your schema.
```

---

## 🎯 ขั้นตอนที่ 6: รันระบบ

### Terminal 1: Backend
```bash
cd backend
npm run start:dev
```

**Expected Output:**
```
API: http://localhost:4000/api
Swagger: http://localhost:4000/docs
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

---

## ✅ ตรวจสอบว่าระบบทำงาน

1. **Backend:**
   - เปิด: `http://localhost:4000/api` → ควรเห็น `{"message":"Smart Moto Service Center API"}`
   - เปิด: `http://localhost:4000/docs` → ควรเห็น Swagger UI

2. **Frontend:**
   - เปิด: `http://localhost:5173` → ควรเห็นหน้าแรก

3. **Database:**
   - รัน: `npx prisma studio` (ใน backend/)
   - เปิด: `http://localhost:5555` → ควรเห็น Prisma Studio

---

## 🔑 ข้อมูลเข้าสู่ระบบ (Test Accounts)

หลังจาก seed ข้อมูลแล้ว สามารถใช้ account ต่อไปนี้:

| Username | Password | Role |
|----------|----------|------|
| admin | password123 | ADMIN |
| sa1 | password123 | SERVICE_ADVISOR |
| tech1 | password123 | TECHNICIAN |
| cashier1 | password123 | CASHIER |
| stock1 | password123 | STOCK_KEEPER |

---

## 📚 เอกสารที่ควรอ่าน

### สำหรับทุกคน:
- `README.md` - ภาพรวมโปรเจค
- `CONTRIBUTING.md` - วิธีทำงานร่วมกัน
- `backend/GIT_CONVENTIONS.md` - Git conventions

### สำหรับ Backend:
- `backend/COMPLETE_API_TESTING_GUIDE.md` - คู่มือทดสอบ API
- `backend/SWAGGER_USAGE.md` - วิธีใช้ Swagger UI
- `backend/CI_CD_GUIDE.md` - CI/CD workflow
- `docs/TEAM_ASSIGNMENT_DETAILED.md` - แบ่งหน้าที่ละเอียด

### สำหรับ Frontend:
- `frontend/README.md` - Frontend setup
- `docs/TEAM_ASSIGNMENT_DETAILED.md` - แบ่งหน้าที่ละเอียด

---

## 🌿 ขั้นตอนการทำงาน (Git Workflow)

### 1. สร้าง Branch ของตัวเอง

```bash
# อัปเดต develop ก่อน
git checkout develop
git pull origin develop

# สร้าง branch ใหม่
git checkout -b feature/your-feature-name

# ตัวอย่าง:
git checkout -b feature/inventory-package-management
git checkout -b feature/billing-invoice
```

### 2. ทำงานและ Commit

```bash
# ทำงานเสร็จแล้ว
git add .

# Commit ตาม convention
git commit -m "feat(inventory): add package management API"

# Push ขึ้น GitHub
git push -u origin feature/your-feature-name
```

### 3. สร้าง Pull Request

1. ไปที่ GitHub repository
2. คลิก "New Pull Request"
3. เลือก base: `develop`, compare: `feature/your-feature-name`
4. กรอก PR description
5. รอ review และ approval
6. Merge หลังจากได้รับการ approve

---

## 🧪 ทดสอบ API

### วิธีที่ 1: Swagger UI

1. เปิด: `http://localhost:4000/docs`
2. Login เพื่อรับ token:
   - POST `/api/auth/login`
   - ใส่ username/password
   - คัดลอก `access_token`
3. Authorize:
   - คลิกปุ่ม "Authorize" (🔒)
   - ใส่ token
   - คลิก "Authorize"
4. ทดสอบ API endpoints อื่นๆ

### วิธีที่ 2: Postman/Insomnia

1. Import collection จาก Swagger: `http://localhost:4000/docs-json`
2. Login เพื่อรับ token
3. ตั้งค่า Authorization: Bearer Token
4. ทดสอบ API endpoints

---

## 🐛 Troubleshooting

### ปัญหา: Database ไม่สามารถเชื่อมต่อได้

**สาเหตุ:** Docker ไม่ได้เปิด หรือ port ไม่ตรง

**แก้ไข:**
```bash
# ตรวจสอบ Docker
docker ps

# ถ้าไม่เห็น container
docker compose up -d

# ตรวจสอบ .env ว่าใช้ port 5433
cat backend/.env | grep DATABASE_URL
```

### ปัญหา: Port ชน

**Backend (4000):**
- เปลี่ยน `PORT` ใน `backend/.env`

**Frontend (5173):**
- Vite จะ auto-increment port

**Database (5433):**
- ถ้าจำเป็น เปลี่ยน port ใน `docker-compose.yml` และ `backend/.env`

### ปัญหา: Prisma errors

```bash
# ลบ node_modules และ reinstall
cd backend
rm -rf node_modules
npm install

# Generate Prisma Client ใหม่
npx prisma generate

# Push schema ใหม่
npx prisma db push
```

### ปัญหา: Dependencies conflicts

```bash
# ลบ node_modules ทั้งหมด
rm -rf backend/node_modules frontend/node_modules

# ลบ package-lock.json
rm -f backend/package-lock.json frontend/package-lock.json

# ติดตั้งใหม่
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

---

## 📋 Checklist สำหรับเพื่อนใหม่

- [ ] Clone repository สำเร็จ
- [ ] ติดตั้ง dependencies สำเร็จ (backend + frontend)
- [ ] สร้างไฟล์ `.env` และตั้งค่าเรียบร้อย
- [ ] เปิด Docker และ database สำเร็จ
- [ ] รัน `npx prisma db push` สำเร็จ
- [ ] รัน backend สำเร็จ (`npm run start:dev`)
- [ ] รัน frontend สำเร็จ (`npm run dev`)
- [ ] เปิด Swagger UI ได้ (`http://localhost:4000/docs`)
- [ ] Login ได้และทดสอบ API ได้
- [ ] อ่านเอกสารแบ่งหน้าที่ (`docs/TEAM_ASSIGNMENT_DETAILED.md`)
- [ ] สร้าง branch ของตัวเองแล้ว

---

## 💡 Tips

1. **ใช้ Swagger UI** - เป็นเครื่องมือที่ดีที่สุดสำหรับทดสอบ API
2. **ใช้ Prisma Studio** - สำหรับดู/แก้ไขข้อมูลใน database
3. **Commit บ่อยๆ** - แบ่ง commit เป็นส่วนย่อยๆ
4. **Pull ก่อน Push** - `git pull` ก่อน `git push` เสมอ
5. **ทดสอบใน Local** - ทดสอบก่อนสร้าง PR
6. **อ่าน Error Messages** - Error messages จะบอกปัญหาชัดเจน

---

## 📞 ติดต่อ

ถ้ามีปัญหาหรือคำถาม:
- สร้าง Issue บน GitHub
- ติดต่อ Backend Lead (คนที่ 1)
- ดูเอกสารเพิ่มเติมใน `docs/` folder

---

**🎉 พร้อมแล้ว! เริ่มทำงานได้เลย!**

**หมายเหตุ:** ถ้ามีปัญหาอะไร ให้ดู `README.md` และ `CONTRIBUTING.md` ก่อน

---

# 📋 แบ่งหน้าที่ทีมพัฒนา - Smart Moto Service Center

**อัปเดตล่าสุด:** 2024-12-20

---

## 👤 คนที่ 1: Backend Lead / System Integrator (คุณ)

**สถานะ:** ✅ **เสร็จแล้ว 99%**

**งานที่รับ:**
- ✅ ตั้งโครง NestJS (modules, config, env, validation, error handling)
- ✅ Auth/JWT + RBAC
- ✅ Prisma Schema + Migration/Seed
- ✅ Core Workflow: Reception (Customer, Bike, Job, Appointment, Fast Track, Warranty)
- ✅ Core Workflow: Workshop (Job status, Labor time, Outsource, Checklist)
- ✅ API Contract + Swagger/OpenAPI
- ✅ CI/CD + Git Conventions

**เอกสาร:** `backend/BACKEND_LEAD_CHECKLIST.md`, `backend/PROJECT_STATUS_REPORT.md`

---

## 👤 คนที่ 2: Backend – Inventory & Stock

### 📋 ภาพรวมงาน

รับผิดชอบระบบคลังอะไหล่ทั้งหมด ตั้งแต่จัดการข้อมูลอะไหล่ จนถึงการเบิกจ่ายและติดตาม Lost Sales

---

### 🎯 งานที่ต้องทำ

#### 1. Part Master (อะไหล่) - **มีอยู่แล้ว แต่ต้องเพิ่มฟีเจอร์**

**สถานะปัจจุบัน:**
- ✅ CRUD พื้นฐาน (Create, Read, Update, Delete)
- ✅ Search และ Filter
- ✅ Low Stock Alert
- ✅ Stock Adjustment

**ต้องเพิ่ม/ปรับปรุง:**

##### 1.1 Supplier Receipt (GR - Goods Receipt)

**API Endpoints ที่ต้องสร้าง:**

```typescript
// backend/src/parts/parts.controller.ts

@Post('receipt')
@Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
@ApiOperation({ summary: 'บันทึกรับของเข้า (Goods Receipt)' })
async createReceipt(
  @Body() dto: CreateReceiptDto,
  @CurrentUser() user: UserPayload,
) {
  return this.partsService.createReceipt(dto, user.userId);
}

@Get('receipts')
@Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
@ApiOperation({ summary: 'ดูประวัติการรับของเข้า' })
async getReceipts(
  @Query('dateFrom') dateFrom?: string,
  @Query('dateTo') dateTo?: string,
  @Query('supplier') supplier?: string,
) {
  return this.partsService.getReceipts({ dateFrom, dateTo, supplier });
}
```

**DTO ที่ต้องสร้าง:**

```typescript
// backend/src/parts/dto/create-receipt.dto.ts

export class CreateReceiptItemDto {
  @ApiProperty()
  partId: number;
  
  @ApiProperty()
  quantity: number;
  
  @ApiProperty()
  unitPrice: number;
  
  @ApiPropertyOptional()
  batchNo?: string;
  
  @ApiPropertyOptional()
  expiryDate?: Date;
}

export class CreateReceiptDto {
  @ApiProperty()
  receiptNo: string; // หรือ auto-generate
  
  @ApiProperty()
  supplierName: string;
  
  @ApiPropertyOptional()
  supplierInvoiceNo?: string;
  
  @ApiProperty()
  receiptDate: Date;
  
  @ApiProperty({ type: [CreateReceiptItemDto] })
  items: CreateReceiptItemDto[];
  
  @ApiPropertyOptional()
  notes?: string;
}
```

**Service Logic ที่ต้องทำ:**

```typescript
// backend/src/parts/parts.service.ts

async createReceipt(dto: CreateReceiptDto, userId: number) {
  // 1. สร้าง StockMovement records (type: IN)
  // 2. อัปเดต stockQuantity ของแต่ละ Part
  // 3. บันทึก reference ไปยัง StockMovement
  // 4. Return receipt summary
}

async getReceipts(filters: {...}) {
  // Query StockMovement where type = 'IN'
  // Group by receipt reference
  // Return formatted receipt list
}
```

**Database Schema:**
- ใช้ `StockMovement` table ที่มีอยู่แล้ว
- เพิ่ม field `reference` สำหรับเก็บ receipt number
- เพิ่ม field `supplierName` ใน StockMovement (หรือสร้าง Supplier table)

---

#### 2. Part Requisition/Issue จากช่าง - **ต้องสร้างใหม่**

**สถานะปัจจุบัน:**
- ❌ ยังไม่มี API สำหรับ approve/reject requisition
- ❌ ยังไม่มี API สำหรับ issue parts

**API Endpoints ที่ต้องสร้าง:**

```typescript
// backend/src/parts/part-requisitions.controller.ts (สร้างใหม่)

@Get('requisitions')
@Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
@ApiOperation({ summary: 'ดูรายการคำขอเบิกอะไหล่' })
async getRequisitions(
  @Query('status') status?: PartRequisitionStatus,
  @Query('jobId') jobId?: number,
) {
  return this.partRequisitionsService.findAll({ status, jobId });
}

@Patch('requisitions/:id/approve')
@Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
@ApiOperation({ summary: 'อนุมัติคำขอเบิกอะไหล่' })
async approveRequisition(
  @Param('id') id: number,
  @Body() dto: ApproveRequisitionDto,
  @CurrentUser() user: UserPayload,
) {
  return this.partRequisitionsService.approve(id, dto, user.userId);
}

@Patch('requisitions/:id/reject')
@Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
@ApiOperation({ summary: 'ปฏิเสธคำขอเบิกอะไหล่' })
async rejectRequisition(
  @Param('id') id: number,
  @Body() dto: RejectRequisitionDto,
  @CurrentUser() user: UserPayload,
) {
  return this.partRequisitionsService.reject(id, dto.reason, user.userId);
}

@Patch('requisitions/:id/issue')
@Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
@ApiOperation({ summary: 'เบิกอะไหล่ (ตัดสต็อก)' })
async issueRequisition(
  @Param('id') id: number,
  @Body() dto: IssueRequisitionDto,
  @CurrentUser() user: UserPayload,
) {
  return this.partRequisitionsService.issue(id, dto, user.userId);
}
```

**Service Logic ที่ต้องทำ:**

```typescript
// backend/src/parts/part-requisitions.service.ts (สร้างใหม่)

async approve(id: number, dto: ApproveRequisitionDto, userId: number) {
  // 1. ตรวจสอบว่า requisition status = PENDING
  // 2. ตรวจสอบว่ามีสต็อกเพียงพอหรือไม่
  // 3. อัปเดต status = APPROVED
  // 4. บันทึก approvedAt, approvedById
  // 5. Return updated requisition
}

async reject(id: number, reason: string, userId: number) {
  // 1. ตรวจสอบว่า requisition status = PENDING
  // 2. อัปเดต status = REJECTED
  // 3. บันทึก rejection reason
  // 4. Return updated requisition
}

async issue(id: number, dto: IssueRequisitionDto, userId: number) {
  // 1. ตรวจสอบว่า requisition status = APPROVED
  // 2. สำหรับแต่ละ item:
  //    - ตรวจสอบสต็อก
  //    - ตัดสต็อก (สร้าง StockMovement type: OUT)
  //    - อัปเดต issuedQuantity
  // 3. อัปเดต status = ISSUED
  // 4. บันทึก issuedAt, issuedById
  // 5. Return issued requisition
}
```

**DTOs ที่ต้องสร้าง:**

```typescript
// backend/src/parts/dto/approve-requisition.dto.ts
export class ApproveRequisitionDto {
  @ApiPropertyOptional()
  notes?: string;
}

// backend/src/parts/dto/reject-requisition.dto.ts
export class RejectRequisitionDto {
  @ApiProperty()
  reason: string;
}

// backend/src/parts/dto/issue-requisition.dto.ts
export class IssueRequisitionItemDto {
  @ApiProperty()
  itemId: number;
  
  @ApiProperty()
  issuedQuantity: number; // อาจน้อยกว่า requestedQuantity
}

export class IssueRequisitionDto {
  @ApiProperty({ type: [IssueRequisitionItemDto] })
  items: IssueRequisitionItemDto[];
  
  @ApiPropertyOptional()
  notes?: string;
}
```

---

#### 3. Kit/Package (ชุดเช็คระยะ) - **ต้องสร้างใหม่**

**สถานะปัจจุบัน:**
- ✅ มี PartPackage model ใน schema
- ❌ ยังไม่มี API สำหรับจัดการ Package

**API Endpoints ที่ต้องสร้าง:**

```typescript
// backend/src/parts/part-packages.controller.ts (สร้างใหม่)

@Post('packages')
@Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
@ApiOperation({ summary: 'สร้างชุดอะไหล่ (Package)' })
async createPackage(@Body() dto: CreatePackageDto) {
  return this.partPackagesService.create(dto);
}

@Get('packages')
@ApiOperation({ summary: 'ดูรายการชุดอะไหล่' })
async getPackages(@Query('isActive') isActive?: boolean) {
  return this.partPackagesService.findAll({ isActive });
}

@Get('packages/:id')
@ApiOperation({ summary: 'ดูรายละเอียดชุดอะไหล่' })
async getPackage(@Param('id') id: number) {
  return this.partPackagesService.findOne(id);
}

@Patch('packages/:id')
@Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
@ApiOperation({ summary: 'อัปเดตชุดอะไหล่' })
async updatePackage(
  @Param('id') id: number,
  @Body() dto: UpdatePackageDto,
) {
  return this.partPackagesService.update(id, dto);
}

@Post('packages/:id/items')
@Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
@ApiOperation({ summary: 'เพิ่มอะไหล่เข้าไปในชุด' })
async addPackageItem(
  @Param('id') id: number,
  @Body() dto: AddPackageItemDto,
) {
  return this.partPackagesService.addItem(id, dto);
}

@Delete('packages/:id/items/:itemId')
@Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
@ApiOperation({ summary: 'ลบอะไหล่ออกจากชุด' })
async removePackageItem(
  @Param('id') id: number,
  @Param('itemId') itemId: number,
) {
  return this.partPackagesService.removeItem(id, itemId);
}
```

**Service Logic ที่ต้องทำ:**

```typescript
// backend/src/parts/part-packages.service.ts (สร้างใหม่)

async create(dto: CreatePackageDto) {
  // 1. Generate packageNo (เช่น PKG-20241220-0001)
  // 2. สร้าง PartPackage
  // 3. สร้าง PartPackageItem สำหรับแต่ละ item
  // 4. Return package with items
}

async addItem(packageId: number, dto: AddPackageItemDto) {
  // 1. ตรวจสอบว่า package มีอยู่
  // 2. ตรวจสอบว่า part มีอยู่
  // 3. สร้าง PartPackageItem
  // 4. Return updated package
}

async removeItem(packageId: number, itemId: number) {
  // 1. ตรวจสอบว่า item อยู่ใน package
  // 2. ลบ PartPackageItem
  // 3. Return updated package
}
```

**DTOs ที่ต้องสร้าง:**

```typescript
// backend/src/parts/dto/create-package.dto.ts
export class CreatePackageItemDto {
  @ApiProperty()
  partId: number;
  
  @ApiProperty()
  quantity: number;
}

export class CreatePackageDto {
  @ApiProperty()
  name: string;
  
  @ApiPropertyOptional()
  description?: string;
  
  @ApiProperty()
  sellingPrice: number;
  
  @ApiProperty({ type: [CreatePackageItemDto] })
  items: CreatePackageItemDto[];
}
```

---

#### 4. Lost Sales Hook/Logic - **ต้องสร้างใหม่**

**สถานะปัจจุบัน:**
- ✅ มี LostSale model ใน schema
- ❌ ยังไม่มี API และ Logic

**API Endpoints ที่ต้องสร้าง:**

```typescript
// backend/src/parts/lost-sales.controller.ts (สร้างใหม่)

@Post('lost-sales')
@Roles('STOCK_KEEPER', 'CASHIER', 'ADMIN', 'MANAGER')
@ApiOperation({ summary: 'บันทึก Lost Sales (ของหมด)' })
async createLostSale(@Body() dto: CreateLostSaleDto) {
  return this.lostSalesService.create(dto);
}

@Get('lost-sales')
@Roles('STOCK_KEEPER', 'ADMIN', 'MANAGER')
@ApiOperation({ summary: 'ดูรายการ Lost Sales' })
async getLostSales(
  @Query('dateFrom') dateFrom?: string,
  @Query('dateTo') dateTo?: string,
  @Query('partId') partId?: number,
) {
  return this.lostSalesService.findAll({ dateFrom, dateTo, partId });
}

@Get('lost-sales/summary')
@Roles('ADMIN', 'MANAGER')
@ApiOperation({ summary: 'สรุป Lost Sales (สำหรับ Dashboard)' })
async getLostSalesSummary(
  @Query('dateFrom') dateFrom?: string,
  @Query('dateTo') dateTo?: string,
) {
  return this.lostSalesService.getSummary({ dateFrom, dateTo });
}
```

**Service Logic ที่ต้องทำ:**

```typescript
// backend/src/parts/lost-sales.service.ts (สร้างใหม่)

async create(dto: CreateLostSaleDto) {
  // 1. ตรวจสอบว่า part มีอยู่
  // 2. คำนวณ totalValue = quantity * unitPrice
  // 3. สร้าง LostSale record
  // 4. Return created record
}

async findAll(filters: {...}) {
  // Query LostSale with filters
  // Include part information
  // Return formatted list
}

async getSummary(filters: {...}) {
  // Group by part
  // Sum totalValue
  // Return summary for dashboard
}
```

**Hook/Logic ที่ต้องเพิ่ม:**

```typescript
// ใน parts.service.ts หรือสร้าง middleware

// เมื่อช่างขอเบิกอะไหล่ แต่สต็อกไม่พอ
async checkStockBeforeIssue(partId: number, quantity: number) {
  const part = await this.findOne(partId);
  
  if (part.stockQuantity < quantity) {
    // แนะนำให้บันทึก Lost Sale
    // หรือ return error ให้ frontend แจ้งเตือน
    throw new BadRequestException(
      `สต็อกไม่พอ: มี ${part.stockQuantity} ชิ้น แต่ต้องการ ${quantity} ชิ้น`
    );
  }
}

// ใน part-requisitions.service.ts
async rejectDueToStock(requisitionId: number, reason: string) {
  // เมื่อ reject เพราะสต็อกไม่พอ
  // แนะนำให้บันทึก Lost Sale อัตโนมัติ
}
```

**DTOs ที่ต้องสร้าง:**

```typescript
// backend/src/parts/dto/create-lost-sale.dto.ts
export class CreateLostSaleDto {
  @ApiProperty()
  partId: number;
  
  @ApiProperty()
  quantity: number;
  
  @ApiProperty()
  unitPrice: number;
  
  @ApiPropertyOptional()
  customerInfo?: string;
  
  @ApiPropertyOptional()
  notes?: string;
}
```

---

### 📁 ไฟล์ที่ต้องสร้าง/แก้ไข

#### ไฟล์ใหม่ที่ต้องสร้าง:

1. `backend/src/parts/part-requisitions.controller.ts`
2. `backend/src/parts/part-requisitions.service.ts`
3. `backend/src/parts/part-requisitions.module.ts`
4. `backend/src/parts/part-packages.controller.ts`
5. `backend/src/parts/part-packages.service.ts`
6. `backend/src/parts/part-packages.module.ts`
7. `backend/src/parts/lost-sales.controller.ts`
8. `backend/src/parts/lost-sales.service.ts`
9. `backend/src/parts/lost-sales.module.ts`

#### DTOs ที่ต้องสร้าง:

1. `backend/src/parts/dto/create-receipt.dto.ts`
2. `backend/src/parts/dto/approve-requisition.dto.ts`
3. `backend/src/parts/dto/reject-requisition.dto.ts`
4. `backend/src/parts/dto/issue-requisition.dto.ts`
5. `backend/src/parts/dto/create-package.dto.ts`
6. `backend/src/parts/dto/update-package.dto.ts`
7. `backend/src/parts/dto/add-package-item.dto.ts`
8. `backend/src/parts/dto/create-lost-sale.dto.ts`

#### ไฟล์ที่ต้องแก้ไข:

1. `backend/src/parts/parts.service.ts` - เพิ่ม createReceipt, getReceipts
2. `backend/src/parts/parts.controller.ts` - เพิ่ม receipt endpoints
3. `backend/src/app.module.ts` - เพิ่ม modules ใหม่

---

### 🔗 Integration Points

**ต้องเชื่อมต่อกับ:**
- `PartRequisition` model (มีอยู่แล้วใน schema)
- `PartPackage` model (มีอยู่แล้วใน schema)
- `LostSale` model (มีอยู่แล้วใน schema)
- `StockMovement` model (มีอยู่แล้วใน schema)
- `Job` model - เมื่อเบิกอะไหล่สำหรับ job

---

### ✅ Checklist

- [ ] สร้าง Goods Receipt API
- [ ] สร้าง Part Requisition Approve/Reject/Issue API
- [ ] สร้าง Part Package CRUD API
- [ ] สร้าง Lost Sales API
- [ ] เพิ่ม Logic สำหรับตรวจสอบสต็อกก่อนเบิก
- [ ] เพิ่ม Logic สำหรับบันทึก Lost Sales อัตโนมัติ
- [ ] ทดสอบ API ทั้งหมด
- [ ] อัปเดต Swagger documentation

---

## 👤 คนที่ 3: Backend – Billing/CRM & Reports

### 📋 ภาพรวมงาน

รับผิดชอบระบบการเงิน CRM และรายงานทั้งหมด ตั้งแต่ใบเสนอราคา จนถึง Dashboard และ Reports

---

### 🎯 งานที่ต้องทำ

#### 1. Quotation → Approve → Billing/Invoice - **มีอยู่แล้ว แต่ต้องปรับปรุง**

**สถานะปัจจุบัน:**
- ✅ CRUD Quotation
- ✅ Send/Approve/Reject Quotation
- ✅ Convert to Job
- ⚠️ ต้องเพิ่ม Invoice generation

**ต้องเพิ่ม/ปรับปรุง:**

##### 1.1 Invoice Generation

**API Endpoints ที่ต้องสร้าง:**

```typescript
// backend/src/payments/invoices.controller.ts (สร้างใหม่)

@Post('invoices')
@Roles('CASHIER', 'ADMIN', 'MANAGER')
@ApiOperation({ summary: 'สร้าง Invoice จาก Job' })
async createInvoice(
  @Body() dto: CreateInvoiceDto,
  @CurrentUser() user: UserPayload,
) {
  return this.invoicesService.create(dto, user.userId);
}

@Get('invoices')
@ApiOperation({ summary: 'ดูรายการ Invoice' })
async getInvoices(
  @Query('dateFrom') dateFrom?: string,
  @Query('dateTo') dateTo?: string,
  @Query('customerId') customerId?: number,
) {
  return this.invoicesService.findAll({ dateFrom, dateTo, customerId });
}

@Get('invoices/:id')
@ApiOperation({ summary: 'ดู Invoice (พร้อม PDF)' })
async getInvoice(@Param('id') id: number) {
  return this.invoicesService.findOne(id);
}

@Get('invoices/:id/pdf')
@ApiOperation({ summary: 'ดาวน์โหลด Invoice เป็น PDF' })
async getInvoicePdf(@Param('id') id: number, @Res() res: Response) {
  const pdf = await this.invoicesService.generatePdf(id);
  res.setHeader('Content-Type', 'application/pdf');
  res.send(pdf);
}
```

**Service Logic:**

```typescript
// backend/src/payments/invoices.service.ts (สร้างใหม่)

async create(dto: CreateInvoiceDto, userId: number) {
  // 1. ดึงข้อมูล Job พร้อม laborTimes, parts, outsources
  // 2. คำนวณค่าใช้จ่ายทั้งหมด
  // 3. สร้าง Invoice record (หรือใช้ Payment table)
  // 4. Generate invoice number
  // 5. Return invoice
}

async generatePdf(id: number) {
  // 1. ดึงข้อมูล Invoice
  // 2. Generate PDF (ใช้ library เช่น pdfkit, puppeteer)
  // 3. Return PDF buffer
}
```

---

#### 2. Payment + Receipt - **มีอยู่แล้ว แต่ต้องปรับปรุง**

**สถานะปัจจุบัน:**
- ✅ Calculate Billing
- ✅ Create Payment
- ✅ Process Payment
- ⚠️ ต้องเพิ่ม Receipt generation

**ต้องเพิ่ม:**

##### 2.1 Receipt Generation

```typescript
// backend/src/payments/receipts.controller.ts (สร้างใหม่)

@Get('receipts/:paymentId')
@ApiOperation({ summary: 'ดู Receipt' })
async getReceipt(@Param('paymentId') paymentId: number) {
  return this.receiptsService.getReceipt(paymentId);
}

@Get('receipts/:paymentId/pdf')
@ApiOperation({ summary: 'ดาวน์โหลด Receipt เป็น PDF' })
async getReceiptPdf(
  @Param('paymentId') paymentId: number,
  @Res() res: Response,
) {
  const pdf = await this.receiptsService.generatePdf(paymentId);
  res.setHeader('Content-Type', 'application/pdf');
  res.send(pdf);
}
```

---

#### 3. Membership + Point (สะสม/ใช้แต้ม) - **ต้องสร้างใหม่**

**สถานะปัจจุบัน:**
- ✅ มี `points` field ใน Customer model
- ❌ ยังไม่มี API สำหรับจัดการ points
- ❌ ยังไม่มี Point Transaction log

**API Endpoints ที่ต้องสร้าง:**

```typescript
// backend/src/customers/points.controller.ts (สร้างใหม่)

@Get('customers/:id/points')
@ApiOperation({ summary: 'ดูแต้มสะสมของลูกค้า' })
async getCustomerPoints(@Param('id') id: number) {
  return this.pointsService.getCustomerPoints(id);
}

@Get('customers/:id/points/transactions')
@ApiOperation({ summary: 'ดูประวัติการสะสม/ใช้แต้ม' })
async getPointTransactions(
  @Param('id') id: number,
  @Query('dateFrom') dateFrom?: string,
  @Query('dateTo') dateTo?: string,
) {
  return this.pointsService.getTransactions(id, { dateFrom, dateTo });
}

@Post('points/earn')
@Roles('CASHIER', 'ADMIN', 'MANAGER')
@ApiOperation({ summary: 'สะสมแต้มให้ลูกค้า' })
async earnPoints(@Body() dto: EarnPointsDto) {
  return this.pointsService.earn(dto);
}

@Post('points/use')
@Roles('CASHIER', 'ADMIN', 'MANAGER')
@ApiOperation({ summary: 'ใช้แต้มลดราคา' })
async usePoints(@Body() dto: UsePointsDto) {
  return this.pointsService.use(dto);
}
```

**Database Schema ที่ต้องเพิ่ม:**

```prisma
// backend/prisma/schema.prisma

model PointTransaction {
  id          Int       @id @default(autoincrement())
  customerId Int
  type        PointTransactionType // EARN, USE, EXPIRED
  points      Int
  amount      Decimal?  @db.Decimal(10, 2) // สำหรับ EARN: ยอดซื้อ, สำหรับ USE: จำนวนเงินที่ลด
  description String?
  reference   String?   // paymentNo, jobNo, etc.
  createdAt   DateTime  @default(now())
  customer    Customer  @relation(fields: [customerId], references: [id])
  
  @@index([customerId])
  @@index([createdAt])
}

enum PointTransactionType {
  EARN
  USE
  EXPIRED
  ADJUSTMENT
}
```

**Service Logic:**

```typescript
// backend/src/customers/points.service.ts (สร้างใหม่)

async earn(dto: EarnPointsDto) {
  // 1. คำนวณแต้มที่จะได้ (เช่น 1% ของยอดซื้อ)
  // 2. อัปเดต Customer.points
  // 3. สร้าง PointTransaction (type: EARN)
  // 4. Return updated points
}

async use(dto: UsePointsDto) {
  // 1. ตรวจสอบว่าลูกค้ามีแต้มเพียงพอ
  // 2. อัปเดต Customer.points (ลดลง)
  // 3. สร้าง PointTransaction (type: USE)
  // 4. Return remaining points
}

// ใน payments.service.ts - เพิ่ม logic
async processPayment(paymentId: number, dto: ProcessPaymentDto) {
  // ... existing code ...
  
  // เพิ่ม: คำนวณแต้มที่จะได้
  const pointsEarned = Math.floor(Number(payment.totalAmount) * 0.01); // 1%
  
  // เพิ่ม: สะสมแต้ม
  if (pointsEarned > 0) {
    await this.pointsService.earn({
      customerId: payment.customerId,
      points: pointsEarned,
      amount: payment.totalAmount,
      reference: payment.paymentNo,
      description: `สะสมแต้มจากงาน ${payment.job.jobNo}`,
    });
  }
}
```

---

#### 4. Service Reminder + History - **ต้องสร้างใหม่**

**สถานะปัจจุบัน:**
- ✅ มี ServiceReminder model ใน schema
- ❌ ยังไม่มี API

**API Endpoints ที่ต้องสร้าง:**

```typescript
// backend/src/customers/service-reminders.controller.ts (สร้างใหม่)

@Post('customers/:customerId/motorcycles/:motorcycleId/reminders')
@Roles('SERVICE_ADVISOR', 'ADMIN', 'MANAGER')
@ApiOperation({ summary: 'ตั้งการแจ้งเตือนเช็คระยะ' })
async createReminder(
  @Param('customerId') customerId: number,
  @Param('motorcycleId') motorcycleId: number,
  @Body() dto: CreateServiceReminderDto,
) {
  return this.serviceRemindersService.create(customerId, motorcycleId, dto);
}

@Get('customers/:customerId/motorcycles/:motorcycleId/reminders')
@ApiOperation({ summary: 'ดูการแจ้งเตือนของรถ' })
async getReminders(
  @Param('customerId') customerId: number,
  @Param('motorcycleId') motorcycleId: number,
) {
  return this.serviceRemindersService.findByMotorcycle(motorcycleId);
}

@Get('reminders/due')
@Roles('SERVICE_ADVISOR', 'ADMIN', 'MANAGER')
@ApiOperation({ summary: 'ดูการแจ้งเตือนที่ถึงกำหนด' })
async getDueReminders() {
  return this.serviceRemindersService.findDue();
}

@Patch('reminders/:id/notify')
@Roles('SERVICE_ADVISOR', 'ADMIN', 'MANAGER')
@ApiOperation({ summary: 'บันทึกว่าแจ้งเตือนแล้ว' })
async markAsNotified(@Param('id') id: number) {
  return this.serviceRemindersService.markAsNotified(id);
}

@Get('customers/:customerId/motorcycles/:motorcycleId/history')
@ApiOperation({ summary: 'ดูประวัติการซ่อม' })
async getServiceHistory(
  @Param('customerId') customerId: number,
  @Param('motorcycleId') motorcycleId: number,
) {
  return this.serviceHistoryService.getHistory(customerId, motorcycleId);
}
```

**Service Logic:**

```typescript
// backend/src/customers/service-reminders.service.ts (สร้างใหม่)

async create(customerId: number, motorcycleId: number, dto: CreateServiceReminderDto) {
  // 1. สร้าง ServiceReminder
  // 2. ตั้งค่า dueDate หรือ dueMileage
  // 3. Return created reminder
}

async findDue() {
  // 1. Query ServiceReminder where:
  //    - isActive = true
  //    - notified = false
  //    - (dueDate <= today OR dueMileage <= currentMileage)
  // 2. Return due reminders
}

// backend/src/customers/service-history.service.ts (สร้างใหม่)

async getHistory(customerId: number, motorcycleId: number) {
  // 1. Query Jobs where motorcycleId
  // 2. Include payment, laborTimes, parts, outsources
  // 3. Group by date
  // 4. Return formatted history
}
```

---

#### 5. Dashboard/Reports Endpoints - **ต้องสร้างใหม่**

**API Endpoints ที่ต้องสร้าง:**

```typescript
// backend/src/reports/dashboard.controller.ts (สร้างใหม่)

@Get('dashboard/sales-summary')
@Roles('ADMIN', 'MANAGER')
@ApiOperation({ summary: 'สรุปยอดขาย' })
async getSalesSummary(
  @Query('dateFrom') dateFrom?: string,
  @Query('dateTo') dateTo?: string,
) {
  return this.dashboardService.getSalesSummary({ dateFrom, dateTo });
}

@Get('dashboard/top-parts')
@Roles('ADMIN', 'MANAGER')
@ApiOperation({ summary: 'อะไหล่ขายดี' })
async getTopParts(
  @Query('dateFrom') dateFrom?: string,
  @Query('dateTo') dateTo?: string,
  @Query('limit') limit?: number,
) {
  return this.dashboardService.getTopParts({ dateFrom, dateTo, limit: limit || 10 });
}

@Get('dashboard/technician-performance')
@Roles('ADMIN', 'MANAGER', 'FOREMAN')
@ApiOperation({ summary: 'ประสิทธิภาพช่าง' })
async getTechnicianPerformance(
  @Query('dateFrom') dateFrom?: string,
  @Query('dateTo') dateTo?: string,
) {
  return this.dashboardService.getTechnicianPerformance({ dateFrom, dateTo });
}

@Get('dashboard/technician-idle-time')
@Roles('ADMIN', 'MANAGER', 'FOREMAN')
@ApiOperation({ summary: 'เวลาว่างของช่าง' })
async getTechnicianIdleTime(
  @Query('dateFrom') dateFrom?: string,
  @Query('dateTo') dateTo?: string,
) {
  return this.dashboardService.getTechnicianIdleTime({ dateFrom, dateTo });
}
```

**Service Logic:**

```typescript
// backend/src/reports/dashboard.service.ts (สร้างใหม่)

async getSalesSummary(filters: {...}) {
  // 1. Query Payments where paidAt between dateFrom and dateTo
  // 2. Group by day/week/month
  // 3. Sum totalAmount
  // 4. Count jobs
  // 5. Return summary
}

async getTopParts(filters: {...}) {
  // 1. Query PartRequisitionItems where requisition.status = ISSUED
  // 2. Join with Part
  // 3. Group by partId
  // 4. Sum quantity
  // 5. Order by quantity DESC
  // 6. Return top N parts
}

async getTechnicianPerformance(filters: {...}) {
  // 1. Query LaborTimes where finishedAt between dates
  // 2. Group by technicianId
  // 3. Calculate:
  //    - Total jobs
  //    - Total hours
  //    - Average time per job
  //    - Standard vs Actual time comparison
  // 4. Return performance metrics
}

async getTechnicianIdleTime(filters: {...}) {
  // 1. Query LaborTimes
  // 2. Calculate gaps between jobs
  // 3. Sum idle time per technician
  // 4. Return idle time report
}
```

---

### 📁 ไฟล์ที่ต้องสร้าง/แก้ไข

#### ไฟล์ใหม่ที่ต้องสร้าง:

1. `backend/src/payments/invoices.controller.ts`
2. `backend/src/payments/invoices.service.ts`
3. `backend/src/payments/receipts.controller.ts`
4. `backend/src/payments/receipts.service.ts`
5. `backend/src/customers/points.controller.ts`
6. `backend/src/customers/points.service.ts`
7. `backend/src/customers/service-reminders.controller.ts`
8. `backend/src/customers/service-reminders.service.ts`
9. `backend/src/customers/service-history.service.ts`
10. `backend/src/reports/dashboard.controller.ts`
11. `backend/src/reports/dashboard.service.ts`
12. `backend/src/reports/reports.module.ts`

#### DTOs ที่ต้องสร้าง:

1. `backend/src/payments/dto/create-invoice.dto.ts`
2. `backend/src/customers/dto/earn-points.dto.ts`
3. `backend/src/customers/dto/use-points.dto.ts`
4. `backend/src/customers/dto/create-service-reminder.dto.ts`
5. `backend/src/reports/dto/sales-summary.dto.ts`

#### Database Migration:

1. สร้าง migration สำหรับ PointTransaction table

---

### ✅ Checklist

- [ ] สร้าง Invoice API + PDF generation
- [ ] สร้าง Receipt API + PDF generation
- [ ] สร้าง Point Management API
- [ ] สร้าง Point Transaction log
- [ ] เพิ่ม Logic สะสมแต้มใน Payment
- [ ] สร้าง Service Reminder API
- [ ] สร้าง Service History API
- [ ] สร้าง Dashboard/Reports API
- [ ] ทดสอบ API ทั้งหมด
- [ ] อัปเดต Swagger documentation

---

## 👤 คนที่ 4: Frontend Lead – Reception + Technician

### 📋 ภาพรวมงาน

รับผิดชอบโครงสร้าง Frontend ทั้งหมด และหน้าสำหรับ Service Advisor และ Technician

---

### 🎯 งานที่ต้องทำ

#### 1. โครง UI ทั้งแอป - **ต้องสร้างใหม่ทั้งหมด**

##### 1.1 Routing Structure

```typescript
// frontend/src/App.tsx หรือ frontend/src/router/index.tsx

const routes = [
  // Public
  { path: '/login', component: LoginPage },
  
  // Protected by Role
  { path: '/reception', component: ReceptionLayout, roles: ['SERVICE_ADVISOR', 'ADMIN', 'MANAGER'] },
  { path: '/technician', component: TechnicianLayout, roles: ['TECHNICIAN', 'FOREMAN', 'ADMIN', 'MANAGER'] },
  { path: '/inventory', component: InventoryLayout, roles: ['STOCK_KEEPER', 'ADMIN', 'MANAGER'] },
  { path: '/billing', component: BillingLayout, roles: ['CASHIER', 'ADMIN', 'MANAGER'] },
  { path: '/admin', component: AdminLayout, roles: ['ADMIN', 'MANAGER'] },
];
```

##### 1.2 Layout Components

```typescript
// frontend/src/components/Layout/ReceptionLayout.tsx
// frontend/src/components/Layout/TechnicianLayout.tsx
// frontend/src/components/Layout/InventoryLayout.tsx
// frontend/src/components/Layout/BillingLayout.tsx
// frontend/src/components/Layout/AdminLayout.tsx
```

##### 1.3 Auth Pages & Guards

```typescript
// frontend/src/pages/auth/LoginPage.tsx
// frontend/src/guards/AuthGuard.tsx
// frontend/src/guards/RoleGuard.tsx
```

##### 1.4 API Client + State Pattern

```typescript
// frontend/src/services/api/client.ts
// - Axios instance with interceptors
// - JWT token management
// - Error handling

// frontend/src/services/api/auth.service.ts
// frontend/src/services/api/customers.service.ts
// frontend/src/services/api/jobs.service.ts
// ... etc

// frontend/src/contexts/AuthContext.tsx
// frontend/src/hooks/useAuth.ts
// frontend/src/hooks/useApi.ts
```

---

#### 2. หน้าหลัก SA (Service Advisor) - **ต้องสร้างใหม่ทั้งหมด**

##### 2.1 หน้าค้นหา/ลงทะเบียนลูกค้า+รถ

```typescript
// frontend/src/pages/reception/CustomerSearchPage.tsx
// - Search by phone, name, license plate
// - Display customer list
// - Create new customer button

// frontend/src/pages/reception/CustomerCreatePage.tsx
// - Form: phone, name, address, etc.
// - Create customer

// frontend/src/pages/reception/MotorcycleCreatePage.tsx
// - Form: VIN, license plate, brand, model, etc.
// - Link to customer
```

##### 2.2 หน้าเปิด Job

```typescript
// frontend/src/pages/reception/JobCreatePage.tsx
// - Select customer/motorcycle
// - Input symptom
// - Select job type (NORMAL/FAST_TRACK)
// - Check warranty
// - Create job
```

##### 2.3 หน้านัดหมาย Calendar

```typescript
// frontend/src/pages/reception/AppointmentCalendarPage.tsx
// - Calendar view (ใช้ library เช่น react-big-calendar)
// - Create appointment
// - View appointments
// - Convert appointment to job

// frontend/src/components/AppointmentCalendar.tsx
```

##### 2.4 หน้า Fast Track

```typescript
// frontend/src/pages/reception/FastTrackPage.tsx
// - List of fast track jobs
// - Quick create fast track job
```

##### 2.5 หน้า Warranty Check

```typescript
// frontend/src/pages/reception/WarrantyCheckPage.tsx
// - Input motorcycle VIN/ID
// - Display warranty status
// - Link warranty to job
```

---

#### 3. หน้าช่าง (Technician) - **ต้องสร้างใหม่ทั้งหมด**

##### 3.1 หน้า Job Queue

```typescript
// frontend/src/pages/technician/JobQueuePage.tsx
// - List jobs (prioritize FAST_TRACK)
// - Filter by status
// - Assign to technician
// - Start job button

// frontend/src/components/JobQueueCard.tsx
```

##### 3.2 หน้า Checklist

```typescript
// frontend/src/pages/technician/JobDetailPage.tsx
// - Job information
// - Checklist items
// - Add/edit checklist items

// frontend/src/components/ChecklistItem.tsx
```

##### 3.3 หน้าขอเบิกอะไหล่

```typescript
// frontend/src/pages/technician/PartRequisitionPage.tsx
// - Select parts or packages
// - Input quantity
// - Submit requisition
// - View requisition status

// frontend/src/components/PartSelector.tsx
// frontend/src/components/PackageSelector.tsx
```

##### 3.4 หน้าบันทึก Outsource

```typescript
// frontend/src/pages/technician/OutsourcePage.tsx
// - Add outsource work
// - Input vendor, cost, selling price
// - Link to job
```

##### 3.5 หน้าปิดงาน

```typescript
// frontend/src/pages/technician/JobFinishPage.tsx
// - Finish labor time
// - Complete job
// - Add diagnosis notes
```

---

### 📁 ไฟล์ที่ต้องสร้าง

#### Core Structure:

1. `frontend/src/router/index.tsx`
2. `frontend/src/guards/AuthGuard.tsx`
3. `frontend/src/guards/RoleGuard.tsx`
4. `frontend/src/contexts/AuthContext.tsx`
5. `frontend/src/hooks/useAuth.ts`
6. `frontend/src/hooks/useApi.ts`

#### API Services:

1. `frontend/src/services/api/client.ts`
2. `frontend/src/services/api/auth.service.ts`
3. `frontend/src/services/api/customers.service.ts`
4. `frontend/src/services/api/motorcycles.service.ts`
5. `frontend/src/services/api/jobs.service.ts`
6. `frontend/src/services/api/appointments.service.ts`
7. `frontend/src/services/api/warranties.service.ts`
8. `frontend/src/services/api/labor-times.service.ts`
9. `frontend/src/services/api/parts.service.ts`
10. `frontend/src/services/api/outsources.service.ts`

#### Layout Components:

1. `frontend/src/components/Layout/ReceptionLayout.tsx`
2. `frontend/src/components/Layout/TechnicianLayout.tsx`
3. `frontend/src/components/Layout/MainLayout.tsx`

#### Reception Pages:

1. `frontend/src/pages/auth/LoginPage.tsx`
2. `frontend/src/pages/reception/CustomerSearchPage.tsx`
3. `frontend/src/pages/reception/CustomerCreatePage.tsx`
4. `frontend/src/pages/reception/MotorcycleCreatePage.tsx`
5. `frontend/src/pages/reception/JobCreatePage.tsx`
6. `frontend/src/pages/reception/AppointmentCalendarPage.tsx`
7. `frontend/src/pages/reception/FastTrackPage.tsx`
8. `frontend/src/pages/reception/WarrantyCheckPage.tsx`

#### Technician Pages:

1. `frontend/src/pages/technician/JobQueuePage.tsx`
2. `frontend/src/pages/technician/JobDetailPage.tsx`
3. `frontend/src/pages/technician/PartRequisitionPage.tsx`
4. `frontend/src/pages/technician/OutsourcePage.tsx`
5. `frontend/src/pages/technician/JobFinishPage.tsx`

#### Shared Components:

1. `frontend/src/components/JobQueueCard.tsx`
2. `frontend/src/components/ChecklistItem.tsx`
3. `frontend/src/components/PartSelector.tsx`
4. `frontend/src/components/PackageSelector.tsx`
5. `frontend/src/components/AppointmentCalendar.tsx`

---

### ✅ Checklist

- [ ] สร้าง Routing structure
- [ ] สร้าง Layout components
- [ ] สร้าง Auth pages & guards
- [ ] สร้าง API client + state pattern
- [ ] สร้าง Reception pages (ทั้งหมด)
- [ ] สร้าง Technician pages (ทั้งหมด)
- [ ] สร้าง Shared components
- [ ] ทดสอบ integration กับ backend
- [ ] Responsive design

---

## 👤 คนที่ 5: Frontend – Inventory + Billing/Admin

### 📋 ภาพรวมงาน

รับผิดชอบหน้าคลัง หน้าการเงิน/CRM และ Admin/Dashboard

---

### 🎯 งานที่ต้องทำ

#### 1. หน้าคลัง (Inventory) - **ต้องสร้างใหม่ทั้งหมด**

##### 1.1 หน้า Part Master

```typescript
// frontend/src/pages/inventory/PartMasterPage.tsx
// - List all parts
// - Search and filter
// - Create/edit/delete parts
// - View part details

// frontend/src/components/PartList.tsx
// frontend/src/components/PartForm.tsx
```

##### 1.2 หน้า Kit/Package

```typescript
// frontend/src/pages/inventory/PackagePage.tsx
// - List packages
// - Create/edit packages
// - Add/remove items from package

// frontend/src/components/PackageList.tsx
// frontend/src/components/PackageForm.tsx
```

##### 1.3 หน้า Issue/Receipt

```typescript
// frontend/src/pages/inventory/GoodsReceiptPage.tsx
// - Create goods receipt
// - List receipts
// - View receipt details

// frontend/src/pages/inventory/PartIssuePage.tsx
// - List requisitions
// - Approve/reject requisitions
// - Issue parts

// frontend/src/components/RequisitionList.tsx
// frontend/src/components/RequisitionCard.tsx
```

##### 1.4 หน้า Low Stock

```typescript
// frontend/src/pages/inventory/LowStockPage.tsx
// - List parts below reorder point
// - Alert notifications
```

##### 1.5 หน้า Lost Sales View

```typescript
// frontend/src/pages/inventory/LostSalesPage.tsx
// - List lost sales
// - Create lost sale record
// - View lost sales summary
```

---

#### 2. หน้าการเงิน/CRM - **ต้องสร้างใหม่ทั้งหมด**

##### 2.1 หน้า Quotation

```typescript
// frontend/src/pages/billing/QuotationPage.tsx
// - List quotations
// - Create quotation
// - Send/approve/reject quotation
// - Convert to job

// frontend/src/components/QuotationForm.tsx
// frontend/src/components/QuotationList.tsx
```

##### 2.2 หน้า Invoice

```typescript
// frontend/src/pages/billing/InvoicePage.tsx
// - List invoices
// - View invoice
// - Download invoice PDF

// frontend/src/components/InvoiceView.tsx
```

##### 2.3 หน้า Payment

```typescript
// frontend/src/pages/billing/PaymentPage.tsx
// - Calculate billing
// - Process payment
// - View payment history

// frontend/src/components/PaymentForm.tsx
// frontend/src/components/BillingSummary.tsx
```

##### 2.4 หน้า Member/Points

```typescript
// frontend/src/pages/billing/MemberPointsPage.tsx
// - View customer points
// - View point transactions
// - Use points for discount

// frontend/src/components/PointsHistory.tsx
```

##### 2.5 หน้า History/Reminder

```typescript
// frontend/src/pages/billing/ServiceHistoryPage.tsx
// - View service history
// - View service reminders
// - Create reminders
```

---

#### 3. Admin/Dashboard - **ต้องสร้างใหม่ทั้งหมด**

##### 3.1 Dashboard Main

```typescript
// frontend/src/pages/admin/DashboardPage.tsx
// - Sales summary cards
// - Charts (sales, top parts, etc.)
// - Recent activities

// frontend/src/components/DashboardCard.tsx
// frontend/src/components/SalesChart.tsx
```

##### 3.2 Reports

```typescript
// frontend/src/pages/admin/ReportsPage.tsx
// - Sales report
// - Top parts report
// - Technician performance report
// - Idle time report
// - Export to PDF/Excel

// frontend/src/components/ReportTable.tsx
// frontend/src/components/PerformanceChart.tsx
```

##### 3.3 Charts & Tables

```typescript
// frontend/src/components/charts/SalesChart.tsx
// frontend/src/components/charts/TopPartsChart.tsx
// frontend/src/components/charts/PerformanceChart.tsx
// frontend/src/components/tables/ReportTable.tsx
```

---

### 📁 ไฟล์ที่ต้องสร้าง

#### Inventory Pages:

1. `frontend/src/pages/inventory/PartMasterPage.tsx`
2. `frontend/src/pages/inventory/PackagePage.tsx`
3. `frontend/src/pages/inventory/GoodsReceiptPage.tsx`
4. `frontend/src/pages/inventory/PartIssuePage.tsx`
5. `frontend/src/pages/inventory/LowStockPage.tsx`
6. `frontend/src/pages/inventory/LostSalesPage.tsx`

#### Billing/CRM Pages:

1. `frontend/src/pages/billing/QuotationPage.tsx`
2. `frontend/src/pages/billing/InvoicePage.tsx`
3. `frontend/src/pages/billing/PaymentPage.tsx`
4. `frontend/src/pages/billing/MemberPointsPage.tsx`
5. `frontend/src/pages/billing/ServiceHistoryPage.tsx`

#### Admin/Dashboard Pages:

1. `frontend/src/pages/admin/DashboardPage.tsx`
2. `frontend/src/pages/admin/ReportsPage.tsx`

#### Components:

1. `frontend/src/components/PartList.tsx`
2. `frontend/src/components/PartForm.tsx`
3. `frontend/src/components/PackageList.tsx`
4. `frontend/src/components/PackageForm.tsx`
5. `frontend/src/components/RequisitionList.tsx`
6. `frontend/src/components/RequisitionCard.tsx`
7. `frontend/src/components/QuotationForm.tsx`
8. `frontend/src/components/QuotationList.tsx`
9. `frontend/src/components/InvoiceView.tsx`
10. `frontend/src/components/PaymentForm.tsx`
11. `frontend/src/components/BillingSummary.tsx`
12. `frontend/src/components/PointsHistory.tsx`
13. `frontend/src/components/DashboardCard.tsx`
14. `frontend/src/components/charts/SalesChart.tsx`
15. `frontend/src/components/charts/TopPartsChart.tsx`
16. `frontend/src/components/charts/PerformanceChart.tsx`
17. `frontend/src/components/tables/ReportTable.tsx`

#### API Services:

1. `frontend/src/services/api/invoices.service.ts`
2. `frontend/src/services/api/receipts.service.ts`
3. `frontend/src/services/api/points.service.ts`
4. `frontend/src/services/api/service-reminders.service.ts`
5. `frontend/src/services/api/reports.service.ts`

---

### ✅ Checklist

- [ ] สร้าง Inventory pages (ทั้งหมด)
- [ ] สร้าง Billing/CRM pages (ทั้งหมด)
- [ ] สร้าง Admin/Dashboard pages
- [ ] สร้าง Charts components
- [ ] สร้าง Tables components
- [ ] Implement PDF/Excel export
- [ ] ทดสอบ integration กับ backend
- [ ] Responsive design

---

## 📚 เอกสารเพิ่มเติม

### API Endpoints Reference

ดู API endpoints ทั้งหมดได้ที่:
- Swagger UI: `http://localhost:4000/docs`
- `backend/COMPLETE_API_TESTING_GUIDE.md`

### Database Schema

ดู schema ทั้งหมดได้ที่:
- `backend/prisma/schema.prisma`

### Git Workflow

ดู Git conventions ได้ที่:
- `backend/GIT_CONVENTIONS.md`

---

**🎯 สรุป: แต่ละคนมีงานชัดเจนแล้ว เริ่มทำได้เลย!**
