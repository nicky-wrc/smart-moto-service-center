import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { TbMoneybagPlus } from "react-icons/tb";
import { TbPigMoney } from "react-icons/tb";
import { TbCashBanknoteMove } from "react-icons/tb";
import { MdOutlinePendingActions } from "react-icons/md";
import { paymentsService, type Payment } from '../../services/payments'

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString('th-TH')

const METHOD_LABEL: Record<string, string> = {
  CASH: 'เงินสด',
  CREDIT_CARD: 'บัตรเครดิต',
  TRANSFER: 'โอนเงิน',
  POINTS: 'แต้ม',
}

const STATUS_LABEL: Record<string, string> = {
  PAID: 'ชำระแล้ว',
  PENDING: 'รอชำระ',
  REFUNDED: 'ยกเลิก',
}

type Transaction = {
  id: string
  paymentId: number
  customer: string
  plate: string
  amount: number
  method: string
  status: string
  date: string
}

function mapPayment(p: Payment): Transaction {
  return {
    id: p.paymentNo || `P${p.id}`,
    paymentId: p.id,
    customer: p.customer ? `${p.customer.firstName} ${p.customer.lastName}` : '-',
    plate: p.job?.motorcycle?.licensePlate ?? '-',
    amount: Number(p.totalAmount) || 0,
    method: METHOD_LABEL[p.paymentMethod] ?? p.paymentMethod,
    status: STATUS_LABEL[p.paymentStatus] ?? p.paymentStatus,
    date: p.paidAt ?? p.createdAt,
  }
}

const DAY_LABELS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

function buildWeeklyChart(payments: Payment[]) {
  const now = new Date()
  const result: { day: string; revenue: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dayStr = d.toISOString().split('T')[0]
    const rev = payments
      .filter(p => p.paymentStatus === 'PAID' && (p.paidAt ?? p.createdAt).startsWith(dayStr))
      .reduce((s, p) => s + Number(p.totalAmount), 0)
    result.push({ day: DAY_LABELS[d.getDay()], revenue: rev })
  }
  return result
}

export default function AccountantDashboardPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [weeklyData, setWeeklyData] = useState<{ day: string; revenue: number }[]>([])
  const [loading, setLoading] = useState(true)

  // Summary stats
  const [totalToday, setTotalToday] = useState(0)
  const [totalMonth, setTotalMonth] = useState(0)
  const [totalPending, setTotalPending] = useState(0)
  const [countPending, setCountPending] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allPayments = await paymentsService.list()
        const txs = allPayments.map(mapPayment)
        setTransactions(txs)

        // Build weekly chart
        setWeeklyData(buildWeeklyChart(allPayments))

        // Compute stats
        const todayStr = new Date().toISOString().split('T')[0]
        const monthStr = todayStr.slice(0, 7) // YYYY-MM

        const paid = allPayments.filter(p => p.paymentStatus === 'PAID')
        const pending = allPayments.filter(p => p.paymentStatus === 'PENDING')

        const todayPaid = paid.filter(p => (p.paidAt ?? p.createdAt).startsWith(todayStr))
        setTotalToday(todayPaid.reduce((s, p) => s + Number(p.totalAmount), 0))
        setTotalMonth(paid.filter(p => (p.paidAt ?? p.createdAt).startsWith(monthStr)).reduce((s, p) => s + Number(p.totalAmount), 0))
        setTotalPending(pending.reduce((s, p) => s + Number(p.totalAmount), 0))
        setCountPending(pending.length)
      } catch (err) {
        console.error('Failed to load payments:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const q = search.trim().toLowerCase()
  const filteredTransactions = q
    ? transactions.filter(t =>
        t.customer.toLowerCase().includes(q) ||
        t.plate.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
      )
    : transactions

  // Status badge color
  const statusColor: Record<string, string> = {
    'ชำระแล้ว': '#16a34a',
    'รอชำระ': '#F8981D',
    'ยกเลิก': '#dc2626',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#F8981D] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col gap-4 p-5 overflow-hidden">

      {/* ── Stat cards ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4 shrink-0 h-32">
        {/* Revenue today */}
        <div className="bg-[#44403C] rounded-2xl px-10 py-4 flex items-center justify-between shadow-sm ">
          <div className='p-5 bg-white/50 rounded-full'>
            <TbMoneybagPlus className='text-4xl text-white' />
          </div>
          <div>
            <p className="text-xs text-white/50 font-medium">รายรับวันนี้</p>
            <p className="text-2xl font-black text-white mt-1 leading-none">฿{fmt(totalToday)}</p>
          </div>
        </div>

        {/* Pending count */}
        <div
          onClick={() => navigate('/accountant/pendingpayment')}
          className="bg-[#F8981D] rounded-2xl px-10 py-4 flex items-center justify-between shadow-sm"
        >
          <div className='p-5 bg-white/30 rounded-full'>
            <MdOutlinePendingActions className='text-4xl text-white' />
          </div>
          <div>
            <p className="text-xs text-white/70 font-medium">รอชำระ</p>
            <p className="text-3xl font-black text-white mt-1 leading-none">{countPending}</p>
          </div>

        </div>

        {/* Monthly revenue */}
        <div className="bg-white rounded-2xl px-10 py-4 flex items-center justify-between shadow-sm ">
          <div className='p-5 bg-purple-300 rounded-full'>
            <TbPigMoney className='text-4xl text-purple-700' />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">รายรับเดือนนี้</p>
            <p className="text-2xl font-black text-[#1E1E1E] mt-1 leading-none">฿{fmt(totalMonth)}</p>
          </div>
        </div>
        {/* Total pending amount */}
        <div className="bg-white rounded-2xl px-10 py-4 flex items-center justify-between shadow-sm ">
          <div className='p-5 bg-orange-200 rounded-full'>
            <TbCashBanknoteMove className='text-4xl text-orange-500' />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">ยอดรอชำระทั้งหมด</p>
            <p className="text-2xl font-black text-[#1E1E1E] mt-1 leading-none">฿{fmt(totalPending)}</p>
          </div>
        </div>
      </div>

      {/* Search toolbar */}
      <div className="shrink-0 flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อลูกค้า ทะเบียน หรือเลขที่ใบงาน..."
            className="w-full bg-white border border-gray-200 rounded-full pl-4 pr-10 py-2 text-sm outline-none focus:border-[#F8981D] transition-colors"
          />
          <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F8981D]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="flex-1 grid gap-4 min-h-0" style={{ gridTemplateColumns: ' 1fr 1fr' }}>

        <div className="flex flex-col gap-4 min-h-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden flex-1 min-h-0">
            <div className="px-5 py-3.5 border-b border-gray-100 shrink-0 flex items-center justify-between">
              <p className="text-sm font-semibold text-[#1E1E1E]">รายรับสัปดาห์นี้</p>
              <p className="text-xs text-gray-400">บาท/วัน</p>
            </div>
            <div className="flex-1 min-h-0 px-2 pb-3 pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F8981D" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#F8981D" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af', fontFamily: 'Kanit, sans-serif' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af', fontFamily: 'Kanit, sans-serif' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value) => [`฿${Number(value).toLocaleString('th-TH')}`, 'รายรับ']}
                    contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontFamily: 'Kanit, sans-serif', fontSize: 12 }}
                    cursor={{ stroke: '#F8981D', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#F8981D" strokeWidth={2} fill="url(#revenueGrad)" dot={{ r: 4, fill: 'white', stroke: '#F8981D', strokeWidth: 2 }} activeDot={{ r: 5, fill: '#F8981D' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div
            onClick={() => navigate('/accountant/pendingpayment')}
            className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm cursor-pointer hover:bg-amber-100 transition-colors shrink-0"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-800">มีรายการรอชำระ {countPending} รายการ</p>
                <p className="text-xs text-amber-600 mt-0.5">ยอดรวม ฿{fmt(totalPending)} — คลิกเพื่อดูรายละเอียด</p>
              </div>
            </div>
            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden min-h-0">
          <div className="px-5 py-3.5 border-b border-gray-100 shrink-0 flex items-center justify-between">
            <p className="text-sm font-semibold text-[#1E1E1E]">รายการล่าสุด</p>
            <button
              onClick={() => navigate('/accountant/historys')}
              className="text-xs text-[#F8981D] font-medium hover:underline"
            >
              ดูทั้งหมด →
            </button>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {filteredTransactions.length === 0 && (
              <div className="text-center text-sm text-gray-400 py-12">ไม่มีรายการ</div>
            )}
            {filteredTransactions.map(t => {
              const color = statusColor[t.status] ?? '#9ca3af'
              return (
                <div
                  key={t.id}
                  onClick={() => t.status === 'รอชำระ'
                    ? navigate(`/accountant/pendingpayment/${t.paymentId}`)
                    : navigate(`/accountant/historys/${t.paymentId}`)
                  }
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors group"
                >
                  <span className="text-xs text-gray-300 font-mono w-10 shrink-0">{t.id}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1E1E1E] truncate">{t.customer}</p>
                    <p className="text-xs text-gray-400 truncate">{t.plate} · {t.method}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-[#1E1E1E]">฿{fmt(t.amount)}</p>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${color}18`, color }}
                    >
                      {t.status}
                    </span>
                  </div>
                  <svg className="w-3.5 h-3.5 text-gray-200 group-hover:text-gray-400 transition-colors shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
