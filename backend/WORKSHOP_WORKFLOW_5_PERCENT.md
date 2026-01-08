# 🔧 Workshop Workflow - 5% ที่เหลือ

**อัปเดตล่าสุด:** 2024-12-20

---

## 📊 สรุป Workshop Workflow

**สถานะ:** ✅ **95% Complete**

### ✅ สิ่งที่เสร็จแล้ว (95%)

1. **Job Status Flow** - ✅ 100%
   - PENDING → IN_PROGRESS → COMPLETED → PAID
   - Assign Technician
   - Start Job
   - Complete Job
   - Cancel Job

2. **Labor Time (Actual)** - ✅ 100%
   - Start/Pause/Resume/Finish Labor Time
   - Calculate actual minutes
   - Calculate labor cost
   - Get Labor Times by Job
   - Get Total Labor Cost

3. **Standard Time** - ✅ 90%
   - ✅ `standardMinutes` field มีอยู่ใน LaborTime model
   - ✅ สามารถใส่ `standardMinutes` ตอน start labor time ได้
   - ✅ สามารถเปรียบเทียบ actual vs standard ได้
   - ⚠️ ยังไม่มี **Flat Rate Catalog API**

4. **Outsource/Sublet** - ✅ 100%
   - Create/Read/Update/Delete Outsource
   - Track cost vs selling price

5. **Job Checklist** - ✅ 100%
   - Create/Read/Update/Delete Checklist Items

---

## ⚠️ 5% ที่เหลือคืออะไร?

### 1. Flat Rate Catalog API (3%)

**ปัญหาปัจจุบัน:**
- ✅ มี `standardMinutes` field แล้ว
- ✅ สามารถใส่ `standardMinutes` ตรงๆ ได้
- ❌ ยังไม่มี **catalog** สำหรับจัดการเวลามาตรฐานงานซ่อม

**ผลกระทบ:**
- ช่างต้องจำหรือหาค่าเวลามาตรฐานเอง
- ไม่มีระบบจัดการเวลามาตรฐานแบบ centralized
- ไม่สามารถดูรายการเวลามาตรฐานได้

**สิ่งที่ต้องทำ:**

#### 1.1 สร้าง Flat Rate Model

```prisma
// backend/prisma/schema.prisma

model FlatRate {
  id          Int      @id @default(autoincrement())
  taskType   String   // เช่น "เปลี่ยนยางหน้า", "เปลี่ยนโซ่สเตอร์"
  brand      String?  // เช่น "Honda", "Yamaha" (optional)
  model      String?  // เช่น "Wave 110i" (optional)
  minutes    Int      // เวลามาตรฐาน (นาที)
  description String?
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  @@index([taskType])
  @@index([brand])
  @@unique([taskType, brand, model])
}
```

#### 1.2 สร้าง Migration

```bash
cd backend
npx prisma migrate dev --name add_flat_rate_table
```

#### 1.3 สร้าง Flat Rate Module

```typescript
// backend/src/labor-times/flat-rates.controller.ts (สร้างใหม่)

@ApiTags('Flat Rates')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Controller('labor-times/flat-rates')
export class FlatRatesController {
  constructor(private readonly flatRatesService: FlatRatesService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'เพิ่มเวลามาตรฐานงานซ่อม' })
  async create(@Body() dto: CreateFlatRateDto) {
    return this.flatRatesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'ดูรายการเวลามาตรฐานงานซ่อม' })
  async findAll(
    @Query('taskType') taskType?: string,
    @Query('brand') brand?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.flatRatesService.findAll({ taskType, brand, isActive });
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดูรายละเอียดเวลามาตรฐาน' })
  async findOne(@Param('id') id: number) {
    return this.flatRatesService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'อัปเดตเวลามาตรฐาน' })
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateFlatRateDto,
  ) {
    return this.flatRatesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'ลบเวลามาตรฐาน (Soft delete)' })
  async remove(@Param('id') id: number) {
    return this.flatRatesService.remove(id);
  }

  @Get('search/by-task')
  @ApiOperation({ summary: 'ค้นหาเวลามาตรฐานตามงาน' })
  async findByTask(
    @Query('taskType') taskType: string,
    @Query('brand') brand?: string,
    @Query('model') model?: string,
  ) {
    return this.flatRatesService.findByTask(taskType, brand, model);
  }
}
```

#### 1.4 สร้าง Flat Rate Service

```typescript
// backend/src/labor-times/flat-rates.service.ts (สร้างใหม่)

@Injectable()
export class FlatRatesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateFlatRateDto) {
    return this.prisma.flatRate.create({
      data: {
        taskType: dto.taskType,
        brand: dto.brand,
        model: dto.model,
        minutes: dto.minutes,
        description: dto.description,
      },
    });
  }

  async findAll(filters: {
    taskType?: string;
    brand?: string;
    isActive?: boolean;
  }) {
    const where: any = {};
    
    if (filters.taskType) {
      where.taskType = { contains: filters.taskType, mode: 'insensitive' };
    }
    
    if (filters.brand) {
      where.brand = filters.brand;
    }
    
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return this.prisma.flatRate.findMany({
      where,
      orderBy: {
        taskType: 'asc',
      },
    });
  }

  async findByTask(taskType: string, brand?: string, model?: string) {
    const where: any = {
      taskType: { contains: taskType, mode: 'insensitive' },
      isActive: true,
    };

    if (brand) {
      where.brand = brand;
    }

    if (model) {
      where.model = model;
    }

    return this.prisma.flatRate.findFirst({
      where,
    });
  }

  async findOne(id: number) {
    const flatRate = await this.prisma.flatRate.findUnique({
      where: { id },
    });

    if (!flatRate) {
      throw new NotFoundException(`FlatRate with ID ${id} not found`);
    }

    return flatRate;
  }

  async update(id: number, dto: UpdateFlatRateDto) {
    await this.findOne(id); // Check exists

    return this.prisma.flatRate.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Check exists

    return this.prisma.flatRate.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
```

#### 1.5 สร้าง DTOs

```typescript
// backend/src/labor-times/dto/create-flat-rate.dto.ts

export class CreateFlatRateDto {
  @ApiProperty({ example: 'เปลี่ยนยางหน้า' })
  @IsString()
  @IsNotEmpty()
  taskType: string;

  @ApiPropertyOptional({ example: 'Honda' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ example: 'Wave 110i' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ example: 15, description: 'เวลามาตรฐาน (นาที)' })
  @IsInt()
  @Min(1)
  minutes: number;

  @ApiPropertyOptional({ example: 'เวลามาตรฐานสำหรับเปลี่ยนยางหน้าของ Honda Wave 110i' })
  @IsOptional()
  @IsString()
  description?: string;
}
```

#### 1.6 อัปเดต Labor Times Service

```typescript
// backend/src/labor-times/labor-times.service.ts

// เพิ่ม method ใหม่
async getStandardTimeFromCatalog(
  taskType: string,
  brand?: string,
  model?: string,
): Promise<number | null> {
  const flatRate = await this.prisma.flatRate.findFirst({
    where: {
      taskType: { contains: taskType, mode: 'insensitive' },
      brand: brand || undefined,
      model: model || undefined,
      isActive: true,
    },
  });

  return flatRate?.minutes || null;
}

// อัปเดต startLaborTime method
async startLaborTime(
  jobId: number,
  technicianId: number,
  taskDescription: string,
  hourlyRate: number,
  standardMinutes?: number,
  // เพิ่ม parameter ใหม่
  autoLookupStandardTime?: boolean,
  brand?: string,
  model?: string,
) {
  // ... existing code ...

  let finalStandardMinutes = standardMinutes;

  // ถ้าไม่ได้ใส่ standardMinutes แต่ต้องการ auto lookup
  if (!standardMinutes && autoLookupStandardTime) {
    finalStandardMinutes = await this.getStandardTimeFromCatalog(
      taskDescription,
      brand,
      model,
    );
  }

  return this.prisma.laborTime.create({
    data: {
      jobId,
      technicianId,
      taskDescription,
      hourlyRate,
      standardMinutes: finalStandardMinutes || null,
      // ... rest of data
    },
  });
}
```

---

### 2. Performance Comparison API (2%)

**ปัญหาปัจจุบัน:**
- ✅ สามารถเปรียบเทียบ actual vs standard ได้ใน service
- ❌ ยังไม่มี API endpoint สำหรับดู performance comparison

**สิ่งที่ต้องทำ:**

#### 2.1 เพิ่ม Performance Comparison Endpoint

```typescript
// backend/src/labor-times/labor-times.controller.ts

@Get('job/:jobId/performance')
@ApiOperation({ summary: 'ดูประสิทธิภาพการทำงาน (Actual vs Standard)' })
async getPerformance(@Param('jobId') jobId: number) {
  return this.laborTimesService.getPerformanceComparison(jobId);
}

@Get('technician/:technicianId/performance')
@ApiOperation({ summary: 'ดูประสิทธิภาพช่าง (รวมทุกงาน)' })
async getTechnicianPerformance(
  @Param('technicianId') technicianId: number,
  @Query('dateFrom') dateFrom?: string,
  @Query('dateTo') dateTo?: string,
) {
  return this.laborTimesService.getTechnicianPerformance(
    technicianId,
    dateFrom ? new Date(dateFrom) : undefined,
    dateTo ? new Date(dateTo) : undefined,
  );
}
```

#### 2.2 เพิ่ม Performance Comparison Service Methods

```typescript
// backend/src/labor-times/labor-times.service.ts

async getPerformanceComparison(jobId: number) {
  const laborTimes = await this.prisma.laborTime.findMany({
    where: { jobId, finishedAt: { not: null } },
    include: {
      technician: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  let totalActualMinutes = 0;
  let totalStandardMinutes = 0;

  for (const lt of laborTimes) {
    totalActualMinutes += lt.actualMinutes;
    if (lt.standardMinutes) {
      totalStandardMinutes += lt.standardMinutes;
    }
  }

  const efficiency =
    totalStandardMinutes > 0
      ? (totalStandardMinutes / totalActualMinutes) * 100
      : null;

  const timeDifference = totalStandardMinutes - totalActualMinutes;

  return {
    jobId,
    laborTimes: laborTimes.map((lt) => ({
      id: lt.id,
      taskDescription: lt.taskDescription,
      technician: lt.technician,
      actualMinutes: lt.actualMinutes,
      standardMinutes: lt.standardMinutes,
      difference: lt.standardMinutes
        ? lt.standardMinutes - lt.actualMinutes
        : null,
      efficiency: lt.standardMinutes
        ? (lt.standardMinutes / lt.actualMinutes) * 100
        : null,
    })),
    summary: {
      totalActualMinutes,
      totalStandardMinutes,
      timeDifference,
      efficiency,
    },
  };
}

async getTechnicianPerformance(
  technicianId: number,
  dateFrom?: Date,
  dateTo?: Date,
) {
  const where: any = {
    technicianId,
    finishedAt: { not: null },
  };

  if (dateFrom || dateTo) {
    where.finishedAt = {};
    if (dateFrom) where.finishedAt.gte = dateFrom;
    if (dateTo) where.finishedAt.lte = dateTo;
  }

  const laborTimes = await this.prisma.laborTime.findMany({
    where,
    include: {
      job: {
        select: {
          id: true,
          jobNo: true,
        },
      },
    },
  });

  let totalActualMinutes = 0;
  let totalStandardMinutes = 0;
  let jobsWithStandard = 0;

  for (const lt of laborTimes) {
    totalActualMinutes += lt.actualMinutes;
    if (lt.standardMinutes) {
      totalStandardMinutes += lt.standardMinutes;
      jobsWithStandard++;
    }
  }

  const averageEfficiency =
    jobsWithStandard > 0
      ? (totalStandardMinutes / totalActualMinutes) * 100
      : null;

  return {
    technicianId,
    period: {
      from: dateFrom,
      to: dateTo,
    },
    statistics: {
      totalJobs: laborTimes.length,
      jobsWithStandard,
      totalActualMinutes,
      totalStandardMinutes,
      averageEfficiency,
      timeDifference: totalStandardMinutes - totalActualMinutes,
    },
    laborTimes: laborTimes.map((lt) => ({
      id: lt.id,
      job: lt.job,
      taskDescription: lt.taskDescription,
      actualMinutes: lt.actualMinutes,
      standardMinutes: lt.standardMinutes,
      efficiency: lt.standardMinutes
        ? (lt.standardMinutes / lt.actualMinutes) * 100
        : null,
    })),
  };
}
```

---

## 📁 ไฟล์ที่ต้องสร้าง/แก้ไข

### ไฟล์ใหม่:

1. `backend/src/labor-times/flat-rates.controller.ts`
2. `backend/src/labor-times/flat-rates.service.ts`
3. `backend/src/labor-times/flat-rates.module.ts`
4. `backend/src/labor-times/dto/create-flat-rate.dto.ts`
5. `backend/src/labor-times/dto/update-flat-rate.dto.ts`

### ไฟล์ที่ต้องแก้ไข:

1. `backend/prisma/schema.prisma` - เพิ่ม FlatRate model
2. `backend/src/labor-times/labor-times.service.ts` - เพิ่ม methods
3. `backend/src/labor-times/labor-times.controller.ts` - เพิ่ม endpoints
4. `backend/src/app.module.ts` - เพิ่ม FlatRatesModule

### Database Migration:

1. สร้าง migration สำหรับ FlatRate table

---

## ✅ Checklist

- [ ] สร้าง FlatRate model ใน schema
- [ ] สร้าง migration
- [ ] สร้าง FlatRatesModule, Controller, Service
- [ ] สร้าง DTOs
- [ ] เพิ่ม getStandardTimeFromCatalog method
- [ ] อัปเดต startLaborTime เพื่อรองรับ auto lookup
- [ ] เพิ่ม Performance Comparison API
- [ ] ทดสอบ API ทั้งหมด
- [ ] อัปเดต Swagger documentation

---

## 🎯 สรุป

**5% ที่เหลือ:**
1. **Flat Rate Catalog API (3%)** - API สำหรับจัดการเวลามาตรฐานงานซ่อม
2. **Performance Comparison API (2%)** - API สำหรับดูประสิทธิภาพการทำงาน

**Priority:**
- ⚠️ **Low** - ไม่กระทบ core workflow เพราะสามารถใส่ `standardMinutes` ตรงๆ ได้แล้ว
- แต่ถ้าต้องการระบบที่สมบูรณ์ขึ้น ควรทำ

**ผลกระทบ:**
- ถ้าไม่ทำ: ระบบยังใช้งานได้ปกติ แต่ช่างต้องจำเวลามาตรฐานเอง
- ถ้าทำ: ระบบจะสมบูรณ์ขึ้น มี catalog และ performance tracking

---

**💡 Tip:** ถ้าต้องการทำ ควรทำหลังจาก core workflows ของทีมอื่นเสร็จแล้ว เพราะไม่กระทบการทำงานของระบบ
