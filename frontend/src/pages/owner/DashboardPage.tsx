import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { api } from '../../lib/api'
import { paymentsService } from '../../services/payments'

// ─── Tooltip ─────────────────────────────────────────────────────────────────

type TooltipPayloadItem = { name: string; value: number; color: string }
type TooltipProps = { active?: boolean; payload?: TooltipPayloadItem[]; label?: string }

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-xs">
      <p className="font-semibold text-[#1E1E1E] mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-gray-500">{p.name}</span>
          </div>
          <span className="font-bold text-[#1E1E1E]">{(p.value as number).toLocaleString()} ฿</span>
        </div>
      ))}
    </div>
  )
}

function fmtY(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000)    return `${(n / 1000).toFixed(0)}K`
  return `${n}`
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'รอประเมิน',
  WAITING_APPROVAL: 'รอลูกค้าอนุมัติ',
  READY: 'พร้อมซ่อม',
  IN_PROGRESS: 'กำลังดำเนินการ',
  WAITING_PARTS: 'รออะไหล่',
  QC_PENDING: 'รอตรวจ QC',
  CLEANING: 'ล้างรถ',
  READY_FOR_DELIVERY: 'รอส่งมอบ',
  COMPLETED: 'เสร็จสิ้น',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#F8981D',
  WAITING_APPROVAL: '#a8a29e',
  READY: '#44403C',
  IN_PROGRESS: '#44403C',
  WAITING_PARTS: '#d6d3d1',
  QC_PENDING: '#78716c',
  CLEANING: '#3b82f6',
  READY_FOR_DELIVERY: '#10b981',
  COMPLETED: '#10b981',
}

// ─── Component ────────────────────────────────────────────────────────────────

type Mode = 'daily' | 'weekly' | 'yearly' | 'custom'

function isSameLocalDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

const today = new Date()
const todayStr = new Date().toISOString().split('T')[0]
const weekAgo = new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0]

export default function DashboardPage() {
  const [mode, setMode] = useState<Mode>('daily')
  const [fromDate, setFromDate] = useState(weekAgo)
  const [toDate, setToDate]     = useState(todayStr)
  const [loading, setLoading] = useState(true)

  // Data states
  const [chartData, setChartData] = useState<{time: string; revenue: number; cost: number; profit: number}[]>([])
  const [pendingBreakdown, setPendingBreakdown] = useState<{label: string; count: number; color: string}[]>([])
  const [stockAlerts, setStockAlerts] = useState<{name: string; qty: number; unit: string}[]>([])
  const [pendingPayments, setPendingPayments] = useState<{id: string; customer: string; total: number}[]>([])
  const [todayRevenue, setTodayRevenue] = useState(0)
  const [todayProfit, setTodayProfit] = useState(0)
  const [todayMargin, setTodayMargin] = useState(0)
  const [pendingAmount, setPendingAmount] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [jobs, payments, parts] = await Promise.all([
          api.get<any[]>('/jobs'),
          paymentsService.list(),
          api.get<any[]>('/parts'),
        ])

        // ─── Pending breakdown ───
        const activeStatuses = ['PENDING', 'WAITING_APPROVAL', 'READY', 'IN_PROGRESS', 'WAITING_PARTS', 'QC_PENDING', 'CLEANING', 'READY_FOR_DELIVERY']
        const breakdown = activeStatuses
          .map(st => ({
            label: STATUS_LABEL[st] || st,
            count: jobs.filter(j => j.status === st).length,
            color: STATUS_COLORS[st] || '#9ca3af',
          }))
          .filter(b => b.count > 0)
        setPendingBreakdown(breakdown)

        // ─── Stock alerts ───
        const lowStock = parts
          .filter((p: any) => p.stockQuantity <= p.reorderPoint && p.isActive)
          .slice(0, 5)
          .map((p: any) => ({ name: p.name, qty: p.stockQuantity, unit: p.unit || 'ชิ้น' }))
        setStockAlerts(lowStock)

        // ─── Pending payments ───
        const pendPay = payments
          .filter(p => p.paymentStatus === 'PENDING')
          .map(p => ({
            id: p.paymentNo || `P${p.id}`,
            customer: p.customer ? `${p.customer.firstName} ${p.customer.lastName}` : '-',
            total: Number(p.totalAmount) || 0,
          }))
        setPendingPayments(pendPay)
        setPendingAmount(pendPay.reduce((s, p) => s + p.total, 0))
        setPendingCount(pendPay.length)

        // ─── Today stats ───
        const paidToday = payments.filter(p => {
          if (p.paymentStatus !== 'PAID') return false
          const ts = p.paidAt ?? p.createdAt
          if (!ts) return false
          return isSameLocalDay(new Date(ts), today)
        })
        const rev = paidToday.reduce((s, p) => s + Number(p.totalAmount), 0)
        const cost = rev * 0.57 // estimated
        const prof = rev - cost
        setTodayRevenue(rev)
        setTodayProfit(prof)
        setTodayMargin(rev > 0 ? Math.round((prof / rev) * 100) : 0)

        // ─── Chart data ───
        buildChart(mode, payments, fromDate, toDate)
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  function buildChart(m: Mode, payments: any[], from: string, to: string) {
    const paid = payments.filter((p: any) => p.paymentStatus === 'PAID')
    if (m === 'daily') {
      // Hourly breakdown for today
      const todayPaid = paid.filter((p: any) => {
        const ts = p.paidAt ?? p.createdAt
        if (!ts) return false
        return isSameLocalDay(new Date(ts), today)
      })
      const hours = Array.from({ length: 11 }, (_, i) => {
        const h = 8 + i
        const hStr = `${String(h).padStart(2, '0')}:00`
        const rev = todayPaid
          .filter((p: any) => {
            const paidDate = p.paidAt ?? p.createdAt
            const hour = new Date(paidDate).getHours()
            return hour === h
          })
          .reduce((s: number, p: any) => s + Number(p.totalAmount), 0)
        const cost = Math.round(rev * 0.57)
        return { time: hStr, revenue: rev, cost, profit: rev - cost }
      })
      setChartData(hours)
    } else if (m === 'weekly') {
      const DAY_LABELS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
      const now = new Date()
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now)
        d.setDate(d.getDate() - (6 - i))
        const dayStr = d.toISOString().split('T')[0]
        const rev = paid
          .filter((p: any) => {
            const ts = p.paidAt ?? p.createdAt
            if (!ts) return false
            return isSameLocalDay(new Date(ts), d)
          })
          .reduce((s: number, p: any) => s + Number(p.totalAmount), 0)
        const cost = Math.round(rev * 0.57)
        return { time: DAY_LABELS[d.getDay()], revenue: rev, cost, profit: rev - cost }
      })
      setChartData(days)
    } else if (m === 'yearly') {
      const MONTH_LABELS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
      const year = new Date().getFullYear()
      const months = Array.from({ length: 12 }, (_, i) => {
        const monthStr = `${year}-${String(i + 1).padStart(2, '0')}`
        const rev = paid
          .filter((p: any) => {
            const ts = p.paidAt ?? p.createdAt
            if (!ts) return false
            const d2 = new Date(ts)
            const d2Str = `${d2.getFullYear()}-${String(d2.getMonth() + 1).padStart(2, '0')}`
            return d2Str === monthStr
          })
          .reduce((s: number, p: any) => s + Number(p.totalAmount), 0)
        const cost = Math.round(rev * 0.57)
        return { time: MONTH_LABELS[i], revenue: rev, cost, profit: rev - cost }
      })
      setChartData(months)
    } else {
      // Custom range
      const result: typeof chartData = []
      const start = new Date(from)
      const end = new Date(to)
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayStr = d.toISOString().split('T')[0]
        const rev = paid
          .filter((p: any) => {
            const ts = p.paidAt ?? p.createdAt
            if (!ts) return false
            return isSameLocalDay(new Date(ts), d)
          })
          .reduce((s: number, p: any) => s + Number(p.totalAmount), 0)
        const cost = Math.round(rev * 0.57)
        result.push({ time: `${d.getDate()}/${d.getMonth() + 1}`, revenue: rev, cost, profit: rev - cost })
      }
      setChartData(result)
    }
  }

  // Re-build chart when mode/dates change
  useEffect(() => {
    if (!loading) {
      paymentsService.list().then(payments => buildChart(mode, payments, fromDate, toDate))
    }
  }, [mode, fromDate, toDate])

  const totalRevenue = chartData.reduce((s, r) => s + r.revenue, 0)
  const totalCost    = chartData.reduce((s, r) => s + r.cost, 0)
  const totalProfit  = chartData.reduce((s, r) => s + r.profit, 0)
  const margin       = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0
  const totalPending = pendingBreakdown.reduce((s, p) => s + p.count, 0)

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

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 shrink-0">
        <div className="bg-[#44403C] rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-xs text-white/50 font-medium">รายได้วันนี้</p>
          <p className="text-3xl font-black text-white mt-1 leading-none">{todayRevenue.toLocaleString()}</p>
          <p className="text-xs text-white/30 mt-0.5">฿</p>
        </div>
        <div className="bg-[#F8981D] rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-xs text-white/70 font-medium">กำไรวันนี้</p>
          <p className="text-3xl font-black text-white mt-1 leading-none">{todayProfit.toLocaleString()}</p>
          <p className="text-xs text-white/50 mt-0.5">฿ · Margin {todayMargin}%</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-xs text-gray-400 font-medium">งานค้างทั้งหมด</p>
          <p className="text-3xl font-black text-[#1E1E1E] mt-1 leading-none">{totalPending}</p>
          <p className="text-xs text-gray-300 mt-0.5">ใบงาน</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-xs text-gray-400 font-medium">ยอดรอชำระ</p>
          <p className="text-3xl font-black text-[#1E1E1E] mt-1 leading-none">{pendingAmount.toLocaleString()}</p>
          <p className="text-xs text-gray-300 mt-0.5">฿ · {pendingCount} ใบงาน</p>
        </div>
      </div>

      {/* Main grid */}
      <div className="flex-1 grid gap-4 min-h-0" style={{ gridTemplateColumns: '1fr 240px' }}>

        {/* LEFT: Line chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden min-h-0">
          <div className="px-5 py-3 border-b border-gray-100 shrink-0 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[#1E1E1E] shrink-0">รายได้ / ต้นทุน / กำไร</p>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <div className="flex bg-stone-100 rounded-full p-0.5 gap-0.5">
                {(['daily', 'weekly', 'yearly', 'custom'] as Mode[]).map(m => (
                  <button key={m} onClick={() => setMode(m)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border-none ${mode === m ? 'bg-white text-[#1E1E1E] shadow-sm' : 'text-stone-400 bg-transparent'}`}>
                    {m === 'daily' ? 'รายวัน' : m === 'weekly' ? 'รายสัปดาห์' : m === 'yearly' ? 'รายปี' : 'กำหนดเอง'}
                  </button>
                ))}
              </div>
              {mode === 'custom' && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <input type="date" value={fromDate} max={toDate}
                    onChange={e => setFromDate(e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-[#F8981D] bg-white cursor-pointer" />
                  <span>–</span>
                  <input type="date" value={toDate} min={fromDate} max={todayStr}
                    onChange={e => setToDate(e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-[#F8981D] bg-white cursor-pointer" />
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-h-0 px-2 pt-3 pb-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmtY} tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} width={44} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} formatter={(value) => <span style={{ color: '#78716c' }}>{value}</span>} />
                <Line type="monotone" dataKey="revenue" name="รายได้" stroke="#44403C" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="cost" name="ต้นทุน" stroke="#d6d3d1" strokeWidth={1.5} strokeDasharray="4 3" dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="profit" name="กำไร" stroke="#F8981D" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#F8981D' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="shrink-0 px-5 py-2.5 border-t border-gray-50 flex items-center justify-end gap-6">
            <div className="text-right">
              <div className="text-xs text-gray-400">รายได้รวม</div>
              <div className="text-sm font-bold text-[#1E1E1E]">{totalRevenue.toLocaleString()} ฿</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">ต้นทุนรวม</div>
              <div className="text-sm font-bold text-stone-400">{totalCost.toLocaleString()} ฿</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">กำไรสุทธิ</div>
              <div className="text-sm font-bold text-[#F8981D]">
                {totalProfit.toLocaleString()} ฿
                <span className="text-xs font-normal text-gray-400 ml-1">({margin}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT column */}
        <div className="flex flex-col gap-4 min-h-0">

          {/* งานค้าง breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden shrink-0">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-[#1E1E1E]">งานค้าง</p>
            </div>
            <div className="px-4 py-3 flex flex-col gap-2.5">
              {pendingBreakdown.length === 0 && <p className="text-xs text-gray-400 text-center py-2">ไม่มีงานค้าง</p>}
              {pendingBreakdown.map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-500 flex-1 truncate">{item.label}</span>
                  <span className="text-xs font-bold text-[#1E1E1E]">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* สต๊อกใกล้หมด */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden shrink-0">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
              <p className="text-sm font-semibold text-[#1E1E1E]">สต๊อกใกล้หมด</p>
            </div>
            <div className="px-4 py-3 flex flex-col gap-2.5">
              {stockAlerts.length === 0 && <p className="text-xs text-gray-400 text-center py-2">ไม่มีอะไหล่ใกล้หมด</p>}
              {stockAlerts.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 flex-1 truncate">{item.name}</span>
                  <span className="text-xs font-bold text-red-500 shrink-0">{item.qty} {item.unit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ใบงานรอชำระ */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden flex-1 min-h-0">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-[#1E1E1E]">ใบงานรอชำระ</p>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {pendingPayments.length === 0 && <p className="text-xs text-gray-400 text-center py-4">ไม่มีรายการรอชำระ</p>}
              {pendingPayments.map(item => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="text-xs text-gray-300 font-mono shrink-0">#{item.id}</span>
                  <span className="text-xs text-gray-600 flex-1 truncate">{item.customer}</span>
                  <span className="text-xs font-bold text-[#1E1E1E] shrink-0">{item.total.toLocaleString()} ฿</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
