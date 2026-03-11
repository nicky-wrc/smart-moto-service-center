import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { paymentsService, type Payment } from "../../services/payments"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import { IoDocumentOutline, IoPrint } from "react-icons/io5";
import { FaCreditCard } from "react-icons/fa"
import { FaChevronDown } from "react-icons/fa"
import { FaPlus } from "react-icons/fa6";
import { FiDownload } from "react-icons/fi";



function convertToISO(dateStr: string) {
  const [day, month, year] = dateStr.split("/")
  return `${year}-${month}-${day}`
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


type ReceiptItem = {
  name: string
  price: number
}

type Receipt = {
  id: string
  date: string
  customer: string
  plate: string
  payment: string
  staff: string
  status: string
  total: number
  items: ReceiptItem[]
}

const METHOD_LABEL: Record<string, string> = {
  CASH: 'เงินสด',
  CREDIT_CARD: 'บัตรเครดิต',
  DEBIT_CARD: 'บัตรเดบิต',
  TRANSFER: 'โอนเงิน',
  POINTS: 'แต้ม',
}

function formatDateTH(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

function mapPaymentToReceipt(p: Payment): Receipt {
  const items: ReceiptItem[] = []
  if (p.job?.laborTimes) {
    for (const lt of p.job.laborTimes) {
      items.push({ name: lt.serviceName, price: Number(lt.laborCost) })
    }
  }
  if (p.job?.outsources) {
    for (const os of p.job.outsources) {
      items.push({ name: os.description, price: Number(os.cost) })
    }
  }
  if (p.job?.partRequisitions) {
    for (const req of p.job.partRequisitions) {
      if (req.status === 'APPROVED' && req.items) {
        for (const ri of req.items) {
          items.push({ name: ri.part.name, price: Number(ri.unitPrice) * ri.quantity })
        }
      }
    }
  }
  return {
    id: p.paymentNo,
    date: formatDateTH(p.paidAt ?? p.createdAt),
    customer: p.customer ? `${p.customer.firstName} ${p.customer.lastName}` : '-',
    plate: p.job?.motorcycle?.licensePlate ?? '-',
    payment: METHOD_LABEL[p.paymentMethod] ?? p.paymentMethod,
    staff: '-',
    status: p.paymentStatus === 'REFUNDED' ? 'cancelled' : 'completed',
    total: Number(p.totalAmount),
    items,
  }
}

function PaymentHistoryPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState("newest")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [openCancelModal, setOpenCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [openReceipt, setOpenReceipt] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)

  const [dateRange, setDateRange] = useState({
    start: "",
    end: ""
  })

  const [historyData, setHistoryData] = useState<Receipt[]>([])

  useEffect(() => {
    setLoading(true)
    paymentsService.list({ status: 'PAID' })
      .then(payments => setHistoryData(payments.map(mapPaymentToReceipt)))
      .catch(err => console.error('Failed to load payments:', err))
      .finally(() => setLoading(false))
  }, [])

  const [paymentFilter, setPaymentFilter] = useState("ทั้งหมด")
  const [openPayment, setOpenPayment] = useState(false)

  const buildReceiptHTML = (r: Receipt, label: string) => {
    const subtotal = r.items.reduce((s, i) => s + i.price, 0)
    const vat = subtotal * 0.07
    const total = subtotal + vat
    const year = new Date().getFullYear()
    const rows = r.items.map((item, i) => `
      <tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'}">
        <td style="padding:8px 12px;color:#aaa;font-size:11px">${i + 1}</td>
        <td style="padding:8px 12px;font-weight:500;color:#1E1E1E">${item.name}</td>
        <td style="padding:8px 12px;text-align:right;color:#555">${item.price.toLocaleString()} ฿</td>
      </tr>`).join('')
    return `
      <div style="font-family:sans-serif;font-size:13px;color:#1E1E1E">
        <div style="background:#F8981D;color:white;font-size:10px;font-weight:700;padding:5px 14px;border-radius:5px;display:inline-block;margin-bottom:14px;letter-spacing:0.5px">${label}</div>
        <div style="display:flex;align-items:flex-start;justify-content:space-between;padding-bottom:20px;margin-bottom:20px;border-bottom:2px solid #F8981D">
          <div>
            <p style="font-size:20px;font-weight:900;color:#F8981D;letter-spacing:-0.5px;margin:0">RevUp</p>
            <p style="font-size:11px;font-weight:600;color:#aaa;letter-spacing:3px;text-transform:uppercase;margin:2px 0 0">Service Center</p>
            <div style="margin-top:10px;font-size:10px;color:#bbb;line-height:1.7">
              <p style="margin:0">123 อาคารวิทยวิภาส ถนนมิตรภาพ ตำบลในเมือง อำเภอเมืองขอนแก่น จังหวัดขอนแก่น 40002</p>
              <p style="margin:0">โทร 02-111-2233 · smartmoto@example.com</p>
              <p style="margin:0">เลขประจำตัวผู้เสียภาษี 0-1234-56789-01-2</p>
            </div>
          </div>
          <div style="text-align:right">
            <p style="font-size:17px;font-weight:bold;margin:0">ใบเสร็จรับเงิน</p>
            <p style="font-size:10px;color:#aaa;margin:5px 0 0">เลขที่ RC-${String(r.id).padStart(5, '0')}-${year}</p>
            <p style="font-size:10px;color:#aaa;margin:2px 0 0">วันที่ ${r.date}</p>
            <p style="font-size:10px;color:#aaa;margin:2px 0 0">วิธีชำระ: ${r.payment}</p>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:18px">
          <div>
            <p style="font-size:9px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:3px;margin:0 0 6px">ข้อมูลลูกค้า</p>
            <p style="font-size:13px;font-weight:700;margin:0">${r.customer}</p>
            <p style="font-size:11px;color:#888;margin:2px 0 0">พนักงาน: ${r.staff}</p>
          </div>
          <div>
            <p style="font-size:9px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:3px;margin:0 0 6px">ข้อมูลรถ</p>
            <p style="font-size:13px;font-weight:700;margin:0">ทะเบียน ${r.plate}</p>
          </div>
        </div>
        <p style="font-size:9px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:3px;margin:0 0 8px">รายละเอียดค่าบริการ</p>
        <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:16px">
          <thead>
            <tr style="background:#1E1E1E;color:white">
              <th style="text-align:left;padding:8px 12px;font-size:10px;font-weight:600">#</th>
              <th style="text-align:left;padding:8px 12px;font-size:10px;font-weight:600">รายการ</th>
              <th style="text-align:right;padding:8px 12px;font-size:10px;font-weight:600">ราคา</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="display:flex;align-items:center;justify-content:space-between;border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px;background:#fafaf9;margin-bottom:28px">
          <div style="font-size:10px;color:#aaa;line-height:1.8">
            <p style="margin:0">ยอดรวม (ก่อน VAT)</p>
            <p style="margin:0">VAT 7%</p>
          </div>
          <div style="text-align:right;font-size:10px;color:#777;line-height:1.8;margin-right:24px">
            <p style="margin:0">${subtotal.toLocaleString()} ฿</p>
            <p style="margin:0">${vat.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿</p>
          </div>
          <div style="text-align:right">
            <p style="font-size:10px;color:#aaa;margin:0">ยอดสุทธิ</p>
            <p style="font-size:19px;font-weight:900;color:#F8981D;margin:2px 0 0">${total.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿</p>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px">
          <div style="text-align:center">
            <div style="border-bottom:1px solid #ddd;margin-bottom:8px;padding-bottom:40px"></div>
            <p style="font-size:10px;color:#aaa;margin:0">ผู้รับเงิน</p>
            <p style="font-size:10px;color:#aaa;margin:2px 0 0">วันที่ ......../......../........</p>
          </div>
          <div style="text-align:center">
            <div style="border-bottom:1px solid #ddd;margin-bottom:8px;padding-bottom:40px"></div>
            <p style="font-size:10px;color:#aaa;margin:0">ลูกค้า</p>
            <p style="font-size:10px;color:#aaa;margin:2px 0 0">วันที่ ......../......../........</p>
          </div>
        </div>
        <p style="text-align:center;font-size:9px;color:#ddd;margin-top:24px">เอกสารนี้สร้างโดยระบบ RevUp</p>
      </div>`
  }

  const captureReceiptSection = async (html: string): Promise<HTMLCanvasElement> => {
    const wrapper = document.createElement('div')
    wrapper.style.cssText = 'position:fixed;top:0;left:0;width:794px;background:white;padding:40px;z-index:99999;box-sizing:border-box'
    wrapper.innerHTML = html
    document.body.appendChild(wrapper)
    try {
      return await html2canvas(wrapper, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' })
    } finally {
      document.body.removeChild(wrapper)
    }
  }

  const filteredData = historyData.filter(item => {

    const searchValue = search.toLowerCase()

    const matchSearch =
      !search ||
      item.id.toLowerCase().includes(searchValue) ||
      item.customer.toLowerCase().includes(searchValue) ||
      item.plate.toLowerCase().includes(searchValue) ||
      item.payment.toLowerCase().includes(searchValue) ||
      item.staff.toLowerCase().includes(searchValue)

    const matchPayment =
      paymentFilter === "ทั้งหมด" || item.payment === paymentFilter

    // DATE FILTER
    const itemDate = convertToISO(item.date)

    const matchDate =
      (!dateRange.start || itemDate >= dateRange.start) &&
      (!dateRange.end || itemDate <= dateRange.end)

    return matchSearch && matchPayment && matchDate
  })

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortBy === "newest") return b.id.localeCompare(a.id)
    if (sortBy === "oldest") return a.id.localeCompare(b.id)
    if (sortBy === "price-high") return b.total - a.total
    if (sortBy === "price-low") return a.total - b.total
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

        {/* Toolbar */}
        <div className="shrink-0 flex items-center gap-3">
          {/* DATE RANGE */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm shrink-0">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="bg-transparent outline-none text-sm text-gray-600"
            />
            <span className="text-gray-300">–</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="bg-transparent outline-none text-sm text-gray-600"
            />
          </div>

          {/* PAYMENT FILTER */}
          <div className="relative shrink-0">
            <button
              onClick={() => setOpenPayment(!openPayment)}
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600 cursor-pointer hover:border-gray-300 transition-colors"
            >
              <FaCreditCard className="text-gray-400" />
              วิธีชำระ
              <span className={`${paymentFilter !== 'ทั้งหมด' ? 'text-[#F8981D] font-medium' : 'text-gray-400'}`}>{paymentFilter}</span>
              <FaChevronDown className={`text-xs text-gray-400 transition-transform ${openPayment ? 'rotate-180' : ''}`} />
            </button>
            {openPayment && (
              <div className="absolute left-0 mt-2 bg-white rounded-xl border border-gray-100 shadow-lg z-10 overflow-hidden w-36">
                {["ทั้งหมด", "เงินสด", "QR Code"].map((item) => (
                  <div key={item}
                    onClick={() => { setPaymentFilter(item); setOpenPayment(false) }}
                    className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${paymentFilter === item ? 'text-[#F8981D] font-medium' : 'text-gray-600'}`}>
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SEARCH */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="ค้นหาเลขใบงาน / ลูกค้า / ทะเบียนรถ..."
              className="w-full bg-white border border-gray-200 rounded-full pl-4 pr-10 py-2 text-sm outline-none focus:border-[#F8981D] transition-colors"
            />
            <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F8981D]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Table */}
        <div className="w-full flex-1 mt-6 overflow-x-auto">
          <table className="min-w-180.5 w-full text-sm text-black">
            <thead className="bg-[#F5F5F5]">
              <tr>
                <th className="px-6 py-5 text-left font-medium rounded-l-2xl">วันที่</th>
                <th className="px-6 py-5 text-left font-medium">เลขใบงาน</th>
                <th className="px-6 py-5 text-left font-medium">ชื่อลูกค้า</th>
                <th className="px-6 py-5 text-left font-medium">วิธีการชำระเงิน</th>
                <th className="px-6 py-5 text-left font-medium">ยอดรวม</th>
                <th className="px-6 py-5 text-left font-medium">พนักงาน</th>
                <th className="px-6 py-5 text-center font-medium rounded-r-2xl">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 border-b border-gray-200">
              {loading && (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">กำลังโหลด...</td></tr>
              )}
              {!loading && visibleItems.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">ไม่มีรายการ</td></tr>
              )}
              {visibleItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-5">{item.date}</td>
                  <td className="px-6 py-5">{item.id}</td>
                  <td className="px-6 py-5">{item.customer}</td>
                  <td className="px-6 py-5">{item.payment}</td>
                  <td className="px-6 py-5">{item.total.toLocaleString()} ฿</td>
                  <td className="px-6 py-5">{item.staff}</td>

                  <td className="px-6 py-2 text-center">
                    {item.status === "cancelled" ? (
                      <span className="bg-red-100 text-red-500 text-xs px-5 py-1.5 rounded-full font-medium">
                        ยกเลิกแล้ว
                      </span>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        {convertToISO(item.date) === new Date().toISOString().slice(0, 10) && (
                          <button
                            onClick={() => { setSelectedId(item.id); setOpenCancelModal(true) }}
                            className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-500 text-xs px-3 py-2 rounded-lg cursor-pointer hover:bg-red-100 transition-colors">
                            <FaPlus size={12} className="rotate-45" />
                            ยกเลิก
                          </button>
                        )}
                        <button
                          onClick={() => { setSelectedReceipt(item); setOpenReceipt(true) }}
                          className="flex items-center gap-1.5 bg-[#F8981D] text-white text-xs px-3 py-2 rounded-lg cursor-pointer border-none hover:bg-orange-500 transition-colors"
                        >
                          <IoDocumentOutline size={14} />
                          ใบเสร็จ
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
      {openCancelModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">

          <div className="bg-white w-[420px] rounded-xl shadow-lg p-6">

            <h2 className="text-lg font-semibold mb-4">
              ยืนยันการยกเลิก
            </h2>

            <p className="text-sm text-gray-500 mb-3">
              กรุณาระบุเหตุผลในการยกเลิก
            </p>

            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="พิมพ์เหตุผล..."
              className="w-full border rounded-lg p-3 text-sm outline-none border-[#F8981D]"
              rows={4}
            />

            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={() => {
                  setOpenCancelModal(false)
                  setCancelReason("")
                }}
                className="px-6 py-2 text-sm border border-[#F8981D] text-[#F8981D] rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                ปิด
              </button>

              <button
                onClick={() => {

                  setHistoryData(prev =>
                    prev.map(item =>
                      item.id === selectedId
                        ? { ...item, status: "cancelled" }
                        : item
                    )
                  )

                  setOpenCancelModal(false)
                  setCancelReason("")
                }}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg cursor-pointer"
              >
                ยืนยันการยกเลิก
              </button>

            </div>

          </div>

        </div>
      )}
      {openReceipt && selectedReceipt && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-130 rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-emerald-100 rounded-full">
                <IoDocumentOutline className="text-emerald-600 w-5 h-5" />
              </div>
              <p className="font-semibold text-base">ใบเสร็จรับเงิน</p>
            </div>

            <div className="border border-gray-100 rounded-xl overflow-auto max-h-80 p-4 mb-5 bg-white">
              <div dangerouslySetInnerHTML={{ __html:
                buildReceiptHTML(selectedReceipt, 'สำเนาสำหรับผู้รับชำระ') +
                '<div style="border-top:2px dashed #ccc;margin:24px 0"></div>' +
                buildReceiptHTML(selectedReceipt, 'สำเนาสำหรับผู้ชำระ')
              }} />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  const s1 = buildReceiptHTML(selectedReceipt, 'สำเนาสำหรับผู้รับชำระ')
                  const s2 = buildReceiptHTML(selectedReceipt, 'สำเนาสำหรับผู้ชำระ')
                  const win = window.open('', '_blank', 'width=850,height=1100')
                  if (!win) return
                  win.document.write(`<html><head><meta charset="utf-8"><title>ใบเสร็จ-${selectedReceipt.id}</title>
                    <style>*{box-sizing:border-box}body{margin:0;padding:0}.page{padding:40px;width:794px;margin:0 auto}
                    @media print{.page{page-break-after:always}}</style>
                    </head><body><div class="page">${s1}</div><div class="page">${s2}</div></body></html>`)
                  win.document.close(); win.focus(); setTimeout(() => win.print(), 500)
                }}
                className="flex-1 bg-[#F8981D] text-white px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer border-none hover:bg-orange-500 transition-colors"
              >
                <IoPrint size={16} /> พิมพ์ใบเสร็จ
              </button>
              <button
                onClick={async () => {
                  const [canvas1, canvas2] = await Promise.all([
                    captureReceiptSection(buildReceiptHTML(selectedReceipt, 'สำเนาสำหรับผู้รับชำระ')),
                    captureReceiptSection(buildReceiptHTML(selectedReceipt, 'สำเนาสำหรับผู้ชำระ')),
                  ])
                  const pdf = new jsPDF('p', 'mm', 'a4')
                  const pdfW = pdf.internal.pageSize.getWidth()
                  const addPage = (canvas: HTMLCanvasElement) => {
                    const imgData = canvas.toDataURL('image/png')
                    const pdfH = (canvas.height * pdfW) / canvas.width
                    pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH)
                  }
                  addPage(canvas1)
                  pdf.addPage()
                  addPage(canvas2)
                  pdf.save(`ใบเสร็จ-${selectedReceipt.id}.pdf`)
                }}
                className="flex-1 border border-[#F8981D] text-[#F8981D] px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer bg-white hover:bg-orange-50 transition-colors"
              >
                <FiDownload size={16} /> ดาวน์โหลด
              </button>
              <button
                onClick={() => setOpenReceipt(false)}
                className="px-6 py-2.5 rounded-xl text-sm border border-gray-200 text-gray-500 cursor-pointer bg-white hover:bg-gray-50"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentHistoryPage
