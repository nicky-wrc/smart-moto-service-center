import type { JobOrder } from '../pages/foreman/jobs'
import type { SelectedPart } from '../pages/foreman/types'

type Props = {
  variant: 'general' | 'deep' | 'additional'
  job: JobOrder
  onClose: () => void
  // For 'general' and 'deep' variants
  foremanNote?: string
  estimatedDays?: string | number
  estimatedUnit?: string
  // For 'general' variant only
  selectedParts?: SelectedPart[]
  // For 'additional' variant only
  addlSelectedParts?: SelectedPart[]
}

export function QuotationA4Document({ variant, job, onClose, foremanNote, estimatedDays, estimatedUnit, selectedParts, addlSelectedParts }: Props) {
  const SHOP_ADDRESS = '123 อาคารวิทยวิภาส ถนนมิตรภาพ ตำบลในเมือง อำเภอเมืองขอนแก่น จังหวัดขอนแก่น 40002'
  const today = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })

  if (variant === 'general') {
    const parts = selectedParts ?? []
    const hasBackorder = parts.some((sp) => sp.part.stock < sp.qty)
    const grandTotal = parts.reduce((s, sp) => s + sp.qty * sp.part.unitPrice, 0)
    const days = estimatedDays ?? 1
    const unit = estimatedUnit ?? 'วัน'

    return (
      <div className="fixed inset-0 bg-black/80 z-60 flex flex-col items-center justify-start overflow-y-auto py-8 px-4" onClick={onClose}>
        <button onClick={onClose} className="fixed top-5 right-6 text-white text-2xl bg-transparent border-none cursor-pointer opacity-60 hover:opacity-100 transition-opacity z-10">✕</button>
        <div className="bg-white shadow-2xl" style={{ width: '210mm', minHeight: '297mm', padding: '20mm 18mm' }} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-[#F8981D]">
            <div>
              <p className="text-2xl font-black text-[#F8981D] tracking-tight">RevUp</p>
              <p className="text-sm font-semibold text-gray-500 tracking-widest uppercase">Service Center</p>
              <div className="mt-3 text-sm text-gray-400 leading-5">
                <p>{SHOP_ADDRESS}</p>
                <p>โทร 02-111-2233 · smartmoto@example.com</p>
                <p>เลขประจำตัวผู้เสียภาษี 0-1234-56789-01-2</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-[#1E1E1E]">ใบประเมินราคา</p>
              <p className="text-sm text-gray-400 mt-1">เลขที่ QT-{String(job.id).padStart(5, '0')}-{new Date().getFullYear()}</p>
              <p className="text-sm text-gray-400 mt-0.5">วันที่ {today}</p>
              <p className="text-sm text-gray-400 mt-0.5">อ้างอิงใบงาน #{job.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">ข้อมูลลูกค้า</p>
              <p className="text-sm font-bold text-[#1E1E1E]">{job.customerName}</p>
              <p className="text-sm text-gray-500 mt-0.5">{job.customerPhone}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">ข้อมูลรถ</p>
              <p className="text-sm font-bold text-[#1E1E1E]">{job.brand} {job.model}</p>
              <p className="text-sm text-gray-500 mt-0.5">ทะเบียน {job.licensePlate} · {job.province}</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">ความเสียหาย / อาการที่พบ</p>
            <div className="border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
              {foremanNote && foremanNote.trim() ? (
                <>
                  <p className="text-sm text-[#1E1E1E] leading-relaxed font-medium">{foremanNote}</p>
                  <p className="text-sm text-gray-400 mt-2 pt-2 border-t border-gray-100">อาการที่ลูกค้าแจ้ง: {job.symptom}</p>
                </>
              ) : (
                <p className="text-sm text-[#1E1E1E] leading-relaxed">{job.symptom}</p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">รายละเอียดการซ่อม / อะไหล่ที่ใช้</p>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#1E1E1E] text-white">
                  <th className="text-left px-3 py-2.5 font-semibold text-sm" style={{ width: '28px' }}>#</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-sm">รายการ</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-sm">รหัส</th>
                  <th className="text-center px-3 py-2.5 font-semibold text-sm">จำนวน</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-sm">ราคาต่อหน่วย</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-sm">รวม</th>
                  <th className="text-center px-3 py-2.5 font-semibold text-sm">สต็อก</th>
                </tr>
              </thead>
              <tbody>
                {parts.map((sp, i) => {
                  const enough = sp.part.stock >= sp.qty
                  return (
                    <tr key={sp.part.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2.5 text-gray-400 text-sm">{i + 1}</td>
                      <td className="px-3 py-2.5 font-medium text-[#1E1E1E]">{sp.part.name}</td>
                      <td className="px-3 py-2.5 text-gray-400 text-sm">{sp.part.partNumber}</td>
                      <td className="px-3 py-2.5 text-center text-gray-700">{sp.qty} {sp.part.unit}</td>
                      <td className="px-3 py-2.5 text-right text-gray-700">{sp.part.unitPrice.toLocaleString()} ฿</td>
                      <td className="px-3 py-2.5 text-right font-semibold text-[#1E1E1E]">{(sp.qty * sp.part.unitPrice).toLocaleString()} ฿</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`text-sm font-medium px-2 py-0.5 rounded-full`}>
                          {enough ? 'มีพร้อม' : 'สั่งซื้อ'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {hasBackorder && (
              <p className="text-sm text-amber-600 mt-2">* บางรายการต้องสั่งซื้อก่อน ระยะเวลารวมการรออะไหล่แล้ว</p>
            )}
          </div>

          <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 bg-stone-50 mb-8">
            <div>
              <p className="text-sm text-gray-400">ระยะเวลาซ่อมโดยประมาณ{hasBackorder ? ' (รวมรออะไหล่)' : ''}</p>
              <p className="text-sm font-bold text-[#1E1E1E] mt-0.5">{days} {unit}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">ราคารวมทั้งหมด (ยังไม่รวม VAT)</p>
              <p className="text-xl font-black text-[#F8981D]">{grandTotal.toLocaleString()} ฿</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12">
            <div className="text-center">
              <div className="border-b border-gray-300 mb-2 pb-10" />
              <p className="text-sm text-gray-400">ผู้ประเมิน (หัวหน้าช่าง)</p>
              <p className="text-sm text-gray-400 mt-0.5">วันที่ ......../......../........</p>
            </div>
            <div className="text-center">
              <div className="border-b border-gray-300 mb-2 pb-10" />
              <p className="text-sm text-gray-400">ลูกค้าอนุมัติ</p>
              <p className="text-sm text-gray-400 mt-0.5">วันที่ ......../......../........</p>
            </div>
          </div>
          <p className="text-center text-sm text-gray-300 mt-8">เอกสารนี้สร้างโดยระบบ Smart Moto Service Center</p>
        </div>
      </div>
    )
  }

  if (variant === 'deep') {
    const days = estimatedDays ?? 1
    const unit = estimatedUnit ?? 'วัน'

    return (
      <div className="fixed inset-0 bg-black/80 z-60 flex flex-col items-center justify-start overflow-y-auto py-8 px-4" onClick={onClose}>
        <button onClick={onClose} className="fixed top-5 right-6 text-white text-2xl bg-transparent border-none cursor-pointer opacity-60 hover:opacity-100 transition-opacity z-10">✕</button>
        <div className="bg-white shadow-2xl" style={{ width: '210mm', minHeight: '297mm', padding: '20mm 18mm' }} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-[#F8981D]">
            <div>
              <p className="text-2xl font-black text-[#F8981D] tracking-tight">RevUp</p>
              <p className="text-sm font-semibold text-gray-500 tracking-widest uppercase">Service Center</p>
              <div className="mt-3 text-sm text-gray-400 leading-5">
                <p>{SHOP_ADDRESS}</p>
                <p>โทร 02-111-2233 · smartmoto@example.com</p>
                <p>เลขประจำตัวผู้เสียภาษี 0-1234-56789-01-2</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-[#1E1E1E]">ใบประเมินราคา</p>
              <p className="text-sm text-gray-400 mt-1">เลขที่ QT-{String(job.id).padStart(5, '0')}-{new Date().getFullYear()}</p>
              <p className="text-sm text-gray-400 mt-0.5">วันที่ {today}</p>
              <p className="text-sm text-gray-400 mt-0.5">อ้างอิงใบงาน #{job.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">ข้อมูลลูกค้า</p>
              <p className="text-sm font-bold text-[#1E1E1E]">{job.customerName}</p>
              <p className="text-sm text-gray-500 mt-0.5">{job.customerPhone}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">ข้อมูลรถ</p>
              <p className="text-sm font-bold text-[#1E1E1E]">{job.brand} {job.model}</p>
              <p className="text-sm text-gray-500 mt-0.5">ทะเบียน {job.licensePlate} · {job.province}</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">ความเสียหาย / อาการที่พบ</p>
            <div className="border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
              {foremanNote && foremanNote.trim() ? (
                <>
                  <p className="text-sm text-[#1E1E1E] leading-relaxed font-medium">{foremanNote}</p>
                  <p className="text-sm text-gray-400 mt-2 pt-2 border-t border-gray-100">อาการที่ลูกค้าแจ้ง: {job.symptom}</p>
                </>
              ) : (
                <p className="text-sm text-[#1E1E1E] leading-relaxed">{job.symptom}</p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">รายละเอียดบริการ</p>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#1E1E1E] text-white">
                  <th className="text-left px-3 py-2.5 font-semibold text-sm">#</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-sm">รายการ</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-sm">ราคา</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="px-3 py-3 text-gray-400 text-sm">1</td>
                  <td className="px-3 py-3 text-[#1E1E1E]">
                    <p className="font-medium">ค่าตรวจเชิงลึก (รื้อ/ผ่าเครื่อง)</p>
                    <p className="text-sm text-gray-400 mt-0.5">ตรวจสอบและระบุสาเหตุความเสียหายอย่างละเอียด</p>
                  </td>
                  <td className="px-3 py-3 text-right font-bold text-[#1E1E1E]">1,000 ฿</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 bg-stone-50 mb-8">
            <div>
              <p className="text-sm text-gray-400">ระยะเวลาตรวจโดยประมาณ</p>
              <p className="text-sm text-[#1E1E1E] mt-0.5">{days} {unit}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">ราคารวม (ยังไม่รวม VAT)</p>
              <p className="text-xl font-black text-[#F8981D]">1,000 ฿</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12">
            <div className="text-center">
              <div className="border-b border-gray-300 mb-2 pb-10" />
              <p className="text-sm text-gray-400">ผู้ประเมิน (หัวหน้าช่าง)</p>
              <p className="text-sm text-gray-400 mt-0.5">วันที่ ......../......../........</p>
            </div>
            <div className="text-center">
              <div className="border-b border-gray-300 mb-2 pb-10" />
              <p className="text-sm text-gray-400">ลูกค้าอนุมัติ</p>
              <p className="text-sm text-gray-400 mt-0.5">วันที่ ......../......../........</p>
            </div>
          </div>
          <p className="text-center text-sm text-gray-300 mt-8">เอกสารนี้สร้างโดยระบบ Smart Moto Service Center</p>
        </div>
      </div>
    )
  }

  // variant === 'additional'
  const addlParts = addlSelectedParts ?? []
  const addlTotal = addlParts.reduce((s, sp) => s + sp.qty * sp.part.unitPrice, 0)

  return (
    <div className="fixed inset-0 bg-black/80 z-60 flex flex-col items-center justify-start overflow-y-auto py-8 px-4" onClick={onClose}>
      <button onClick={onClose} className="fixed top-5 right-6 text-white text-2xl bg-transparent border-none cursor-pointer opacity-60 hover:opacity-100 transition-opacity z-10">✕</button>
      <div className="bg-white shadow-2xl" style={{ width: '210mm', minHeight: '297mm', padding: '20mm 18mm' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-[#F8981D]">
          <div>
            <p className="text-2xl font-black text-[#F8981D] tracking-tight">RevUp</p>
            <p className="text-sm font-semibold text-gray-500 tracking-widest uppercase">Service Center</p>
            <div className="mt-3 text-sm text-gray-400 leading-5">
              <p>{SHOP_ADDRESS}</p>
              <p>โทร 02-111-2233 · smartmoto@example.com</p>
              <p>เลขประจำตัวผู้เสียภาษี 0-1234-56789-01-2</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-[#1E1E1E]">ใบเสนอราคาเพิ่มเติม</p>
            <p className="text-sm text-gray-400 mt-1">เลขที่ AQ-{String(job.id).padStart(5, '0')}-{new Date().getFullYear()}</p>
            <p className="text-sm text-gray-400 mt-0.5">วันที่ {today}</p>
            <p className="text-sm text-amber-600 font-medium mt-0.5">อ้างอิงใบงาน #{job.id} (ระหว่างดำเนินการ)</p>
          </div>
        </div>

        {/* Customer + Vehicle */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">ข้อมูลลูกค้า</p>
            <p className="text-sm font-bold text-[#1E1E1E]">{job.customerName}</p>
            <p className="text-sm text-gray-500 mt-0.5">{job.customerPhone}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">ข้อมูลรถ</p>
            <p className="text-sm font-bold text-[#1E1E1E]">{job.brand} {job.model}</p>
            <p className="text-sm text-gray-500 mt-0.5">ทะเบียน {job.licensePlate} · {job.province}</p>
          </div>
        </div>

        {/* Reason — mechanic report */}
        {job.mechanicReport && (
          <div className="mb-6">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">สาเหตุ / ปัญหาที่พบเพิ่มเติม</p>
            <div className="border border-amber-200 rounded-lg px-4 py-3 bg-amber-50">
              <p className="text-sm text-[#1E1E1E] leading-relaxed">{job.mechanicReport.note}</p>
              <p className="text-sm text-amber-600 mt-1.5">รายงานโดยช่าง · {job.mechanicReport.reportedAt}</p>
            </div>
          </div>
        )}

        {/* Parts Table */}
        <div className="mb-6">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">รายการอะไหล่เพิ่มเติม</p>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#1E1E1E] text-white">
                <th className="text-left px-3 py-2.5 font-semibold text-sm" style={{ width: '28px' }}>#</th>
                <th className="text-left px-3 py-2.5 font-semibold text-sm">รายการ</th>
                <th className="text-left px-3 py-2.5 font-semibold text-sm">รหัส</th>
                <th className="text-center px-3 py-2.5 font-semibold text-sm">จำนวน</th>
                <th className="text-right px-3 py-2.5 font-semibold text-sm">ราคาต่อหน่วย</th>
                <th className="text-right px-3 py-2.5 font-semibold text-sm">รวม</th>
              </tr>
            </thead>
            <tbody>
              {addlParts.map((sp, i) => (
                <tr key={sp.part.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 py-2.5 text-gray-400 text-sm">{i + 1}</td>
                  <td className="px-3 py-2.5 font-medium text-[#1E1E1E]">{sp.part.name}</td>
                  <td className="px-3 py-2.5 text-gray-400 text-sm">{sp.part.partNumber}</td>
                  <td className="px-3 py-2.5 text-center text-gray-700">{sp.qty} {sp.part.unit}</td>
                  <td className="px-3 py-2.5 text-right text-gray-700">{sp.part.unitPrice.toLocaleString()} ฿</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-[#1E1E1E]">{(sp.qty * sp.part.unitPrice).toLocaleString()} ฿</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 bg-stone-50 mb-8">
          <span className="text-sm font-bold text-[#1E1E1E]">ราคารวมเพิ่มเติม (ยังไม่รวม VAT)</span>
          <span className="text-xl font-black text-[#F8981D]">{addlTotal.toLocaleString()} ฿</span>
        </div>

        {/* Signature */}
        <div className="grid grid-cols-2 gap-12">
          <div className="text-center">
            <div className="border-b border-gray-300 mb-2 pb-10" />
            <p className="text-sm text-gray-400">ผู้แจ้ง (หัวหน้าช่าง)</p>
            <p className="text-sm text-gray-400 mt-0.5">วันที่ ......../......../........</p>
          </div>
          <div className="text-center">
            <div className="border-b border-gray-300 mb-2 pb-10" />
            <p className="text-sm text-gray-400">ลูกค้าอนุมัติ</p>
            <p className="text-sm text-gray-400 mt-0.5">วันที่ ......../......../........</p>
          </div>
        </div>
        <p className="text-center text-sm text-gray-300 mt-8">เอกสารนี้สร้างโดยระบบ Smart Moto Service Center</p>
      </div>
    </div>
  )
}
