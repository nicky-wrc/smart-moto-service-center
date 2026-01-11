import { useState } from 'react'
import '../styles/CustomerRegistrationForm.css'

interface Customer {
  id?: string
  name: string
  phone: string
  motorcycleModel: string
  licensePlate: string
  color: string
}

interface Props {
  onBack: () => void
  onSubmit: (customer: Customer) => void
}

export default function CustomerRegistrationForm({ onBack, onSubmit }: Props) {
  const [formData, setFormData] = useState<Customer>({
    name: '',
    phone: '',
    motorcycleModel: '',
    licensePlate: '',
    color: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // ลบข้อผิดพลาดเมื่อผู้ใช้เริ่มแก้ไข
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'กรุณากรอกชื่อลูกค้า'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'กรุณากรอกเบอร์โทร'
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'เบอร์โทรต้องมี 10 หลัก'
    }

    if (!formData.motorcycleModel.trim()) {
      newErrors.motorcycleModel = 'กรุณากรอกรุ่นรถ'
    }

    if (!formData.licensePlate.trim()) {
      newErrors.licensePlate = 'กรุณากรอกป้ายทะเบียน'
    }

    if (!formData.color.trim()) {
      newErrors.color = 'กรุณาเลือกสีรถ'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      // Generate ID
      const newCustomer: Customer = {
        ...formData,
        id: Date.now().toString()
      }
      
      console.log('ส่งข้อมูลลูกค้าใหม่:', newCustomer)
      onSubmit(newCustomer)
    }
  }

  const colors = ['ดำ', 'ขาว', 'แดง', 'น้ำเงิน', 'เขียว', 'เหลือง', 'ส้ม', 'เทา', 'อื่น ๆ']

  return (
    <div className="register-section">
      <div className="register-card">
        <h2>ขั้นตอนที่ 3: ลงทะเบียนลูกค้าใหม่</h2>
        
        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-group">
            <label htmlFor="name">ชื่อลูกค้า *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="กรอกชื่อลูกค้า"
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">เบอร์โทร *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0xxxxxxxxx"
              className={errors.phone ? 'input-error' : ''}
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="motorcycleModel">รุ่นรถ *</label>
            <input
              type="text"
              id="motorcycleModel"
              name="motorcycleModel"
              value={formData.motorcycleModel}
              onChange={handleChange}
              placeholder="เช่น Honda CB150R"
              className={errors.motorcycleModel ? 'input-error' : ''}
            />
            {errors.motorcycleModel && <span className="error-message">{errors.motorcycleModel}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="color">สี *</label>
            <select
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className={errors.color ? 'input-error' : ''}
            >
              <option value="">-- เลือกสี --</option>
              {colors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
            {errors.color && <span className="error-message">{errors.color}</span>}
          </div>

          <div className="form-actions">
            <button type="button" onClick={onBack} className="btn btn-back">
              ← ย้อนกลับ
            </button>
            <button type="submit" className="btn btn-submit">
              ✓ บันทึกข้อมูล
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
