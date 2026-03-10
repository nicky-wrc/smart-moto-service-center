import { useState, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

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

export default function ReceptionRepairPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const data: RegistrationData = location.state?.formData ?? {}

    const [symptoms, setSymptoms] = useState('')
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [symptomsError, setSymptomsError] = useState('')
    const [tagsError, setTagsError] = useState('')
    const [vehicleError, setVehicleError] = useState('')
    const [images, setImages] = useState<{ url: string; name: string }[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFiles = useCallback((files: FileList | null) => {
        if (!files) return
        const allowed = Array.from(files).filter(f =>
            f.type === 'image/jpeg' || f.type === 'image/png'
        )
        const previews = allowed.map(f => ({ url: URL.createObjectURL(f), name: f.name }))
        setImages(prev => [...prev, ...previews])
    }, [])

    const removeImage = (index: number) => {
        setImages(prev => {
            URL.revokeObjectURL(prev[index].url)
            return prev.filter((_, i) => i !== index)
        })
    }

    const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim()
    const licensePlate = [data.plateLine1, data.plateLine2, data.province].filter(Boolean).join(' ')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        let hasError = false

        if (!symptoms.trim()) {
            setSymptomsError('โปรดระบุอาการที่ต้องการแจ้งซ่อม')
            hasError = true
        } else {
            setSymptomsError('')
        }

        if (selectedTags.length === 0) {
            setTagsError('โปรดเลือกแท็กอาการอย่างน้อย 1 รายการ')
            hasError = true
        } else {
            setTagsError('')
        }

        if (!data.model || !data.plateLine1 || !data.province) {
            setVehicleError('กรุณาเพิ่มข้อมูลรถมอเตอร์ไซค์ให้ครบถ้วนก่อนส่งใบแจ้งซ่อม (กดที่ปุ่มแก้ไขข้อมูล)')
            hasError = true
        } else {
            setVehicleError('')
        }

        if (hasError) return

        // TODO: Submit to API
        navigate('/reception/repair-success', { state: { formData: data } })
    }

    return (
        <div className="p-6 max-w-3xl mx-auto min-h-full">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-sm font-medium text-gray-500 hover:text-amber-600 mb-3 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    ย้อนกลับ
                </button>
                <h2 className="text-2xl font-semibold text-gray-800">แจ้งอาการเข้าซ่อม</h2>
                <p className="text-gray-500 text-sm mt-1">กรอกอาการและรายละเอียดที่ต้องการให้ช่างตรวจสอบ</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                {/* ===== Summary: Personal Info ===== */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <h3 className="text-base font-semibold text-gray-800">ข้อมูลส่วนบุคคล</h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('/reception/register', { state: { formData: data, returnTo: 'repair' } })}
                            className="flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:text-amber-700 border border-amber-300 hover:border-amber-400 bg-amber-50 hover:bg-amber-100 rounded-lg px-3 py-1.5 transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            แก้ไขข้อมูล
                        </button>
                    </div>
                    <div className="px-6 py-5 flex flex-col gap-3.5">
                        <InfoRow label="ชื่อ-นามสกุล" value={fullName || '-'} />
                        <InfoRow label="เบอร์โทรศัพท์" value={data.phone || '-'} />
                        {data.address && <InfoRow label="ที่อยู่" value={data.address} />}
                    </div>
                </div>

                {/* ===== Summary: Motorcycle Info ===== */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <svg className="h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 24" fill="currentColor">
                                <path d="M8.632 15.526a2.112 2.112 0 0 0-2.106 2.105v4.305a2.106 2.106 0 0 0 4.212 0v-.043v.002v-4.263a2.112 2.112 0 0 0-2.104-2.106z" />
                                <path d="M16.263 2.631H12.21C11.719 1.094 10.303 0 8.631 0S5.544 1.094 5.06 2.604l-.007.027h-4a1.053 1.053 0 0 0 0 2.106h4.053c.268.899.85 1.635 1.615 2.096l.016.009c-2.871.867-4.929 3.48-4.947 6.577v5.528a1.753 1.753 0 0 0 1.736 1.737h1.422v-3a3.737 3.737 0 1 1 7.474 0v3h1.421a1.752 1.752 0 0 0 1.738-1.737v-5.474a6.855 6.855 0 0 0-4.899-6.567l-.048-.012a3.653 3.653 0 0 0 1.625-2.08l.007-.026h4.053a1.056 1.056 0 0 0 1.053-1.053a1.149 1.149 0 0 0-1.104-1.105h-.002zM8.631 5.84a2.106 2.106 0 1 1 2.106-2.106l.001.06c0 1.13-.916 2.046-2.046 2.046l-.063-.001h.003z" />
                            </svg>
                            <h3 className="text-base font-semibold text-gray-800">ข้อมูลรถมอเตอร์ไซค์</h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('/reception/register', { state: { formData: data, returnTo: 'repair' } })}
                            className="flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:text-amber-700 border border-amber-300 hover:border-amber-400 bg-amber-50 hover:bg-amber-100 rounded-lg px-3 py-1.5 transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            แก้ไขข้อมูล
                        </button>
                    </div>
                    <div className="px-6 py-5 flex flex-col gap-3.5 relative">
                        {vehicleError && (
                            <div className="absolute inset-0 bg-red-50/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-4 text-center rounded-b-2xl border-t border-red-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <p className="text-sm text-red-600 font-medium">กรุณาเพิ่มข้อมูลรถมอเตอร์ไซค์ให้ครบถ้วนก่อนส่งใบแจ้งซ่อม</p>
                                <button
                                    type="button"
                                    onClick={() => navigate('/reception/register', { state: { formData: data, returnTo: 'repair' } })}
                                    className="mt-3 px-4 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-lg transition-colors"
                                >
                                    คลิกที่นี่เพื่อเพิ่มข้อมูลรถ
                                </button>
                            </div>
                        )}
                        <InfoRow label="รุ่นรถ" value={data.model || '-'} />
                        <InfoRow label="สีรถ" value={data.color || '-'} />
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1 mt-1 border-t border-gray-100">
                            <span className="text-sm text-gray-400 sm:w-44 shrink-0">ป้ายทะเบียน</span>
                            <div className="flex items-center gap-4">
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

                {/* ===== Symptom Input ===== */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="text-base font-semibold text-gray-800">อาการแจ้งซ่อม</h3>
                    </div>
                    <div className="p-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                รายละเอียดอาการ <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="symptoms"
                                value={symptoms}
                                onChange={(e) => {
                                    setSymptoms(e.target.value)
                                    if (e.target.value.trim()) setSymptomsError('')
                                }}
                                rows={5}
                                placeholder="เช่น เครื่องยนต์ดับบ่อย, เบรกไม่ค่อยจับ, ไฟหน้าไม่ติด..."
                                className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white transition-all resize-none text-sm ${symptomsError ? 'border-red-500 bg-red-50/50' : 'border-gray-200'
                                    }`}
                            />
                            {symptomsError && (
                                <p className="mt-1.5 text-xs text-red-500 font-medium">* {symptomsError}</p>
                            )}
                            <p className="mt-1.5 text-xs text-gray-400">กรุณาอธิบายอาการให้ชัดเจนที่สุดเพื่อประโยชน์ในการวินิจฉัย</p>
                        </div>

                        {/* ===== Symptom Tags ===== */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <label className="block text-sm font-medium text-gray-600 mb-3">แท็ก</label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    'เครื่องยนต์', 'ไฟฟ้า', 'เบรก',
                                    'ช่วงล่าง', 'ส่งกำลัง', 'เชื้อเพลิง',
                                    'ระบายความร้อน', 'บำรุงรักษา'
                                ].map(tag => {
                                    const active = selectedTags.includes(tag)
                                    return (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => {
                                                const next = active
                                                    ? selectedTags.filter(t => t !== tag)
                                                    : [...selectedTags, tag]
                                                setSelectedTags(next)
                                                if (next.length > 0) setTagsError('')
                                            }}
                                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all select-none
                                                ${active
                                                    ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                                                    : 'bg-white border-dashed border-gray-300 text-gray-500 hover:border-amber-400 hover:text-amber-600'
                                                }`}
                                        >
                                            {active ? `${tag} ×` : `${tag} +`}
                                        </button>
                                    )
                                })}
                            </div>
                            {tagsError && (
                                <p className="mt-2 text-xs text-red-500 font-medium">* {tagsError}</p>
                            )}
                        </div>

                        {/* ===== Image Upload ===== */}
                        <div className="mt-4 pt-5 border-t border-gray-100">
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                รูปภาพประกอบ <span className="text-xs text-gray-400 font-normal">(ไม่บังคับ)</span>
                            </label>

                            {/* Drop Zone */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={(e) => {
                                    e.preventDefault()
                                    setIsDragging(false)
                                    handleFiles(e.dataTransfer.files)
                                }}
                                className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-8 cursor-pointer transition-all select-none ${isDragging
                                    ? 'border-amber-400 bg-amber-50'
                                    : 'border-gray-200 bg-gray-50 hover:border-amber-300 hover:bg-amber-50/40'
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 transition-colors ${isDragging ? 'text-amber-400' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-sm text-gray-400">วางรูปภาพที่นี่ หรือ <span className="text-amber-600 font-mediumเ">คลิกเพื่อเลือกไฟล์</span></p>
                                <p className="text-xs text-gray-300">รองรับ JPG และ PNG</p>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png"
                                multiple
                                className="hidden"
                                onChange={(e) => handleFiles(e.target.files)}
                            />

                            {/* Image Previews */}
                            {images.length > 0 && (
                                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm aspect-square">
                                            <img
                                                src={img.url}
                                                alt={img.name}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-gray-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ===== Action Buttons ===== */}
                <div className="flex justify-end gap-3 mt-2 pb-8">
                    <button
                        type="button"
                        onClick={() => navigate('/reception')}
                        className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium bg-white hover:bg-gray-50 active:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-gray-200"
                    >
                        ยกเลิก
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl border border-transparent text-white font-medium bg-amber-500 hover:bg-amber-600 active:bg-amber-700 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-sm"
                    >
                        ส่งใบแจ้งซ่อม
                    </button>
                </div>
            </form>
        </div>
    )
}
