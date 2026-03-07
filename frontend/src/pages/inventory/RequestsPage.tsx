import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockRequests } from '../../data/requestsMockData'
import SearchBox from '../../components/SearchBox'

export default function RequestsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const filtered = mockRequests.filter((req) => {
    const q = search.toLowerCase()
    return (
      req.requester.toLowerCase().includes(q) ||
      req.motorcycleModel.toLowerCase().includes(q) ||
      req.licensePlate.toLowerCase().includes(q) ||
      req.items.some((item) => item.partName.toLowerCase().includes(q)) ||
      `คำร้องขอเบิก #${req.id}`.includes(q)
    )
  })

  return (
    <div className="p-6">
      {/* Search box */}
      <div className="mb-6">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="ค้นหาในเบิก..."
        />
      </div>
      {/* Request cards */}
      <div className="flex flex-col gap-4">
        {filtered.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-10">ไม่พบรายการที่ค้นหา</p>
        )}
        {filtered.map((req) => (
          <div
            key={req.id}
            onClick={() => navigate(`/inventory/requests/${req.id}`)}
            className="border border-amber-400 rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          >
            {/* Card header */}
            <div className="flex items-center justify-between bg-[#2C2A27] px-4 py-2">
              <span className="text-amber-400 font-semibold text-sm">คำร้องขอเบิก #{req.id}</span>
              <span className="text-gray-300 text-xs flex items-center gap-1">
                {/* Calendar icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {req.requestedAt}
              </span>
            </div>

            {/* Card body */}
            <div className="bg-white px-5 py-4 grid grid-cols-1 gap-y-2">
              {/* Requester */}
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A8 8 0 1118.88 6.196M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>
                  <span className="text-gray-400">ผู้ทำเรื่องเบิก : </span>
                  {req.requester} ({req.requesterRole})
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
                  {req.motorcycleModel}
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
                  {req.licensePlate}
                </span>
              </div>

              {/* Item count */}
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>
                  <span className="text-gray-400">รายการค้าขอ : </span>
                  {req.items.length} รายการ ({req.items.reduce((s, i) => s + i.quantity, 0)} ชิ้น)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
