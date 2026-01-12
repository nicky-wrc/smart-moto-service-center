import { useState } from 'react'
import { createCustomer } from '../services/api'
import type { ICustomer } from '../types'
import ProgressIndicator from '../components/common/ProgressIndicator'
import ReceptionistHeader from '../components/common/ReceptionistHeader'
import ReceptionistFooter from '../components/common/ReceptionistFooter'
import LicensePlateInput from '../components/common/LicensePlateInput'
import MotorcycleModelSelect from '../components/common/MotorcycleModelSelect'
import './RegisterCustomerPage.css'

interface Props {
  onCustomerCreated: (customer: ICustomer) => void
  onBack: () => void
  onOpenHistory?: () => void
  onLogout?: () => void
}

interface FormData {
  firstName: string
  lastName: string
  phone: string
  motorcycleModelId: string
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
  'กำแพงเพชร',
  'ขอนแก่น',
  'จันทบุรี',
  'ฉะเชิงเทรา',
  'ชลบุรี',
  'ชัยนาท',
  'ชัยภูมิ',
  'ชุมพร',
  'เชียงราย',
  'เชียงใหม่',
  'ตรัง',
  'ตราด',
  'ตาก',
  'นครนายก',
  'นครปฐม',
  'นครพนม',
  'นครราชสีมา',
  'นครศรีธรรมราช',
  'นครสวรรค์',
  'นนทบุรี',
  'นพพลัส',
  'นราธิวาส',
  'น่าน',
  'บึงกาฬ',
  'บุรีรัมย์',
  'ปทุมธานี',
  'ปราจีนบุรี',
  'ปัตตานี',
  'พะเยา',
  'พังงา',
  'พิจิตร',
  'พิษณุโลก',
  'เพชรบุรี',
  'เพชรบูรณ์',
  'แพร่',
  'ภูเก็ต',
  'มหาสารคาม',
  'มุกดาหาร',
  'แม่ฮ่องสอน',
  'ยะลา',
  'ยโสธร',
  'ระนอง',
  'ระยอง',
  'ราชบุรี',
  'ลพบุรี',
  'ลำปาง',
  'ลำพูน',
  'เลย',
  'ศรีสะเกษ',
  'สกลนคร',
  'สงขลา',
  'สตูล',
  'สมุทรปราการ',
  'สมุทรสาคร',
  'สระแก้ว',
  'สระบุรี',
  'สระหวาย',
  'สิงห์บุรี',
  'สุโขทัย',
  'สุพรรณบุรี',
  'สุราษฎร์ธานี',
  'สุรินทร์',
  'หนองคาย',
  'หนองบัวลำภู',
  'อ่างทอง',
  'อำนาจเจริญ',
  'อุดรธานี',
  'อุตรดิตถ์',
  'อุทัยธานี',
  'อุบลราชธานี',
  'กำแพงเพชร',
  'กาญจนบุรี',
  'ประจวบคีรีขันธ์',
  'พิจิตร'
]

const MOTORCYCLE_MODELS = [
  { id: '1', name: 'Honda CB150R', year: 2023, color: 'ดำ' },
  { id: '2', name: 'Honda CB150R', year: 2023, color: 'เงิน' },
  { id: '3', name: 'Honda CB150R', year: 2023, color: 'แดง' },
  { id: '4', name: 'Yamaha YZF-R15', year: 2023, color: 'น้ำเงิน' },
  { id: '5', name: 'Yamaha YZF-R15', year: 2023, color: 'ดำ' },
  { id: '6', name: 'Kawasaki Ninja 400', year: 2022, color: 'เขียว' },
  { id: '7', name: 'Kawasaki Ninja 400', year: 2022, color: 'ดำ' },
  { id: '8', name: 'Suzuki GSX-R150', year: 2023, color: 'แดง' },
  { id: '9', name: 'Suzuki GSX-R150', year: 2023, color: 'ดำ' },
  { id: '10', name: 'Bajaj Pulsar NS200', year: 2022, color: 'เหลือง' },
  { id: '11', name: 'Bajaj Pulsar NS200', year: 2022, color: 'ดำ' },
  { id: '12', name: 'KTM 390 Duke', year: 2023, color: 'ส้ม' },
  { id: '13', name: 'KTM 390 Duke', year: 2023, color: 'ดำ' },
]

export default function RegisterCustomerPage({ onCustomerCreated, onBack, onOpenHistory, onLogout }: Props) {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    motorcycleModelId: '',
    licenseProvince: '',
    licensePlateTop: '',
    licensePlateBottom: '',
    color: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'กรุณากรอกชื่อ'
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'กรุณากรอกนามสกุล'
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'กรุณากรอกเบอร์โทร'
    } else {
      const phoneDigits = formData.phone.replace(/\D/g, '')
      if (phoneDigits.length !== 10) {
        newErrors.phone = 'เบอร์โทรต้องมี 10 หลัก'
      }
    }

    if (!formData.motorcycleModelId.trim()) {
      newErrors.motorcycleModelId = 'กรุณาเลือกรุ่นรถ'
    }

    if (!formData.licenseProvince.trim()) {
      newErrors.licenseProvince = 'กรุณาเลือกจังหวัด'
    } else if (!PROVINCES.includes(formData.licenseProvince.trim())) {
      newErrors.licenseProvince = 'กรุณาเลือกจังหวัดจากรายการเท่านั้น'
    }

    if (!formData.licensePlateTop.trim() || !formData.licensePlateBottom.trim()) {
      newErrors.licensePlate = 'กรุณากรอกป้ายทะเบียนทั้งสองบรรทัด'
    } else {
      // Validate license plate top
      const topValue = formData.licensePlateTop.trim()
      const topHasNumbers = /[0-9]/.test(topValue)
      const topHasThaiChars = /[ก-ฮ]/.test(topValue)
      
      if (topHasNumbers && topHasThaiChars) {
        // Has both numbers and Thai - must be exactly 1 digit + 2 Thai characters
        const numberMatch = topValue.match(/^[0-9]+/)
        const thaiChars = topValue.replace(/[^ก-ฮ]/g, '')
        
        if (!numberMatch) {
          newErrors.licensePlate = 'ป้ายทะเบียนบรรทัดบน : ตัวเลขต้องอยู่หน้าสุด'
        } else if (thaiChars.length !== 2) {
          newErrors.licensePlate = 'ป้ายทะเบียนบรรทัดบน : เมื่อมีตัวเลขต้องตามท้ายด้วยตัวอักษร 2 ตัวเท่านั้น'
        }
      } else if (topHasNumbers) {
        // Only numbers - not allowed
        newErrors.licensePlate = 'ป้ายทะเบียนบรรทัดบน : ไม่สามารถกรอกเฉพาะตัวเลขได้'
      } else if (topHasThaiChars) {
        // Only Thai - limit to 3
        if (topValue.length > 3) {
          newErrors.licensePlate = 'ป้ายทะเบียนบรรทัดบน : ป้ายหมวดเก่าต้องประกอบไปด้วยตัวอักษรไทย 3 ตัว'
        }
      }

      // Validate license plate bottom
      const bottomValue = formData.licensePlateBottom.trim()
      if (bottomValue.length < 1 || bottomValue.length > 4) {
        newErrors.licensePlate = 'ป้ายทะเบียนบรรทัดล่าง : กรุณากรอกเลข 1-4 หลัก'
      } else if (/^0+$/.test(bottomValue)) {
        // Check if it's all zeros (0, 00, 000, 0000)
        newErrors.licensePlate = 'ป้ายทะเบียนบรรทัดล่าง : ไม่สามารถเป็นเลข 0 ทั้งหมด'
      } else if (/^0/.test(bottomValue)) {
        // Check if it starts with 0 (01, 001, 0001, etc.)
        newErrors.licensePlate = 'ป้ายทะเบียนบรรทัดล่า : ตัวเลข 2-4 หลัก ไม่สามารถขึ้นต้นด้วย 0 ทั้งหมดได้'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === 'licensePlateTop') {
      const currentValue = formData.licensePlateTop
      let processedValue = value.replace(/[^0-9ก-ฮ]/g, '') // Allow numbers and Thai chars
      
      // Check if user is deleting (value is shorter than current)
      if (processedValue.length < currentValue.length) {
        // Allow deletion - just accept the shorter value
        setFormData(prev => ({
          ...prev,
          [name]: processedValue,
        }))
        if (errors[name]) {
          setErrors(prev => ({
            ...prev,
            [name]: '',
          }))
        }
        return
      }

      // User is adding characters (value is longer)
      const currentHasNumbers = /[0-9]/.test(processedValue)
      const currentHasThaiChars = /[ก-ฮ]/.test(processedValue)
      
      // If the new input has both numbers and Thai
      if (currentHasNumbers && currentHasThaiChars) {
        // Extract number(s) and Thai characters
        const numberMatch = processedValue.match(/^[0-9]+/)
        const thaiChars = processedValue.replace(/[^ก-ฮ]/g, '')
        
        if (numberMatch) {
          // Numbers at start + Thai - must have exactly 2 Thai characters
          const firstDigit = numberMatch[0].charAt(0)
          // Limit to exactly 2 Thai characters
          const exactlyTwoThaiChars = thaiChars.slice(0, 2)
          
          // Only allow if it has exactly 2 Thai characters
          if (exactlyTwoThaiChars.length === 2) {
            processedValue = firstDigit + exactlyTwoThaiChars
          } else {
            // Not enough Thai characters yet, keep what we have but don't add more if incomplete
            processedValue = firstDigit + exactlyTwoThaiChars
          }
        } else {
          // Numbers not at start - keep Thai only
          processedValue = thaiChars.slice(0, 3)
        }
      } else if (currentHasNumbers) {
        // Only numbers - keep only first digit
        processedValue = processedValue.replace(/[^0-9]/g, '').charAt(0)
      } else if (currentHasThaiChars) {
        // Only Thai characters - limit to 3
        processedValue = processedValue.slice(0, 3)
      }

      setFormData(prev => ({
        ...prev,
        [name]: processedValue,
      }))
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: '',
        }))
      }
      return
    }

    if (name === 'licensePlateBottom') {
      const onlyNum = value.replace(/[^0-9]/g, '')
      // Limit to 4 digits
      const limitedNum = onlyNum.slice(0, 4)
      
      setFormData(prev => ({
        ...prev,
        [name]: limitedNum,
      }))
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: '',
        }))
      }
      return
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))

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
      const selectedModel = MOTORCYCLE_MODELS.find(m => m.id === formData.motorcycleModelId)
      const fullLicensePlate = `${formData.licenseProvince} ${formData.licensePlateTop} ${formData.licensePlateBottom}`.trim()
      const fullName = `${formData.firstName} ${formData.lastName}`.trim()
      const newCustomer = await createCustomer({
        name: fullName,
        phone: formData.phone,
        motorcycleModel: selectedModel?.name || '',
        licensePlate: fullLicensePlate,
        color: selectedModel?.color || formData.color
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
    <div className="receptionist-page">
      <div className="receptionist-container">
        {/* Header */}
        <ReceptionistHeader onOpenHistory={onOpenHistory} onLogout={onLogout} />

        {/* Main Content */}
        <main className="receptionist-main">
          <div className="step-register">
            <div className="register-card">
              <div className="step-header">
                <ProgressIndicator currentStep="register" />
                <p className="step-title">ลงทะเบียนลูกค้าใหม่</p>
              </div>

              <form onSubmit={handleSubmit} className="register-form">
                {/* Customer Information Section */}
                <div className="form-section">
                  <h3 className="form-section-title">ข้อมูลลูกค้า</h3>
                  
                  {/* Name Fields (First Name and Last Name in same row) */}
                  <div className="form-row-two-columns">
                    <div className="form-group">
                      <label htmlFor="firstName">
                        ชื่อ <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="เช่น สมชาย"
                        className={`form-input ${errors.firstName ? 'error' : ''}`}
                        disabled={isSubmitting}
                      />
                      {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="lastName">
                        นามสกุล <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="เช่น ใจดี"
                        className={`form-input ${errors.lastName ? 'error' : ''}`}
                        disabled={isSubmitting}
                      />
                      {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                    </div>
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
                </div>


                {/* Motorcycle Information Section */}
                <div className="form-section">
                  <h3 className="form-section-title">ข้อมูลรถ</h3>

                  <div className="form-group">
                    <label htmlFor="motorcycleModelId">
                      รุ่นรถ <span className="required">*</span>
                    </label>
                    <MotorcycleModelSelect
                      value={formData.motorcycleModelId}
                      onChange={(value) => {
                        setFormData(prev => ({
                          ...prev,
                          motorcycleModelId: value,
                        }))
                        if (errors.motorcycleModelId) {
                          setErrors(prev => ({
                            ...prev,
                            motorcycleModelId: '',
                          }))
                        }
                      }}
                      motorcycleModels={MOTORCYCLE_MODELS}
                      placeholder="เลือกรุ่นรถ..."
                      error={errors.motorcycleModelId}
                      disabled={isSubmitting}
                    />
                  </div>

                <LicensePlateInput
                  province={formData.licenseProvince}
                  top={formData.licensePlateTop}
                  bottom={formData.licensePlateBottom}
                  onProvinceChange={(value) => {
                    const event = { target: { name: 'licenseProvince', value } } as React.ChangeEvent<HTMLInputElement>
                    handleChange(event)
                  }}
                  onTopChange={(value) => {
                    const event = { target: { name: 'licensePlateTop', value } } as React.ChangeEvent<HTMLInputElement>
                    handleChange(event)
                  }}
                  onBottomChange={(value) => {
                    const event = { target: { name: 'licensePlateBottom', value } } as React.ChangeEvent<HTMLInputElement>
                    handleChange(event)
                  }}
                  provinceError={errors.licenseProvince}
                  licensePlateError={errors.licensePlate}
                  isSubmitting={isSubmitting}
                  provinces={PROVINCES}
                />
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
        </main>

        {/* Footer */}
        <ReceptionistFooter />
      </div>
    </div>
  )
}
