import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { mockRequests } from '../../data/requestsMockData'

type ConfirmAction = 'approve' | 'reject' | null
type ResultScreen = 'approved' | 'rejected' | null

export default function RequestDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const request = mockRequests.find((r) => r.id === Number(id))
    const [rejectedItemIds, setRejectedItemIds] = useState<Set<number>>(new Set())
    const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
    const [resultScreen, setResultScreen] = useState<ResultScreen>(null)

    // Auto-redirect after showing result screen
    useEffect(() => {
        if (resultScreen) {
            const timer = setTimeout(() => navigate('/inventory/requests'), 3000)
            return () => clearTimeout(timer)
        }
    }, [resultScreen, navigate])

    if (!request) {
        return (
            <div className="p-6 text-center text-gray-400">
                <p>ไม่พบรายการคำร้องขอเบิกหมายเลข #{id}</p>
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
                    <p className="text-sm text-gray-400 mt-2">กำลังกลับสู่หน้าหลัก...</p>
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
                    <p className="text-sm text-gray-400 mt-2">กำลังกลับสู่หน้าหลัก...</p>
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

    const handleConfirm = () => {
        setConfirmAction(null)
        setResultScreen(confirmAction === 'approve' ? 'approved' : 'rejected')
    }

    return (
        <div className="p-6 min-h-full flex flex-col">
            {/* Confirmation Dialog */}
            {confirmAction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 flex flex-col items-center gap-5">
                        <div className={`h-14 w-14 rounded-full flex items-center justify-center ${confirmAction === 'approve' ? 'bg-green-100' : 'bg-red-100'}`}>
                            {confirmAction === 'approve' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                </svg>
                            )}
                        </div>
                        <div className="text-center">
                            <h2 className="text-lg font-semibold text-gray-800">ยืนยันการทำรายการนี้หรือไม่?</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {confirmAction === 'approve' ? 'คุณกำลังจะอนุมัติการเบิกสินค้า' : 'คุณกำลังจะไม่อนุมัติการเบิกสินค้า'}
                            </p>
                        </div>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => setConfirmAction(null)}
                                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleConfirm}
                                className={`flex-1 py-2.5 rounded-lg text-white text-sm font-medium transition-colors [text-shadow:_0_1px_0_rgb(0_0_0_/_30%)] ${confirmAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                            >
                                ใช่ ยืนยัน
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
                    <span className="text-gray-500 text-sm flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
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
                                <tr key={item.id} className={`transition-colors ${isRejected ? 'bg-red-50/50 opacity-60' : 'hover:bg-gray-50'}`}>
                                    <td className="py-4 px-6 text-left">{item.partCode}</td>
                                    <td className="py-4 px-6 text-left">{item.partName}</td>
                                    <td className="py-4 px-6">{item.pricePerUnit}</td>
                                    <td className="py-4 px-6">{item.quantity}</td>
                                    <td className="py-4 px-6">{item.quantity * item.pricePerUnit}</td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center justify-center gap-4">
                                            <button
                                                onClick={() => toggleReject(item.id)}
                                                className={`flex items-center justify-center gap-1.5 w-32 py-1.5 text-xs font-medium text-white rounded transition-colors [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)] ${isRejected ? 'bg-teal-500 hover:bg-teal-600' : 'bg-[#f59e0b] hover:bg-amber-600'}`}
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
                                            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#255B91] text-white rounded hover:bg-blue-800 transition-colors [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]">
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
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        ไม่อนุมัติการเบิกสินค้า
                    </button>
                    <button
                        onClick={() => handleAction('approve')}
                        disabled={allRejected}
                        className={`flex items-center gap-2 px-6 py-2.5 font-medium rounded-lg transition-colors ${allRejected ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#16a34a] text-white hover:bg-green-700 [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        อนุมัติการเบิกสินค้า
                    </button>
                </div>
                {allRejected && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        จำเป็นต้องเลือกอย่างน้อยหนึ่งรายการจึงจะสามารถอนุมัติการเบิกสินค้าได้
                    </p>
                )}
            </div>
        </div>
    )
}
