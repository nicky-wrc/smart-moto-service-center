import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function ReceptionRepairSuccessPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const data = location.state?.formData ?? {}

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/reception')
        }, 3000)
        return () => clearTimeout(timer)
    }, [navigate])

    return (
        <div className="p-6 max-w-xl mx-auto min-h-full flex flex-col items-center justify-center">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden w-full">
                <div className="flex flex-col items-center px-8 py-10 gap-4">
                    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-semibold text-gray-800 text-center">ส่งรายการให้ช่างสำเร็จ</h2>
                    <p className="text-gray-500 text-sm text-center">
                        ระบบได้ส่งข้อมูลอาการไปยังหัวหน้าช่างเรียบร้อยแล้ว
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                        ระบบจะพากลับหน้าหลักอัตโนมัติใน 3 วินาที...
                    </p>

                    {/* Info summary pill */}
                    <div className="flex flex-wrap justify-center gap-2 mt-1">
                        {data.model && (
                            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1 font-medium">
                                {data.model}
                            </span>
                        )}
                        {(data.plateLine1 || data.plateLine2) && (
                            <span className="text-xs bg-gray-100 text-gray-600 border border-gray-200 rounded-full px-3 py-1 font-medium">
                                {[data.plateLine1, data.plateLine2, data.province].filter(Boolean).join(' ')}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-3 px-8 pb-8">
                    <button
                        onClick={() => navigate('/reception')}
                        className="w-full sm:w-auto px-8 py-2.5 rounded-xl border border-transparent text-white font-medium bg-amber-500 hover:bg-amber-600 active:bg-amber-700 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-sm"
                    >
                        กลับหน้าหลัก
                    </button>
                </div>
            </div>
        </div>
    )
}
