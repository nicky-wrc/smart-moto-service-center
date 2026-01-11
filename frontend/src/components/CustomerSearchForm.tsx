import { useState } from 'react'
import '../styles/CustomerSearchForm.css'

interface Customer {
  id: string
  name: string
  phone: string
  motorcycleModel: string
  licensePlate: string
  color: string
}

// Mock data สำหรับทดสอบ
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'สมชาย ใจดี',
    phone: '0812345678',
    motorcycleModel: 'Honda CB150R',
    licensePlate: 'กท 1234',
    color: 'ดำ'
  },
  {
    id: '2',
    name: 'นัฐนีย์ สวยงาม',
    phone: '0898765432',
    motorcycleModel: 'Yamaha NMAX 155',
    licensePlate: 'บข 5678',
    color: 'แดง'
  },
  {
    id: '3',
    name: 'วรรณพร ผลดี',
    phone: '0867543210',
    motorcycleModel: 'Suzuki GD110',
    licensePlate: 'ชค 9012',
    color: 'เขียว'
  }
]

interface Props {
  onBack: () => void
  onCustomerSelected: (customer: Customer) => void
}

export default function CustomerSearchForm({ onBack, onCustomerSelected }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Customer[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setHasSearched(false)
      return
    }

    const query = searchQuery.toLowerCase()
    const results = mockCustomers.filter(customer =>
      customer.name.toLowerCase().includes(query) ||
      customer.phone.includes(query) ||
      customer.motorcycleModel.toLowerCase().includes(query) ||
      customer.licensePlate.toLowerCase().includes(query)
    )

    setSearchResults(results)
    setHasSearched(true)
  }

  const handleSelectCustomer = (customer: Customer) => {
    onCustomerSelected(customer)
  }

  return (
    <div className="search-section">
      <div className="search-card">
        <h2>ขั้นตอนที่ 2: ค้นหาลูกค้า</h2>
        
        <div className="search-box">
          <p>ค้นหาจาก: ชื่อ, เบอร์โทร, รุ่นรถ, หรือป้ายทะเบียน</p>
          <div className="search-input-group">
            <input
              type="text"
              placeholder="พิมพ์ข้อมูลเพื่อค้นหา..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
              className="search-input"
            />
            <button onClick={handleSearch} className="btn btn-search">
              🔍 ค้นหา
            </button>
          </div>
        </div>

        {hasSearched && (
          <div className="search-results">
            {searchResults.length > 0 ? (
              <div className="results-list">
                <h3>ผลการค้นหา ({searchResults.length})</h3>
                {searchResults.map((customer) => (
                  <div key={customer.id} className="customer-card">
                    <div className="customer-info">
                      <h4>{customer.name}</h4>
                      <p><strong>เบอร์โทร:</strong> {customer.phone}</p>
                      <p><strong>รถ:</strong> {customer.motorcycleModel} ({customer.color})</p>
                      <p><strong>ทะเบียน:</strong> {customer.licensePlate}</p>
                    </div>
                    <button
                      className="btn btn-select"
                      onClick={() => handleSelectCustomer(customer)}
                    >
                      เลือก
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <p>❌ ไม่พบลูกค้าที่ตรงกัน</p>
                <p className="hint">ลองค้นหาด้วยข้อมูลอื่น หรือลูกค้าอาจเป็นลูกค้าใหม่</p>
              </div>
            )}
          </div>
        )}

        <button onClick={onBack} className="btn btn-back">
          ← ย้อนกลับ
        </button>
      </div>
    </div>
  )
}
