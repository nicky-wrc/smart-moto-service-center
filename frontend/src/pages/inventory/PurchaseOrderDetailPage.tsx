import { useParams, useNavigate } from 'react-router-dom'
import { mockPurchaseOrders, type POStatus } from '../../data/purchaseOrdersMockData'

const StatusBadge = ({ status }: { status: POStatus }) => {
    switch (status) {
        case 'draft':
            return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"><span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>แบบร่าง</span>
        case 'pending':
            return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>รออนุมัติ</span>
        case 'approved':
            return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>อนุมัติแล้ว</span>
        case 'rejected':
            return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-600 border border-red-200"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>ไม่อนุมัติ</span>
        case 'cancelled':
            return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>ยกเลิกแล้ว</span>
    }
}

export default function PurchaseOrderDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const request = mockPurchaseOrders.find(o => o.id === id)

    if (!request) {
        return (
            <div className="p-6 text-center text-gray-400">
                <p>ไม่พบใบสั่งซื้อหมายเลข #{id}</p>
                <button
                    onClick={() => navigate('/inventory/purchase-orders')}
                    className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]"
                >
                    กลับหน้าคำสั่งซื้อ
                </button>
            </div>
        )
    }

    return (
        <div className="p-6 min-h-full flex flex-col">
            {/* Top Navigation */}
            <div className="flex items-center gap-2 text-gray-500 mb-6 cursor-pointer hover:text-amber-600 w-fit transition-colors" onClick={() => navigate('/inventory/purchase-orders')}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="text-sm font-medium">ย้อนกลับ</span>
            </div>

            {/* Title & Request Meta Details */}
            <div className="flex flex-col gap-3 mb-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-medium text-gray-800">รายละเอียดใบสั่งซื้อที่ {request.id}</h1>
                        <StatusBadge status={request.status} />
                    </div>
                </div>

                <div className="flex gap-6 text-sm text-gray-600">
                    <div className="flex flex-col gap-3 min-w-[280px]">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400">ซัพพลายเออร์ :</span>
                            <span>{request.supplierName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400">วันที่สร้าง :</span>
                            <span>{request.createdAt}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400">วันที่ต้องการของ :</span>
                            <span>{request.deliveryDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400">รายการสินค้ารวม :</span>
                            <span>{request.items.length} รายการ ({request.items.reduce((s, i) => s + i.orderQuantity, 0)} ชิ้น)</span>
                        </div>
                    </div>
                </div>

                {request.managerMessage && (
                    <div className="mt-2 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100 flex gap-3 items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 mt-0.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="font-semibold mb-1">ข้อความจากผู้จัดการ</p>
                            <p>{request.managerMessage}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Table Content */}
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white flex-1 mb-6">
                <table className="w-full text-sm text-center">
                    <thead>
                        <tr className="bg-[#f3f4f6] text-gray-600 font-medium border-b border-gray-200">
                            <th className="py-4 px-6 text-left font-medium">รหัสสินค้า</th>
                            <th className="py-4 px-6 text-left font-medium">ชื่อสินค้า</th>
                            <th className="py-4 px-6 font-medium">ราคาต่อหน่วย</th>
                            <th className="py-4 px-6 font-medium">จำนวนที่สั่ง</th>
                            <th className="py-4 px-6 font-medium">ยอดรวม (฿)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                        {request.items.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-6 text-left">{item.partCode}</td>
                                <td className="py-4 px-6 text-left">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900">{item.name}</span>
                                        <span className="text-xs text-gray-500 mt-1">หมวดหมู่: {item.category}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-6">{item.price.toLocaleString()}</td>
                                <td className="py-4 px-6">{item.orderQuantity}</td>
                                <td className="py-4 px-6 font-medium text-gray-900">{(item.orderQuantity * item.price).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-[#f8fafc] border-t border-gray-200">
                            <td colSpan={5} className="py-5 px-6">
                                <div className="flex flex-col items-end gap-2 w-full pr-8">
                                    <div className="flex items-center justify-end gap-6 w-full text-lg">
                                        <span className="text-gray-500 font-medium tracking-wider text-sm">ยอดรวมทั้งหมด</span>
                                        <span className="text-2xl font-bold text-gray-900">฿{request.totalAmount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    )
}
