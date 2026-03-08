export type MechanicJob = {
  id: number
  brand: string
  model: string
  licensePlate: string
  customerName: string
  symptom: string
  tags: string[]
  parts: { name: string; qty: number; unit: string }[]
  foremanNote: string
  qcRejectNote?: string
  photos: string[]
  assignedAt: string
  status: 'รอเริ่ม' | 'กำลังซ่อม' | 'รอตรวจ' | 'คืนของ' | 'เสร็จแล้ว'
  startedAt?: string
  completedAt?: string
}

export const mockMechanicJobs: MechanicJob[] = [
  {
    id: 3,
    brand: 'Honda', model: 'Wave 125i', licensePlate: 'จฉ 9012',
    customerName: 'ประเสริฐ มั่นคง',
    symptom: 'ไฟหน้าไม่ติด ระบบไฟผิดปกติ',
    tags: ['ไฟฟ้า'],
    parts: [
      { name: 'หลอดไฟหน้า H4', qty: 1, unit: 'หัว' },
      { name: 'ฟิวส์ 10A', qty: 2, unit: 'ชิ้น' },
    ],
    foremanNote: 'ตรวจชุดสายไฟใต้แฮนด์ด้วย สงสัยสายขาด',
    photos: [
      'https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+1',
      'https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+2',
    ],
    assignedAt: '08/03/2026  08:00 น.',
    status: 'รอเริ่ม',
  },
  {
    id: 6,
    brand: 'Honda', model: 'PCX 160', licensePlate: 'กข 1234',
    customerName: 'สมศรี มีสุข',
    symptom: 'เปลี่ยนผ้าเบรกหน้า-หลัง',
    tags: ['เบรก'],
    parts: [
      { name: 'ผ้าเบรกหน้า', qty: 1, unit: 'ชุด' },
      { name: 'ผ้าเบรกหลัง', qty: 1, unit: 'ชุด' },
      { name: 'น้ำมันเบรก DOT4', qty: 1, unit: 'ขวด' },
    ],
    foremanNote: 'เช็คดิสก์เบรกด้วยว่าต้องเปลี่ยนไหม',
    photos: [
      'https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+1',
    ],
    assignedAt: '08/03/2026  08:30 น.',
    status: 'กำลังซ่อม',
    startedAt: '08/03/2026  09:00 น.',
  },
  {
    id: 9,
    brand: 'Suzuki', model: 'Address 110', licensePlate: 'ชซ 3456',
    customerName: 'นิภา แก้วใส',
    symptom: 'สายพานขาด เปลี่ยนสายพานใหม่',
    tags: ['ส่งกำลัง'],
    parts: [
      { name: 'สายพานขับเคลื่อน', qty: 1, unit: 'เส้น' },
    ],
    foremanNote: '',
    photos: [
      'https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+1',
    ],
    assignedAt: '08/03/2026  09:00 น.',
    status: 'รอตรวจ',
    startedAt: '08/03/2026  09:15 น.',
    completedAt: '08/03/2026  10:30 น.',
  },
  {
    id: 7,
    brand: 'Honda', model: 'PCX 160', licensePlate: 'กก 999',
    customerName: 'สมชาย ใจดี',
    symptom: 'เครื่องสตาร์ทไม่ติด มีเสียงดังผิดปกติ',
    tags: ['เครื่องยนต์'],
    parts: [
      { name: 'หัวเทียน NGK CR7HSA', qty: 1, unit: 'หัว' },
    ],
    foremanNote: '',
    qcRejectNote: 'เสียงยังดังอยู่ที่บริเวณฝาครอบโซ่ราวลิ้น ให้ตรวจสอบเพิ่มเติม',
    photos: ['https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+1'],
    assignedAt: '07/03/2026  09:30 น.',
    status: 'กำลังซ่อม',
    startedAt: '07/03/2026  10:00 น.',
  },
  {
    id: 10,
    brand: 'Yamaha', model: 'NMAX 155', licensePlate: 'คง 5678',
    customerName: 'วิภา รักสะอาด',
    symptom: 'เบรกหน้าไม่ค่อยกิน น้ำมันเบรกรั่ว',
    tags: ['เบรก'],
    parts: [
      { name: 'ผ้าเบรกหน้า', qty: 1, unit: 'ชุด' },
      { name: 'น้ำมันเบรก DOT4', qty: 1, unit: 'ขวด' },
    ],
    foremanNote: 'ตรวจสายเบรกด้วย',
    photos: ['https://placehold.co/400x300/e5e7eb/9ca3af?text=รูปรถ+1'],
    assignedAt: '07/03/2026  10:15 น.',
    status: 'คืนของ',
    startedAt: '07/03/2026  11:00 น.',
    completedAt: '07/03/2026  15:00 น.',
  },
  {
    id: 11,
    brand: 'Kawasaki', model: 'Ninja 250', licensePlate: 'ฎฏ 1122',
    customerName: 'อมร ศักดิ์ดี',
    symptom: 'ช่วงล่างแข็ง เปลี่ยนโช้คอัพ',
    tags: ['ช่วงล่าง'],
    parts: [
      { name: 'โช้คอัพหน้า', qty: 1, unit: 'คู่' },
    ],
    foremanNote: 'ตรวจลูกปืนล้อด้วย',
    photos: [],
    assignedAt: '07/03/2026  13:00 น.',
    status: 'เสร็จแล้ว',
    startedAt: '07/03/2026  13:30 น.',
    completedAt: '08/03/2026  09:00 น.',
  },
  {
    id: 13,
    brand: 'Honda', model: 'Forza 300', licensePlate: 'ฒณ 5566',
    customerName: 'วีระ จันทร์ดี',
    symptom: 'เปลี่ยนหัวเทียน ล้างหัวฉีด',
    tags: ['เชื้อเพลิง', 'บำรุงรักษา'],
    parts: [
      { name: 'หัวเทียน NGK CR7HSA', qty: 1, unit: 'หัว' },
    ],
    foremanNote: '',
    photos: [],
    assignedAt: '07/03/2026  09:00 น.',
    status: 'เสร็จแล้ว',
    startedAt: '07/03/2026  09:30 น.',
    completedAt: '07/03/2026  14:00 น.',
  },
]
