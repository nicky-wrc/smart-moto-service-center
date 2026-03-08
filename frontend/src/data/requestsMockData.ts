export interface RequestItem {
  id: number
  partCode: string
  partName: string
  quantity: number
  unit: string
  pricePerUnit: number
}

export interface PartRequest {
  id: number
  requester: string
  requesterRole: string
  motorcycleModel: string
  licensePlate: string
  requestedAt: string
  items: RequestItem[]
}

export const mockRequests: PartRequest[] = [
  {
    id: 1,
    requester: 'สมชาย รักดี',
    requesterRole: 'หัวหน้าช่าง',
    motorcycleModel: 'Honda Wave 110i',
    licensePlate: 'กทม 1234 กทม',
    requestedAt: '24/10/2023 10:30 น.',
    items: [
      { id: 1, partCode: 'HW-001', partName: 'น้ำมันเครื่อง 0.8L', quantity: 2, unit: 'ขวด', pricePerUnit: 120 },
      { id: 2, partCode: 'HW-002', partName: 'ไส้กรองน้ำมัน', quantity: 1, unit: 'ชิ้น', pricePerUnit: 85 },
    ],
  },
  {
    id: 2,
    requester: 'วิเชียร อ่านอยู่',
    requesterRole: 'หัวหน้าช่าง',
    motorcycleModel: 'Yamaha Finn',
    licensePlate: 'ฉช 5678 ฉะเชิงเทรา',
    requestedAt: '24/10/2023 14:15 น.',
    items: [
      { id: 1, partCode: 'YF-001', partName: 'สายพาน CVT', quantity: 1, unit: 'เส้น', pricePerUnit: 450 },
      { id: 2, partCode: 'YF-002', partName: 'ลูกรอกวาไรตี้', quantity: 6, unit: 'ชิ้น', pricePerUnit: 30 },
    ],
  },
  {
    id: 3,
    requester: 'สมชาย รักดี',
    requesterRole: 'หัวหน้าช่าง',
    motorcycleModel: 'Honda Click 160',
    licensePlate: 'กค 9999 นนทบุรี',
    requestedAt: '23/10/2023 09:00 น.',
    items: [
      { id: 1, partCode: 'HC-001', partName: 'แผ่นเบรกหน้า', quantity: 1, unit: 'ชุด', pricePerUnit: 350 },
      { id: 2, partCode: 'HC-002', partName: 'น้ำมันเบรก DOT4', quantity: 1, unit: 'ขวด', pricePerUnit: 150 },
      { id: 3, partCode: 'HC-003', partName: 'หัวเทียน Iridium', quantity: 1, unit: 'ชิ้น', pricePerUnit: 320 },
      { id: 4, partCode: 'HC-004', partName: 'น้ำมันเครื่อง 1L', quantity: 20, unit: 'ขวด', pricePerUnit: 160 },
    ],
  },
  {
    id: 4,
    requester: 'บุญมี มนตร์ทอง',
    requesterRole: 'หัวหน้าช่าง',
    motorcycleModel: 'Honda PCX 160',
    licensePlate: 'ขก 1111 เชียงใหม่',
    requestedAt: '22/10/2023 11:45 น.',
    items: [
      { id: 1, partCode: 'PCX-001', partName: 'ไส้กรองอากาศ', quantity: 2, unit: 'ชิ้น', pricePerUnit: 180 },
      { id: 2, partCode: 'PCX-002', partName: 'สายคันเร่ง', quantity: 1, unit: 'เส้น', pricePerUnit: 220 },
      { id: 3, partCode: 'PCX-003', partName: 'ยางนอกหน้า 110/70-14', quantity: 1, unit: 'เส้น', pricePerUnit: 1200 },
      { id: 4, partCode: 'PCX-004', partName: 'ยางนอกหลัง 130/70-13', quantity: 1, unit: 'เส้น', pricePerUnit: 1350 },
      { id: 5, partCode: 'PCX-005', partName: 'แบตเตอรี่ 12V', quantity: 1, unit: 'ลูก', pricePerUnit: 1800 },
      { id: 6, partCode: 'PCX-006', partName: 'ชุดสายไฟ', quantity: 1, unit: 'ชุด', pricePerUnit: 650 },
    ],
  },
  {
    id: 5,
    requester: 'นิดา สุขเจริญ',
    requesterRole: 'ช่าง',
    motorcycleModel: 'Yamaha NMAX 155',
    licensePlate: 'สก 2345 สกลนคร',
    requestedAt: '21/10/2023 13:00 น.',
    items: [
      { id: 1, partCode: 'NX-001', partName: 'น้ำมันเครื่อง YAMALUBE 0.8L', quantity: 1, unit: 'ขวด', pricePerUnit: 145 },
      { id: 2, partCode: 'NX-002', partName: 'ไส้กรองน้ำมัน', quantity: 1, unit: 'ชิ้น', pricePerUnit: 95 },
    ],
  },
  {
    id: 6,
    requester: 'อนุชิต พงศ์ไพร',
    requesterRole: 'หัวหน้าช่าง',
    motorcycleModel: 'Honda CB500F',
    licensePlate: 'กข 7890 กรุงเทพ',
    requestedAt: '20/10/2023 08:30 น.',
    items: [
      { id: 1, partCode: 'CB5-001', partName: 'โซ่ 530x104', quantity: 1, unit: 'เส้น', pricePerUnit: 1100 },
      { id: 2, partCode: 'CB5-002', partName: 'สเตอร์หน้า 15T', quantity: 1, unit: 'ชิ้น', pricePerUnit: 280 },
      { id: 3, partCode: 'CB5-003', partName: 'สเตอร์หลัง 42T', quantity: 1, unit: 'ชิ้น', pricePerUnit: 480 },
    ],
  },
]
