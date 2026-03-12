import { useNavigate, useLocation } from 'react-router-dom'

export default function ReceptionSuccessPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const data = location.state?.formData ?? {}
    const returnTo = location.state?.returnTo // Check if we should return to search page
    const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim()

    const handleBackToMain = () => {
        if (returnTo === 'search') {
            navigate('/reception/search')
        } else {
            navigate('/reception')
        }
    }

    return (
        <div className="p-6 max-w-xl mx-auto min-h-full flex flex-col items-center justify-center">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden w-full">
                <div className="flex flex-col items-center px-8 py-10 gap-4">
                    {/* Checkmark Icon */}
                    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-semibold text-gray-800 text-center">เพิ่มข้อมูลลูกค้าใหม่สำเร็จ</h2>
                    {fullName && (
                        <p className="text-gray-500 text-sm text-center">
                            บันทึกข้อมูลของ <span className="font-medium text-gray-700">{fullName}</span> เรียบร้อยแล้ว
                        </p>
                    )}

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

                <div className="flex flex-col sm:flex-row justify-between gap-3 px-8 pb-8">
                    <button
                        onClick={handleBackToMain}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium bg-white hover:bg-gray-50 active:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-gray-200"
                    >
                        {returnTo === 'search' ? 'กลับหน้าค้นหา' : 'กลับหน้าหลัก'}
                    </button>
                    <button
                        onClick={() => navigate('/reception/repair', { 
                            state: { 
                                formData: data,
                                isExistingCustomer: true,
                                isNewMotorcycle: false
                            } 
                        })}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-transparent text-white font-medium bg-amber-500 hover:bg-amber-600 active:bg-amber-700 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-sm"
                    >
                        เพิ่มอาการแจ้งซ่อม
                    </button>
                </div>
            </div>
        </div>
    )
}
