/**
 * seed-full.ts — ข้อมูลสาธิตครบทุกส่วน
 * รัน: npx ts-node prisma/seed-full.ts
 */
import { PrismaClient, JobStatus, PaymentMethod, PaymentStatus, LaborTimeStatus } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting full seed...')

  const pw = await bcrypt.hash('password123', 10)

  // ══════════════════════════════════════════════
  //  Users
  // ══════════════════════════════════════════════
  const admin = await prisma.user.upsert({ where: { username: 'admin' }, update: {}, create: { username: 'admin', password: pw, name: 'ผู้ดูแลระบบ', role: 'ADMIN', baseSalary: 30000 } })
  const owner = await prisma.user.upsert({ where: { username: 'owner1' }, update: {}, create: { username: 'owner1', password: pw, name: 'สมบูรณ์ เจ้าของร้าน', role: 'MANAGER', baseSalary: 50000 } })
  const sa1 = await prisma.user.upsert({ where: { username: 'sa1' }, update: {}, create: { username: 'sa1', password: pw, name: 'พีพี รับรถ', role: 'SERVICE_ADVISOR', baseSalary: 15000 } })
  const sa2 = await prisma.user.upsert({ where: { username: 'sa2' }, update: {}, create: { username: 'sa2', password: pw, name: 'นิค รับรถ', role: 'SERVICE_ADVISOR', baseSalary: 15000 } })
  const foreman = await prisma.user.upsert({ where: { username: 'foreman1' }, update: {}, create: { username: 'foreman1', password: pw, name: 'วิชัย หัวหน้าช่าง', role: 'FOREMAN', baseSalary: 20000, commissionRate: 5 } })

  // Technicians (5 คน)
  const tech1 = await prisma.user.upsert({ where: { username: 'tech1' }, update: {}, create: { username: 'tech1', password: pw, name: 'สมชาย ช่างดี', role: 'TECHNICIAN', baseSalary: 12000, commissionRate: 3 } })
  const tech2 = await prisma.user.upsert({ where: { username: 'tech2' }, update: {}, create: { username: 'tech2', password: pw, name: 'ประยุทธ์ มือทอง', role: 'TECHNICIAN', baseSalary: 12000, commissionRate: 3 } })
  const tech3 = await prisma.user.upsert({ where: { username: 'tech3' }, update: {}, create: { username: 'tech3', password: pw, name: 'กิตติพงษ์ ใจเย็น', role: 'TECHNICIAN', baseSalary: 12000, commissionRate: 3 } })
  const tech4 = await prisma.user.upsert({ where: { username: 'tech4' }, update: {}, create: { username: 'tech4', password: pw, name: 'ณัฐพล เก่งมาก', role: 'TECHNICIAN', baseSalary: 12000, commissionRate: 3 } })
  const tech5 = await prisma.user.upsert({ where: { username: 'tech5' }, update: {}, create: { username: 'tech5', password: pw, name: 'อภิสิทธิ์ ซ่อมเก่ง', role: 'TECHNICIAN', baseSalary: 12000, commissionRate: 3 } })

  const stock = await prisma.user.upsert({ where: { username: 'stock1' }, update: {}, create: { username: 'stock1', password: pw, name: 'บอย สต๊อกเก่ง', role: 'STOCK_KEEPER', baseSalary: 14000 } })
  const cashier = await prisma.user.upsert({ where: { username: 'cashier1' }, update: {}, create: { username: 'cashier1', password: pw, name: 'สมหญิง เงินสด', role: 'CASHIER', baseSalary: 14000 } })
  console.log('✅ Users created (13 คน)')

  // ══════════════════════════════════════════════
  //  Customers (5 คน)
  // ══════════════════════════════════════════════
  const c1 = await prisma.customer.upsert({ where: { phoneNumber: '0812345678' }, update: {}, create: { phoneNumber: '0812345678', title: 'นาย', firstName: 'สมชาย', lastName: 'ใจดี', address: '123 ถ.สุขุมวิท กรุงเทพฯ', points: 120 } })
  const c2 = await prisma.customer.upsert({ where: { phoneNumber: '0823456789' }, update: {}, create: { phoneNumber: '0823456789', title: 'นาง', firstName: 'วิภา', lastName: 'รักสะอาด', address: '456 ถ.ราชดำเนิน กรุงเทพฯ', points: 85 } })
  const c3 = await prisma.customer.upsert({ where: { phoneNumber: '0834567890' }, update: {}, create: { phoneNumber: '0834567890', title: 'นาย', firstName: 'ประเสริฐ', lastName: 'มั่นคง', address: '789 ถ.พหลโยธิน กรุงเทพฯ', points: 200 } })
  const c4 = await prisma.customer.upsert({ where: { phoneNumber: '0845678901' }, update: {}, create: { phoneNumber: '0845678901', title: 'นาย', firstName: 'ธนพล', lastName: 'วิริยะ', address: '321 ถ.รัชดา กรุงเทพฯ', points: 50 } })
  const c5 = await prisma.customer.upsert({ where: { phoneNumber: '0856789012' }, update: {}, create: { phoneNumber: '0856789012', title: 'นางสาว', firstName: 'นิภาพร', lastName: 'แก้วใส', address: '654 ถ.ลาดพร้าว กรุงเทพฯ', points: 30 } })
  console.log('✅ Customers created (5 คน)')

  // ══════════════════════════════════════════════
  //  Motorcycles (7 คัน)
  // ══════════════════════════════════════════════
  const m1 = await prisma.motorcycle.upsert({ where: { vin: 'VIN-HONDA-PCX-001' }, update: {}, create: { vin: 'VIN-HONDA-PCX-001', licensePlate: 'กก 999', brand: 'Honda', model: 'PCX 160', color: 'ดำ', year: 2024, engineNo: 'ENG-PCX-001', ownerId: c1.id, mileage: 12500 } })
  const m2 = await prisma.motorcycle.upsert({ where: { vin: 'VIN-YAMAHA-NMAX-001' }, update: {}, create: { vin: 'VIN-YAMAHA-NMAX-001', licensePlate: 'คง 5678', brand: 'Yamaha', model: 'NMAX 155', color: 'น้ำเงิน', year: 2023, engineNo: 'ENG-NMAX-001', ownerId: c2.id, mileage: 8200 } })
  const m3 = await prisma.motorcycle.upsert({ where: { vin: 'VIN-HONDA-WAVE-001' }, update: {}, create: { vin: 'VIN-HONDA-WAVE-001', licensePlate: 'จฉ 9012', brand: 'Honda', model: 'Wave 125i', color: 'แดง', year: 2022, engineNo: 'ENG-WAVE-001', ownerId: c3.id, mileage: 25000 } })
  const m4 = await prisma.motorcycle.upsert({ where: { vin: 'VIN-KAWASAKI-Z400' }, update: {}, create: { vin: 'VIN-KAWASAKI-Z400', licensePlate: 'ญฐ 7890', brand: 'Kawasaki', model: 'Z400', color: 'เขียว', year: 2024, engineNo: 'ENG-Z400-001', ownerId: c4.id, mileage: 3500 } })
  const m5 = await prisma.motorcycle.upsert({ where: { vin: 'VIN-YAMAHA-AEROX-001' }, update: {}, create: { vin: 'VIN-YAMAHA-AEROX-001', licensePlate: 'กค 4321', brand: 'Yamaha', model: 'Aerox 155', color: 'ขาว', year: 2023, engineNo: 'ENG-AEROX-001', ownerId: c5.id, mileage: 15000 } })
  const m6 = await prisma.motorcycle.upsert({ where: { vin: 'VIN-HONDA-CLICK-001' }, update: {}, create: { vin: 'VIN-HONDA-CLICK-001', licensePlate: 'งจ 1122', brand: 'Honda', model: 'Click 125i', color: 'ขาว', year: 2023, engineNo: 'ENG-CLICK-001', ownerId: c1.id, mileage: 18000 } })
  const m7 = await prisma.motorcycle.upsert({ where: { vin: 'VIN-SUZUKI-BURG-001' }, update: {}, create: { vin: 'VIN-SUZUKI-BURG-001', licensePlate: 'ชซ 3456', brand: 'Suzuki', model: 'Burgman 200', color: 'ดำ', year: 2024, engineNo: 'ENG-BURG-001', ownerId: c4.id, mileage: 5000 } })
  console.log('✅ Motorcycles created (7 คัน)')

  // ══════════════════════════════════════════════
  //  Parts (10 รายการ)
  // ══════════════════════════════════════════════
  await prisma.part.upsert({ where: { partNo: 'OIL-001' }, update: {}, create: { partNo: 'OIL-001', name: 'น้ำมันเครื่อง 10W-40 (1L)', brand: 'Honda', category: 'น้ำมัน', unitPrice: 180, stockQuantity: 50, reorderPoint: 10, reorderQuantity: 30 } })
  await prisma.part.upsert({ where: { partNo: 'SPK-001' }, update: {}, create: { partNo: 'SPK-001', name: 'หัวเทียน NGK CR7HSA', brand: 'NGK', category: 'ระบบจุดระเบิด', unitPrice: 85, stockQuantity: 30, reorderPoint: 5, reorderQuantity: 20 } })
  await prisma.part.upsert({ where: { partNo: 'BRK-001' }, update: {}, create: { partNo: 'BRK-001', name: 'ผ้าเบรกหน้า Honda PCX', brand: 'Honda', category: 'เบรก', unitPrice: 280, stockQuantity: 20, reorderPoint: 5, reorderQuantity: 15 } })
  await prisma.part.upsert({ where: { partNo: 'BRK-002' }, update: {}, create: { partNo: 'BRK-002', name: 'ผ้าเบรกหลัง Honda PCX', brand: 'Honda', category: 'เบรก', unitPrice: 250, stockQuantity: 15, reorderPoint: 5, reorderQuantity: 15 } })
  await prisma.part.upsert({ where: { partNo: 'FLT-001' }, update: {}, create: { partNo: 'FLT-001', name: 'ไส้กรองอากาศ Honda Wave', brand: 'Honda', category: 'ไส้กรอง', unitPrice: 95, stockQuantity: 12, reorderPoint: 3, reorderQuantity: 10 } })
  await prisma.part.upsert({ where: { partNo: 'BAT-001' }, update: {}, create: { partNo: 'BAT-001', name: 'แบตเตอรี่ 12V 5Ah', brand: 'Yuasa', category: 'ไฟฟ้า', unitPrice: 550, stockQuantity: 8, reorderPoint: 2, reorderQuantity: 5 } })
  await prisma.part.upsert({ where: { partNo: 'BLT-001' }, update: {}, create: { partNo: 'BLT-001', name: 'สายพาน Yamaha NMAX', brand: 'Yamaha', category: 'ส่งกำลัง', unitPrice: 380, stockQuantity: 5, reorderPoint: 2, reorderQuantity: 5 } })
  await prisma.part.upsert({ where: { partNo: 'CHN-001' }, update: {}, create: { partNo: 'CHN-001', name: 'โซ่ขับเคลื่อน 428H', brand: 'DID', category: 'ส่งกำลัง', unitPrice: 420, stockQuantity: 3, reorderPoint: 2, reorderQuantity: 5 } })
  await prisma.part.upsert({ where: { partNo: 'OIL-BRK-001' }, update: {}, create: { partNo: 'OIL-BRK-001', name: 'น้ำมันเบรก DOT3 (500ml)', brand: 'Prestone', category: 'น้ำมัน', unitPrice: 95, stockQuantity: 10, reorderPoint: 3, reorderQuantity: 10 } })
  await prisma.part.upsert({ where: { partNo: 'SHOCK-F-001' }, update: {}, create: { partNo: 'SHOCK-F-001', name: 'โช๊คหน้า Honda PCX', brand: 'Honda', category: 'ช่วงล่าง', unitPrice: 1200, stockQuantity: 4, reorderPoint: 1, reorderQuantity: 3 } })
  console.log('✅ Parts created (10 รายการ)')

  // ══════════════════════════════════════════════
  //  Suppliers
  // ══════════════════════════════════════════════
  await prisma.supplier.upsert({ where: { supplierNo: 'SUP-001' }, update: {}, create: { supplierNo: 'SUP-001', name: 'บ.เจริญอะไหล่ จำกัด', contactName: 'คุณเจริญ', phoneNumber: '0891111111', email: 'charoen@example.com', address: '99/1 ถ.พระราม 2 กรุงเทพฯ' } })
  await prisma.supplier.upsert({ where: { supplierNo: 'SUP-002' }, update: {}, create: { supplierNo: 'SUP-002', name: 'หจก.น้ำมันดี', contactName: 'คุณดี', phoneNumber: '0892222222', address: '55 ถ.เพชรเกษม กรุงเทพฯ' } })
  await prisma.supplier.upsert({ where: { supplierNo: 'SUP-003' }, update: {}, create: { supplierNo: 'SUP-003', name: 'บ.ยามาฮ่าพาร์ท จำกัด', contactName: 'คุณนภา', phoneNumber: '0893333333', email: 'yamaha@example.com', address: '200 ถ.สุขสวัสดิ์ กรุงเทพฯ' } })
  console.log('✅ Suppliers created')

  // ══════════════════════════════════════════════
  //  Service Catalog
  // ══════════════════════════════════════════════
  const services = [
    { name: 'เปลี่ยนน้ำมันเครื่อง', laborCost: 100, category: 'บำรุงรักษา', tags: ['เครื่องยนต์', 'บำรุงรักษา'] },
    { name: 'เปลี่ยนหัวเทียน', laborCost: 80, category: 'บำรุงรักษา', tags: ['เครื่องยนต์'] },
    { name: 'เปลี่ยนกรองอากาศ', laborCost: 100, category: 'บำรุงรักษา', tags: ['เครื่องยนต์'] },
    { name: 'เปลี่ยนผ้าเบรกหน้า', laborCost: 150, category: 'เบรก', tags: ['เบรก'] },
    { name: 'เปลี่ยนผ้าเบรกหลัง', laborCost: 150, category: 'เบรก', tags: ['เบรก'] },
    { name: 'ล้างคาร์บูเรเตอร์', laborCost: 300, category: 'เชื้อเพลิง', tags: ['เชื้อเพลิง', 'เครื่องยนต์'] },
    { name: 'เปลี่ยนโช๊คหน้า', laborCost: 500, category: 'ช่วงล่าง', tags: ['ช่วงล่าง'] },
    { name: 'เปลี่ยนสายพาน', laborCost: 400, category: 'ส่งกำลัง', tags: ['ส่งกำลัง'] },
    { name: 'เปลี่ยนแบตเตอรี่', laborCost: 100, category: 'ไฟฟ้า', tags: ['ไฟฟ้า'] },
    { name: 'ตรวจเช็คเครื่องสะดุด', laborCost: 200, category: 'เครื่องยนต์', tags: ['เครื่องยนต์'] },
    { name: 'เปลี่ยนหลอดไฟหน้า', laborCost: 80, category: 'ไฟฟ้า', tags: ['ไฟฟ้า'] },
    { name: 'ตรวจเช็คทั่วไป', laborCost: 100, category: 'บำรุงรักษา', tags: ['บำรุงรักษา'] },
  ]
  for (const s of services) {
    await prisma.serviceCatalog.upsert({ where: { name: s.name }, update: {}, create: s })
  }
  console.log('✅ Service Catalog created')

  // ══════════════════════════════════════════════
  //  Jobs (12 งาน — ทุกสถานะ)
  // ══════════════════════════════════════════════
  // Helper สร้าง labor time
  const mkLabor = (jobId: number, techId: number, desc: string, cost: number, status: LaborTimeStatus, id: number) =>
    prisma.laborTime.upsert({
      where: { id }, update: {},
      create: { id, jobId, technicianId: techId, taskDescription: desc, laborCost: cost, hourlyRate: 200, actualMinutes: Math.round((cost / 200) * 60), status },
    })

  // --- Job 1: PAID (สมชาย PCX — เปลี่ยนน้ำมัน+ผ้าเบรก)
  const j1 = await prisma.job.upsert({ where: { jobNo: 'JOB-20260301-0001' }, update: {}, create: {
    jobNo: 'JOB-20260301-0001', symptom: 'เปลี่ยนน้ำมันเครื่องตามระยะ + เบรกหลังจาง', status: JobStatus.PAID,
    motorcycleId: m1.id, receptionId: sa1.id, technicianId: tech1.id, tags: ['เครื่องยนต์', 'เบรก'],
    startedAt: new Date('2026-03-01T09:00:00Z'), completedAt: new Date('2026-03-01T11:30:00Z'),
  }})
  await mkLabor(j1.id, tech1.id, 'เปลี่ยนน้ำมันเครื่อง', 100, 'FINISHED', 2001)
  await mkLabor(j1.id, tech1.id, 'เปลี่ยนผ้าเบรกหลัง', 150, 'FINISHED', 2002)
  await prisma.payment.upsert({ where: { jobId: j1.id }, update: {}, create: {
    paymentNo: 'PAY-20260301-0001', jobId: j1.id, customerId: c1.id,
    subtotal: 430, vat: 30.10, totalAmount: 460.10,
    paymentMethod: PaymentMethod.CASH, paymentStatus: PaymentStatus.PAID,
    amountReceived: 500, change: 39.90, paidAt: new Date('2026-03-01T11:45:00Z'),
  }})

  // --- Job 2: PAID (วิภา NMAX — หัวเทียน+กรอง)
  const j2 = await prisma.job.upsert({ where: { jobNo: 'JOB-20260305-0001' }, update: {}, create: {
    jobNo: 'JOB-20260305-0001', symptom: 'ตรวจเช็คตามระยะ เปลี่ยนหัวเทียนและกรองอากาศ', status: JobStatus.PAID,
    motorcycleId: m2.id, receptionId: sa1.id, technicianId: tech2.id, tags: ['บำรุงรักษา'],
    startedAt: new Date('2026-03-05T10:00:00Z'), completedAt: new Date('2026-03-05T11:00:00Z'),
  }})
  await mkLabor(j2.id, tech2.id, 'เปลี่ยนหัวเทียน', 80, 'FINISHED', 2003)
  await mkLabor(j2.id, tech2.id, 'เปลี่ยนกรองอากาศ', 100, 'FINISHED', 2004)
  await prisma.payment.upsert({ where: { jobId: j2.id }, update: {}, create: {
    paymentNo: 'PAY-20260305-0001', jobId: j2.id, customerId: c2.id,
    subtotal: 360, vat: 25.20, totalAmount: 385.20,
    paymentMethod: PaymentMethod.TRANSFER, paymentStatus: PaymentStatus.PAID,
    amountReceived: 385.20, change: 0, paidAt: new Date('2026-03-05T11:10:00Z'),
  }})

  // --- Job 3: COMPLETED (ประเสริฐ Wave — ไฟหน้า) — รอชำระ
  const j3 = await prisma.job.upsert({ where: { jobNo: 'JOB-20260308-0001' }, update: {}, create: {
    jobNo: 'JOB-20260308-0001', symptom: 'ไฟหน้าไม่ติด ระบบไฟผิดปกติ', status: JobStatus.COMPLETED,
    motorcycleId: m3.id, receptionId: sa2.id, technicianId: tech1.id, tags: ['ไฟฟ้า'],
    startedAt: new Date('2026-03-08T08:00:00Z'), completedAt: new Date('2026-03-08T10:00:00Z'),
  }})
  await mkLabor(j3.id, tech1.id, 'เปลี่ยนหลอดไฟหน้า + ตรวจระบบไฟ', 280, 'FINISHED', 2005)
  await prisma.payment.upsert({ where: { jobId: j3.id }, update: {}, create: {
    paymentNo: 'PAY-20260308-0001', jobId: j3.id, customerId: c3.id,
    subtotal: 460, vat: 32.20, totalAmount: 492.20,
    paymentMethod: PaymentMethod.CASH, paymentStatus: PaymentStatus.PENDING,
  }})

  // --- Job 4: COMPLETED (ธนพล Z400 — น้ำมัน+ตรวจเช็ค) — รอชำระ
  const j4 = await prisma.job.upsert({ where: { jobNo: 'JOB-20260309-0001' }, update: {}, create: {
    jobNo: 'JOB-20260309-0001', symptom: 'เปลี่ยนน้ำมันเครื่อง และตรวจเช็คทั่วไป', status: JobStatus.COMPLETED,
    motorcycleId: m4.id, receptionId: sa1.id, technicianId: tech3.id, tags: ['บำรุงรักษา'],
    startedAt: new Date('2026-03-09T09:00:00Z'), completedAt: new Date('2026-03-09T10:30:00Z'),
  }})
  await mkLabor(j4.id, tech3.id, 'เปลี่ยนน้ำมันเครื่อง', 100, 'FINISHED', 2006)
  await prisma.payment.upsert({ where: { jobId: j4.id }, update: {}, create: {
    paymentNo: 'PAY-20260309-0001', jobId: j4.id, customerId: c4.id,
    subtotal: 280, vat: 19.60, totalAmount: 299.60,
    paymentMethod: PaymentMethod.CASH, paymentStatus: PaymentStatus.PENDING,
  }})

  // --- Job 5: IN_PROGRESS (สมชาย Click — โช๊คหน้า) — tech3 กำลังซ่อม
  const j5 = await prisma.job.upsert({ where: { jobNo: 'JOB-20260310-0001' }, update: {}, create: {
    jobNo: 'JOB-20260310-0001', symptom: 'โช๊คหน้าน้ำมันรั่ว นิ่มผิดปกติ', status: JobStatus.IN_PROGRESS,
    motorcycleId: m6.id, receptionId: sa1.id, technicianId: tech3.id, tags: ['ช่วงล่าง'],
    startedAt: new Date('2026-03-10T08:00:00Z'),
  }})
  await mkLabor(j5.id, tech3.id, 'เปลี่ยนโช๊คหน้า', 500, 'IN_PROGRESS', 2007)

  // --- Job 6: IN_PROGRESS (นิภาพร Aerox — เครื่องร้อน) — tech1 กำลังซ่อม
  const j6 = await prisma.job.upsert({ where: { jobNo: 'JOB-20260310-0002' }, update: {}, create: {
    jobNo: 'JOB-20260310-0002', symptom: 'เครื่องร้อนผิดปกติ น้ำหล่อเย็นรั่ว', status: JobStatus.IN_PROGRESS,
    motorcycleId: m5.id, receptionId: sa2.id, technicianId: tech1.id, tags: ['เครื่องยนต์'],
    startedAt: new Date('2026-03-10T09:00:00Z'),
  }})
  await mkLabor(j6.id, tech1.id, 'ตรวจเช็คระบบระบายความร้อน', 200, 'IN_PROGRESS', 2008)

  // --- Job 7: QC_PENDING (วิภา NMAX — เบรก) — tech2 ซ่อมเสร็จ รอ QC
  const j7 = await prisma.job.upsert({ where: { jobNo: 'JOB-20260310-0003' }, update: {}, create: {
    jobNo: 'JOB-20260310-0003', symptom: 'เบรกหน้าไม่ค่อยกิน น้ำมันเบรกรั่ว', status: JobStatus.QC_PENDING,
    motorcycleId: m2.id, receptionId: sa1.id, technicianId: tech2.id, tags: ['เบรก'],
    startedAt: new Date('2026-03-10T08:30:00Z'),
  }})
  await mkLabor(j7.id, tech2.id, 'เปลี่ยนผ้าเบรกหน้า + เติมน้ำมันเบรก', 300, 'FINISHED', 2009)

  // --- Job 8: PENDING (ธนพล Burgman — วิ่งสะดุด) — ยังไม่มอบหมายช่าง
  const j8 = await prisma.job.upsert({ where: { jobNo: 'JOB-20260310-0004' }, update: {}, create: {
    jobNo: 'JOB-20260310-0004', symptom: 'รถวิ่งแล้วสะดุด ไม่ทราบอาการ', status: JobStatus.PENDING,
    motorcycleId: m7.id, receptionId: sa2.id, tags: ['เครื่องยนต์', 'ช่วงล่าง'],
  }})

  // --- Job 9: PENDING (ประเสริฐ Wave — ตรวจเช็ค) — ยังไม่มอบหมาย
  const j9 = await prisma.job.upsert({ where: { jobNo: 'JOB-20260311-0001' }, update: {}, create: {
    jobNo: 'JOB-20260311-0001', symptom: 'ตรวจเช็คก่อนเดินทางไกล', status: JobStatus.PENDING,
    motorcycleId: m3.id, receptionId: sa1.id, tags: ['บำรุงรักษา'],
  }})

  // --- Job 10: WAITING_PARTS (สมชาย PCX — สายพาน) — รอสั่งอะไหล่
  const j10 = await prisma.job.upsert({ where: { jobNo: 'JOB-20260310-0005' }, update: {}, create: {
    jobNo: 'JOB-20260310-0005', symptom: 'สายพานขาด เปลี่ยนสายพานใหม่', status: JobStatus.WAITING_PARTS,
    motorcycleId: m1.id, receptionId: sa1.id, technicianId: tech4.id, tags: ['ส่งกำลัง'],
    startedAt: new Date('2026-03-10T10:00:00Z'),
  }})

  // --- Job 11: IN_PROGRESS (นิภาพร Click ของสมชาย — โซ่) — tech5
  const j11 = await prisma.job.upsert({ where: { jobNo: 'JOB-20260310-0006' }, update: {}, create: {
    jobNo: 'JOB-20260310-0006', symptom: 'โซ่หย่อน สเตอร์สึก เปลี่ยนชุดโซ่สเตอร์', status: JobStatus.IN_PROGRESS,
    motorcycleId: m6.id, receptionId: sa2.id, technicianId: tech5.id, tags: ['ส่งกำลัง'],
    startedAt: new Date('2026-03-10T11:00:00Z'),
  }})
  await mkLabor(j11.id, tech5.id, 'เปลี่ยนชุดโซ่สเตอร์', 400, 'IN_PROGRESS', 2010)

  // --- Job 12: PAID (สมชาย PCX — ล้างคาร์บู)
  const j12 = await prisma.job.upsert({ where: { jobNo: 'JOB-20260228-0001' }, update: {}, create: {
    jobNo: 'JOB-20260228-0001', symptom: 'เครื่องสะดุด กินน้ำมันเยอะ คาร์บูเรเตอร์ตัน', status: JobStatus.PAID,
    motorcycleId: m1.id, receptionId: sa1.id, technicianId: tech2.id, tags: ['เชื้อเพลิง', 'เครื่องยนต์'],
    startedAt: new Date('2026-02-28T08:00:00Z'), completedAt: new Date('2026-02-28T12:00:00Z'),
  }})
  await mkLabor(j12.id, tech2.id, 'ล้างคาร์บูเรเตอร์', 300, 'FINISHED', 2011)
  await prisma.payment.upsert({ where: { jobId: j12.id }, update: {}, create: {
    paymentNo: 'PAY-20260228-0001', jobId: j12.id, customerId: c1.id,
    subtotal: 300, vat: 21, totalAmount: 321,
    paymentMethod: PaymentMethod.CASH, paymentStatus: PaymentStatus.PAID,
    amountReceived: 500, change: 179, paidAt: new Date('2026-02-28T12:15:00Z'),
  }})

  console.log('✅ Jobs created (12 งาน) + LaborTimes + Payments')

  // ══════════════════════════════════════════════
  //  Summary
  // ══════════════════════════════════════════════
  console.log('\n🎉 Full seed completed!')
  console.log('\n📊 Data Summary:')
  console.log('  Users:       13 (admin, owner, 2 SA, foreman, 5 techs, stock, cashier)')
  console.log('  Customers:    5')
  console.log('  Motorcycles:  7')
  console.log('  Parts:       10')
  console.log('  Jobs:        12 (2 PENDING, 3 IN_PROGRESS, 1 WAITING_PARTS, 1 QC_PENDING, 2 COMPLETED, 3 PAID)')
  console.log('  Payments:     5 (3 PAID, 2 PENDING)')
  console.log('\n🔑 Login accounts (password: password123)')
  console.log('  admin / owner1 / sa1 / sa2 / foreman1')
  console.log('  tech1-tech5 / stock1 / cashier1')
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
