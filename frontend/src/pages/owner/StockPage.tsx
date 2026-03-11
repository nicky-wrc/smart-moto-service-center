import { useState, useRef, useEffect } from 'react'
import { api } from '../../lib/api'
import Pagination from '../../components/Pagination'

type Part = {
  id: number
  name: string
  category: string
  qty: number
  unit: string
  cost: number
  price: number
}

// Parts fetched from API

const categories = ['ทั้งหมด', 'เบรก', 'น้ำมัน', 'เครื่องยนต์', 'กรอง', 'ช่วงล่าง', 'ยาง', 'ไฟฟ้า']
const unitOptions = ['ชิ้น', 'ชุด', 'ขวด', 'เส้น', 'หัว', 'ก้อน', 'หลอด', 'อัน', 'ถุง', 'กล่อง']

const LOW_STOCK = 6

function UnitDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-left flex items-center justify-between outline-none focus:border-[#F8981D] bg-white transition-colors hover:border-stone-300">
        <span className={value ? 'text-[#1E1E1E]' : 'text-gray-400'}>{value || 'เลือกหน่วย'}</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-10 mt-1.5 w-full bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-3 gap-1 p-2">
            {unitOptions.map(u => (
              <button key={u} type="button"
                onClick={() => { onChange(u); setOpen(false) }}
                className={`px-3 py-2 rounded-lg text-sm font-medium text-center transition-colors cursor-pointer border-none
                  ${value === u ? 'bg-[#F8981D] text-white' : 'bg-stone-50 text-stone-600 hover:bg-stone-100'}`}>
                {u}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function StockPage() {
  const [parts, setParts] = useState<Part[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('ทั้งหมด')
  const [editId, setEditId] = useState<number | null>(null)
  const [editPrice, setEditPrice] = useState<{ price: number; cost: number; unit: string }>({ price: 0, cost: 0, unit: '' })
  const [page, setPage]       = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<any[]>('/parts').then(data => {
      const mapped: Part[] = data.map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category || 'ทั่วไป',
        qty: p.stockQuantity ?? 0,
        unit: p.unit || 'ชิ้น',
        cost: Math.round(Number(p.unitPrice) * 0.6),
        price: Number(p.unitPrice) || 0,
      }))
      setParts(mapped)
    }).catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const filtered = parts.filter(p => {
    const matchSearch = p.name.includes(search) || p.category.includes(search)
    const matchCat    = category === 'ทั้งหมด' || p.category === category
    return matchSearch && matchCat
  })

  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / perPage)))
  const visible  = filtered.slice((safePage - 1) * perPage, safePage * perPage)

  const lowStockCount = parts.filter(p => p.qty <= LOW_STOCK).length
  const totalValue    = parts.reduce((s, p) => s + p.cost * p.qty, 0)

  const openEdit = (p: Part) => {
    setEditId(p.id)
    setEditPrice({ price: p.price, cost: p.cost, unit: p.unit })
  }

  const saveEdit = () => {
    setParts(prev => prev.map(p => p.id === editId ? { ...p, price: editPrice.price, cost: editPrice.cost, unit: editPrice.unit } : p))
    setEditId(null)
  }

  const margin = (p: Part) => Math.round(((p.price - p.cost) / p.price) * 100)

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#F5F5F5]">
      {/* Summary cards + filter — always visible */}
      <div className="shrink-0 p-6 pb-0 flex flex-col gap-5">

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#44403C] rounded-2xl p-5">
          <div className="text-sm text-stone-300">รายการอะไหล่ทั้งหมด</div>
          <div className="text-3xl font-bold text-white mt-1">{parts.length}</div>
          <div className="text-xs text-stone-400 mt-1">รายการ</div>
        </div>
        <div className={`rounded-2xl p-5 bg-white`}>
          <div className="text-sm text-gray-400">สต๊อกใกล้หมด (≤{LOW_STOCK})</div>
          <div className={`text-3xl font-bold mt-1 ${lowStockCount > 0 ? 'text-red-500' : 'text-stone-500'}`}>
            {lowStockCount}
          </div>
          <div className="text-xs text-stone-400 mt-1">รายการ</div>
        </div>
        <div className="bg-[#F8981D] rounded-2xl p-5">
          <div className="text-sm text-orange-100">มูลค่าสต๊อกรวม (ราคาทุน)</div>
          <div className="text-3xl font-bold text-white mt-1">{(totalValue / 1000).toFixed(0)}K</div>
          <div className="text-xs text-orange-200 mt-1">บาท</div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาอะไหล่..."
            className="w-full bg-white border border-stone-200 rounded-full pl-4 pr-10 py-2.5 text-sm outline-none focus:border-[#F8981D] transition-colors" />
          <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F8981D]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex gap-2 flex-wrap shrink-0">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer border-none transition-colors ${category === c ? 'bg-[#44403C] text-white' : 'bg-white text-stone-500 hover:bg-stone-100'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      </div>{/* end shrink-0 */}

      {/* Table — takes remaining space with internal scroll */}
      <div className="flex-1 overflow-hidden px-6 pt-5 flex flex-col">
      <div className="flex-1 overflow-auto rounded-2xl border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-stone-100 z-10">
            <tr>
              <th className="px-5 py-4 text-left font-medium text-gray-600 rounded-l-2xl">ชื่ออะไหล่</th>
              <th className="px-5 py-4 text-left font-medium text-gray-600">หมวด</th>
              <th className="px-5 py-4 text-right font-medium text-gray-600">คงเหลือ</th>
              <th className="px-5 py-4 text-right font-medium text-gray-600">ราคาทุน</th>
              <th className="px-5 py-4 text-right font-medium text-gray-600">ราคาขาย</th>
              <th className="px-5 py-4 text-right font-medium text-gray-600">Margin</th>
              <th className="px-5 py-4 text-center font-medium text-gray-600 rounded-r-2xl">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {visible.length === 0 && (
              <tr><td colSpan={7} className="text-center py-10 text-stone-400 text-sm">ไม่มีรายการ</td></tr>
            )}
            {visible.map(p => (
              <tr key={p.id} className={`hover:bg-stone-50 ${p.qty <= LOW_STOCK ? 'bg-red-50/40' : ''}`}>
                <td className="px-5 py-4">
                  <div className="font-medium text-[#1E1E1E]">{p.name}</div>
                </td>
                <td className="px-5 py-4">
                  <span className="text-xs bg-[#F5F5F5] text-gray-500 px-2 py-0.5 rounded-full">{p.category}</span>
                </td>
                <td className="px-5 py-4 text-right">
                  <span className={`font-medium ${p.qty <= LOW_STOCK ? 'text-red-500' : 'text-gray-700'}`}>
                    {p.qty} {p.unit}
                  </span>
                  {p.qty <= LOW_STOCK && (
                    <span className="ml-1.5 text-xs text-red-400">⚠ ใกล้หมด</span>
                  )}
                </td>
                <td className="px-5 py-4 text-right">
                  <span className="text-gray-700">{p.cost.toLocaleString()} ฿</span>
                  <span className="text-xs text-gray-400 ml-1">/{p.unit}</span>
                </td>
                <td className="px-5 py-4 text-right font-medium">
                  <span className="text-[#1E1E1E]">{p.price.toLocaleString()} ฿</span>
                  <span className="text-xs text-gray-400 ml-1">/{p.unit}</span>
                </td>
                <td className="px-5 py-4 text-right">
                  <span className="text-xs font-medium bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">{margin(p)}%</span>
                </td>
                <td className="px-5 py-4 text-center">
                  <button onClick={() => openEdit(p)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 cursor-pointer border-none transition-colors">
                    ตั้งราคา
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>{/* end table flex-1 */}

      {/* Edit Price Modal */}
      {editId !== null && (() => {
        const p = parts.find(x => x.id === editId)!
        return (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
              <h3 className="text-lg font-semibold text-[#1E1E1E] mb-1">ตั้งราคาอะไหล่</h3>
              <p className="text-sm text-gray-400 mb-5">{p.name}</p>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">หน่วย</label>
                  <UnitDropdown value={editPrice.unit} onChange={u => setEditPrice(ep => ({ ...ep, unit: u }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">ราคาทุน (฿/{editPrice.unit || 'หน่วย'})</label>
                  <input type="number" value={editPrice.cost}
                    onChange={e => setEditPrice(ep => ({ ...ep, cost: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#F8981D]" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">ราคาขาย (฿/{editPrice.unit || 'หน่วย'})</label>
                  <input type="number" value={editPrice.price}
                    onChange={e => setEditPrice(ep => ({ ...ep, price: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#F8981D]" />
                </div>
                {editPrice.price > 0 && (
                  <div className="bg-stone-100 rounded-xl px-4 py-3 text-sm">
                    Margin: <span className="font-bold text-[#44403C]">
                      {Math.round(((editPrice.price - editPrice.cost) / editPrice.price) * 100)}%
                    </span>
                    {' '}({(editPrice.price - editPrice.cost).toLocaleString()} ฿/{editPrice.unit || 'หน่วย'})
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setEditId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 cursor-pointer bg-white hover:bg-gray-50">
                  ยกเลิก
                </button>
                <button onClick={saveEdit}
                  className="flex-1 py-2.5 rounded-xl bg-[#F8981D] text-white text-sm font-medium cursor-pointer border-none">
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      <Pagination
        page={safePage} perPage={perPage} total={filtered.length}
        onPageChange={setPage} onPerPageChange={setPerPage}
      />
    </div>
  )
}
