import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

// ─── Mock data ────────────────────────────────────────────────────────────────

const hourlyData = [
  { time: '08:00', revenue: 1200,  cost: 700,  profit: 500  },
  { time: '09:00', revenue: 3400,  cost: 1900, profit: 1500 },
  { time: '10:00', revenue: 2800,  cost: 1600, profit: 1200 },
  { time: '11:00', revenue: 4100,  cost: 2300, profit: 1800 },
  { time: '12:00', revenue: 1500,  cost: 900,  profit: 600  },
  { time: '13:00', revenue: 3200,  cost: 1800, profit: 1400 },
  { time: '14:00', revenue: 2600,  cost: 1500, profit: 1100 },
  { time: '15:00', revenue: 5200,  cost: 3000, profit: 2200 },
  { time: '16:00', revenue: 3800,  cost: 2100, profit: 1700 },
  { time: '17:00', revenue: 2100,  cost: 1200, profit: 900  },
  { time: '18:00', revenue: 900,   cost: 500,  profit: 400  },
]

const weeklyData = [
  { time: 'จ',  revenue: 12400, cost: 7200,  profit: 5200 },
  { time: 'อ',  revenue: 8900,  cost: 5100,  profit: 3800 },
  { time: 'พ',  revenue: 15600, cost: 9300,  profit: 6300 },
  { time: 'พฤ', revenue: 11200, cost: 6800,  profit: 4400 },
  { time: 'ศ',  revenue: 18900, cost: 10500, profit: 8400 },
  { time: 'ส',  revenue: 9400,  cost: 5600,  profit: 3800 },
  { time: 'อา', revenue: 21300, cost: 12100, profit: 9200 },
]

const yearlyData = [
  { time: 'ม.ค.', revenue: 285000, cost: 168000, profit: 117000 },
  { time: 'ก.พ.', revenue: 312000, cost: 184000, profit: 128000 },
  { time: 'มี.ค.', revenue: 356000, cost: 208000, profit: 148000 },
  { time: 'เม.ย.', revenue: 298000, cost: 175000, profit: 123000 },
  { time: 'พ.ค.', revenue: 341000, cost: 199000, profit: 142000 },
  { time: 'มิ.ย.', revenue: 375000, cost: 218000, profit: 157000 },
  { time: 'ก.ค.', revenue: 320000, cost: 187000, profit: 133000 },
  { time: 'ส.ค.', revenue: 389000, cost: 226000, profit: 163000 },
  { time: 'ก.ย.', revenue: 334000, cost: 195000, profit: 139000 },
  { time: 'ต.ค.', revenue: 398000, cost: 231000, profit: 167000 },
  { time: 'พ.ย.', revenue: 412000, cost: 239000, profit: 173000 },
  { time: 'ธ.ค.', revenue: 356000, cost: 208000, profit: 148000 },
]

// Generate mock daily data between two dates
function generateRangeData(from: string, to: string) {
  const result: { time: string; revenue: number; cost: number; profit: number }[] = []
  const start = new Date(from)
  const end   = new Date(to)
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDate()
    const revenue = 8000 + ((day * 1337) % 16000)
    const cost    = Math.round(revenue * (0.54 + ((day * 17) % 12) / 100))
    result.push({
      time: `${d.getDate()}/${d.getMonth() + 1}`,
      revenue,
      cost,
      profit: revenue - cost,
    })
  }
  return result
}

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

// ─── Pending / stock summary data ────────────────────────────────────────────

const pendingBreakdown = [
  { label: 'รอประเมิน',       count: 1, color: '#F8981D' },
  { label: 'รอลูกค้าอนุมัติ', count: 1, color: '#d6d3d1' },
  { label: 'กำลังดำเนินการ',  count: 3, color: '#44403C' },
  { label: 'รอตรวจ',          count: 1, color: '#78716c' },
]

const stockAlerts = [
  { name: 'โซ่ขับเคลื่อน 428H', qty: 4, unit: 'เส้น' },
  { name: 'สเตอร์หน้า Honda',    qty: 5, unit: 'ชิ้น' },
  { name: 'แบตเตอรี่ 12V 5Ah',  qty: 5, unit: 'ก้อน' },
]

// ─── Component ────────────────────────────────────────────────────────────────

type Mode = 'daily' | 'weekly' | 'yearly' | 'custom'

const today = new Date().toISOString().split('T')[0]
const weekAgo = new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0]

export default function DashboardPage() {
  const [mode, setMode] = useState<Mode>('daily')
  const [fromDate, setFromDate] = useState(weekAgo)
  const [toDate, setToDate]     = useState(today)

  const chartData =
    mode === 'daily'  ? hourlyData :
    mode === 'weekly' ? weeklyData :
    mode === 'yearly' ? yearlyData :
    generateRangeData(fromDate, toDate)

  const totalRevenue = chartData.reduce((s, r) => s + r.revenue, 0)
  const totalCost    = chartData.reduce((s, r) => s + r.cost, 0)
  const totalProfit  = chartData.reduce((s, r) => s + r.profit, 0)
  const margin       = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0
  const totalPending = pendingBreakdown.reduce((s, p) => s + p.count, 0)

  return (
    <div className="h-full flex flex-col gap-4 p-5 overflow-hidden">

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 shrink-0">
        <div className="bg-[#44403C] rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-xs text-white/50 font-medium">รายได้วันนี้</p>
          <p className="text-3xl font-black text-white mt-1 leading-none">21,300</p>
          <p className="text-xs text-white/30 mt-0.5">฿ · +12% จากเมื่อวาน</p>
        </div>
        <div className="bg-[#F8981D] rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-xs text-white/70 font-medium">กำไรวันนี้</p>
          <p className="text-3xl font-black text-white mt-1 leading-none">9,200</p>
          <p className="text-xs text-white/50 mt-0.5">฿ · Margin 43%</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-xs text-gray-400 font-medium">งานค้างทั้งหมด</p>
          <p className="text-3xl font-black text-[#1E1E1E] mt-1 leading-none">{totalPending}</p>
          <p className="text-xs text-gray-300 mt-0.5">ใบงาน</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-xs text-gray-400 font-medium">ยอดรอชำระ</p>
          <p className="text-3xl font-black text-[#1E1E1E] mt-1 leading-none">5,600</p>
          <p className="text-xs text-gray-300 mt-0.5">฿ · 2 ใบงาน</p>
        </div>
      </div>

      {/* Main grid */}
      <div className="flex-1 grid gap-4 min-h-0" style={{ gridTemplateColumns: '1fr 240px' }}>

        {/* LEFT: Line chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden min-h-0">
          {/* Chart header */}
          <div className="px-5 py-3 border-b border-gray-100 shrink-0 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[#1E1E1E] shrink-0">รายได้ / ต้นทุน / กำไร</p>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {/* Mode tabs */}
              <div className="flex bg-stone-100 rounded-full p-0.5 gap-0.5">
                {(['daily', 'weekly', 'yearly', 'custom'] as Mode[]).map(m => (
                  <button key={m} onClick={() => setMode(m)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border-none ${mode === m ? 'bg-white text-[#1E1E1E] shadow-sm' : 'text-stone-400 bg-transparent'}`}>
                    {m === 'daily' ? 'รายวัน' : m === 'weekly' ? 'รายสัปดาห์' : m === 'yearly' ? 'รายปี' : 'กำหนดเอง'}
                  </button>
                ))}
              </div>
              {/* Custom date range */}
              {mode === 'custom' && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <input type="date" value={fromDate} max={toDate}
                    onChange={e => setFromDate(e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-[#F8981D] bg-white cursor-pointer" />
                  <span>–</span>
                  <input type="date" value={toDate} min={fromDate} max={today}
                    onChange={e => setToDate(e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-[#F8981D] bg-white cursor-pointer" />
                </div>
              )}
            </div>
          </div>

          {/* Chart area */}
          <div className="flex-1 min-h-0 px-2 pt-3 pb-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" vertical={false} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11, fill: '#a8a29e' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={fmtY}
                  tick={{ fontSize: 11, fill: '#a8a29e' }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                  formatter={(value) => <span style={{ color: '#78716c' }}>{value}</span>}
                />
                <Line
                  type="monotone" dataKey="revenue" name="รายได้"
                  stroke="#44403C" strokeWidth={2} dot={false} activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone" dataKey="cost" name="ต้นทุน"
                  stroke="#d6d3d1" strokeWidth={1.5} strokeDasharray="4 3"
                  dot={false} activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone" dataKey="profit" name="กำไร"
                  stroke="#F8981D" strokeWidth={2.5}
                  dot={false} activeDot={{ r: 5, fill: '#F8981D' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Totals bar */}
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
              {[
                { id: '0000001', customer: 'ธาดา รถ',     total: 3500 },
                { id: '0000002', customer: 'สมชาย การ์ด', total: 2100 },
              ].map(item => (
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
