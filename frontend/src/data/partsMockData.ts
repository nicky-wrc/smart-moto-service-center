export interface PartItem {
    id: number
    partCode: string
    name: string
    category: string
    location: string
    quantity: number
    price: number
    imageUrl: string
    motorcycleModel?: string
}

export const mockParts: PartItem[] = [
    // 1. ระบบเครื่องยนต์ (Engine)
    { id: 1, partCode: "ENG-001", name: "ลูกสูบ Wave 125i", category: "ระบบเครื่องยนต์ (Engine)", location: "A1-01", quantity: 15, price: 850, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Piston", motorcycleModel: "Wave 125i" },
    { id: 65, partCode: "ENG-001-C", name: "ลูกสูบ Click 160", category: "ระบบเครื่องยนต์ (Engine)", location: "A1-01", quantity: 10, price: 950, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Piston", motorcycleModel: "Click 160" },
    { id: 2, partCode: "ENG-002", name: "แหวนลูกสูบ", category: "ระบบเครื่องยนต์ (Engine)", location: "A1-02", quantity: 30, price: 350, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Piston+Ring", motorcycleModel: "ทุกรุ่น" },
    { id: 3, partCode: "ENG-003", name: "เสื้อสูบ", category: "ระบบเครื่องยนต์ (Engine)", location: "A1-03", quantity: 5, price: 1500, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Cylinder+Block", motorcycleModel: "Wave125i" },
    { id: 4, partCode: "ENG-004", name: "วาล์ว", category: "ระบบเครื่องยนต์ (Engine)", location: "A1-04", quantity: 40, price: 250, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Valve", motorcycleModel: "ทุกรุ่น" },
    { id: 5, partCode: "ENG-005", name: "เพลาข้อเหวี่ยง", category: "ระบบเครื่องยนต์ (Engine)", location: "A1-05", quantity: 3, price: 2200, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Crankshaft", motorcycleModel: "PCX150" },
    { id: 6, partCode: "ENG-006", name: "ปะเก็นเครื่อง", category: "ระบบเครื่องยนต์ (Engine)", location: "A1-06", quantity: 50, price: 120, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Gasket", motorcycleModel: "ทุกรุ่น" },
    { id: 7, partCode: "ENG-007", name: "ฝาสูบ", category: "ระบบเครื่องยนต์ (Engine)", location: "A1-07", quantity: 4, price: 1800, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Cylinder+Head", motorcycleModel: "Scoopy i" },

    // 2. ระบบส่งกำลัง (Transmission)
    { id: 8, partCode: "TRN-001", name: "ชุดคลัตช์", category: "ระบบส่งกำลัง (Transmission)", location: "B1-01", quantity: 8, price: 1100, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Clutch+Kit", motorcycleModel: "ทุกรุ่น" },
    { id: 9, partCode: "TRN-002", name: "แผ่นคลัตช์", category: "ระบบส่งกำลัง (Transmission)", location: "B1-02", quantity: 20, price: 450, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Clutch+Plate", motorcycleModel: "ทุกรุ่น" },
    { id: 10, partCode: "TRN-003", name: "เฟืองเกียร์", category: "ระบบส่งกำลัง (Transmission)", location: "B1-03", quantity: 12, price: 800, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Gear", motorcycleModel: "Wave110i" },
    { id: 11, partCode: "TRN-004", name: "โซ่ราวลิ้น", category: "ระบบส่งกำลัง (Transmission)", location: "B1-04", quantity: 15, price: 300, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Cam+Chain", motorcycleModel: "ทุกรุ่น" },
    { id: 12, partCode: "TRN-005", name: "สเตอร์หน้า", category: "ระบบส่งกำลัง (Transmission)", location: "B1-05", quantity: 25, price: 180, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Front+Sprocket", motorcycleModel: "Wave125i" },
    { id: 13, partCode: "TRN-006", name: "สเตอร์หลัง", category: "ระบบส่งกำลัง (Transmission)", location: "B1-06", quantity: 22, price: 250, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Rear+Sprocket", motorcycleModel: "Wave125i" },
    { id: 14, partCode: "TRN-007", name: "โซ่", category: "ระบบส่งกำลัง (Transmission)", location: "B1-07", quantity: 18, price: 400, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Chain", motorcycleModel: "ทุกรุ่น" },

    // 3. ระบบไฟฟ้า (Electrical System)
    { id: 15, partCode: "ELE-001", name: "แบตเตอรี่", category: "ระบบไฟฟ้า (Electrical System)", location: "C1-01", quantity: 12, price: 650, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Battery", motorcycleModel: "ทุกรุ่น" },
    { id: 16, partCode: "ELE-002", name: "หัวเทียน", category: "ระบบไฟฟ้า (Electrical System)", location: "C1-02", quantity: 80, price: 120, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Spark+Plug", motorcycleModel: "ทุกรุ่น" },
    { id: 17, partCode: "ELE-003", name: "คอยล์จุดระเบิด", category: "ระบบไฟฟ้า (Electrical System)", location: "C1-03", quantity: 10, price: 550, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Ignition+Coil", motorcycleModel: "ทุกรุ่น" },
    { id: 18, partCode: "ELE-004", name: "CDI / ECU", category: "ระบบไฟฟ้า (Electrical System)", location: "C1-04", quantity: 4, price: 2500, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=ECU", motorcycleModel: "PCX150" },
    { id: 19, partCode: "ELE-005", name: "ไดชาร์จ", category: "ระบบไฟฟ้า (Electrical System)", location: "C1-05", quantity: 5, price: 1200, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Alternator", motorcycleModel: "ทุกรุ่น" },
    { id: 20, partCode: "ELE-006", name: "รีเลย์", category: "ระบบไฟฟ้า (Electrical System)", location: "C1-06", quantity: 30, price: 150, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Relay", motorcycleModel: "ทุกรุ่น" },
    { id: 21, partCode: "ELE-007", name: "ฟิวส์", category: "ระบบไฟฟ้า (Electrical System)", location: "C1-07", quantity: 150, price: 20, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Fuse", motorcycleModel: "ทุกรุ่น" },

    // 4. ระบบเชื้อเพลิง (Fuel System)
    { id: 22, partCode: "FUL-001", name: "คาร์บูเรเตอร์", category: "ระบบเชื้อเพลิง (Fuel System)", location: "D1-01", quantity: 4, price: 1500, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Carburetor", motorcycleModel: "รถรุ่นเก่า" },
    { id: 23, partCode: "FUL-002", name: "หัวฉีด", category: "ระบบเชื้อเพลิง (Fuel System)", location: "D1-02", quantity: 15, price: 800, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Injector", motorcycleModel: "Wave 110i, PCX" },
    { id: 24, partCode: "FUL-003", name: "ปั๊มน้ำมันเชื้อเพลิง", category: "ระบบเชื้อเพลิง (Fuel System)", location: "D1-03", quantity: 6, price: 1200, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Fuel+Pump", motorcycleModel: "Scoopy i" },
    { id: 25, partCode: "FUL-004", name: "กรองน้ำมันเชื้อเพลิง", category: "ระบบเชื้อเพลิง (Fuel System)", location: "D1-04", quantity: 40, price: 150, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Fuel+Filter", motorcycleModel: "ทุกรุ่น" },
    { id: 26, partCode: "FUL-005", name: "ถังน้ำมัน", category: "ระบบเชื้อเพลิง (Fuel System)", location: "D1-05", quantity: 2, price: 2500, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Fuel+Tank", motorcycleModel: "Wave 125i" },

    // 5. ระบบหล่อลื่น (Lubrication)
    { id: 27, partCode: "LUB-001", name: "ปั๊มน้ำมันเครื่อง", category: "ระบบหล่อลื่น (Lubrication)", location: "E1-01", quantity: 5, price: 750, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Oil+Pump", motorcycleModel: "ทุกรุ่น" },
    { id: 28, partCode: "LUB-002", name: "กรองน้ำมันเครื่อง", category: "ระบบหล่อลื่น (Lubrication)", location: "E1-02", quantity: 60, price: 120, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Oil+Filter", motorcycleModel: "ทุกรุ่น" },
    { id: 29, partCode: "LUB-003", name: "ออยคูลเลอร์", category: "ระบบหล่อลื่น (Lubrication)", location: "E1-03", quantity: 3, price: 1800, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Oil+Cooler", motorcycleModel: "รุ่นแต่ง" },
    { id: 30, partCode: "LUB-004", name: "ซีลน้ำมันเครื่อง", category: "ระบบหล่อลื่น (Lubrication)", location: "E1-04", quantity: 45, price: 80, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Oil+Seal", motorcycleModel: "ทุกรุ่น" },

    // 6. ระบบระบายความร้อน (Cooling System)
    { id: 31, partCode: "COL-001", name: "หม้อน้ำ", category: "ระบบระบายความร้อน (Cooling System)", location: "F1-01", quantity: 4, price: 2100, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Radiator", motorcycleModel: "PCX150, Click125i" },
    { id: 32, partCode: "COL-002", name: "พัดลมหม้อน้ำ", category: "ระบบระบายความร้อน (Cooling System)", location: "F1-02", quantity: 6, price: 850, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Radiator+Fan", motorcycleModel: "PCX150" },
    { id: 33, partCode: "COL-003", name: "ท่อน้ำ", category: "ระบบระบายความร้อน (Cooling System)", location: "F1-03", quantity: 20, price: 250, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Water+Hose", motorcycleModel: "ทุกรุ่นที่มีหม้อน้ำ" },
    { id: 34, partCode: "COL-004", name: "ปั๊มน้ำ", category: "ระบบระบายความร้อน (Cooling System)", location: "F1-04", quantity: 5, price: 1200, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Water+Pump", motorcycleModel: "PCX150" },

    // 7. ระบบเบรก (Brake System)
    { id: 35, partCode: "BRK-001", name: "ผ้าเบรก", category: "ระบบเบรก (Brake System)", location: "G1-01", quantity: 50, price: 320, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Brake+Pads", motorcycleModel: "PCX150" },
    { id: 36, partCode: "BRK-002", name: "จานเบรก", category: "ระบบเบรก (Brake System)", location: "G1-02", quantity: 10, price: 850, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Brake+Disc", motorcycleModel: "Wave 125i" },
    { id: 37, partCode: "BRK-003", name: "ปั๊มเบรก", category: "ระบบเบรก (Brake System)", location: "G1-03", quantity: 5, price: 1200, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Brake+Pump", motorcycleModel: "ทุกรุ่น" },
    { id: 38, partCode: "BRK-004", name: "คาลิปเปอร์", category: "ระบบเบรก (Brake System)", location: "G1-04", quantity: 4, price: 1500, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Caliper", motorcycleModel: "PCX150" },
    { id: 39, partCode: "BRK-005", name: "สายเบรก", category: "ระบบเบรก (Brake System)", location: "G1-05", quantity: 25, price: 250, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Brake+Line", motorcycleModel: "ทุกรุ่น" },
    { id: 40, partCode: "BRK-006", name: "น้ำมันเบรก", category: "ระบบเบรก (Brake System)", location: "G1-06", quantity: 30, price: 150, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Brake+Fluid", motorcycleModel: "ทุกรุ่น" },

    // 8. ระบบช่วงล่าง (Suspension)
    { id: 41, partCode: "SUS-001", name: "โช๊คหน้า", category: "ระบบช่วงล่าง (Suspension)", location: "H1-01", quantity: 4, price: 2500, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Front+Shock", motorcycleModel: "Wave 125i" },
    { id: 42, partCode: "SUS-002", name: "โช๊คหลัง", category: "ระบบช่วงล่าง (Suspension)", location: "H1-02", quantity: 6, price: 1800, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Rear+Shock", motorcycleModel: "Scoopy i" },
    { id: 43, partCode: "SUS-003", name: "สวิงอาร์ม", category: "ระบบช่วงล่าง (Suspension)", location: "H1-03", quantity: 2, price: 2200, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Swingarm", motorcycleModel: "Wave 110i" },
    { id: 44, partCode: "SUS-004", name: "ลูกปืนล้อ", category: "ระบบช่วงล่าง (Suspension)", location: "H1-04", quantity: 60, price: 150, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Wheel+Bearing", motorcycleModel: "ทุกรุ่น" },

    // 9. ระบบล้อและยาง (Wheel & Tire)
    { id: 45, partCode: "WHL-001", name: "ยางนอก", category: "ระบบล้อและยาง (Wheel & Tire)", location: "I1-01", quantity: 25, price: 550, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Tire", motorcycleModel: "Wave125i" },
    { id: 46, partCode: "WHL-002", name: "ยางใน", category: "ระบบล้อและยาง (Wheel & Tire)", location: "I1-02", quantity: 40, price: 120, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Inner+Tube", motorcycleModel: "Wave 110i" },
    { id: 47, partCode: "WHL-003", name: "วงล้อ", category: "ระบบล้อและยาง (Wheel & Tire)", location: "I1-03", quantity: 10, price: 800, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Wheel+Rim", motorcycleModel: "ทุกรุ่นซี่ลวด" },
    { id: 48, partCode: "WHL-004", name: "ดุมล้อ", category: "ระบบล้อและยาง (Wheel & Tire)", location: "I1-04", quantity: 8, price: 650, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Wheel+Hub", motorcycleModel: "ทุกรุ่นซี่ลวด" },
    { id: 49, partCode: "WHL-005", name: "ซี่ลวด", category: "ระบบล้อและยาง (Wheel & Tire)", location: "I1-05", quantity: 50, price: 200, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Spokes", motorcycleModel: "ทุกรุ่นซี่ลวด" },

    // 10. ตัวถังและแฟริ่ง (Body Parts)
    { id: 50, partCode: "BDP-001", name: "แฟริ่ง", category: "ตัวถังและแฟริ่ง (Body Parts)", location: "J1-01", quantity: 2, price: 3500, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Fairing", motorcycleModel: "PCX150" },
    { id: 51, partCode: "BDP-002", name: "บังโคลน", category: "ตัวถังและแฟริ่ง (Body Parts)", location: "J1-02", quantity: 5, price: 450, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Fender", motorcycleModel: "Wave 125i" },
    { id: 52, partCode: "BDP-003", name: "ฝาครอบ", category: "ตัวถังและแฟริ่ง (Body Parts)", location: "J1-03", quantity: 8, price: 600, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Cover", motorcycleModel: "Scoopy i" },
    { id: 53, partCode: "BDP-004", name: "เบาะ", category: "ตัวถังและแฟริ่ง (Body Parts)", location: "J1-04", quantity: 4, price: 850, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Seat", motorcycleModel: "Wave 110i" },
    { id: 54, partCode: "BDP-005", name: "กระจกมองข้าง", category: "ตัวถังและแฟริ่ง (Body Parts)", location: "J1-05", quantity: 20, price: 250, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Mirror", motorcycleModel: "ทุกรุ่น" },

    // 11. ระบบควบคุม (Control System)
    { id: 55, partCode: "CTL-001", name: "คันเร่ง", category: "ระบบควบคุม (Control System)", location: "K1-01", quantity: 15, price: 350, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Throttle", motorcycleModel: "ทุกรุ่น" },
    { id: 56, partCode: "CTL-002", name: "สายคันเร่ง", category: "ระบบควบคุม (Control System)", location: "K1-02", quantity: 25, price: 180, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Throttle+Cable", motorcycleModel: "ทุกรุ่น" },
    { id: 57, partCode: "CTL-003", name: "มือเบรก", category: "ระบบควบคุม (Control System)", location: "K1-03", quantity: 30, price: 200, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Brake+Lever", motorcycleModel: "ทุกรุ่น" },
    { id: 58, partCode: "CTL-004", name: "มือคลัตช์", category: "ระบบควบคุม (Control System)", location: "K1-04", quantity: 10, price: 220, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Clutch+Lever", motorcycleModel: "รุ่นคลัตช์มือ" },
    { id: 59, partCode: "CTL-005", name: "สวิตช์แฮนด์", category: "ระบบควบคุม (Control System)", location: "K1-05", quantity: 8, price: 850, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Handle+Switch", motorcycleModel: "PCX150" },

    // 12. ของเหลวและวัสดุสิ้นเปลือง (Consumables)
    { id: 60, partCode: "CON-001", name: "น้ำมันเครื่อง", category: "ของเหลวและวัสดุสิ้นเปลือง (Consumables)", location: "L1-01", quantity: 80, price: 350, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Engine+Oil", motorcycleModel: "ทุกรุ่น" },
    { id: 61, partCode: "CON-002", name: "น้ำมันเบรก", category: "ของเหลวและวัสดุสิ้นเปลือง (Consumables)", location: "L1-02", quantity: 40, price: 150, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Brake+Fluid", motorcycleModel: "ทุกรุ่น" },
    { id: 62, partCode: "CON-003", name: "น้ำยาหม้อน้ำ", category: "ของเหลวและวัสดุสิ้นเปลือง (Consumables)", location: "L1-03", quantity: 30, price: 200, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Coolant", motorcycleModel: "ทุกรุ่นที่มีหม้อน้ำ" },
    { id: 63, partCode: "CON-004", name: "น้ำมันเกียร์", category: "ของเหลวและวัสดุสิ้นเปลือง (Consumables)", location: "L1-04", quantity: 50, price: 180, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Gear+Oil", motorcycleModel: "รถออโตเมติก" },
    { id: 64, partCode: "CON-005", name: "น้ำยาล้าง", category: "ของเหลวและวัสดุสิ้นเปลือง (Consumables)", location: "L1-05", quantity: 15, price: 250, imageUrl: "https://placehold.co/400x300/333333/ffffff.png?text=Cleaner", motorcycleModel: "ทุกรุ่น" }
]
