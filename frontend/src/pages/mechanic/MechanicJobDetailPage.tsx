import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { mockMechanicJobs } from './mechanicJobs'
import { ConfirmModal } from '../../components/ConfirmModal'

type JobStatus = 'รอเริ่ม' | 'กำลังซ่อม' | 'รอตรวจ' | 'คืนของ' | 'เสร็จแล้ว'
type Disposition = 'คืนลูกค้า' | 'ทิ้ง' | 'เก็บหลักฐาน'

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
  const [editingReport, setEditingReport]       = useState(false)
  const [savedNote, setSavedNote]               = useState('')
  const [savedPhotos, setSavedPhotos]           = useState<string[]>([])


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

  // Confirm modal
  const [confirmAction, setConfirmAction] = useState<null | 'notifyForeman' | 'returnParts' | 'submitInspect' | 'closeJob'>(null)

  if (!baseJob) return <div className="p-6 text-sm text-gray-400">ไม่พบใบงาน</div>

  const sc = statusConfig[status]
  const isWorking = status === 'กำลังซ่อม'
const openLightbox = (srcs: string[], idx: number) => { setLightboxSrc(srcs); setLightboxIdx(idx) }

  const handleFindingPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const urls = Array.from(e.target.files ?? []).map((f) => URL.createObjectURL(f))
    setFindingPhotos((p) => [...p, ...urls])
    e.target.value = ''
  }

  const addRemovedPart = () => {
    if (!newRemoved.name.trim()) return
    setRemovedParts((prev) => [...prev, { ...newRemoved, id: Date.now() }])
    setNewRemoved({ name: '', description: '', disposition: 'คืนลูกค้า' })
    setAddingRemoved(false)
  }

  return (
    <>
      {/* ─── Confirm Modals ─── */}
      {confirmAction === 'notifyForeman' && (
        <ConfirmModal
          title="ยืนยันแจ้งหัวหน้าช่าง?"
          description="รายงานปัญหาที่พบจะถูกส่งให้หัวหน้าช่างรับทราบและดำเนินการต่อ"
          confirmLabel="แจ้งเลย"
          onCancel={() => setConfirmAction(null)}
          onConfirm={() => { setNotifiedForeman(true); setConfirmAction(null) }}
        />
      )}
      {confirmAction === 'returnParts' && (
        <ConfirmModal
          title="ยืนยันคืนอะไหล่ส่วนที่เหลือ?"
          description="หลังยืนยันแล้วจะไม่สามารถแก้ไขจำนวนอะไหล่ได้อีก"
          confirmLabel="ยืนยันคืน"
          onCancel={() => setConfirmAction(null)}
          onConfirm={() => { setPartsReturned(true); setConfirmAction(null) }}
        />
      )}
      {confirmAction === 'submitInspect' && (
        <ConfirmModal
          title="ยืนยันส่งงานให้หัวหน้าตรวจ?"
          description="หัวหน้าช่างจะได้รับแจ้งเพื่อตรวจสอบงาน ไม่สามารถแก้ไขงานได้อีกจนกว่าจะตรวจเสร็จ"
          confirmLabel="ส่งตรวจ"
          onCancel={() => setConfirmAction(null)}
          onConfirm={() => { setStatus('รอตรวจ'); setConfirmAction(null) }}
        />
      )}
      {confirmAction === 'closeJob' && (
        <ConfirmModal
          title="ยืนยันปิดจบงาน?"
          description="งานจะถูกบันทึกเป็นเสร็จสมบูรณ์ และไม่สามารถแก้ไขได้อีก"
          confirmLabel="ปิดงาน"
          onCancel={() => setConfirmAction(null)}
          onConfirm={() => { setStatus('เสร็จแล้ว'); setConfirmAction(null) }}
        />
      )}

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
          <span className={`text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 ${sc.bg} ${sc.text}`}>
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
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-1.5">ลูกค้า</p>
                  <p className="font-semibold text-sm text-[#1E1E1E]">{baseJob.customerName}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-1.5">รถ</p>
                  <p className="font-semibold text-sm text-[#1E1E1E]">{baseJob.brand} {baseJob.model}</p>
                  <p className="text-sm text-gray-500 mt-0.5">ทะเบียน {baseJob.licensePlate}</p>
                </div>
              </div>

              {/* Symptom */}
              <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
                <p className="text-sm text-gray-400 uppercase tracking-wide mb-1.5">อาการที่แจ้ง</p>
                <p className="text-sm text-gray-700 leading-relaxed">{baseJob.symptom}</p>
                {baseJob.tags.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mt-2.5">
                    {baseJob.tags.map((tag) => (
                      <span key={tag} className="text-sm px-2 py-0.5 rounded-full bg-[#F8981D]/10 text-[#F8981D]">{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Foreman note */}
              {baseJob.foremanNote && (
                <div className="bg-[#44403C]/5 border border-[#44403C]/15 rounded-xl px-4 py-3">
                  <p className="text-sm text-[#44403C]/70 uppercase tracking-wide mb-1.5">หมายเหตุจากหัวหน้าช่าง</p>
                  <p className="text-sm text-[#44403C]">{baseJob.foremanNote}</p>
                </div>
              )}

              {/* QC rejection note */}
              {baseJob.qcRejectNote && (
                <div className="bg-[#F8981D]/5 border border-[#F8981D]/30 rounded-xl px-4 py-3 flex items-start gap-3">
                  <svg className="w-4 h-4 text-[#F8981D] mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-[#F8981D] uppercase tracking-wide mb-1">หัวหน้าช่างตีกลับ — ต้องแก้ไข</p>
                    <p className="text-sm text-[#F8981D]/80 leading-relaxed">{baseJob.qcRejectNote}</p>
                  </div>
                </div>
              )}

              {/* Original photos */}
              {baseJob.photos.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-2">รูปภาพจากการรับรถ</p>
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
              {isWorking && (
                <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400 uppercase tracking-wide">รายงานปัญหาที่พบเพิ่ม</p>
                    {notifiedForeman && !editingReport && (
                      <button
                        onClick={() => { setSavedNote(findingNote); setSavedPhotos(findingPhotos); setEditingReport(true) }}
                        className="text-sm text-gray-400 hover:text-[#F8981D] bg-transparent border border-gray-200 hover:border-[#F8981D] rounded-lg px-2.5 py-1 cursor-pointer transition-colors"
                      >
                        แก้ไข
                      </button>
                    )}
                  </div>

                  {/* Locked view */}
                  {notifiedForeman && !editingReport ? (
                    <>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
                        {findingNote || <span className="text-gray-400 italic">ไม่มีบันทึก</span>}
                      </p>
                      {findingPhotos.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {findingPhotos.map((p, i) => (
                            <button key={i} onClick={() => openLightbox(findingPhotos, i)}
                              className="w-20 h-20 rounded-xl overflow-hidden border border-[#F8981D]/40 hover:border-[#F8981D] transition-colors p-0 cursor-pointer shrink-0">
                              <img src={p} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    /* Editable form */
                    <>
                      <textarea
                        value={findingNote}
                        onChange={(e) => setFindingNote(e.target.value)}
                        placeholder="บันทึกปัญหาหรือสิ่งที่พบระหว่างซ่อม..."
                        rows={3}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white text-gray-700 resize-none outline-none focus:border-[#F8981D] transition-colors leading-relaxed"
                        autoFocus={editingReport}
                      />

                      <div>
                        <p className="text-sm text-gray-400 mb-2">รูปภาพประกอบ</p>
                        <div className="flex gap-2 flex-wrap">
                          {findingPhotos.map((p, i) => (
                            <div key={i} className="relative group shrink-0">
                              <button onClick={() => openLightbox(findingPhotos, i)}
                                className="w-20 h-20 rounded-xl overflow-hidden border border-[#F8981D]/40 hover:border-[#F8981D] transition-colors p-0 cursor-pointer block">
                                <img src={p} alt="" className="w-full h-full object-cover" />
                              </button>
                              <button onClick={() => setFindingPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-sm flex items-center justify-center border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                ✕
                              </button>
                            </div>
                          ))}
                          <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#F8981D] flex items-center justify-center cursor-pointer transition-colors shrink-0 group">
                            <svg className="w-5 h-5 text-gray-300 group-hover:text-[#F8981D] transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            <input type="file" accept="image/*" multiple className="hidden" onChange={handleFindingPhotos} />
                          </label>
                        </div>
                      </div>

                      {editingReport ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setFindingNote(savedNote); setFindingPhotos(savedPhotos); setEditingReport(false) }}
                            className="flex-1 py-2.5 text-sm text-gray-400 hover:text-gray-600 border border-gray-200 hover:border-gray-400 rounded-xl bg-transparent cursor-pointer transition-colors"
                          >
                            ยกเลิก
                          </button>
                          <button
                            onClick={() => { if (findingNote.trim()) setEditingReport(false) }}
                            disabled={!findingNote.trim()}
                            className="flex-1 py-2.5 text-sm font-medium bg-[#44403C] hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl border-none cursor-pointer transition-colors"
                          >
                            บันทึก
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { if (findingNote.trim()) setConfirmAction('notifyForeman') }}
                          disabled={!findingNote.trim()}
                          className="w-full bg-[#44403C] hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-xl transition-colors border-none cursor-pointer"
                        >
                          แจ้งหัวหน้าช่าง
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}

            </div>

            {/* ── RIGHT ── */}
            <div className="flex flex-col gap-3 overflow-y-auto">

              {/* Parts used */}
              <div className={`rounded-xl border p-4 shadow-sm ${status === 'คืนของ' && !partsReturned ? 'bg-white border-[#F8981D]/40' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-400 uppercase tracking-wide">อะไหล่ที่เบิกมา</p>
                  {status === 'คืนของ' && !partsReturned && (
                    <span className="text-sm font-medium text-[#F8981D]">กรอกจำนวนที่ใช้จริง</span>
                  )}
                </div>
                {!['คืนของ', 'เสร็จแล้ว'].includes(status) && (
                  <p className="text-sm text-gray-400 italic">จะสามารถบันทึกได้หลังหัวหน้าช่างตรวจผ่านแล้ว</p>
                )}
                {baseJob.parts.length === 0 ? (
                  <p className="text-sm text-gray-400">ไม่มีอะไหล่</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {baseJob.parts.map((p, i) => {
                      const actual = actualQtys[i] ?? p.qty
                      const unused = p.qty - actual
                      const isActive = status === 'คืนของ' && !partsReturned
                      return (
                        <div key={i} className={`rounded-xl px-3 py-2.5 transition-all ${
                          !['คืนของ', 'เสร็จแล้ว'].includes(status)
                            ? 'bg-stone-50 opacity-40'
                            : isActive
                              ? 'bg-[#F8981D]/5 border border-[#F8981D]/20'
                              : 'bg-stone-50'
                        }`}>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-[#1E1E1E]">{p.name}</p>
                            {isActive ? (
                              <div className="flex items-center border border-[#F8981D]/40 rounded-lg overflow-hidden h-7 shrink-0 bg-white">
                                <button onClick={() => setActualQtys((prev) => ({ ...prev, [i]: Math.max(0, actual - 1) }))}
                                  className="w-7 h-7 flex items-center justify-center text-[#F8981D] hover:bg-[#F8981D]/10 bg-transparent border-none cursor-pointer font-bold text-sm transition-colors">−</button>
                                <span className="text-sm font-semibold w-7 text-center text-[#1E1E1E]">{actual}</span>
                                <button onClick={() => setActualQtys((prev) => ({ ...prev, [i]: Math.min(p.qty, actual + 1) }))}
                                  className="w-7 h-7 flex items-center justify-center text-[#F8981D] hover:bg-[#F8981D]/10 bg-transparent border-none cursor-pointer font-bold text-sm transition-colors">+</button>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">{actual} {p.unit}</span>
                            )}
                          </div>
                          {isActive && unused > 0 && (
                            <p className="text-sm text-[#F8981D] font-medium mt-1">คืน {unused} {p.unit}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
                {status === 'คืนของ' && !partsReturned && baseJob.parts.length > 0 && (
                  <button
                    onClick={() => setConfirmAction('returnParts')}
                    className="w-full mt-3 bg-[#F8981D] hover:bg-orange-500 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors border-none cursor-pointer"
                  >
                    ยืนยันคืนอะไหล่ส่วนที่เหลือ
                  </button>
                )}
                {partsReturned && (
                  <div className="mt-3 flex items-center justify-end gap-2 text-sm text-[#44403C]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    คืนอะไหล่แล้ว
                  </div>
                )}
              </div>

              {/* Removed customer parts */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <p className="text-sm text-gray-400 uppercase tracking-wide mb-3">อะไหล่เก่าที่ถอดออก</p>

                {!['คืนของ', 'เสร็จแล้ว'].includes(status) && (
                  <p className="text-sm text-gray-400 italic">จะสามารถบันทึกได้หลังหัวหน้าช่างตรวจผ่านแล้ว</p>
                )}

                {/* Items list */}
                {removedParts.length > 0 && (
                  <div className="flex flex-col gap-2 mb-3">
                    {removedParts.map((rp) => (
                      <div key={rp.id} className="bg-stone-50 rounded-xl px-3 py-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#1E1E1E]">{rp.name}</p>
                            {rp.description && <p className="text-sm text-gray-400 mt-0.5">{rp.description}</p>}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${dispositionConfig[rp.disposition].bg} ${dispositionConfig[rp.disposition].text}`}>
                              {rp.disposition}
                            </span>
                            {status === 'คืนของ' && (
                              <button onClick={() => setRemovedParts((p) => p.filter((x) => x.id !== rp.id))}
                                className="text-gray-300 hover:text-red-400 bg-transparent border-none cursor-pointer text-sm transition-colors">✕</button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add form — dashed button style like foreman */}
                {status === 'คืนของ' && (
                  !addingRemoved ? (
                    <button
                      onClick={() => setAddingRemoved(true)}
                      className="w-full flex items-center justify-between border-2 border-dashed border-gray-200 hover:border-[#44403C] rounded-xl px-4 py-3 bg-transparent cursor-pointer transition-colors group"
                    >
                      <span className="text-sm text-gray-400 group-hover:text-[#44403C] transition-colors">
                        {removedParts.length > 0 ? `${removedParts.length} รายการ — เพิ่มอีก` : 'เพิ่มอะไหล่เก่าที่ถอดออก...'}
                      </span>
                      <svg className="w-4 h-4 text-gray-300 group-hover:text-[#44403C] transition-colors shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  ) : (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="p-3 flex flex-col gap-2">
                        <input
                          value={newRemoved.name}
                          onChange={(e) => setNewRemoved((p) => ({ ...p, name: e.target.value }))}
                          placeholder="ชื่ออะไหล่ที่ถอดออก..."
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#44403C] transition-colors"
                          autoFocus
                        />
                        <input
                          value={newRemoved.description}
                          onChange={(e) => setNewRemoved((p) => ({ ...p, description: e.target.value }))}
                          placeholder="รายละเอียด (ยี่ห้อ รุ่น สภาพ)..."
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#44403C] transition-colors"
                        />
                        <div className="flex gap-1.5">
                          {(['คืนลูกค้า', 'ทิ้ง', 'เก็บหลักฐาน'] as Disposition[]).map((d) => (
                            <button key={d} onClick={() => setNewRemoved((p) => ({ ...p, disposition: d }))}
                              className={`flex-1 text-sm py-1.5 rounded-lg border cursor-pointer transition-colors font-medium ${
                                newRemoved.disposition === d
                                  ? 'bg-[#44403C] text-white border-[#44403C]'
                                  : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'
                              }`}>
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex border-t border-gray-100">
                        <button
                          onClick={() => { setAddingRemoved(false); setNewRemoved({ name: '', description: '', disposition: 'คืนลูกค้า' }) }}
                          className="flex-1 py-2.5 text-sm text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer transition-colors border-r border-gray-100"
                        >
                          ยกเลิก
                        </button>
                        <button
                          onClick={addRemovedPart}
                          disabled={!newRemoved.name.trim()}
                          className="flex-1 py-2.5 text-sm font-medium text-[#44403C] hover:bg-[#44403C] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed bg-transparent border-none cursor-pointer transition-colors"
                        >
                          บันทึก
                        </button>
                      </div>
                    </div>
                  )
                )}

                {/* Read-only when done — placeholder */}
                {status === 'เสร็จแล้ว' && removedParts.length === 0 && (
                  <p className="text-sm text-gray-400">ไม่มีรายการ</p>
                )}

              </div>

              {/* Action */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col gap-2.5">
                <p className="text-sm text-gray-400 uppercase tracking-wide">การดำเนินงาน</p>

                {status === 'รอเริ่ม' && (
                  <button onClick={() => setStatus('กำลังซ่อม')}
                    className="w-full bg-[#F8981D] hover:bg-orange-500 text-white text-sm font-semibold py-3 rounded-xl transition-colors border-none cursor-pointer">
                    เริ่มงาน
                  </button>
                )}

                {status === 'กำลังซ่อม' && (
                  <button onClick={() => setConfirmAction('submitInspect')}
                    className="w-full bg-[#44403C] hover:bg-black text-white text-sm font-semibold py-3 rounded-xl transition-colors border-none cursor-pointer">
                    ซ่อมเสร็จ — ส่งให้หัวหน้าตรวจ
                  </button>
                )}

                {status === 'รอตรวจ' && (
                  <div className="bg-[#44403C]/5 border border-[#44403C]/15 rounded-xl px-4 py-3.5 text-center">
                    <p className="text-sm font-medium text-[#44403C]">รอหัวหน้าช่างตรวจ</p>
                    <p className="text-sm text-[#44403C]/60 mt-0.5">งานถูกส่งเพื่อตรวจสอบแล้ว</p>
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
                      onClick={() => { if (partsReturned) setConfirmAction('closeJob') }}
                      disabled={!partsReturned}
                      className="w-full bg-[#F8981D] hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-3 rounded-xl transition-colors border-none cursor-pointer"
                    >
                      {partsReturned ? 'เสร็จสิ้น — ปิดงาน' : 'ยืนยันคืนอะไหล่ก่อนปิดงาน'}
                    </button>
                  </>
                )}

                {status === 'เสร็จแล้ว' && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-center">
                    <p className="text-sm font-medium text-[#44403C]">งานเสร็จสมบูรณ์</p>
                    {baseJob.completedAt && <p className="text-sm text-gray-600 mt-0.5">เสร็จเมื่อ {baseJob.completedAt}</p>}
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <p className="text-sm text-gray-400 uppercase tracking-wide mb-3">ไทม์ไลน์</p>
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#F8981D] shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">ได้รับมอบหมาย</p>
                      <p className="text-sm text-gray-400">{baseJob.assignedAt}</p>
                    </div>
                  </div>
                  {baseJob.startedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#44403C] shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">เริ่มซ่อม</p>
                        <p className="text-sm text-gray-400">{baseJob.startedAt}</p>
                      </div>
                    </div>
                  )}
                  {notifiedForeman && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-stone-400 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">แจ้งปัญหาเพิ่มหัวหน้าช่าง</p>
                      </div>
                    </div>
                  )}
                  {baseJob.completedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">เสร็จแล้ว</p>
                        <p className="text-sm text-gray-400">{baseJob.completedAt}</p>
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
