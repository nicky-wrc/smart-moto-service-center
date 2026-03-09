import { useState } from "react"
import { useNavigate } from "react-router-dom"

const testData = [
  { id: "0000001", customer: "ธาดา รถ",       plate: "กข123",  total: 3500, status: "รอชำระ" },
  { id: "0000002", customer: "สมชาย การ์ด",   plate: "ขค456",  total: 2100, status: "รอชำระ" },
  { id: "0000003", customer: "สมชาย การ์ด",   plate: "ขค456",  total: 2100, status: "ชำระแล้ว" },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "รอชำระ":   return "bg-yellow-400"
    case "ชำระแล้ว": return "bg-green-500"
    case "ยกเลิก":   return "bg-red-500"
    default:          return "bg-gray-400"
  }
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '...')[] = [1]
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i)
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}

const searchFields = [
  { value: "all",      label: "ทั้งหมด" },
  { value: "id",       label: "เลขใบงาน" },
  { value: "customer", label: "ลูกค้า" },
  { value: "plate",    label: "ทะเบียนรถ" },
]

function Pendingpayment() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [searchField, setSearchField] = useState("all")
  const [openSearchField, setOpenSearchField] = useState(false)
  const [sortBy, setSortBy] = useState("newest")
  const [openSort, setOpenSort] = useState(false)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const filteredData = testData.filter((item) => {
    if (!search) return true
    if (searchField === "id")       return item.id.includes(search)
    if (searchField === "customer") return item.customer.includes(search)
    if (searchField === "plate")    return item.plate.includes(search)
    return item.id.includes(search) || item.customer.includes(search) || item.plate.includes(search)
  })

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortBy === "newest")     return b.id.localeCompare(a.id)
    if (sortBy === "oldest")     return a.id.localeCompare(b.id)
    if (sortBy === "price-high") return b.total - a.total
    if (sortBy === "price-low")  return a.total - b.total
    return 0
  })

  const total = sortedData.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const start = total === 0 ? 0 : (page - 1) * perPage + 1
  const end = Math.min(page * perPage, total)
  const visibleItems = sortedData.slice((page - 1) * perPage, page * perPage)
  const pageNumbers = getPageNumbers(page, totalPages)

  const handleSearch = (val: string) => { setSearch(val); setPage(1) }

  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="px-7 pt-7 pb-1 flex-1 flex flex-col overflow-hidden">

        <div className="w-full h-12 flex items-center justify-between shrink-0">
          <div className="w-full h-full flex items-center rounded-full relative">
            <div className="relative h-full">
              <button
                onClick={() => setOpenSearchField(!openSearchField)}
                className="pl-8 pr-4 flex items-center bg-[#F8981D] h-full rounded-l-full cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="whitespace-nowrap">
                    {searchFields.find(f => f.value === searchField)?.label ?? "ทั้งหมด"}
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </button>
              {openSearchField && (
                <div className="absolute left-0 top-full mt-2 bg-white rounded-lg shadow-[0_0px_4px_rgba(0,0,0,0.2)] z-20 min-w-30">
                  {searchFields.map(f => (
                    <button
                      key={f.value}
                      onClick={() => { setSearchField(f.value); setOpenSearchField(false); setPage(1) }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 text-sm ${searchField === f.value ? "font-semibold text-[#F8981D]" : ""}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center justify-start w-full h-[95%] pl-3 pr-6 shadow-[0_0px_2px_rgba(0,0,0,0.4)] rounded-r-full">
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={`ค้นหา${searchFields.find(f => f.value === searchField)?.label === "ทั้งหมด" ? "เลขใบงาน / ลูกค้า / ทะเบียนรถ" : searchFields.find(f => f.value === searchField)?.label}`}
                className="w-full h-[95%] outline-none text-sm"
              />
            </div>
          </div>

          <div className="h-full ml-5">
            <div className="relative h-full">
              <button
                onClick={() => setOpenSort(!openSort)}
                className="rounded-full whitespace-nowrap px-8 flex items-center bg-white h-full shadow-[0_0px_2px_rgba(0,0,0,0.4)] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div>จัดเรียงตาม</div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                  </svg>
                </div>
              </button>
              {openSort && (
                <div className="absolute right-0 mt-2 w-42 bg-white rounded-lg shadow-[0_0px_2px_rgba(0,0,0,0.4)] z-20">
                  {[
                    { value: "newest",     label: "ล่าสุด" },
                    { value: "oldest",     label: "เก่าสุด" },
                    { value: "price-high", label: "ยอดสูง → ต่ำ" },
                    { value: "price-low",  label: "ยอดต่ำ → สูง" },
                  ].map(opt => (
                    <button key={opt.value} onClick={() => { setSortBy(opt.value); setOpenSort(false) }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100">
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full flex-1 mt-6 overflow-x-auto">
          <table className="min-w-180.5 w-full text-sm text-black">
            <thead className="bg-[#F5F5F5] text-black">
              <tr>
                <th className="px-6 py-5 text-left font-medium rounded-l-2xl">เลขใบงาน</th>
                <th className="px-6 py-5 text-left font-medium">ชื่อลูกค้า</th>
                <th className="px-6 py-5 text-left font-medium">ทะเบียนรถ</th>
                <th className="px-6 py-5 text-left font-medium">ยอดรวม</th>
                <th className="px-6 py-5 text-center font-medium">สถานะ</th>
                <th className="px-6 py-5 text-center font-medium rounded-r-2xl">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 border-b border-gray-200">
              {visibleItems.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">ไม่มีรายการ</td></tr>
              )}
              {visibleItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-5">{item.id}</td>
                  <td className="px-6 py-5">{item.customer}</td>
                  <td className="px-6 py-5">{item.plate}</td>
                  <td className="px-6 py-5">{item.total.toLocaleString()}</td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center w-fit mx-auto gap-2">
                      <span className={`w-2 h-2 rounded-full ${getStatusColor(item.status)}`}></span>
                      {item.status}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    {item.status === "ชำระแล้ว" ? (
                      <button onClick={() => navigate(`/accountant/pendingpayment/${item.id}`)}
                        className="flex items-center gap-2 bg-[#7eccff] text-white text-xs px-4 py-2 rounded-md mx-auto cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-6 9.75-6 9.75 6 9.75 6-3.75 6-9.75 6-9.75-6-9.75-6Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                        </svg>
                        ดูข้อมูล
                      </button>
                    ) : (
                      <button onClick={() => navigate(`/accountant/pendingpayment/${item.id}`)}
                        className="flex items-center gap-2 bg-green-600 text-white text-xs px-4 py-2 rounded-md mx-auto cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                        </svg>
                        รับชำระ
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="shrink-0 border-t border-gray-100 bg-white py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>{total === 0 ? '0 รายการ' : `${start}–${end} จาก ${total} รายการ`}</span>
            <span className="text-gray-200">·</span>
            <span>แถวละ</span>
            <select
              value={perPage}
              onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1) }}
              className="border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-[#F8981D] transition-colors cursor-pointer bg-white"
            >
              {[10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed bg-transparent border-none cursor-pointer transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            {pageNumbers.map((n, i) =>
              n === '...' ? (
                <span key={`e-${i}`} className="w-8 h-8 flex items-center justify-center text-sm text-gray-400">…</span>
              ) : (
                <button key={n} onClick={() => setPage(n)}
                  className={`w-8 h-8 rounded-full text-sm font-medium border-none cursor-pointer transition-colors ${n === page ? 'bg-[#F8981D] text-white' : 'text-gray-500 hover:bg-gray-100 bg-transparent'}`}>
                  {n}
                </button>
              )
            )}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed bg-transparent border-none cursor-pointer transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Pendingpayment
