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
