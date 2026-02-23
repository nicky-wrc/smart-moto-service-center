/**
 * API Service สำหรับระบบต้อนรับลูกค้า
 * เตรียมพร้อมสำหรับการเชื่อม Backend API
 */

import type { ICustomer, ISearchResult, IApiResponse } from '../types'

// const API_BASE_URL = 'http://localhost:3000/api'

/**
 * ค้นหาลูกค้าจากข้อมูล
 * @param query - คำค้นหา (ชื่อ, เบอร์โทร, รุ่นรถ, ทะเบียน)
 * @returns ผลการค้นหา
 */
export async function searchCustomers(query: string): Promise<ISearchResult> {
  try {
    // TODO: เปลี่ยนเป็น API call จริง
    // const response = await fetch(`${API_BASE_URL}/customers/search?q=${encodeURIComponent(query)}`)
    // return await response.json()

    // ใช้ Mock data ชั่วคราว
    return getMockSearchResults(query)
  } catch (error) {
    console.error('Error searching customers:', error)
    throw new Error('ไม่สามารถค้นหาลูกค้าได้')
  }
}

/**
 * สร้างลูกค้าใหม่
 * @param customer - ข้อมูลลูกค้าที่จะสร้าง
 * @returns ข้อมูลลูกค้าที่สร้าง
 */
export async function createCustomer(customer: Omit<ICustomer, 'id' | 'createdAt'>): Promise<ICustomer> {
  try {
    // TODO: เปลี่ยนเป็น API call จริง
    // const response = await fetch(`${API_BASE_URL}/customers`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(customer),
    // })
    // return await response.json()

    // ใช้ Mock data ชั่วคราว
    return {
      ...customer,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
  } catch (error) {
    console.error('Error creating customer:', error)
    throw new Error('ไม่สามารถบันทึกข้อมูลลูกค้าได้')
  }
}

/**
 * ส่งข้อมูลลูกค้าให้หัวหน้าช่าง
 * @param customerId - ID ของลูกค้า
 * @param notes - หมายเหตุเพิ่มเติม
 * @returns ผลการส่ง
 */
export async function submitToTechLead(
  customerId: string,
  notes?: string,
): Promise<IApiResponse<{ customerId: string; submittedAt: Date }>> {
  try {
    // TODO: เปลี่ยนเป็น API call จริง
    // const response = await fetch(`${API_BASE_URL}/jobs/create`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ customerId, notes }),
    // })
    // return await response.json()

    console.log('ส่งข้อมูลให้หัวหน้าช่าง:', { customerId, notes })
    return {
      success: true,
      message: 'ส่งข้อมูลให้หัวหน้าช่างเรียบร้อย',
      data: { customerId, submittedAt: new Date() },
    }
  } catch (error) {
    console.error('Error submitting to tech lead:', error)
    return {
      success: false,
      error: 'ไม่สามารถส่งข้อมูลได้',
    }
  }
}

/**
 * ยืนยันข้อมูลลูกค้า
 * @param customer - ข้อมูลลูกค้า
 */
export async function confirmCustomer(customer: ICustomer): Promise<IApiResponse<ICustomer>> {
  try {
    // TODO: เปลี่ยนเป็น API call จริง
    console.log('ยืนยันข้อมูลลูกค้า:', customer)
    return {
      success: true,
      message: 'ยืนยันข้อมูลสำเร็จ',
      data: customer,
    }
  } catch (error) {
    console.error('Error confirming customer:', error)
    return {
      success: false,
      error: 'ไม่สามารถยืนยันข้อมูลได้',
    }
  }
}

/**
 * Mock data สำหรับการทดสอบ
 */
const MOCK_CUSTOMERS: ICustomer[] = [
  {
    id: '1',
    name: 'สมชาย ใจดี',
    phone: '0812345678',
    motorcycleModel: 'Honda CB150R',
    licensePlate: 'กท 1234',
    color: 'ดำ',
    createdAt: new Date('2025-01-01'),
  },
  {
    id: '2',
    name: 'นัฐนีย์ สวยงาม',
    phone: '0898765432',
    motorcycleModel: 'Yamaha NMAX 155',
    licensePlate: 'บข 5678',
    color: 'แดง',
    createdAt: new Date('2025-02-15'),
  },
  {
    id: '3',
    name: 'วรรณพร ผลดี',
    phone: '0867543210',
    motorcycleModel: 'Suzuki GD110',
    licensePlate: 'ชค 9012',
    color: 'เขียว',
    createdAt: new Date('2025-03-20'),
  },
  {
    id: '4',
    name: 'สมหมาย รักษา',
    phone: '0876543210',
    motorcycleModel: 'Kawasaki Ninja',
    licensePlate: 'ดด 3456',
    color: 'ขาว',
    createdAt: new Date('2025-04-10'),
  },
]

function getMockSearchResults(query: string): ISearchResult {
  if (!query.trim()) {
    return { customers: [], totalCount: 0 }
  }

  const searchLower = query.toLowerCase()
  const filtered = MOCK_CUSTOMERS.filter(
    customer =>
      customer.name.toLowerCase().includes(searchLower) ||
      customer.phone.includes(query) ||
      customer.motorcycleModel.toLowerCase().includes(searchLower) ||
      customer.licensePlate.toLowerCase().includes(searchLower),
  )

  return {
    customers: filtered,
    totalCount: filtered.length,
  }
}
