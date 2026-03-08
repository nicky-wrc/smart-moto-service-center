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
    receivedAt: '07/03/2026  11:00 น.', status: 'พร้อมซ่อม',
    customerName: 'ประเสริฐ มั่นคง', customerPhone: '062-111-2233',
    tags: ['ไฟฟ้า'],
    photos: ['https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+1', 'https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+2', 'https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+3'],
  },
  {
    id: 4, receptionist: 'นิค', brand: 'Suzuki', model: 'Burgman 200',
    licensePlate: 'ชซ 3456', province: 'สมุทรปราการ',
    symptom: 'ไม่ทราบอาการ รถวิ่งแล้วสะดุด',
    receivedAt: '07/03/2026  11:45 น.', status: 'กำลังดำเนินงาน',
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
    receivedAt: '08/03/2026  08:30 น.', status: 'รอตรวจ',
    customerName: 'สมศรี มีสุข', customerPhone: '091-234-5678',
    tags: ['เบรก'],
    photos: ['https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+1'],
  },
]
