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
