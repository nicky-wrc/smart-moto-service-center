import { useEffect, useState } from 'react'
import { dashboardService, type DashboardMetrics, type Activity } from '../../services/dashboardService'
import { useActivityLog } from '../../hooks/useActivityLog'

const LOW_STOCK_THRESHOLD = 10

function fmt(n: number) {
  return n.toLocaleString('th-TH')
}

// ─── Category colour wheel ───────────────────────────────────────────────────
const CAT_COLORS = [
  '#F8981D',
  '#3B82F6',
  '#10B981',
  '#8B5CF6',
  '#EF4444',
  '#F59E0B',
  '#06B6D4',
  '#EC4899',
]

// ─── Component ───────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const { activities: recentLog } = useActivityLog()

  const [data, setData] = useState<DashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const loadData = async () => {
      try {
        const result = await dashboardService.fetchDashboardMetrics()
        if (isMounted) setData(result)
      } catch (err) {
        console.error('Failed to load dashboard metrics', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    loadData()
    return () => { isMounted = false }
  }, [])

  if (isLoading || !data) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  // Display top 10 activities overall, combining new tracking logs with old fallback data
  const renderActivities: Activity[] = [...recentLog, ...data.fallbackActivities.filter(fa => !recentLog.find(ra => ra.id === fa.id))]
    .sort((a, b) => {
      const timeA = ('timestamp' in a ? (a as any).timestamp : new Date(a.date).getTime()) as number
      const timeB = ('timestamp' in b ? (b as any).timestamp : new Date(b.date).getTime()) as number
      return timeB - timeA
    })
    .slice(0, 10)

  const maxRequested = data.topRequestedParts[0]?.count ?? 1

  return (
    <div className="px-6 py-4 min-h-screen space-y-4 bg-gray-50">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <span className="text-sm bg-orange-50 text-orange-500 border border-orange-200 px-3 py-1.5 rounded-full font-medium ">
          อัปเดตล่าสุด: {new Date().toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric' })}
        </span>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          icon={<BoxIcon />}
          iconBg="bg-orange-100"
          iconColor="text-orange-500"
          label="รายการอะไหล่ทั้งหมด"
          value={`${fmt(data.totalItems)} รายการ`}
        />
        <KpiCard
          icon={<WarningIcon />}
          iconBg="bg-red-100"
          iconColor="text-red-500"
          label="อะไหล่ใกล้หมด"
          value={`${fmt(data.lowStockParts.length)} รายการ`}
          highlight
        />
        <KpiCard
          icon={<MoneyIcon />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          label="มูลค่าสต็อกรวม"
          value={`฿${fmt(data.totalStockValue)}`}
        />
        <KpiCard
          icon={<DocIcon />}
          iconBg="bg-blue-100"
          iconColor="text-blue-500"
          label="ใบสั่งซื้อทั้งหมด"
          value={`${fmt(data.purchaseOrderCount)} ใบ`}
        />
      </div>

      {/* ── Scrollable Dashboard Content ── */}
      <div className="overflow-y-auto pr-3 pb-4" style={{ maxHeight: 'calc(100vh - 260px)' }}>
        <div className="flex flex-col gap-4">
          {/* ── Row 2: Low-stock table + Top Requested ── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            {/* Low-stock table */}
            <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <h2 className="font-semibold text-gray-800">อะไหล่ใกล้หมด</h2>
                  <p className="text-sm text-gray-400">คงเหลือน้อยกว่า {LOW_STOCK_THRESHOLD} ชิ้น</p>
                </div>
                <span className="text-sm bg-red-50 text-red-500 border border-red-100 px-2.5 py-1 rounded-full font-medium">
                  {data.lowStockParts.length} รายการ
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50 z-10">
                    <tr className="bg-gray-50 text-gray-500 text-sm">
                      <th className="px-5 py-2.5 text-left font-medium">รหัส</th>
                      <th className="px-4 py-2.5 text-left font-medium">ชื่ออะไหล่</th>
                      <th className="px-4 py-2.5 text-left font-medium">หมวดหมู่</th>
                      <th className="px-4 py-2.5 text-center font-medium">คงเหลือ</th>
                      <th className="px-4 py-2.5 text-center font-medium">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.lowStockParts.map((part) => (
                      <tr key={part.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 text-gray-500 font-mono text-sm">{part.partCode}</td>
                        <td className="px-4 py-3 font-medium text-gray-700 max-w-[180px] truncate">{part.name}</td>
                        <td className="px-4 py-3 text-gray-500">{part.category}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-semibold ${part.quantity === 0 ? 'text-red-600' : part.quantity <= 5 ? 'text-orange-500' : 'text-yellow-600'}`}>
                            {part.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-sm font-medium ${part.quantity === 0
                              ? 'bg-red-100 text-red-600'
                              : part.quantity <= 5
                                ? 'bg-orange-100 text-orange-600'
                                : 'bg-yellow-100 text-yellow-700'
                              }`}
                          >
                            {part.quantity === 0 ? 'หมด' : part.quantity <= 5 ? 'เหลือน้อยมาก' : 'ใกล้หมด'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {data.lowStockParts.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-gray-400 text-sm">
                          ✅ อะไหล่ทุกรายการมีสต็อกเพียงพอ
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Requested Parts */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
              <div>
                <h2 className="font-semibold text-gray-800">อะไหล่ที่เบิกบ่อย</h2>
                <p className="text-sm text-gray-400">5 รายการที่ถูกเบิกมากที่สุด</p>
              </div>
              <div className="flex flex-col gap-3 flex-1">
                {data.topRequestedParts.map((p, i) => (
                  <div key={p.code} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-orange-50 text-orange-500 text-sm font-semibold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 truncate max-w-[130px]">{p.name}</span>
                        <span className="text-sm text-gray-400 flex-shrink-0 ml-2">{p.count} ชิ้น</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all duration-700"
                          style={{
                            width: `${(p.count / maxRequested) * 100}%`,
                            background: `linear-gradient(90deg, #F8981D, #f97316)`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Row 3: Category Stock + PO Status + Recent Activity ── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Category Distribution */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col h-full">
              <h2 className="font-semibold text-gray-800 mb-1">สัดส่วนสต็อกตามหมวดหมู่</h2>
              <p className="text-sm text-gray-400 mb-4">จำนวนชิ้นรวมแยกตามประเภทอะไหล่</p>
              {/* Simple horizontal stacked bar */}
              <div className="w-full flex h-4 rounded-full overflow-hidden gap-px mb-4">
                {data.categories.map(([cat, qty], i) => (
                  <div
                    key={cat}
                    title={`${cat}: ${qty}`}
                    style={{
                      width: `${(qty / data.totalCategoryQty) * 100}%`,
                      backgroundColor: CAT_COLORS[i % CAT_COLORS.length],
                    }}
                  />
                ))}
              </div>
              <div className="space-y-2 flex-1">
                {data.categories.map(([cat, qty], i) => (
                  <div key={cat} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: CAT_COLORS[i % CAT_COLORS.length] }}
                      />
                      <span className="text-sm text-gray-600 truncate">{cat}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-semibold text-gray-800">{qty}</span>
                      <span className="text-sm text-gray-400">ชิ้น</span>
                      <span className="text-sm text-gray-400 w-9 text-right">
                        {((qty / data.totalCategoryQty) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PO Status Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col h-full">
              <h2 className="font-semibold text-gray-800 mb-1">สถานะใบสั่งซื้อ</h2>
              <p className="text-sm text-gray-400 mb-5">สรุปจำนวนใบสั่งซื้อตามสถานะ</p>
              <div className="space-y-3">
                {(
                  [
                    { key: 'draft', label: 'แบบร่าง', color: 'bg-gray-300', textColor: 'text-gray-600' },
                    { key: 'pending', label: 'รออนุมัติ', color: 'bg-yellow-400', textColor: 'text-yellow-700' },
                    { key: 'approved', label: 'อนุมัติแล้ว', color: 'bg-green-400', textColor: 'text-green-700' },
                    { key: 'rejected', label: 'ปฏิเสธ', color: 'bg-red-400', textColor: 'text-red-600' },
                    { key: 'cancelled', label: 'ยกเลิก', color: 'bg-red-200', textColor: 'text-red-400' },
                  ] as const
                ).map(({ key, label, color, textColor }) => {
                  const count = data.poStatusCount[key]
                  const pct = data.purchaseOrderCount > 0 ? (count / data.purchaseOrderCount) * 100 : 0
                  return (
                    <div key={key}>
                      <div className="flex justify-between mb-1">
                        <span className={`text-sm font-medium ${textColor}`}>{label}</span>
                        <span className="text-sm text-gray-500">{count} ใบ</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col h-full">
              <h2 className="font-semibold text-gray-800 mb-1">กิจกรรมล่าสุด</h2>
              <p className="text-sm text-gray-400 mb-4">รายการใบสั่งซื้อและเบิกอะไหล่ล่าสุด</p>
              <div className="space-y-3 flex-1">
                {renderActivities.map((a) => (
                  <div key={a.id} className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${a.type === 'po' ? 'bg-blue-50' : 'bg-orange-50'
                        }`}
                    >
                      {a.type === 'po' ? (
                        <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-700">{a.label}</span>
                        <span className={`text-sm px-1.5 py-0.5 rounded-full font-medium ${a.badgeColor}`}>{a.badge}</span>
                      </div>
                      <div className="flex justify-between mt-0.5">
                        <span className="text-sm text-gray-400 truncate">{a.sub}</span>
                        <span className="text-sm text-gray-400 flex-shrink-0 ml-2">{a.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function KpiCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border p-5 flex items-center gap-4 transition-shadow hover:shadow-md ${highlight ? 'border-red-100' : 'border-gray-100'
        }`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div>
        <p className="text-sm text-gray-400 mb-0.5">{label}</p>
        <p className={`text-xl font-semibold ${highlight ? 'text-red-500' : 'text-gray-800'}`}>{value}</p>
      </div>
    </div>
  )
}

function BoxIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  )
}

function MoneyIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function DocIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )
}
