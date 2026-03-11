export interface Supplier {
    id: number
    companyName: string
    contactName: string
    phone: string
    email: string
    address: string
}

export const mockSuppliers: Supplier[] = [
    {
        id: 1,
        companyName: "BNS Parts",
        contactName: "คุณบัญชา นาจะมั่น",
        phone: "081-234-5678",
        email: "contact@bnsparts.co.th",
        address: "123/45 ถ.สุขุมวิท พระโขนง กรุงเทพฯ 10260"
    },
    {
        id: 2,
        companyName: "YSS Thailand",
        contactName: "คุณสมหญิง ใจดี",
        phone: "02-999-8888",
        email: "sales@yssthailand.com",
        address: "88/8 ถ.เทพารักษ์ บางพลี สมุทรปราการ 10540"
    },
    {
        id: 3,
        companyName: "IRC Tire Distributor",
        contactName: "คุณวิชัย เลิศยาง",
        phone: "089-876-5432",
        email: "vichai@irctire.com",
        address: "45 หมู่ 2 ถ.พระราม 2 บางขุนเทียน กรุงเทพฯ 10150"
    },
    {
        id: 4,
        companyName: "Honda Genuine Parts (ศูนย์พระราม 3)",
        contactName: "ฝ่ายอะไหล่",
        phone: "02-333-4444",
        email: "parts.rama3@honda.co.th",
        address: "99 ถ.นราธิวาสราชนครินทร์ ยานนาวา กรุงเทพฯ 10120"
    }
]
