export interface PartItem {
    id: number
    partCode: string
    name: string
    category: string
    location: string
    quantity: number
    price: number
    imageUrl: string
}

export const mockParts: PartItem[] = [
    {
        id: 1,
        partCode: "TYR-001",
        name: "ยางนอก 70/90-17 IRC",
        category: "ยาง",
        location: "A1-01",
        quantity: 25,
        price: 550,
        imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Tire+70/90"
    },
    {
        id: 2,
        partCode: "OIL-002",
        name: "น้ำมันเครื่อง Motul 10W-40 1L",
        category: "น้ำมันเครื่อง",
        location: "B2-04",
        quantity: 8,
        price: 350,
        imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Engine+Oil"
    },
    {
        id: 3,
        partCode: "BRK-003",
        name: "ผ้าเบรคหน้า PCX150",
        category: "เบรค",
        location: "C1-12",
        quantity: 50,
        price: 320,
        imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Brake+Pads"
    },
    {
        id: 4,
        partCode: "LGT-004",
        name: "หลอดไฟหน้า LED H4 12V",
        category: "ระบบไฟ",
        location: "A3-05",
        quantity: 12,
        price: 150,
        imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=LED+Bulb"
    },
    {
        id: 5,
        partCode: "FLT-005",
        name: "ไส้กรองอากาศ WAVE125i",
        category: "ไส้กรอง",
        location: "B1-08",
        quantity: 5,
        price: 180,
        imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Air+Filter"
    },
    {
        id: 6,
        partCode: "SPK-006",
        name: "หัวเทียน NGK CPR6EA-9",
        category: "ระบบไฟ",
        location: "A2-02",
        quantity: 100,
        price: 120,
        imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Spark+Plug"
    },
    {
        id: 7,
        partCode: "BLT-007",
        name: "สายพาน Scoopy i",
        category: "ระบบส่งกำลัง",
        location: "C2-10",
        quantity: 3,
        price: 450,
        imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Drive+Belt"
    },
    {
        id: 8,
        partCode: "BTY-008",
        name: "แบตเตอรี่ YTZ5S 12V 5Ah",
        category: "แบตเตอรี่",
        location: "A4-01",
        quantity: 15,
        price: 650,
        imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Battery"
    },
    {
        id: 9,
        partCode: "OIL-009",
        name: "น้ำมันเฟืองท้าย Honda 120ml",
        category: "น้ำมันเครื่อง",
        location: "B2-05",
        quantity: 40,
        price: 80,
        imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Gear+Oil"
    },
    {
        id: 10,
        partCode: "TYR-010",
        name: "ยางใน 2.50-17 IRC",
        category: "ยาง",
        location: "A1-02",
        quantity: 35,
        price: 140,
        imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Inner+Tube"
    },
    {
        id: 11,
        partCode: "BRK-011",
        name: "ก้านเบรคซ้าย Click125i",
        category: "เบรค",
        location: "C1-05",
        quantity: 7,
        price: 220,
        imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Brake+Lever"
    },
    {
        id: 12,
        partCode: "SPS-012",
        name: "โช๊คหลัง YSS G-Sport XMAX",
        category: "ช่วงล่าง",
        location: "D1-01",
        quantity: 2,
        price: 4500,
        imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Rear+Shock"
    },
    {
        id: 13,
        partCode: "EXH-013",
        name: "ท่อไอเสียแต่ง ADV150",
        category: "ท่อไอเสีย",
        location: "D2-02",
        quantity: 4,
        price: 3800,
        imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Exhaust"
    },
    {
        id: 14,
        partCode: "CBL-014",
        name: "สายไมล์ Wave110i",
        category: "สายเคเบิล",
        location: "B3-11",
        quantity: 20,
        price: 150,
        imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Speedometer+Cable"
    },
    {
        id: 15,
        partCode: "MRR-015",
        name: "กระจกมองหลัง (เดิม) ซ้าย-ขวา Fino",
        category: "อุปกรณ์ภายนอก",
        location: "B4-09",
        quantity: 12,
        price: 250,
        imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Mirrors"
    },
    {
        id: 16,
        partCode: "FLT-016",
        name: "ไส้กรองน้ำมันเครื่อง Yamaha R15",
        category: "ไส้กรอง",
        location: "B1-02",
        quantity: 18,
        price: 120,
        imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Oil+Filter"
    },
    {
        id: 17,
        partCode: "CHN-017",
        name: "โซ่ RK 428 O-Ring 132L",
        category: "ระบบส่งกำลัง",
        location: "C2-01",
        quantity: 8,
        price: 850,
        imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Chain"
    },
    {
        id: 18,
        partCode: "SPK-018",
        name: "ปลั๊กหัวเทียนแต่ง",
        category: "ระบบไฟ",
        location: "A2-05",
        quantity: 22,
        price: 90,
        imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Spark+Plug+Cap"
    }
]
