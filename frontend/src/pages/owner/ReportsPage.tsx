import { useState } from 'react'

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly'

type ReportRow = {
  date: string
  jobs: number
  revenue: number
  cost: number
  profit: number
}

const allData: Record<Period, ReportRow[]> = {
  daily: [
    { date: '01/03/2026', jobs: 5,  revenue: 12400, cost: 7200,  profit: 5200 },
    { date: '02/03/2026', jobs: 3,  revenue: 8900,  cost: 5100,  profit: 3800 },
    { date: '03/03/2026', jobs: 7,  revenue: 15600, cost: 9300,  profit: 6300 },
    { date: '04/03/2026', jobs: 4,  revenue: 11200, cost: 6800,  profit: 4400 },
    { date: '05/03/2026', jobs: 9,  revenue: 18900, cost: 10500, profit: 8400 },
    { date: '06/03/2026', jobs: 3,  revenue: 9400,  cost: 5600,  profit: 3800 },
    { date: '07/03/2026', jobs: 10, revenue: 21300, cost: 12100, profit: 9200 },
  ],
  weekly: [
    { date: 'สัปดาห์ที่ 1 (01–07 ม.ค.)', jobs: 38,  revenue: 92000,  cost: 54000,  profit: 38000 },
    { date: 'สัปดาห์ที่ 2 (08–14 ม.ค.)', jobs: 42,  revenue: 105000, cost: 61000,  profit: 44000 },
    { date: 'สัปดาห์ที่ 3 (15–21 ม.ค.)', jobs: 35,  revenue: 87000,  cost: 51000,  profit: 36000 },
    { date: 'สัปดาห์ที่ 4 (22–28 ม.ค.)', jobs: 44,  revenue: 110000, cost: 64000,  profit: 46000 },
    { date: 'สัปดาห์ที่ 5 (29 ม.ค.–04 ก.พ.)', jobs: 40, revenue: 99000, cost: 58000, profit: 41000 },
    { date: 'สัปดาห์ที่ 6 (05–11 ก.พ.)', jobs: 36,  revenue: 89000,  cost: 52000,  profit: 37000 },
    { date: 'สัปดาห์ที่ 7 (12–18 ก.พ.)', jobs: 48,  revenue: 120000, cost: 70000,  profit: 50000 },
    { date: 'สัปดาห์ที่ 8 (19–25 ก.พ.)', jobs: 41,  revenue: 103000, cost: 60000,  profit: 43000 },
    { date: 'สัปดาห์ที่ 9 (26 ก.พ.–04 มี.ค.)', jobs: 31, revenue: 77000, cost: 45000, profit: 32000 },
  ],
  monthly: [
    { date: 'ตุลาคม 2025',    jobs: 112, revenue: 285000, cost: 168000, profit: 117000 },
    { date: 'พฤศจิกายน 2025', jobs: 128, revenue: 312000, cost: 184000, profit: 128000 },
    { date: 'ธันวาคม 2025',   jobs: 156, revenue: 398000, cost: 226000, profit: 172000 },
    { date: 'มกราคม 2026',    jobs: 104, revenue: 267000, cost: 158000, profit: 109000 },
    { date: 'กุมภาพันธ์ 2026', jobs: 133, revenue: 334000, cost: 196000, profit: 138000 },
    { date: 'มีนาคม 2026',    jobs: 41,  revenue: 97700,  cost: 57200,  profit: 40500  },
  ],
  yearly: [
    { date: '2021', jobs: 820,  revenue: 2100000, cost: 1230000, profit: 870000  },
    { date: '2022', jobs: 1080, revenue: 2800000, cost: 1650000, profit: 1150000 },
    { date: '2023', jobs: 1320, revenue: 3400000, cost: 1980000, profit: 1420000 },
    { date: '2024', jobs: 1510, revenue: 3900000, cost: 2250000, profit: 1650000 },
    { date: '2025', jobs: 1620, revenue: 4200000, cost: 2420000, profit: 1780000 },
    { date: '2026', jobs: 355,  revenue: 915000,  cost: 531000,  profit: 384000  },
  ],
}

const periodLabels: Record<Period, string> = {
  daily:   'รายวัน (มีนาคม 2026)',
  weekly:  'รายสัปดาห์ (ม.ค. – มี.ค. 2026)',
  monthly: 'รายเดือน (ต.ค. 2025 – มี.ค. 2026)',
  yearly:  'รายปี (2021 – 2026)',
}

const dateColLabel: Record<Period, string> = {
  daily: 'วันที่', weekly: 'สัปดาห์', monthly: 'เดือน', yearly: 'ปี',
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('daily')
  const data = allData[period]

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0)
  const totalCost    = data.reduce((s, d) => s + d.cost, 0)
  const totalProfit  = data.reduce((s, d) => s + d.profit, 0)
  const totalJobs    = data.reduce((s, d) => s + d.jobs, 0)
  const margin       = Math.round((totalProfit / totalRevenue) * 100)

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=700')
    if (!printWindow) return
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8" />
        <title>รายงานการเงิน – ${periodLabels[period]}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Sarabun', 'Tahoma', sans-serif; font-size: 13px; color: #1E1E1E; padding: 32px; }
          h1 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
          .subtitle { color: #78716c; font-size: 12px; margin-bottom: 24px; }
          .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
          .card { border: 1px solid #e7e5e4; border-radius: 10px; padding: 14px; }
          .card-label { font-size: 11px; color: #78716c; margin-bottom: 4px; }
          .card-value { font-size: 18px; font-weight: 700; }
          .green { color: #22c55e; } .red { color: #ef4444; } .orange { color: #F8981D; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f5f5f4; text-align: left; padding: 10px 12px; font-size: 11px; color: #78716c; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
          th.right, td.right { text-align: right; }
          td { padding: 10px 12px; border-bottom: 1px solid #f5f5f4; font-size: 12px; }
          tfoot td { font-weight: 700; background: #f5f5f4; }
          .badge { display: inline-block; background: #fff7ed; color: #F8981D; font-size: 11px; padding: 2px 8px; border-radius: 99px; }
          .footer { margin-top: 32px; font-size: 11px; color: #a8a29e; text-align: right; }
        </style>
      </head>
      <body>
        <h1>รายงานการเงิน</h1>
        <p class="subtitle">Smart Moto Service Center &nbsp;·&nbsp; ${periodLabels[period]} &nbsp;·&nbsp; พิมพ์เมื่อ ${new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <div class="summary">
          <div class="card"><div class="card-label">ใบงานทั้งหมด</div><div class="card-value">${totalJobs} ใบ</div></div>
          <div class="card"><div class="card-label">รายได้รวม</div><div class="card-value">${totalRevenue.toLocaleString()} ฿</div></div>
          <div class="card"><div class="card-label">ต้นทุนรวม</div><div class="card-value red">${totalCost.toLocaleString()} ฿</div></div>
          <div class="card"><div class="card-label">กำไรสุทธิ (${margin}%)</div><div class="card-value green">${totalProfit.toLocaleString()} ฿</div></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>${dateColLabel[period]}</th>
              <th class="right">ใบงาน</th>
              <th class="right">รายได้ (฿)</th>
              <th class="right">ต้นทุน (฿)</th>
              <th class="right">กำไร (฿)</th>
              <th class="right">Margin</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(row => {
              const m = Math.round((row.profit / row.revenue) * 100)
              return `<tr>
                <td>${row.date}</td>
                <td class="right">${row.jobs}</td>
                <td class="right">${row.revenue.toLocaleString()}</td>
                <td class="right" style="color:#ef4444">${row.cost.toLocaleString()}</td>
                <td class="right" style="color:#F8981D;font-weight:600">${row.profit.toLocaleString()}</td>
                <td class="right"><span class="badge">${m}%</span></td>
              </tr>`
            }).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td>รวม</td>
              <td class="right">${totalJobs}</td>
              <td class="right">${totalRevenue.toLocaleString()}</td>
              <td class="right" style="color:#ef4444">${totalCost.toLocaleString()}</td>
              <td class="right" style="color:#F8981D">${totalProfit.toLocaleString()}</td>
              <td class="right"><span class="badge">${margin}%</span></td>
            </tr>
          </tfoot>
        </table>
        <div class="footer">เอกสารนี้สร้างโดยระบบ Smart Moto Service Center</div>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => { printWindow.print(); printWindow.close() }, 400)
  }

  return (
    <div className="h-full overflow-y-auto bg-white p-6 flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-base font-semibold text-[#1E1E1E]">รายงานการเงิน</h2>
          <p className="text-xs text-gray-400 mt-0.5">สรุปรายได้ ต้นทุน และกำไรของร้าน · {periodLabels[period]}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-stone-100 rounded-full p-0.5 gap-0.5">
            {(['daily', 'weekly', 'monthly', 'yearly'] as Period[]).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border-none ${period === p ? 'bg-white text-[#1E1E1E] shadow-sm' : 'text-stone-400 bg-transparent'}`}>
                {p === 'daily' ? 'รายวัน' : p === 'weekly' ? 'รายสัปดาห์' : p === 'monthly' ? 'รายเดือน' : 'รายปี'}
              </button>
            ))}
          </div>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-[#44403C] text-white text-sm px-4 py-2 rounded-full cursor-pointer border-none hover:bg-black transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 shrink-0">
        <div className="bg-[#44403C] rounded-2xl px-5 py-4 shadow-sm">
          <div className="text-xs text-white/50 font-medium">ใบงานทั้งหมด</div>
          <div className="text-2xl font-black text-white mt-1">{totalJobs} ใบ</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
          <div className="text-xs text-gray-400">รายได้รวม</div>
          <div className="text-2xl font-black text-[#1E1E1E] mt-1">{totalRevenue.toLocaleString()} ฿</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
          <div className="text-xs text-gray-400">ต้นทุนรวม</div>
          <div className="text-2xl font-black text-red-400 mt-1">{totalCost.toLocaleString()} ฿</div>
        </div>
        <div className="bg-[#F8981D] rounded-2xl px-5 py-4 shadow-sm">
          <div className="text-xs text-white/70">กำไรสุทธิ</div>
          <div className="text-2xl font-black text-white mt-1">{totalProfit.toLocaleString()} ฿</div>
          <div className="text-xs text-white/60 mt-0.5">Margin {margin}%</div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F5F5F5]">
            <tr>
              <th className="px-5 py-4 text-left font-medium text-gray-500 rounded-l-2xl">{dateColLabel[period]}</th>
              <th className="px-5 py-4 text-right font-medium text-gray-500">ใบงาน</th>
              <th className="px-5 py-4 text-right font-medium text-gray-500">รายได้ (฿)</th>
              <th className="px-5 py-4 text-right font-medium text-gray-500">ต้นทุน (฿)</th>
              <th className="px-5 py-4 text-right font-medium text-gray-500">กำไร (฿)</th>
              <th className="px-5 py-4 text-right font-medium text-gray-500 rounded-r-2xl">Margin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((row, i) => {
              const m = Math.round((row.profit / row.revenue) * 100)
              return (
                <tr key={i} className="hover:bg-stone-50/60 transition-colors">
                  <td className="px-5 py-3.5 text-gray-700 font-medium">{row.date}</td>
                  <td className="px-5 py-3.5 text-right text-gray-500">{row.jobs}</td>
                  <td className="px-5 py-3.5 text-right text-gray-700">{row.revenue.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-right text-red-400">{row.cost.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-right text-[#F8981D] font-semibold">{row.profit.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-xs font-medium bg-[#F8981D]/10 text-[#F8981D] px-2 py-0.5 rounded-full">{m}%</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot className="bg-[#F5F5F5]">
            <tr>
              <td className="px-5 py-3.5 font-semibold text-[#1E1E1E]">รวม</td>
              <td className="px-5 py-3.5 text-right font-semibold text-gray-700">{totalJobs}</td>
              <td className="px-5 py-3.5 text-right font-semibold text-gray-700">{totalRevenue.toLocaleString()}</td>
              <td className="px-5 py-3.5 text-right font-semibold text-red-400">{totalCost.toLocaleString()}</td>
              <td className="px-5 py-3.5 text-right font-semibold text-[#F8981D]">{totalProfit.toLocaleString()}</td>
              <td className="px-5 py-3.5 text-right">
                <span className="text-xs font-semibold bg-[#F8981D]/15 text-[#F8981D] px-2 py-0.5 rounded-full">{margin}%</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

    </div>
  )
}
