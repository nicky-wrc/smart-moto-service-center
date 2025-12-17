import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data (optional - comment out if you want to keep data)
  // await prisma.user.deleteMany();
  // await prisma.customer.deleteMany();
  // await prisma.motorcycle.deleteMany();

  // Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      name: 'ผู้ดูแลระบบ',
      role: 'ADMIN',
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
    },
  });

  console.log('✅ Users created');

  // Create Customers (if not exists)
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

  // Create Motorcycles (if not exists)
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

  console.log('🎉 Seed completed!');
  console.log('\n📝 Test Accounts:');
  console.log('  Admin: admin / password123');
  console.log('  SA: sa1 / password123');
  console.log('  Technician: tech1 / password123');
  console.log('  Stock Keeper: stock1 / password123');
  console.log('  Cashier: cashier1 / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

