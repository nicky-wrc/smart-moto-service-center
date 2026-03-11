import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

// Mock data - same interface as ForemanResponsePage
interface ForemanResponse {
    id: string
    queueNumber: string
    firstName: string
    lastName: string
    phone: string
    address?: string
    model: string
    color: string
    plateLine1: string
    plateLine2: string
    province: string
    symptoms: string
    tags: string[]
    images?: string[]
    
    foremanAnalysis: string
    estimatedCost: number
    estimatedDuration: string
    requiredParts: Array<{
        name: string
        quantity: number
        unitPrice: number
    }>
    additionalNotes?: string
    respondedAt: string
    respondedBy: string
    assessmentNumber: number // ครั้งที่ประเมิน
    customerDecision?: 'approved' | 'rejected' | null // สถานะการตัดสินใจของลูกค้า
}

// Mock data
const mockForemanResponses: ForemanResponse[] = [
    {
        id: 'RH-001-1773169600001',
        queueNumber: '001',
        firstName: 'สมชาย',
        lastName: 'ใจดี',
        phone: '0812345678',
        address: '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
        model: 'Honda Wave 125i',
        color: 'แดง',
        plateLine1: 'กค',
        plateLine2: '1234',
        province: 'กรุงเทพมหานคร',
        symptoms: 'เครื่องดังผิดปกติ มีควันขาวออกจากท่อ',
        tags: ['เครื่องยนต์', 'ระบายความร้อน'],
        images: [],
        foremanAnalysis: 'ตรวจสอบแล้วพบว่ากระบอกสูบมีรอยขีดข่วน และลูกสูบสึกหรอ ต้องเปลี่ยนชุดลูกสูบและกระบอกสูบใหม่ รวมทั้งต้องทำการล้างคาร์บูเรเตอร์และปรับจูนเครื่องยนต์ใหม่',
        estimatedCost: 4500,
        estimatedDuration: '2-3 วัน',
        requiredParts: [
            { name: 'ชุดลูกสูบ Honda Wave 125i', quantity: 1, unitPrice: 2500 },
            { name: 'ปะเก็นชุด', quantity: 1, unitPrice: 350 },
            { name: 'น้ำมันเครื่อง 10W-40', quantity: 1, unitPrice: 250 },
        ],
        additionalNotes: 'แนะนำให้เปลี่ยนถ่ายน้ำมันเครื่องและตรวจเช็คระบบส่งกำลังด้วย',
        respondedAt: '2026-03-11T09:30:00Z',
        respondedBy: 'นายสมศักดิ์ ช่างดี',
        assessmentNumber: 1,
        customerDecision: null // ยังไม่มีการตัดสินใจ
    },
    {
        id: 'RH-002-1773169600002',
        queueNumber: '002',
        firstName: 'สมหญิง',
        lastName: 'รักดี',
        phone: '0898765432',
        address: '456 ถนนราชดำริ อำเภอเมือง จังหวัดนนทบุรี 11000',
        model: 'Yamaha Fino',
        color: 'ชมพู',
        plateLine1: 'นข',
        plateLine2: '5678',
        province: 'นนทบุรี',
        symptoms: 'เบรกไม่อั้น เหยียบลงไปนิ่มๆ',
        tags: ['เบรก', 'ช่วงล่าง'],
        images: [],
        foremanAnalysis: 'พบว่าผ้าเบรกสึกหรอจนหมดและน้ำมันเบรกเหลือน้อย ต้องเปลี่ยนผ้าเบรกหน้า-หลัง และเติมน้ำมันเบรกใหม่ พร้อมปล่อยลม',
        estimatedCost: 1200,
        estimatedDuration: '1 วัน',
        requiredParts: [
            { name: 'ผ้าเบรกหน้า Yamaha Fino', quantity: 1, unitPrice: 350 },
            { name: 'ผ้าเบรกหลัง Yamaha Fino', quantity: 1, unitPrice: 300 },
            { name: 'น้ำมันเบรก DOT 3', quantity: 1, unitPrice: 150 },
        ],
        additionalNotes: 'เป็นปัญหาที่มีผลต่อความปลอดภัย แนะนำให้รีบซ่อม',
        respondedAt: '2026-03-11T10:15:00Z',
        respondedBy: 'นายสมศักดิ์ ช่างดี',
        assessmentNumber: 2,
        customerDecision: null // ยังไม่มีการตัดสินใจ
    }
]

// Collapsible Card Component
function CollapsibleCard({ 
    title, 
    icon, 
    children, 
    defaultCollapsed = false 
}: { 
    title: string
    icon: React.ReactNode
    children: React.ReactNode
    defaultCollapsed?: boolean
}) {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

    return (
        <div className="bg-gray-50/50 rounded-2xl border border-gray-200 overflow-hidden">
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-full px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    {icon}
                    <h3 className="text-base font-semibold text-gray-800">{title}</h3>
                </div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 text-gray-500 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {!isCollapsed && (
                <div className="px-6 py-5">
                    {children}
                </div>
            )}
        </div>
    )
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-0">
            <span className="text-sm text-gray-400 sm:w-44 shrink-0">{label}</span>
            <span className="text-sm text-gray-800 font-medium">{value || '-'}</span>
        </div>
    )
}

export default function ForemanResponseDetailPage() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    
    // State for confirmation modal
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [pendingDecision, setPendingDecision] = useState<'approved' | 'rejected' | null>(null)
    const [customerDecision, setCustomerDecision] = useState<'approved' | 'rejected' | null>(null)
    
    // Find the response by ID
    const response = mockForemanResponses.find(r => r.id === id)

    if (!response) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-[#F5F5F5]">
                <p className="text-gray-400 mb-4">ไม่พบข้อมูลที่ระบุ</p>
                <button
                    onClick={() => navigate('/reception/foreman-response')}
                    className="px-6 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600"
                >
                    กลับไปหน้ารายการ
                </button>
            </div>
        )
    }

    const fullName = `${response.firstName} ${response.lastName}`
    const licensePlate = `${response.plateLine1} ${response.plateLine2} ${response.province}`
    const laborCost = response.estimatedCost - response.requiredParts.reduce((sum, part) => sum + (part.quantity * part.unitPrice), 0)
    
    // Format date like history page: "DD/MM/YYYY HH:MM"
    const formatDate = (isoString: string) => {
        const date = new Date(isoString)
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear() + 543 // Convert to Buddhist year
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${day}/${month}/${year} ${hours}:${minutes}`
    }

    // Handle customer decision
    const handleDecisionClick = (decision: 'approved' | 'rejected') => {
        setPendingDecision(decision)
        setShowConfirmModal(true)
    }

    const handleConfirmDecision = async () => {
        if (!pendingDecision) return

        try {
            // TODO: Replace with actual API call
            // await api.updateCustomerDecision(response.id, pendingDecision)
            
            console.log(`Customer decision: ${pendingDecision} for job ${response.id}`)
            
            // Update state instead of modifying response object
            setCustomerDecision(pendingDecision)
            
            // Show success message
            alert(
                pendingDecision === 'approved' 
                    ? 'บันทึกการยืนยันเรียบร้อย หัวหน้าช่างได้รับแจ้งและสามารถเริ่มงานซ่อมได้แล้ว' 
                    : 'บันทึกการยกเลิกเรียบร้อย หัวหน้าช่างได้รับแจ้งแล้ว'
            )
            
            // Close modal and reset
            setShowConfirmModal(false)
            setPendingDecision(null)
        } catch (error) {
            console.error('Error updating customer decision:', error)
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง')
        }
    }

    const handleCancelModal = () => {
        setShowConfirmModal(false)
        setPendingDecision(null)
    }

    return (
        <div className="h-full flex flex-col bg-[#F5F5F5]">
            <div className="p-6 w-full flex-1 flex flex-col">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/reception/foreman-response')}
                        className="flex items-center text-sm font-medium text-gray-500 hover:text-amber-600 mb-3 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        กลับไปหน้ารายการ
                    </button>
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800">การตอบกลับจากหัวหน้าช่าง</h2>
                            <p className="text-gray-500 text-sm mt-1">ดูรายละเอียดการประเมินและใบเสนอราคา</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="bg-[#1E1E1E] text-white text-sm font-medium px-4 py-2 rounded-lg">
                                ลำดับการรับบริการที่ {response.queueNumber}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 bg-white rounded-xl overflow-hidden">
                    <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
                        <div className="flex flex-col gap-5 p-6">
                            
                            {/* Status Tag & Timestamp */}
                            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold px-3 py-1.5 border rounded-full bg-emerald-100 text-emerald-700 border-emerald-200">
                                        ประเมินครั้งที่ {response.assessmentNumber}
                                    </span>
                                </div>
                                <span className="text-sm text-gray-400 flex items-center gap-1.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {formatDate(response.respondedAt)}
                                </span>
                            </div>
                            
                            {/* Personal Info Card - Collapsible */}
                            <CollapsibleCard
                                title="ข้อมูลส่วนบุคคล"
                                defaultCollapsed={true}
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                }
                            >
                                <div className="flex flex-col gap-3.5">
                                    <InfoRow label="ชื่อ-นามสกุล" value={fullName} />
                                    <InfoRow label="เบอร์โทรศัพท์" value={response.phone} />
                                    {response.address && <InfoRow label="ที่อยู่" value={response.address} />}
                                </div>
                            </CollapsibleCard>

                            {/* Motorcycle Info Card - Collapsible */}
                            <CollapsibleCard
                                title="ข้อมูลรถมอเตอร์ไซค์"
                                defaultCollapsed={true}
                                icon={
                                    <svg className="h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 24" fill="currentColor">
                                        <path d="M8.632 15.526a2.112 2.112 0 0 0-2.106 2.105v4.305a2.106 2.106 0 0 0 4.212 0v-.043v.002v-4.263a2.112 2.112 0 0 0-2.104-2.106z" />
                                        <path d="M16.263 2.631H12.21C11.719 1.094 10.303 0 8.631 0S5.544 1.094 5.06 2.604l-.007.027h-4a1.053 1.053 0 0 0 0 2.106h4.053c.268.899.85 1.635 1.615 2.096l.016.009c-2.871.867-4.929 3.48-4.947 6.577v5.528a1.753 1.753 0 0 0 1.736 1.737h1.422v-3a3.737 3.737 0 1 1 7.474 0v3h1.421a1.752 1.752 0 0 0 1.738-1.737v-5.474a6.855 6.855 0 0 0-4.899-6.567l-.048-.012a3.653 3.653 0 0 0 1.625-2.08l.007-.026h4.053a1.056 1.056 0 0 0 1.053-1.053a1.149 1.149 0 0 0-1.104-1.105h-.002zM8.631 5.84a2.106 2.106 0 1 1 2.106-2.106l.001.06c0 1.13-.916 2.046-2.046 2.046l-.063-.001h.003z" />
                                    </svg>
                                }
                            >
                                <div className="flex flex-col gap-3.5">
                                    <InfoRow label="รุ่นรถ" value={response.model} />
                                    <InfoRow label="สีรถ" value={response.color} />
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1 mt-1 border-t border-gray-100">
                                        <span className="text-sm text-gray-400 sm:w-44 shrink-0">ป้ายทะเบียน</span>
                                        <div className="flex items-center gap-4">
                                            {/* Mini License Plate Preview */}
                                            <div className="border-[2.5px] border-gray-700 rounded bg-white w-[130px] flex flex-col items-center py-1.5 px-2 relative shadow-sm shrink-0">
                                                <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-gray-300 border border-gray-400"></div>
                                                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-gray-300 border border-gray-400"></div>
                                                <span className="text-lg font-bold text-gray-900 tracking-wider leading-tight">{response.plateLine1}</span>
                                                <div className="w-full border-t border-gray-200/80 my-0.5"></div>
                                                <span className="text-[10px] font-semibold text-gray-700 leading-tight">{response.province}</span>
                                                <div className="w-full border-t border-gray-200/80 my-0.5"></div>
                                                <span className="text-xl font-bold text-gray-900 tracking-widest leading-tight">{response.plateLine2}</span>
                                            </div>
                                            <span className="text-sm text-gray-700 font-medium">{licensePlate}</span>
                                        </div>
                                    </div>
                                </div>
                            </CollapsibleCard>

                            {/* Original Symptoms Card - Collapsible */}
                            <CollapsibleCard
                                title="อาการที่ลูกค้าแจ้ง"
                                defaultCollapsed={true}
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                }
                            >
                                <div className="flex flex-col gap-4">
                                    {/* Symptoms Text */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-2">รายละเอียดอาการ</label>
                                        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 min-h-[80px]">
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                                {response.symptoms}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Symptom Tags */}
                                    {response.tags && response.tags.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-2">แท็กอาการ</label>
                                            <div className="flex flex-wrap gap-2">
                                                {response.tags.map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-sky-100 text-sky-700 border border-sky-200"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Images */}
                                    {response.images && response.images.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-2">รูปภาพที่แนบ</label>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                                {response.images.map((img: string, idx: number) => (
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
                                </div>
                            </CollapsibleCard>

                            {/* Foreman Analysis Card */}
                            <div className="bg-gray-50/50 rounded-2xl border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                    <h3 className="text-base font-semibold text-gray-800">การวิเคราะห์ของช่าง</h3>
                                </div>
                                <div className="px-6 py-5 flex flex-col gap-4">
                                    {/* Analysis Result */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-2">ผลการตรวจสอบ</label>
                                        <div className="bg-emerald-50 rounded-lg border border-emerald-200 px-4 py-3 min-h-[80px]">
                                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                {response.foremanAnalysis}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Additional Notes */}
                                    {response.additionalNotes && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-2">
                                                <span className="inline-flex items-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    หมายเหตุเพิ่มเติม
                                                </span>
                                            </label>
                                            <div className="bg-amber-50 rounded-lg border border-amber-200 px-4 py-3">
                                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                    {response.additionalNotes}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Foreman Info */}
                                    <div className="pt-3 border-t border-gray-100 flex flex-col gap-3">
                                        <InfoRow label="ประเมินโดย" value={response.respondedBy} />
                                        <InfoRow 
                                            label="ระยะเวลาซ่อม" 
                                            value={response.estimatedDuration} 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Quotation Card */}
                            <div className="bg-gray-50/50 rounded-2xl border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    <h3 className="text-base font-semibold text-gray-800">ใบเสนอราคาซ่อม</h3>
                                </div>
                                <div className="px-6 py-5 flex flex-col gap-4">
                                    {/* Parts List */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-2">รายการอะไหล่</label>
                                        <div className="space-y-2">
                                            {response.requiredParts.map((part, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-800">{part.name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            ฿{part.unitPrice.toLocaleString()} x {part.quantity} ชิ้น
                                                        </p>
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-800">
                                                        ฿{(part.unitPrice * part.quantity).toLocaleString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Labor Cost */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-2">ค่าแรง</label>
                                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                            <span className="text-sm font-medium text-gray-800">ค่าแรงช่าง</span>
                                            <span className="text-sm font-semibold text-gray-800">฿{laborCost.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Total Cost */}
                                    <div className="pt-3 border-t-2 border-gray-200">
                                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                                            <div className="flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-lg font-semibold text-gray-800">ราคารวมทั้งสิ้น</span>
                                            </div>
                                            <span className="text-2xl font-bold text-blue-600">฿{response.estimatedCost.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                    {/* Customer Decision Section */}
                    {!customerDecision && !response.customerDecision && (
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 p-6 mt-6">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-800 mb-1">รอการตัดสินใจจากลูกค้า</h3>
                                    <p className="text-sm text-gray-600">กรุณาแจ้งลูกค้าเกี่ยวกับการวิเคราะห์และใบเสนอราคา และรอการตอบรับเพื่อดำเนินการซ่อมต่อไป</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleDecisionClick('approved')}
                                    className="flex-1 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>ลูกค้าตกลง - เริ่มซ่อม</span>
                                </button>
                                <button
                                    onClick={() => handleDecisionClick('rejected')}
                                    className="flex-1 px-6 py-3.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>ลูกค้าไม่ตกลง - ยกเลิก</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Customer Decision Status */}
                    {(customerDecision || response.customerDecision) && (
                        <div className={`rounded-2xl border-2 p-6 mt-6 ${
                            (customerDecision || response.customerDecision) === 'approved' 
                                ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200' 
                                : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200'
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                    (customerDecision || response.customerDecision) === 'approved' 
                                        ? 'bg-emerald-500' 
                                        : 'bg-red-500'
                                }`}>
                                    {(customerDecision || response.customerDecision) === 'approved' ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <h3 className={`text-lg font-bold ${
                                        (customerDecision || response.customerDecision) === 'approved' 
                                            ? 'text-emerald-800' 
                                            : 'text-red-800'
                                    }`}>
                                        {(customerDecision || response.customerDecision) === 'approved' 
                                            ? '✓ ลูกค้ายืนยันการซ่อมแล้ว' 
                                            : '✗ ลูกค้าไม่ยืนยันการซ่อม'}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-0.5">
                                        {(customerDecision || response.customerDecision) === 'approved' 
                                            ? 'สามารถเริ่มดำเนินการซ่อมได้' 
                                            : 'งานซ่อมถูกยกเลิก'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}


                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
                        <div className="flex items-start gap-4 mb-4">
                            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                                pendingDecision === 'approved' 
                                    ? 'bg-emerald-100' 
                                    : 'bg-red-100'
                            }`}>
                                {pendingDecision === 'approved' ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-800 mb-1">
                                    {pendingDecision === 'approved' 
                                        ? 'ยืนยันการเริ่มซ่อม?' 
                                        : 'ยืนยันการยกเลิก?'}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {pendingDecision === 'approved' 
                                        ? 'คุณต้องการยืนยันว่าลูกค้าตกลงให้ดำเนินการซ่อมตามใบเสนอราคานี้ หัวหน้าช่างจะได้รับแจ้งและสามารถเริ่มงานซ่อมได้ทันที' 
                                        : 'คุณต้องการยืนยันว่าลูกค้าไม่ตกลงการซ่อม งานซ่อมนี้จะถูกยกเลิก และหัวหน้าช่างจะได้รับแจ้ง'}
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 mb-5">
                            <div className="text-sm text-gray-600 space-y-1">
                                <div className="flex justify-between">
                                    <span>คิวที่:</span>
                                    <span className="font-semibold text-gray-800">{response.queueNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>ลูกค้า:</span>
                                    <span className="font-semibold text-gray-800">{fullName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>ราคา:</span>
                                    <span className="font-semibold text-blue-600">฿{response.estimatedCost.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleCancelModal}
                                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleConfirmDecision}
                                className={`flex-1 px-4 py-2.5 text-white font-medium rounded-lg transition-colors ${
                                    pendingDecision === 'approved'
                                        ? 'bg-emerald-500 hover:bg-emerald-600'
                                        : 'bg-red-500 hover:bg-red-600'
                                }`}
                            >
                                {pendingDecision === 'approved' ? 'ยืนยันเริ่มซ่อม' : 'ยืนยันยกเลิก'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
