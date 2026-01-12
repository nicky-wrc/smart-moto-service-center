import { useState } from 'react'
import { searchCustomers } from '../../services/api'
import type { ICustomer } from '../../types'
import ProgressIndicator from '../common/ProgressIndicator'
import './StepSearch.css'

interface Props {
  onCustomerFound: (customer: ICustomer) => void
  onBack: () => void
}

export default function StepSearch({ onCustomerFound, onBack }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ICustomer[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setHasSearched(false)
      return
    }

    setIsLoading(true)
    try {
      const result = await searchCustomers(searchQuery)
      setSearchResults(result.customers)
      setHasSearched(true)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
      setHasSearched(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectCustomer = (customer: ICustomer) => {
    onCustomerFound(customer)
  }

  return (
    <div className="step-search">
      <div className="search-card">
        <div className="step-header">
          <ProgressIndicator currentStep="search" />
          <p className="step-title">ค้นหาข้อมูลลูกค้า</p>
        </div>

        <div className="search-container">
          <div className="search-box">
            <p className="search-hint">ค้นหาจาก ชื่อ • เบอร์โทร • รุ่นรถ • หมายเลขทะเบียน</p>
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="กรอกข้อมูลลูกค้า..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter' && !isLoading) {
                    handleSearch()
                  }
                }}
                className="search-input"
                disabled={isLoading}
              />
              <button onClick={handleSearch} className="search-btn" disabled={isLoading}>
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {hasSearched && (
            <div className="search-results">
              {searchResults.length > 0 ? (
                <div className="results-list">
                  <p className="results-count">Found {searchResults.length} result(s)</p>
                  {searchResults.map(customer => (
                    <div key={customer.id} className="customer-item">
                      <div className="customer-avatar">U</div>
                      <div className="customer-details">
                        <h4>{customer.name}</h4>
                        <div className="details-grid">
                          <span>P {customer.phone}</span>
                          <span>M {customer.motorcycleModel}</span>
                          <span>L {customer.licensePlate}</span>
                        </div>
                      </div>
                      <button className="select-btn" onClick={() => handleSelectCustomer(customer)}>
                        Select →
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-results">
                  <p className="no-results-icon">◯</p>
                  <p className="no-results-text">ไม่พบข้อมูลลูกค้า</p>
                  <p className="no-results-hint">ลองค้นหาด้วยข้อมูลที่แตกต่างออกไปหรือทำการลงทะเบียนลูกค้าใหม่</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="step-actions">
          <button onClick={onBack} className="btn-back">
            ← Back
          </button>
        </div>
      </div>
    </div>
  )
}
