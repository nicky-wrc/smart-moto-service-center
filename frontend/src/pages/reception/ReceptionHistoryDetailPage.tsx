import { useNavigate, useParams } from 'react-router-dom'
import { getReceptionHistory } from '../../utils/receptionHistory'

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-0">
            <span className="text-sm text-gray-400 sm:w-44 shrink-0">{label}</span>
            <span className="text-sm text-gray-800 font-medium">{value || '-'}</span>
        </div>
    )
}

// Activity tag colors
const ACTIVITY_TAG_COLORS: Record<string, string> = {
    'ลูกค้าใหม่': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'ลงทะเบียนใหม่': 'bg-gray-100 text-gray-700 border-gray-200',
    'แจ้งซ่อมครั้งแรก': 'bg-gray-100 text-gray-700 border-gray-200',
    'ลูกค้าเก่า': 'bg-amber-100  text-amber-700  border-amber-200',
    'แจ้งซ่อมรถที่มีในระบบ': 'bg-gray-100 text-gray-700 border-gray-200',
    'แจ้งซ่อมรถคันใหม่': 'bg-gray-100 text-gray-700 border-gray-200',
}

function getActivityTags(activityType: string): string[] {
    switch (activityType) {
        case 'ลงทะเบียนใหม่': return ['ลูกค้าใหม่', 'ลงทะเบียนใหม่']
        case 'แจ้งซ่อมครั้งแรก': return ['ลูกค้าใหม่', 'แจ้งซ่อมครั้งแรก']
        case 'แจ้งซ่อมรถที่มีในระบบ': return ['ลูกค้าเก่า', 'แจ้งซ่อมรถที่มีในระบบ']
        case 'แจ้งซ่อมรถคันใหม่': return ['ลูกค้าเก่า', 'แจ้งซ่อมรถคันใหม่']
        default: return []
    }
}

export default function ReceptionHistoryDetailPage() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()

    // Load history and find the entry
    const allHistory = getReceptionHistory()
    
    // Also check mock data if not found
    const MOCK_HISTORY = [
        {
            id: 'RH-001',
            activityType: 'แจ้งซ่อมครั้งแรก',
            firstName: 'สมชาย', lastName: 'ใจดี',
            phone: '0812345678',
            model: 'Honda Wave 110i', color: 'แดง',
            plateLine1: '1กข', plateLine2: '1234', province: 'กรุงเทพมหานคร',
            symptoms: 'เครื่องยนต์ดับบ่อย น้ำมันรั่ว',
            tags: ['เครื่องยนต์', 'เชื้อเพลิง'],
            images: [],
            createdAt: '10/03/2569 09:15',
        },
        {
            id: 'RH-002',
            activityType: 'ลงทะเบียนใหม่',
            firstName: 'สมหญิง', lastName: 'รักดี',
            phone: '0898765432',
            model: 'Honda PCX 160', color: 'ดำ',
            plateLine1: '5ขด', plateLine2: '999', province: 'กรุงเทพมหานคร',
            images: [],
            createdAt: '10/03/2569 10:00',
        },
        {
            id: 'RH-003',
            activityType: 'แจ้งซ่อมรถที่มีในระบบ',
            firstName: 'วิชัย', lastName: 'กล้าหาญ',
            phone: '0855555555',
            model: 'Honda Click 125i', color: 'ขาว',
            plateLine1: '3งจ', plateLine2: '9012', province: 'ภูเก็ต',
            symptoms: 'เบรกหลังไม่ค่อยจับ',
            tags: ['เบรก', 'ช่วงล่าง'],
            images: [],
            createdAt: '10/03/2569 11:30',
        },
        {
            id: 'RH-004',
            activityType: 'แจ้งซ่อมรถคันใหม่',
            firstName: 'มานี', lastName: 'มีนา',
            phone: '0888888888',
            model: 'Vespa Sprint 150', color: 'เหลือง',
            plateLine1: '4ฉช', plateLine2: '3456', province: 'ขอนแก่น',
            symptoms: 'ไฟหน้าไม่ติด สายไฟขาด',
            tags: ['ไฟฟ้า'],
            images: [],
            createdAt: '10/03/2569 13:45',
        },
        {
            id: 'RH-005',
            activityType: 'แจ้งซ่อมครั้งแรก',
            firstName: 'ประสิทธิ์', lastName: 'ชนะภัย',
            phone: '0871234567',
            model: 'Yamaha NMAX 155', color: 'น้ำเงิน',
            plateLine1: '2คค', plateLine2: '5500', province: 'เชียงใหม่',
            symptoms: 'เกียร์ไม่ยอมเปลี่ยน มีเสียงดังตอนออกตัว',
            tags: ['ส่งกำลัง'],
            images: [],
            createdAt: '10/03/2569 14:20',
        },
    ]
    
    const combinedHistory = [...allHistory, ...MOCK_HISTORY]
    const entry = combinedHistory.find(h => h.id === id)

    if (!entry) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-[#F5F5F5]">
                <p className="text-gray-400 mb-4">ไม่พบข้อมูลประวัติที่ระบุ</p>
                <button
                    onClick={() => navigate('/reception/history')}
                    className="px-6 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600"
                >
                    กลับไปหน้าประวัติ
                </button>
            </div>
        )
    }

    const fullName = `${entry.firstName} ${entry.lastName}`
    const licensePlate = [entry.plateLine1, entry.plateLine2, entry.province].filter(Boolean).join(' ')
    const activityTags = getActivityTags(entry.activityType)
    const hasRepairInfo = entry.activityType !== 'ลงทะเบียนใหม่'
    
    // Extract queue number from ID (e.g., "RH-009-1773169600006" -> "009")
    const queueNumber = entry.id.split('-')[1] || entry.id

    return (
        <div className="h-full flex flex-col bg-[#F5F5F5]">
            <div className="p-6 w-full flex-1 flex flex-col">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/reception/history')}
                        className="flex items-center text-sm font-medium text-gray-500 hover:text-amber-600 mb-3 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        กลับไปหน้าประวัติ
                    </button>
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800">รายละเอียดประวัติ</h2>
                            <p className="text-gray-500 text-sm mt-1">ดูข้อมูลประวัติการรับลูกค้า</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="bg-[#1E1E1E] text-white text-sm font-medium px-4 py-2 rounded-lg">
                                ลำดับการรับบริการที่ {queueNumber}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 bg-white rounded-xl overflow-hidden">
                    <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
                        <div className="flex flex-col gap-5 p-6">
                            
                            {/* Status Tags & Timestamp */}
                            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    {activityTags.map(tag => (
                                        <span
                                            key={tag}
                                            className={`text-xs font-semibold px-3 py-1.5 border rounded-full ${ACTIVITY_TAG_COLORS[tag] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <span className="text-sm text-gray-400 flex items-center gap-1.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {entry.createdAt}
                                </span>
                            </div>

                            {/* Personal Info Card */}
                            <div className="bg-gray-50/50 rounded-2xl border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <h3 className="text-base font-semibold text-gray-800">ข้อมูลส่วนบุคคล</h3>
                                </div>
                                <div className="px-6 py-5 flex flex-col gap-3.5">
                                    <InfoRow label="ชื่อ-นามสกุล" value={fullName} />
                                    <InfoRow label="เบอร์โทรศัพท์" value={entry.phone || '-'} />
                                </div>
                            </div>

                            {/* Motorcycle Info Card */}
                            <div className="bg-gray-50/50 rounded-2xl border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center gap-2">
                                    <svg className="h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 24" fill="currentColor">
                                        <path d="M8.632 15.526a2.112 2.112 0 0 0-2.106 2.105v4.305a2.106 2.106 0 0 0 4.212 0v-.043v.002v-4.263a2.112 2.112 0 0 0-2.104-2.106z" />
                                        <path d="M16.263 2.631H12.21C11.719 1.094 10.303 0 8.631 0S5.544 1.094 5.06 2.604l-.007.027h-4a1.053 1.053 0 0 0 0 2.106h4.053c.268.899.85 1.635 1.615 2.096l.016.009c-2.871.867-4.929 3.48-4.947 6.577v5.528a1.753 1.753 0 0 0 1.736 1.737h1.422v-3a3.737 3.737 0 1 1 7.474 0v3h1.421a1.752 1.752 0 0 0 1.738-1.737v-5.474a6.855 6.855 0 0 0-4.899-6.567l-.048-.012a3.653 3.653 0 0 0 1.625-2.08l.007-.026h4.053a1.056 1.056 0 0 0 1.053-1.053a1.149 1.149 0 0 0-1.104-1.105h-.002zM8.631 5.84a2.106 2.106 0 1 1 2.106-2.106l.001.06c0 1.13-.916 2.046-2.046 2.046l-.063-.001h.003z" />
                                    </svg>
                                    <h3 className="text-base font-semibold text-gray-800">ข้อมูลรถมอเตอร์ไซค์</h3>
                                </div>
                                <div className="px-6 py-5 flex flex-col gap-3.5">
                                    <InfoRow label="รุ่นรถ" value={entry.model || '-'} />
                                    <InfoRow label="สีรถ" value={entry.color || '-'} />
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1 mt-1 border-t border-gray-100">
                                        <span className="text-sm text-gray-400 sm:w-44 shrink-0">ป้ายทะเบียน</span>
                                        <div className="flex items-center gap-4">
                                            {/* Mini License Plate Preview */}
                                            <div className="border-[2.5px] border-gray-700 rounded bg-white w-[130px] flex flex-col items-center py-1.5 px-2 relative shadow-sm shrink-0">
                                                <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-gray-300 border border-gray-400"></div>
                                                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-gray-300 border border-gray-400"></div>
                                                <span className="text-lg font-bold text-gray-900 tracking-wider leading-tight">{entry.plateLine1 || '-'}</span>
                                                <div className="w-full border-t border-gray-200/80 my-0.5"></div>
                                                <span className="text-[10px] font-semibold text-gray-700 leading-tight">{entry.province || '-'}</span>
                                                <div className="w-full border-t border-gray-200/80 my-0.5"></div>
                                                <span className="text-xl font-bold text-gray-900 tracking-widest leading-tight">{entry.plateLine2 || '-'}</span>
                                            </div>
                                            <span className="text-sm text-gray-700 font-medium">{licensePlate || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Symptoms & Images (only if has repair info) */}
                            {hasRepairInfo && (
                                <div className="bg-gray-50/50 rounded-2xl border border-gray-200 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <h3 className="text-base font-semibold text-gray-800">อาการแจ้งซ่อม</h3>
                                    </div>
                                    <div className="px-6 py-5 flex flex-col gap-4">
                                        {/* Symptoms Text */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-2">รายละเอียดอาการ</label>
                                            <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 min-h-[80px]">
                                                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                                    {entry.symptoms || 'ไม่มีข้อมูล'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Symptom Tags */}
                                        {entry.tags && entry.tags.length > 0 && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-2">แท็กอาการ</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {entry.tags.map(tag => (
                                                        <span
                                                            key={tag}
                                                            className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-sky-100 text-sky-700 border border-sky-200"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Images */}
                                        {entry.images && entry.images.length > 0 && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-2">รูปภาพที่แนบ</label>
                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                                    {entry.images.map((img: string, idx: number) => (
                                                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                                            <img
                                                                src={img}
                                                                alt={`อาการ ${idx + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {!entry.symptoms && (!entry.tags || entry.tags.length === 0) && (!entry.images || entry.images.length === 0) && (
                                            <p className="text-sm text-gray-400 italic text-center py-4">ไม่มีข้อมูลอาการแจ้งซ่อม</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
