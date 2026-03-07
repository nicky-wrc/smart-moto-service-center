import { useState } from 'react'

function PaginationBar() {

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(2)

  // mock data
  const data = [
    { id: 1, name: "Honda Wave 110i", plate: "กข 1234", status: "กำลังซ่อม" },
    { id: 2, name: "Yamaha NMAX", plate: "ขค 5678", status: "รอซ่อม" },
    { id: 3, name: "Honda PCX", plate: "งจ 9012", status: "ซ่อมเสร็จแล้ว" },
    { id: 4, name: "Suzuki Smash", plate: "จฉ 3456", status: "กำลังตรวจสอบ" }
  ]

  const total = data.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))

  const start = (page - 1) * perPage + 1
  const end = Math.min(page * perPage, total)

  const paginatedData = data.slice((page - 1) * perPage, page * perPage)

  const getPageNumbers = (current: number, total: number) => {
    const pages = []
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
    return pages
  }

  const pageNumbers = getPageNumbers(page, totalPages)

  const handlePerPageChange = (val: number) => {
    setPerPage(Math.max(1, val))
    setPage(1)
  }

  return (
    <div>

      {/* pagination */}
      <div className="shrink-0 border-t border-gray-200 bg-white px-5 py-3 flex items-center justify-between">

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>แสดง</span>
          <input
            type="number"
            value={perPage}
            min={1}
            onChange={(e) => handlePerPageChange(Number(e.target.value))}
            className="w-14 border border-gray-200 rounded-lg px-2 py-1 text-center text-sm outline-none focus:border-[#F8981D]"
          />
          <span>{total === 0 ? '0' : `${start}–${end}`} จาก {total}</span>
        </div>

        <div className="flex items-center gap-1">

          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 disabled:opacity-30"
          >
            ‹
          </button>

          {pageNumbers.map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`w-8 h-8 rounded-full text-sm font-medium ${
                n === page
                  ? 'bg-[#F8981D] text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 disabled:opacity-30"
          >
            ›
          </button>

        </div>
      </div>
    </div>
  )
}

export default PaginationBar