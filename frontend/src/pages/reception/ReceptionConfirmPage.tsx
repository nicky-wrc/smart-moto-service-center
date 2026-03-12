import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { addReceptionHistory } from '../../utils/receptionHistory'
import { receptionApiService } from '../../services/receptionApiService'

interface RegistrationData {
    firstName: string
    lastName: string
    phone: string
    address: string
    model: string
    color: string
    plateLine1: string
    plateLine2: string
    province: string
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-0">
            <span className="text-sm text-gray-400 sm:w-44 shrink-0">{label}</span>
            <span className="text-sm text-gray-800 font-medium">{value || '-'}</span>
        </div>
    )
}

export default function ReceptionConfirmPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const data: RegistrationData = location.state?.formData ?? {}
    const returnTo = location.state?.returnTo // Pass through returnTo flag

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || '-'
    const licensePlate = [data.plateLine1, data.plateLine2, data.province].filter(Boolean).join(' ')

    const handleConfirm = async () => {
        setIsLoading(true)
        setError(null)

        try {
            // Create customer + motorcycle in the backend database
            const licensePlateStr = `${data.plateLine1} ${data.province} ${data.plateLine2}`.trim()
            
            const customerResult = await receptionApiService.createOrGetCustomer({
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                address: data.address || '',
            });
            
            // Create motorcycle for this customer
            const motoResult = await receptionApiService.createOrGetMotorcycle({
                customerId: customerResult.id,
                model: data.model,
                color: data.color,
                plateLine1: data.plateLine1,
                plateLine2: data.plateLine2,
                province: data.province,
            });

            // Make sure to pass IDs to next step
            data.customerId = customerResult.id;
            data.motorcycleId = motoResult.id;

            // Also save to local reception history as a log
            addReceptionHistory({
                activityType: 'ลงทะเบียนใหม่',
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                model: data.model,
                color: data.color,
                plateLine1: data.plateLine1,
                plateLine2: data.plateLine2,
                province: data.province,
            })

            navigate('/reception/success', { state: { formData: data, returnTo } })
        } catch (err: any) {
            console.error('Error creating customer:', err)
            setError(err?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="h-full flex flex-col bg-[#F5F5F5]">
            <div className="p-6 w-full flex-1 flex flex-col">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-sm font-medium text-gray-500 hover:text-amber-600 mb-3 transition-colors"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    กลับไปแก้ไข
                </button>
                <h2 className="text-2xl font-semibold text-gray-800">ตรวจสอบข้อมูลของท่าน</h2>
                <p className="text-gray-500 text-sm mt-1">กรุณาตรวจสอบข้อมูลด้านล่างก่อนดำเนินการต่อ</p>
            </div>

            <div className="flex flex-col gap-5">
                {/* Personal Info Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <h3 className="text-base font-semibold text-gray-800">ข้อมูลส่วนบุคคล</h3>
                    </div>
                    <div className="px-6 py-5 flex flex-col gap-3.5">
                        <InfoRow label="ชื่อ-นามสกุล" value={fullName} />
                        <InfoRow label="เบอร์โทรศัพท์" value={data.phone || '-'} />
                    </div>
                </div>

                {/* Motorcycle Info Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                        <svg className="h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 24" fill="currentColor">
                            <path d="M8.632 15.526a2.112 2.112 0 0 0-2.106 2.105v4.305a2.106 2.106 0 0 0 4.212 0v-.043v.002v-4.263a2.112 2.112 0 0 0-2.104-2.106z" />
                            <path d="M16.263 2.631H12.21C11.719 1.094 10.303 0 8.631 0S5.544 1.094 5.06 2.604l-.007.027h-4a1.053 1.053 0 0 0 0 2.106h4.053c.268.899.85 1.635 1.615 2.096l.016.009c-2.871.867-4.929 3.48-4.947 6.577v5.528a1.753 1.753 0 0 0 1.736 1.737h1.422v-3a3.737 3.737 0 1 1 7.474 0v3h1.421a1.752 1.752 0 0 0 1.738-1.737v-5.474a6.855 6.855 0 0 0-4.899-6.567l-.048-.012a3.653 3.653 0 0 0 1.625-2.08l.007-.026h4.053a1.056 1.056 0 0 0 1.053-1.053a1.149 1.149 0 0 0-1.104-1.105h-.002zM8.631 5.84a2.106 2.106 0 1 1 2.106-2.106l.001.06c0 1.13-.916 2.046-2.046 2.046l-.063-.001h.003z" />
                        </svg>
                        <h3 className="text-base font-semibold text-gray-800">ข้อมูลรถมอเตอร์ไซค์</h3>
                    </div>
                    <div className="px-6 py-5 flex flex-col gap-3.5">
                        <InfoRow label="รุ่นรถ" value={data.model || '-'} />
                        <InfoRow label="สีรถ" value={data.color || '-'} />
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1 mt-1 border-t border-gray-100">
                            <span className="text-sm text-gray-400 sm:w-44 shrink-0">ป้ายทะเบียน</span>
                            <div className="flex items-center gap-4">
                                {/* Mini License Plate Preview */}
                                <div className="border-[2.5px] border-gray-700 rounded bg-white w-[130px] flex flex-col items-center py-1.5 px-2 relative shadow-sm shrink-0">
                                    <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-gray-300 border border-gray-400"></div>
                                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-gray-300 border border-gray-400"></div>
                                    <span className="text-lg font-bold text-gray-900 tracking-wider leading-tight">{data.plateLine1 || '-'}</span>
                                    <div className="w-full border-t border-gray-200/80 my-0.5"></div>
                                    <span className="text-[10px] font-semibold text-gray-700 leading-tight">{data.province || '-'}</span>
                                    <div className="w-full border-t border-gray-200/80 my-0.5"></div>
                                    <span className="text-xl font-bold text-gray-900 tracking-widest leading-tight">{data.plateLine2 || '-'}</span>
                                </div>
                                <span className="text-sm text-gray-700 font-medium">{licensePlate || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                        ⚠️ {error}
                    </div>
                )}
                <div className="flex justify-end gap-4 mt-4 pb-8">
                    <button
                        onClick={() => navigate(-1)}
                        disabled={isLoading}
                        className="min-w-[180px] px-10 py-3.5 rounded-xl border-2 border-amber-400 text-amber-600 text-base font-semibold bg-white hover:bg-amber-50 active:bg-amber-100 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/30 disabled:opacity-50"
                    >
                        กลับไปแก้ไข
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="min-w-[180px] px-10 py-3.5 rounded-xl border-2 border-transparent text-white text-base font-semibold bg-amber-500 hover:bg-amber-600 active:bg-amber-700 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-lg disabled:opacity-50"
                    >
                        {isLoading ? 'กำลังบันทึก...' : 'ยืนยันบันทึก'}
                    </button>
                </div>
            </div>
            </div>
        </div>
    )
}
