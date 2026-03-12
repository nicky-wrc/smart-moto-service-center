import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { ConfirmModal } from '../../components/ConfirmModal'
import { formatMotorcycleName } from '../../utils/motorcycle'

const STATUS_LABEL: Record<string, string> = {
  READY: 'รอเริ่ม', IN_PROGRESS: 'กำลังซ่อม', WAITING_PARTS: 'รออะไหล่',
  QC_PENDING: 'รอตรวจ', CLEANING: 'คืนของ', READY_FOR_DELIVERY: 'พร้อมส่งมอบ',
  COMPLETED: 'เสร็จแล้ว', PAID: 'ชำระแล้ว', CANCELLED: 'ยกเลิก',
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  READY:                { bg: 'bg-stone-100',    text: 'text-stone-500', dot: 'bg-stone-300' },
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

  // Completion photos (ส่งให้หัวหน้าช่างตรวจ)
  const [completionPhotos, setCompletionPhotos] = useState<{ file: File; url: string }[]>([])

  // Pre-delivery cleaning checklist
  const [cleaningChecked, setCleaningChecked]   = useState(false)
  const [exteriorChecked, setExteriorChecked]   = useState(false)
  const [deliveryPhotos, setDeliveryPhotos]     = useState<{ file: File; url: string }[]>([])

  // Confirm modal
  const [confirmAction, setConfirmAction] = useState<null | 'startJob' | 'submitInspect' | 'notifyForeman'>(null)

  // Parts return tracking (key: "q-<id>" for quotation item, "r-<id>" for requisition item)
  const [showActualQty, setShowActualQty] = useState(false)
  const [partsActual, setPartsActual] = useState<Record<string, number>>({})

  useEffect(() => {
    api.get<any>(`/jobs/${id}`)
      .then(data => {
        setJob(data)
        if (data.mechanicNotes) {
          setFindingNote(data.mechanicNotes)
          setNotifiedForeman(true)
        }
        setLoading(false)
      })
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

  const sc = statusConfig[job.status] || statusConfig.READY
  const isWorking = job.status === 'IN_PROGRESS'
  const isCleaning = job.status === 'CLEANING'
  const customerName = `${job.motorcycle?.owner?.firstName || ''} ${job.motorcycle?.owner?.lastName || ''}`.trim()


  const handleStartJob = async () => {
    setActionLoading(true)
    try {
      const updated = await api.patch<any>(`/jobs/${id}/start`)
      setJob(updated); setConfirmAction(null)
    } catch (e) { console.error(e) }
    setActionLoading(false)
  }

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const r = new FileReader()
      r.onload = () => resolve(r.result as string)
      r.onerror = reject
      r.readAsDataURL(file)
    })

  const handleCompleteJob = async () => {
    setActionLoading(true)
    try {
      const photos = completionPhotos.length > 0
        ? await Promise.all(completionPhotos.map((p) => fileToBase64(p.file)))
        : undefined
      const updated = await api.patch<any>(`/jobs/${id}/complete`, {
        mechanicNotes: findingNote || undefined,
        photos,
      })
      setJob(updated); setConfirmAction(null)
      setCompletionPhotos([])
    } catch (e) { console.error(e) }
    setActionLoading(false)
  }

  const handleDeliveryPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setDeliveryPhotos((p) => [...p, ...files.map((f) => ({ file: f, url: URL.createObjectURL(f) }))])
    e.target.value = ''
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
          onConfirm={async () => {
            try {
              await api.patch(`/jobs/${id}`, { mechanicNotes: findingNote })
              setNotifiedForeman(true)
              setConfirmAction(null)
            } catch (err) {
              console.error('Failed to notify foreman:', err)
              alert('แจ้งหัวหน้าช่างไม่สำเร็จ')
              setConfirmAction(null)
            }
          }}
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
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">ลูกค้า</p>
                  <p className="font-semibold text-sm text-[#1E1E1E]">{customerName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{job.motorcycle?.owner?.phoneNumber}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">รถ</p>
                  <p className="font-semibold text-sm text-[#1E1E1E]">{formatMotorcycleName(job.motorcycle?.brand, job.motorcycle?.model)}</p>
                  <p className="text-sm text-gray-500 mt-0.5">ทะเบียน {job.motorcycle?.licensePlate}</p>
                </div>
              </div>

              {/* Symptom */}
              <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">อาการที่แจ้ง</p>
                <p className="text-sm text-gray-700 leading-relaxed">{job.symptom}</p>
                {job.tags?.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mt-2.5">
                    {job.tags.map((tag: string) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[#F8981D]/10 text-[#F8981D]">{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Foreman diagnosis notes */}
              {job.diagnosisNotes && (
                <div className="bg-[#44403C]/5 border border-[#44403C]/15 rounded-xl px-4 py-3">
                  <p className="text-xs text-[#44403C]/70 uppercase tracking-wide mb-1.5">หมายเหตุจากหัวหน้าช่าง</p>
                  <p className="text-sm text-[#44403C] whitespace-pre-wrap">{job.diagnosisNotes}</p>
                </div>
              )}

              {/* Mechanic notes (previously submitted) */}
              {!isWorking && job.mechanicNotes && (
                <div className="bg-[#F8981D]/5 border border-[#F8981D]/20 rounded-xl px-4 py-3">
                  <p className="text-xs text-[#F8981D]/70 uppercase tracking-wide mb-1.5">รายงานจากช่าง</p>
                  <p className="text-sm text-[#44403C] whitespace-pre-wrap">{job.mechanicNotes}</p>
                </div>
              )}

              {/* Finding report (working state only) */}
              {isWorking && (
                <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm flex flex-col gap-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">รายงานปัญหาที่พบเพิ่ม</p>

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
                      <button
                        onClick={() => { if (findingNote.trim()) setConfirmAction('notifyForeman') }}
                        disabled={!findingNote.trim()}
                        className="w-full bg-[#44403C] hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-xl transition-colors border-none cursor-pointer"
                      >
                        แจ้งหัวหน้าช่าง
                      </button>
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

              {/* Parts requisitioned — shown for CLEANING status. ใช้เฉพาะ Part Requisitions (ISSUED) ถ้ามี; ถ้าไม่มีใช้ Quotation เป็น fallback เพื่อเลี่ยงซ้ำ */}
              {(() => {
                const reqItems = (job.partRequisitions ?? [])
                  .filter((r: any) => r.status === 'ISSUED')
                  .flatMap((r: any) => (r.items ?? []).filter((i: any) => i.partId).map((i: any) => ({ ...i, _key: `r-${i.id}`, _type: 'requisition' as const, name: i.part?.name ?? '-', qty: i.issuedQuantity ?? i.quantity })));
                const quotItems = (job.quotation?.items ?? []).map((i: any) => ({ ...i, _key: `q-${i.id}`, _type: 'quotation' as const, name: i.itemName || i.part?.name, qty: i.quantity }));
                const allParts = reqItems.length > 0 ? reqItems : quotItems;
                return job.status === 'CLEANING' && allParts.length > 0 ? (
                  <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-gray-400 uppercase tracking-wide">อะไหล่ที่เบิกมา</p>
                      <button
                        onClick={() => setShowActualQty(!showActualQty)}
                        className="text-xs text-[#F8981D] font-medium bg-transparent border-none cursor-pointer hover:underline"
                      >
                        กรอกจำนวนที่ใช้จริง
                      </button>
                    </div>
                    <div className="flex flex-col gap-2">
                      {allParts.map((item: any) => {
                        const actualQty = partsActual[item._key] ?? item.qty
                        return (
                          <div key={item._key} className="flex items-center justify-between bg-stone-50 rounded-xl px-3 py-2.5">
                            <p className="text-sm font-medium text-[#1E1E1E]">{item.name}</p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setPartsActual(p => ({ ...p, [item._key]: Math.max(0, (p[item._key] ?? item.qty) - 1) }))}
                                className="w-7 h-7 rounded-lg bg-white border border-[#F8981D] text-[#F8981D] flex items-center justify-center cursor-pointer hover:bg-[#F8981D]/10 transition-colors text-sm font-bold"
                              >−</button>
                              <span className="text-sm font-semibold text-[#1E1E1E] w-6 text-center">{actualQty}</span>
                              <button
                                onClick={() => setPartsActual(p => ({ ...p, [item._key]: Math.min(item.qty * 2, (p[item._key] ?? item.qty) + 1) }))}
                                className="w-7 h-7 rounded-lg bg-white border border-[#F8981D] text-[#F8981D] flex items-center justify-center cursor-pointer hover:bg-[#F8981D]/10 transition-colors text-sm font-bold"
                              >+</button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          setActionLoading(true);
                          const payload = allParts.map((item: any) =>
                            item._type === 'quotation'
                              ? { quotationItemId: item.id, actualQuantity: partsActual[item._key] ?? item.qty }
                              : { requisitionItemId: item.id, actualQuantity: partsActual[item._key] ?? item.qty }
                          );
                          const updated = await api.patch(`/jobs/${id}/return-parts`, { partsActual: payload });
                          setJob(updated);
                          alert('คืนอะไหล่ส่วนที่ไม่ได้ใช้เรียบร้อย สต็อกถูกอัปเดตแล้ว');
                        } catch (e: any) {
                          console.error(e);
                          alert(e.response?.data?.message || 'การคืนอะไหล่ล้มเหลว');
                        } finally {
                          setActionLoading(false);
                        }
                      }}
                      disabled={actionLoading}
                      className="w-full mt-3 bg-[#F8981D] hover:bg-orange-500 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors border-none cursor-pointer disabled:opacity-50"
                    >
                      {actionLoading ? 'กำลังดำเนินการ...' : 'ยืนยันคืนอะไหล่ส่วนที่เหลือ'}
                    </button>
                  </div>
                ) : null;
              })()}

              {/* Removed customer parts */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <p className="text-sm text-gray-400 uppercase tracking-wide mb-3">อะไหล่เก่าที่ถอดออก</p>

                {removedParts.length > 0 && (
                  <div className="flex flex-col gap-2 mb-3">
                    {removedParts.map(rp => (
                      <div key={rp.id} className="flex items-center justify-between bg-stone-50 rounded-xl px-3 py-2.5">
                        <p className="text-sm font-medium text-[#1E1E1E]">{rp.name}</p>
                        {(isWorking || isCleaning) && (
                          <button onClick={() => setRemovedParts(p => p.filter(x => x.id !== rp.id))}
                            className="text-gray-300 hover:text-red-400 bg-transparent border-none cursor-pointer text-xs transition-colors">✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {(isWorking || isCleaning) && (
                  <div className="flex items-center gap-2">
                    <input
                      value={newRemoved.name}
                      onChange={(e) => setNewRemoved(p => ({ ...p, name: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === 'Enter' && newRemoved.name.trim()) { addRemovedPart(); } }}
                      placeholder="เพิ่มอะไหล่เก่าที่ถอดออก..."
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#44403C] transition-colors"
                    />
                    <button
                      onClick={() => { if (newRemoved.name.trim()) addRemovedPart() }}
                      disabled={!newRemoved.name.trim()}
                      className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:border-[#44403C] flex items-center justify-center cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                )}

                {!isWorking && !isCleaning && removedParts.length === 0 && (
                  <p className="text-sm text-gray-400">ไม่มีรายการ</p>
                )}
              </div>

              {/* Delivery preparation checklist — shown for CLEANING status */}
              {isCleaning && (
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-3">เตรียมส่งมอบรถ</p>
                  <div className="flex flex-col gap-2.5">
                    <label className="flex items-start gap-3 bg-stone-50 rounded-xl px-3 py-3 cursor-pointer hover:bg-stone-100 transition-colors">
                      <input type="checkbox" checked={cleaningChecked} onChange={(e) => setCleaningChecked(e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-[#F8981D] shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-[#1E1E1E]">ล้างรถและทำความสะอาด</p>
                        <p className="text-xs text-gray-400 mt-0.5">ล้างสะอาดทั้งคันก่อนส่งมอบ</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 bg-stone-50 rounded-xl px-3 py-3 cursor-pointer hover:bg-stone-100 transition-colors">
                      <input type="checkbox" checked={exteriorChecked} onChange={(e) => setExteriorChecked(e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-[#F8981D] shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-[#1E1E1E]">ตรวจเช็คความเรียบร้อยภายนอก</p>
                        <p className="text-xs text-gray-400 mt-0.5">ตรวจสอบสภาพรถโดยรวมก่อนคืนลูกค้า</p>
                      </div>
                    </label>
                    <div className="bg-stone-50 rounded-xl px-3 py-3">
                      <div className="flex items-start gap-3">
                        <input type="checkbox" checked={deliveryPhotos.length > 0} readOnly
                          className="mt-0.5 w-4 h-4 accent-[#F8981D] shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#1E1E1E]">ถ่ายรูปก่อนส่งมอบ</p>
                          <p className="text-xs text-gray-400 mt-0.5">บันทึกสภาพรถหลังซ่อมเสร็จ</p>
                          <label className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#F8981D] cursor-pointer hover:underline">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            เลือกรูปภาพ
                            <input type="file" accept="image/*" multiple onChange={handleDeliveryPhotos} className="hidden" />
                          </label>
                          {deliveryPhotos.length > 0 && (
                            <div className="flex gap-1.5 flex-wrap mt-2">
                              {deliveryPhotos.map((p, i) => (
                                <img key={i} src={p.url} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Completion photos — shown when IN_PROGRESS, before ซ่อมเสร็จ */}
              {job.status === 'IN_PROGRESS' && (
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-3">รูปภาพส่งให้หัวหน้าช่างตรวจ</p>
                  <p className="text-xs text-gray-500 mb-2">ถ่ายรูปงานที่ซ่อมเสร็จ เพื่อให้หัวหน้าช่างดูก่อนตรวจ</p>
                  <div className="flex flex-wrap gap-2">
                    {completionPhotos.map((p, i) => (
                      <div key={i} className="relative group">
                        <img src={p.url} alt="" className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
                        <button
                          type="button"
                          onClick={() => setCompletionPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center border border-white shadow cursor-pointer hover:bg-red-600"
                        >×</button>
                      </div>
                    ))}
                    <label className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-[#F8981D] hover:bg-[#F8981D]/5 transition-colors">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files ?? [])
                          setCompletionPhotos((prev) => [
                            ...prev,
                            ...files.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
                          ])
                          e.target.value = ''
                        }}
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col gap-2.5">
                <p className="text-sm text-gray-400 uppercase tracking-wide">การดำเนินงาน</p>

                {(job.status === 'READY' || job.status === 'PENDING') && (
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

                {isCleaning && (
                  <button
                    onClick={async () => {
                      if (!cleaningChecked || !exteriorChecked) {
                        alert('กรุณาทำเครื่องหมายรายการเตรียมส่งมอบให้ครบ')
                        return
                      }
                      try {
                        setActionLoading(true)
                        const photos = deliveryPhotos.length > 0
                          ? await Promise.all(deliveryPhotos.map((p) => fileToBase64(p.file)))
                          : undefined
                        const updated = await api.patch(`/jobs/${id}/ready-delivery`, {
                          photos,
                        })
                        setJob((prev: any) => ({ ...(prev || {}), ...(updated as any) }))
                        setDeliveryPhotos([])
                        alert('เตรียมส่งมอบเรียบร้อย')
                      } catch (err) { console.error(err); alert('อัพเดทสถานะไม่สำเร็จ') }
                      setActionLoading(false)
                    }}
                    disabled={actionLoading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-3 rounded-xl transition-colors border-none cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? 'กำลังดำเนินการ...' : 'คืนของ + ส่งมอบรถเรียบร้อย'}
                  </button>
                )}

                {['COMPLETED', 'PAID'].includes(job.status) && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-center">
                    <p className="text-sm font-medium text-[#44403C]">งานเสร็จสมบูรณ์</p>
                    {job.completedAt && <p className="text-xs text-gray-600 mt-0.5">เสร็จเมื่อ {formatDate(job.completedAt)}</p>}
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
                      <p className="text-xs font-medium text-gray-600">รับงานเข้า</p>
                      <p className="text-xs text-gray-400">{formatDate(job.createdAt)}</p>
                    </div>
                  </div>
                  {job.startedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#F8981D] shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-gray-600">เริ่มซ่อม</p>
                        <p className="text-xs text-gray-400">{formatDate(job.startedAt)}</p>
                      </div>
                    </div>
                  )}
                  {notifiedForeman && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-stone-400 shrink-0" />
                      <div><p className="text-xs font-medium text-gray-600">แจ้งปัญหาเพิ่มหัวหน้าช่าง</p></div>
                    </div>
                  )}
                  {job.completedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-gray-600">เสร็จแล้ว</p>
                        <p className="text-xs text-gray-400">{formatDate(job.completedAt)}</p>
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
