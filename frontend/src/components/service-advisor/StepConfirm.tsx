import { useState } from 'react'
import { submitToTechLead, confirmCustomer } from '../../services/api'
import type { ICustomer } from '../../types'
import ProgressIndicator from '../common/ProgressIndicator'
import './StepConfirm.css'

interface Props {
  customer: ICustomer
  onConfirm: () => void
  onBack: () => void
}

export default function StepConfirm({ customer, onConfirm, onBack }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [notes, setNotes] = useState('')

  const handleSubmit = async () => {
    if (!customer.id) return

    setIsSubmitting(true)
    try {
      // ยืนยันข้อมูลลูกค้า
      const confirmResult = await confirmCustomer(customer)
      if (!confirmResult.success) {
        throw new Error('ไม่สามารถยืนยันข้อมูล')
      }

      // ส่งข้อมูลให้หัวหน้าช่าง
      const submitResult = await submitToTechLead(customer.id, notes)
      if (submitResult.success) {
        setSubmitStatus('success')
        setTimeout(() => {
          onConfirm()
        }, 2000)
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="step-confirm">
      <div className="confirm-card">
        <div className="step-header">
          <ProgressIndicator currentStep="confirm" />
          <p className="step-title">ยืนยันและส่งข้อมูลให้หัวหน้าช่าง</p>
        </div>

        {submitStatus === 'success' ? (
          <div className="success-message">
            <div className="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3>สำเร็จ!</h3>
            <p>ข้อมูลลูกค้าได้ถูกส่งไปยังหัวหน้าช่างแล้ว</p>
          </div>
        ) : (
          <>
            <div className="customer-preview">
              <h3>ยืนยันข้อมูลลูกค้า</h3>
              <div className="preview-grid">
                <div className="preview-item">
                  <span className="label">ชื่อ</span>
                  <span className="value">{customer.name}</span>
                </div>
                <div className="preview-item">
                  <span className="label">เบอร์โทร</span>
                  <span className="value">{customer.phone}</span>
                </div>
                <div className="preview-item">
                  <span className="label">รุ่นรถ</span>
                  <span className="value">{customer.motorcycleModel}</span>
                </div>
                <div className="preview-item">
                  <span className="label">ป้ายทะเบียน</span>
                  <span className="value">{customer.licensePlate}</span>
                </div>
                <div className="preview-item">
                  <span className="label">สี</span>
                  <span className="value">{customer.color}</span>
                </div>
              </div>
            </div>

            <div className="notes-section">
              <label htmlFor="notes">หมายเหตุเพิ่มเติม (ไม่บังคับ)</label>
              <textarea
                id="notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="เพิ่มหมายเหตุสำหรับหัวหน้าช่าง เช่น ความเสียหาย , สาเหตุการซ่อม , ฯลฯ"
                className="notes-input"
                disabled={isSubmitting}
                rows={4}
              />
            </div>

            {submitStatus === 'error' && (
              <div className="error-alert">เกิดข้อผิดพลาดขณะส่งข้อมูล กรุณาลองอีกครั้ง</div>
            )}

            <div className="confirm-actions">
              <button onClick={onBack} className="btn-back" disabled={isSubmitting}>
                ← Back
              </button>
              <button onClick={handleSubmit} className="btn-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Submit to Supervisor'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
