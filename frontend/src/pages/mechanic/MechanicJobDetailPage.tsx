import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { mockMechanicJobs } from './mechanicJobs'

type JobStatus = 'รอเริ่ม' | 'กำลังซ่อม' | 'รอตรวจ' | 'คืนของ' | 'เสร็จแล้ว'
type Disposition = 'คืนลูกค้า' | 'ทิ้ง' | 'เก็บหลักฐาน'

type ExtraItem  = { id: number; name: string; qty: number; unitPrice: number }
type RemovedPart = { id: number; name: string; description: string; disposition: Disposition }

const statusConfig: Record<JobStatus, { bg: string; text: string; dot: string }> = {
  'รอเริ่ม':    { bg: 'bg-stone-100',    text: 'text-stone-500', dot: 'bg-stone-300' },
  'กำลังซ่อม': { bg: 'bg-[#F8981D]/15', text: 'text-[#F8981D]', dot: 'bg-[#F8981D]' },
  'รอตรวจ':    { bg: 'bg-[#44403C]/10', text: 'text-[#44403C]', dot: 'bg-[#44403C]' },
  'คืนของ':    { bg: 'bg-green-100',    text: 'text-green-700', dot: 'bg-green-400' },
  'เสร็จแล้ว': { bg: 'bg-green-100',    text: 'text-green-700', dot: 'bg-green-400' },
}

const dispositionConfig: Record<Disposition, { bg: string; text: string }> = {
  'คืนลูกค้า':    { bg: 'bg-[#F8981D]/10', text: 'text-[#F8981D]' },
  'ทิ้ง':         { bg: 'bg-stone-100',     text: 'text-stone-500' },
  'เก็บหลักฐาน': { bg: 'bg-[#44403C]/10', text: 'text-[#44403C]' },
}

export default function MechanicJobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const baseJob = mockMechanicJobs.find((j) => j.id === Number(id))

  // Core state
  const [status, setStatus]               = useState<JobStatus>(baseJob?.status ?? 'รอเริ่ม')
  const [lightboxSrc, setLightboxSrc]     = useState<string[]>([])
  const [lightboxIdx, setLightboxIdx]     = useState(0)

  // Mechanic finding (issue report)
  const [findingNote, setFindingNote]           = useState('')
  const [findingPhotos, setFindingPhotos]       = useState<string[]>([])
  const [notifiedForeman, setNotifiedForeman]   = useState(false)

  // Additional quotation
  const [showQuotation, setShowQuotation]       = useState(false)
  const [extraItems, setExtraItems]             = useState<ExtraItem[]>([])
  const [newItem, setNewItem]                   = useState({ name: '', qty: 1, unitPrice: 0 })
  const [quotationSent, setQuotationSent]       = useState(false)

  // Parts actual usage
  const [actualQtys, setActualQtys] = useState<Record<number, number>>(
    Object.fromEntries((baseJob?.parts ?? []).map((p, i) => [i, p.qty]))
  )
  const [partsReturned, setPartsReturned]       = useState(false)

  // Removed customer parts
  const [removedParts, setRemovedParts]         = useState<RemovedPart[]>([])
  const [newRemoved, setNewRemoved]             = useState<{ name: string; description: string; disposition: Disposition }>
    ({ name: '', description: '', disposition: 'คืนลูกค้า' })
  const [addingRemoved, setAddingRemoved]       = useState(false)

  if (!baseJob) return <div className="p-6 text-sm text-gray-400">ไม่พบใบงาน</div>

  const sc = statusConfig[status]
  const isWorking = status === 'กำลังซ่อม'
const openLightbox = (srcs: string[], idx: number) => { setLightboxSrc(srcs); setLightboxIdx(idx) }

  const handleFindingPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const urls = Array.from(e.target.files ?? []).map((f) => URL.createObjectURL(f))
    setFindingPhotos((p) => [...p, ...urls])
    e.target.value = ''
  }

  const addExtraItem = () => {
    if (!newItem.name.trim()) return
    setExtraItems((prev) => [...prev, { ...newItem, id: Date.now() }])
    setNewItem({ name: '', qty: 1, unitPrice: 0 })
  }

  const addRemovedPart = () => {
    if (!newRemoved.name.trim()) return
    setRemovedParts((prev) => [...prev, { ...newRemoved, id: Date.now() }])
    setNewRemoved({ name: '', description: '', disposition: 'คืนลูกค้า' })
    setAddingRemoved(false)
  }

  const totalExtra = extraItems.reduce((s, i) => s + i.qty * i.unitPrice, 0)

  return (
    <>
      {/* Lightbox */}
      {lightboxSrc.length > 0 && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center" onClick={() => setLightboxSrc([])}>
          <button onClick={() => setLightboxSrc([])} className="absolute top-5 right-6 text-white text-2xl bg-transparent border-none cursor-pointer opacity-60 hover:opacity-100 transition-opacity">✕</button>
          <img src={lightboxSrc[lightboxIdx]} alt="" className="max-h-[80vh] max-w-[90vw] object-contain rounded-xl" onClick={(e) => e.stopPropagation()} />
          {lightboxSrc.length > 1 && (
            <div className="flex gap-3 mt-5" onClick={(e) => e.stopPropagation()}>
              {lightboxSrc.map((p, i) => (
                <button key={i} onClick={() => setLightboxIdx(i)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 p-0 bg-transparent cursor-pointer transition-all ${i === lightboxIdx ? 'border-white opacity-100' : 'border-transparent opacity-40 hover:opacity-70'}`}>
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="h-full overflow-hidden flex flex-col">

        {/* Header */}
        <div className="bg-[#44403C] px-5 py-3.5 flex items-center gap-4 shrink-0">
          <button onClick={() => navigate('/mechanic/jobs')}
            className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer shrink-0 font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            กลับ
          </button>
          <span className="text-white text-sm font-semibold">คำขอที่ {baseJob.id}</span>
          <div className="flex-1" />
          <span className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 ${sc.bg} ${sc.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
            {status}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 overflow-hidden">
          <div className="h-full grid gap-5" style={{ gridTemplateColumns: '1fr 340px' }}>

            {/* ── LEFT ── */}
            <div className="flex flex-col gap-3 overflow-y-auto pr-1">

              {/* Customer + Vehicle */}
              <div className="grid grid-cols-2 gap-3 shrink-0">
                <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">ลูกค้า</p>
                  <p className="font-semibold text-sm text-[#1E1E1E]">{baseJob.customerName}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">รถ</p>
                  <p className="font-semibold text-sm text-[#1E1E1E]">{baseJob.brand} {baseJob.model}</p>
                  <p className="text-sm text-gray-500 mt-0.5">ทะเบียน {baseJob.licensePlate}</p>
                </div>
              </div>

              {/* Symptom */}
              <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">อาการที่แจ้ง</p>
                <p className="text-sm text-gray-700 leading-relaxed">{baseJob.symptom}</p>
                {baseJob.tags.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mt-2.5">
                    {baseJob.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[#F8981D]/10 text-[#F8981D]">{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Foreman note */}
              {baseJob.foremanNote && (
                <div className="bg-[#44403C]/5 border border-[#44403C]/15 rounded-xl px-4 py-3">
                  <p className="text-xs text-[#44403C]/70 uppercase tracking-wide mb-1.5">หมายเหตุจากหัวหน้าช่าง</p>
                  <p className="text-sm text-[#44403C]">{baseJob.foremanNote}</p>
                </div>
              )}

              {/* Original photos */}
              {baseJob.photos.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">รูปภาพจากการรับรถ</p>
                  <div className="flex gap-2 flex-wrap">
                    {baseJob.photos.map((p, i) => (
                      <button key={i} onClick={() => openLightbox(baseJob.photos, i)}
                        className="w-24 h-24 rounded-xl overflow-hidden border border-gray-200 hover:border-[#F8981D] transition-colors p-0 cursor-pointer group shrink-0">
                        <img src={p} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Finding report (กำลังซ่อม only) ── */}
              {(isWorking || notifiedForeman) && (
                <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm flex flex-col gap-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">รายงานปัญหาที่พบเพิ่ม</p>

                  <textarea
                    value={findingNote}
                    onChange={(e) => setFindingNote(e.target.value)}
                    disabled={notifiedForeman}
                    placeholder="บันทึกปัญหาหรือสิ่งที่พบระหว่างซ่อม..."
                    rows={3}
                    className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700 resize-none outline-none focus:border-[#F8981D] transition-colors leading-relaxed disabled:opacity-60"
                  />

                  {/* Finding photos */}
                  <div>
                    <p className="text-xs text-gray-400 mb-2">รูปภาพประกอบ</p>
                    <div className="flex gap-2 flex-wrap">
                      {findingPhotos.map((p, i) => (
                        <div key={i} className="relative group shrink-0">
                          <button onClick={() => openLightbox(findingPhotos, i)}
                            className="w-24 h-24 rounded-xl overflow-hidden border border-[#F8981D]/40 hover:border-[#F8981D] transition-colors p-0 cursor-pointer block">
                            <img src={p} alt="" className="w-full h-full object-cover" />
                          </button>
                          {!notifiedForeman && (
                            <button onClick={() => setFindingPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                      {!notifiedForeman && (
                        <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#F8981D] flex items-center justify-center cursor-pointer transition-colors shrink-0 group">
                          <svg className="w-5 h-5 text-gray-300 group-hover:text-[#F8981D] transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                          <input type="file" accept="image/*" multiple className="hidden" onChange={handleFindingPhotos} />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Notify foreman */}
                  {!notifiedForeman ? (
                    <button
                      onClick={() => { if (findingNote.trim()) setNotifiedForeman(true) }}
                      disabled={!findingNote.trim()}
                      className="w-full bg-[#44403C] hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-xl transition-colors border-none cursor-pointer"
                    >
                      แจ้งหัวหน้าช่าง
                    </button>
                  ) : (
                    <div className="bg-[#44403C]/5 border border-[#44403C]/15 rounded-xl px-4 py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#44403C]" />
                        <p className="text-sm font-medium text-[#44403C]">แจ้งหัวหน้าช่างแล้ว</p>
                      </div>
                      <button
                        onClick={() => setShowQuotation((v) => !v)}
                        className="text-xs text-[#F8981D] hover:underline bg-transparent border-none cursor-pointer"
                      >
                        {showQuotation ? 'ซ่อนใบเสนอราคา' : '+ สร้างใบเสนอราคาเพิ่ม'}
                      </button>
                    </div>
                  )}

                  {/* Additional quotation */}
                  {showQuotation && notifiedForeman && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100">
                        <p className="text-sm font-medium text-[#1E1E1E]">ใบเสนอราคาเพิ่มเติม</p>
                      </div>
                      <div className="p-4 flex flex-col gap-3">
                        {extraItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between gap-2 text-sm">
                            <span className="text-[#1E1E1E] flex-1">{item.name} × {item.qty}</span>
                            <span className="text-gray-500 shrink-0">{(item.qty * item.unitPrice).toLocaleString()} บาท</span>
                            {!quotationSent && (
                              <button onClick={() => setExtraItems((p) => p.filter((i) => i.id !== item.id))}
                                className="text-gray-300 hover:text-red-400 bg-transparent border-none cursor-pointer text-xs shrink-0">✕</button>
                            )}
                          </div>
                        ))}

                        {!quotationSent && (
                          <div className="flex gap-2 pt-1">
                            <input value={newItem.name} onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
                              placeholder="รายการ..." className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-[#F8981D] transition-colors" />
                            <input type="number" value={newItem.qty} min={1} onChange={(e) => setNewItem((p) => ({ ...p, qty: Number(e.target.value) }))}
                              className="w-12 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-center outline-none focus:border-[#F8981D] transition-colors" />
                            <input type="number" value={newItem.unitPrice} min={0} onChange={(e) => setNewItem((p) => ({ ...p, unitPrice: Number(e.target.value) }))}
                              placeholder="ราคา" className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#F8981D] transition-colors" />
                            <button onClick={addExtraItem} className="px-3 py-1.5 bg-[#44403C] text-white text-xs rounded-lg border-none cursor-pointer hover:bg-black transition-colors shrink-0">+</button>
                          </div>
                        )}

                        {extraItems.length > 0 && (
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <span className="text-sm font-semibold text-[#1E1E1E]">รวม {totalExtra.toLocaleString()} บาท</span>
                            {!quotationSent ? (
                              <button onClick={() => setQuotationSent(true)}
                                className="text-sm bg-[#F8981D] hover:bg-orange-500 text-white px-4 py-1.5 rounded-lg border-none cursor-pointer transition-colors font-medium">
                                ส่งขออนุมัติลูกค้า
                              </button>
                            ) : (
                              <span className="text-xs font-medium text-[#F8981D] bg-[#F8981D]/10 px-2.5 py-1 rounded-full">รอลูกค้าอนุมัติ</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* ── RIGHT ── */}
            <div className="flex flex-col gap-3 overflow-y-auto">

              {/* Parts used */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">อะไหล่ที่เบิกมา</p>
                  {status === 'คืนของ' && !partsReturned && (
                    <span className="text-xs text-gray-400">กรอกจำนวนที่ใช้จริง</span>
                  )}
                </div>
                {status !== 'เสร็จแล้ว' && (
                  <p className="text-xs text-gray-400 italic">จะสามารถบันทึกได้หลังหัวหน้าช่างตรวจผ่านแล้ว</p>
                )}
                {baseJob.parts.length === 0 ? (
                  <p className="text-sm text-gray-400">ไม่มีอะไหล่</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {baseJob.parts.map((p, i) => {
                      const actual = actualQtys[i] ?? p.qty
                      const unused = p.qty - actual
                      return (
                        <div key={i} className={`bg-stone-50 rounded-xl px-3 py-2.5 ${status !== 'เสร็จแล้ว' ? 'opacity-40' : ''}`}>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-[#1E1E1E]">{p.name}</p>
                            {status === 'คืนของ' && !partsReturned ? (
                              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-7 shrink-0">
                                <button onClick={() => setActualQtys((prev) => ({ ...prev, [i]: Math.max(0, actual - 1) }))}
                                  className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 bg-transparent border-none cursor-pointer font-bold text-sm transition-colors">−</button>
                                <span className="text-xs font-semibold w-7 text-center">{actual}</span>
                                <button onClick={() => setActualQtys((prev) => ({ ...prev, [i]: Math.min(p.qty, actual + 1) }))}
                                  className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 bg-transparent border-none cursor-pointer font-bold text-sm transition-colors">+</button>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">{actual} {p.unit}</span>
                            )}
                          </div>
                          {status === 'คืนของ' && unused > 0 && (
                            <p className="text-xs text-[#F8981D] mt-1">คืน {unused} {p.unit}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
                {status === 'คืนของ' && !partsReturned && baseJob.parts.length > 0 && (
                  <button
                    onClick={() => setPartsReturned(true)}
                    className="w-full mt-3 border border-[#44403C] text-[#44403C] hover:bg-[#44403C] hover:text-white text-sm font-medium py-2 rounded-xl transition-colors bg-transparent cursor-pointer"
                  >
                    ยืนยันคืนอะไหล่ส่วนที่เหลือ
                  </button>
                )}
                {partsReturned && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-[#44403C]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    คืนอะไหล่แล้ว
                  </div>
                )}
              </div>

              {/* Removed customer parts */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">อะไหล่เก่าที่ถอดออก</p>
                  {status === 'คืนของ' && !addingRemoved && (
                    <button onClick={() => setAddingRemoved(true)}
                      className="text-xs text-[#F8981D] hover:underline bg-transparent border-none cursor-pointer">
                      + เพิ่ม
                    </button>
                  )}
                </div>

                {status !== 'เสร็จแล้ว' && (
                  <p className="text-xs text-gray-400 italic">จะสามารถบันทึกได้หลังหัวหน้าช่างตรวจผ่านแล้ว</p>
                )}
                {removedParts.length === 0 && !addingRemoved && status === 'คืนของ' && (
                  <p className="text-sm text-gray-400">ยังไม่มีรายการ</p>
                )}

                <div className="flex flex-col gap-2">
                  {removedParts.map((rp) => (
                    <div key={rp.id} className="bg-stone-50 rounded-xl px-3 py-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#1E1E1E]">{rp.name}</p>
                          {rp.description && <p className="text-xs text-gray-400 mt-0.5">{rp.description}</p>}
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${dispositionConfig[rp.disposition].bg} ${dispositionConfig[rp.disposition].text}`}>
                          {rp.disposition}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {addingRemoved && (
                  <div className="mt-2 flex flex-col gap-2 pt-2 border-t border-gray-100">
                    <input value={newRemoved.name} onChange={(e) => setNewRemoved((p) => ({ ...p, name: e.target.value }))}
                      placeholder="ชื่ออะไหล่ที่ถอดออก..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#F8981D] transition-colors" />
                    <input value={newRemoved.description} onChange={(e) => setNewRemoved((p) => ({ ...p, description: e.target.value }))}
                      placeholder="รายละเอียดเพิ่มเติม (ยี่ห้อ รุ่น สภาพ)..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#F8981D] transition-colors" />
                    <div className="flex gap-1.5">
                      {(['คืนลูกค้า', 'ทิ้ง', 'เก็บหลักฐาน'] as Disposition[]).map((d) => (
                        <button key={d} onClick={() => setNewRemoved((p) => ({ ...p, disposition: d }))}
                          className={`flex-1 text-xs py-1.5 rounded-lg border cursor-pointer transition-colors font-medium ${
                            newRemoved.disposition === d
                              ? 'bg-[#44403C] text-white border-[#44403C]'
                              : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'
                          }`}>
                          {d}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setAddingRemoved(false)}
                        className="flex-1 text-sm py-2 rounded-xl border border-gray-200 text-gray-400 hover:border-gray-400 bg-transparent cursor-pointer transition-colors">
                        ยกเลิก
                      </button>
                      <button onClick={addRemovedPart} disabled={!newRemoved.name.trim()}
                        className="flex-1 text-sm py-2 rounded-xl bg-[#44403C] hover:bg-black disabled:opacity-40 text-white border-none cursor-pointer transition-colors font-medium">
                        บันทึก
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col gap-2.5">
                <p className="text-xs text-gray-400 uppercase tracking-wide">การดำเนินงาน</p>

                {status === 'รอเริ่ม' && (
                  <button onClick={() => setStatus('กำลังซ่อม')}
                    className="w-full bg-[#F8981D] hover:bg-orange-500 text-white text-sm font-semibold py-3 rounded-xl transition-colors border-none cursor-pointer">
                    เริ่มงาน
                  </button>
                )}

                {status === 'กำลังซ่อม' && (
                  <button onClick={() => setStatus('รอตรวจ')}
                    className="w-full bg-[#44403C] hover:bg-black text-white text-sm font-semibold py-3 rounded-xl transition-colors border-none cursor-pointer">
                    ซ่อมเสร็จ — ส่งให้หัวหน้าตรวจ
                  </button>
                )}

                {status === 'รอตรวจ' && (
                  <div className="bg-[#44403C]/5 border border-[#44403C]/15 rounded-xl px-4 py-3.5 text-center">
                    <p className="text-sm font-medium text-[#44403C]">รอหัวหน้าช่างตรวจ</p>
                    <p className="text-xs text-[#44403C]/60 mt-0.5">งานถูกส่งเพื่อตรวจสอบแล้ว</p>
                  </div>
                )}

                {status === 'คืนของ' && (
                  <>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#1E1E1E] shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm font-medium text-[#1E1E1E]">หัวหน้าช่างตรวจผ่านแล้ว</p>
                    </div>
                    <button
                      onClick={() => { if (partsReturned) setStatus('เสร็จแล้ว') }}
                      disabled={!partsReturned}
                      className="w-full bg-[#F8981D] hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-3 rounded-xl transition-colors border-none cursor-pointer"
                    >
                      {partsReturned ? 'เสร็จสิ้น — ปิดงาน' : 'ยืนยันคืนอะไหล่ก่อนปิดงาน'}
                    </button>
                  </>
                )}

                {status === 'เสร็จแล้ว' && (
                  <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3.5 text-center">
                    <p className="text-sm font-medium text-green-700">งานเสร็จสมบูรณ์</p>
                    {baseJob.completedAt && <p className="text-xs text-green-600 mt-0.5">เสร็จเมื่อ {baseJob.completedAt}</p>}
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">ไทม์ไลน์</p>
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#F8981D] shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-600">ได้รับมอบหมาย</p>
                      <p className="text-xs text-gray-400">{baseJob.assignedAt}</p>
                    </div>
                  </div>
                  {baseJob.startedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#44403C] shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-gray-600">เริ่มซ่อม</p>
                        <p className="text-xs text-gray-400">{baseJob.startedAt}</p>
                      </div>
                    </div>
                  )}
                  {notifiedForeman && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-stone-400 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-gray-600">แจ้งปัญหาเพิ่มหัวหน้าช่าง</p>
                      </div>
                    </div>
                  )}
                  {quotationSent && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#F8981D] shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-gray-600">ส่งใบเสนอราคาเพิ่ม</p>
                      </div>
                    </div>
                  )}
                  {baseJob.completedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-gray-600">เสร็จแล้ว</p>
                        <p className="text-xs text-gray-400">{baseJob.completedAt}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}
