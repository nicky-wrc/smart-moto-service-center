import { useState, useMemo } from 'react'
import type { ICustomer } from '../types'
import ReceptionistHeader from '../components/common/ReceptionistHeader'
import ReceptionistFooter from '../components/common/ReceptionistFooter'
import './HistoryPage.css'

interface HistoryRecord {
  id: string
  type: 'new-customer' | 'customer-search' | 'sent-to-tech-lead'
  customer: ICustomer
  timestamp: Date
  details?: string
}

interface FilterOptions {
  searchText: string
  recordType: 'all' | 'new-customer' | 'customer-search' | 'sent-to-tech-lead'
  dateRange: 'all' | 'today' | 'week' | 'month'
  motorcycleModel: string
}

interface Props {
  onBack: () => void
  onOpenHistory?: () => void
  onLogout?: () => void
}

export default function HistoryPage({ onBack, onOpenHistory, onLogout }: Props) {
  const currentTime = new Date()

  const [records] = useState<HistoryRecord[]>([
    {
      id: '1',
      type: 'new-customer',
      customer: {
        name: 'สมชาย สมการ',
        phone: '081-234-5678',
        motorcycleModel: 'Honda CB500',
        licensePlate: 'กทม 1234',
        color: 'สีดำ',
      },
      timestamp: new Date(currentTime.getTime() - 1 * 60 * 60 * 1000),
      details: 'ลงทะเบียนลูกค้าใหม่สำเร็จ',
    },
    {
      id: '2',
      type: 'customer-search',
      customer: {
        name: 'สมหญิง สมการ',
        phone: '081-987-6543',
        motorcycleModel: 'Yamaha MT-07',
        licensePlate: 'กทม 5678',
        color: 'สีแดง',
      },
      timestamp: new Date(currentTime.getTime() - 3 * 60 * 60 * 1000),
      details: 'ค้นหาข้อมูลลูกค้าสำเร็จ',
    },
    {
      id: '3',
      type: 'sent-to-tech-lead',
      customer: {
        name: 'สมพร สมการ',
        phone: '089-111-2222',
        motorcycleModel: 'Kawasaki Ninja',
        licensePlate: 'กทม 9012',
        color: 'สีเขียว',
      },
      timestamp: new Date(currentTime.getTime() - 5 * 60 * 60 * 1000),
      details: 'ส่งให้หัวหน้าช่างสำเร็จ',
    },
    {
      id: '4',
      type: 'new-customer',
      customer: {
        name: 'สมทรง เรียน',
        phone: '089-333-4444',
        motorcycleModel: 'Honda CB500',
        licensePlate: 'กทม 3456',
        color: 'สีขาว',
      },
      timestamp: new Date(currentTime.getTime() - 24 * 60 * 60 * 1000),
      details: 'ลงทะเบียนลูกค้าใหม่สำเร็จ',
    },
  ])

  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    searchText: '',
    recordType: 'all',
    dateRange: 'all',
    motorcycleModel: '',
  })

  // Detail modal state
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Get unique motorcycle models for filter options
  const motorcycleModels = useMemo(() => {
    const models = new Set(records.map(r => r.customer.motorcycleModel))
    return Array.from(models)
  }, [records])

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'new-customer':
        return 'ลูกค้าใหม่'
      case 'customer-search':
        return 'ค้นหาลูกค้า'
      case 'sent-to-tech-lead':
        return 'ส่งให้หัวหน้าช่าง'
      default:
        return 'อื่นๆ'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'new-customer':
        return '#10b981'
      case 'customer-search':
        return '#3b82f6'
      case 'sent-to-tech-lead':
        return '#f59e0b'
      default:
        return '#6b7280'
    }
  }

  const getTypeBadgeColors = (type: string) => {
    switch (type) {
      case 'new-customer':
        return {
          borderColor: '#10b981',
          textColor: '#10b981',
          backgroundColor: '#d1fae5',
        }
      case 'customer-search':
        return {
          borderColor: '#3b82f6',
          textColor: '#3b82f6',
          backgroundColor: '#dbeafe',
        }
      case 'sent-to-tech-lead':
        return {
          borderColor: '#f59e0b',
          textColor: '#f59e0b',
          backgroundColor: '#fef3c7',
        }
      default:
        return {
          borderColor: '#6b7280',
          textColor: '#6b7280',
          backgroundColor: '#f3f4f6',
        }
    }
  }

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }
    return date.toLocaleString('th-TH', options)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isThisWeek = (date: Date) => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    return date >= startOfWeek && date <= now
  }

  const isThisMonth = (date: Date) => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    return date >= startOfMonth && date <= now
  }

  // Filter records based on active filters
  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      // Search filter
      if (filters.searchText) {
        const search = filters.searchText.toLowerCase()
        const matchesSearch =
          record.customer.name.toLowerCase().includes(search) ||
          record.customer.phone.toLowerCase().includes(search) ||
          record.customer.licensePlate.toLowerCase().includes(search)
        if (!matchesSearch) return false
      }

      // Record type filter
      if (filters.recordType !== 'all' && record.type !== filters.recordType) {
        return false
      }

      // Date range filter
      if (filters.dateRange !== 'all') {
        if (filters.dateRange === 'today' && !isToday(record.timestamp)) {
          return false
        }
        if (filters.dateRange === 'week' && !isThisWeek(record.timestamp)) {
          return false
        }
        if (filters.dateRange === 'month' && !isThisMonth(record.timestamp)) {
          return false
        }
      }

      // Motorcycle model filter
      if (filters.motorcycleModel && record.customer.motorcycleModel !== filters.motorcycleModel) {
        return false
      }

      return true
    })
  }, [records, filters])

  const handleBack = () => {
    onBack()
  }

  const handleClearFilters = () => {
    setFilters({
      searchText: '',
      recordType: 'all',
      dateRange: 'all',
      motorcycleModel: '',
    })
  }

  return (
    <div className="history-page">
      {/* Header */}
      <ReceptionistHeader onOpenHistory={onOpenHistory} onLogout={onLogout} />

      {/* Main Content */}
      <main className="history-main">
        <div className="history-container">
          {/* Page Title */}
          <div className="history-title-section">
            <button className="back-button" onClick={handleBack}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              ย้อนกลับ
            </button>
            <h1 className="page-title">ประวัติการทำงาน</h1>
          </div>

          {/* Filter Section */}
          <div className="filter-section">
            {/* Search Input */}
            <div className="filter-group search-group">
              <label className="filter-label">ค้นหา</label>
              <div className="search-input-wrapper">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="ชื่อลูกค้า, เบอร์โทร, ป้ายทะเบียน"
                  value={filters.searchText}
                  onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
                  className="search-input"
                />
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="filter-group">
              <label className="filter-label">ช่วงเวลา</label>
              <div className="filter-buttons">
                <button
                  className={`filter-btn ${filters.dateRange === 'all' ? 'active' : ''}`}
                  onClick={() => setFilters({ ...filters, dateRange: 'all' })}
                >
                  ทั้งหมด
                </button>
                <button
                  className={`filter-btn ${filters.dateRange === 'today' ? 'active' : ''}`}
                  onClick={() => setFilters({ ...filters, dateRange: 'today' })}
                >
                  วันนี้
                </button>
                <button
                  className={`filter-btn ${filters.dateRange === 'week' ? 'active' : ''}`}
                  onClick={() => setFilters({ ...filters, dateRange: 'week' })}
                >
                  สัปดาห์นี้
                </button>
                <button
                  className={`filter-btn ${filters.dateRange === 'month' ? 'active' : ''}`}
                  onClick={() => setFilters({ ...filters, dateRange: 'month' })}
                >
                  เดือนนี้
                </button>
              </div>
            </div>

            {/* Record Type Filter */}
            <div className="filter-group">
              <label className="filter-label">ประเภท</label>
              <select
                value={filters.recordType}
                onChange={(e) => setFilters({ ...filters, recordType: e.target.value as FilterOptions['recordType'] })}
                className="filter-select"
              >
                <option value="all">ทั้งหมด</option>
                <option value="new-customer">ลูกค้าใหม่</option>
                <option value="customer-search">ค้นหาลูกค้า</option>
                <option value="sent-to-tech-lead">ส่งให้หัวหน้าช่าง</option>
              </select>
            </div>

            {/* Motorcycle Model Filter */}
            <div className="filter-group">
              <label className="filter-label">รุ่นมอเตอร์ไซค์</label>
              <select
                value={filters.motorcycleModel}
                onChange={(e) => setFilters({ ...filters, motorcycleModel: e.target.value })}
                className="filter-select"
              >
                <option value="">ทั้งหมด</option>
                {motorcycleModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            {(filters.searchText || filters.recordType !== 'all' || filters.dateRange !== 'all' || filters.motorcycleModel) && (
              <button className="clear-filters-btn" onClick={handleClearFilters}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M8 6v12M16 6v12M5 6l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M10 11v6M14 11v6" />
                </svg>
                ล้างตัวกรอง
              </button>
            )}
          </div>

          {/* Result Count */}
          <div className="result-info">
            พบ {filteredRecords.length} รายการ
          </div>

          {/* History List */}
          <div className="history-list">
            {filteredRecords.length === 0 ? (
              <div className="empty-state">
                <p>ไม่พบข้อมูลที่ตรงกับการค้นหา</p>
              </div>
            ) : (
              filteredRecords.map((record) => (
                <div key={record.id} className="history-item">
                  <div className="history-item-left">
                    <div className="history-type-indicator" style={{ backgroundColor: getTypeColor(record.type) }}>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </div>

                  <div className="history-item-center">
                    <div className="history-header-info">
                      <span
                        className="history-type-label"
                        style={{
                          backgroundColor: getTypeBadgeColors(record.type).backgroundColor,
                          color: getTypeBadgeColors(record.type).textColor,
                          borderColor: getTypeBadgeColors(record.type).borderColor,
                        }}
                      >
                        {getTypeLabel(record.type)}
                      </span>
                      <h3 className="customer-name">{record.customer.name}</h3>
                    </div>
                    <p className="customer-phone">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      {record.customer.phone}
                    </p>
                    <p className="customer-bike">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="18" cy="18" r="3" />
                        <circle cx="6" cy="18" r="3" />
                        <path d="M6 9h12M9 9v6M15 9v6M6 18h12" />
                      </svg>
                      {record.customer.motorcycleModel} ({record.customer.licensePlate})
                    </p>
                    {record.details && <p className="record-details">{record.details}</p>}
                  </div>

                  <div className="history-item-right">
                    <span className="time-badge">{formatDate(record.timestamp)}</span>
                    <button
                      className="detail-button"
                      onClick={() => {
                        setSelectedRecord(record)
                        setIsDetailModalOpen(true)
                      }}
                    >
                      ดูรายละเอียด
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedRecord && (
        <div className="detail-modal-overlay" onClick={() => setIsDetailModalOpen(false)}>
          <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="detail-modal-header">
              <h2>รายละเอียดการทำรายการ</h2>
              <button
                className="close-button"
                onClick={() => setIsDetailModalOpen(false)}
                title="ปิด"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="detail-modal-content">
              {/* Record Type */}
              <div className="detail-section">
                <label>ประเภทการทำรายการ</label>
                <div className="detail-value-badge" style={{ backgroundColor: getTypeColor(selectedRecord.type) }}>
                  {getTypeLabel(selectedRecord.type)}
                </div>
              </div>

              {/* Timestamp */}
              <div className="detail-section">
                <label>วันที่และเวลาการทำรายการ</label>
                <p className="detail-value">{formatDate(selectedRecord.timestamp)}</p>
              </div>

              {/* Customer Information */}
              <div className="detail-section">
                <label>ข้อมูลลูกค้า</label>
                <div className="customer-info-grid">
                  <div className="customer-info-item">
                    <span className="info-label">ชื่อ</span>
                    <p className="info-value">{selectedRecord.customer.name}</p>
                  </div>
                  <div className="customer-info-item">
                    <span className="info-label">เบอร์โทรศัพท์</span>
                    <p className="info-value">{selectedRecord.customer.phone}</p>
                  </div>
                </div>
              </div>

              {/* Motorcycle Information */}
              <div className="detail-section">
                <label>ข้อมูลรถจักรยานยนต์</label>
                <div className="motorcycle-info-grid">
                  <div className="motorcycle-info-item">
                    <span className="info-label">รุ่น</span>
                    <p className="info-value">{selectedRecord.customer.motorcycleModel}</p>
                  </div>
                  <div className="motorcycle-info-item">
                    <span className="info-label">ทะเบียน</span>
                    <p className="info-value">{selectedRecord.customer.licensePlate}</p>
                  </div>
                  <div className="motorcycle-info-item">
                    <span className="info-label">สี</span>
                    <p className="info-value">{selectedRecord.customer.color}</p>
                  </div>
                </div>
              </div>

              {/* Details */}
              {selectedRecord.details && (
                <div className="detail-section">
                  <label>รายละเอียดเพิ่มเติม</label>
                  <p className="detail-value">{selectedRecord.details}</p>
                </div>
              )}
            </div>

            <div className="detail-modal-footer">
              <button
                className="close-modal-button"
                onClick={() => setIsDetailModalOpen(false)}
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <ReceptionistFooter />
    </div>
  )
}
