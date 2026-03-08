import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useRequestHistory, type HistoryItem } from '../../contexts/RequestHistoryContext'
import { partRequisitionService } from '../../services/partRequisitionService'

export default function HistoryDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { history } = useRequestHistory()

    const [request, setRequest] = useState<HistoryItem | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [errorMsg, setErrorMsg] = useState('')

    useEffect(() => {
        let isMounted = true
        const fetchHistoryDetail = async () => {
            setIsLoading(true)
            try {
                const data = await partRequisitionService.getHistoryById(Number(id))
                if (isMounted) {
                    if (data) {
                        setRequest(data)
                    } else {
                        // Fallback to local session history if mock API returns null
                        const localData = history.find(r => r.id === Number(id))
                        if (localData) setRequest(localData)
                        else setErrorMsg(`ไม่พบประวัติคำร้องขอเบิกหมายเลข #${id}`)
                    }
                }
            } catch (err) {
                if (isMounted) setErrorMsg('เกิดข้อผิดพลาดในการโหลดข้อมูลประวัติ')
            } finally {
                if (isMounted) setIsLoading(false)
            }
        }
        fetchHistoryDetail()
        return () => { isMounted = false }
    }, [id, history])

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
                <p>{errorMsg || `ไม่พบประวัติคำร้องขอเบิกหมายเลข #${id}`}</p>
                <button
                    onClick={() => navigate('/inventory/history')}
                    className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]"
                >
                    กลับหน้าประวัติการเบิก
                </button>
            </div>
        )
    }

    const total = request.items.reduce((sum, item) => sum + item.quantity * item.pricePerUnit, 0)

    const isApproved = request.status === 'อนุมัติการเบิก'

    return (
        <div className="p-6 min-h-full flex flex-col">
            {/* Top Navigation */}
            <div className="flex items-center gap-2 text-gray-500 mb-6 cursor-pointer hover:text-amber-600 w-fit transition-colors" onClick={() => navigate('/inventory/history')}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="text-sm font-medium">ย้อนกลับ</span>
            </div>

            {/* Title & Request Meta Details */}
            <div className="flex flex-col gap-3 mb-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-medium text-gray-800">รายการคำร้องขอที่ {request.id}</h1>
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${isApproved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {request.status}
                        </span>
                    </div>
                </div>

                <div className="flex gap-6 text-sm text-gray-600">
                    <div className="flex flex-col gap-3 min-w-[280px]">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400">ผู้ทำเรื่องเบิก :</span>
                            <span>{request.requester} ({request.requesterRole})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400">ป้ายทะเบียน :</span>
                            <span>{request.licensePlate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400">วันที่ขอเบิก :</span>
                            <span>{request.requestedAt}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400">รุ่นรถ :</span>
                            <span>{request.motorcycleModel}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400">รายการคำขอ :</span>
                            <span>{request.items.length} รายการ ({request.items.reduce((s, i) => s + i.quantity, 0)} ชิ้น)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400">วันที่ทำรายการ :</span>
                            <span>{request.approvedAt}</span>
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
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                        {request.items.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-6 text-left">{item.partCode}</td>
                                <td className="py-4 px-6 text-left">{item.partName}</td>
                                <td className="py-4 px-6">{item.pricePerUnit}</td>
                                <td className="py-4 px-6">{item.quantity}</td>
                                <td className="py-4 px-6">{item.quantity * item.pricePerUnit}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-[#f8fafc] border-t border-gray-200">
                            <td colSpan={5} className="py-5 px-6">
                                <div className="flex items-center justify-end gap-6 w-full pr-8">
                                    <span className="text-gray-500 font-medium uppercase tracking-wider text-sm">Total</span>
                                    <span className="text-xl font-medium text-gray-900">{total}</span>
                                </div>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    )
}
