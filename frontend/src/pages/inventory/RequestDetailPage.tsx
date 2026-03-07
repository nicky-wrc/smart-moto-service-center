import { useParams, useNavigate } from 'react-router-dom'
import { mockRequests } from '../../data/requestsMockData'

export default function RequestDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const request = mockRequests.find((r) => r.id === Number(id))

    if (!request) {
        return (
            <div className="p-6 text-center text-gray-400">
                <p>ไม่พบรายการคำร้องขอเบิกหมายเลข #{id}</p>
                <button
                    onClick={() => navigate('/inventory/requests')}
                    className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors"
                >
                    กลับหน้ารายการ
                </button>
            </div>
        )
    }

    const total = request.items.reduce((sum, item) => sum + item.quantity * item.pricePerUnit, 0)

    return (
        <div className="p-6">
            {/* Back button */}
            <button
                onClick={() => navigate('/inventory/requests')}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-amber-600 mb-5 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                กลับหน้ารายการ
            </button>

            {/* Header card */}
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-6">
                <div className="flex items-center justify-between bg-amber-500 px-4 py-2">
                    <span className="text-white font-semibold text-sm">คำร้องขอเบิก #{request.id}</span>
                    <span className="text-white text-xs flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {request.requestedAt}
                    </span>
                </div>
                <div className="bg-white px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
                    {/* Requester */}
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A8 8 0 1118.88 6.196M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>
                            <span className="text-gray-400">ผู้ทำเรื่องเบิก : </span>
                            {request.requester} ({request.requesterRole})
                        </span>
                    </div>

                    {/* Motorcycle model */}
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 0a2 2 0 00-2 2m2-2a2 2 0 012 2m-6 4a6 6 0 0112 0m-6 0v4m0 0H9m3 0h3" />
                            <circle cx="5" cy="17" r="2" />
                            <circle cx="19" cy="17" r="2" />
                        </svg>
                        <span>
                            <span className="text-gray-400">รุ่นรถ : </span>
                            {request.motorcycleModel}
                        </span>
                    </div>

                    {/* License plate */}
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <rect x="3" y="7" width="18" height="10" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 12h10" />
                        </svg>
                        <span>
                            <span className="text-gray-400">ป้ายทะเบียน : </span>
                            {request.licensePlate}
                        </span>
                    </div>

                    {/* Item count */}
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span>
                            <span className="text-gray-400">รายการค้าขอ : </span>
                            {request.items.length} รายการ ({request.items.reduce((s, i) => s + i.quantity, 0)} ชิ้น)
                        </span>
                        
                    </div>
                    
                </div>
                
            </div>

            {/* Items table */}
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                            <th className="text-left px-4 py-3 font-semibold w-10">#</th>
                            <th className="text-left px-4 py-3 font-semibold">รหัสอะไหล่</th>
                            <th className="text-left px-4 py-3 font-semibold">ชื่ออะไหล่</th>
                            <th className="text-right px-4 py-3 font-semibold">จำนวน</th>
                            <th className="text-left px-4 py-3 font-semibold">หน่วย</th>
                            <th className="text-right px-4 py-3 font-semibold">ราคาต่อหน่วย</th>
                            <th className="text-right px-4 py-3 font-semibold">รวม</th>
                            <th className="text-center px-4 py-3 font-semibold">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {request.items.map((item, idx) => (
                            <tr key={item.id} className="text-gray-700 hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                                <td className="px-4 py-3 font-mono text-xs text-gray-500">{item.partCode}</td>
                                <td className="px-4 py-3">{item.partName}</td>
                                <td className="px-4 py-3 text-right">{item.quantity}</td>
                                <td className="px-4 py-3 text-gray-500">{item.unit}</td>
                                <td className="px-4 py-3 text-right">{item.pricePerUnit.toLocaleString()} ฿</td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-800">
                                    {(item.quantity * item.pricePerUnit).toLocaleString()} ฿
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-1">
                                        <button className="px-2 py-1 text-xs bg-red-50 text-red-500 border border-red-200 rounded hover:bg-red-100 transition-colors">
                                            ปฏิเสธ
                                        </button>
                                        <button className="px-2 py-1 text-xs bg-blue-50 text-blue-500 border border-blue-200 rounded hover:bg-blue-100 transition-colors">
                                            แก้ไข
                                        </button>
                                        <button className="px-2 py-1 text-xs bg-gray-50 text-gray-500 border border-gray-200 rounded hover:bg-gray-100 transition-colors">
                                            ดู
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-amber-50 border-t-2 border-amber-200">
                            <td colSpan={6} className="px-4 py-3 text-right font-semibold text-gray-700 text-sm">
                                ยอดรวมทั้งหมด
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-amber-700 text-base">
                                {total.toLocaleString()} ฿
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-1">
                                    <button className="px-3 py-1.5 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors font-semibold">
                                        ปฏิเสธทั้งหมด
                                    </button>
                                    <button className="px-3 py-1.5 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors font-semibold">
                                        อนุมัติทั้งหมด
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    )
}
