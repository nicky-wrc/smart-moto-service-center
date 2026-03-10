/**
 * seed-demo.ts — เพิ่ม demo jobs + payments สำหรับทดสอบระบบ
 * รัน: npx ts-node prisma/seed-demo.ts
 */
import { PrismaClient, JobStatus, PaymentMethod, PaymentStatus, LaborTimeStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function createLaborTime(jobId: number, techId: number, desc: string, cost: number, idx: number) {
  return prisma.laborTime.upsert({
    where: { id: 1000 + idx },
    update: {},
    create: {
      id: 1000 + idx,
      jobId,
      technicianId: techId,
      taskDescription: desc,
      laborCost: cost,
      hourlyRate: 200,
      actualMinutes: Math.round((cost / 200) * 60),
      status: LaborTimeStatus.COMPLETED,
    },
  })
}

async function main() {
  console.log('🌱 Creating demo jobs and payments...')

  const tech1   = await prisma.user.findUnique({ where: { username: 'tech1' } })
  const tech2   = await prisma.user.findUnique({ where: { username: 'tech2' } })
  const sa      = await prisma.user.findUnique({ where: { username: 'sa1' } })
  const customer1 = await prisma.customer.findUnique({ where: { phoneNumber: '0812345678' } })
  const moto1   = await prisma.motorcycle.findUnique({ where: { vin: 'VIN123456789' } })

  if (!customer1 || !moto1 || !tech1 || !tech2 || !sa) {
    throw new Error('Run main seed first: npx prisma db seed')
  }

  // ── เพิ่มลูกค้า ──────────────────────────────────────────────────────────
  const customer2 = await prisma.customer.upsert({
    where: { phoneNumber: '0823456789' },
    update: {},
    create: {
      phoneNumber: '0823456789', title: 'นาง',
      firstName: 'วิไล', lastName: 'รักสะอาด',
      address: '456 ถนนราชดำเนิน กรุงเทพฯ',
    },
  })
  const moto2 = await prisma.motorcycle.upsert({
    where: { vin: 'VIN987654321' },
    update: {},
    create: {
      vin: 'VIN987654321', licensePlate: 'คง 5678',
      brand: 'Yamaha', model: 'Aerox 155', color: 'ขาว', year: 2023,
      engineNo: 'ENG987654', ownerId: customer2.id,
    },
  })
  const customer3 = await prisma.customer.upsert({
    where: { phoneNumber: '0834567890' },
    update: {},
    create: {
      phoneNumber: '0834567890', title: 'นาย',
      firstName: 'ประยูร', lastName: 'มั่นคง',
      address: '789 ถนนพหลโยธิน กรุงเทพฯ',
    },
  })
  const moto3 = await prisma.motorcycle.upsert({
    where: { vin: 'VIN111222333' },
    update: {},
    create: {
      vin: 'VIN111222333', licensePlate: 'จฉ 9012',
      brand: 'Honda', model: 'PCX 160', color: 'เทา', year: 2024,
      engineNo: 'ENG111222', ownerId: customer3.id,
    },
  })
  console.log('✅ Extra customers & motorcycles created')

  // ── Job 1: เปลี่ยนน้ำมัน + ผ้าเบรก (PAID) ───────────────────────────────
  const job1 = await prisma.job.upsert({
    where: { jobNo: 'JOB-20260301-0001' },
    update: {},
    create: {
      jobNo: 'JOB-20260301-0001',
      symptom: 'เปลี่ยนน้ำมันเครื่องตามระยะ + เบรกหลังจาง',
      status: JobStatus.PAID,
      motorcycleId: moto1.id,
      receptionId: sa.id, technicianId: tech1.id,
      startedAt: new Date('2026-03-01T09:00:00Z'),
      completedAt: new Date('2026-03-01T11:30:00Z'),
    },
  })
  await createLaborTime(job1.id, tech1.id, 'เปลี่ยนน้ำมันเครื่อง', 100, 1)
  await createLaborTime(job1.id, tech1.id, 'เปลี่ยนผ้าเบรกหลัง', 150, 2)
  await prisma.payment.upsert({
    where: { jobId: job1.id },
    update: {},
    create: {
      paymentNo: 'PAY-20260301-0001', jobId: job1.id, customerId: customer1.id,
      subtotal: 430, vat: 30.10, totalAmount: 460.10,
      paymentMethod: PaymentMethod.CASH, paymentStatus: PaymentStatus.PAID,
      amountReceived: 500, change: 39.90, paidAt: new Date('2026-03-01T11:45:00Z'),
    },
  })

  // ── Job 2: เปลี่ยนหัวเทียน + กรองอากาศ (PAID / Transfer) ───────────────
  const job2 = await prisma.job.upsert({
    where: { jobNo: 'JOB-20260305-0001' },
    update: {},
    create: {
      jobNo: 'JOB-20260305-0001',
      symptom: 'ตรวจเช็คตามระยะ เปลี่ยนหัวเทียนและกรองอากาศ',
      status: JobStatus.PAID,
      motorcycleId: moto2.id,
      receptionId: sa.id, technicianId: tech2.id,
      startedAt: new Date('2026-03-05T10:00:00Z'),
      completedAt: new Date('2026-03-05T11:00:00Z'),
    },
  })
  await createLaborTime(job2.id, tech2.id, 'เปลี่ยนหัวเทียน', 80, 3)
  await createLaborTime(job2.id, tech2.id, 'เปลี่ยนกรองอากาศ', 100, 4)
  await prisma.payment.upsert({
    where: { jobId: job2.id },
    update: {},
    create: {
      paymentNo: 'PAY-20260305-0001', jobId: job2.id, customerId: customer2.id,
      subtotal: 300, vat: 21, totalAmount: 321,
      paymentMethod: PaymentMethod.TRANSFER, paymentStatus: PaymentStatus.PAID,
      amountReceived: 321, change: 0, paidAt: new Date('2026-03-05T11:10:00Z'),
    },
  })

  // ── Job 3: ล้างคาร์บู (PENDING payment) ─────────────────────────────────
  const job3 = await prisma.job.upsert({
    where: { jobNo: 'JOB-20260309-0001' },
    update: {},
    create: {
      jobNo: 'JOB-20260309-0001',
      symptom: 'เครื่องสะดุด กินน้ำมันเยอะ น่าจะคาร์บูเรเตอร์ตัน',
      status: JobStatus.READY_FOR_DELIVERY,
      motorcycleId: moto3.id,
      receptionId: sa.id, technicianId: tech1.id,
      startedAt: new Date('2026-03-09T08:00:00Z'),
    },
  })
  await createLaborTime(job3.id, tech1.id, 'ล้างคาร์บูเรเตอร์', 300, 5)
  await prisma.payment.upsert({
    where: { jobId: job3.id },
    update: {},
    create: {
      paymentNo: 'PAY-20260309-0001', jobId: job3.id, customerId: customer3.id,
      subtotal: 300, vat: 21, totalAmount: 321,
      paymentMethod: PaymentMethod.CASH, paymentStatus: PaymentStatus.PENDING,
    },
  })

  // ── Job 4: เปลี่ยนโช๊คหน้า (PENDING) ────────────────────────────────────
  const job4 = await prisma.job.upsert({
    where: { jobNo: 'JOB-20260310-0001' },
    update: {},
    create: {
      jobNo: 'JOB-20260310-0001',
      symptom: 'โช๊คหน้าน้ำมันรั่ว นิ่มผิดปกติ',
      status: JobStatus.READY_FOR_DELIVERY,
      motorcycleId: moto1.id,
      receptionId: sa.id, technicianId: tech2.id,
      startedAt: new Date('2026-03-10T08:00:00Z'),
    },
  })
  await createLaborTime(job4.id, tech2.id, 'เปลี่ยนโช๊คหน้า', 500, 6)
  await prisma.payment.upsert({
    where: { jobId: job4.id },
    update: {},
    create: {
      paymentNo: 'PAY-20260310-0001', jobId: job4.id, customerId: customer1.id,
      subtotal: 500, vat: 35, totalAmount: 535,
      paymentMethod: PaymentMethod.CASH, paymentStatus: PaymentStatus.PENDING,
    },
  })

  // ── Job 5: เปลี่ยนยาง (PENDING) ─────────────────────────────────────────
  const job5 = await prisma.job.upsert({
    where: { jobNo: 'JOB-20260310-0002' },
    update: {},
    create: {
      jobNo: 'JOB-20260310-0002',
      symptom: 'ยางหน้าและหลังสึกมาก ขอเปลี่ยนทั้งคู่',
      status: JobStatus.READY_FOR_DELIVERY,
      motorcycleId: moto2.id,
      receptionId: sa.id, technicianId: tech1.id,
      startedAt: new Date('2026-03-10T09:00:00Z'),
    },
  })
  await createLaborTime(job5.id, tech1.id, 'เปลี่ยนยางหน้า', 100, 7)
  await createLaborTime(job5.id, tech1.id, 'เปลี่ยนยางหลัง', 100, 8)
  await prisma.payment.upsert({
    where: { jobId: job5.id },
    update: {},
    create: {
      paymentNo: 'PAY-20260310-0002', jobId: job5.id, customerId: customer2.id,
      subtotal: 1700, vat: 119, totalAmount: 1819,
      paymentMethod: PaymentMethod.CASH, paymentStatus: PaymentStatus.PENDING,
    },
  })

  console.log('✅ Demo jobs and payments created')
  console.log('')
  console.log('📊 Summary:')
  console.log('  2 jobs → PAID  (ประวัติการชำระ)')
  console.log('  3 jobs → PENDING (รายการรอชำระ)')
  console.log('')
  console.log('🔑 Login: cashier1 / password123')
}

main()
  .catch(e => { console.error('❌ Seed-demo failed:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
