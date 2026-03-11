# Frontend Integration Guide — Smart Moto Service Center

---

# Purchase Order - Frontend Integration Summary

## สรุปการแก้ไข

### 1. ไฟล์ที่แก้ไข

#### `CreatePurchaseOrderPage.tsx`
**การเปลี่ยนแปลง:**
- เปลี่ยน `handleSubmit` เป็น `async function`
- เพิ่ม try-catch สำหรับ error handling
- เตรียมโค้ดสำหรับเรียก API (comment ไว้)
- เพิ่มข้อความแจ้งเตือน owner เมื่อสร้าง PO แบบ pending

**สถานะเมื่อสร้าง PO:**
- กดปุ่ม "บันทึกเป็นแบบร่าง" → `status = "draft"`
- กดปุ่ม "ส่งคำขอสั่งซื้อ" → `status = "pending"` (รออนุมัติ)

**เมื่อ backend พร้อม:**
```typescript
// Uncomment บรรทัดนี้ใน handleSubmit:
const response = await fetch('/api/purchase-orders', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(orderData)
})

if (!response.ok) {
    throw new Error('Failed to create purchase order')
}

const createdOrder = await response.json()
```

#### `PurchaseOrdersPage.tsx`
**การเปลี่ยนแปลง:**
- เพิ่ม state `unreadStatusChanges` เก็บรายการที่เปลี่ยนสถานะ
- แก้ไข `filteredOrders` ให้เรียงลำดับ:
  1. รายการที่เปลี่ยนสถานะ (unread) อยู่บนสุด
  2. ตามด้วยรายการใหม่สุด (เรียงจากใหม่ → เก่า)
- เพิ่มสีพื้นหลัง:
  - `bg-green-50/70` สำหรับ approved
  - `bg-red-50/70` สำหรับ rejected
- แก้ไข `markVisited` ให้ลบออกจาก unreadStatusChanges เมื่อกดดู

**เมื่อ backend พร้อม:**
```typescript
// Uncomment logic ใน useEffect สำหรับตรวจจับการเปลี่ยนสถานะ:
const previousStatuses = JSON.parse(localStorage.getItem('po_previous_statuses') || '{}')
const newUnreadChanges: Record<string, 'approved' | 'rejected'> = {}

posResult.data.forEach(order => {
  const prevStatus = previousStatuses[order.id]
  if (prevStatus === 'pending' && (order.status === 'approved' || order.status === 'rejected')) {
    newUnreadChanges[order.id] = order.status
  }
})

if (Object.keys(newUnreadChanges).length > 0) {
  setUnreadStatusChanges(prev => ({ ...prev, ...newUnreadChanges }))
}
```

### 2. ไฟล์ที่สร้างใหม่

#### `services/purchaseOrderApiService.ts`
**จุดประสงค์:** Service สำหรับเรียก API เกี่ยวกับ Purchase Orders

**Methods:**
- `create(data)` - สร้าง PO ใหม่
- `getAll()` - ดึงรายการ PO ทั้งหมด
- `getById(id)` - ดึง PO เฉพาะ ID
- `updateStatus(id, data)` - อัพเดทสถานะ (อนุมัติ/ไม่อนุมัติ) - Owner only
- `cancel(id)` - ยกเลิก PO - เฉพาะ pending
- `sendApprovalNotification(orderId)` - ส่งแจ้งเตือนไปหา Owner

**วิธีใช้:**
```typescript
import { purchaseOrderApiService } from './services/purchaseOrderApiService'

// สร้าง PO
const newPO = await purchaseOrderApiService.create(orderData)

// ดึงรายการ PO
const allPOs = await purchaseOrderApiService.getAll()

// ดึง PO ตาม ID
const po = await purchaseOrderApiService.getById('PO-20260311-001')
```

#### `services/purchaseOrderWebSocketService.ts`
**จุดประสงค์:** Service สำหรับรับ real-time notification เมื่อสถานะเปลี่ยน

**Methods:**
- `connect()` - เชื่อมต่อ WebSocket
- `disconnect()` - ตัดการเชื่อมต่อ
- `onStatusChange(callback)` - Subscribe เพื่อรับการแจ้งเตือน
- `isConnected()` - เช็คสถานะการเชื่อมต่อ

**วิธีใช้:**
```typescript
import { poWebSocketService } from './services/purchaseOrderWebSocketService'

// เชื่อมต่อ
poWebSocketService.connect()

// Subscribe
const unsubscribe = poWebSocketService.onStatusChange((notification) => {
  console.log('PO Status Changed:', notification)
  // notification = {
  //   orderId: 'PO-20260311-001',
  //   previousStatus: 'pending',
  //   newStatus: 'approved',
  //   changedBy: 'Owner Name',
  //   changedAt: '2026-03-11T10:30:00Z',
  //   ownerComment: 'Approved for purchase'
  // }
  
  // Update UI
  setUnreadStatusChanges(prev => ({
    ...prev,
    [notification.orderId]: notification.newStatus
  }))
  
  // Re-fetch PO list
  refreshPurchaseOrders()
})

// Cleanup
return () => {
  unsubscribe()
  poWebSocketService.disconnect()
}
```

**หรือสร้าง React Hook:**
```typescript
// hooks/usePONotifications.ts
import { useEffect } from 'react'
import { poWebSocketService, POStatusChangeNotification } from '../services/purchaseOrderWebSocketService'

export function usePONotifications(onStatusChange: (notification: POStatusChangeNotification) => void) {
  useEffect(() => {
    poWebSocketService.connect()
    const unsubscribe = poWebSocketService.onStatusChange(onStatusChange)
    
    return () => {
      unsubscribe()
    }
  }, [onStatusChange])
}

// ใช้งานใน Component:
function PurchaseOrdersPage() {
  usePONotifications((notification) => {
    // Handle status change
    setUnreadStatusChanges(prev => ({
      ...prev,
      [notification.orderId]: notification.newStatus
    }))
  })
}
```

## Flow การทำงาน

### 1. พนักงานสร้าง PO
```
1. เปิดหน้า Create Purchase Order
2. กรอกข้อมูล: ซัพพลายเออร์, วันส่งของ, รายการสินค้า
3. กดปุ่ม "ส่งคำขอสั่งซื้อ"
4. Frontend เรียก API: POST /api/purchase-orders (status: "pending")
5. Backend บันทึกข้อมูล และส่ง notification ไปหา Owner
6. Frontend แสดงข้อความ "ส่งคำขอสำเร็จ" และกลับไปหน้ารายการ
```

### 2. Owner อนุมัติ/ไม่อนุมัติ
```
1. Owner ได้รับ notification (อาจเป็น Email, LINE, หรือใน App)
2. Owner เปิดหน้า Purchase Orders
3. Owner คลิกดู PO ที่ต้องการอนุมัติ
4. Owner กดปุ่ม "อนุมัติ" หรือ "ไม่อนุมัติ"
5. Backend เรียก API: PATCH /api/purchase-orders/{id}/status
6. Backend อัพเดทสถานะในฐานข้อมูล
7. Backend ส่ง WebSocket notification ไปยัง clients ทั้งหมด
```

### 3. พนักงานได้รับการแจ้งเตือน
```
1. WebSocket service รับ notification
2. Frontend อัพเดท unreadStatusChanges state
3. PO ที่เปลี่ยนสถานะถูกเด้งขึ้นไปด้านบน
4. แสดงพื้นหลังสีเขียว (approved) หรือสีแดง (rejected)
5. พนักงานคลิกดู PO
6. พื้นหลังสีหายไป (markVisited)
```

## การทดสอบระหว่างรอ Backend

### ทดสอบ UI/UX:
```typescript
// ใน PurchaseOrdersPage.tsx, เพิ่มปุ่มทดสอบชั่วคราว:
<button onClick={() => {
  // Simulate status change
  setUnreadStatusChanges(prev => ({
    ...prev,
    'PO-20260311-001': 'approved'
  }))
}}>
  ทดสอบ: เปลี่ยนเป็น Approved
</button>

<button onClick={() => {
  setUnreadStatusChanges(prev => ({
    ...prev,
    'PO-20260311-002': 'rejected'
  }))
}}>
  ทดสอบ: เปลี่ยนเป็น Rejected
</button>
```

### ทดสอบ Sorting:
```typescript
// ตรวจสอบว่า PO ที่มีใน unreadStatusChanges อยู่ด้านบนจริงหรือไม่
console.log('Unread:', Object.keys(unreadStatusChanges))
console.log('Sorted orders:', filteredOrders.map(o => o.id))
```

### ทดสอบ Background Color:
```typescript
// ตรวจสอบว่าสีพื้นหลังแสดงถูกต้องหรือไม่
filteredOrders.forEach(order => {
  const unreadStatus = unreadStatusChanges[order.id]
  console.log(`${order.id}: ${unreadStatus || 'no highlight'}`)
})
```

## Checklist สำหรับเชื่อมต่อ Backend

### Phase 1: Basic API
- [ ] Backend สร้าง database tables
- [ ] Backend implement POST /api/purchase-orders
- [ ] Backend implement GET /api/purchase-orders
- [ ] Frontend: Uncomment API calls ใน `CreatePurchaseOrderPage.tsx`
- [ ] Frontend: Uncomment API calls ใน `purchaseOrderApiService.ts`
- [ ] ทดสอบสร้าง PO และดึงรายการ

### Phase 2: Status Management
- [ ] Backend implement PATCH /api/purchase-orders/{id}/status
- [ ] Backend implement POST /api/purchase-orders/{id}/cancel
- [ ] Backend เพิ่ม authorization check (owner only)
- [ ] ทดสอบอนุมัติ/ไม่อนุมัติ PO

### Phase 3: Real-time Updates
- [ ] Backend setup WebSocket server
- [ ] Backend emit event เมื่อสถานะเปลี่ยน
- [ ] Frontend: Uncomment WebSocket logic ใน `purchaseOrderWebSocketService.ts`
- [ ] Frontend: Uncomment status detection logic ใน `PurchaseOrdersPage.tsx`
- [ ] Frontend: สร้าง React hook สำหรับ WebSocket
- [ ] ทดสอบ real-time notification

### Phase 4: Notifications
- [ ] Backend implement notification system
- [ ] Backend ส่ง notification ไป Owner เมื่อสร้าง PO
- [ ] Frontend: Uncomment notification API call ใน `CreatePurchaseOrderPage.tsx`
- [ ] ทดสอบ end-to-end workflow

## สรุปไฟล์ที่ต้อง Uncomment

### 1. `CreatePurchaseOrderPage.tsx`
```typescript
// บรรทัดที่ 159-171: Uncomment API call
const response = await fetch('/api/purchase-orders', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(orderData)
})

if (!response.ok) {
    throw new Error('Failed to create purchase order')
}

const createdOrder = await response.json()

// บรรทัดที่ 219-231: Uncomment notification call
if (action === 'submit') {
    await fetch('/api/notifications/purchase-order-approval', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
            orderId: newOrder.id,
            recipientRole: 'owner',
            message: `มีใบสั่งซื้อใหม่รออนุมัติ: ${newOrder.id} จำนวนเงิน ฿${newOrder.totalAmount.toLocaleString()}`
        })
    })
}
```

### 2. `PurchaseOrdersPage.tsx`
```typescript
// บรรทัดที่ 61-83: Uncomment status detection
const previousStatuses = JSON.parse(localStorage.getItem('po_previous_statuses') || '{}')
const newUnreadChanges: Record<string, 'approved' | 'rejected'> = {}

posResult.data.forEach(order => {
  const prevStatus = previousStatuses[order.id]
  if (prevStatus === 'pending' && (order.status === 'approved' || order.status === 'rejected')) {
    newUnreadChanges[order.id] = order.status
  }
})

if (Object.keys(newUnreadChanges).length > 0) {
  setUnreadStatusChanges(prev => ({ ...prev, ...newUnreadChanges }))
}

const currentStatuses = posResult.data.reduce((acc, order) => {
  acc[order.id] = order.status
  return acc
}, {} as Record<string, string>)
localStorage.setItem('po_previous_statuses', JSON.stringify(currentStatuses))
```

### 3. `services/purchaseOrderApiService.ts`
Uncomment ทุก method body (ลบ `throw new Error(...)`)

### 4. `services/purchaseOrderWebSocketService.ts`
```typescript
// บรรทัดที่ 37-51: Uncomment WebSocket connection
const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3000/ws'
const token = localStorage.getItem('token')
this.socket = new WebSocket(`${wsUrl}?token=${token}`)

this.socket.onopen = this.handleOpen.bind(this)
this.socket.onmessage = this.handleMessage.bind(this)
this.socket.onerror = this.handleError.bind(this)
this.socket.onclose = this.handleClose.bind(this)
```

## Environment Variables

เพิ่มใน `.env`:
```
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000/ws
```

## หมายเหตุ

1. **การจัดเก็บสถานะ:**
   - `localStorage.po_unread_status_changes` - เก็บรายการที่เปลี่ยนสถานะแล้วยังไม่ได้ดู
   - `localStorage.po_previous_statuses` - เก็บสถานะก่อนหน้า เพื่อตรวจจับการเปลี่ยนแปลง
   - `sessionStorage.po_last_visited` - เก็บ ID ของ PO ที่เพิ่งดู (สำหรับ highlight)

2. **การเรียงลำดับ:**
   - PO ที่เปลี่ยนสถานะ (unread) จะอยู่ด้านบนสุดเสมอ
   - PO ปกติเรียงจากใหม่ไปเก่า (reverse order)

3. **สีพื้นหลัง:**
   - `bg-green-50/70` (สีเขียวอ่อน) = approved
   - `bg-red-50/70` (สีแดงอ่อน) = rejected
   - สีจะหายเมื่อกดดูรายละเอียด

4. **Performance:**
   - WebSocket จะ auto-reconnect หาก connection ขาด
   - ใช้ localStorage cache เพื่อลด API calls
   - ใช้ useMemo สำหรับ filtering และ sorting

## เอกสารเพิ่มเติม

ดูรายละเอียดเต็มได้ที่:
- `docs/PURCHASE_ORDER_BACKEND_GUIDE.md` - คู่มือสำหรับ Backend Team
- `services/purchaseOrderApiService.ts` - API Service documentation
- `services/purchaseOrderWebSocketService.ts` - WebSocket Service documentation

---

# Reception System - Frontend Integration Summary

## สรุปการแก้ไข

### 1. ไฟล์ที่แก้ไข

#### `ReceptionRepairPage.tsx`
**การเปลี่ยนแปลง:**
- เพิ่ม import `receptionApiService` และ `RepairRequestDTO`
- เปลี่ยน `handleSubmit` เป็น `async function`
- เตรียมข้อมูล `RepairRequestDTO` สำหรับส่ง API
- เพิ่ม try-catch สำหรับ error handling
- เพิ่มโค้ดสำหรับ upload images และส่งข้อมูล (comment ไว้)

**Flow การทำงาน:**
```
1. User กรอกอาการ (symptoms)
2. User เลือกแท็ก (tags)
3. User อัพโหลดรูปภาพ (optional)
4. User กดปุ่ม "ส่งใบแจ้งซ่อม"
5. Frontend validate ข้อมูล
6. Frontend upload images (ถ้ามี)
7. Frontend ส่งข้อมูลไป backend
8. Backend สร้าง repair request และส่ง notification ไป foreman
9. Frontend แสดงหน้า success
```

**เมื่อ backend พร้อม:**
```typescript
// Uncomment ในฟังก์ชัน handleSubmit:

// Step 1: Upload images first (if any)
if (images.length > 0) {
    const imageFiles = await Promise.all(
        images.map(async (img) => {
            const response = await fetch(img.url)
            const blob = await response.blob()
            return new File([blob], img.name, { type: blob.type })
        })
    )
    const uploadedUrls = await receptionApiService.uploadImages(imageFiles)
    repairRequestData.images = uploadedUrls
}

// Step 2: Create repair request
const result = await receptionApiService.createRepairRequest(repairRequestData)

console.log('Repair request created:', result)
// result = {
//   id: "RH-009-1773169600006",
//   queueNumber: 9,
//   status: "pending_foreman_review",
//   ...
// }
```

### 2. ไฟล์ที่สร้างใหม่

#### `services/receptionApiService.ts`
**จุดประสงค์:** Service สำหรับเรียก API เกี่ยวกับระบบรับซ่อม

**Methods:**

1. **createRepairRequest(data)** - สร้างใบแจ้งซ่อม
   ```typescript
   const result = await receptionApiService.createRepairRequest({
     customerData: {
       firstName: "สมชาย",
       lastName: "ใจดี",
       phone: "0812345678",
       address: "123 ถนนสุขุมวิท"
     },
     motorcycleData: {
       model: "Honda Wave 125i",
       color: "แดง",
       licensePlate: {
         line1: "กค",
         line2: "1234",
         province: "กรุงเทพมหานคร"
       }
     },
     symptoms: "เครื่องดังผิดปกติ",
     tags: ["เครื่องยนต์", "ควันผิดปกติ"],
     images: ["url1", "url2"],
     activityType: "แจ้งซ่อมครั้งแรก",
     isExistingCustomer: false,
     isNewMotorcycle: false,
     createdAt: new Date().toISOString(),
     status: "pending_foreman_review"
   })
   ```

2. **uploadImages(files)** - อัพโหลดรูปภาพ
   ```typescript
   const files = [file1, file2, file3]
   const urls = await receptionApiService.uploadImages(files)
   // urls = ["https://storage.../image1.jpg", "https://storage.../image2.jpg"]
   ```

3. **searchCustomers(query)** - ค้นหาลูกค้า
   ```typescript
   const results = await receptionApiService.searchCustomers("0812345678")
   // results = [{
   //   id: 1,
   //   firstName: "สมชาย",
   //   lastName: "ใจดี",
   //   phone: "0812345678",
   //   motorcycles: [...]
   // }]
   ```

4. **getRepairRequests()** - ดึงรายการใบแจ้งซ่อมทั้งหมด
   ```typescript
   const requests = await receptionApiService.getRepairRequests()
   ```

5. **getRepairRequestById(id)** - ดึงใบแจ้งซ่อมเฉพาะ ID
   ```typescript
   const request = await receptionApiService.getRepairRequestById("RH-009-1773169600006")
   ```

6. **createOrGetCustomer(data)** - สร้างหรือดึงลูกค้าที่มีอยู่
   ```typescript
   const result = await receptionApiService.createOrGetCustomer({
     firstName: "สมชาย",
     lastName: "ใจดี",
     phone: "0812345678",
     address: "123 ถนนสุขุมวิท"
   })
   // result = { id: 1, isNew: false }
   ```

7. **createOrGetMotorcycle(data)** - สร้างหรือดึงข้อมูลรถที่มีอยู่
   ```typescript
   const result = await receptionApiService.createOrGetMotorcycle({
     customerId: 1,
     model: "Honda Wave 125i",
     color: "แดง",
     plateLine1: "กค",
     plateLine2: "1234",
     province: "กรุงเทพมหานคร"
   })
   // result = { id: 1, isNew: false }
   ```

8. **sendForemanNotification(repairRequestId)** - ส่งแจ้งเตือนไป foreman
   ```typescript
   await receptionApiService.sendForemanNotification("RH-009-1773169600006")
   ```

## Flow การทำงานทั้งหมด

### Scenario 1: ลูกค้าใหม่ + รถใหม่ (แจ้งซ่อมครั้งแรก)
```
1. Reception เปิดหน้า ReceptionSearchPage
2. ค้นหาเบอร์โทร → ไม่พบ
3. กดปุ่ม "ลงทะเบียนลูกค้าใหม่"
4. กรอกข้อมูลใน ReceptionRegisterPage
   - ข้อมูลส่วนตัว: ชื่อ, นามสกุล, เบอร์โทร, ที่อยู่
   - ข้อมูลรถ: รุ่น, สี, ทะเบียน
5. กดปุ่ม "ถัดไป"
6. ไปหน้า ReceptionRepairPage
7. กรอกอาการและเลือกแท็ก
8. อัพโหลดรูปภาพ (ถ้ามี)
9. กดปุ่ม "ส่งใบแจ้งซ่อม"
10. Frontend:
    - Upload images → get URLs
    - Create repair request with activityType = "แจ้งซ่อมครั้งแรก"
11. Backend:
    - Create customer (NEW)
    - Create motorcycle (NEW)
    - Create repair request
    - Generate ID: RH-009-1773169600006
    - Send notification to foreman
12. Frontend navigate to success page
```

### Scenario 2: ลูกค้าเก่า + รถที่มีในระบบ
```
1. Reception ค้นหาเบอร์โทร → พบลูกค้า
2. แสดงรายการรถของลูกค้า
3. เลือกรถที่ต้องการแจ้งซ่อม
4. ไปหน้า ReceptionRepairPage (พร้อมข้อมูลลูกค้า + รถ)
5. กรอกอาการและเลือกแท็ก
6. กดปุ่ม "ส่งใบแจ้งซ่อม"
7. Frontend create repair request with activityType = "แจ้งซ่อมรถที่มีในระบบ"
8. Backend:
    - Use existing customer (no create)
    - Use existing motorcycle (no create)
    - Create repair request
    - Send notification to foreman
```

### Scenario 3: ลูกค้าเก่า + รถคันใหม่
```
1. Reception ค้นหาเบอร์โทร → พบลูกค้า
2. กดปุ่ม "เพิ่มรถยอดแจ้งซ่อมคันใหม่"
3. กรอกข้อมูลรถคันใหม่ใน ReceptionRegisterPage
4. ไปหน้า ReceptionRepairPage
5. กรอกอาการและเลือกแท็ก
6. กดปุ่ม "ส่งใบแจ้งซ่อม"
7. Frontend create repair request with activityType = "แจ้งซ่อมรถคันใหม่"
8. Backend:
    - Use existing customer (no create)
    - Create motorcycle (NEW)
    - Create repair request
    - Send notification to foreman
```

## Data Structure

### RepairRequestDTO (ส่งไป backend)
```typescript
{
  // Customer (ถ้ามี customerId ให้ใช้ customer ที่มีอยู่)
  customerId?: number,
  customerData: {
    firstName: string,
    lastName: string,
    phone: string,
    address: string
  },
  
  // Motorcycle (ถ้ามี motorcycleId ให้ใช้รถที่มีอยู่)
  motorcycleId?: number,
  motorcycleData: {
    model: string,
    color: string,
    licensePlate: {
      line1: string,
      line2: string,
      province: string
    }
  },
  
  // Repair details
  symptoms: string,
  tags: string[],
  images: string[], // URLs after upload
  
  // Context
  activityType: 'แจ้งซ่อมครั้งแรก' | 'แจ้งซ่อมรถที่มีในระบบ' | 'แจ้งซ่อมรถคันใหม่',
  isExistingCustomer: boolean,
  isNewMotorcycle: boolean,
  
  // Metadata
  createdAt: string, // ISO timestamp
  status: 'pending_foreman_review'
}
```

### RepairRequestResponse (ได้จาก backend)
```typescript
{
  id: string, // "RH-009-1773169600006"
  customerId: number,
  motorcycleId: number,
  symptoms: string,
  tags: string[],
  images: string[],
  status: 'pending_foreman_review' | 'assigned_to_technician' | 'in_progress' | 'completed',
  queueNumber: number, // 9
  createdAt: string,
  updatedAt: string,
  assignedForemanId?: number,
  assignedTechnicianId?: number
}
```

## การทดสอบระหว่างรอ Backend

### Mock การอัพโหลดรูป:
```typescript
// ใน ReceptionRepairPage.tsx, แทน upload จริงด้วย mock
const mockUploadImages = async (files: File[]): Promise<string[]> => {
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Return mock URLs
  return files.map((file, index) => 
    `https://mock-storage.example.com/repair-${Date.now()}-${index}.jpg`
  )
}

// ใช้แทน:
// const uploadedUrls = await receptionApiService.uploadImages(imageFiles)
const uploadedUrls = await mockUploadImages(imageFiles)
```

### Mock การสร้าง Repair Request:
```typescript
const mockCreateRepairRequest = async (data: RepairRequestDTO): Promise<RepairRequestResponse> => {
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const queueNumber = Math.floor(Math.random() * 100) + 1
  const timestamp = Date.now()
  
  return {
    id: `RH-${queueNumber.toString().padStart(3, '0')}-${timestamp}`,
    customerId: 1,
    motorcycleId: 1,
    symptoms: data.symptoms,
    tags: data.tags,
    images: data.images || [],
    status: 'pending_foreman_review',
    queueNumber,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

// ใช้แทน:
// const result = await receptionApiService.createRepairRequest(repairRequestData)
const result = await mockCreateRepairRequest(repairRequestData)
```

## Checklist สำหรับเชื่อมต่อ Backend

### Phase 1: Customer & Motorcycle APIs
- [ ] Backend implement POST /api/reception/customers
- [ ] Backend implement POST /api/reception/motorcycles
- [ ] Backend implement GET /api/reception/customers/search
- [ ] Frontend: Test search functionality
- [ ] Frontend: Test duplicate detection

### Phase 2: Image Upload
- [ ] Backend setup cloud storage (AWS S3, Google Cloud Storage)
- [ ] Backend implement POST /api/reception/upload-images
- [ ] Frontend: Uncomment image upload code in ReceptionRepairPage.tsx
- [ ] Test upload with various file sizes and types

### Phase 3: Repair Request Creation
- [ ] Backend implement POST /api/reception/repair-requests
- [ ] Backend implement ID generation (RH-XXX-XXXXXX)
- [ ] Backend implement notification to foreman
- [ ] Frontend: Uncomment createRepairRequest call
- [ ] Frontend: Uncomment methods in receptionApiService.ts
- [ ] Test end-to-end workflow

### Phase 4: History & Details
- [ ] Backend implement GET /api/reception/repair-requests
- [ ] Backend implement GET /api/reception/repair-requests/{id}
- [ ] Frontend: Update ReceptionHistoryPage to use API
- [ ] Frontend: Update ReceptionHistoryDetailPage to use API
- [ ] Test viewing history and details

## สรุปไฟล์ที่ต้อง Uncomment

### 1. `ReceptionRepairPage.tsx`
```typescript
// บรรทัดที่ ~150-170: Uncomment image upload
if (images.length > 0) {
    const imageFiles = await Promise.all(
        images.map(async (img) => {
            const response = await fetch(img.url)
            const blob = await response.blob()
            return new File([blob], img.name, { type: blob.type })
        })
    )
    const uploadedUrls = await receptionApiService.uploadImages(imageFiles)
    repairRequestData.images = uploadedUrls
}

// บรรทัดที่ ~172-177: Uncomment repair request creation
const result = await receptionApiService.createRepairRequest(repairRequestData)
console.log('Repair request created:', result)
```

### 2. `services/receptionApiService.ts`
Uncomment ทุก method body (ลบ `throw new Error(...)` และ uncomment fetch calls)

## Environment Variables

เพิ่มใน `.env`:
```
VITE_API_URL=http://localhost:3000/api
VITE_STORAGE_URL=https://storage.example.com
```

## Error Handling

### ตัวอย่าง Error Responses:
```typescript
// Validation Error
{
  error: "VALIDATION_ERROR",
  message: "เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก",
  field: "phone"
}

// Duplicate Customer
{
  error: "DUPLICATE_CUSTOMER",
  message: "มีเบอร์โทรศัพท์นี้ในระบบแล้ว",
  existingCustomerId: 1
}

// File Too Large
{
  error: "FILE_TOO_LARGE",
  message: "ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB"
}
```

### การจัดการ Error ใน Frontend:
```typescript
try {
  const result = await receptionApiService.createRepairRequest(data)
  // Success
} catch (error: any) {
  if (error.response) {
    const { error: errorCode, message } = error.response.data
    
    switch (errorCode) {
      case 'VALIDATION_ERROR':
        alert(`ข้อมูลไม่ถูกต้อง: ${message}`)
        break
      case 'DUPLICATE_CUSTOMER':
        alert('มีลูกค้านี้ในระบบแล้ว')
        break
      case 'FILE_TOO_LARGE':
        alert('ไฟล์รูปภาพมีขนาดใหญ่เกินไป')
        break
      default:
        alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    }
  } else {
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต')
  }
}
```

## หมายเหตุ

1. **ID Format**: RH-{queueNumber}-{timestamp}
   - RH = Repair History
   - queueNumber = เลขคิวประจำวัน (001, 002, 003, ...)
   - timestamp = Unix timestamp

2. **Queue Number**: เริ่มนับใหม่ทุกวัน (001 → 002 → 003 → ...)

3. **Activity Type**:
   - "แจ้งซ่อมครั้งแรก" = ลูกค้าใหม่ + รถใหม่
   - "แจ้งซ่อมรถที่มีในระบบ" = ลูกค้าเก่า + รถเก่า
   - "แจ้งซ่อมรถคันใหม่" = ลูกค้าเก่า + รถใหม่

4. **Status Flow**:
   - pending_foreman_review (รอหัวหน้าช่างตรวจสอบ)
   - assigned_to_technician (มอบหมายช่างแล้ว)
   - in_progress (กำลังซ่อม)
   - completed (เสร็จสิ้น)

5. **Image Storage**:
   - ควรใช้ cloud storage (AWS S3, Google Cloud Storage)
   - Upload ผ่าน presigned URL เพื่อความเร็ว
   - Max 10 images per request
   - Max 5MB per image

## เอกสารเพิ่มเติม

ดูรายละเอียดเต็มได้ที่:
- `docs/RECEPTION_BACKEND_GUIDE.md` - คู่มือสำหรับ Backend Team
- `services/receptionApiService.ts` - API Service documentation
