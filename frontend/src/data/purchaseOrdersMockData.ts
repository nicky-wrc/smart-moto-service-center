import type { PartItem } from './partsMockData'

export type POStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled'

export interface PurchaseOrder {
    id: string
    supplierId: number
    supplierName: string
    createdAt: string
    deliveryDate: string
    totalAmount: number
    status: POStatus
    items: POItem[]
    remarks?: string
    managerMessage?: string
}

export interface POItem extends PartItem {
    orderQuantity: number
}

// Helper to format date
const formatDate = (date: Date) => date.toISOString().split('T')[0]

const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(tomorrow.getDate() + 1)
const nextWeek = new Date(today)
nextWeek.setDate(nextWeek.getDate() + 7)

export const mockPurchaseOrders: PurchaseOrder[] = [
    {
        id: 'PO-20260309-001',
        supplierId: 1,
        supplierName: 'บริษัท ฮอนด้า มอเตอร์ จำกัด',
        createdAt: formatDate(today),
        deliveryDate: formatDate(tomorrow),
        totalAmount: 4500,
        status: 'draft',
        items: [
            {
                id: 1,
                partCode: 'PT-001',
                name: 'หัวเทียน (Spark Plug) NGK',
                category: 'Engine',
                location: 'A1-01',
                quantity: 45,
                price: 150,
                imageUrl: 'https://placehold.co/100x100/e2e8f0/94a3b8.png?text=Spark+Plug',
                orderQuantity: 30
            }
        ]
    },
    {
        id: 'PO-20260308-002',
        supplierId: 2,
        supplierName: 'ยามาฮ่า พาร์ท เซ็นเตอร์',
        createdAt: '2026-03-08',
        deliveryDate: formatDate(nextWeek),
        totalAmount: 12500,
        status: 'pending',
        items: [
            {
                id: 2,
                partCode: 'PT-002',
                name: 'ผ้าเบรคหน้า (Front Brake Pad)',
                category: 'Brakes',
                location: 'C1-12',
                quantity: 12,
                price: 350,
                imageUrl: 'https://placehold.co/100x100/e2e8f0/94a3b8.png?text=Brake+Pad',
                orderQuantity: 20
            },
            {
                id: 4,
                partCode: 'PT-004',
                name: 'แบตเตอรี่ 12V (Battery)',
                category: 'Electrical',
                location: 'A4-01',
                quantity: 8,
                price: 550,
                imageUrl: 'https://placehold.co/100x100/e2e8f0/94a3b8.png?text=Battery',
                orderQuantity: 10
            }
        ]
    },
    {
        id: 'PO-20260305-001',
        supplierId: 3,
        supplierName: 'ซูซูกิ อะไหล่ยนต์',
        createdAt: '2026-03-05',
        deliveryDate: '2026-03-07',
        totalAmount: 1800,
        status: 'approved',
        items: [
            {
                id: 5,
                partCode: 'PT-005',
                name: 'ไส้กรองอากาศ (Air Filter)',
                category: 'Engine',
                location: 'B1-08',
                quantity: 25,
                price: 120,
                imageUrl: 'https://placehold.co/100x100/e2e8f0/94a3b8.png?text=Air+Filter',
                orderQuantity: 15
            }
        ],
        managerMessage: 'อนุมัติเรียบร้อย ให้เร่งติดตามของชิ้นนี้ด่วน'
    },
    {
        id: 'PO-20260301-003',
        supplierId: 1,
        supplierName: 'บริษัท ฮอนด้า มอเตอร์ จำกัด',
        createdAt: '2026-03-01',
        deliveryDate: '2026-03-15',
        totalAmount: 85000,
        status: 'rejected',
        items: [
            {
                id: 6,
                partCode: 'PT-006',
                name: 'ยางล้อหน้า 70/90-17',
                category: 'Wheels',
                location: 'A1-02',
                quantity: 30,
                price: 850,
                imageUrl: 'https://placehold.co/100x100/e2e8f0/94a3b8.png?text=Front+Tire',
                orderQuantity: 100
            }
        ],
        managerMessage: 'งบประมาณเดือนนี้เต็มแล้ว ให้ขอเบิกเดือนหน้า'
    },
    {
        id: 'PO-20260228-001',
        supplierId: 2,
        supplierName: 'ยามาฮ่า พาร์ท เซ็นเตอร์',
        createdAt: '2026-02-28',
        deliveryDate: '2026-03-05',
        totalAmount: 7200,
        status: 'approved',
        items: [
            {
                id: 3,
                partCode: 'PT-003',
                name: 'โซ่ขับเคลื่อน 428H',
                category: 'Drivetrain',
                location: 'B2-05',
                quantity: 10,
                price: 360,
                imageUrl: 'https://placehold.co/100x100/e2e8f0/94a3b8.png?text=Chain',
                orderQuantity: 20
            }
        ]
    },
    {
        id: 'PO-20260225-002',
        supplierId: 3,
        supplierName: 'ซูซูกิ อะไหล่ยนต์',
        createdAt: '2026-02-25',
        deliveryDate: '2026-03-02',
        totalAmount: 3600,
        status: 'cancelled',
        items: [
            {
                id: 7,
                partCode: 'PT-007',
                name: 'น้ำมันเครื่อง 10W-40 (1L)',
                category: 'Lubricants',
                location: 'D1-01',
                quantity: 48,
                price: 180,
                imageUrl: 'https://placehold.co/100x100/e2e8f0/94a3b8.png?text=Oil',
                orderQuantity: 20
            }
        ]
    },
    {
        id: 'PO-20260220-004',
        supplierId: 1,
        supplierName: 'บริษัท ฮอนด้า มอเตอร์ จำกัด',
        createdAt: '2026-02-20',
        deliveryDate: '2026-02-27',
        totalAmount: 9900,
        status: 'approved',
        items: [
            {
                id: 8,
                partCode: 'PT-008',
                name: 'ไส้กรองน้ำมันเครื่อง',
                category: 'Engine',
                location: 'B1-09',
                quantity: 22,
                price: 90,
                imageUrl: 'https://placehold.co/100x100/e2e8f0/94a3b8.png?text=Oil+Filter',
                orderQuantity: 110
            }
        ]
    },
    {
        id: 'PO-20260215-005',
        supplierId: 2,
        supplierName: 'ยามาฮ่า พาร์ท เซ็นเตอร์',
        createdAt: '2026-02-15',
        deliveryDate: '2026-02-22',
        totalAmount: 14500,
        status: 'pending',
        items: [
            {
                id: 9,
                partCode: 'PT-009',
                name: 'สายไฟชุดเมนด้านหน้า',
                category: 'Electrical',
                location: 'A4-05',
                quantity: 5,
                price: 2900,
                imageUrl: 'https://placehold.co/100x100/e2e8f0/94a3b8.png?text=Wiring',
                orderQuantity: 5
            }
        ]
    },
    {
        id: 'PO-20260210-006',
        supplierId: 3,
        supplierName: 'ซูซูกิ อะไหล่ยนต์',
        createdAt: '2026-02-10',
        deliveryDate: '2026-02-17',
        totalAmount: 5400,
        status: 'draft',
        items: [
            {
                id: 10,
                partCode: 'PT-010',
                name: 'ผ้าเบรคหลัง (Rear Brake Pad)',
                category: 'Brakes',
                location: 'C1-13',
                quantity: 9,
                price: 300,
                imageUrl: 'https://placehold.co/100x100/e2e8f0/94a3b8.png?text=Rear+Brake',
                orderQuantity: 18
            }
        ]
    },
    {
        id: 'PO-20260205-007',
        supplierId: 1,
        supplierName: 'บริษัท ฮอนด้า มอเตอร์ จำกัด',
        createdAt: '2026-02-05',
        deliveryDate: '2026-02-12',
        totalAmount: 22000,
        status: 'approved',
        items: [
            {
                id: 11,
                partCode: 'PT-011',
                name: 'คลัตช์ชุด (Clutch Kit)',
                category: 'Drivetrain',
                location: 'B2-10',
                quantity: 4,
                price: 2200,
                imageUrl: 'https://placehold.co/100x100/e2e8f0/94a3b8.png?text=Clutch',
                orderQuantity: 10
            }
        ]
    },
        {
        id: 'PO-20260205-007',
        supplierId: 1,
        supplierName: 'บริษัท ฮอนด้า มอเตอร์ จำกัด',
        createdAt: '2026-02-05',
        deliveryDate: '2026-02-12',
        totalAmount: 22000,
        status: 'approved',
        items: [
            {
                id: 12,
                partCode: 'PT-011',
                name: 'คลัตช์ชุด (Clutch Kit)',
                category: 'Drivetrain',
                location: 'B2-10',
                quantity: 4,
                price: 2200,
                imageUrl: 'https://placehold.co/100x100/e2e8f0/94a3b8.png?text=Clutch',
                orderQuantity: 10
            }
        ]
    },
        {
        id: 'PO-20260205-007',
        supplierId: 1,
        supplierName: 'บริษัท ฮอนด้า มอเตอร์ จำกัด',
        createdAt: '2026-02-05',
        deliveryDate: '2026-02-12',
        totalAmount: 22000,
        status: 'approved',
        items: [
            {
                id: 13,
                partCode: 'PT-011',
                name: 'คลัตช์ชุด (Clutch Kit)',
                category: 'Drivetrain',
                location: 'B2-10',
                quantity: 4,
                price: 2200,
                imageUrl: 'https://placehold.co/100x100/e2e8f0/94a3b8.png?text=Clutch',
                orderQuantity: 10
            }
        ]
    },
        {
        id: 'PO-20260205-007',
        supplierId: 1,
        supplierName: 'บริษัท ฮอนด้า มอเตอร์ จำกัด',
        createdAt: '2026-02-05',
        deliveryDate: '2026-02-12',
        totalAmount: 22000,
        status: 'approved',
        items: [
            {
                id: 14,
                partCode: 'PT-011',
                name: 'คลัตช์ชุด (Clutch Kit)',
                category: 'Drivetrain',
                location: 'B2-10',
                quantity: 4,
                price: 2200,
                imageUrl: 'https://placehold.co/100x100/e2e8f0/94a3b8.png?text=Clutch',
                orderQuantity: 10
            }
        ]
    },
        {
        id: 'PO-20260205-007',
        supplierId: 1,
        supplierName: 'บริษัท ฮอนด้า มอเตอร์ จำกัด',
        createdAt: '2026-02-05',
        deliveryDate: '2026-02-12',
        totalAmount: 22000,
        status: 'approved',
        items: [
            {
                id: 15,
                partCode: 'PT-011',
                name: 'คลัตช์ชุด (Clutch Kit)',
                category: 'Drivetrain',
                location: 'B2-10',
                quantity: 4,
                price: 2200,
                imageUrl: 'https://placehold.co/100x100/e2e8f0/94a3b8.png?text=Clutch',
                orderQuantity: 10
            }
        ]
    },
        {
        id: 'PO-20260205-007',
        supplierId: 1,
        supplierName: 'บริษัท ฮอนด้า มอเตอร์ จำกัด',
        createdAt: '2026-02-05',
        deliveryDate: '2026-02-12',
        totalAmount: 22000,
        status: 'approved',
        items: [
            {
                id: 16,
                partCode: 'PT-011',
                name: 'คลัตช์ชุด (Clutch Kit)',
                category: 'Drivetrain',
                location: 'B2-10',
                quantity: 4,
                price: 2200,
                imageUrl: 'https://placehold.co/100x100/e2e8f0/94a3b8.png?text=Clutch',
                orderQuantity: 10
            }
        ]
    },
]
