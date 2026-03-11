import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { PartRequest } from '../../data/requestsMockData'
import { partService } from '../../services/partService'
import { useRequestHistory } from '../../contexts/RequestHistoryContext'
import { partRequisitionService } from '../../services/partRequisitionService'
import { useActivityLog } from '../../hooks/useActivityLog'

type ConfirmAction = 'approve' | 'reject' | null
type ResultScreen = 'approved' | 'rejected' | null

export default function RequestDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { addHistory } = useRequestHistory()
    const { addActivity } = useActivityLog()

    const [request, setRequest] = useState<PartRequest | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [errorMsg, setErrorMsg] = useState('')

    const [rejectedItemIds, setRejectedItemIds] = useState<Set<number>>(new Set())
    const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
    const [resultScreen, setResultScreen] = useState<ResultScreen>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        let isMounted = true
        const fetchRequest = async () => {
            setIsLoading(true)
            try {
                const data = await partRequisitionService.getRequestById(Number(id))
                if (isMounted) {
                    if (data) setRequest(data)
                    else setErrorMsg(`ไม่พบรายการคำร้องขอเบิกหมายเลข #${id}`)
                }
            } catch (err) {
                if (isMounted) setErrorMsg('เกิดข้อผิดพลาดในการโหลดข้อมูล')
            } finally {
                if (isMounted) setIsLoading(false)
            }
        }
        fetchRequest()
        return () => { isMounted = false }
    }, [id])

    // Auto-redirect after showing result screen
    useEffect(() => {
        if (resultScreen) {
            const timer = setTimeout(() => navigate('/inventory/requests'), 3000)
            return () => clearTimeout(timer)
        }
    }, [resultScreen, navigate])

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
            </div>
        )
    }

    if (!request || errorMsg) {
        return (
            <div className="p-6 text-center text-gray-400">
                <p>{errorMsg || `ไม่พบรายการคำร้องขอเบิกหมายเลข #${id}`}</p>
                <button
                    onClick={() => navigate('/inventory/requests')}
                    className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]"
                >
                    กลับหน้ารายการ
                </button>
            </div>
        )
    }

    // ---- Result Screens ----
    if (resultScreen === 'rejected') {
        return (
            <div className="flex flex-col items-center justify-center min-h-full gap-5 py-20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <circle cx="12" cy="12" r="10" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6M9 9l6 6" />
                </svg>
                <div className="text-center">
                    <p className="text-2xl font-semibold text-red-600">การขอเบิกถูกยกเลิกแล้ว</p>
                    <p className="text-sm text-gray-400 mt-2 mb-8">กำลังกลับสู่หน้าหลัก...</p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => navigate('/inventory/requests')}
                            className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            กลับไปยังหน้าหลัก
                        </button>
                        <button
                            onClick={() => navigate('/inventory/history')}
                            className="px-6 py-2.5 bg-[#1E1E1E] text-white font-medium rounded-lg hover:bg-black transition-colors"
                        >
                            ดูประวัติ
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (resultScreen === 'approved') {
        return (
            <div className="flex flex-col items-center justify-center min-h-full gap-5 py-20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <circle cx="12" cy="12" r="10" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12l3 3 5-6" />
                </svg>
                <div className="text-center">
                    <p className="text-2xl font-semibold text-green-600">การขอเบิกสินค้าของท่านสำเร็จ</p>
                    <p className="text-sm text-gray-400 mt-2 mb-8">กำลังกลับสู่หน้าหลัก...</p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => navigate('/inventory/requests')}
                            className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            กลับไปยังหน้าหลัก
                        </button>
                        <button
                            onClick={() => navigate('/inventory/history')}
                            className="px-6 py-2.5 bg-[#00a650] text-white font-medium rounded-lg hover:bg-[#008f45] transition-colors"
                        >
                            ดูประวัติ
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // ---- Helpers ----
    const toggleReject = (itemId: number) => {
        setRejectedItemIds(prev => {
            const next = new Set(prev)
            if (next.has(itemId)) {
                next.delete(itemId)
            } else {
                next.add(itemId)
            }
            return next
        })
    }

    const total = request.items
        .filter(item => !rejectedItemIds.has(item.id))
        .reduce((sum, item) => sum + item.quantity * item.pricePerUnit, 0)

    const allRejected = rejectedItemIds.size === request.items.length

    const handleAction = (action: 'approve' | 'reject') => {
        setConfirmAction(action)
    }

    const handleConfirm = async () => {
        if (!request) return
        setIsSubmitting(true)

        try {
            if (confirmAction === 'approve') {
                const itemsToApprove = request.items
                    .filter(item => !rejectedItemIds.has(item.id))
                    .map(item => ({ id: item.id, issuedQuantity: item.quantity }))

                await partRequisitionService.approveRequest(request.id, itemsToApprove)
            } else {
                await partRequisitionService.rejectRequest(request.id)
            }

            // Still using Context visually to mock state changes
            const now = new Date()
            const pad = (n: number) => String(n).padStart(2, '0')
            const approvedAt = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())} น.`
            addHistory({
                id: request.id,
                requester: request.requester,
                requesterRole: request.requesterRole,
                motorcycleModel: request.motorcycleModel,
                licensePlate: request.licensePlate,
                requestedAt: request.requestedAt,
                approvedAt,
                status: confirmAction === 'approve' ? 'อนุมัติการเบิก' : 'ไม่อนุมัติการเบิก',
                items: request.items,
            })

            addActivity({
                id: `REQ-${request.id}-${now.getTime()}`,
                type: 'request',
                label: `เบิกอะไหล่ (REQ-${String(request.id).padStart(3, '0')})`,
                sub: request.requester,
                date: approvedAt,
                badge: confirmAction === 'approve' ? 'อนุมัติการเบิก' : 'ไม่อนุมัติการเบิก',
                badgeColor: confirmAction === 'approve' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
            })

            setConfirmAction(null)
            setResultScreen(confirmAction === 'approve' ? 'approved' : 'rejected')
        } catch (error) {
            console.error('Failed to process request:', error)
            alert('เกิดข้อผิดพลาดในการทำรายการ โปรดลองอีกครั้ง')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="p-6 min-h-full flex flex-col">
            {/* Confirmation Dialog */}
            {confirmAction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
                            <p className="text-sm font-semibold text-[#F8981D] uppercase tracking-widest mb-0.5">Smart Moto Service Center</p>
                            <h2 className="text-base font-bold text-[#1E1E1E]">
                                {confirmAction === 'approve' ? 'ยืนยันการอนุมัติเบิกสินค้า' : 'ยืนยันการไม่อนุมัติเบิกสินค้า'}
                            </h2>
                        </div>

                        {/* Content Area */}
                        <div className="px-6 py-6 flex flex-col gap-6 overflow-y-auto">
                            {/* Icon & Title */}
                            <div className="flex flex-col items-center text-center gap-3">
                                <div className={`h-16 w-16 rounded-full flex items-center justify-center ${confirmAction === 'approve' ? 'bg-[#e0f8e9]' : 'bg-[#fee2e2]'}`}>
                                    {confirmAction === 'approve' ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#00a650]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-[#1a202c]">ยืนยันการทำรายการนี้หรือไม่?</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {confirmAction === 'approve' ? 'โปรดตรวจสอบรายละเอียดก่อนทำการยืนยัน' : 'โปรดตรวจสอบรายละเอียดก่อนทำการยกเลิก'}
                                    </p>
                                </div>
                            </div>

                            {/* Items List Snapshot */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">รายการอะไหล่</p>
                                <div className="flex flex-col gap-2.5">
                                    {request.items.filter(item => confirmAction === 'approve' ? !rejectedItemIds.has(item.id) : true).length === 0 ? (
                                        <p className="text-sm text-red-500 text-center py-2">ไม่มีรายการที่เลือก</p>
                                    ) : (
                                        request.items
                                            .filter(item => confirmAction === 'approve' ? !rejectedItemIds.has(item.id) : true)
                                            .map((item, idx) => (
                                                <div key={item.id} className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-[#1E1E1E] truncate">{idx + 1}. {item.partName}</p>
                                                        <p className="text-sm text-gray-500 mt-0.5">{item.quantity} × {item.pricePerUnit.toLocaleString()} ฿</p>
                                                    </div>
                                                    <span className="text-sm font-semibold text-[#1E1E1E] shrink-0">
                                                        {(item.quantity * item.pricePerUnit).toLocaleString()} ฿
                                                    </span>
                                                </div>
                                            ))
                                    )}
                                </div>

                                <div className="border-t border-dashed border-gray-200 my-3"></div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-[#1E1E1E]">รวมทั้งหมด</span>
                                    <span className={`text-lg font-black ${confirmAction === 'approve' ? 'text-[#00a650]' : 'text-[#ef4444]'}`}>
                                        {request.items
                                            .filter(item => confirmAction === 'approve' ? !rejectedItemIds.has(item.id) : true)
                                            .reduce((sum, item) => sum + item.quantity * item.pricePerUnit, 0).toLocaleString()} ฿
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Buttons Footer (Image 2 Style) */}
                        <div className="flex border-t border-gray-100 shrink-0">
                            <button
                                onClick={() => setConfirmAction(null)}
                                className="flex-1 py-4 text-sm text-gray-500 hover:bg-gray-50 font-medium transition-colors border-r border-gray-100"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={isSubmitting}
                                className={`flex-1 py-4 text-sm font-semibold text-white transition-colors border-none ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#44403C] hover:bg-black cursor-pointer'}`}
                            >
                                {isSubmitting ? 'กำลังดำเนินการ...' : 'ใช่ ยืนยัน'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Navigation */}
            <div className="flex items-center gap-2 text-gray-500 mb-6 cursor-pointer hover:text-amber-600 w-fit transition-colors" onClick={() => navigate('/inventory/requests')}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="text-sm font-medium">ย้อนกลับ</span>
            </div>

            {/* Title & Request Meta Details */}
            <div className="flex flex-col gap-3 mb-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-medium text-gray-800">รายการคำร้องขอที่ {request.id}</h1>
                    <span className="text-gray-500 text-sm">
                        {request.requestedAt}
                    </span>
                </div>

                <div className="flex gap-6 text-sm text-gray-600">
                    <div className="flex flex-col gap-3 min-w-[280px]">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#38bdf8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>ผู้ทำเรื่องเบิก : {request.requester} ({request.requesterRole})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <rect x="3" y="7" width="18" height="10" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 12h10" />
                            </svg>
                            <span>ป้ายทะเบียน : {request.licensePlate}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <svg className="h-[14px] w-[14px] text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 24" fill="currentColor">
                                <path d="M8.632 15.526a2.112 2.112 0 0 0-2.106 2.105v4.305a2.106 2.106 0 0 0 4.212 0v-.043v.002v-4.263a2.112 2.112 0 0 0-2.104-2.106z" />
                                <path d="M16.263 2.631H12.21C11.719 1.094 10.303 0 8.631 0S5.544 1.094 5.06 2.604l-.007.027h-4a1.053 1.053 0 0 0 0 2.106h4.053c.268.899.85 1.635 1.615 2.096l.016.009c-2.871.867-4.929 3.48-4.947 6.577v5.528a1.753 1.753 0 0 0 1.736 1.737h1.422v-3a3.737 3.737 0 1 1 7.474 0v3h1.421a1.752 1.752 0 0 0 1.738-1.737v-5.474a6.855 6.855 0 0 0-4.899-6.567l-.048-.012a3.653 3.653 0 0 0 1.625-2.08l.007-.026h4.053a1.056 1.056 0 0 0 1.053-1.053a1.149 1.149 0 0 0-1.104-1.105h-.002zM8.631 5.84a2.106 2.106 0 1 1 2.106-2.106l.001.06c0 1.13-.916 2.046-2.046 2.046l-.063-.001h.003z" />
                            </svg>
                            <span>รุ่นรถ : {request.motorcycleModel}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span>รายการคำขอ : {request.items.length} รายการ ({request.items.reduce((s, i) => s + i.quantity, 0)} ชิ้น)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Table Content */}
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white flex-1 mb-6">
                <table className="w-full text-sm text-center">
                    <thead>
                        <tr className="bg-[#f3f4f6] text-gray-600 font-medium border-b border-gray-200">
                            <th className="py-4 px-6 text-left font-medium">รหัสสินค้า</th>
                            <th className="py-4 px-6 text-left font-medium">ชื่อสินค้า</th>
                            <th className="py-4 px-6 font-medium">ราคาต่อหน่วย</th>
                            <th className="py-4 px-6 font-medium">จำนวน</th>
                            <th className="py-4 px-6 font-medium">subtotal</th>
                            <th className="py-4 px-6 font-medium">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                        {request.items.map((item) => {
                            const isRejected = rejectedItemIds.has(item.id)
                            return (
                                <tr key={item.id} className={`transition-colors ${isRejected ? 'bg-[#ffebee]' : 'hover:bg-gray-50'}`}>
                                    <td className="py-4 px-6 text-left">{item.partCode}</td>
                                    <td className="py-4 px-6 text-left">{item.partName}</td>
                                    <td className="py-4 px-6">{item.pricePerUnit}</td>
                                    <td className="py-4 px-6">{item.quantity}</td>
                                    <td className="py-4 px-6">{item.quantity * item.pricePerUnit}</td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center justify-center gap-4">
                                            <button
                                                onClick={() => toggleReject(item.id)}
                                                className={`flex items-center justify-center gap-1.5 w-32 py-1.5 text-sm font-medium text-white rounded transition-colors [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)] ${isRejected ? 'bg-[#5fbfb5] hover:bg-[#52a69d]' : 'bg-[#f59e0b] hover:bg-amber-600'}`}
                                            >
                                                {isRejected ? (
                                                    <>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                        </svg>
                                                        เปลี่ยนเป็นยืนยัน
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                        ปฏิเสธคำขอ
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={async () => {
                                                try {
                                                    const result = await partService.getParts({ limit: 1000 })
                                                    const part = result.data.find((p: any) => p.partCode === item.partCode)
                                                    if (part) navigate(`/inventory/parts/${part.id}`)
                                                    else alert('ไม่พบข้อมูลอะไหล่ในระบบ')
                                                } catch {
                                                    alert('ไม่สามารถโหลดข้อมูลอะไหล่ได้')
                                                }
                                            }}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-[#255B91] text-white rounded hover:bg-[#1a3f66] transition-colors [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                </svg>
                                                ดูรายละเอียด
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                    <tfoot>
                        <tr className="bg-[#f8fafc] border-t border-gray-200">
                            <td colSpan={6} className="py-5 px-6">
                                <div className="flex items-center justify-end gap-6 w-full pr-8">
                                    <span className="text-gray-500 font-medium uppercase tracking-wider text-sm">Total</span>
                                    <span className="text-xl font-medium text-gray-900">{total}</span>
                                </div>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Bottom Actions */}
            <div className="mt-auto flex flex-col items-end gap-2 pt-4">
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => handleAction('reject')}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#dc2626] text-white font-medium rounded-lg hover:bg-red-700 transition-colors [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]"
                    >
                        ไม่อนุมัติการเบิกสินค้า
                    </button>
                    <button
                        onClick={() => handleAction('approve')}
                        disabled={allRejected}
                        className={`flex items-center gap-2 px-6 py-2.5 font-medium rounded-lg transition-colors ${allRejected ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#16a34a] text-white hover:bg-green-700 [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]'}`}
                    >
                        อนุมัติการเบิกสินค้า
                    </button>
                </div>
                {allRejected && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                        จำเป็นต้องเลือกอย่างน้อยหนึ่งรายการจึงจะสามารถอนุมัติการเบิกสินค้าได้
                    </p>
                )}
            </div>
        </div>
    )
}
