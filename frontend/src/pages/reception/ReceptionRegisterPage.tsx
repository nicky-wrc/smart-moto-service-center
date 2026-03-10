import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PROVINCES } from '../../data/provinces'

const MOTORCYCLE_MODELS = [
    'Honda Wave 110i', 'Honda Wave 125i', 'Honda PCX 160', 'Honda Click 160',
    'Honda Scoopy i', 'Honda ADV 160', 'Honda Forza 350',
    'Yamaha XMAX 300', 'Yamaha NMAX 155', 'Yamaha Aerox 155', 'Yamaha Grand Filano',
    'Vespa LX 125', 'Vespa Primavera 150', 'Vespa Sprint 150', 'อื่นๆ'
]

export default function ReceptionRegisterPage() {
    const navigate = useNavigate()

    // For demonstration only - simple state to handle form interactions
    const [formData, setFormData] = useState({
        // Personal Info
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        // Motorcycle Info
        model: '',
        color: '',
        // License Plate Info
        plateLine1: '',
        plateLine2: '',
        province: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Mock save logic, redirect to a mock dashboard or back to list
        alert('บันทึกข้อมูลลูกค้าใหม่ รหัสลูกค้า: CUS-001 สำเร็จ!')
        navigate('/reception')
    }

    return (
        <div className="p-6 max-w-5xl mx-auto min-h-full">
            {/* Header section */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <button
                        onClick={() => navigate('/reception')}
                        className="flex items-center text-sm font-medium text-gray-500 hover:text-amber-600 mb-2 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        ย้อนกลับ
                    </button>
                    <h2 className="text-2xl font-semibold text-gray-800">ลงทะเบียนลูกค้าใหม่</h2>
                    <p className="text-gray-500 text-sm mt-1">กรอกข้อมูลส่วนบุคคลและข้อมูลรถเพื่อบันทึกประวัติการรับบริการ</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Section 1: ข้อมูลส่วนบุคคล (Personal Information) */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-800">ข้อมูลส่วนบุคคล</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">ชื่อ <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    placeholder="เช่น สมชาย"
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">นามสกุล <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    placeholder="เช่น ใจดี"
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    placeholder="08X-XXX-XXXX"
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: ข้อมูลรถมอเตอร์ไซค์ (Motorcycle Information) */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                        <svg className="h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 24" fill="currentColor">
                            <path d="M8.632 15.526a2.112 2.112 0 0 0-2.106 2.105v4.305a2.106 2.106 0 0 0 4.212 0v-.043v.002v-4.263a2.112 2.112 0 0 0-2.104-2.106z" />
                            <path d="M16.263 2.631H12.21C11.719 1.094 10.303 0 8.631 0S5.544 1.094 5.06 2.604l-.007.027h-4a1.053 1.053 0 0 0 0 2.106h4.053c.268.899.85 1.635 1.615 2.096l.016.009c-2.871.867-4.929 3.48-4.947 6.577v5.528a1.753 1.753 0 0 0 1.736 1.737h1.422v-3a3.737 3.737 0 1 1 7.474 0v3h1.421a1.752 1.752 0 0 0 1.738-1.737v-5.474a6.855 6.855 0 0 0-4.899-6.567l-.048-.012a3.653 3.653 0 0 0 1.625-2.08l.007-.026h4.053a1.056 1.056 0 0 0 1.053-1.053a1.149 1.149 0 0 0-1.104-1.105h-.002zM8.631 5.84a2.106 2.106 0 1 1 2.106-2.106l.001.06c0 1.13-.916 2.046-2.046 2.046l-.063-.001h.003z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-800">ข้อมูลรถมอเตอร์ไซค์</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">รุ่นรถ (Model) <span className="text-red-500">*</span></label>
                                <select
                                    name="model"
                                    value={formData.model}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white transition-all appearance-none"
                                >
                                    <option value="" disabled>เลือกรุ่นรถ</option>
                                    {MOTORCYCLE_MODELS.map(model => (
                                        <option key={model} value={model}>{model}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">สีรถ <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="color"
                                    value={formData.color}
                                    onChange={handleChange}
                                    required
                                    placeholder="เช่น ดำ-แดง"
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white transition-all"
                                />
                            </div>

                            <div className="md:col-span-2 pt-2 pb-1">
                                <div className="flex items-center gap-3">
                                    <div className="h-px bg-gray-200 flex-1"></div>
                                    <span className="text-sm font-medium text-gray-500">ข้อมูลป้ายทะเบียน</span>
                                    <div className="h-px bg-gray-200 flex-1"></div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">ป้ายทะเบียนบรรทัดบน <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="plateLine1"
                                    value={formData.plateLine1}
                                    onChange={handleChange}
                                    required
                                    placeholder="เช่น 1กข"
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white transition-all uppercase"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1.5">บรรทัดล่าง <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="plateLine2"
                                        value={formData.plateLine2}
                                        onChange={handleChange}
                                        required
                                        placeholder="เช่น 1234"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1.5">จังหวัด <span className="text-red-500">*</span></label>
                                    <select
                                        name="province"
                                        value={formData.province}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white transition-all appearance-none"
                                    >
                                        <option value="" disabled>เลือกจังหวัด</option>
                                        <option value="กรุงเทพมหานคร">กรุงเทพมหานคร</option>
                                        {PROVINCES.filter(p => p !== 'กรุงเทพมหานคร').map(province => (
                                            <option key={province} value={province}>{province}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* License Plate Mockup */}
                            <div className="md:col-span-2 flex flex-col items-center mt-6 p-6 bg-gray-50/50 rounded-xl border border-gray-100">
                                <span className="text-sm font-medium text-gray-500 mb-4 text-center">ตัวอย่างป้ายทะเบียนรถ</span>
                                <div className="border-[3px] border-gray-800 rounded-lg bg-white w-[220px] aspect-[4/3] flex flex-col items-center justify-between p-3 relative shadow-md">
                                    {/* Screws */}
                                    <div className="absolute top-2.5 left-2.5 w-2 h-2 rounded-full bg-gray-300 border border-gray-400 shadow-inner"></div>
                                    <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-gray-300 border border-gray-400 shadow-inner"></div>

                                    <div className="flex-1 w-full flex flex-col items-center justify-center">
                                        <span className="text-4xl font-semibold text-gray-900 tracking-wider">
                                            {formData.plateLine1 || '1กข'}
                                        </span>
                                    </div>
                                    <div className="w-full flex justify-center py-1">
                                        <span className="text-3xl font-semibold text-gray-800 tracking-tight">
                                            {formData.province || 'กรุงเทพมหานคร'}
                                        </span>
                                    </div>
                                    <div className="flex-1 w-full flex flex-col items-center justify-center">
                                        <span className="text-4xl font-semibold text-gray-900 tracking-widest">
                                            {formData.plateLine2 || '1234'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 mt-2 pb-8">
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
                        บันทึกและสร้างใบรับรถ
                    </button>
                </div>
            </form>
        </div>
    )
}
