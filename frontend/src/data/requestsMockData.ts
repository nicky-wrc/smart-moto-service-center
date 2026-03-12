export interface RequestItem {
  id: number
  partId?: number
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
    motorcycleModel: 'Wave 125i',
    licensePlate: '1กข 1234 กรุงเทพมหานคร',
    requestedAt: '24/10/2023 10:30 น.',
    items: [
      { id: 1, partCode: 'CON-001', partName: 'น้ำมันเครื่อง', quantity: 2, unit: 'ขวด', pricePerUnit: 350 },
      { id: 2, partCode: 'LUB-002', partName: 'กรองน้ำมันเครื่อง', quantity: 1, unit: 'ชิ้น', pricePerUnit: 120 },
      { id: 3, partCode: 'ELE-002', partName: 'หัวเทียน', quantity: 1, unit: 'ชิ้น', pricePerUnit: 120 },
    ],
  },
  {
    id: 2,
    requester: 'วิเชียร อ่านอยู่',
    requesterRole: 'หัวหน้าช่าง',
    motorcycleModel: 'PCX150',
    licensePlate: '2กค 5678 ฉะเชิงเทรา',
    requestedAt: '24/10/2023 14:15 น.',
    items: [
      { id: 1, partCode: 'BRK-001', partName: 'ผ้าเบรก', quantity: 1, unit: 'ชุด', pricePerUnit: 320 },
      { id: 2, partCode: 'COL-001', partName: 'หม้อน้ำ', quantity: 1, unit: 'ชิ้น', pricePerUnit: 2100 },
      { id: 3, partCode: 'ENG-005', partName: 'เพลาข้อเหวี่ยง', quantity: 1, unit: 'ชิ้น', pricePerUnit: 2200 },
    ],
  },
  {
    id: 3,
    requester: 'สมชาย รักดี',
    requesterRole: 'หัวหน้าช่าง',
    motorcycleModel: 'Click 160',
    licensePlate: '1ขข 9999 นนทบุรี',
    requestedAt: '23/10/2023 09:00 น.',
    items: [
      { id: 1, partCode: 'ENG-001-C', partName: 'ลูกสูบ Click 160', quantity: 1, unit: 'ชิ้น', pricePerUnit: 950 },
      { id: 2, partCode: 'CON-002', partName: 'น้ำมันเบรก', quantity: 1, unit: 'ขวด', pricePerUnit: 150 },
      { id: 3, partCode: 'BRK-006', partName: 'น้ำมันเบรก (BRK)', quantity: 1, unit: 'ขวด', pricePerUnit: 150 },
    ],
  },
  {
    id: 4,
    requester: 'บุญมี มนตร์ทอง',
    requesterRole: 'หัวหน้าช่าง',
    motorcycleModel: 'PCX150',
    licensePlate: '1กง 1111 เชียงใหม่',
    requestedAt: '22/10/2023 11:45 น.',
    items: [
      { id: 1, partCode: 'FUL-004', partName: 'กรองน้ำมันเชื้อเพลิง', quantity: 2, unit: 'ชิ้น', pricePerUnit: 150 },
      { id: 2, partCode: 'CTL-002', partName: 'สายคันเร่ง', quantity: 1, unit: 'เส้น', pricePerUnit: 180 },
      { id: 3, partCode: 'WHL-001', partName: 'ยางนอก', quantity: 2, unit: 'เส้น', pricePerUnit: 550 },
      { id: 4, partCode: 'ELE-001', partName: 'แบตเตอรี่', quantity: 1, unit: 'ลูก', pricePerUnit: 650 },
    ],
  },
  {
    id: 5,
    requester: 'นิดา สุขเจริญ',
    requesterRole: 'ช่าง',
    motorcycleModel: 'Scoopy i',
    licensePlate: '1กจ 2345 สกลนคร',
    requestedAt: '21/10/2023 13:00 น.',
    items: [
      { id: 1, partCode: 'CON-001', partName: 'น้ำมันเครื่อง', quantity: 1, unit: 'ขวด', pricePerUnit: 350 },
      { id: 2, partCode: 'LUB-002', partName: 'กรองน้ำมันเครื่อง', quantity: 1, unit: 'ชิ้น', pricePerUnit: 120 },
      { id: 3, partCode: 'ENG-007', partName: 'ฝาสูบ', quantity: 1, unit: 'ชิ้น', pricePerUnit: 1800 },
    ],
  },
  {
    id: 6,
    requester: 'อนุชิต พงศ์ไพร',
    requesterRole: 'หัวหน้าช่าง',
    motorcycleModel: 'Wave 125i',
    licensePlate: '1กฉ 7890 กรุงเทพมหานคร',
    requestedAt: '20/10/2023 08:30 น.',
    items: [
      { id: 1, partCode: 'TRN-007', partName: 'โซ่', quantity: 1, unit: 'เส้น', pricePerUnit: 400 },
      { id: 2, partCode: 'TRN-005', partName: 'สเตอร์หน้า', quantity: 1, unit: 'ชิ้น', pricePerUnit: 180 },
      { id: 3, partCode: 'TRN-006', partName: 'สเตอร์หลัง', quantity: 1, unit: 'ชิ้น', pricePerUnit: 250 },
    ],
  },
  {
    id: 7,
    requester: 'วัชระ เกียรติจุน',
    requesterRole: 'ช่าง',
    motorcycleModel: 'PCX150',
    licensePlate: '2กง 1122 ชลบุรี',
    requestedAt: '19/10/2023 15:20 น.',
    items: [
      { id: 1, partCode: 'BDP-001', partName: 'แฟริ่ง', quantity: 1, unit: 'ชุด', pricePerUnit: 3500 },
      { id: 2, partCode: 'BDP-005', partName: 'กระจกมองข้าง', quantity: 1, unit: 'ชิ้น', pricePerUnit: 250 },
    ],
  },
  {
    id: 8,
    requester: 'พลภัทร เสียงเพราะ',
    requesterRole: 'ช่าง',
    motorcycleModel: 'Scoopy i',
    licensePlate: '1กช 3344 นครปฐม',
    requestedAt: '19/10/2023 10:10 น.',
    items: [
      { id: 1, partCode: 'ELE-019', partName: 'ไดชาร์จ', quantity: 1, unit: 'ชิ้น', pricePerUnit: 1200 },
      { id: 2, partCode: 'FUL-003', partName: 'ปั๊มน้ำมันเชื้อเพลิง', quantity: 1, unit: 'ชิ้น', pricePerUnit: 1200 },
    ],
  },
  {
    id: 9,
    requester: 'สมเกียรติ ยานยนต์',
    requesterRole: 'หัวหน้าช่าง',
    motorcycleModel: 'PCX150',
    licensePlate: '2ขค 5566 สงขลา',
    requestedAt: '18/10/2023 11:30 น.',
    items: [
      { id: 1, partCode: 'LUB-002', partName: 'กรองน้ำมันเครื่อง', quantity: 1, unit: 'ชิ้น', pricePerUnit: 120 },
      { id: 2, partCode: 'CON-001', partName: 'น้ำมันเครื่อง', quantity: 3, unit: 'ขวด', pricePerUnit: 350 },
    ],
  },
  {
    id: 10,
    requester: 'สมเกียรติ ยานยนต์',
    requesterRole: 'หัวหน้าช่าง',
    motorcycleModel: 'Wave 125i',
    licensePlate: '1กซ 7788 ภูเก็ต',
    requestedAt: '18/10/2023 09:15 น.',
    items: [
      { id: 1, partCode: 'BRK-002', partName: 'จานเบรก', quantity: 1, unit: 'ชุด', pricePerUnit: 850 },
    ],
  },
  {
    id: 11,
    requester: 'สมชาย รักดี',
    requesterRole: 'หัวหน้าช่าง',
    motorcycleModel: 'Wave 125i',
    licensePlate: '1กญ 9900 ขอนแก่น',
    requestedAt: '17/10/2023 14:00 น.',
    items: [
      { id: 1, partCode: 'TRN-005', partName: 'สเตอร์หน้า', quantity: 1, unit: 'ชิ้น', pricePerUnit: 180 },
      { id: 2, partCode: 'TRN-006', partName: 'สเตอร์หลัง', quantity: 1, unit: 'ชิ้น', pricePerUnit: 250 },
      { id: 3, partCode: 'TRN-007', partName: 'โซ่', quantity: 1, unit: 'เส้น', pricePerUnit: 400 },
    ],
  },
  {
    id: 12,
    requester: 'บุญมี มนตร์ทอง',
    requesterRole: 'หัวหน้าช่าง',
    motorcycleModel: 'PCX150',
    licensePlate: '1ขฆ 1357 อุดรธานี',
    requestedAt: '17/10/2023 11:00 น.',
    items: [
      { id: 1, partCode: 'CTL-002', partName: 'สายคันเร่ง', quantity: 1, unit: 'เส้น', pricePerUnit: 180 },
      { id: 2, partCode: 'CTL-005', partName: 'สวิตช์แฮนด์', quantity: 1, unit: 'ชิ้น', pricePerUnit: 850 },
    ],
  },
  {
    id: 13,
    requester: 'วิเชียร อ่านอยู่',
    requesterRole: 'หัวหน้าช่าง',
    motorcycleModel: 'Wave125i',
    licensePlate: '2กช 2468 กรุงเทพมหานคร',
    requestedAt: '16/10/2023 16:45 น.',
    items: [
      { id: 1, partCode: 'WHL-001', partName: 'ยางนอก', quantity: 2, unit: 'เส้น', pricePerUnit: 550 },
    ],
  },
  {
    id: 14,
    requester: 'สมเกียรติ ยานยนต์',
    requesterRole: 'หัวหน้าช่าง',
    motorcycleModel: 'PCX150',
    licensePlate: '1กด 3579 ปทุมธานี',
    requestedAt: '16/10/2023 08:20 น.',
    items: [
      { id: 1, partCode: 'BDP-001', partName: 'แฟริ่ง', quantity: 1, unit: 'ชิ้น', pricePerUnit: 3500 },
      { id: 2, partCode: 'BDP-005', partName: 'กระจกมองข้าง', quantity: 1, unit: 'ชิ้น', pricePerUnit: 250 },
    ],
  },
  {
    id: 15,
    requester: 'นิดา สุขเจริญ',
    requesterRole: 'ช่าง',
    motorcycleModel: 'Wave 110i',
    licensePlate: '1กต 4680 นครราชสีมา',
    requestedAt: '15/10/2023 13:10 น.',
    items: [
      { id: 1, partCode: 'TRN-008', partName: 'ชุดคลัตช์', quantity: 1, unit: 'เส้น', pricePerUnit: 1100 },
    ],
  },
  {
    id: 16,
    requester: 'อนุชิต พงศ์ไพร',
    requesterRole: 'หัวหน้าช่าง',
    motorcycleModel: 'PCX150',
    licensePlate: '1กถ 0246 ระยอง',
    requestedAt: '15/10/2023 10:00 น.',
    items: [
      { id: 1, partCode: 'FUL-004', partName: 'กรองน้ำมันเชื้อเพลิง', quantity: 1, unit: 'ชิ้น', pricePerUnit: 150 },
      { id: 2, partCode: 'ENG-006', partName: 'ปะเก็นเครื่อง', quantity: 2, unit: 'ชิ้น', pricePerUnit: 120 },
    ],
  },
  {
    id: 17,
    requester: 'วัชระ เกียรติจุน',
    requesterRole: 'ช่าง',
    motorcycleModel: 'ทุกรุ่น',
    licensePlate: '2กท 1212 สุราษฎร์ธานี',
    requestedAt: '14/10/2023 14:30 น.',
    items: [
      { id: 1, partCode: 'BRK-003', partName: 'ปั๊มเบรก', quantity: 1, unit: 'ชุด', pricePerUnit: 1200 },
      { id: 2, partCode: 'BRK-005', partName: 'สายเบรก', quantity: 2, unit: 'เส้น', pricePerUnit: 250 },
    ],
  },
  {
    id: 18,
    requester: 'พลภัทร เสียงเพราะ',
    requesterRole: 'ช่าง',
    motorcycleModel: 'PCX150',
    licensePlate: '1กธ 3434 สมุทรปราการ',
    requestedAt: '14/10/2023 09:45 น.',
    items: [
      { id: 1, partCode: 'ELE-019', partName: 'ไดชาร์จ', quantity: 1, unit: 'ชิ้น', pricePerUnit: 1200 },
      { id: 2, partCode: 'ELE-001', partName: 'แบตเตอรี่', quantity: 1, unit: 'ลูก', pricePerUnit: 650 },
    ],
  },
  {
    id: 19,
    requester: 'สมเกียรติ ยานยนต์',
    requesterRole: 'หัวหน้าช่าง',
    motorcycleModel: 'Wave 125i',
    licensePlate: '1กน 5656 ชัยภูมิ',
    requestedAt: '13/10/2023 16:00 น.',
    items: [
      { id: 1, partCode: 'ELE-003', partName: 'คอยล์จุดระเบิด', quantity: 1, unit: 'ชิ้น', pricePerUnit: 550 },
      { id: 2, partCode: 'ELE-006', partName: 'รีเลย์', quantity: 2, unit: 'ชิ้น', pricePerUnit: 150 },
    ],
  },
  {
    id: 20,
    requester: 'สมชาย รักดี',
    requesterRole: 'หัวหน้าช่าง',
    motorcycleModel: 'Wave 125i',
    licensePlate: '1กบ 7878 เชียงราย',
    requestedAt: '13/10/2023 11:15 น.',
    items: [
      { id: 1, partCode: 'BDP-004', partName: 'เบาะ', quantity: 1, unit: 'ใบ', pricePerUnit: 850 },
      { id: 2, partCode: 'BDP-002', partName: 'บังโคลน', quantity: 1, unit: 'ชิ้น', pricePerUnit: 450 },
    ],
  },
  {
    id: 21,
    requester: 'บุญมี มนตร์ทอง',
    requesterRole: 'หัวหน้าช่าง',
    motorcycleModel: 'Scoopy i',
    licensePlate: '1กป 9090 อยุธยา',
    requestedAt: '12/10/2023 13:45 น.',
    items: [
      { id: 1, partCode: 'CTL-003', partName: 'มือเบรก', quantity: 2, unit: 'ชิ้น', pricePerUnit: 200 },
      { id: 2, partCode: 'CTL-001', partName: 'คันเร่ง', quantity: 1, unit: 'ชิ้น', pricePerUnit: 350 },
    ],
  },
  {
    id: 22,
    requester: 'วิเชียร อ่านอยู่',
    requesterRole: 'หัวหน้าช่าง',
    motorcycleModel: 'ทุกรุ่น',
    licensePlate: '2กผ 1123 พะเยา',
    requestedAt: '12/10/2023 10:30 น.',
    items: [
      { id: 1, partCode: 'TRN-004', partName: 'โซ่ราวลิ้น', quantity: 1, unit: 'เส้น', pricePerUnit: 300 },
    ],
  },
  {
    id: 23,
    requester: 'สมเกียรติ ยานยนต์',
    requesterRole: 'หัวหน้าช่าง',
    motorcycleModel: 'ทุกรุ่นซี่ลวด',
    licensePlate: '1กฝ 4567 สระบุรี',
    requestedAt: '11/10/2023 15:00 น.',
    items: [
      { id: 1, partCode: 'WHL-003', partName: 'วงล้อ', quantity: 2, unit: 'วง', pricePerUnit: 800 },
      { id: 2, partCode: 'WHL-005', partName: 'ซี่ลวด', quantity: 50, unit: 'ชิ้น', pricePerUnit: 200 },
    ],
  },
  {
    id: 24,
    requester: 'นิดา สุขเจริญ',
    requesterRole: 'ช่าง',
    motorcycleModel: 'Wave 125i',
    licensePlate: '1กพ 8901 นครปฐม',
    requestedAt: '11/10/2023 09:20 น.',
    items: [
      { id: 1, partCode: 'SUS-004', partName: 'ลูกปืนล้อ', quantity: 4, unit: 'ชิ้น', pricePerUnit: 150 },
      { id: 2, partCode: 'SUS-001', partName: 'โช๊คหน้า', quantity: 1, unit: 'ชุด', pricePerUnit: 2500 },
    ],
  },
  {
    id: 25,
    requester: 'อนุชิต พงศ์ไพร',
    requesterRole: 'หัวหน้าช่าง',
    motorcycleModel: 'PCX150',
    licensePlate: '1กฟ 3456 สิงห์บุรี',
    requestedAt: '10/10/2023 14:10 น.',
    items: [
      { id: 1, partCode: 'ELE-005', partName: 'ไดชาร์จ', quantity: 1, unit: 'ชิ้น', pricePerUnit: 1200 },
      { id: 2, partCode: 'ELE-007', partName: 'ฟิวส์', quantity: 5, unit: 'ชิ้น', pricePerUnit: 20 },
    ],
  },
  {
    id: 26,
    requester: 'วัชระ เกียรติจุน',
    requesterRole: 'ช่าง',
    motorcycleModel: 'รถออโตเมติก',
    licensePlate: '2กม 7891 สมุทรสาคร',
    requestedAt: '10/10/2023 11:00 น.',
    items: [
      { id: 1, partCode: 'TRN-001', partName: 'ชุดคลัตช์', quantity: 1, unit: 'ชุด', pricePerUnit: 1100 },
      { id: 2, partCode: 'CON-004', partName: 'น้ำมันเกียร์', quantity: 2, unit: 'กระป๋อง', pricePerUnit: 180 },
    ],
  },
]
