# Backend Guide — Smart Moto Service Center

---

# Purchase Order Backend Integration Guide

## Overview
This guide explains the structure and workflow for integrating the Purchase Order frontend with backend/database.

## Workflow

### 1. Creating Purchase Order (Employee/Staff)
```
Frontend (CreatePurchaseOrderPage.tsx)
  ↓
  ↓ User fills form and clicks "ส่งคำขอสั่งซื้อ"
  ↓
POST /api/purchase-orders
  {
    "supplierId": 1,
    "deliveryDate": "2026-03-15",
    "totalAmount": 5000,
    "status": "pending",  // สถานะเริ่มต้นเป็น "รออนุมัติ"
    "remarks": "...",
    "managerMessage": "...",
    "items": [...]
  }
  ↓
Backend creates PO record with status="pending"
  ↓
Backend sends notification to Owner role
  ↓
Response: Created PO object
  ↓
Frontend navigates to PurchaseOrdersPage
```

### 2. Owner Approval/Rejection
```
Owner receives notification
  ↓
Owner views PO details
  ↓
Owner clicks "อนุมัติ" or "ไม่อนุมัติ"
  ↓
PATCH /api/purchase-orders/{id}/status
  {
    "status": "approved", // or "rejected"
    "ownerComment": "...",
    "rejectionReason": "..." // only if rejected
  }
  ↓
Backend updates PO status
  ↓
Backend sends WebSocket notification to all connected clients
  ↓
Frontend receives real-time update
  ↓
PurchaseOrdersPage automatically updates:
  - Add order ID to unreadStatusChanges
  - Re-sort orders (status-changed orders jump to top)
  - Apply background color (green for approved, red for rejected)
```

### 3. Viewing Updated Order
```
User clicks "ดูรายละเอียด" on highlighted order
  ↓
markVisited(orderId) is called
  ↓
orderId is removed from unreadStatusChanges
  ↓
Background color disappears
  ↓
localStorage is updated
```

## Database Schema

### PurchaseOrder Table
```sql
CREATE TABLE purchase_orders (
  id VARCHAR(50) PRIMARY KEY,
  supplier_id INT NOT NULL,
  supplier_name VARCHAR(255) NOT NULL,
  created_at DATE NOT NULL,
  delivery_date DATE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('draft', 'pending', 'approved', 'rejected', 'cancelled') NOT NULL,
  remarks TEXT,
  manager_message TEXT,
  owner_comment TEXT,
  rejection_reason TEXT,
  created_by_user_id INT NOT NULL,
  approved_by_user_id INT,
  approved_at TIMESTAMP,
  created_at_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  FOREIGN KEY (created_by_user_id) REFERENCES users(id),
  FOREIGN KEY (approved_by_user_id) REFERENCES users(id)
);

CREATE TABLE purchase_order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  purchase_order_id VARCHAR(50) NOT NULL,
  part_id INT NOT NULL,
  part_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (part_id) REFERENCES parts(id)
);

CREATE INDEX idx_po_status ON purchase_orders(status);
CREATE INDEX idx_po_created_at ON purchase_orders(created_at_timestamp);
CREATE INDEX idx_po_created_by ON purchase_orders(created_by_user_id);
```

### Notification Table (Optional)
```sql
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'purchase_order_approval_request', 'purchase_order_status_changed'
  related_id VARCHAR(50), -- PO ID
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## API Endpoints

### 1. Create Purchase Order
```
POST /api/purchase-orders
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "supplierId": number,
  "deliveryDate": string (ISO date),
  "totalAmount": number,
  "status": "draft" | "pending",
  "remarks": string | null,
  "managerMessage": string | null,
  "items": [
    {
      "partId": number,
      "partName": string,
      "quantity": number,
      "unitPrice": number,
      "totalPrice": number
    }
  ]
}

Response: 201 Created
{
  "id": "PO-20260311-001",
  "supplierId": 1,
  "supplierName": "ABC Supply Co.",
  "createdAt": "2026-03-11",
  "deliveryDate": "2026-03-15",
  "totalAmount": 5000,
  "status": "pending",
  "items": [...],
  "remarks": "...",
  "managerMessage": "..."
}
```

### 2. Get All Purchase Orders
```
GET /api/purchase-orders
Authorization: Bearer {token}

Query Parameters (optional):
- status: string (filter by status)
- supplierId: number (filter by supplier)
- dateFrom: string (filter by date range)
- dateTo: string (filter by date range)

Response: 200 OK
[
  {
    "id": "PO-20260311-001",
    "supplierId": 1,
    "supplierName": "ABC Supply Co.",
    "createdAt": "2026-03-11",
    "deliveryDate": "2026-03-15",
    "totalAmount": 5000,
    "status": "pending",
    "items": [...],
    ...
  }
]
```

### 3. Get Purchase Order by ID
```
GET /api/purchase-orders/{id}
Authorization: Bearer {token}

Response: 200 OK
{
  "id": "PO-20260311-001",
  "supplierId": 1,
  "supplierName": "ABC Supply Co.",
  "createdAt": "2026-03-11",
  "deliveryDate": "2026-03-15",
  "totalAmount": 5000,
  "status": "pending",
  "items": [...],
  "remarks": "...",
  "managerMessage": "...",
  "ownerComment": null,
  "rejectionReason": null,
  "createdBy": {
    "id": 1,
    "name": "John Doe"
  },
  "approvedBy": null,
  "approvedAt": null
}
```

### 4. Update Purchase Order Status (Owner only)
```
PATCH /api/purchase-orders/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "status": "approved" | "rejected",
  "ownerComment": string (optional),
  "rejectionReason": string (required if status is rejected)
}

Response: 200 OK
{
  "id": "PO-20260311-001",
  "status": "approved",
  "ownerComment": "Approved for purchase",
  "approvedBy": {
    "id": 2,
    "name": "Owner Name"
  },
  "approvedAt": "2026-03-11T10:30:00Z",
  ...
}

Side Effects:
1. Updates PO status in database
2. Sends WebSocket notification to all connected clients
3. Creates notification record for the PO creator
```

### 5. Cancel Purchase Order
```
POST /api/purchase-orders/{id}/cancel
Authorization: Bearer {token}

Response: 200 OK
{
  "id": "PO-20260311-001",
  "status": "cancelled",
  ...
}

Note: Only orders with status "pending" can be cancelled
```

### 6. Send Approval Notification (Internal)
```
POST /api/notifications/purchase-order-approval
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "orderId": "PO-20260311-001",
  "recipientRole": "owner",
  "type": "purchase_order_approval_request"
}

Response: 200 OK
{
  "success": true,
  "notificationId": 123
}
```

## WebSocket Events

### Connection
```javascript
const ws = new WebSocket('ws://localhost:3000/ws?token={auth_token}')

// Subscribe to purchase order status changes
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'purchase_orders.status_changes'
}))
```

### Status Change Event
```javascript
ws.onmessage = (event) => {
  const message = JSON.parse(event.data)
  
  if (message.type === 'purchase_order.status_changed') {
    // {
    //   type: 'purchase_order.status_changed',
    //   data: {
    //     orderId: 'PO-20260311-001',
    //     previousStatus: 'pending',
    //     newStatus: 'approved',
    //     changedBy: 'Owner Name',
    //     changedAt: '2026-03-11T10:30:00Z',
    //     ownerComment: 'Approved for purchase'
    //   }
    // }
  }
}
```

## Frontend Files Modified/Created

### Modified Files:
1. **CreatePurchaseOrderPage.tsx**
   - Changed `handleSubmit` to `async`
   - Prepared API call structure (commented out)
   - Added error handling
   - Added notification message for pending status

2. **PurchaseOrdersPage.tsx**
   - Added `unreadStatusChanges` state
   - Added sorting logic (unread items first, then by date)
   - Added background colors for status changes
   - Added logic to detect status changes (commented out)
   - Modified `markVisited` to clear unread status

### Created Files:
1. **purchaseOrderApiService.ts**
   - API service for CRUD operations
   - All methods prepared with TODO comments
   - Mock implementations that throw errors

2. **purchaseOrderWebSocketService.ts**
   - WebSocket service for real-time notifications
   - Connection management
   - Reconnection logic
   - Event subscription system
   - Mock implementation ready

3. **PURCHASE_ORDER_BACKEND_GUIDE.md** (this file)
   - Complete documentation
   - API specifications
   - Database schema
   - Integration guide

## Implementation Steps for Backend Team

### Phase 1: Basic CRUD
1. Create database tables (purchase_orders, purchase_order_items)
2. Implement POST /api/purchase-orders
3. Implement GET /api/purchase-orders
4. Implement GET /api/purchase-orders/{id}
5. Test with frontend (uncomment API calls in CreatePurchaseOrderPage.tsx)

### Phase 2: Status Management
1. Implement PATCH /api/purchase-orders/{id}/status
2. Add authorization check (only owner role can approve/reject)
3. Implement POST /api/purchase-orders/{id}/cancel
4. Test status flow

### Phase 3: Notifications
1. Create notifications table
2. Implement POST /api/notifications/purchase-order-approval
3. Implement notification delivery system
4. Test notification flow

### Phase 4: Real-time Updates
1. Set up WebSocket server
2. Implement WebSocket authentication
3. Implement channel subscription
4. Emit status change events when PATCH /api/purchase-orders/{id}/status is called
5. Test real-time updates with frontend

### Phase 5: Frontend Integration
1. Uncomment API calls in purchaseOrderApiService.ts
2. Uncomment WebSocket logic in purchaseOrderWebSocketService.ts
3. Uncomment status change detection in PurchaseOrdersPage.tsx
4. Create React hook for WebSocket notifications
5. Test end-to-end workflow

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000/ws
```

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/smart_moto
JWT_SECRET=your-secret-key
PORT=3000
```

## Testing Checklist

### Manual Testing:
- [ ] Create draft PO → saves as draft
- [ ] Create pending PO → status is "pending"
- [ ] Create pending PO → owner receives notification
- [ ] Owner approves PO → status changes to "approved"
- [ ] Owner rejects PO → status changes to "rejected"
- [ ] PO with status change → appears at top with green/red background
- [ ] Click to view PO → background disappears
- [ ] Cancel pending PO → status changes to "cancelled"
- [ ] Draft PO → can edit
- [ ] Approved/Rejected PO → cannot edit or cancel

### WebSocket Testing:
- [ ] Connect to WebSocket → connection established
- [ ] Subscribe to channel → subscription confirmed
- [ ] Status changes → notification received in real-time
- [ ] Multiple clients → all receive notifications
- [ ] Disconnect/Reconnect → auto-reconnect works

## Security Considerations

1. **Authentication**: All API calls require valid JWT token
2. **Authorization**: 
   - Only owner role can approve/reject
   - Only creator can cancel (if pending)
   - Only authenticated users can view POs
3. **Validation**:
   - Validate supplier exists
   - Validate parts exist
   - Validate quantities > 0
   - Validate dates (delivery date > today)
4. **WebSocket**:
   - Authenticate WebSocket connections
   - Validate subscriptions
   - Rate limit connections

## Performance Considerations

1. **Pagination**: Implement pagination for GET /api/purchase-orders (limit 50 per page)
2. **Caching**: Cache supplier and part data
3. **Indexing**: Add database indexes on status, created_at, supplier_id
4. **WebSocket**: Limit connections per user, use heartbeat to detect stale connections

## Error Handling

### Common Error Responses:
```json
400 Bad Request
{
  "error": "VALIDATION_ERROR",
  "message": "Delivery date must be in the future",
  "field": "deliveryDate"
}

401 Unauthorized
{
  "error": "UNAUTHORIZED",
  "message": "Invalid or expired token"
}

403 Forbidden
{
  "error": "FORBIDDEN",
  "message": "Only owner can approve/reject purchase orders"
}

404 Not Found
{
  "error": "NOT_FOUND",
  "message": "Purchase order not found"
}

409 Conflict
{
  "error": "CONFLICT",
  "message": "Cannot cancel order with status 'approved'"
}

500 Internal Server Error
{
  "error": "INTERNAL_ERROR",
  "message": "An unexpected error occurred"
}
```

## Contact

For questions about frontend integration, contact: [Frontend Team]
For questions about backend implementation, contact: [Backend Team]

---

# Reception System Backend Integration Guide

## Overview
This guide explains the structure and workflow for integrating the Reception frontend with backend/database. The reception system handles customer registration, motorcycle registration, and repair request submissions.

## Workflow

### 1. Customer Search & Selection
```
Frontend (ReceptionSearchPage.tsx)
  ↓
  ↓ User searches by phone or name
  ↓
GET /api/reception/customers/search?q={query}
  ↓
Backend searches customers and their motorcycles
  ↓
Response: List of matching customers with motorcycles
  ↓
Frontend shows results:
  - "ลูกค้าเก่า" (Existing customer) - select motorcycle
  - "เพิ่มรถยอดแจ้งซ่อมคันใหม่" (Add new motorcycle)
  - "ลงทะเบียนลูกค้าใหม่" (New customer registration)
```

### 2. New Customer Registration
```
Frontend (ReceptionRegisterPage.tsx)
  ↓
  ↓ User fills customer & motorcycle data
  ↓
  ↓ Validation: Thai/English names, 10-digit phone, no duplicates
  ↓
Navigate to ReceptionRepairPage (data in state)
  ↓
Continue to repair request...
```

### 3. Repair Request Submission
```
Frontend (ReceptionRepairPage.tsx)
  ↓
  ↓ User fills symptoms, tags, uploads images
  ↓
  ↓ Clicks "ส่งใบแจ้งซ่อม"
  ↓
Step 1: Upload images (if any)
POST /api/reception/upload-images
  {
    files: FormData with images
  }
  ↓
Response: { urls: ["url1", "url2", ...] }
  ↓
Step 2: Create repair request
POST /api/reception/repair-requests
  {
    customerData: {...},
    motorcycleData: {...},
    symptoms: "...",
    tags: [...],
    images: [...],
    activityType: "...",
    status: "pending_foreman_review"
  }
  ↓
Backend:
  1. Create/get customer
  2. Create/get motorcycle
  3. Create repair request record
  4. Generate queue number
  5. Send notification to foreman role
  ↓
Response: Created repair request with ID and queue
  ↓
Frontend navigates to success page
```

### 4. Foreman Notification
```
Backend sends notification after repair request created
  ↓
POST /api/notifications/foreman-repair-request
  {
    repairRequestId: "RH-XXX-XXXXXX",
    recipientRole: "foreman",
    type: "new_repair_request"
  }
  ↓
Foreman receives notification (Email, LINE, App)
  ↓
Foreman reviews and assigns to technician
  ↓
Status changes: pending_foreman_review → assigned_to_technician
```

## Database Schema

### Customers Table
```sql
CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(10) NOT NULL UNIQUE,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone (phone),
  INDEX idx_name (first_name, last_name)
);
```

### Motorcycles Table
```sql
CREATE TABLE motorcycles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  model VARCHAR(100) NOT NULL,
  color VARCHAR(50) NOT NULL,
  plate_line1 VARCHAR(10) NOT NULL,
  plate_line2 VARCHAR(10) NOT NULL,
  province VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  UNIQUE KEY unique_license_plate (plate_line1, plate_line2, province),
  INDEX idx_customer (customer_id),
  INDEX idx_license_plate (plate_line1, plate_line2, province)
);
```

### Repair Requests Table
```sql
CREATE TABLE repair_requests (
  id VARCHAR(50) PRIMARY KEY, -- RH-XXX-XXXXXX format
  customer_id INT NOT NULL,
  motorcycle_id INT NOT NULL,
  symptoms TEXT NOT NULL,
  tags JSON NOT NULL, -- ["เครื่องยนต์", "ระบบเบรก"]
  images JSON, -- ["url1", "url2", ...]
  status ENUM(
    'pending_foreman_review',
    'assigned_to_technician',
    'in_progress',
    'completed',
    'cancelled'
  ) NOT NULL DEFAULT 'pending_foreman_review',
  queue_number INT NOT NULL,
  activity_type ENUM(
    'แจ้งซ่อมครั้งแรก',
    'แจ้งซ่อมรถที่มีในระบบ',
    'แจ้งซ่อมรถคันใหม่'
  ) NOT NULL,
  is_existing_customer BOOLEAN NOT NULL,
  is_new_motorcycle BOOLEAN NOT NULL,
  created_by_user_id INT NOT NULL,
  assigned_foreman_id INT,
  assigned_technician_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  assigned_at TIMESTAMP,
  completed_at TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (motorcycle_id) REFERENCES motorcycles(id),
  FOREIGN KEY (created_by_user_id) REFERENCES users(id),
  FOREIGN KEY (assigned_foreman_id) REFERENCES users(id),
  FOREIGN KEY (assigned_technician_id) REFERENCES users(id),
  INDEX idx_status (status),
  INDEX idx_queue (queue_number),
  INDEX idx_customer (customer_id),
  INDEX idx_created_at (created_at)
);
```

### Repair Request Images Table (Alternative to JSON)
```sql
CREATE TABLE repair_request_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  repair_request_id VARCHAR(50) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  image_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (repair_request_id) REFERENCES repair_requests(id) ON DELETE CASCADE,
  INDEX idx_repair_request (repair_request_id)
);
```

### Repair Request Tags Table (Alternative to JSON)
```sql
CREATE TABLE repair_request_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  repair_request_id VARCHAR(50) NOT NULL,
  tag_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (repair_request_id) REFERENCES repair_requests(id) ON DELETE CASCADE,
  INDEX idx_repair_request (repair_request_id),
  INDEX idx_tag_name (tag_name)
);
```

## API Endpoints

### 1. Search Customers
```
GET /api/reception/customers/search?q={query}
Authorization: Bearer {token}

Query Parameters:
- q: string (search by phone or name)

Response: 200 OK
[
  {
    "id": 1,
    "firstName": "สมชาย",
    "lastName": "ใจดี",
    "phone": "0812345678",
    "address": "123 ถนนสุขุมวิท กรุงเทพฯ",
    "motorcycles": [
      {
        "id": 1,
        "model": "Honda Wave 125i",
        "color": "แดง",
        "plateLine1": "กค",
        "plateLine2": "1234",
        "province": "กรุงเทพมหานคร"
      }
    ]
  }
]
```

### 2. Create/Get Customer
```
POST /api/reception/customers
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "firstName": "สมชาย",
  "lastName": "ใจดี",
  "phone": "0812345678",
  "address": "123 ถนนสุขุมวิท กรุงเทพฯ"
}

Response: 200 OK (existing) or 201 Created (new)
{
  "id": 1,
  "isNew": false, // true if newly created, false if existing
  "firstName": "สมชาย",
  "lastName": "ใจดี",
  "phone": "0812345678",
  "address": "123 ถนนสุขุมวิท กรุงเทพฯ"
}

Note: If customer with same phone exists, return existing customer
```

### 3. Create/Get Motorcycle
```
POST /api/reception/motorcycles
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "customerId": 1,
  "model": "Honda Wave 125i",
  "color": "แดง",
  "plateLine1": "กค",
  "plateLine2": "1234",
  "province": "กรุงเทพมหานคร"
}

Response: 200 OK (existing) or 201 Created (new)
{
  "id": 1,
  "isNew": false, // true if newly created, false if existing
  "customerId": 1,
  "model": "Honda Wave 125i",
  "color": "แดง",
  "plateLine1": "กค",
  "plateLine2": "1234",
  "province": "กรุงเทพมหานคร"
}

Note: If motorcycle with same license plate exists, return existing motorcycle
```

### 4. Upload Images
```
POST /api/reception/upload-images
Authorization: Bearer {token}
Content-Type: multipart/form-data

Request Body: FormData
- images: File[] (multiple image files)

Response: 200 OK
{
  "urls": [
    "https://storage.example.com/images/repair-request-1-image-1.jpg",
    "https://storage.example.com/images/repair-request-1-image-2.jpg"
  ]
}

Notes:
- Accepted formats: JPEG, PNG
- Max file size: 5MB per image
- Max images: 10 per request
- Images stored in cloud storage (AWS S3, Google Cloud Storage, etc.)
```

### 5. Create Repair Request
```
POST /api/reception/repair-requests
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "customerId": 1, // Optional if customerData provided
  "customerData": {
    "firstName": "สมชาย",
    "lastName": "ใจดี",
    "phone": "0812345678",
    "address": "123 ถนนสุขุมวิท กรุงเทพฯ"
  },
  "motorcycleId": 1, // Optional if motorcycleData provided
  "motorcycleData": {
    "model": "Honda Wave 125i",
    "color": "แดง",
    "licensePlate": {
      "line1": "กค",
      "line2": "1234",
      "province": "กรุงเทพมหานคร"
    }
  },
  "symptoms": "เครื่องดังผิดปกติ มีควันขาวออกจากท่อ",
  "tags": ["เครื่องยนต์", "ควันผิดปกติ"],
  "images": [
    "https://storage.example.com/images/repair-request-1-image-1.jpg",
    "https://storage.example.com/images/repair-request-1-image-2.jpg"
  ],
  "activityType": "แจ้งซ่อมครั้งแรก",
  "isExistingCustomer": false,
  "isNewMotorcycle": false,
  "status": "pending_foreman_review"
}

Response: 201 Created
{
  "id": "RH-009-1773169600006",
  "customerId": 1,
  "motorcycleId": 1,
  "symptoms": "เครื่องดังผิดปกติ มีควันขาวออกจากท่อ",
  "tags": ["เครื่องยนต์", "ควันผิดปกติ"],
  "images": ["url1", "url2"],
  "status": "pending_foreman_review",
  "queueNumber": 9,
  "activityType": "แจ้งซ่อมครั้งแรก",
  "isExistingCustomer": false,
  "isNewMotorcycle": false,
  "createdAt": "2026-03-11T10:30:00Z",
  "updatedAt": "2026-03-11T10:30:00Z"
}

Side Effects:
1. Creates/gets customer if not exists
2. Creates/gets motorcycle if not exists
3. Creates repair request record
4. Generates unique ID (RH-{queueNumber}-{timestamp})
5. Auto-increments queue number
6. Sends notification to foreman role
```

### 6. Get All Repair Requests
```
GET /api/reception/repair-requests
Authorization: Bearer {token}

Query Parameters (optional):
- status: string (filter by status)
- customerId: number (filter by customer)
- dateFrom: string (filter by date range)
- dateTo: string (filter by date range)

Response: 200 OK
[
  {
    "id": "RH-009-1773169600006",
    "customerId": 1,
    "customerName": "สมชาย ใจดี",
    "motorcycleId": 1,
    "motorcycleModel": "Honda Wave 125i",
    "licensePlate": "กค 1234 กรุงเทพมหานคร",
    "symptoms": "เครื่องดังผิดปกติ",
    "tags": ["เครื่องยนต์"],
    "images": ["url1", "url2"],
    "status": "pending_foreman_review",
    "queueNumber": 9,
    "createdAt": "2026-03-11T10:30:00Z"
  }
]
```

### 7. Get Repair Request by ID
```
GET /api/reception/repair-requests/{id}
Authorization: Bearer {token}

Response: 200 OK
{
  "id": "RH-009-1773169600006",
  "customer": {
    "id": 1,
    "firstName": "สมชาย",
    "lastName": "ใจดี",
    "phone": "0812345678",
    "address": "123 ถนนสุขุมวิท กรุงเทพฯ"
  },
  "motorcycle": {
    "id": 1,
    "model": "Honda Wave 125i",
    "color": "แดง",
    "plateLine1": "กค",
    "plateLine2": "1234",
    "province": "กรุงเทพมหานคร"
  },
  "symptoms": "เครื่องดังผิดปกติ มีควันขาวออกจากท่อ",
  "tags": ["เครื่องยนต์", "ควันผิดปกติ"],
  "images": ["url1", "url2"],
  "status": "pending_foreman_review",
  "queueNumber": 9,
  "activityType": "แจ้งซ่อมครั้งแรก",
  "createdBy": {
    "id": 3,
    "name": "Reception User"
  },
  "assignedForeman": null,
  "assignedTechnician": null,
  "createdAt": "2026-03-11T10:30:00Z",
  "updatedAt": "2026-03-11T10:30:00Z",
  "assignedAt": null,
  "completedAt": null
}
```

### 8. Send Foreman Notification (Internal)
```
POST /api/notifications/foreman-repair-request
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "repairRequestId": "RH-009-1773169600006",
  "recipientRole": "foreman",
  "type": "new_repair_request"
}

Response: 200 OK
{
  "success": true,
  "notificationId": 123
}
```

## Frontend Files Structure

### Modified Files:
1. **ReceptionRepairPage.tsx**
   - Changed `handleSubmit` to `async function`
   - Added API call structure (commented out)
   - Prepared `RepairRequestDTO` data
   - Added error handling with try-catch
   - Added TODO comments for image upload

### Created Files:
1. **services/receptionApiService.ts**
   - Complete API service for reception operations
   - Methods: createRepairRequest, searchCustomers, uploadImages, etc.
   - All methods have TODO comments
   - Mock implementations that throw errors

## Implementation Steps for Backend Team

### Phase 1: Database Setup
1. Create tables: customers, motorcycles, repair_requests
2. Add foreign key constraints
3. Add indexes for performance
4. Set up auto-increment for queue_number

### Phase 2: Customer & Motorcycle APIs
1. Implement POST /api/reception/customers (create/get)
2. Implement POST /api/reception/motorcycles (create/get)
3. Implement GET /api/reception/customers/search
4. Add validation and duplicate checking
5. Test with frontend

### Phase 3: Image Upload
1. Set up cloud storage (AWS S3, Google Cloud Storage, etc.)
2. Implement POST /api/reception/upload-images
3. Add file validation (type, size)
4. Return uploaded URLs
5. Test with frontend

### Phase 4: Repair Request API
1. Implement POST /api/reception/repair-requests
2. Generate unique ID format: RH-{queueNumber}-{timestamp}
3. Auto-increment queue number
4. Link customer, motorcycle, and request
5. Test with frontend

### Phase 5: Notifications
1. Implement POST /api/notifications/foreman-repair-request
2. Send to foreman role via Email/LINE/App
3. Test notification delivery

### Phase 6: History & Status Management
1. Implement GET /api/reception/repair-requests
2. Implement GET /api/reception/repair-requests/{id}
3. Add filtering and pagination
4. Implement status update endpoints (for foreman)

### Phase 7: Frontend Integration
1. Uncomment API calls in ReceptionRepairPage.tsx
2. Uncomment methods in receptionApiService.ts
3. Test end-to-end workflow
4. Add loading states and error handling

## Queue Number Generation

### Logic:
```typescript
// Backend implementation example
async function generateRepairRequestId(): Promise<{ id: string; queueNumber: number }> {
  // Get today's count for queue number
  const today = new Date().toISOString().split('T')[0]
  const count = await db.repairRequests.count({
    where: {
      createdAt: {
        gte: new Date(today)
      }
    }
  })
  
  const queueNumber = count + 1
  const timestamp = Date.now()
  const id = `RH-${queueNumber.toString().padStart(3, '0')}-${timestamp}`
  
  return { id, queueNumber }
}
```

## Validation Rules

### Customer Data:
- **firstName**: Required, Thai/English only, no numbers/special chars
- **lastName**: Required, Thai/English only, no numbers/special chars
- **phone**: Required, exactly 10 digits, unique
- **address**: Optional, any characters

### Motorcycle Data:
- **model**: Required
- **color**: Required, Thai/English only
- **plateLine1**: Required, 1-4 characters, no leading zeros
- **plateLine2**: Required, 1-4 characters, no leading zeros
- **province**: Required
- **Unique constraint**: (plateLine1 + plateLine2 + province)

### Repair Request Data:
- **symptoms**: Required, min 10 characters
- **tags**: Required, at least 1 tag
- **images**: Optional, max 10 images, max 5MB each

## Error Handling

### Common Error Responses:
```json
400 Bad Request - Validation Error
{
  "error": "VALIDATION_ERROR",
  "message": "เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก",
  "field": "phone"
}

400 Bad Request - Duplicate Customer
{
  "error": "DUPLICATE_CUSTOMER",
  "message": "มีเบอร์โทรศัพท์นี้ในระบบแล้ว",
  "existingCustomerId": 1
}

400 Bad Request - Duplicate Motorcycle
{
  "error": "DUPLICATE_MOTORCYCLE",
  "message": "มีทะเบียนรถนี้ในระบบแล้ว",
  "existingMotorcycleId": 1
}

413 Payload Too Large
{
  "error": "FILE_TOO_LARGE",
  "message": "ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB"
}

415 Unsupported Media Type
{
  "error": "INVALID_FILE_TYPE",
  "message": "รองรับเฉพาะไฟล์ JPEG และ PNG เท่านั้น"
}

500 Internal Server Error
{
  "error": "INTERNAL_ERROR",
  "message": "เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง"
}
```

## Testing Checklist

### Manual Testing:
- [ ] Search existing customer → found with motorcycles
- [ ] Search non-existing customer → empty result
- [ ] Register new customer → success
- [ ] Register duplicate phone → error
- [ ] Add new motorcycle → success
- [ ] Add duplicate license plate → error
- [ ] Upload images → success with URLs
- [ ] Upload large image → error
- [ ] Create repair request (new customer) → success
- [ ] Create repair request (existing customer) → success
- [ ] Foreman receives notification → success
- [ ] View repair request history → all data displayed
- [ ] View repair request detail → complete information

## Security Considerations

1. **Authentication**: All API calls require valid JWT token
2. **Authorization**: 
   - Reception staff can create repair requests
   - Foreman can view and assign
   - Technician can view assigned tasks
3. **File Upload**:
   - Validate file type (JPEG, PNG only)
   - Validate file size (max 5MB)
   - Scan for malware
   - Store in private bucket
4. **Data Privacy**:
   - Encrypt sensitive data (phone, address)
   - HTTPS only
   - Rate limiting on search endpoint

## Performance Considerations

1. **Image Upload**: Use direct upload to cloud storage (presigned URL)
2. **Search**: Add full-text search index on customer names
3. **Pagination**: Limit 50 records per page for history
4. **Caching**: Cache customer/motorcycle lookups
5. **Database**: Use connection pooling

## Contact

For questions about reception frontend integration, contact: [Frontend Team]
For questions about backend implementation, contact: [Backend Team]

---

# Reception Folder Structure - Complete Setup Guide

## 📁 โครงสร้าง Folder ที่สร้างแล้ว

### Frontend Structure
```
frontend/src/
├── types/
│   └── foremanResponse.types.ts         # TypeScript types/interfaces
├── services/
│   └── foremanResponseService.ts        # API service layer
├── hooks/
│   └── useForemanResponse.ts            # React hooks
└── pages/reception/
    ├── ForemanResponsePage.tsx          # List view (existing)
    └── ForemanResponseDetailPage.tsx    # Detail view (existing)
```

### Backend Structure
```
backend/
├── prisma/
│   └── schema.prisma                    # Updated with ForemanResponse models
└── src/foreman-responses/
    ├── dto/
    │   ├── create-foreman-response.dto.ts
    │   ├── update-foreman-response.dto.ts
    │   ├── query-foreman-response.dto.ts
    │   └── update-customer-decision.dto.ts
    ├── entities/
    ├── foreman-responses.controller.ts
    ├── foreman-responses.service.ts
    ├── foreman-responses.module.ts
    └── README.md
```

## 🚀 การเริ่มใช้งาน (Setup Steps)

### 1. Backend Setup

#### Step 1.1: Register Module
แก้ไขไฟล์ `backend/src/app.module.ts`:

```typescript
import { ForemanResponsesModule } from './foreman-responses/foreman-responses.module';

@Module({
  imports: [
    // ... existing modules
    ForemanResponsesModule,  // เพิ่มบรรทัดนี้
  ],
})
export class AppModule {}
```

#### Step 1.2: Run Database Migration
```bash
cd backend
npx prisma migrate dev --name add_foreman_response_system
npx prisma generate
```

#### Step 1.3: (Optional) Seed Test Data
สร้างไฟล์ `backend/prisma/seed-foreman-response.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedForemanResponses() {
  // สมมติว่ามี Job ID 1 และ User ID 2 (foreman) แล้ว
  await prisma.foremanResponse.create({
    data: {
      jobId: 1,
      assessmentNumber: 1,
      foremanAnalysis: "ตรวจสอบแล้วพบว่ากระบอกสูบมีรอยขีดข่วน และลูกสูบสึกหรอ",
      estimatedCost: 4500,
      estimatedDuration: "2-3 วัน",
      foremanId: 2,
      additionalNotes: "แนะนำให้เปลี่ยนถ่ายน้ำมันเครื่อง",
      requiredParts: {
        create: [
          {
            name: "ชุดลูกสูบ Honda Wave 125i",
            quantity: 1,
            unitPrice: 2500,
            totalPrice: 2500,
            inStock: true
          },
          {
            name: "ปะเก็นชุด",
            quantity: 1,
            unitPrice: 350,
            totalPrice: 350,
            inStock: true
          }
        ]
      }
    }
  });
}

seedForemanResponses()
  .then(() => console.log('✅ Seeded foreman responses'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

รัน: `npx ts-node prisma/seed-foreman-response.ts`

#### Step 1.4: Start Backend
```bash
npm run start:dev
# Backend จะรันที่ http://localhost:3000
# Swagger UI: http://localhost:3000/api
```

### 2. Frontend Setup

#### Step 2.1: ติดตั้ง Dependencies (ถ้ายังไม่มี)
```bash
cd frontend
npm install
```

#### Step 2.2: Update ForemanResponseDetailPage.tsx
แก้ไขจาก mock data เป็นใช้งาน API จริง:

```typescript
import { useForemanResponse, useCustomerDecision } from '../hooks/useForemanResponse'

export default function ForemanResponseDetailPage() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    
    // Use custom hooks
    const { data: response, loading, error, refetch } = useForemanResponse(id)
    const { submitDecision, loading: submitting } = useCustomerDecision()
    
    // State for modal
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [pendingDecision, setPendingDecision] = useState<'approved' | 'rejected' | null>(null)

    if (loading) return <div>Loading...</div>
    if (error) return <div>Error: {error.message}</div>
    if (!response) return <div>Not found</div>

    const handleConfirmDecision = async () => {
        if (!pendingDecision) return

        try {
            await submitDecision(id!, {
                decision: pendingDecision,
                decisionBy: 'Reception User', // TODO: Get from auth context
                notes: undefined
            })
            
            alert(
                pendingDecision === 'approved' 
                    ? 'บันทึกการยืนยันเรียบร้อย' 
                    : 'บันทึกการยกเลิกเรียบร้อย'
            )
            
            setShowConfirmModal(false)
            setPendingDecision(null)
            refetch() // Refresh data
        } catch (error) {
            console.error('Error updating decision:', error)
            alert('เกิดข้อผิดพลาด')
        }
    }

    // ... rest of component
}
```

#### Step 2.3: Update ForemanResponsePage.tsx
เปลี่ยนจาก mock data เป็น API:

```typescript
import { useForemanResponseList } from '../hooks/useForemanResponse'

export default function ForemanResponsePage() {
    const [page, setPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState<string>('all')
    
    const { data, total, loading, error } = useForemanResponseList({
        page,
        limit: 10,
        status: statusFilter !== 'all' ? statusFilter : undefined
    })

    if (loading) return <div>Loading...</div>
    if (error) return <div>Error: {error.message}</div>

    return (
        <div>
            {/* ... render data */}
        </div>
    )
}
```

#### Step 2.4: Update API Base URL
ตรวจสอบไฟล์ `frontend/.env` หรือ `.env.local`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_USE_MOCK_DATA=false
```

#### Step 2.5: Start Frontend
```bash
npm run dev
# Frontend จะรันที่ http://localhost:5173
```

## 📊 Data Flow Diagram

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Foreman   │────1───>│   Backend   │<───2────│  Reception  │
│  (Create)   │         │   NestJS    │         │   (View)    │
└─────────────┘         └─────────────┘         └─────────────┘
                              │  ▲
                              │  │
                           3  │  │  5
                              │  │
                              ▼  │
                        ┌─────────────┐
                        │  Database   │
                        │  PostgreSQL │
                        └─────────────┘
                              │  ▲
                              │  │
                           4  │  │  6
                              │  │
                              ▼  │
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  Reception  │────7───>│   Backend   │────8───>│   Foreman   │
│  (Decision) │         │             │         │  (Notify)   │
└─────────────┘         └─────────────┘         └─────────────┘
```

1. หัวหน้าช่างสร้าง ForemanResponse
2. Reception ดูรายละเอียด
3. บันทึกลง Database
4. ดึงข้อมูลจาก Database
5. แสดงผลให้ Reception
6. Reception บันทึกการตัดสินใจของลูกค้า
7. อัปเดตสถานะใน Database
8. (TODO) แจ้งเตือนหัวหน้าช่าง

## 🔗 API Endpoints Available

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/foreman-responses` | สร้าง foreman response ใหม่ |
| GET | `/foreman-responses` | ดึงรายการทั้งหมด (pagination) |
| GET | `/foreman-responses/pending` | ดึงรายการที่รอตัดสินใจ |
| GET | `/foreman-responses/stats` | สถิติ |
| GET | `/foreman-responses/job/:jobId` | ดึงตาม Job ID |
| GET | `/foreman-responses/:id` | ดึงรายการเดียว |
| PATCH | `/foreman-responses/:id` | แก้ไข response |
| PATCH | `/foreman-responses/:id/decision` | บันทึกการตัดสินใจของลูกค้า |
| DELETE | `/foreman-responses/:id` | ลบ response |

## ✅ Checklist

### Backend
- [x] Prisma schema updated
- [x] DTOs created
- [x] Service created
- [x] Controller created
- [x] Module created
- [ ] Module registered in AppModule
- [ ] Migration run
- [ ] Prisma Client generated
- [ ] Backend tested via Swagger

### Frontend
- [x] Types/Interfaces created
- [x] API Service created
- [x] React Hooks created
- [ ] ForemanResponseDetailPage updated to use hooks
- [ ] ForemanResponsePage updated to use hooks
- [ ] Environment variables configured
- [ ] Frontend tested

### Integration
- [ ] Create test foreman response via API
- [ ] View in frontend
- [ ] Test customer decision flow
- [ ] Verify database updates

## 🧪 Testing Guide

### 1. Test API via Swagger
1. เปิด http://localhost:3000/api
2. ไปที่ section "Foreman Responses"
3. ทดสอบ POST `/foreman-responses` ด้วย sample data
4. ทดสอบ GET `/foreman-responses/:id`
5. ทดสอบ PATCH `/foreman-responses/:id/decision`

### 2. Test Frontend
1. เปิด http://localhost:5173/reception/foreman-response
2. ควรเห็นรายการที่สร้างจาก API
3. คลิกเข้าดูรายละเอียด
4. ทดสอบปุ่มอนุมัติ/ไม่อนุมัติ
5. ตรวจสอบว่า status อัปเดตใน database

### 3. Test Database
```sql
-- ดูรายการทั้งหมด
SELECT * FROM "ForemanResponse";

-- ดูรายการพร้อม parts
SELECT fr.*, frp.* 
FROM "ForemanResponse" fr
LEFT JOIN "ForemanRequiredPart" frp ON fr.id = frp."foremanResponseId";

-- ดูรายการที่รอตัดสินใจ
SELECT * FROM "ForemanResponse" WHERE status = 'PENDING_CUSTOMER';
```

## 🐛 Troubleshooting

### ปัญหา: Migration ไม่ผ่าน
**แก้ไข:**
```bash
npx prisma migrate reset
npx prisma migrate dev
```

### ปัญหา: Frontend ไม่เชื่อมกับ Backend
**ตรวจสอบ:**
1. Backend รันอยู่หรือไม่
2. CORS settings ใน backend
3. VITE_API_URL ใน .env
4. Network tab ใน browser DevTools

### ปัญหา: Type errors ใน TypeScript
**แก้ไข:**
```bash
# Backend
cd backend && npx prisma generate

# Frontend  
cd frontend && npm run build
```

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [React Hooks](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🎯 Next Steps

1. **WebSocket Integration**: สำหรับ real-time notification
2. **PDF Export**: สร้างใบเสนอราคา PDF
3. **Email/SMS**: แจ้งเตือนลูกค้า
4. **Analytics**: Dashboard สำหรับสถิติ
5. **Audit Log**: บันทึกประวัติการเปลี่ยนแปลง

## 👥 Team Assignment

### Frontend Team
- อัปเดต ForemanResponseDetailPage.tsx ให้ใช้ hooks
- อัปเดต ForemanResponsePage.tsx ให้ใช้ hooks  
- ทดสอบ UI/UX flow

### Backend Team
- Register module ใน AppModule
- รัน migration
- ทดสอบ API endpoints
- สร้าง seed data

### QA Team
- ทดสอบ integration ทั้งระบบ
- ตรวจสอบ data consistency
- ทดสอบ edge cases

---

**สร้างโดย:** GitHub Copilot  
**วันที่:** March 11, 2026  
**สถานะ:** ✅ Ready for implementation
