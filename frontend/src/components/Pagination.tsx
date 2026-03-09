type Props = {
  page: number
  perPage: number
  total: number
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  perPageOptions?: number[]
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

export default function Pagination({ page, perPage, total, onPageChange, onPerPageChange, perPageOptions = [10, 20, 50] }: Props) {
  const totalPages  = Math.max(1, Math.ceil(total / perPage))
  const start       = total === 0 ? 0 : (page - 1) * perPage + 1
  const end         = Math.min(page * perPage, total)
  const pageNumbers = getPageNumbers(page, totalPages)

  return (
    <div className="shrink-0 border-t border-gray-100 bg-white px-5 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <span>{total === 0 ? '0 รายการ' : `${start}–${end} จาก ${total} รายการ`}</span>
        <span className="text-gray-200">·</span>
        <span>แถวละ</span>
        <select
          value={perPage}
          onChange={e => { onPerPageChange(Number(e.target.value)); onPageChange(1) }}
          className="border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-[#F8981D] transition-colors cursor-pointer bg-white"
        >
          {perPageOptions.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed bg-transparent border-none cursor-pointer transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {pageNumbers.map((n, i) =>
          n === '...' ? (
            <span key={`e-${i}`} className="w-8 h-8 flex items-center justify-center text-sm text-gray-400">…</span>
          ) : (
            <button key={n} onClick={() => onPageChange(n)}
              className={`w-8 h-8 rounded-full text-sm font-medium border-none cursor-pointer transition-colors ${n === page ? 'bg-[#F8981D] text-white' : 'text-gray-500 hover:bg-gray-100 bg-transparent'}`}>
              {n}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed bg-transparent border-none cursor-pointer transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
