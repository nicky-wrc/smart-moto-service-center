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
    licensePlate: '1กข 1234 กรุงเทพมหานคร',
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
    licensePlate: '2กค 5678 ฉะเชิงเทรา',
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
    licensePlate: '1ขข 9999 นนทบุรี',
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
    licensePlate: '1กง 1111 เชียงใหม่',
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
    licensePlate: '1กจ 2345 สกลนคร',
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
    licensePlate: '1กฉ 7890 กรุงเทพมหานคร',
    requestedAt: '20/10/2023 08:30 น.',
    items: [
      { id: 1, partCode: 'CB5-001', partName: 'โซ่ 530x104', quantity: 1, unit: 'เส้น', pricePerUnit: 1100 },
      { id: 2, partCode: 'CB5-002', partName: 'สเตอร์หน้า 15T', quantity: 1, unit: 'ชิ้น', pricePerUnit: 280 },
      { id: 3, partCode: 'CB5-003', partName: 'สเตอร์หลัง 42T', quantity: 1, unit: 'ชิ้น', pricePerUnit: 480 },
    ],
  },
  {
    id: 7,
    requester: 'วัชระ เกียรติจุน',
    requesterRole: 'ช่าง',
    motorcycleModel: 'Yamaha Aerox 155',
    licensePlate: '2กง 1122 ชลบุรี',
    requestedAt: '19/10/2023 15:20 น.',
    items: [
      { id: 1, partCode: 'YA-001', partName: 'ชุดแฟริ่งหน้า', quantity: 1, unit: 'ชุด', pricePerUnit: 2500 },
      { id: 2, partCode: 'YA-002', partName: 'ไฟเลี้ยวซ้าย', quantity: 1, unit: 'ชิ้น', pricePerUnit: 350 },
    ],
  },
  {
    id: 8,
    requester: 'พลภัทร เสียงเพราะ',
    requesterRole: 'ช่าง',
    motorcycleModel: 'Honda Scoopy i',
    licensePlate: '1กช 3344 นครปฐม',
    requestedAt: '19/10/2023 10:10 น.',
    items: [
      { id: 1, partCode: 'HS-001', partName: 'สายไมล์', quantity: 1, unit: 'เส้น', pricePerUnit: 180 },
      { id: 2, partCode: 'HS-002', partName: 'หลอดไฟหน้า LED', quantity: 1, unit: 'หลอด', pricePerUnit: 450 },
    ],
  },
  {
    id: 9,
    requester: 'สมเกียรติ ยานยนต์',
    requesterRole: 'หัวหน้าช่าง',
    motorcycleModel: 'Kawasaki Ninja 400',
    licensePlate: '2ขค 5566 สงขลา',
    requestedAt: '18/10/2023 11:30 น.',
    items: [
      { id: 1, partCode: 'KN-001', partName: 'กรองน้ำมันเครื่องแต่ง', quantity: 1, unit: 'ชิ้น', pricePerUnit: 600 },
      { id: 2, partCode: 'KN-002', partName: 'น้ำมันเครื่อง G3', quantity: 3, unit: 'ขวด', pricePerUnit: 350 },
    ],
  },
  {
    id: 10,
    requester: 'สมเกียรติ ยานยนต์',
    requesterRole: 'หัวหน้าช่าง',
    motorcycleModel: 'Yamaha XMAX 300',
    licensePlate: '1กซ 7788 ภูเก็ต',
    requestedAt: '18/10/2023 09:15 น.',
    items: [
      { id: 1, partCode: 'XM-001', partName: 'ผ้าเบรกหลัง', quantity: 1, unit: 'ชุด', pricePerUnit: 480 },
    ],
  },
  {
    id: 11,
    requester: 'สมชาย รักดี',
    requesterRole: 'หัวหน้าช่าง',
    motorcycleModel: 'Honda Wave 125i',
    licensePlate: '1กญ 9900 ขอนแก่น',
    requestedAt: '17/10/2023 14:00 น.',
    items: [
      { id: 1, partCode: 'HW125-001', partName: 'สเตอร์ชุด', quantity: 1, unit: 'ชุด', pricePerUnit: 850 },
      { id: 2, partCode: 'HW125-002', partName: 'โซ่ 428', quantity: 1, unit: 'เส้น', pricePerUnit: 350 },
    ],
  },
  {
    id: 12,
    requester: 'บุญมี มนตร์ทอง',
    requesterRole: 'หัวหน้าช่าง',
    motorcycleModel: 'Vespa GTS 300',
    licensePlate: '1ขฆ 1357 อุดรธานี',
    requestedAt: '17/10/2023 11:00 น.',
    items: [
      { id: 1, partCode: 'VP-001', partName: 'สายคันเร่งตัว Y', quantity: 1, unit: 'เส้น', pricePerUnit: 1200 },
    ],
  },
  {
    id: 13,
    requester: 'วิเชียร อ่านอยู่',
    requesterRole: 'หัวหน้าช่าง',
    motorcycleModel: 'Yamaha Grand Filano',
    licensePlate: '2กช 2468 กรุงเทพมหานคร',
    requestedAt: '16/10/2023 16:45 น.',
    items: [
      { id: 1, partCode: 'YGF-001', partName: 'ยางนอก 110/70', quantity: 2, unit: 'เส้น', pricePerUnit: 980 },
    ],
  },
  {
    id: 14,
    requester: 'สมเกียรติ ยานยนต์',
    requesterRole: 'หัวหน้าช่าง',
    motorcycleModel: 'Honda ADV 160',
    licensePlate: '1กด 3579 ปทุมธานี',
    requestedAt: '16/10/2023 08:20 น.',
    items: [
      { id: 1, partCode: 'HAD-001', partName: 'ชิวหน้า', quantity: 1, unit: 'ชิ้น', pricePerUnit: 1500 },
      { id: 2, partCode: 'HAD-002', partName: 'กระจกมองข้างซ้าย', quantity: 1, unit: 'ชิ้น', pricePerUnit: 450 },
    ],
  },
  {
    id: 15,
    requester: 'นิดา สุขเจริญ',
    requesterRole: 'ช่าง',
    motorcycleModel: 'GPX Demon GR200R',
    licensePlate: '1กต 4680 นครราชสีมา',
    requestedAt: '15/10/2023 13:10 น.',
    items: [
      { id: 1, partCode: 'GPX-001', partName: 'สายคลัตช์', quantity: 1, unit: 'เส้น', pricePerUnit: 320 },
    ],
  },
  {
    id: 16,
    requester: 'อนุชิต พงศ์ไพร',
    requesterRole: 'หัวหน้าช่าง',
    motorcycleModel: 'Honda LEAD 125',
    licensePlate: '1กถ 0246 ระยอง',
    requestedAt: '15/10/2023 10:00 น.',
    items: [
      { id: 1, partCode: 'HL-001', partName: 'ไส้กรองอากาศแต่ง', quantity: 1, unit: 'ชิ้น', pricePerUnit: 550 },
    ],
  },
  {
    id: 17,
    requester: 'วัชระ เกียรติจุน',
    requesterRole: 'ช่าง',
    motorcycleModel: 'Yamaha MT-15',
    licensePlate: '2กท 1212 สุราษฎร์ธานี',
    requestedAt: '14/10/2023 14:30 น.',
    items: [
      { id: 1, partCode: 'YMT-001', partName: 'ปั๊มเบรกบน', quantity: 1, unit: 'ชุด', pricePerUnit: 1800 },
    ],
  },
  {
    id: 18,
    requester: 'พลภัทร เสียงเพราะ',
    requesterRole: 'ช่าง',
    motorcycleModel: 'Honda Forza 350',
    licensePlate: '1กธ 3434 สมุทรปราการ',
    requestedAt: '14/10/2023 09:45 น.',
    items: [
      { id: 1, partCode: 'HF-001', partName: 'แผ่นชาร์จไฟ', quantity: 1, unit: 'ชิ้น', pricePerUnit: 2200 },
      { id: 2, partCode: 'HF-002', partName: 'แบตเตอรี่', quantity: 1, unit: 'ลูก', pricePerUnit: 2500 },
    ],
  },
  {
    id: 19,
    requester: 'สมเกียรติ ยานยนต์',
    requesterRole: 'หัวหน้าช่าง',
    motorcycleModel: 'Royal Enfield Hunter 350',
    licensePlate: '1กน 5656 ชัยภูมิ',
    requestedAt: '13/10/2023 16:00 น.',
    items: [
      { id: 1, partCode: 'RE-001', partName: 'สวิตช์กุญแจ', quantity: 1, unit: 'ชุด', pricePerUnit: 3500 },
    ],
  },
  {
    id: 20,
    requester: 'สมชาย รักดี',
    requesterRole: 'หัวหน้าช่าง',
    motorcycleModel: 'Yamaha Fazzio',
    licensePlate: '1กบ 7878 เชียงราย',
    requestedAt: '13/10/2023 11:15 น.',
    items: [
      { id: 1, partCode: 'YFZ-001', partName: 'เบาะรองนั่ง', quantity: 1, unit: 'ใบ', pricePerUnit: 850 },
    ],
  },
  {
    id: 21,
    requester: 'บุญมี มนตร์ทอง',
    requesterRole: 'หัวหน้าช่าง',
    motorcycleModel: 'Honda Giorno+',
    licensePlate: '1กป 9090 อยุธยา',
    requestedAt: '12/10/2023 13:45 น.',
    items: [
      { id: 1, partCode: 'HG-001', partName: 'พักเท้าหลังซ้าย', quantity: 1, unit: 'ชิ้น', pricePerUnit: 250 },
      { id: 2, partCode: 'HG-002', partName: 'พักเท้าหลังขวา', quantity: 1, unit: 'ชิ้น', pricePerUnit: 250 },
    ],
  },
  {
    id: 22,
    requester: 'วิเชียร อ่านอยู่',
    requesterRole: 'หัวหน้าช่าง',
    motorcycleModel: 'Yamaha R15',
    licensePlate: '2กผ 1123 พะเยา',
    requestedAt: '12/10/2023 10:30 น.',
    items: [
      { id: 1, partCode: 'YR-001', partName: 'โซ่ราวลิ้น', quantity: 1, unit: 'เส้น', pricePerUnit: 450 },
    ],
  },
  {
    id: 23,
    requester: 'สมเกียรติ ยานยนต์',
    requesterRole: 'หัวหน้าช่าง',
    motorcycleModel: 'Kawasaki KLX230',
    licensePlate: '1กฝ 4567 สระบุรี',
    requestedAt: '11/10/2023 15:00 น.',
    items: [
      { id: 1, partCode: 'KKL-001', partName: 'ยางหนาม 21 นิ้ว', quantity: 1, unit: 'เส้น', pricePerUnit: 1800 },
      { id: 2, partCode: 'KKL-002', partName: 'ยางหนาม 18 นิ้ว', quantity: 1, unit: 'เส้น', pricePerUnit: 2100 },
    ],
  },
  {
    id: 24,
    requester: 'นิดา สุขเจริญ',
    requesterRole: 'ช่าง',
    motorcycleModel: 'Honda Super Cub',
    licensePlate: '1กพ 8901 นครปฐม',
    requestedAt: '11/10/2023 09:20 น.',
    items: [
      { id: 1, partCode: 'HSC-001', partName: 'ตระกร้าหน้า', quantity: 1, unit: 'ใบ', pricePerUnit: 350 },
    ],
  },
  {
    id: 25,
    requester: 'อนุชิต พงศ์ไพร',
    requesterRole: 'หัวหน้าช่าง',
    motorcycleModel: 'Yamaha XSR155',
    licensePlate: '1กฟ 3456 สิงห์บุรี',
    requestedAt: '10/10/2023 14:10 น.',
    items: [
      { id: 1, partCode: 'YXSR-001', partName: 'ไฟท้าย LED', quantity: 1, unit: 'ชุด', pricePerUnit: 1250 },
    ],
  },
  {
    id: 26,
    requester: 'วัชระ เกียรติจุน',
    requesterRole: 'ช่าง',
    motorcycleModel: 'Suzuki Burgman 400',
    licensePlate: '2กม 7891 สมุทรสาคร',
    requestedAt: '10/10/2023 11:00 น.',
    items: [
      { id: 1, partCode: 'SB-001', partName: 'สายพาน V-Belt', quantity: 1, unit: 'เส้น', pricePerUnit: 2800 },
      { id: 2, partCode: 'SB-002', partName: 'เม็ดตุ้มเหลี่ยม', quantity: 8, unit: 'ชิ้น', pricePerUnit: 120 },
    ],
  },
]
