import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import SearchBox from '../../components/SearchBox'
import { customersService, type Customer, type Motorcycle } from '../../services/customers'
import { formatMotorcycleName } from '../../utils/motorcycle'



export default function ReceptionSearchPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const [searchQuery, setSearchQuery] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [allCustomers, setAllCustomers] = useState<Customer[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Load customers from API
    useEffect(() => {
        const loadCustomers = async () => {
            setIsLoading(true)
            try {
                const customers = await customersService.list()
                setAllCustomers(customers)
            } catch (err) {
                console.error('Failed to load customers', err)
            } finally {
                setIsLoading(false)
            }
        }
        loadCustomers()
    }, [location])

    // Filters
    const [filterName, setFilterName] = useState('')
    const [filterPhone, setFilterPhone] = useState('')
    const [filterPlate, setFilterPlate] = useState('')
    const [filterModel, setFilterModel] = useState('')

    // Modal state
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

    const filteredCustomers = useMemo(() => {
        return allCustomers.filter(customer => {
            const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase()
            const allPlates = (customer.motorcycles || []).map(m => m.licensePlate).join(' ').toLowerCase()
            const allModels = (customer.motorcycles || []).map(m => formatMotorcycleName(m.brand, m.model)).join(' ').toLowerCase()

            if (searchQuery) {
                const query = searchQuery.toLowerCase()
                const matchesSearch =
                    fullName.includes(query) ||
                    customer.phoneNumber.includes(query) ||
                    allPlates.includes(query) ||
                    allModels.includes(query)
                if (!matchesSearch) return false
            }

            if (filterName && !fullName.includes(filterName.toLowerCase())) return false
            if (filterPhone && !customer.phoneNumber.includes(filterPhone)) return false
            if (filterPlate && !allPlates.includes(filterPlate.toLowerCase())) return false
            if (filterModel && !allModels.includes(filterModel.toLowerCase())) return false

            return true
        })
    }, [allCustomers, searchQuery, filterName, filterPhone, filterPlate, filterModel])

    const handleSelectMotorcycle = (customer: Customer, motorcycle: Motorcycle) => {
        // Parse licensePlate string "กกก จังหวัด 1234" into parts
        const plateParts = (motorcycle.licensePlate || '').split(' ')
        let plateLine1 = ''
        let province = ''
        let plateLine2 = ''
        
        if (plateParts.length >= 3) {
            plateLine1 = plateParts[0]
            province = plateParts[1]
            plateLine2 = plateParts.slice(2).join(' ')
        } else if (plateParts.length === 2) {
            plateLine1 = plateParts[0]
            plateLine2 = plateParts[1]
        } else {
            plateLine1 = motorcycle.licensePlate || ''
        }

        navigate('/reception/repair', {
            state: {
                formData: {
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    phone: customer.phoneNumber,
                    address: customer.address || '',
                    model: formatMotorcycleName(motorcycle.brand, motorcycle.model),
                    color: motorcycle.color || '',
                    plateLine1,
                    plateLine2,
                    province,
                    customerId: customer.id,
                    motorcycleId: motorcycle.id,
                },
                isExistingCustomer: true,
                isNewMotorcycle: false,
            }
        })
    }

    const handleAddNewMotorcycle = (customer: Customer) => {
        navigate('/reception/register', {
            state: {
                formData: {
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    phone: customer.phoneNumber,
                    address: customer.address || '',
                    model: '',
                    color: '',
                    plateLine1: '',
                    plateLine2: '',
                    province: '',
                },
                returnTo: 'newMoto',
                isExistingCustomer: true,
                isNewMotorcycle: true,
            }
        })
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
                    ย้อนกลับ
                </button>
                <h2 className="text-2xl font-semibold text-gray-800">ค้นหาประวัติลูกค้าเก่า</h2>
                <p className="text-gray-500 text-sm mt-1">ค้นหาจากชื่อ, เบอร์โทร, ป้ายทะเบียน หรือรุ่นรถ เพื่อทำรายการต่อ</p>
            </div>

            {/* Search and Filters Section */}
            <div className="mb-6 flex flex-col gap-4">
                <div className="flex w-full items-center gap-4">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-full border transition-colors ${showFilters ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        ตัวกรองเพิ่มเติม
                    </button>

                    <div className="flex-1">
                        <SearchBox
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="ค้นหาด่วน สมชาย, 1กข, 081..."
                        />
                    </div>
                </div>

                {/* Filter Row */}
                {showFilters && (
                    <div className="relative mt-2 p-5 bg-white rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-2">
                        <div className="absolute -top-[10px] left-[35px] w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-white z-20" />
                        <div className="absolute -top-[12px] left-[35px] w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[12px] border-b-gray-200 z-10" />

                        <div className="relative z-30 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">ชื่อ-นามสกุล</label>
                                <input
                                    type="text"
                                    value={filterName}
                                    onChange={(e) => setFilterName(e.target.value)}
                                    placeholder="เช่น สมชาย"
                                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">เบอร์โทรศัพท์</label>
                                <input
                                    type="text"
                                    value={filterPhone}
                                    onChange={(e) => setFilterPhone(e.target.value)}
                                    placeholder="เช่น 081"
                                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">ป้ายทะเบียน</label>
                                <input
                                    type="text"
                                    value={filterPlate}
                                    onChange={(e) => setFilterPlate(e.target.value)}
                                    placeholder="เช่น 1กข"
                                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">รุ่นรถที่เคยเอาเข้าซ่อม</label>
                                <input
                                    type="text"
                                    value={filterModel}
                                    onChange={(e) => setFilterModel(e.target.value)}
                                    placeholder="เช่น Wave"
                                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Results List */}
            <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                {filteredCustomers.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">ไม่พบข้อมูลลูกค้า</h3>
                        <p className="text-gray-500 mb-6">ลองปรับเปลี่ยนคำค้นหาหรือเพิ่มตัวกรองใหม่</p>
                        <button
                            onClick={() => navigate('/reception/register', { state: { returnTo: 'search' } })}
                            className="text-amber-600 font-medium hover:text-amber-700 hover:underline"
                        >
                            หรือ เพิ่มลูกค้าใหม่
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                        <table className="w-full text-sm text-center min-w-[800px]">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-[#f8fafc] text-gray-600 border-b border-gray-200 font-medium">
                                    <th className="py-4 px-6 text-left font-medium whitespace-nowrap">ชื่อ-นามสกุล</th>
                                    <th className="py-4 px-6 text-left font-medium whitespace-nowrap">เบอร์โทรศัพท์</th>
                                    <th className="py-4 px-6 text-left font-medium whitespace-nowrap">ป้ายทะเบียน</th>
                                    <th className="py-4 px-6 text-left font-medium whitespace-nowrap">รุ่นรถที่เคยเอาเข้าซ่อม</th>
                                    <th className="py-4 px-6 text-center font-medium whitespace-nowrap">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700">
                                {filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="py-4 px-6 text-left font-medium text-gray-900 align-top">
                                            {customer.firstName} {customer.lastName}
                                        </td>
                                        <td className="py-4 px-6 text-left text-gray-600 align-top">
                                            {customer.phoneNumber}
                                        </td>
                                        <td className="py-4 px-6 text-left align-top">
                                            <div className="flex flex-col gap-2">
                                                {(customer.motorcycles || []).map(m => (
                                                    <div key={m.id} className="inline-flex w-fit items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                                        {m.licensePlate}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-left text-gray-600 align-top">
                                            <div className="flex flex-col gap-2">
                                                {(customer.motorcycles || []).map(m => (
                                                    <div key={m.id} className="py-1 text-xs">
                                                        {formatMotorcycleName(m.brand, m.model)} <span className="text-gray-400">({m.color})</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-center align-top">
                                            <button
                                                onClick={() => setSelectedCustomer(customer)}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]"
                                            >
                                                แจ้งซ่อม
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Motorcycle Selection Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedCustomer(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800">ลูกค้ารายนี้มีรถในประวัติ {(selectedCustomer.motorcycles || []).length} คัน</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    คุณ {selectedCustomer.firstName} {selectedCustomer.lastName} ({selectedCustomer.phoneNumber})
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedCustomer(null)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
                            <p className="text-sm font-medium text-gray-700 mb-1">โปรดเลือกรถที่ต้องการแจ้งซ่อม:</p>

                            <div className="flex flex-col gap-3">
                                {(selectedCustomer.motorcycles || []).map(m => (
                                    <div
                                        key={m.id}
                                        onClick={() => handleSelectMotorcycle(selectedCustomer, m)}
                                        className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-amber-400 hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5 group bg-white"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <h4 className="font-semibold text-gray-800 group-hover:text-amber-600 transition-colors">{formatMotorcycleName(m.brand, m.model)}</h4>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold tracking-wide bg-gray-100 text-gray-700 border border-gray-200">
                                                        {m.licensePlate}
                                                    </span>
                                                    <span className="text-xs text-gray-500 font-medium">สี{m.color}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity ml-4 shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-gray-200"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-medium uppercase tracking-wider">หรือ</span>
                                <div className="flex-grow border-t border-gray-200"></div>
                            </div>

                            <button
                                onClick={() => handleAddNewMotorcycle(selectedCustomer)}
                                className="flex justify-center flex-col items-center gap-2 p-5 border-2 border-dashed border-gray-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-sm cursor-pointer transition-all group"
                            >
                                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-100 transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700 group-hover:text-emerald-700 transition-colors">เพิ่มรายละเอียดรถคันใหม่</span>
                                </div>
                                <p className="text-xs text-gray-500 text-center max-w-[280px]">
                                    ระบบจะให้กรอกรายละเอียดรถมอเตอร์ไซค์คันอื่นของลูกค้า และนำไปแจ้งซ่อมรายการใหม่ทันที
                                </p>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    )
}
