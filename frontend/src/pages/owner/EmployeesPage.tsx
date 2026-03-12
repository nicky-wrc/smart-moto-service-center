import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import Pagination from '../../components/Pagination'

type Role = 'ผู้ดูแลระบบ' | 'ผู้จัดการ' | 'พนักงานรับรถ' | 'พนักงานคงคลัง' | 'พนักงานบัญชี' | 'หัวหน้าช่าง' | 'ช่าง'
type SalaryType = 'fixed' | 'commission'

type Employee = {
  id: number
  name: string
  role: Role
  salaryType: SalaryType
  baseSalary: number
  commissionPerJob?: number
  jobsDone?: number
  phone: string
  startDate: string
  active: boolean
}

const roleConfig: Record<Role, { color: string; salaryType: SalaryType }> = {
  'ผู้ดูแลระบบ':   { color: 'bg-red-100 text-red-600',            salaryType: 'fixed' },
  'ผู้จัดการ':      { color: 'bg-purple-100 text-purple-600',      salaryType: 'fixed' },
  'พนักงานรับรถ':  { color: 'bg-blue-100 text-blue-600',          salaryType: 'fixed' },
  'พนักงานคงคลัง': { color: 'bg-[#44403C]/10 text-[#44403C]',     salaryType: 'fixed' },
  'พนักงานบัญชี':  { color: 'bg-emerald-100 text-emerald-600',    salaryType: 'fixed' },
  'หัวหน้าช่าง':   { color: 'bg-[#F8981D]/15 text-[#F8981D]',    salaryType: 'commission' },
  'ช่าง':          { color: 'bg-[#F8981D]/8 text-[#F8981D]/80',  salaryType: 'commission' },
}

const ROLE_MAP: Record<string, Role> = {
  ADMIN: 'ผู้ดูแลระบบ',
  MANAGER: 'ผู้จัดการ',
  SERVICE_ADVISOR: 'พนักงานรับรถ',
  STOCK_KEEPER: 'พนักงานคงคลัง',
  CASHIER: 'พนักงานบัญชี',
  FOREMAN: 'หัวหน้าช่าง',
  TECHNICIAN: 'ช่าง',
}

const roles: Role[] = ['ผู้ดูแลระบบ', 'ผู้จัดการ', 'พนักงานรับรถ', 'พนักงานคงคลัง', 'พนักงานบัญชี', 'หัวหน้าช่าง', 'ช่าง']
const emptyForm = { name: '', role: 'ช่าง' as Role, baseSalary: 18000, commissionPerJob: 300, phone: '', startDate: '' }

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [search, setSearch]       = useState('')
  const [filterRole, setFilterRole] = useState<Role | 'ทั้งหมด'>('ทั้งหมด')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm]           = useState(emptyForm)
  const [editSalary, setEditSalary] = useState<{ id: number; base: number; com: number } | null>(null)
  const [page, setPage]     = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const [users, jobs] = await Promise.all([
          api.get<any[]>('/users'),
          api.get<any[]>('/jobs'),
        ])
        const mapped: Employee[] = users.map((u: any) => {
          const role: Role = ROLE_MAP[u.role] ?? 'ช่าง'
          const cfg = roleConfig[role]
          const jobsDone = jobs.filter((j: any) =>
            j.technicianId === u.id && ['COMPLETED', 'PAID'].includes(j.status)
          ).length
          const baseSalary = u.baseSalary ? Number(u.baseSalary) : (cfg.salaryType === 'commission' ? 18000 : 15000)
          const commissionRate = u.commissionRate ? Number(u.commissionRate) : 300
          return {
            id: u.id,
            name: u.name,
            role,
            salaryType: cfg.salaryType,
            baseSalary,
            commissionPerJob: cfg.salaryType === 'commission' ? commissionRate : undefined,
            jobsDone: cfg.salaryType === 'commission' ? jobsDone : undefined,
            phone: u.phone ?? '-',
            startDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString('th-TH') : '-',
            active: true,
          }
        })
        setEmployees(mapped)
      } catch (err) {
        console.error('Failed to load employees:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchEmployees()
  }, [])

  const filtered = employees.filter(e => {
    const matchSearch = e.name.includes(search) || e.role.includes(search)
    const matchRole   = filterRole === 'ทั้งหมด' || e.role === filterRole
    return matchSearch && matchRole
  })

  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / perPage)))
  const visible  = filtered.slice((safePage - 1) * perPage, safePage * perPage)

  const totalSalary = employees
    .filter(e => e.active)
    .reduce((s, e) => s + e.baseSalary + (e.commissionPerJob ?? 0) * (e.jobsDone ?? 0), 0)

  const handleCreate = () => {
    const newEmp: Employee = {
      id: employees.length + 1,
      name: form.name,
      role: form.role,
      salaryType: roleConfig[form.role].salaryType,
      baseSalary: form.baseSalary,
      commissionPerJob: roleConfig[form.role].salaryType === 'commission' ? form.commissionPerJob : undefined,
      jobsDone: roleConfig[form.role].salaryType === 'commission' ? 0 : undefined,
      phone: form.phone,
      startDate: form.startDate || new Date().toLocaleDateString('th-TH'),
      active: true,
    }
    setEmployees(prev => [...prev, newEmp])
    setShowCreate(false)
    setForm(emptyForm)
  }

  const handleSaveSalary = () => {
    if (!editSalary) return
    setEmployees(prev => prev.map(e =>
      e.id === editSalary.id ? { ...e, baseSalary: editSalary.base, commissionPerJob: editSalary.com } : e
    ))
    setEditSalary(null)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#F5F5F5]">
      {/* Summary + toolbar + filter — always visible */}
      <div className="shrink-0 p-5 pb-0 flex flex-col gap-4">

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#44403C] rounded-2xl px-5 py-4 shadow-sm">
          <div className="text-sm text-white/50 font-medium">พนักงานทั้งหมด</div>
          <div className="text-3xl font-black text-white mt-1">{employees.filter(e => e.active).length}</div>
          <div className="text-xs text-white/40 mt-1">คน</div>
        </div>
        <div className="bg-[#F8981D] rounded-2xl px-5 py-4 shadow-sm">
          <div className="text-sm text-white/70 font-medium">ค่าแรง/เดือน</div>
          <div className="text-3xl font-black text-white mt-1">{(totalSalary / 1000).toFixed(0)}K</div>
          <div className="text-xs text-white/50 mt-1">บาท</div>
        </div>
      </div>

      {/* Filter bar + add button */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อพนักงาน..."
            className="w-full bg-white border border-gray-200 rounded-full pl-4 pr-10 py-2.5 text-sm outline-none focus:border-[#F8981D] transition-colors" />
          <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F8981D]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex gap-2 shrink-0 overflow-x-auto">
          {(['ทั้งหมด', ...roles] as const).map(r => (
            <button key={r} onClick={() => setFilterRole(r)}
              className={`px-3 py-2 rounded-full text-xs font-medium cursor-pointer border-none transition-colors whitespace-nowrap ${filterRole === r ? 'bg-[#44403C] text-white' : 'bg-white text-stone-500 hover:bg-stone-100 border border-stone-200'}`}>
              {r}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setShowCreate(true); setForm(emptyForm) }}
          className="flex items-center gap-2 bg-[#F8981D] text-white text-sm px-5 py-2.5 rounded-full cursor-pointer border-none font-medium hover:bg-orange-500 transition-colors shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          เพิ่มพนักงาน
        </button>
      </div>
      </div>{/* end shrink-0 top section */}

      {/* Table — takes remaining space with internal scroll */}
      <div className="flex-1 overflow-hidden px-5 pt-4 pb-0 flex flex-col">
      <div className="flex-1 overflow-auto rounded-2xl border border-gray-100 shadow-sm bg-white">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-stone-50 border-b border-stone-100 z-10">
            <tr>
              <th className="px-5 py-3.5 text-left font-medium text-stone-500">ชื่อ</th>
              <th className="px-5 py-3.5 text-left font-medium text-stone-500">ตำแหน่ง</th>
              <th className="px-5 py-3.5 text-left font-medium text-stone-500">เบอร์โทร</th>
              <th className="px-5 py-3.5 text-right font-medium text-stone-500">เงินเดือน</th>
              <th className="px-5 py-3.5 text-right font-medium text-stone-500">ค่าคอมต่องาน</th>
              <th className="px-5 py-3.5 text-right font-medium text-stone-500">รายได้เดือนนี้</th>
              <th className="px-5 py-3.5 text-center font-medium text-stone-500">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {visible.length === 0 && (
              <tr><td colSpan={7} className="text-center py-10 text-stone-400 text-sm">ไม่มีรายการ</td></tr>
            )}
            {visible.map(emp => {
              const monthly = emp.baseSalary + (emp.commissionPerJob ?? 0) * (emp.jobsDone ?? 0)
              const cfg = roleConfig[emp.role]
              return (
                <tr key={emp.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#44403C] flex items-center justify-center text-sm font-bold text-white shrink-0">
                        {emp.name[0]}
                      </div>
                      <div>
                        <div className="font-medium text-[#1E1E1E]">{emp.name}</div>
                        <div className="text-xs text-stone-400">เริ่ม {emp.startDate}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${cfg.color}`}>{emp.role}</span>
                  </td>
                  <td className="px-5 py-3.5 text-stone-500">{emp.phone}</td>
                  <td className="px-5 py-3.5 text-right text-stone-700">{emp.baseSalary.toLocaleString()} ฿</td>
                  <td className="px-5 py-3.5 text-right">
                    {emp.salaryType === 'commission'
                      ? <span className="text-[#F8981D] font-medium">{(emp.commissionPerJob ?? 0).toLocaleString()} ฿</span>
                      : <span className="text-stone-300">-</span>}
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold text-[#1E1E1E]">{monthly.toLocaleString()} ฿</td>
                  <td className="px-5 py-3.5 text-center">
                    <button
                      onClick={() => setEditSalary({ id: emp.id, base: emp.baseSalary, com: emp.commissionPerJob ?? 0 })}
                      className="text-xs px-3 py-1.5 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 cursor-pointer border-none transition-colors"
                    >
                      ตั้งเงินเดือน
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      </div>{/* end table flex-1 */}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-semibold text-[#1E1E1E] mb-5">เพิ่มพนักงานใหม่</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-stone-500 mb-1 block">ชื่อ-นามสกุล</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#F8981D] transition-colors" placeholder="ชื่อ นามสกุล" />
              </div>
              <div>
                <label className="text-xs text-stone-500 mb-1 block">ตำแหน่ง</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as Role }))}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#F8981D] bg-white cursor-pointer transition-colors">
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-stone-500 mb-1 block">เบอร์โทร</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#F8981D] transition-colors" placeholder="0XX-XXX-XXXX" />
              </div>
              <div>
                <label className="text-xs text-stone-500 mb-1 block">เงินเดือนฐาน (฿)</label>
                <input type="number" value={form.baseSalary} onChange={e => setForm(f => ({ ...f, baseSalary: Number(e.target.value) }))}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#F8981D] transition-colors" />
              </div>
              {roleConfig[form.role].salaryType === 'commission' && (
                <div>
                  <label className="text-xs text-stone-500 mb-1 block">ค่าคอมต่องาน (฿)</label>
                  <input type="number" value={form.commissionPerJob} onChange={e => setForm(f => ({ ...f, commissionPerJob: Number(e.target.value) }))}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#F8981D] transition-colors" />
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreate(false)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-500 cursor-pointer bg-white hover:bg-stone-50 transition-colors">
                ยกเลิก
              </button>
              <button onClick={handleCreate} disabled={!form.name}
                className="flex-1 py-2.5 rounded-xl bg-[#44403C] text-white text-sm font-medium cursor-pointer border-none disabled:opacity-40 hover:bg-black transition-colors">
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Salary Modal */}
      {editSalary && (() => {
        const emp = employees.find(e => e.id === editSalary.id)!
        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <h3 className="text-lg font-semibold text-[#1E1E1E] mb-1">ตั้งเงินเดือน</h3>
              <p className="text-sm text-stone-400 mb-5">{emp.name} · {emp.role}</p>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-stone-500 mb-1 block">เงินเดือนฐาน (฿)</label>
                  <input type="number" value={editSalary.base}
                    onChange={e => setEditSalary(s => s ? { ...s, base: Number(e.target.value) } : s)}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#F8981D] transition-colors" />
                </div>
                {emp.salaryType === 'commission' && (
                  <div>
                    <label className="text-xs text-stone-500 mb-1 block">ค่าคอมต่องาน (฿)</label>
                    <input type="number" value={editSalary.com}
                      onChange={e => setEditSalary(s => s ? { ...s, com: Number(e.target.value) } : s)}
                      className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#F8981D] transition-colors" />
                    <p className="text-xs text-stone-400 mt-1.5">รายได้ประมาณ: {(editSalary.base + editSalary.com * (emp.jobsDone ?? 0)).toLocaleString()} ฿/เดือน</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setEditSalary(null)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-500 cursor-pointer bg-white hover:bg-stone-50 transition-colors">
                  ยกเลิก
                </button>
                <button onClick={handleSaveSalary}
                  className="flex-1 py-2.5 rounded-xl bg-[#44403C] text-white text-sm font-medium cursor-pointer border-none hover:bg-black transition-colors">
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
