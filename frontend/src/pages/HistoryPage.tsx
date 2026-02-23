import { useState } from 'react'
import type { ICustomer } from '../types'
import './HistoryPage.css'

interface HistoryRecord {
  id: string
  type: 'new-customer' | 'customer-search' | 'sent-to-tech-lead'
  customer: ICustomer
  timestamp: Date
  details?: string
}

interface Props {
  onBack: () => void
}

export default function HistoryPage({ onBack }: Props) {
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
  ])

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

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours === 0) {
      return `${minutes} นาทีที่แล้ว`
    }
    if (hours === 1) {
      return `${hours} ชั่วโมงที่แล้ว`
    }
    if (hours < 24) {
      return `${hours} ชั่วโมงที่แล้ว`
    }
    return date.toLocaleDateString('th-TH')
  }

  const handleBack = () => {
    onBack()
  }

  return (
    <div className="history-page">
      <div className="history-header">
        <button className="back-button" onClick={handleBack}>
          ← ย้อนกลับ
        </button>
        <h1>ประวัติการทำงาน</h1>
      </div>

      <div className="history-container">
        <div className="history-list">
          {records.length === 0 ? (
            <div className="empty-state">
              <p>ไม่มีประวัติการทำงาน</p>
            </div>
          ) : (
            records.map((record) => (
              <div key={record.id} className="history-item">
                <div className="history-type-badge" style={{ backgroundColor: getTypeColor(record.type) }}>
                  {getTypeLabel(record.type)}
                </div>

                <div className="history-content">
                  <h3 className="customer-name">{record.customer.name}</h3>
                  <p className="customer-phone">เบอร์โทรศัพท์: {record.customer.phone}</p>
                  <p className="customer-bike">
                    {record.customer.motorcycleModel} ({record.customer.licensePlate})
                  </p>
                  {record.details && <p className="record-details">{record.details}</p>}
                </div>

                <div className="history-time">
                  <span className="time-badge">{formatDate(record.timestamp)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
