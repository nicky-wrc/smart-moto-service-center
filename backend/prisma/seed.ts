import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // ==============================
  // Users
  // ==============================
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      name: 'ผู้ดูแลระบบ',
      role: 'ADMIN',
      baseSalary: 30000,
    },
  });

  const manager = await prisma.user.upsert({
    where: { username: 'owner1' },
    update: {},
    create: {
      username: 'owner1',
      password: hashedPassword,
      name: 'สมบูรณ์ เจ้าของร้าน',
      role: 'MANAGER',
      baseSalary: 50000,
    },
  });

  const serviceAdvisor = await prisma.user.upsert({
    where: { username: 'sa1' },
    update: {},
    create: {
      username: 'sa1',
      password: hashedPassword,
      name: 'สมชาย ใจดี',
      role: 'SERVICE_ADVISOR',
      baseSalary: 15000,
    },
  });

  const foreman = await prisma.user.upsert({
    where: { username: 'foreman1' },
    update: {},
    create: {
      username: 'foreman1',
      password: hashedPassword,
      name: 'หัวหน้าช่างวิชัย',
      role: 'FOREMAN',
      baseSalary: 20000,
      commissionRate: 5,
    },
  });

  const technician = await prisma.user.upsert({
    where: { username: 'tech1' },
    update: {},
    create: {
      username: 'tech1',
      password: hashedPassword,
      name: 'ช่างสมศักดิ์',
      role: 'TECHNICIAN',
      baseSalary: 12000,
      commissionRate: 3,
    },
  });

  const technician2 = await prisma.user.upsert({
    where: { username: 'tech2' },
    update: {},
    create: {
      username: 'tech2',
      password: hashedPassword,
      name: 'ช่างประยุทธ์',
      role: 'TECHNICIAN',
      baseSalary: 12000,
      commissionRate: 3,
    },
  });

  const stockKeeper = await prisma.user.upsert({
    where: { username: 'stock1' },
    update: {},
    create: {
      username: 'stock1',
      password: hashedPassword,
      name: 'พรชัย คลังสินค้า',
      role: 'STOCK_KEEPER',
      baseSalary: 14000,
    },
  });

  const cashier = await prisma.user.upsert({
    where: { username: 'cashier1' },
    update: {},
    create: {
      username: 'cashier1',
      password: hashedPassword,
      name: 'สมหญิง เงินสด',
      role: 'CASHIER',
      baseSalary: 14000,
    },
  });

  console.log('✅ Users created');

  // ==============================
  // Customers
  // ==============================
  const customer1 = await prisma.customer.upsert({
    where: { phoneNumber: '0812345678' },
    update: {},
    create: {
      phoneNumber: '0812345678',
      title: 'นาย',
      firstName: 'สมชาย',
      lastName: 'ใจดี',
      address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
    },
  });

  console.log('✅ Customers created');

  // ==============================
  // Motorcycles
  // ==============================
  const motorcycle1 = await prisma.motorcycle.upsert({
    where: { vin: 'VIN123456789' },
    update: {},
    create: {
      vin: 'VIN123456789',
      licensePlate: 'กข 1234',
      brand: 'Honda',
      model: 'Wave 110i',
      color: 'แดง',
      year: 2022,
      engineNo: 'ENG123456',
      ownerId: customer1.id,
    },
  });

  console.log('✅ Motorcycles created');

  // ==============================
  // Suppliers
  // ==============================
  await prisma.supplier.upsert({
    where: { supplierNo: 'SUP-001' },
    update: {},
    create: {
      supplierNo: 'SUP-001',
      name: 'บ.อะไหล่ฮอนด้า จำกัด',
      contactName: 'คุณสมศักดิ์',
      phoneNumber: '0891111111',
      email: 'honda-parts@example.com',
      address: '99/1 ถ.พระราม 2 กรุงเทพฯ',
    },
  });

  await prisma.supplier.upsert({
    where: { supplierNo: 'SUP-002' },
    update: {},
    create: {
      supplierNo: 'SUP-002',
      name: 'ร้านอะไหล่เจริญ',
      contactName: 'คุณเจริญ',
      phoneNumber: '0892222222',
      address: '55 ถ.เพชรเกษม กรุงเทพฯ',
    },
  });

  await prisma.supplier.upsert({
    where: { supplierNo: 'SUP-003' },
    update: {},
    create: {
      supplierNo: 'SUP-003',
      name: 'บ.ยามาฮ่าพาร์ท จำกัด',
      contactName: 'คุณนภา',
      phoneNumber: '0893333333',
      email: 'yamaha-parts@example.com',
      address: '200 ถ.สุขสวัสดิ์ กรุงเทพฯ',
    },
  });

  console.log('✅ Suppliers created');

  // ==============================
  // Service Catalog (33 รายการค่าแรง)
  // ==============================
  const services = [
    { name: 'เปลี่ยนน้ำมันเครื่อง', laborCost: 100, category: 'บำรุงรักษา', tags: ['เครื่องยนต์', 'บำรุงรักษา'] },
    { name: 'เปลี่ยนน้ำมันเฟืองท้าย', laborCost: 80, category: 'บำรุงรักษา', tags: ['ส่งกำลัง', 'บำรุงรักษา'] },
    { name: 'เปลี่ยนหัวเทียน', laborCost: 80, category: 'บำรุงรักษา', tags: ['เครื่องยนต์', 'บำรุงรักษา'] },
    { name: 'เปลี่ยนกรองอากาศ', laborCost: 100, category: 'บำรุงรักษา', tags: ['เครื่องยนต์', 'บำรุงรักษา'] },
    { name: 'เปลี่ยนแบตเตอรี่', laborCost: 100, category: 'ไฟฟ้า', tags: ['ไฟฟ้า', 'บำรุงรักษา'] },
    { name: 'เปลี่ยนหลอดไฟหน้า/ท้าย', laborCost: 80, category: 'ไฟฟ้า', tags: ['ไฟฟ้า'] },
    { name: 'ตั้งโซ่ / หยอดโซ่', laborCost: 80, category: 'ส่งกำลัง', tags: ['ส่งกำลัง', 'บำรุงรักษา'] },
    { name: 'เปลี่ยนผ้าเบรกหน้า', laborCost: 150, category: 'เบรก', tags: ['เบรก'] },
    { name: 'เปลี่ยนเบรกหลัง', laborCost: 150, category: 'เบรก', tags: ['เบรก'] },
    { name: 'ล้างคาร์บูเรเตอร์', laborCost: 300, category: 'เชื้อเพลิง', tags: ['เชื้อเพลิง', 'เครื่องยนต์'] },
    { name: 'ล้างหัวฉีด', laborCost: 400, category: 'เชื้อเพลิง', tags: ['เชื้อเพลิง', 'เครื่องยนต์'] },
    { name: 'เปลี่ยนชุดโซ่-สเตอร์', laborCost: 400, category: 'ส่งกำลัง', tags: ['ส่งกำลัง'] },
    { name: 'เปลี่ยนสายพาน (ออโต้)', laborCost: 400, category: 'ส่งกำลัง', tags: ['ส่งกำลัง'] },
    { name: 'เปลี่ยนโช๊คหน้า', laborCost: 500, category: 'ช่วงล่าง', tags: ['ช่วงล่าง'] },
    { name: 'เปลี่ยนโช๊คหลัง', laborCost: 300, category: 'ช่วงล่าง', tags: ['ช่วงล่าง'] },
    { name: 'เปลี่ยนดิสก์เบรก', laborCost: 400, category: 'เบรก', tags: ['เบรก'] },
    { name: 'เปลี่ยนคลัตช์', laborCost: 600, category: 'ส่งกำลัง', tags: ['ส่งกำลัง', 'เครื่องยนต์'] },
    { name: 'ผ่าเครื่องตรวจสอบ', laborCost: 800, category: 'เครื่องยนต์', tags: ['เครื่องยนต์'] },
    { name: 'เปลี่ยนลูกสูบ', laborCost: 1200, category: 'เครื่องยนต์', tags: ['เครื่องยนต์'] },
    { name: 'เปลี่ยนข้อเหวี่ยง', laborCost: 1500, category: 'เครื่องยนต์', tags: ['เครื่องยนต์'] },
    { name: 'ทำฝาสูบ', laborCost: 1200, category: 'เครื่องยนต์', tags: ['เครื่องยนต์'] },
    { name: 'ยกเครื่องใหม่', laborCost: 3500, category: 'เครื่องยนต์', tags: ['เครื่องยนต์'] },
    { name: 'ซ่อมเกียร์', laborCost: 1500, category: 'ส่งกำลัง', tags: ['ส่งกำลัง', 'เครื่องยนต์'] },
    { name: 'เปลี่ยนชุดคลัตช์ใหญ่', laborCost: 1200, category: 'ส่งกำลัง', tags: ['ส่งกำลัง', 'เครื่องยนต์'] },
    { name: 'ตรวจเช็คระบบไฟ', laborCost: 200, category: 'ไฟฟ้า', tags: ['ไฟฟ้า'] },
    { name: 'เปลี่ยนเรกูเลเตอร์', laborCost: 300, category: 'ไฟฟ้า', tags: ['ไฟฟ้า'] },
    { name: 'เปลี่ยนกล่อง ECU', laborCost: 500, category: 'ไฟฟ้า', tags: ['ไฟฟ้า', 'เครื่องยนต์'] },
    { name: 'เดินสายไฟใหม่', laborCost: 700, category: 'ไฟฟ้า', tags: ['ไฟฟ้า'] },
    { name: 'ตรวจเช็คทั่วไป', laborCost: 100, category: 'บำรุงรักษา', tags: ['บำรุงรักษา'] },
    { name: 'ตรวจเช็คก่อนเดินทางไกล', laborCost: 200, category: 'บำรุงรักษา', tags: ['บำรุงรักษา'] },
    { name: 'ตรวจเช็คเครื่องสะดุด', laborCost: 200, category: 'เครื่องยนต์', tags: ['เครื่องยนต์'] },
  ];

  for (const svc of services) {
    await prisma.serviceCatalog.upsert({
      where: { name: svc.name },
      update: { laborCost: svc.laborCost, category: svc.category, tags: svc.tags },
      create: svc,
    });
  }

  console.log('✅ Service Catalog created (31 items)');

  // ==============================
  // Sample Parts
  // ==============================
  const part1 = await prisma.part.upsert({
    where: { partNo: 'OIL-001' },
    update: {},
    create: {
      partNo: 'OIL-001',
      name: 'น้ำมันเครื่อง Honda 4T 10W-30',
      brand: 'Honda',
      category: 'น้ำมัน',
      unitPrice: 180,
      stockQuantity: 50,
      reorderPoint: 10,
      reorderQuantity: 30,
    },
  });

  await prisma.part.upsert({
    where: { partNo: 'SPK-001' },
    update: {},
    create: {
      partNo: 'SPK-001',
      name: 'หัวเทียน NGK CR7HSA',
      brand: 'NGK',
      category: 'ระบบจุดระเบิด',
      unitPrice: 80,
      stockQuantity: 30,
      reorderPoint: 5,
      reorderQuantity: 20,
    },
  });

  await prisma.part.upsert({
    where: { partNo: 'BRK-001' },
    update: {},
    create: {
      partNo: 'BRK-001',
      name: 'ผ้าเบรกหน้า Honda Wave',
      brand: 'Honda',
      category: 'เบรก',
      unitPrice: 250,
      stockQuantity: 20,
      reorderPoint: 5,
      reorderQuantity: 15,
    },
  });

  await prisma.part.upsert({
    where: { partNo: 'FLT-001' },
    update: {},
    create: {
      partNo: 'FLT-001',
      name: 'กรองอากาศ Honda Wave 110i',
      brand: 'Honda',
      category: 'ไส้กรอง',
      unitPrice: 120,
      stockQuantity: 15,
      reorderPoint: 3,
      reorderQuantity: 10,
    },
  });

  await prisma.part.upsert({
    where: { partNo: 'BAT-001' },
    update: {},
    create: {
      partNo: 'BAT-001',
      name: 'แบตเตอรี่ YTZ5S',
      brand: 'Yuasa',
      category: 'ไฟฟ้า',
      unitPrice: 650,
      stockQuantity: 8,
      reorderPoint: 2,
      reorderQuantity: 5,
    },
  });

  console.log('✅ Parts created');

  // ==============================
  console.log('🎉 Seed completed!');
  console.log('\n📝 Test Accounts:');
  console.log('  Admin:          admin    / password123');
  console.log('  Owner/Manager:  owner1   / password123');
  console.log('  Service Advisor: sa1     / password123');
  console.log('  Foreman:        foreman1 / password123');
  console.log('  Technician 1:   tech1    / password123');
  console.log('  Technician 2:   tech2    / password123');
  console.log('  Stock Keeper:   stock1   / password123');
  console.log('  Cashier:        cashier1 / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
