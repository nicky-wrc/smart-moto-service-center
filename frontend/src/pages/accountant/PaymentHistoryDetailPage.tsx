import { useParams, useNavigate } from "react-router-dom"
import { FaCarAlt } from "react-icons/fa"
import { FaPhone } from "react-icons/fa6"
import { FaRegFileLines } from "react-icons/fa6"
import { useState, useEffect } from "react"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import { IoDocumentOutline, IoPrint } from "react-icons/io5"
import { FiDownload } from "react-icons/fi"
import { paymentsService, type Payment } from '../../services/payments'
import { formatMotorcycleName } from '../../utils/motorcycle'

const METHOD_LABEL: Record<string, string> = {
  CASH: 'เงินสด',
  CREDIT_CARD: 'บัตรเครดิต',
  DEBIT_CARD: 'บัตรเดบิต',
  TRANSFER: 'โอนเงิน',
  POINTS: 'แต้ม',
}

type JobDisplayData = {
  jobNo: string
  paymentNo: string
  paidAt: string
  paymentMethod: string
  customer: { name: string; vehicle: string; phone: string }
  parts: Array<{ name: string; price: number; qty: number }>
}

function mapPaymentToJobData(p: Payment): JobDisplayData {
  const parts: JobDisplayData['parts'] = []
  if (p.job?.laborTimes) {
    for (const lt of p.job.laborTimes) {
      parts.push({ name: lt.serviceName, price: Number(lt.laborCost), qty: 1 })
    }
  }
  if (p.job?.outsources) {
    for (const os of p.job.outsources) {
      parts.push({ name: os.description, price: Number(os.cost), qty: 1 })
    }
  }
  if (p.job?.partRequisitions) {
    for (const req of p.job.partRequisitions) {
      if ((req.status === 'APPROVED' || req.status === 'ISSUED') && req.items) {
        for (const ri of req.items) {
          const unitPrice = Number(ri.unitPrice || ri.part?.unitPrice || 0)
          parts.push({ name: ri.part?.name || 'อะไหล่', price: unitPrice, qty: ri.quantity })
        }
      }
    }
  }
  if (parts.length === 0) {
    const quotation = (p.job as any)?.quotation
    if (quotation?.items?.length) {
      for (const qi of quotation.items) {
        parts.push({
          name: qi.itemName || qi.part?.name || 'รายการ',
          price: Number(qi.unitPrice || qi.totalPrice / (qi.quantity || 1) || 0),
          qty: qi.quantity || 1,
        })
      }
    }
  }
  if (parts.length === 0 && Number(p.subtotal) > 0) {
    parts.push({ name: 'ค่าบริการ', price: Number(p.subtotal), qty: 1 })
  }
  const owner = (p as any).customer || (p.job?.motorcycle as any)?.owner
  const customerName = owner ? `${owner.firstName || ''} ${owner.lastName || ''}`.trim() : '-'
  const customerPhone = owner?.phoneNumber || owner?.phone || '-'
  return {
    jobNo: p.job?.jobNo ?? p.paymentNo,
    paymentNo: p.paymentNo,
    paidAt: p.paidAt
      ? new Date(p.paidAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
      : p.createdAt
        ? new Date(p.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
        : '-',
    paymentMethod: METHOD_LABEL[p.paymentMethod] ?? p.paymentMethod,
    customer: {
      name: customerName || '-',
      vehicle: p.job?.motorcycle
        ? `${formatMotorcycleName(p.job.motorcycle.brand, p.job.motorcycle.model)} ทะเบียน ${p.job.motorcycle.licensePlate}`
        : '-',
      phone: customerPhone,
    },
    parts,
  }
}

function PaymentHistoryDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [paymentData, setPaymentData] = useState<Payment | null>(null)
  const [jobData, setJobData] = useState<JobDisplayData>({
    jobNo: '',
    paymentNo: '',
    paidAt: '-',
    paymentMethod: '-',
    customer: { name: '-', vehicle: '-', phone: '-' },
    parts: [],
  })
  const [openReceipt, setOpenReceipt] = useState(false)

  useEffect(() => {
    paymentsService.get(Number(id))
      .then(p => {
        setPaymentData(p)
        setJobData(mapPaymentToJobData(p))
      })
      .catch(err => console.error('Failed to load payment:', err))
      .finally(() => setLoading(false))
  }, [id])

  const partsSubtotal = jobData.parts.reduce((sum, item) => sum + item.price * item.qty, 0)
  const subtotal = paymentData ? Number(paymentData.subtotal) || partsSubtotal : partsSubtotal
  const vat = paymentData ? Number(paymentData.vat) || subtotal * 0.07 : subtotal * 0.07
  const total = paymentData ? Number(paymentData.totalAmount) || subtotal + vat : subtotal + vat

  const buildSectionHTML = (label: string) => {
    const year = new Date().getFullYear()
    const rows = jobData.parts.map((p, i) => `
      <tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'}">
        <td style="padding:8px 12px;color:#aaa;font-size:11px">${i + 1}</td>
        <td style="padding:8px 12px;font-weight:500;color:#1E1E1E">${p.name}</td>
        <td style="padding:8px 12px;text-align:right;color:#555">${p.price.toLocaleString()} ฿</td>
        <td style="padding:8px 12px;text-align:center;color:#555">${p.qty}</td>
        <td style="padding:8px 12px;text-align:right;font-weight:600;color:#1E1E1E">${(p.price * p.qty).toLocaleString()} ฿</td>
      </tr>`).join('')
    return `
      <div style="font-family:sans-serif;font-size:13px;color:#1E1E1E">
        <div style="background:#F8981D;color:white;font-size:10px;font-weight:700;padding:5px 14px;border-radius:5px;display:inline-block;margin-bottom:14px;letter-spacing:0.5px">${label}</div>
        <div style="display:flex;align-items:flex-start;justify-content:space-between;padding-bottom:20px;margin-bottom:20px;border-bottom:2px solid #F8981D">
          <div>
            <p style="font-size:20px;font-weight:900;color:#F8981D;letter-spacing:-0.5px;margin:0">Smart Moto</p>
            <p style="font-size:11px;font-weight:600;color:#aaa;letter-spacing:3px;text-transform:uppercase;margin:2px 0 0">Service Center</p>
            <div style="margin-top:10px;font-size:10px;color:#bbb;line-height:1.7">
              <p style="margin:0">123 อาคารวิทยวิภาส ถนนมิตรภาพ ตำบลในเมือง อำเภอเมืองขอนแก่น จังหวัดขอนแก่น 40002</p>
              <p style="margin:0">โทร 02-111-2233 · smartmoto@example.com</p>
              <p style="margin:0">เลขประจำตัวผู้เสียภาษี 0-1234-56789-01-2</p>
            </div>
          </div>
          <div style="text-align:right">
            <p style="font-size:17px;font-weight:bold;margin:0">ใบเสร็จรับเงิน</p>
            <p style="font-size:10px;color:#aaa;margin:5px 0 0">เลขที่ RC-${String(jobData.paymentNo).padStart(5, '0')}-${year}</p>
            <p style="font-size:10px;color:#aaa;margin:2px 0 0">วันที่ ${jobData.paidAt}</p>
            <p style="font-size:10px;color:#aaa;margin:2px 0 0">วิธีชำระ: ${jobData.paymentMethod}</p>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:18px">
          <div>
            <p style="font-size:9px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:3px;margin:0 0 6px">ข้อมูลลูกค้า</p>
            <p style="font-size:13px;font-weight:700;margin:0">${jobData.customer.name}</p>
            <p style="font-size:11px;color:#888;margin:2px 0 0">${jobData.customer.phone}</p>
          </div>
          <div>
            <p style="font-size:9px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:3px;margin:0 0 6px">ข้อมูลรถ</p>
            <p style="font-size:13px;font-weight:700;margin:0">${jobData.customer.vehicle}</p>
          </div>
        </div>
        <p style="font-size:9px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:3px;margin:0 0 8px">รายละเอียดค่าบริการ</p>
        <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:16px">
          <thead>
            <tr style="background:#1E1E1E;color:white">
              <th style="text-align:left;padding:8px 12px;font-size:10px;font-weight:600">#</th>
              <th style="text-align:left;padding:8px 12px;font-size:10px;font-weight:600">รายการ</th>
              <th style="text-align:right;padding:8px 12px;font-size:10px;font-weight:600">ราคา/ชิ้น</th>
              <th style="text-align:center;padding:8px 12px;font-size:10px;font-weight:600">จำนวน</th>
              <th style="text-align:right;padding:8px 12px;font-size:10px;font-weight:600">รวม</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="display:flex;align-items:center;justify-content:space-between;border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px;background:#fafaf9;margin-bottom:28px">
          <div style="font-size:10px;color:#aaa;line-height:1.8">
            <p style="margin:0">ยอดรวม (ก่อน VAT)</p>
            <p style="margin:0">VAT 7%</p>
          </div>
          <div style="text-align:right;font-size:10px;color:#777;line-height:1.8;margin-right:24px">
            <p style="margin:0">${subtotal.toLocaleString()} ฿</p>
            <p style="margin:0">${vat.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿</p>
          </div>
          <div style="text-align:right">
            <p style="font-size:10px;color:#aaa;margin:0">ยอดสุทธิ</p>
            <p style="font-size:19px;font-weight:900;color:#F8981D;margin:2px 0 0">${total.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿</p>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px">
          <div style="text-align:center">
            <div style="border-bottom:1px solid #ddd;margin-bottom:8px;padding-bottom:40px"></div>
            <p style="font-size:10px;color:#aaa;margin:0">ผู้รับเงิน</p>
            <p style="font-size:10px;color:#aaa;margin:2px 0 0">วันที่ ......../......../........</p>
          </div>
          <div style="text-align:center">
            <div style="border-bottom:1px solid #ddd;margin-bottom:8px;padding-bottom:40px"></div>
            <p style="font-size:10px;color:#aaa;margin:0">ลูกค้า</p>
            <p style="font-size:10px;color:#aaa;margin:2px 0 0">วันที่ ......../......../........</p>
          </div>
        </div>
        <p style="text-align:center;font-size:9px;color:#ddd;margin-top:24px">เอกสารนี้สร้างโดยระบบ Smart Moto Service Center</p>
      </div>`
  }

  const captureSection = async (html: string): Promise<HTMLCanvasElement> => {
    const wrapper = document.createElement('div')
    wrapper.style.cssText = 'position:fixed;top:0;left:0;width:794px;background:white;padding:40px;z-index:99999;box-sizing:border-box'
    wrapper.innerHTML = html
    document.body.appendChild(wrapper)
    try {
      return await html2canvas(wrapper, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' })
    } finally {
      document.body.removeChild(wrapper)
    }
  }

  const handlePrint = () => {
    const s1 = buildSectionHTML('สำเนาสำหรับผู้รับชำระ')
    const s2 = buildSectionHTML('สำเนาสำหรับผู้ชำระ')
    const win = window.open('', '_blank', 'width=850,height=1100')
    if (!win) return
    win.document.write(`<html><head><meta charset="utf-8"><title>ใบเสร็จ-${jobData.paymentNo}</title>
      <style>*{box-sizing:border-box}body{margin:0;padding:0}
      .page{padding:40px;width:794px;margin:0 auto}
      @media print{.page{page-break-after:always}}</style>
      </head><body>
      <div class="page">${s1}</div>
      <div class="page">${s2}</div>
      </body></html>`)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 500)
  }

  const handleDownload = async () => {
    const [canvas1, canvas2] = await Promise.all([
      captureSection(buildSectionHTML('สำเนาสำหรับผู้รับชำระ')),
      captureSection(buildSectionHTML('สำเนาสำหรับผู้ชำระ')),
    ])
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfW = pdf.internal.pageSize.getWidth()
    const addPage = (canvas: HTMLCanvasElement) => {
      const imgData = canvas.toDataURL('image/png')
      const pdfH = (canvas.height * pdfW) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH)
    }
    addPage(canvas1)
    pdf.addPage()
    addPage(canvas2)
    pdf.save(`ใบเสร็จ-${jobData.paymentNo}.pdf`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#F8981D] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  if (!paymentData) {
    return (
      <div className="w-full h-full bg-white p-7 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">ไม่พบข้อมูลการชำระเงิน #{id}</p>
        <button
          onClick={() => navigate('/accountant/historys')}
          className="px-6 py-2 bg-[#F8981D] text-white rounded-lg text-sm hover:bg-orange-500 transition-colors"
        >
          กลับหน้าประวัติ
        </button>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-[#F5F5F5] p-5 flex flex-col">
      {/* Back button */}
      <button
        onClick={() => navigate('/accountant/historys')}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-4 w-fit"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        ย้อนกลับ
      </button>

      <div className="grid grid-cols-[1fr_360px] gap-4 flex-1 min-h-0">
        {/* LEFT */}
        <div className="grid grid-rows-[auto_1fr] gap-4 min-h-0">
          {/* Customer card */}
          <div className="bg-white p-5 rounded-2xl shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 bg-[#F8981D] rounded-full flex items-center justify-center shrink-0">
                <p className="text-lg font-bold text-white">{jobData.customer.name.charAt(0)}</p>
              </div>
              <div>
                <p className="font-semibold text-base text-[#1E1E1E]">{jobData.customer.name}</p>
                <div className="flex items-center gap-5 mt-1">
                  <p className="text-sm text-gray-500 flex items-center gap-1.5">
                    <FaCarAlt className="text-gray-400" />
                    {jobData.customer.vehicle}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5">
                    <FaPhone className="text-gray-400" />
                    {jobData.customer.phone}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <FaRegFileLines className="text-gray-400" />
                Job No. <span className="font-medium text-[#1E1E1E]">{jobData.jobNo}</span>
              </div>
              <div className="flex items-center gap-2">
                <IoDocumentOutline className="text-gray-400" />
                Payment <span className="font-medium text-[#1E1E1E]">{jobData.paymentNo}</span>
              </div>
            </div>
          </div>

          {/* Parts table */}
          <div className="bg-white p-5 rounded-2xl shadow-sm flex flex-col min-h-0">
            <h2 className="font-semibold text-base text-[#1E1E1E] mb-4">รายละเอียดค่าบริการ</h2>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F5F5F5]">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 rounded-l-xl">รายการ</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">ราคาต่อชิ้น</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-600">จำนวน</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600 rounded-r-xl">รวม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {jobData.parts.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{item.price.toLocaleString()} ฿</td>
                      <td className="px-4 py-3 text-center text-gray-600">{item.qty}</td>
                      <td className="px-4 py-3 text-right font-medium">{(item.price * item.qty).toLocaleString()} ฿</td>
                    </tr>
                  ))}
                  {jobData.parts.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-400">ไม่มีรายการ</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
              <div className="flex gap-8 text-sm">
                <div className="flex flex-col gap-1 text-right text-gray-500">
                  <span>ยอดรวม</span>
                  <span>VAT (7%)</span>
                  <span className="font-semibold text-[#1E1E1E]">ยอดสุทธิ</span>
                </div>
                <div className="flex flex-col gap-1 text-right">
                  <span className="text-gray-700">{subtotal.toLocaleString()} ฿</span>
                  <span className="text-gray-700">{vat.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿</span>
                  <span className="font-semibold text-[#F8981D]">{total.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT - Payment info */}
        <div className="bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="bg-emerald-50 px-6 py-5 border-b border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-sm font-medium text-emerald-700">ชำระแล้ว</span>
            </div>
            <p className="text-sm text-gray-500 mb-1">ยอดที่ชำระ</p>
            <p className="text-3xl font-bold text-emerald-600">฿ {total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          </div>

          <div className="flex-1 px-6 py-5 flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">วิธีการชำระ</span>
                <span className="font-medium text-[#1E1E1E]">{jobData.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">วันที่ชำระ</span>
                <span className="font-medium text-[#1E1E1E]">{jobData.paidAt}</span>
              </div>
              {paymentData.amountReceived && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">รับเงินมา</span>
                  <span className="font-medium text-[#1E1E1E]">{Number(paymentData.amountReceived).toLocaleString()} ฿</span>
                </div>
              )}
              {paymentData.change && Number(paymentData.change) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">ทอนเงิน</span>
                  <span className="font-medium text-emerald-600">{Number(paymentData.change).toLocaleString()} ฿</span>
                </div>
              )}
              {paymentData.pointsEarned > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">แต้มที่ได้รับ</span>
                  <span className="font-medium text-amber-600">+{paymentData.pointsEarned} แต้ม</span>
                </div>
              )}
              {paymentData.notes && (
                <div className="mt-2 p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400 mb-1">หมายเหตุ</p>
                  <p className="text-sm text-gray-600">{paymentData.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 pb-6 flex flex-col gap-2">
            <button
              onClick={() => setOpenReceipt(true)}
              className="w-full bg-[#F8981D] text-white py-3 rounded-xl font-semibold text-sm cursor-pointer border-none hover:bg-orange-500 transition-colors flex items-center justify-center gap-2"
            >
              <IoDocumentOutline size={16} />
              ดูใบเสร็จ
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {openReceipt && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-130 rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-emerald-100 rounded-full">
                <IoDocumentOutline className="text-emerald-600 w-5 h-5" />
              </div>
              <p className="font-semibold text-base">ใบเสร็จรับเงิน</p>
            </div>

            <div className="border border-gray-100 rounded-xl overflow-auto max-h-80 p-4 mb-5 bg-white">
              <div dangerouslySetInnerHTML={{ __html:
                buildSectionHTML('สำเนาสำหรับผู้รับชำระ') +
                '<div style="border-top:2px dashed #ccc;margin:24px 0"></div>' +
                buildSectionHTML('สำเนาสำหรับผู้ชำระ')
              }} />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="flex-1 bg-[#F8981D] text-white px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer border-none hover:bg-orange-500 transition-colors"
              >
                <IoPrint size={16} /> พิมพ์ใบเสร็จ
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 border border-[#F8981D] text-[#F8981D] px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer bg-white hover:bg-orange-50 transition-colors"
              >
                <FiDownload size={16} /> ดาวน์โหลด
              </button>
              <button
                onClick={() => setOpenReceipt(false)}
                className="px-6 py-2.5 rounded-xl text-sm border border-gray-200 text-gray-500 cursor-pointer bg-white hover:bg-gray-50"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentHistoryDetailPage
