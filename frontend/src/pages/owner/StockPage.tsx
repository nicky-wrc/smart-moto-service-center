import { useState } from 'react'

type Part = {
  id: number
  name: string
  category: string
  qty: number
  unit: string
  cost: number
  price: number
}

const initialParts: Part[] = [
  { id: 1,  name: 'ผ้าเบรกหน้า Honda PCX',     category: 'เบรก',         qty: 12, unit: 'ชุด', cost: 280,  price: 450  },
  { id: 2,  name: 'ผ้าเบรกหลัง Honda PCX',     category: 'เบรก',         qty: 8,  unit: 'ชุด', cost: 250,  price: 400  },
  { id: 3,  name: 'น้ำมันเครื่อง 10W-40 (1L)',  category: 'น้ำมัน',       qty: 45, unit: 'ขวด', cost: 120,  price: 220  },
  { id: 4,  name: 'น้ำมันเครื่อง 20W-50 (1L)',  category: 'น้ำมัน',       qty: 30, unit: 'ขวด', cost: 110,  price: 200  },
  { id: 5,  name: 'สายพาน Yamaha NMAX',         category: 'เครื่องยนต์',  qty: 6,  unit: 'เส้น', cost: 380,  price: 650  },
  { id: 6,  name: 'หัวเทียน NGK CR7E',           category: 'เครื่องยนต์',  qty: 20, unit: 'หัว', cost: 85,   price: 160  },
  { id: 7,  name: 'ไส้กรองอากาศ Honda Wave',    category: 'กรอง',         qty: 15, unit: 'ชิ้น', cost: 95,   price: 180  },
  { id: 8,  name: 'ไส้กรองน้ำมัน',              category: 'กรอง',         qty: 22, unit: 'ชิ้น', cost: 60,   price: 120  },
  { id: 9,  name: 'โซ่ขับเคลื่อน 428H',         category: 'ช่วงล่าง',    qty: 4,  unit: 'เส้น', cost: 420,  price: 750  },
  { id: 10, name: 'สเตอร์หน้า Honda',            category: 'ช่วงล่าง',    qty: 7,  unit: 'ชิ้น', cost: 180,  price: 320  },
  { id: 11, name: 'ยางใน 275-17',                category: 'ยาง',          qty: 10, unit: 'เส้น', cost: 150,  price: 280  },
  { id: 12, name: 'ยางนอก 90/90-17',             category: 'ยาง',          qty: 8,  unit: 'เส้น', cost: 680,  price: 1200 },
  { id: 13, name: 'แบตเตอรี่ 12V 5Ah',          category: 'ไฟฟ้า',        qty: 5,  unit: 'ก้อน', cost: 550,  price: 950  },
  { id: 14, name: 'หลอดไฟหน้า HS1 35W',         category: 'ไฟฟ้า',        qty: 18, unit: 'หลอด', cost: 65,   price: 130  },
  { id: 15, name: 'น้ำมันเบรก DOT3 (500ml)',     category: 'น้ำมัน',       qty: 12, unit: 'ขวด', cost: 95,   price: 180  },
]

const categories = ['ทั้งหมด', 'เบรก', 'น้ำมัน', 'เครื่องยนต์', 'กรอง', 'ช่วงล่าง', 'ยาง', 'ไฟฟ้า']

const LOW_STOCK = 6

export default function StockPage() {
  const [parts, setParts] = useState<Part[]>(initialParts)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('ทั้งหมด')
  const [editId, setEditId] = useState<number | null>(null)
  const [editPrice, setEditPrice] = useState<{ price: number; cost: number }>({ price: 0, cost: 0 })

  const filtered = parts.filter(p => {
    const matchSearch = p.name.includes(search) || p.category.includes(search)
    const matchCat    = category === 'ทั้งหมด' || p.category === category
    return matchSearch && matchCat
  })

  const lowStockCount = parts.filter(p => p.qty <= LOW_STOCK).length
  const totalValue    = parts.reduce((s, p) => s + p.cost * p.qty, 0)

  const openEdit = (p: Part) => {
    setEditId(p.id)
    setEditPrice({ price: p.price, cost: p.cost })
  }

  const saveEdit = () => {
    setParts(prev => prev.map(p => p.id === editId ? { ...p, price: editPrice.price, cost: editPrice.cost } : p))
    setEditId(null)
  }

  const margin = (p: Part) => Math.round(((p.price - p.cost) / p.price) * 100)

  return (
    <div className="h-full overflow-y-auto bg-[#F5F5F5] p-6 flex flex-col gap-5">

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#44403C] rounded-2xl p-4">
          <div className="text-xs text-stone-300">รายการอะไหล่ทั้งหมด</div>
          <div className="text-xl font-bold text-white mt-1">{parts.length} รายการ</div>
        </div>
        <div className={`rounded-2xl p-4 border ${lowStockCount > 0 ? 'bg-red-50 border-red-100' : 'bg-stone-100 border-stone-200'}`}>
          <div className="text-xs text-gray-400">สต๊อกใกล้หมด (≤{LOW_STOCK})</div>
          <div className={`text-xl font-bold mt-1 ${lowStockCount > 0 ? 'text-red-500' : 'text-stone-500'}`}>
            {lowStockCount} รายการ
          </div>
        </div>
        <div className="bg-[#F8981D] rounded-2xl p-4">
          <div className="text-xs text-orange-100">มูลค่าสต๊อกรวม (ราคาทุน)</div>
          <div className="text-xl font-bold text-white mt-1">{totalValue.toLocaleString()} ฿</div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative w-56 shrink-0">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาอะไหล่..."
            className="w-full bg-white border border-stone-200 rounded-full pl-4 pr-10 py-2 text-sm outline-none focus:border-[#F8981D] transition-colors" />
          <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F8981D]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex gap-2 flex-wrap flex-1">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border-none transition-colors ${category === c ? 'bg-[#44403C] text-white' : 'bg-white text-gray-500 hover:bg-stone-100'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-stone-200 overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-stone-100">
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
            {filtered.map(p => (
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
                <td className="px-5 py-4 text-right text-gray-500">{p.cost.toLocaleString()} ฿</td>
                <td className="px-5 py-4 text-right font-medium text-[#1E1E1E]">{p.price.toLocaleString()} ฿</td>
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
                  <label className="text-xs text-gray-500 mb-1 block">ราคาทุน (฿)</label>
                  <input type="number" value={editPrice.cost}
                    onChange={e => setEditPrice(ep => ({ ...ep, cost: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#F8981D]" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">ราคาขาย (฿)</label>
                  <input type="number" value={editPrice.price}
                    onChange={e => setEditPrice(ep => ({ ...ep, price: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#F8981D]" />
                </div>
                {editPrice.price > 0 && (
                  <div className="bg-stone-100 rounded-xl px-4 py-3 text-sm">
                    Margin: <span className="font-bold text-[#44403C]">
                      {Math.round(((editPrice.price - editPrice.cost) / editPrice.price) * 100)}%
                    </span>
                    {' '}({(editPrice.price - editPrice.cost).toLocaleString()} ฿ ต่อชิ้น)
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
    </div>
  )
}
