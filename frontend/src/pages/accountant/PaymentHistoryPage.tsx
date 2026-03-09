import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FaSearch } from "react-icons/fa";
import { IoDocumentOutline } from "react-icons/io5";
import { FaCreditCard } from "react-icons/fa"
import { FaChevronDown } from "react-icons/fa"
import { FaPlus } from "react-icons/fa6";



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

const searchFields = [
  { value: "all", label: "ทั้งหมด" },
  { value: "id", label: "เลขใบงาน" },
  { value: "customer", label: "ลูกค้า" },
  { value: "plate", label: "ทะเบียนรถ" },
]

function ReceiptContent({ data }: { data: Receipt }) {

  const subtotal = data.items.reduce((sum, item) => sum + item.price, 0)
  const vat = subtotal * 0.07
  const total = subtotal + vat

  return (
    <div className="text-sm">

      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold">Smart Moto</h1>
        <p>ใบเสร็จรับเงิน</p>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="flex items-center justify-start gap-3">
          <div className="flex flex-col items-end justify-end">
            <p>เลขที่ :</p>
            <p>วันที่ :</p>
            <p>ลูกค้า :</p>
          </div>
          <div>
            <p>{data.id}</p>
            <p>{data.date}</p>
            <p>{data.customer}</p>
          </div>
        </div>
        <div className="flex items-center justify-start gap-3">
          <div className="flex flex-col items-end justify-end">
            <p>ทะเบียน :</p>
            <p>พนักงาน :</p>
            <p>การชำระเงิน :</p>
          </div>
          <div>
            <p>{data.plate}</p>
            <p>{data.staff}</p>
            <p>{data.payment}</p>
          </div>
        </div>

      </div>

      {/* Table */}
      <table className="w-full border text-sm mb-3">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-1">รายการ</th>
            <th className="border p-1">ราคา</th>
          </tr>
        </thead>

        <tbody>
          {data.items.map((item, index) => (
            <tr key={index}>
              <td className="border p-1">{item.name}</td>
              <td className="border p-1 text-right">
                {item.price.toLocaleString()} บาท
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total */}
      <div className="mt-6 text-right space-y-1 text-md flex gap-6 items-center justify-end">
        <div>
          <p>ยอดรวม</p>
          <p>VAT (7%)</p>
          <p>ยอดรวมสุทธิ</p>
        </div>

        <div>
          <p>{subtotal.toLocaleString()} บาท</p>
          <p>{vat.toLocaleString(undefined, { maximumFractionDigits: 2 })} บาท</p>
          <p className="font-semibold">
            {total.toLocaleString(undefined, { maximumFractionDigits: 2 })} บาท
          </p>
        </div>
      </div>

      {/* Sign */}
      <div className="flex justify-between mt-8 text-xs">
        <div>ผู้รับเงิน __________________</div>
        <div>ลูกค้า __________________</div>
      </div>

    </div>
  )
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
  items: ReceiptItem[]
}

function PaymentHistoryPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [searchField, setSearchField] = useState("all")
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

  const [historyData, setHistoryData] = useState([
    {
      id: "0000003",
      date: "07/03/2026",
      customer: "สมชาย การ์ด",
      plate: "ขค456",
      payment: "เงินสด",
      total: 2100,
      staff: "Admin",
      status: "completed",
      items: [
        { name: "เปลี่ยนยางหน้า", price: 800 },
        { name: "เปลี่ยนยางหลัง", price: 900 },
        { name: "ค่าแรง", price: 100 }
      ]
    },
    {
      id: "0000004",
      date: "03/03/2026",
      customer: "วิภา รักสะอาด",
      plate: "คง5678",
      payment: "QR Code",
      total: 4500,
      staff: "Nok",
      status: "pending",
      items: [
        { name: "เปลี่ยนยางหน้า", price: 800 },
        { name: "เปลี่ยนยางหลัง", price: 900 },
        { name: "ค่าแรง", price: 100 }
      ]
    },
    {
      id: "0000005",
      date: "03/04/2026",
      customer: "ประเสริฐ มั่นคง",
      plate: "จฉ9012",
      payment: "เงินสด",
      total: 1800,
      staff: "Admin",
      status: "pending",
      items: [
        { name: "เปลี่ยนยางหน้า", price: 800 },
        { name: "เปลี่ยนยางหลัง", price: 900 },
        { name: "ค่าแรง", price: 100 }
      ]
    },
    {
      id: "0000006",
      date: "03/05/2026",
      customer: "นภา สุขสันต์",
      plate: "ชซ3456",
      payment: "QR Code",
      total: 7200,
      staff: "Mint",
      status: "completed",
      items: [
        { name: "เปลี่ยนยางหน้า", price: 800 },
        { name: "เปลี่ยนยางหลัง", price: 900 },
        { name: "ค่าแรง", price: 100 }
      ]
    },
    {
      id: "0000007",
      date: "01/03/2026",
      customer: "ธนพล วิริยะ",
      plate: "ญฐ7890",
      payment: "เงินสด",
      total: 3300,
      staff: "Admin",
      status: "completed",
      items: [
        { name: "เปลี่ยนยางหน้า", price: 800 },
        { name: "เปลี่ยนยางหลัง", price: 900 },
        { name: "ค่าแรง", price: 100 }
      ]
    }
  ])

  const [paymentFilter, setPaymentFilter] = useState("ทั้งหมด")
  const [openPayment, setOpenPayment] = useState(false)

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
        <div className="w-full h-12 flex items-center justify-between shrink-0">
          <div className="w-full h-full flex items-center rounded-full relative gap-8">
            {/* DATE RANGE */}
            <div className="w-1/3 flex items-center justify-between gap-2 shadow-[0_0px_2px_rgba(0,0,0,0.4)] px-4 py-[11px] rounded-xl">

              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="bg-transparent outline-none text-sm"
              />

              <span>-</span>

              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="bg-transparent outline-none text-sm"
              />
            </div>

            {/* PAYMENT FILTER */}
            <div
              onClick={() => setOpenPayment(!openPayment)}
              className="relative w-fit h-full  shadow-[0_0px_2px_rgba(0,0,0,0.4)] px-4 py-2 rounded-xl ">

              <button className="flex items-center justify-around gap-2 rounded-xl text-sm w-full h-full">
                <div className="flex items-center justify-center gap-3 text-nowrap">
                  <FaCreditCard />
                  วิธีการชำระ
                </div>

                <div className="flex items-center justify-center gap-3 ml-8">
                  <span className="text-gray-500  text-nowrap">
                    {paymentFilter}
                  </span>

                  <FaChevronDown className="text-xs" />
                </div>
              </button>

              {openPayment && (
                <div className="absolute mt-4 left-0 bg-white border rounded-xl shadow w-full z-10">

                  {["ทั้งหมด", "เงินสด", "QR Code"].map((item) => (
                    <div
                      key={item}
                      onClick={() => {
                        setPaymentFilter(item)
                        setOpenPayment(false)
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      {item}
                    </div>
                  ))}

                </div>
              )}

            </div>
            <div className="flex items-center justify-start w-full h-full pl-3 pr-6 shadow-[0_0px_2px_rgba(0,0,0,0.4)] rounded-xl ">
              <FaSearch className="mr-3 ml-2" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={`ค้นหา${searchFields.find(f => f.value === searchField)?.label === "ทั้งหมด" ? "" : searchFields.find(f => f.value === searchField)?.label}`}
                className="w-full h-[95%] outline-none text-sm"
              />
            </div>
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
              {visibleItems.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">ไม่มีรายการ</td></tr>
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
                    {item.status === "pending" && (
                      <div className="flex items-center justify-center gap-3">

                        {/* cancel */}
                        <button
                          onClick={() => {
                            setSelectedId(item.id)
                            setOpenCancelModal(true)
                          }}
                          className="flex items-center gap-2 bg-[#FF5656] text-white text-xs px-4 py-2 rounded-lg cursor-pointer">
                          <FaPlus size={16} className="rotate-45" />
                          <p>ยกเลิก</p>
                        </button>

                        {/* receipt */}
                        <button
                          onClick={() => {
                            setSelectedReceipt(item)
                            setOpenReceipt(true)
                          }}
                          className="flex items-center gap-2 bg-blue-400 text-white text-xs px-4 py-2 rounded-lg cursor-pointer"
                        >
                          <IoDocumentOutline size={16} />
                          <p>
                            ใบเสร็จ
                          </p>
                        </button>

                      </div>
                    )}

                    {item.status === "completed" && (
                      <span className="bg-[#AFFFA8] text-[#1f8f40] text-xs px-5 py-1.5 rounded-full">
                        เสร็จสิ้น
                      </span>
                    )}
                    {item.status === "cancelled" && (
                      <span className="bg-red-200 text-red-500 text-xs px-5 py-1.5 rounded-full">
                        ยกเลิก
                      </span>
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
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

          {/* modal frame */}
          <div className="bg-white rounded-lg p-4 w-[70vw] h-[80vh] flex flex-col">

            {/* ส่วนที่ scroll */}
            <div className="flex-1 overflow-auto flex justify-center">

              {/* A4 */}
              <div className="print-area w-[210mm] min-h-[297mm] p-6 shadow-lg">

                <div className="space-y-6">
                  <ReceiptContent data={selectedReceipt} />

                  <div className="border-t-2 border-dashed"></div>

                  <ReceiptContent data={selectedReceipt} />
                </div>

              </div>

            </div>

            {/* ปุ่ม */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => window.print()}
                className="bg-[#F8981D] text-white px-4 py-2 rounded"
              >
                Print
              </button>

              <button
                onClick={() => setOpenReceipt(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
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
