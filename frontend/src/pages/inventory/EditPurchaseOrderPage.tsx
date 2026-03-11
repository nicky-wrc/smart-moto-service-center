import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supplierService, type Supplier } from '../../services/supplierService'
import { purchaseOrderService } from '../../services/purchaseOrderService'
import PartSelectionModal from '../../components/PartSelectionModal'
import { type PartItem } from '../../data/partsMockData'

interface OrderItem extends PartItem {
    orderQuantity: number
}

const getTomorrowString = () => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
}

export default function EditPurchaseOrderPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [originalOrder, setOriginalOrder] = useState<any>(null)

    // Suppliers loaded from API
    const [suppliers, setSuppliers] = useState<Supplier[]>([])

    // Form State
    const [supplierId, setSupplierId] = useState<number | ''>('')
    const [deliveryDate, setDeliveryDate] = useState('')
    const [remarks, setRemarks] = useState('')
    const [managerMessage, setManagerMessage] = useState('')

    // Items State
    const [orderItems, setOrderItems] = useState<OrderItem[]>([])

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
    const [validationModal, setValidationModal] = useState({
        isOpen: false,
        isError: false,
        title: '',
        message: ''
    })

    // Load original data from API
    useEffect(() => {
        let mounted = true
        const load = async () => {
            try {
                const [order, sups] = await Promise.all([
                    purchaseOrderService.getById(id!),
                    supplierService.getAll(),
                ])
                if (!mounted) return
                if (order) {
                    setOriginalOrder(order)
                    setSupplierId(order.supplierId)
                    setDeliveryDate(order.deliveryDate)
                    setRemarks(order.remarks || '')
                    setManagerMessage(order.managerMessage || '')
                    setOrderItems(order.items.map((item: any) => ({
                        id: item.id,
                        partCode: item.partCode,
                        name: item.name || '',
                        category: item.category || 'General',
                        location: item.location || '',
                        quantity: item.quantity,
                        price: item.price || 0,
                        imageUrl: item.imageUrl || '',
                        orderQuantity: item.orderQuantity
                    })))
                } else {
                    navigate('/inventory/purchase-orders')
                }
                setSuppliers(sups)
            } catch (err) {
                console.error('Failed to load PO', err)
                navigate('/inventory/purchase-orders')
            }
        }
        load()
        return () => { mounted = false }
    }, [id, navigate])

    // Derived values
    const totalAmount = useMemo(() => {
        return orderItems.reduce((sum, item) => sum + ((item.price || 0) * item.orderQuantity), 0)
    }, [orderItems])

    // Handlers
    const handleAddPart = (part: PartItem) => {
        setOrderItems(prev => {
            const existing = prev.find(p => p.id === part.id)
            if (existing) {
                return prev.map(p => p.id === part.id ? { ...p, orderQuantity: p.orderQuantity + 1 } : p)
            }
            return [...prev, { ...part, orderQuantity: 1 }]
        })
        setIsModalOpen(false)
    }

    const handleUpdateQuantity = (id: number, qty: number) => {
        if (qty < 1) return
        setOrderItems(prev => prev.map(p => p.id === id ? { ...p, orderQuantity: qty } : p))
    }

    const handleRemoveItem = (id: number) => {
        setOrderItems(prev => prev.filter(p => p.id !== id))
    }

    const handleCancel = () => {
        setIsCancelModalOpen(true)
    }

    const confirmCancel = () => {
        setIsCancelModalOpen(false)
        navigate('/inventory/purchase-orders')
    }

    const handleSubmit = async (action: 'draft' | 'submit') => {
        if (!supplierId) {
            setValidationModal({
                isOpen: true,
                isError: true,
                title: 'กรุณาเลือกซัพพลายเออร์',
                message: 'กรุณาเลือกซัพพลายเออร์ที่ต้องการก่อน จึงจะสามารถบันทึกได้'
            })
            return
        }
        if (orderItems.length === 0) {
            setValidationModal({
                isOpen: true,
                isError: true,
                title: 'ไม่มีรายการสินค้า',
                message: 'กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการเพื่อบันทึกใบสั่งซื้อ'
            })
            return
        }

        const supplier = suppliers.find(s => s.id === supplierId)

        try {
            await purchaseOrderService.update(id!, {
                supplierId: supplierId as number,
                supplierName: (supplier as any)?.companyName || supplier?.name || 'Unknown Supplier',
                deliveryDate,
                totalAmount,
                status: (action === 'submit' ? 'pending' : 'draft') as 'draft' | 'pending',
                remarks,
                managerMessage,
                items: orderItems.map(item => ({
                    id: item.id,
                    partCode: item.partCode,
                    name: item.name,
                    category: item.category,
                    location: item.location,
                    quantity: item.quantity,
                    price: item.price,
                    imageUrl: item.imageUrl,
                    orderQuantity: item.orderQuantity
                })),
            })

            setValidationModal({
                isOpen: true,
                isError: false,
                title: action === 'draft' ? 'บันทึกการแก้ไขแบบร่างสำเร็จ!' : 'ส่งคำขอสั่งซื้อสำเร็จ!',
                message: 'กำลังกลับสู่หน้ารายการใบสั่งซื้อ...'
            })

            setTimeout(() => {
                navigate('/inventory/purchase-orders')
            }, 2000)
        } catch (err) {
            console.error('Failed to update PO:', err)
            setValidationModal({
                isOpen: true,
                isError: true,
                title: 'เกิดข้อผิดพลาด',
                message: 'ไม่สามารถบันทึกใบสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง'
            })
        }
    }

    if (!originalOrder) return <div className="p-6">กำลังโหลดข้อมูล...</div>

    return (
        <div className="p-6 bg-[#F5F5F5] min-h-full flex flex-col gap-6 relative">
            {/* Validation/Success Modal */}
            {validationModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
                            <p className="text-sm font-semibold text-[#F8981D] uppercase tracking-widest mb-0.5">Smart Moto Service Center</p>
                            <h2 className="text-base font-semibold text-[#1E1E1E]">
                                {validationModal.isError ? 'ข้อมูลไม่ครบถ้วน' : 'ทำรายการสำเร็จ'}
                            </h2>
                        </div>

                        {/* Content Area */}
                        <div className="px-6 py-8 flex flex-col items-center text-center gap-4">
                            <div className={`h-16 w-16 rounded-full flex items-center justify-center ${validationModal.isError ? 'bg-[#fee2e2]' : 'bg-[#e0f8e9]'}`}>
                                {validationModal.isError ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#00a650]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-[#1a202c]">{validationModal.title}</h3>
                                {validationModal.message && (
                                    <p className="text-sm font-semibold text-gray-500 mt-2 leading-relaxed max-w-[280px] mx-auto">
                                        {validationModal.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex border-t border-gray-100 shrink-0">
                            {validationModal.isError ? (
                                <button
                                    onClick={() => setValidationModal({ isOpen: false, isError: false, title: '', message: '' })}
                                    className="flex-1 py-4 text-sm font-semibold text-white bg-[#44403C] hover:bg-black transition-colors"
                                >
                                    รับทราบ
                                </button>
                            ) : (
                                <div className="flex-1 py-4 text-sm font-medium text-gray-500 bg-gray-50 text-center flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-amber-500 animate-spin"></div>
                                    กำลังพากลับ...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Confirmation Modal */}
            {isCancelModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setIsCancelModalOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
                            <p className="text-sm font-semibold text-[#F8981D] uppercase tracking-widest mb-0.5">Smart Moto Service Center</p>
                            <h2 className="text-base font-semibold text-[#1E1E1E]">
                                ยืนยันการยกเลิกการแก้ไข
                            </h2>
                        </div>

                        {/* Content Area */}
                        <div className="px-6 py-6 flex flex-col gap-6 overflow-y-auto">
                            <div className="flex flex-col items-center text-center gap-3">
                                <div className="h-16 w-16 rounded-full flex items-center justify-center bg-[#fee2e2]">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-[#1a202c]">ยืนยันการทำรายการนี้หรือไม่?</h3>
                                    <p className="text-sm text-gray-500 mt-1 px-4">
                                        ข้อมูลทั้งหมดที่คุณได้แก้ไขไว้ในหน้านี้จะไม่ถูกบันทึก<br />คุณต้องการยกเลิกใช่หรือไม่?
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Buttons Footer */}
                        <div className="flex border-t border-gray-100 shrink-0">
                            <button
                                onClick={() => setIsCancelModalOpen(false)}
                                className="flex-1 py-4 text-sm text-gray-500 hover:bg-gray-50 font-medium transition-colors border-r border-gray-100"
                            >
                                กลับไปแก้ไขต่อ
                            </button>
                            <button
                                onClick={confirmCancel}
                                className="flex-1 py-4 text-sm font-semibold text-white transition-colors border-none bg-[#44403C] hover:bg-black cursor-pointer"
                            >
                                ใช่ ยืนยันยกเลิก
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Navigation */}
            <div className="flex items-center gap-2 text-gray-500 cursor-pointer hover:text-amber-600 w-fit transition-colors" onClick={handleCancel}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="text-sm font-medium">ย้อนกลับ</span>
            </div>

            {/* Title & Request Meta Details */}
            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-medium text-gray-800">แก้ไขใบสั่งซื้อ: {originalOrder.id}</h1>
                        <p className="text-sm text-gray-500 mt-1">ปรับปรุงรายละเอียดการสั่งซื้อและรายการสินค้า</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-500">วันที่สร้างรายการ</div>
                        <div className="font-semibold text-gray-800">{originalOrder.createdAt}</div>
                    </div>
                </div>
            </div>

            {/* Main Single Card Container */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
                {/* Form Info Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 shrink-0">
                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">เลขที่ใบสั่งซื้อ</label>
                            <input
                                type="text"
                                value={originalOrder.id}
                                disabled
                                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ซัพพลายเออร์ที่ต้องการสั่งซื้อ <span className="text-red-500">*</span></label>
                            <select
                                value={supplierId}
                                onChange={(e) => setSupplierId(Number(e.target.value) || '')}
                                className="w-full text-sm border border-gray-300 rounded-xl px-4 py-2.5 bg-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                            >
                                <option value="">-- เลือกซัพพลายเออร์ --</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.id}>{(s as any).companyName || s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">วันที่สั่งซื้อ (Order Date)</label>
                            <input
                                type="date"
                                value={originalOrder.createdAt}
                                disabled
                                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">วันที่ต้องการรับ <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                value={deliveryDate}
                                min={getTomorrowString()}
                                onChange={(e) => setDeliveryDate(e.target.value)}
                                className="w-full text-sm border border-gray-300 rounded-xl px-4 py-2.5 bg-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col h-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">หมายเหตุข้อความถึงผู้จัดการ</label>
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="ระบุข้อความถึงผู้จัดการ (ถ้ามี).."
                            className="w-full text-sm border border-gray-300 rounded-xl px-4 py-3 bg-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 flex-1 min-h-[100px] resize-none"
                        ></textarea>
                    </div>

                    <div className="flex flex-col h-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">หมายเหตุข้อความถึงซัพพลายเออร์</label>
                        <textarea
                            value={managerMessage}
                            onChange={(e) => setManagerMessage(e.target.value)}
                            placeholder="ระบุข้อความถึงซัพพลายเออร์ (เช่น ขอส่งด่วนเช้า,ส่งที่โกดัง 2)"
                            className="w-full text-sm border border-gray-300 rounded-xl px-4 py-3 bg-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 flex-1 min-h-[100px] resize-none"
                        ></textarea>
                    </div>
                </div>

                <hr className="border-gray-200 my-8 shrink-0" />

                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex justify-between items-center mb-4 shrink-0">
                        <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            รายการสินค้าที่สั่งซื้อ
                        </h3>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-transparent border-2 border-amber-500 text-amber-600 hover:bg-amber-50 px-4 py-2 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            เพิ่มสินค้า
                        </button>
                    </div>

                    <div className="flex-1 min-h-0">
                        {orderItems.length === 0 ? (
                            <div className="min-h-[300px] flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                <div className="w-16 h-16 mb-3 text-gray-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 font-medium">ไม่มีสินค้าในใบสั่งซื้อ</p>
                            </div>
                        ) : (
                            <div className="min-h-[300px] max-h-[500px] overflow-hidden rounded-xl border border-gray-200 shadow-inner flex flex-col relative">
                                <div className="overflow-y-auto overflow-x-auto flex-1 absolute inset-0">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-[#f8fafc]/95 backdrop-blur-md text-gray-600 shadow-sm sticky top-0 z-20">
                                            <tr>
                                                <th className="py-3 px-4 w-12 text-center font-medium">ลำดับ</th>
                                                <th className="py-3 px-4 font-medium">รูปสินค้า</th>
                                                <th className="py-3 px-4 border-r border-gray-200 font-medium">รหัส/ชื่อสินค้า</th>
                                                <th className="py-3 px-4 text-right font-medium">ราคาต่อหน่วย</th>
                                                <th className="py-3 px-4 text-center font-medium">จำนวนสั่ง</th>
                                                <th className="py-3 px-4 text-right font-medium">จำนวนเงิน</th>
                                                <th className="py-3 px-4 w-16 text-center font-medium">ลบ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {orderItems.map((item, index) => (
                                                <tr key={item.id} className="hover:bg-amber-50/30 transition-colors">
                                                    <td className="py-3 px-4 text-center text-gray-500">{index + 1}</td>
                                                    <td className="py-3 px-4">
                                                        <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden border border-gray-200">
                                                            <img
                                                                src={item.imageUrl}
                                                                alt={item.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/e2e8f0/94a3b8.png?text=No+Img'
                                                                }}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 border-r border-gray-100">
                                                        <div className="font-medium text-gray-800">{item.name}</div>
                                                        <div className="text-sm text-gray-500 mt-0.5">{item.partCode}</div>
                                                    </td>
                                                    <td className="py-3 px-4 text-right text-gray-700 font-medium">
                                                        ฿{(item.price || 0).toLocaleString()}
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.orderQuantity}
                                                            onChange={(e) => handleUpdateQuantity(item.id, Number(e.target.value))}
                                                            className="w-20 text-center border border-gray-300 rounded-lg px-2 py-1.5 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none font-medium text-amber-700 bg-amber-50/50"
                                                        />
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-medium text-gray-800">
                                                        ฿{((item.price || 0) * item.orderQuantity).toLocaleString()}
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <button
                                                            onClick={() => handleRemoveItem(item.id)}
                                                            className="w-8 h-8 rounded-full flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors mx-auto"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50/95 backdrop-blur-sm border-t-2 border-gray-200 sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                                            <tr>
                                                <td colSpan={5} className="py-4 px-5 text-right font-medium text-gray-700 text-base">ยอดรวมทั้งหมด:</td>
                                                <td className="py-4 px-4 text-right font-medium text-amber-600 text-lg">
                                                    ฿{totalAmount.toLocaleString()}
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 shrink-0">
                <button
                    onClick={handleCancel}
                    className="px-6 py-2.5 rounded-xl text-gray-600 font-semibold hover:bg-gray-200 transition-colors"
                >
                    ยกเลิกการแก้ไข
                </button>
                <button
                    onClick={() => handleSubmit('draft')}
                    className="px-6 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors"
                >
                    บันทึกเป็นแบบร่าง
                </button>
                <button
                    onClick={() => handleSubmit('submit')}
                    className="px-8 py-2.5 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 shadow-md shadow-amber-500/20 transition-all active:scale-95 [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]"
                >
                    ยืนยันการแก้ไขและส่งคำขอ
                </button>
            </div>

            <PartSelectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelectPart={handleAddPart}
            />
        </div>
    )
}
