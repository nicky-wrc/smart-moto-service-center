export type JobOrder = {
  id: number
  receptionist: string
  brand: string
  model: string
  licensePlate: string
  province: string
  symptom: string
  receivedAt: string
  status: 'รอประเมิน' | 'รอลูกค้าอนุมัติ' | 'พร้อมซ่อม' | 'รอสั่งซื้อ' | 'ตรวจเชิงลึก' | 'กำลังดำเนินงาน' | 'รอตรวจ'
  customerName: string
  customerPhone: string
  tags: string[]
  photos: string[]
  mechanicId?: number
  mechanicReport?: {
    note: string
    photos: string[]
    reportedAt: string
  }
}

export const mockJobs: JobOrder[] = [
  {
    id: 1, receptionist: 'พีพี', brand: 'Honda', model: 'PCX 160',
    licensePlate: 'กก 999', province: 'กรุงเทพมหานคร',
    symptom: 'เครื่องสตาร์ทไม่ติด มีเสียงดังผิดปกติ',
    receivedAt: '07/03/2026  09:30 น.', status: 'รอประเมิน',
    customerName: 'สมชาย ใจดี', customerPhone: '081-234-5678',
    tags: ['เครื่องยนต์'],
    photos: ['https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+1', 'https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+2'],
  },
  {
    id: 2, receptionist: 'พีพี', brand: 'Yamaha', model: 'NMAX 155',
    licensePlate: 'คง 5678', province: 'นนทบุรี',
    symptom: 'เบรกหน้าไม่ค่อยกิน น้ำมันเบรกรั่ว',
    receivedAt: '07/03/2026  10:15 น.', status: 'รอลูกค้าอนุมัติ',
    customerName: 'วิภา รักสะอาด', customerPhone: '089-876-5432',
    tags: ['เบรก'],
    photos: ['https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+1'],
  },
  {
    id: 3, receptionist: 'นิค', brand: 'Honda', model: 'Wave 125i',
    licensePlate: 'จฉ 9012', province: 'ปทุมธานี',
    symptom: 'ไฟหน้าไม่ติด ระบบไฟผิดปกติ',
    receivedAt: '07/03/2026  11:00 น.', status: 'พร้อมซ่อม', mechanicId: 2,
    customerName: 'ประเสริฐ มั่นคง', customerPhone: '062-111-2233',
    tags: ['ไฟฟ้า'],
    photos: ['https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+1', 'https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+2', 'https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+3'],
  },
  {
    id: 4, receptionist: 'นิค', brand: 'Suzuki', model: 'Burgman 200',
    licensePlate: 'ชซ 3456', province: 'สมุทรปราการ',
    symptom: 'ไม่ทราบอาการ รถวิ่งแล้วสะดุด',
    receivedAt: '07/03/2026  11:45 น.', status: 'กำลังดำเนินงาน', mechanicId: 1,
    customerName: 'นภา สุขสันต์', customerPhone: '095-444-5566',
    tags: ['เครื่องยนต์', 'ช่วงล่าง'],
    photos: ['https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+1'],
    mechanicReport: {
      note: 'พบว่าโซ่ขับเคลื่อนชำรุดและต้องเปลี่ยนด้วย นอกจากนี้สเตอร์หน้าสึกหนักมาก ควรเปลี่ยนพร้อมกัน',
      photos: [
        'https://placehold.co/400x300/fef3c7/d97706?text=ปัญหาที่พบ+1',
        'https://placehold.co/400x300/fef3c7/d97706?text=ปัญหาที่พบ+2',
      ],
      reportedAt: '07/03/2026  14:30 น.',
    },
  },
  {
    id: 5, receptionist: 'พีพี', brand: 'Kawasaki', model: 'Z400',
    licensePlate: 'ญฐ 7890', province: 'กรุงเทพมหานคร',
    symptom: 'เปลี่ยนน้ำมันเครื่อง และตรวจเช็คทั่วไป',
    receivedAt: '07/03/2026  13:00 น.', status: 'รอสั่งซื้อ',
    customerName: 'ธนพล วิริยะ', customerPhone: '083-777-8899',
    tags: ['บำรุงรักษา'],
    photos: ['https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+1', 'https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+2'],
  },
  {
    id: 6, receptionist: 'พีพี', brand: 'Honda', model: 'PCX 160',
    licensePlate: 'กข 1234', province: 'กรุงเทพมหานคร',
    symptom: 'เปลี่ยนผ้าเบรกหน้า-หลัง',
    receivedAt: '08/03/2026  08:30 น.', status: 'รอตรวจ', mechanicId: 3,
    customerName: 'สมศรี มีสุข', customerPhone: '091-234-5678',
    tags: ['เบรก'],
    photos: ['https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+1'],
  },
  {
    id: 7, receptionist: 'นิค', brand: 'Yamaha', model: 'Aerox 155',
    licensePlate: 'กค 4321', province: 'กรุงเทพมหานคร',
    symptom: 'เครื่องร้อนผิดปกติ น้ำหล่อเย็นรั่ว',
    receivedAt: '08/03/2026  10:00 น.', status: 'กำลังดำเนินงาน', mechanicId: 1,
    customerName: 'อนุชา สมบูรณ์', customerPhone: '086-555-1234',
    tags: ['เครื่องยนต์', 'ระบบระบายความร้อน'],
    photos: ['https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+1'],
  },
  // กิตติพงษ์ (id 5) — 2 งาน
  {
    id: 8, receptionist: 'พีพี', brand: 'Honda', model: 'Click 125i',
    licensePlate: 'งจ 1122', province: 'กรุงเทพมหานคร',
    symptom: 'ช่วงล่างหน้าดังกรอบแกรบ โช้คอัพรั่ว',
    receivedAt: '08/03/2026  09:00 น.', status: 'กำลังดำเนินงาน', mechanicId: 5,
    customerName: 'ปิยะ วงศ์สุข', customerPhone: '082-333-4455',
    tags: ['ช่วงล่าง'],
    photos: ['https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+1'],
  },
  {
    id: 9, receptionist: 'นิค', brand: 'Suzuki', model: 'Raider R150',
    licensePlate: 'ฉช 7788', province: 'นนทบุรี',
    symptom: 'เบรกหลังลื่น แป้นเบรกแข็ง',
    receivedAt: '08/03/2026  09:30 น.', status: 'รอตรวจ', mechanicId: 5,
    customerName: 'สุดา พรมมา', customerPhone: '091-777-8800',
    tags: ['เบรก'],
    photos: ['https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+1'],
  },
  // ณัฐพล (id 6) — 3 งาน
  {
    id: 10, receptionist: 'พีพี', brand: 'Honda', model: 'Forza 350',
    licensePlate: 'ซฌ 3344', province: 'กรุงเทพมหานคร',
    symptom: 'ไฟ ABS ขึ้น ระบบไฟฟ้าผิดปกติ',
    receivedAt: '08/03/2026  10:30 น.', status: 'กำลังดำเนินงาน', mechanicId: 6,
    customerName: 'ภัทรพงษ์ เจริญ', customerPhone: '083-111-2200',
    tags: ['ไฟฟ้า'],
    photos: ['https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+1'],
  },
  {
    id: 11, receptionist: 'นิค', brand: 'Kawasaki', model: 'Ninja 400',
    licensePlate: 'ญญ 5566', province: 'กรุงเทพมหานคร',
    symptom: 'สตาร์ทไม่ติด แบตเตอรี่เสื่อม',
    receivedAt: '08/03/2026  11:00 น.', status: 'พร้อมซ่อม', mechanicId: 6,
    customerName: 'วรวุฒิ ลือชา', customerPhone: '088-444-5566',
    tags: ['ไฟฟ้า', 'เครื่องยนต์'],
    photos: ['https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+1'],
  },
  {
    id: 12, receptionist: 'พีพี', brand: 'Yamaha', model: 'MT-03',
    licensePlate: 'ฐฑ 9900', province: 'ปทุมธานี',
    symptom: 'เครื่องดับกลางทาง ระบบฉีดเชื้อเพลิงขัดข้อง',
    receivedAt: '08/03/2026  11:30 น.', status: 'รอสั่งซื้อ',
    customerName: 'กนกวรรณ สมใจ', customerPhone: '097-222-3311',
    tags: ['เครื่องยนต์', 'ระบบเชื้อเพลิง'],
    photos: ['https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+1'],
  },
  // อภิสิทธิ์ (id 8) — 2 งาน
  {
    id: 13, receptionist: 'นิค', brand: 'Honda', model: 'CBR 650R',
    licensePlate: 'ฒณ 1357', province: 'กรุงเทพมหานคร',
    symptom: 'เปลี่ยนน้ำมันเครื่อง ไส้กรองอากาศ ตรวจเช็คระยะ',
    receivedAt: '08/03/2026  12:00 น.', status: 'กำลังดำเนินงาน', mechanicId: 8,
    customerName: 'พิชัย ดาวเรือง', customerPhone: '081-999-0011',
    tags: ['บำรุงรักษา', 'เครื่องยนต์'],
    photos: ['https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+1'],
  },
  {
    id: 14, receptionist: 'พีพี', brand: 'Triumph', model: 'Street Triple',
    licensePlate: 'ดต 2468', province: 'กรุงเทพมหานคร',
    symptom: 'ผ้าเบรกหน้าหมด เบรกดิสก์สึก',
    receivedAt: '08/03/2026  13:00 น.', status: 'รอสั่งซื้อ',
    customerName: 'ชนาธิป รุ่งเรือง', customerPhone: '089-000-1122',
    tags: ['เบรก'],
    photos: ['https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+1'],
  },
  // สุรชัย (id 9) — 1 งาน
  {
    id: 15, receptionist: 'นิค', brand: 'Yamaha', model: 'Grand Filano',
    licensePlate: 'ถท 3579', province: 'สมุทรปราการ',
    symptom: 'ไฟหน้า-ไฟท้ายไม่ติด ระบบไฟขัดข้อง',
    receivedAt: '08/03/2026  13:30 น.', status: 'กำลังดำเนินงาน', mechanicId: 9,
    customerName: 'นิภาพร แก้วใส', customerPhone: '092-555-6677',
    tags: ['ไฟฟ้า'],
    photos: ['https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+1'],
  },
  // เอกชัย (id 10) — 2 งาน
  {
    id: 16, receptionist: 'พีพี', brand: 'Honda', model: 'PCX 160',
    licensePlate: 'ทน 4680', province: 'นนทบุรี',
    symptom: 'โซ่หย่อน สเตอร์สึก เปลี่ยนชุดโซ่สเตอร์',
    receivedAt: '08/03/2026  14:00 น.', status: 'พร้อมซ่อม', mechanicId: 10,
    customerName: 'ศิวกร มีแสง', customerPhone: '085-888-9900',
    tags: ['ส่งกำลัง'],
    photos: ['https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+1'],
  },
  {
    id: 17, receptionist: 'นิค', brand: 'Kawasaki', model: 'Versys 650',
    licensePlate: 'บป 5791', province: 'กรุงเทพมหานคร',
    symptom: 'คลัตช์ลื่น กดคลัตช์แล้วรถไม่ออก',
    receivedAt: '08/03/2026  14:30 น.', status: 'กำลังดำเนินงาน', mechanicId: 10,
    customerName: 'ทศพล สายสิน', customerPhone: '094-111-2233',
    tags: ['ส่งกำลัง', 'เครื่องยนต์'],
    photos: ['https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+1'],
  },
]
