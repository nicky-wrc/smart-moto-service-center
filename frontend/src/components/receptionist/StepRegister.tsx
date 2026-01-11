import { useState } from 'react'
import { createCustomer } from '../../services/api'
import type { ICustomer } from '../../types'
import ProgressIndicator from './ProgressIndicator'
import './StepRegister.css'

interface Props {
  onCustomerCreated: (customer: ICustomer) => void
  onBack: () => void
}

interface FormData {
  name: string
  phone: string
  motorcycleModel: string
  licenseProvince: string
  licensePlateTop: string
  licensePlateBottom: string
  color: string
}

interface FormErrors {
  [key: string]: string
}

const COLORS = ['ดำ', 'ขาว', 'แดง', 'น้ำเงิน', 'เขียว', 'เหลือง', 'ส้ม', 'เทา', 'อื่น ๆ']

const PROVINCES = [
  'กรุงเทพมหานคร',
  'ปทุมธานี',
  'นนทบุรี',
  'สมุทรปราการ',
  'สมุทรสาคร',
  'อยุธยา',
  'ปราจีนบุรี',
  'ระยอง',
  'ฉะเชิงเทรา',
  'ชลบุรี',
  'สตูล',
  'ภูเก็ต',
  'ตรัง',
  'พัทลุง',
  'สองพี่น้อง',
  'เพชรบุรี',
  'ประจวบคีรีขันธ์',
  'ชุมพร',
  'ระนอง',
  'นครศรีธรรมราช',
  'สุราษฎร์ธานี',
  'พังงา',
  'กระบี่',
  'ลำพูน',
  'แพร่',
  'น่าน',
  'พะเยา',
  'เชียงใหม่',
  'เชียงราย',
  'ลำพูน',
  'ลำชาง',
  'อุตรดิตถ์',
  'ตาก',
  'สุโขทัย',
  'ที่สุโขทัย',
  'พิษณุโลก',
  'เพชรบูรณ์',
  'นครสวรรค์',
  'อุทัยธานี',
  'ลพบุรี',
  'สระบุรี',
  'นครราชสีมา',
  'บุรีรัมย์',
  'สุรินทร์',
  'ศรีสะเกษ',
  'มุกดาหาร',
  'ยโสธร',
  'กาฬสินธุ์',
  'ขอนแก่น',
  'อำนาจเจริญ',
  'ร้อยเอ็ด',
  'มหาสารคาม',
  'เลย',
  'นครพนม',
  'ค่ายคำ',
  'มุกดาหาร',
  'อุบลราชธานี',
  'กุมภวาปี',
  'ชัยภูมิ',
  'หนองคาย',
  'นครพนม',
  'สุrin',
  'ชัยบาดาล',
  'อุดรธานี',
  'เลย',
  'นครสวรรค์',
  'พิจิตร',
  'เพชรบูรณ์',
  'สตูล'
]

export default function StepRegister({ onCustomerCreated, onBack }: Props) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    motorcycleModel: '',
    licenseProvince: '',
    licensePlateTop: '',
    licensePlateBottom: '',
    color: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'กรุณากรอกชื่อลูกค้า'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'กรุณากรอกเบอร์โทร'
    } else {
      const phoneDigits = formData.phone.replace(/\D/g, '')
      if (phoneDigits.length !== 10) {
        newErrors.phone = 'เบอร์โทรต้องมี 10 หลัก'
      }
    }

    if (!formData.motorcycleModel.trim()) {
      newErrors.motorcycleModel = 'กรุณากรอกรุ่นรถ'
    } else if (formData.motorcycleModel.trim().length < 2) {
      newErrors.motorcycleModel = 'รุ่นรถต้องมีอย่างน้อย 2 ตัวอักษร'
    }

    if (!formData.licenseProvince.trim()) {
      newErrors.licenseProvince = 'กรุณาเลือกจังหวัด'
    }

    if (!formData.licensePlateTop.trim() || !formData.licensePlateBottom.trim()) {
      newErrors.licensePlate = 'กรุณากรอกป้ายทะเบียนทั้งสองบรรทัด'
    } else if (formData.licensePlateTop.trim().length < 2 || formData.licensePlateBottom.trim().length < 1) {
      newErrors.licensePlate = 'ป้ายทะเบียนไม่ถูกต้อง'
    }

    if (!formData.color.trim()) {
      newErrors.color = 'กรุณาเลือกสีรถ'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))

    // ลบข้อผิดพลาดเมื่อผู้ใช้แก้ไข
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const fullLicensePlate = `${formData.licenseProvince} ${formData.licensePlateTop} ${formData.licensePlateBottom}`.trim()
      const newCustomer = await createCustomer({
        ...formData,
        licensePlate: fullLicensePlate
      })
      onCustomerCreated(newCustomer)
    } catch (error) {
      console.error('Error creating customer:', error)
      setErrors({ submit: 'ไม่สามารถบันทึกข้อมูลได้' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="step-register">
      <div className="register-card">
        <div className="step-header">
          <ProgressIndicator currentStep="register" />
          <p className="step-title">ลงทะเบียนลูกค้าใหม่</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="name">
              ชื่อลูกค้า <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="เช่น สมชาย ใจดี"
              className={`form-input ${errors.name ? 'error' : ''}`}
              disabled={isSubmitting}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">
              เบอร์โทร <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0812345678"
              className={`form-input ${errors.phone ? 'error' : ''}`}
              disabled={isSubmitting}
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="motorcycleModel">
              รุ่นรถ <span className="required">*</span>
            </label>
            <input
              type="text"
              id="motorcycleModel"
              name="motorcycleModel"
              value={formData.motorcycleModel}
              onChange={handleChange}
              placeholder="เช่น Honda CB150R"
              className={`form-input ${errors.motorcycleModel ? 'error' : ''}`}
              disabled={isSubmitting}
            />
            {errors.motorcycleModel && <span className="error-message">{errors.motorcycleModel}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="color">
              สี <span className="required">*</span>
            </label>
            <select
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className={`form-input ${errors.color ? 'error' : ''}`}
              disabled={isSubmitting}
            >
              <option value="">-- เลือกสี --</option>
              {COLORS.map(color => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
            {errors.color && <span className="error-message">{errors.color}</span>}
          </div>

          <div className="form-group">
            <label>
              ป้ายทะเบียน <span className="required">*</span>
            </label>

            
            {/* จังหวัด Dropdown */}
            <div className="license-province-wrapper">
              <label className="license-input-label">บรรทัดบน</label>
              <input
                type="text"
                name="licenseProvince"
                value={formData.licenseProvince}
                onChange={handleChange}
                placeholder="ค้นหาจังหวัด..."
                list="provinces-list"
                className={`form-input license-province-select ${errors.licenseProvince ? 'error' : ''}`}
                disabled={isSubmitting}
              />
              <datalist id="provinces-list">
                {PROVINCES.map(province => (
                  <option key={province} value={province} />
                ))}
              </datalist>
              {errors.licenseProvince && <span className="error-message">{errors.licenseProvince}</span>}
            </div>

            {/* บรรทัดบนและล่างของป้ายทะเบียน */}
            <div className="license-plate-inputs">
              <div className="license-input-wrapper">
                <label className="license-input-label">บรรทัดบน</label>
                <input
                  type="text"
                  name="licensePlateTop"
                  value={formData.licensePlateTop}
                  onChange={handleChange}
                  placeholder="เช่น กก"
                  className={`form-input ${errors.licensePlate ? 'error' : ''}`}
                  disabled={isSubmitting}
                />
              </div>
              <div className="license-input-wrapper">
                <label className="license-input-label">บรรทัดล่าง</label>
                <input
                  type="text"
                  name="licensePlateBottom"
                  value={formData.licensePlateBottom}
                  onChange={handleChange}
                  placeholder="เช่น 1111"
                  className={`form-input ${errors.licensePlate ? 'error' : ''}`}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* License Plate Preview */}
            <div className="license-plate-preview">
              <label className="preview-label">ตัวอย่าง</label>
              <div className="plate-display">
                <div className="plate-row plate-row-top">
                  <span className="plate-text">{formData.licensePlateTop || 'กก'}</span>
                </div>
                <div className="plate-row plate-row-middle">
                  <span className="plate-text">{formData.licenseProvince || 'จังหวัด'}</span>
                </div>
                <div className="plate-row plate-row-bottom">
                  <span className="plate-text-bottom">{formData.licensePlateBottom || '1111'}</span>
                </div>
              </div>
            </div>
            {errors.licensePlate && <span className="error-message">{errors.licensePlate}</span>}
          </div>

          {errors.submit && <div className="form-error-alert">{errors.submit}</div>}

          <div className="form-actions">
            <button type="button" onClick={onBack} className="btn-back" disabled={isSubmitting}>
              ← Back
            </button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Loading...' : '✓ Next'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
