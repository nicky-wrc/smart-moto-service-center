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
