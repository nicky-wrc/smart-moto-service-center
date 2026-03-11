import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { ConfirmModal } from '../../components/ConfirmModal'

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'รอเริ่ม', IN_PROGRESS: 'กำลังซ่อม', WAITING_PARTS: 'รออะไหล่',
  QC_PENDING: 'รอตรวจ', CLEANING: 'ล้างรถ', READY_FOR_DELIVERY: 'พร้อมส่งมอบ',
  COMPLETED: 'เสร็จแล้ว', PAID: 'ชำระแล้ว', CANCELLED: 'ยกเลิก',
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  PENDING:              { bg: 'bg-stone-100',    text: 'text-stone-500', dot: 'bg-stone-300' },
  IN_PROGRESS:          { bg: 'bg-[#F8981D]/15', text: 'text-[#F8981D]', dot: 'bg-[#F8981D]' },
  WAITING_PARTS:        { bg: 'bg-stone-100',    text: 'text-stone-500', dot: 'bg-stone-300' },
  QC_PENDING:           { bg: 'bg-[#44403C]/10', text: 'text-[#44403C]', dot: 'bg-[#44403C]' },
  CLEANING:             { bg: 'bg-green-100',    text: 'text-green-700', dot: 'bg-green-400' },
  READY_FOR_DELIVERY:   { bg: 'bg-green-100',    text: 'text-green-700', dot: 'bg-green-400' },
  COMPLETED:            { bg: 'bg-green-100',    text: 'text-green-700', dot: 'bg-green-400' },
  PAID:                 { bg: 'bg-green-100',    text: 'text-green-700', dot: 'bg-green-400' },
}

type Disposition = 'คืนลูกค้า' | 'ทิ้ง' | 'เก็บหลักฐาน'
type RemovedPart = { id: number; name: string; description: string; disposition: Disposition }

const dispositionConfig: Record<Disposition, { bg: string; text: string }> = {
  'คืนลูกค้า':    { bg: 'bg-[#F8981D]/10', text: 'text-[#F8981D]' },
  'ทิ้ง':         { bg: 'bg-stone-100',     text: 'text-stone-500' },
  'เก็บหลักฐาน': { bg: 'bg-[#44403C]/10', text: 'text-[#44403C]' },
}

function formatDate(d?: string) {
  if (!d) return ''
  const dt = new Date(d)
  return dt.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
         ' ' + dt.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'
}

export default function MechanicJobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Issue report fields
  const [findingNote, setFindingNote] = useState('')
  const [notifiedForeman, setNotifiedForeman] = useState(false)

  // Old parts
  const [removedParts, setRemovedParts] = useState<RemovedPart[]>([])
  const [newRemoved, setNewRemoved] = useState<{ name: string; description: string; disposition: Disposition }>
    ({ name: '', description: '', disposition: 'คืนลูกค้า' })
  const [addingRemoved, setAddingRemoved] = useState(false)

  // Confirm modal
  const [confirmAction, setConfirmAction] = useState<null | 'startJob' | 'submitInspect' | 'notifyForeman'>(null)

  useEffect(() => {
    api.get<any>(`/jobs/${id}`)
      .then(data => { setJob(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-[#F8981D] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!job) return <div className="p-6 text-sm text-gray-400">ไม่พบใบงาน</div>

  const sc = statusConfig[job.status] || statusConfig.PENDING
  const isWorking = job.status === 'IN_PROGRESS'
  const customerName = `${job.motorcycle?.owner?.firstName || ''} ${job.motorcycle?.owner?.lastName || ''}`.trim()

  // Action handlers
  const handleStartJob = async () => {
    setActionLoading(true)
    try {
      const updated = await api.patch<any>(`/jobs/${id}/start`)
      setJob(updated); setConfirmAction(null)
    } catch (e) { console.error(e) }
    setActionLoading(false)
  }

  const handleCompleteJob = async () => {
    setActionLoading(true)
    try {
      const updated = await api.patch<any>(`/jobs/${id}/complete`, { diagnosisNotes: findingNote || undefined })
      setJob(updated); setConfirmAction(null)
    } catch (e) { console.error(e) }
    setActionLoading(false)
  }

  const addRemovedPart = () => {
    if (!newRemoved.name.trim()) return
    setRemovedParts(prev => [...prev, { ...newRemoved, id: Date.now() }])
    setNewRemoved({ name: '', description: '', disposition: 'คืนลูกค้า' })
    setAddingRemoved(false)
  }

  return (
    <>
      {/* Confirm Modals */}
      {confirmAction === 'startJob' && (
        <ConfirmModal
          title="ยืนยันเริ่มงาน?"
          description="เริ่มทำการซ่อมงานนี้"
          confirmLabel="เริ่มเลย"
          onCancel={() => setConfirmAction(null)}
          onConfirm={handleStartJob}
        />
      )}
      {confirmAction === 'submitInspect' && (
        <ConfirmModal
          title="ยืนยันส่งงานให้หัวหน้าตรวจ?"
          description="หัวหน้าช่างจะได้รับแจ้งเพื่อตรวจสอบงาน"
          confirmLabel="ส่งตรวจ"
          onCancel={() => setConfirmAction(null)}
          onConfirm={handleCompleteJob}
        />
      )}
      {confirmAction === 'notifyForeman' && (
        <ConfirmModal
          title="ยืนยันแจ้งหัวหน้าช่าง?"
          description="รายงานปัญหาที่พบจะถูกส่งให้หัวหน้าช่างรับทราบ"
          confirmLabel="แจ้งเลย"
          onCancel={() => setConfirmAction(null)}
          onConfirm={() => { setNotifiedForeman(true); setConfirmAction(null) }}
        />
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
          <span className="text-white text-sm font-semibold">{job.jobNo}</span>
          <div className="flex-1" />
          <span className={`text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 ${sc.bg} ${sc.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
            {STATUS_LABEL[job.status] || job.status}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 overflow-hidden">
          <div className="h-full grid gap-5" style={{ gridTemplateColumns: '1fr 340px' }}>

            {/* LEFT */}
            <div className="flex flex-col gap-3 overflow-y-auto pr-1">

              {/* Customer + Vehicle */}
              <div className="grid grid-cols-2 gap-3 shrink-0">
                <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
<<<<<<< HEAD
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">ลูกค้า</p>
                  <p className="font-semibold text-sm text-[#1E1E1E]">{customerName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{job.motorcycle?.owner?.phoneNumber}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">รถ</p>
                  <p className="font-semibold text-sm text-[#1E1E1E]">{job.motorcycle?.brand} {job.motorcycle?.model}</p>
                  <p className="text-sm text-gray-500 mt-0.5">ทะเบียน {job.motorcycle?.licensePlate}</p>
=======
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-1.5">ลูกค้า</p>
                  <p className="font-semibold text-sm text-[#1E1E1E]">{baseJob.customerName}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-1.5">รถ</p>
                  <p className="font-semibold text-sm text-[#1E1E1E]">{baseJob.brand} {baseJob.model}</p>
                  <p className="text-sm text-gray-500 mt-0.5">ทะเบียน {baseJob.licensePlate}</p>
>>>>>>> origin/Krit_front
                </div>
              </div>

              {/* Symptom */}
              <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
<<<<<<< HEAD
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">อาการที่แจ้ง</p>
                <p className="text-sm text-gray-700 leading-relaxed">{job.symptom}</p>
                {job.tags?.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mt-2.5">
                    {job.tags.map((tag: string) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[#F8981D]/10 text-[#F8981D]">{tag}</span>
=======
                <p className="text-sm text-gray-400 uppercase tracking-wide mb-1.5">อาการที่แจ้ง</p>
                <p className="text-sm text-gray-700 leading-relaxed">{baseJob.symptom}</p>
                {baseJob.tags.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mt-2.5">
                    {baseJob.tags.map((tag) => (
                      <span key={tag} className="text-sm px-2 py-0.5 rounded-full bg-[#F8981D]/10 text-[#F8981D]">{tag}</span>
>>>>>>> origin/Krit_front
                    ))}
                  </div>
                )}
              </div>

              {/* Diagnosis notes */}
              {job.diagnosisNotes && (
                <div className="bg-[#44403C]/5 border border-[#44403C]/15 rounded-xl px-4 py-3">
<<<<<<< HEAD
                  <p className="text-xs text-[#44403C]/70 uppercase tracking-wide mb-1.5">หมายเหตุ</p>
                  <p className="text-sm text-[#44403C] whitespace-pre-wrap">{job.diagnosisNotes}</p>
                </div>
              )}

              {/* Finding report (working state only) */}
              {isWorking && (
                <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm flex flex-col gap-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">รายงานปัญหาที่พบเพิ่ม</p>
=======
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
>>>>>>> origin/Krit_front

                  {notifiedForeman ? (
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100 whitespace-pre-wrap">
                      {findingNote || <span className="text-gray-400 italic">ไม่มีบันทึก</span>}
                    </p>
                  ) : (
                    <>
                      <textarea
                        value={findingNote}
                        onChange={(e) => setFindingNote(e.target.value)}
                        placeholder="บันทึกปัญหาที่พบระหว่างซ่อม..."
                        rows={3}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white text-gray-700 resize-none outline-none focus:border-[#F8981D] transition-colors"
                      />
<<<<<<< HEAD
                      <button
                        onClick={() => { if (findingNote.trim()) setConfirmAction('notifyForeman') }}
                        disabled={!findingNote.trim()}
                        className="w-full bg-[#44403C] hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-xl transition-colors border-none cursor-pointer"
                      >
                        แจ้งหัวหน้าช่าง
                      </button>
=======

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
>>>>>>> origin/Krit_front
                    </>
                  )}
                </div>
              )}

              {/* Labor times */}
              {job.laborTimes?.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">รายการค่าแรง</p>
                  <div className="flex flex-col gap-2">
                    {job.laborTimes.map((lt: any) => (
                      <div key={lt.id} className="flex items-center justify-between bg-stone-50 rounded-lg px-3 py-2">
                        <div>
                          <p className="text-sm font-medium text-[#1E1E1E]">{lt.taskDescription || 'ค่าแรง'}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{lt.technician?.name}</p>
                        </div>
                        <span className="text-sm font-semibold text-[#1E1E1E]">{lt.laborCost?.toLocaleString()} ฿</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT */}
            <div className="flex flex-col gap-3 overflow-y-auto">

<<<<<<< HEAD
=======
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

>>>>>>> origin/Krit_front
              {/* Removed customer parts */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <p className="text-sm text-gray-400 uppercase tracking-wide mb-3">อะไหล่เก่าที่ถอดออก</p>

<<<<<<< HEAD
=======
                {!['คืนของ', 'เสร็จแล้ว'].includes(status) && (
                  <p className="text-sm text-gray-400 italic">จะสามารถบันทึกได้หลังหัวหน้าช่างตรวจผ่านแล้ว</p>
                )}

                {/* Items list */}
>>>>>>> origin/Krit_front
                {removedParts.length > 0 && (
                  <div className="flex flex-col gap-2 mb-3">
                    {removedParts.map(rp => (
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
<<<<<<< HEAD
                            {isWorking && (
                              <button onClick={() => setRemovedParts(p => p.filter(x => x.id !== rp.id))}
                                className="text-gray-300 hover:text-red-400 bg-transparent border-none cursor-pointer text-xs transition-colors">✕</button>
=======
                            {status === 'คืนของ' && (
                              <button onClick={() => setRemovedParts((p) => p.filter((x) => x.id !== rp.id))}
                                className="text-gray-300 hover:text-red-400 bg-transparent border-none cursor-pointer text-sm transition-colors">✕</button>
>>>>>>> origin/Krit_front
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {isWorking && (
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
                          onChange={(e) => setNewRemoved(p => ({ ...p, name: e.target.value }))}
                          placeholder="ชื่ออะไหล่ที่ถอดออก..."
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#44403C] transition-colors"
                          autoFocus
                        />
                        <input
                          value={newRemoved.description}
                          onChange={(e) => setNewRemoved(p => ({ ...p, description: e.target.value }))}
                          placeholder="รายละเอียด (ยี่ห้อ รุ่น สภาพ)..."
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#44403C] transition-colors"
                        />
                        <div className="flex gap-1.5">
<<<<<<< HEAD
                          {(['คืนลูกค้า', 'ทิ้ง', 'เก็บหลักฐาน'] as Disposition[]).map(d => (
                            <button key={d} onClick={() => setNewRemoved(p => ({ ...p, disposition: d }))}
                              className={`flex-1 text-xs py-1.5 rounded-lg border cursor-pointer transition-colors font-medium ${
=======
                          {(['คืนลูกค้า', 'ทิ้ง', 'เก็บหลักฐาน'] as Disposition[]).map((d) => (
                            <button key={d} onClick={() => setNewRemoved((p) => ({ ...p, disposition: d }))}
                              className={`flex-1 text-sm py-1.5 rounded-lg border cursor-pointer transition-colors font-medium ${
>>>>>>> origin/Krit_front
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
                          className="flex-1 py-2.5 text-sm text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer transition-colors"
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

                {!isWorking && removedParts.length === 0 && (
                  <p className="text-sm text-gray-400">ไม่มีรายการ</p>
                )}
              </div>

              {/* Action buttons */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col gap-2.5">
                <p className="text-sm text-gray-400 uppercase tracking-wide">การดำเนินงาน</p>

                {job.status === 'PENDING' && (
                  <button onClick={() => setConfirmAction('startJob')} disabled={actionLoading}
                    className="w-full bg-[#F8981D] hover:bg-orange-500 text-white text-sm font-semibold py-3 rounded-xl transition-colors border-none cursor-pointer disabled:opacity-50">
                    {actionLoading ? 'กำลังดำเนินการ...' : 'เริ่มงาน'}
                  </button>
                )}

                {job.status === 'IN_PROGRESS' && (
                  <button onClick={() => setConfirmAction('submitInspect')} disabled={actionLoading}
                    className="w-full bg-[#44403C] hover:bg-black text-white text-sm font-semibold py-3 rounded-xl transition-colors border-none cursor-pointer disabled:opacity-50">
                    {actionLoading ? 'กำลังดำเนินการ...' : 'ซ่อมเสร็จ — ส่งให้หัวหน้าตรวจ'}
                  </button>
                )}

                {job.status === 'QC_PENDING' && (
                  <div className="bg-[#44403C]/5 border border-[#44403C]/15 rounded-xl px-4 py-3.5 text-center">
                    <p className="text-sm font-medium text-[#44403C]">รอหัวหน้าช่างตรวจ</p>
                    <p className="text-sm text-[#44403C]/60 mt-0.5">งานถูกส่งเพื่อตรวจสอบแล้ว</p>
                  </div>
                )}

                {['COMPLETED', 'PAID'].includes(job.status) && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-center">
                    <p className="text-sm font-medium text-[#44403C]">งานเสร็จสมบูรณ์</p>
<<<<<<< HEAD
                    {job.completedAt && <p className="text-xs text-gray-600 mt-0.5">เสร็จเมื่อ {formatDate(job.completedAt)}</p>}
=======
                    {baseJob.completedAt && <p className="text-sm text-gray-600 mt-0.5">เสร็จเมื่อ {baseJob.completedAt}</p>}
>>>>>>> origin/Krit_front
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <p className="text-sm text-gray-400 uppercase tracking-wide mb-3">ไทม์ไลน์</p>
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-stone-300 shrink-0" />
                    <div>
<<<<<<< HEAD
                      <p className="text-xs font-medium text-gray-600">รับงานเข้า</p>
                      <p className="text-xs text-gray-400">{formatDate(job.createdAt)}</p>
=======
                      <p className="text-sm font-medium text-gray-600">ได้รับมอบหมาย</p>
                      <p className="text-sm text-gray-400">{baseJob.assignedAt}</p>
>>>>>>> origin/Krit_front
                    </div>
                  </div>
                  {job.startedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#F8981D] shrink-0" />
                      <div>
<<<<<<< HEAD
                        <p className="text-xs font-medium text-gray-600">เริ่มซ่อม</p>
                        <p className="text-xs text-gray-400">{formatDate(job.startedAt)}</p>
=======
                        <p className="text-sm font-medium text-gray-600">เริ่มซ่อม</p>
                        <p className="text-sm text-gray-400">{baseJob.startedAt}</p>
>>>>>>> origin/Krit_front
                      </div>
                    </div>
                  )}
                  {notifiedForeman && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-stone-400 shrink-0" />
<<<<<<< HEAD
                      <div><p className="text-xs font-medium text-gray-600">แจ้งปัญหาเพิ่มหัวหน้าช่าง</p></div>
=======
                      <div>
                        <p className="text-sm font-medium text-gray-600">แจ้งปัญหาเพิ่มหัวหน้าช่าง</p>
                      </div>
>>>>>>> origin/Krit_front
                    </div>
                  )}
                  {job.completedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                      <div>
<<<<<<< HEAD
                        <p className="text-xs font-medium text-gray-600">เสร็จแล้ว</p>
                        <p className="text-xs text-gray-400">{formatDate(job.completedAt)}</p>
=======
                        <p className="text-sm font-medium text-gray-600">เสร็จแล้ว</p>
                        <p className="text-sm text-gray-400">{baseJob.completedAt}</p>
>>>>>>> origin/Krit_front
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
