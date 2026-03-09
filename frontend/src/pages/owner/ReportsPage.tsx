import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Legend } from 'recharts'

type Period = 'daily' | 'weekly' | 'monthly' | 'custom'

// ─── Types ────────────────────────────────────────────────────────────────────

type JobService = { name: string; price: number }
type JobPart    = { name: string; qty: number; unitCost: number; unitPrice: number }
type JobOrder   = {
  id: number; jobNo: string; customer: string; vehicle: string
  licensePlate: string; time: string; mechanic: string; status: string
  services: JobService[]; parts: JobPart[]
  revenue: number; cost: number; profit: number
}
type DayRow   = { label: string; date: string; jobs: number; revenue: number; cost: number; profit: number }
type MonthRow = { label: string; jobs: number; revenue: number; cost: number; profit: number }
type HourSlot = { hour: string; revenue: number; cost: number; profit: number }
type TooltipPayload = { name: string; value: number; color: string }
type ChartTooltipProps = { active?: boolean; payload?: TooltipPayload[]; label?: string }

// ─── Mock data ────────────────────────────────────────────────────────────────

const todayJobs: JobOrder[] = [
  {
    id: 101, jobNo: 'JB-0101', customer: 'สมชาย ใจดี', vehicle: 'Honda PCX 160', licensePlate: 'กก 999',
    time: '08:30', mechanic: 'วิชัย', status: 'เสร็จแล้ว',
    services: [{ name: 'เปลี่ยนผ้าเบรกหน้า', price: 450 }, { name: 'ตรวจเช็กระบบเบรก', price: 200 }],
    parts: [{ name: 'ผ้าเบรกหน้า Honda PCX', qty: 1, unitCost: 280, unitPrice: 450 }],
    revenue: 1100, cost: 580, profit: 520,
  },
  {
    id: 102, jobNo: 'JB-0102', customer: 'วิภา รักสะอาด', vehicle: 'Yamaha NMAX 155', licensePlate: 'คง 5678',
    time: '09:15', mechanic: 'สมชาย', status: 'เสร็จแล้ว',
    services: [{ name: 'เปลี่ยนน้ำมันเครื่อง', price: 220 }, { name: 'เปลี่ยนไส้กรองน้ำมัน', price: 120 }],
    parts: [
      { name: 'น้ำมันเครื่อง 10W-40 (1L)', qty: 2, unitCost: 120, unitPrice: 220 },
      { name: 'ไส้กรองน้ำมัน', qty: 1, unitCost: 60, unitPrice: 120 },
    ],
    revenue: 780, cost: 420, profit: 360,
  },
  {
    id: 103, jobNo: 'JB-0103', customer: 'ประเสริฐ มั่นคง', vehicle: 'Honda Wave 125i', licensePlate: 'จฉ 9012',
    time: '10:00', mechanic: 'ณัฐพล', status: 'เสร็จแล้ว',
    services: [{ name: 'ซ่อมระบบไฟหน้า', price: 350 }, { name: 'เปลี่ยนหลอดไฟ', price: 130 }],
    parts: [{ name: 'หลอดไฟหน้า HS1 35W', qty: 1, unitCost: 65, unitPrice: 130 }],
    revenue: 480, cost: 265, profit: 215,
  },
  {
    id: 104, jobNo: 'JB-0104', customer: 'นภา สุขสันต์', vehicle: 'Suzuki Burgman 200', licensePlate: 'ชซ 3456',
    time: '11:30', mechanic: 'วิชัย', status: 'เสร็จแล้ว',
    services: [{ name: 'เปลี่ยนสายพาน', price: 650 }, { name: 'ตรวจเช็กเครื่องยนต์', price: 300 }],
    parts: [{ name: 'สายพาน Yamaha NMAX', qty: 1, unitCost: 380, unitPrice: 650 }],
    revenue: 1600, cost: 880, profit: 720,
  },
  {
    id: 105, jobNo: 'JB-0105', customer: 'ธนพล วิริยะ', vehicle: 'Honda Click 125i', licensePlate: 'ญฐ 7890',
    time: '13:00', mechanic: 'ประยุทธ์', status: 'เสร็จแล้ว',
    services: [{ name: 'เปลี่ยนโซ่และสเตอร์', price: 1070 }],
    parts: [
      { name: 'โซ่ขับเคลื่อน 428H', qty: 1, unitCost: 420, unitPrice: 750 },
      { name: 'สเตอร์หน้า Honda', qty: 1, unitCost: 180, unitPrice: 320 },
    ],
    revenue: 1070, cost: 600, profit: 470,
  },
  {
    id: 106, jobNo: 'JB-0106', customer: 'มาลี สวัสดี', vehicle: 'Yamaha Aerox 155', licensePlate: 'ดต 1234',
    time: '14:00', mechanic: 'กิตติพงษ์', status: 'เสร็จแล้ว',
    services: [{ name: 'เปลี่ยนแบตเตอรี่', price: 950 }, { name: 'ตรวจระบบไฟฟ้า', price: 200 }],
    parts: [{ name: 'แบตเตอรี่ 12V 5Ah', qty: 1, unitCost: 550, unitPrice: 950 }],
    revenue: 1150, cost: 650, profit: 500,
  },
  {
    id: 107, jobNo: 'JB-0107', customer: 'อรุณ ดีใจ', vehicle: 'Honda PCX 160', licensePlate: 'ขข 1111',
    time: '15:30', mechanic: 'อภิสิทธิ์', status: 'เสร็จแล้ว',
    services: [{ name: 'เปลี่ยนยางนอก', price: 1200 }, { name: 'ถ่วงล้อ', price: 150 }],
    parts: [{ name: 'ยางนอก 90/90-17', qty: 1, unitCost: 680, unitPrice: 1200 }],
    revenue: 1350, cost: 780, profit: 570,
  },
  {
    id: 108, jobNo: 'JB-0108', customer: 'สุนีย์ มีสุข', vehicle: 'Honda Wave 125i', licensePlate: 'คค 2222',
    time: '16:30', mechanic: 'สมชาย', status: 'เสร็จแล้ว',
    services: [{ name: 'เปลี่ยนหัวเทียน', price: 160 }, { name: 'เปลี่ยนไส้กรองอากาศ', price: 180 }, { name: 'ล้างคาร์บูเรเตอร์', price: 250 }],
    parts: [
      { name: 'หัวเทียน NGK CR7E', qty: 1, unitCost: 85, unitPrice: 160 },
      { name: 'ไส้กรองอากาศ Honda Wave', qty: 1, unitCost: 95, unitPrice: 180 },
    ],
    revenue: 870, cost: 480, profit: 390,
  },
]

const hourlySlots: HourSlot[] = (() => {
  const slots: Record<string, HourSlot> = {}
  for (let h = 8; h <= 17; h++) {
    const key = `${String(h).padStart(2, '0')}:00`
    slots[key] = { hour: key, revenue: 0, cost: 0, profit: 0 }
  }
  todayJobs.forEach(j => {
    const h = parseInt(j.time.split(':')[0])
    const key = `${String(h).padStart(2, '0')}:00`
    if (slots[key]) {
      slots[key].revenue += j.revenue
      slots[key].cost    += j.cost
      slots[key].profit  += j.profit
    }
  })
  return Object.values(slots)
})()

const weeklyDays: DayRow[] = [
  { label: 'จ 03/03', date: '03/03/2026', jobs: 7,  revenue: 15600, cost: 9300,  profit: 6300 },
  { label: 'อ 04/03', date: '04/03/2026', jobs: 4,  revenue: 11200, cost: 6800,  profit: 4400 },
  { label: 'พ 05/03', date: '05/03/2026', jobs: 9,  revenue: 18900, cost: 10500, profit: 8400 },
  { label: 'พฤ 06/03', date: '06/03/2026', jobs: 3, revenue: 9400,  cost: 5600,  profit: 3800 },
  { label: 'ศ 07/03', date: '07/03/2026', jobs: 10, revenue: 21300, cost: 12100, profit: 9200 },
  { label: 'ส 08/03', date: '08/03/2026', jobs: 5,  revenue: 12400, cost: 7200,  profit: 5200 },
  { label: 'อา 09/03', date: '09/03/2026', jobs: 8, revenue: 8400,  cost: 4655,  profit: 3745 },
]

const monthlyRows: MonthRow[] = [
  { label: 'เม.ย. 2025',  jobs: 98,  revenue: 248000, cost: 146000, profit: 102000 },
  { label: 'พ.ค. 2025',   jobs: 115, revenue: 292000, cost: 172000, profit: 120000 },
  { label: 'มิ.ย. 2025',  jobs: 107, revenue: 271000, cost: 160000, profit: 111000 },
  { label: 'ก.ค. 2025',   jobs: 122, revenue: 308000, cost: 181000, profit: 127000 },
  { label: 'ส.ค. 2025',   jobs: 119, revenue: 300000, cost: 177000, profit: 123000 },
  { label: 'ก.ย. 2025',   jobs: 103, revenue: 261000, cost: 154000, profit: 107000 },
  { label: 'ต.ค. 2025',   jobs: 112, revenue: 285000, cost: 168000, profit: 117000 },
  { label: 'พ.ย. 2025',   jobs: 128, revenue: 312000, cost: 184000, profit: 128000 },
  { label: 'ธ.ค. 2025',   jobs: 156, revenue: 398000, cost: 226000, profit: 172000 },
  { label: 'ม.ค. 2026',   jobs: 104, revenue: 267000, cost: 158000, profit: 109000 },
  { label: 'ก.พ. 2026',   jobs: 133, revenue: 334000, cost: 196000, profit: 138000 },
  { label: 'มี.ค. 2026',  jobs: 55,  revenue: 106100, cost: 61855,  profit: 44245 },
]

// ─── Tooltip ─────────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-stone-100 rounded-xl shadow-lg px-4 py-3 text-xs">
      <p className="font-semibold text-[#1E1E1E] mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-stone-500">{p.name}</span>
          </div>
          <span className="font-bold text-[#1E1E1E]">{p.value.toLocaleString()} ฿</span>
        </div>
      ))}
    </div>
  )
}

// ─── Job Detail Modal ─────────────────────────────────────────────────────────

function JobDetailModal({ job, onClose }: { job: JobOrder; onClose: () => void }) {
  const partsRevenue = job.parts.reduce((s, p) => s + p.qty * p.unitPrice, 0)
  const laborRevenue = job.revenue - partsRevenue
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 pt-6 pb-4 border-b border-stone-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-bold text-[#1E1E1E]">{job.jobNo}</span>
                <span className="text-xs bg-[#44403C]/10 text-[#44403C] px-2 py-0.5 rounded-full">{job.status}</span>
              </div>
              <p className="text-xs text-stone-400">{job.customer} · {job.vehicle} · {job.licensePlate} · {job.time} น.</p>
              <p className="text-xs text-stone-400 mt-0.5">ช่าง: {job.mechanic}</p>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center cursor-pointer border-none hover:bg-stone-200 transition-colors">
              <svg className="w-4 h-4 text-stone-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="px-6 py-4 overflow-y-auto flex-1 flex flex-col gap-4">
          <div>
            <p className="text-xs text-stone-400 mb-2">รายการบริการ</p>
            <div className="flex flex-col gap-1.5">
              {job.services.map((s, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-stone-600">{s.name}</span>
                  <span className="font-medium text-[#1E1E1E]">{s.price.toLocaleString()} ฿</span>
                </div>
              ))}
            </div>
          </div>
          {job.parts.length > 0 && (
            <div>
              <p className="text-xs text-stone-400 mb-2">อะไหล่ที่ใช้</p>
              <div className="rounded-xl border border-stone-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-stone-50">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-stone-400">รายการ</th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium text-stone-400">จำนวน</th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium text-stone-400">ราคาทุน</th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium text-stone-400">ราคาขาย</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {job.parts.map((p, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2.5 text-stone-600">{p.name}</td>
                        <td className="px-4 py-2.5 text-right text-stone-400">{p.qty}</td>
                        <td className="px-4 py-2.5 text-right text-stone-400">{(p.qty * p.unitCost).toLocaleString()} ฿</td>
                        <td className="px-4 py-2.5 text-right font-medium text-[#1E1E1E]">{(p.qty * p.unitPrice).toLocaleString()} ฿</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="bg-stone-50 rounded-xl px-4 py-3 flex flex-col gap-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">ค่าแรง</span>
              <span className="text-[#1E1E1E]">{laborRevenue.toLocaleString()} ฿</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">ค่าอะไหล่</span>
              <span className="text-[#1E1E1E]">{partsRevenue.toLocaleString()} ฿</span>
            </div>
            <div className="border-t border-stone-200 mt-1 pt-1.5 flex justify-between text-sm font-semibold">
              <span className="text-stone-600">รายได้รวม</span>
              <span className="text-[#1E1E1E]">{job.revenue.toLocaleString()} ฿</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">ต้นทุน</span>
              <span className="text-red-400">{job.cost.toLocaleString()} ฿</span>
            </div>
            <div className="flex justify-between text-sm font-bold">
              <span className="text-[#44403C]">กำไร</span>
              <span className="text-[#F8981D]">{job.profit.toLocaleString()} ฿</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [period, setPeriod]           = useState<Period>('daily')
  const [selectedJob, setSelectedJob] = useState<JobOrder | null>(null)
  const [customFrom, setCustomFrom]   = useState('2026-03-01')
  const [customTo, setCustomTo]       = useState('2026-03-09')

  // Aggregate helpers
  const sumRevenue = (arr: { revenue: number }[]) => arr.reduce((s, r) => s + r.revenue, 0)
  const sumCost    = (arr: { cost: number }[])    => arr.reduce((s, r) => s + r.cost, 0)
  const sumProfit  = (arr: { profit: number }[])  => arr.reduce((s, r) => s + r.profit, 0)
  const sumJobs    = (arr: { jobs: number }[])    => arr.reduce((s, r) => s + r.jobs, 0)

  // Summary for each period
  const dailySummary  = { revenue: sumRevenue(todayJobs), cost: sumCost(todayJobs), profit: sumProfit(todayJobs), jobs: todayJobs.length }
  const weeklySummary = { revenue: sumRevenue(weeklyDays), cost: sumCost(weeklyDays), profit: sumProfit(weeklyDays), jobs: sumJobs(weeklyDays) }
  const monthlySummary= { revenue: sumRevenue(monthlyRows), cost: sumCost(monthlyRows), profit: sumProfit(monthlyRows), jobs: sumJobs(monthlyRows) }

  // Custom — reuse weekly days as sample filtered data (in real app: filter by date)
  const customSummary = weeklySummary

  const activeSummary =
    period === 'daily'   ? dailySummary  :
    period === 'weekly'  ? weeklySummary :
    period === 'monthly' ? monthlySummary : customSummary

  const margin = Math.round((activeSummary.profit / activeSummary.revenue) * 100)

  const periodLabel =
    period === 'daily'   ? 'วันนี้ (09/03/2026)' :
    period === 'weekly'  ? '7 วันย้อนหลัง (03–09 มี.ค. 2026)' :
    period === 'monthly' ? '12 เดือนย้อนหลัง (เม.ย. 2025 – มี.ค. 2026)' :
    `${customFrom} ถึง ${customTo}`

  // PDF export
  const handleExportPDF = () => {
    const tableRows =
      period === 'daily'
        ? todayJobs.map(j => ({ date: `${j.jobNo} – ${j.customer}`, jobs: 1, revenue: j.revenue, cost: j.cost, profit: j.profit }))
        : period === 'weekly'  ? weeklyDays.map(r  => ({ date: r.label, jobs: r.jobs, revenue: r.revenue, cost: r.cost, profit: r.profit }))
        : period === 'monthly' ? monthlyRows.map(r => ({ date: r.label, jobs: r.jobs, revenue: r.revenue, cost: r.cost, profit: r.profit }))
        : weeklyDays.map(r  => ({ date: r.label, jobs: r.jobs, revenue: r.revenue, cost: r.cost, profit: r.profit }))
    const colLabel = period === 'daily' ? 'ใบงาน' : period === 'weekly' ? 'วัน' : period === 'monthly' ? 'เดือน' : 'ช่วงวันที่'
    const w = window.open('', '_blank', 'width=900,height=700')
    if (!w) return
    w.document.write(`<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8"/>
      <title>รายงานการเงิน</title>
      <style>
        *{box-sizing:border-box;margin:0;padding:0}body{font-family:'Sarabun','Tahoma',sans-serif;font-size:13px;color:#1E1E1E;padding:32px}
        h1{font-size:20px;font-weight:700;margin-bottom:4px}.sub{color:#78716c;font-size:12px;margin-bottom:24px}
        .cards{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
        .card{border:1px solid #e7e5e4;border-radius:10px;padding:14px}.lbl{font-size:11px;color:#78716c;margin-bottom:4px}.val{font-size:18px;font-weight:700}
        table{width:100%;border-collapse:collapse}th{background:#f5f5f4;text-align:left;padding:10px 12px;font-size:11px;color:#78716c;font-weight:600}
        th.r,td.r{text-align:right}td{padding:10px 12px;border-bottom:1px solid #f5f5f4;font-size:12px}
        tfoot td{font-weight:700;background:#f5f5f4}.footer{margin-top:32px;font-size:11px;color:#a8a29e;text-align:right}
      </style></head><body>
      <h1>รายงานการเงิน</h1>
      <p class="sub">Smart Moto Service Center &nbsp;·&nbsp; ${periodLabel} &nbsp;·&nbsp; พิมพ์เมื่อ ${new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <div class="cards">
        <div class="card"><div class="lbl">ใบงาน</div><div class="val">${activeSummary.jobs} ใบ</div></div>
        <div class="card"><div class="lbl">รายได้รวม</div><div class="val">${activeSummary.revenue.toLocaleString()} ฿</div></div>
        <div class="card"><div class="lbl">ต้นทุนรวม</div><div class="val" style="color:#ef4444">${activeSummary.cost.toLocaleString()} ฿</div></div>
        <div class="card"><div class="lbl">กำไรสุทธิ (${margin}%)</div><div class="val" style="color:#F8981D">${activeSummary.profit.toLocaleString()} ฿</div></div>
      </div>
      <table><thead><tr><th>${colLabel}</th><th class="r">ใบงาน</th><th class="r">รายได้ (฿)</th><th class="r">ต้นทุน (฿)</th><th class="r">กำไร (฿)</th><th class="r">Margin</th></tr></thead>
      <tbody>${tableRows.map(r => {
        const m = Math.round((r.profit / r.revenue) * 100)
        return `<tr><td>${r.date}</td><td class="r">${r.jobs}</td><td class="r">${r.revenue.toLocaleString()}</td><td class="r" style="color:#ef4444">${r.cost.toLocaleString()}</td><td class="r" style="color:#F8981D;font-weight:600">${r.profit.toLocaleString()}</td><td class="r">${m}%</td></tr>`
      }).join('')}</tbody>
      <tfoot><tr><td>รวม</td><td class="r">${activeSummary.jobs}</td><td class="r">${activeSummary.revenue.toLocaleString()}</td><td class="r" style="color:#ef4444">${activeSummary.cost.toLocaleString()}</td><td class="r" style="color:#F8981D">${activeSummary.profit.toLocaleString()}</td><td class="r">${margin}%</td></tr></tfoot>
      </table><div class="footer">เอกสารนี้สร้างโดยระบบ Smart Moto Service Center</div></body></html>`)
    w.document.close(); w.focus(); setTimeout(() => { w.print(); w.close() }, 400)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#F5F5F5]">
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between shrink-0 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[#1E1E1E]">รายงานการเงิน</h2>
          <p className="text-sm text-stone-400 mt-0.5">{periodLabel}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex bg-white border border-stone-200 rounded-full p-1 gap-1">
            {(['daily', 'weekly', 'monthly', 'custom'] as Period[]).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer border-none ${period === p ? 'bg-[#44403C] text-white' : 'text-stone-400 bg-transparent hover:text-stone-600'}`}>
                {p === 'daily' ? 'รายวัน' : p === 'weekly' ? 'รายสัปดาห์' : p === 'monthly' ? 'รายเดือน' : 'กำหนดเอง'}
              </button>
            ))}
          </div>
          {period === 'custom' && (
            <div className="flex items-center gap-2 text-sm">
              <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                className="border border-stone-200 rounded-xl px-3 py-2 bg-white outline-none focus:border-[#F8981D] text-stone-700 cursor-pointer" />
              <span className="text-stone-400">ถึง</span>
              <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                className="border border-stone-200 rounded-xl px-3 py-2 bg-white outline-none focus:border-[#F8981D] text-stone-700 cursor-pointer" />
            </div>
          )}
          <button onClick={handleExportPDF}
            className="flex items-center gap-2 bg-[#44403C] text-white text-sm px-4 py-2.5 rounded-full cursor-pointer border-none hover:bg-black transition-colors shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            ดาวน์โหลด PDF
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 shrink-0">
        <div className="bg-[#44403C] rounded-2xl px-5 py-5">
          <div className="text-sm text-white/50">ใบงาน{period === 'daily' ? 'วันนี้' : ''}</div>
          <div className="text-3xl font-black text-white mt-1">{activeSummary.jobs}</div>
          <div className="text-xs text-white/40 mt-1">ใบ</div>
        </div>
        <div className="bg-white border border-stone-100 rounded-2xl px-5 py-5">
          <div className="text-sm text-stone-400">รายได้รวม</div>
          <div className="text-2xl font-black text-[#1E1E1E] mt-1">{activeSummary.revenue.toLocaleString()}</div>
          <div className="text-xs text-stone-400 mt-1">บาท</div>
        </div>
        <div className="bg-white border border-stone-100 rounded-2xl px-5 py-5">
          <div className="text-sm text-stone-400">ต้นทุนรวม</div>
          <div className="text-2xl font-black text-red-400 mt-1">{activeSummary.cost.toLocaleString()}</div>
          <div className="text-xs text-stone-400 mt-1">บาท</div>
        </div>
        <div className="bg-[#F8981D] rounded-2xl px-5 py-5">
          <div className="text-sm text-white/70">กำไรสุทธิ</div>
          <div className="text-2xl font-black text-white mt-1">{activeSummary.profit.toLocaleString()}</div>
          <div className="text-xs text-white/60 mt-1">Margin {margin}%</div>
        </div>
      </div>

      {/* ── DAILY ── hourly chart + job list */}
      {period === 'daily' && (
        <>
          <div className="bg-white rounded-2xl border border-stone-100 p-5 shrink-0">
            <p className="text-sm font-medium text-stone-400 mb-4">รายได้รายชั่วโมง (09/03/2026)</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hourlySlots} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                <ReTooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="revenue" name="รายได้" fill="#44403C" radius={[4,4,0,0]} />
                <Bar dataKey="cost"    name="ต้นทุน" fill="#e7e5e4" radius={[4,4,0,0]} />
                <Bar dataKey="profit"  name="กำไร"   fill="#F8981D" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <p className="text-sm font-medium text-stone-400 mb-3">ใบงานวันนี้ · กดเพื่อดูรายละเอียด</p>
            <div className="flex flex-col gap-2">
              {todayJobs.map(job => (
                <button key={job.id} onClick={() => setSelectedJob(job)}
                  className="bg-white rounded-2xl border border-stone-100 px-5 py-4 flex items-center gap-4 text-left w-full cursor-pointer hover:border-[#F8981D]/40 hover:shadow-sm transition-all">
                  <div className="w-12 h-12 rounded-full bg-[#44403C] flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {job.time}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm text-[#1E1E1E]">{job.jobNo}</span>
                      <span className="text-sm text-stone-500">{job.customer}</span>
                      <span className="text-stone-300">·</span>
                      <span className="text-sm text-stone-400">{job.vehicle} {job.licensePlate}</span>
                    </div>
                    <div className="text-sm text-stone-400 truncate">
                      {job.services.map(s => s.name).join(', ')}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-base font-bold text-[#1E1E1E]">{job.revenue.toLocaleString()} ฿</div>
                    <div className="text-sm text-[#F8981D]">กำไร {job.profit.toLocaleString()} ฿</div>
                  </div>
                  <svg className="w-4 h-4 text-stone-300 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── WEEKLY ── 7-day chart + table */}
      {period === 'weekly' && (
        <>
          <div className="bg-white rounded-2xl border border-stone-100 p-5 shrink-0">
            <p className="text-sm font-medium text-stone-400 mb-4">รายได้ 7 วันย้อนหลัง</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyDays} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                <ReTooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="revenue" name="รายได้" fill="#44403C" radius={[4,4,0,0]} />
                <Bar dataKey="cost"    name="ต้นทุน" fill="#e7e5e4" radius={[4,4,0,0]} />
                <Bar dataKey="profit"  name="กำไร"   fill="#F8981D" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <SummaryTable rows={weeklyDays.map(r => ({ label: r.label, jobs: r.jobs, revenue: r.revenue, cost: r.cost, profit: r.profit }))} colLabel="วัน" />
        </>
      )}

      {/* ── MONTHLY ── 12-month chart + table */}
      {period === 'monthly' && (
        <>
          <div className="bg-white rounded-2xl border border-stone-100 p-5 shrink-0">
            <p className="text-sm font-medium text-stone-400 mb-4">รายได้ 12 เดือนย้อนหลัง</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyRows} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                <ReTooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="revenue" name="รายได้" fill="#44403C" radius={[4,4,0,0]} />
                <Bar dataKey="cost"    name="ต้นทุน" fill="#e7e5e4" radius={[4,4,0,0]} />
                <Bar dataKey="profit"  name="กำไร"   fill="#F8981D" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <SummaryTable rows={monthlyRows} colLabel="เดือน" />
        </>
      )}

      {/* ── CUSTOM ── table only (filtered by date range) */}
      {period === 'custom' && (
        <SummaryTable rows={weeklyDays.map(r => ({ label: r.date, jobs: r.jobs, revenue: r.revenue, cost: r.cost, profit: r.profit }))} colLabel="วันที่" />
      )}

      {/* Job detail modal */}
      {selectedJob && <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </div>
    </div>
  )
}

// ─── Reusable summary table ───────────────────────────────────────────────────

type SummaryRow = { label: string; jobs: number; revenue: number; cost: number; profit: number }

function SummaryTable({ rows, colLabel }: { rows: SummaryRow[]; colLabel: string }) {
  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0)
  const totalCost    = rows.reduce((s, r) => s + r.cost, 0)
  const totalProfit  = rows.reduce((s, r) => s + r.profit, 0)
  const totalJobs    = rows.reduce((s, r) => s + r.jobs, 0)
  const margin       = Math.round((totalProfit / totalRevenue) * 100)
  return (
    <div className="rounded-2xl border border-stone-200 overflow-hidden bg-white">
      <table className="w-full text-sm">
        <thead className="bg-stone-50">
          <tr>
            <th className="px-5 py-3.5 text-left font-medium text-stone-500">{colLabel}</th>
            <th className="px-5 py-3.5 text-right font-medium text-stone-500">ใบงาน</th>
            <th className="px-5 py-3.5 text-right font-medium text-stone-500">รายได้ (฿)</th>
            <th className="px-5 py-3.5 text-right font-medium text-stone-500">ต้นทุน (฿)</th>
            <th className="px-5 py-3.5 text-right font-medium text-stone-500">กำไร (฿)</th>
            <th className="px-5 py-3.5 text-right font-medium text-stone-500">Margin</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-50">
          {rows.map((row, i) => {
            const m = Math.round((row.profit / row.revenue) * 100)
            return (
              <tr key={i} className="hover:bg-stone-50/60 transition-colors">
                <td className="px-5 py-3.5 font-medium text-stone-700">{row.label}</td>
                <td className="px-5 py-3.5 text-right text-stone-500">{row.jobs}</td>
                <td className="px-5 py-3.5 text-right text-stone-700">{row.revenue.toLocaleString()}</td>
                <td className="px-5 py-3.5 text-right text-red-400">{row.cost.toLocaleString()}</td>
                <td className="px-5 py-3.5 text-right text-[#F8981D] font-semibold">{row.profit.toLocaleString()}</td>
                <td className="px-5 py-3.5 text-right">
                  <span className="text-xs font-medium bg-[#F8981D]/10 text-[#F8981D] px-2 py-0.5 rounded-full">{m}%</span>
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot className="bg-stone-50 border-t border-stone-100">
          <tr>
            <td className="px-5 py-3.5 font-semibold text-[#1E1E1E]">รวม</td>
            <td className="px-5 py-3.5 text-right font-semibold text-stone-700">{totalJobs}</td>
            <td className="px-5 py-3.5 text-right font-semibold text-stone-700">{totalRevenue.toLocaleString()}</td>
            <td className="px-5 py-3.5 text-right font-semibold text-red-400">{totalCost.toLocaleString()}</td>
            <td className="px-5 py-3.5 text-right font-semibold text-[#F8981D]">{totalProfit.toLocaleString()}</td>
            <td className="px-5 py-3.5 text-right">
              <span className="text-xs font-semibold bg-[#F8981D]/15 text-[#F8981D] px-2 py-0.5 rounded-full">{margin}%</span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
