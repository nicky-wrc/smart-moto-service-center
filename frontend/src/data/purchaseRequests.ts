export type ReqStatus = 'รออนุมัติ' | 'อนุมัติแล้ว' | 'ปฏิเสธ'

export type POItem = {
  code: string
  name: string
  unit: string
  unitPrice: number
  qty: number
}

export type PurchaseRequest = {
  id: number
  requestNo: string
  requestedBy: string
  requestedAt: string
  supplier: string
  orderDate: string
  expectedDate: string
  reason: string
  items: POItem[]
  discount: number
  status: ReqStatus
  approvedBy?: string
  approvedAt?: string
  rejectNote?: string
}

export const TAX_RATE = 0.07

export function calcTotals(req: PurchaseRequest) {
  const subtotal  = req.items.reduce((s, i) => s + i.unitPrice * i.qty, 0)
  const afterDisc = subtotal - req.discount
  const tax       = Math.round(afterDisc * TAX_RATE)
  const grand     = afterDisc + tax
  return { subtotal, tax, grand }
}

export const initialRequests: PurchaseRequest[] = [
  {
    id: 1, requestNo: 'PO-2026-001', requestedBy: 'บอย สต๊อกเก่ง',
    requestedAt: '08/03/2026', supplier: 'บริษัท เจริญอะไหล่ จำกัด',
    orderDate: '08/03/2026', expectedDate: '12/03/2026',
    reason: 'สต๊อกผ้าเบรกใกล้หมด เหลือ 2 ชุด ต้องสั่งเพิ่มเพื่อรองรับงานสัปดาห์หน้า',
    discount: 0, status: 'รออนุมัติ',
    items: [
      { code: 'BRK-001', name: 'ผ้าเบรกหน้า Honda PCX', unit: 'ชุด', unitPrice: 280, qty: 10 },
      { code: 'BRK-002', name: 'ผ้าเบรกหลัง Honda PCX', unit: 'ชุด', unitPrice: 250, qty: 8  },
    ],
  },
  {
    id: 2, requestNo: 'PO-2026-002', requestedBy: 'บอย สต๊อกเก่ง',
    requestedAt: '07/03/2026', supplier: 'ห้างหุ้นส่วน น้ำมันดี',
    orderDate: '07/03/2026', expectedDate: '09/03/2026',
    reason: 'น้ำมันเครื่องหมดสต๊อก มีงานรองรับแล้ว 5 คัน ต้องเติมด่วน',
    discount: 200, status: 'อนุมัติแล้ว', approvedBy: 'เจ้าของร้าน', approvedAt: '07/03/2026',
    items: [
      { code: 'OIL-001', name: 'น้ำมันเครื่อง 10W-40 (1L)', unit: 'ขวด', unitPrice: 120, qty: 24 },
      { code: 'OIL-002', name: 'น้ำมันเครื่อง 20W-50 (1L)', unit: 'ขวด', unitPrice: 110, qty: 12 },
    ],
  },
  {
    id: 3, requestNo: 'PO-2026-003', requestedBy: 'บอย สต๊อกเก่ง',
    requestedAt: '06/03/2026', supplier: 'บริษัท ยามาฮ่าอะไหล่',
    orderDate: '06/03/2026', expectedDate: '10/03/2026',
    reason: 'สายพาน NMAX เหลือ 1 เส้น และมีงานรออยู่ 2 คัน',
    discount: 0, status: 'ปฏิเสธ', approvedBy: 'เจ้าของร้าน', approvedAt: '06/03/2026',
    rejectNote: 'รอตรวจสอบราคากับซัพพลายเออร์รายอื่นก่อน',
    items: [
      { code: 'BLT-001', name: 'สายพาน Yamaha NMAX', unit: 'เส้น', unitPrice: 380, qty: 5 },
    ],
  },
  {
    id: 4, requestNo: 'PO-2026-004', requestedBy: 'บอย สต๊อกเก่ง',
    requestedAt: '09/03/2026', supplier: 'บริษัท เจริญอะไหล่ จำกัด',
    orderDate: '09/03/2026', expectedDate: '13/03/2026',
    reason: 'หัวเทียนและไส้กรองอากาศใกล้หมด คาดว่าจะใช้หมดภายใน 3 วัน',
    discount: 150, status: 'รออนุมัติ',
    items: [
      { code: 'SPK-001', name: 'หัวเทียน NGK CR7E',        unit: 'หัว',  unitPrice: 85, qty: 20 },
      { code: 'FLT-001', name: 'ไส้กรองอากาศ Honda Wave', unit: 'ชิ้น', unitPrice: 95, qty: 12 },
      { code: 'FLT-002', name: 'ไส้กรองน้ำมัน',           unit: 'ชิ้น', unitPrice: 60, qty: 15 },
    ],
  },
  {
    id: 5, requestNo: 'PO-2026-005', requestedBy: 'บอย สต๊อกเก่ง',
    requestedAt: '05/03/2026', supplier: 'ห้างหุ้นส่วน ไฟฟ้ามอเตอร์',
    orderDate: '05/03/2026', expectedDate: '08/03/2026',
    reason: 'แบตเตอรี่เหลือ 1 ก้อน ต้องสั่งรักษาระดับสต๊อกขั้นต่ำ',
    discount: 0, status: 'อนุมัติแล้ว', approvedBy: 'เจ้าของร้าน', approvedAt: '05/03/2026',
    items: [
      { code: 'BAT-001', name: 'แบตเตอรี่ 12V 5Ah', unit: 'ก้อน', unitPrice: 550, qty: 4 },
    ],
  },
  {
    id: 6, requestNo: 'PO-2026-006', requestedBy: 'บอย สต๊อกเก่ง',
    requestedAt: '09/03/2026', supplier: 'บริษัท เจริญอะไหล่ จำกัด',
    orderDate: '09/03/2026', expectedDate: '14/03/2026',
    reason: 'รวบรวมรายการสินค้าที่ใกล้หมดหลายรายการในออเดอร์เดียวเพื่อประหยัดค่าจัดส่ง คาดว่าจะใช้หมดภายใน 1-2 สัปดาห์หากมีงานเข้าตามแผน',
    discount: 500, status: 'รออนุมัติ',
    items: [
      { code: 'BRK-001', name: 'ผ้าเบรกหน้า Honda PCX',     unit: 'ชุด',  unitPrice: 280, qty: 10 },
      { code: 'BRK-002', name: 'ผ้าเบรกหลัง Honda PCX',     unit: 'ชุด',  unitPrice: 250, qty: 10 },
      { code: 'BRK-003', name: 'ผ้าเบรกหน้า Yamaha NMAX',   unit: 'ชุด',  unitPrice: 310, qty: 6  },
      { code: 'OIL-001', name: 'น้ำมันเครื่อง 10W-40 (1L)', unit: 'ขวด', unitPrice: 120, qty: 24 },
      { code: 'OIL-002', name: 'น้ำมันเครื่อง 20W-50 (1L)', unit: 'ขวด', unitPrice: 110, qty: 12 },
      { code: 'OIL-003', name: 'น้ำมันเบรก DOT3 (500ml)',    unit: 'ขวด', unitPrice: 95,  qty: 10 },
      { code: 'SPK-001', name: 'หัวเทียน NGK CR7E',          unit: 'หัว',  unitPrice: 85,  qty: 20 },
      { code: 'SPK-002', name: 'หัวเทียน Denso U22FSR-U',    unit: 'หัว',  unitPrice: 90,  qty: 12 },
      { code: 'FLT-001', name: 'ไส้กรองอากาศ Honda Wave',   unit: 'ชิ้น', unitPrice: 95,  qty: 10 },
      { code: 'FLT-002', name: 'ไส้กรองน้ำมัน',             unit: 'ชิ้น', unitPrice: 60,  qty: 15 },
      { code: 'BLT-001', name: 'สายพาน Yamaha NMAX',         unit: 'เส้น', unitPrice: 380, qty: 4  },
      { code: 'CHN-001', name: 'โซ่ขับเคลื่อน 428H',        unit: 'เส้น', unitPrice: 420, qty: 3  },
    ],
  },
]
