# Foreman Response System

## Overview
ระบบการตอบกลับจากหัวหน้าช่าง (Foreman Response) เป็นส่วนหนึ่งของระบบ Reception ที่ใช้สำหรับ:
- รับการวิเคราะห์และใบเสนอราคาจากหัวหน้าช่าง
- แสดงข้อมูลให้พนักงาน Reception เพื่อแจ้งลูกค้า
- บันทึกการตัดสินใจของลูกค้า (อนุมัติ/ไม่อนุมัติ)
- ส่งการตอบกลับไปยังหัวหน้าช่างเพื่อดำเนินการต่อ

## Database Schema

### ForemanResponse Model
```prisma
model ForemanResponse {
  id                   Int                    @id @default(autoincrement())
  jobId                Int
  assessmentNumber     Int                    @default(1)
  foremanAnalysis      String                 @db.Text
  estimatedCost        Decimal                @db.Decimal(10, 2)
  estimatedDuration    String
  additionalNotes      String?                @db.Text
  foremanId            Int
  respondedAt          DateTime               @default(now())
  status               ForemanResponseStatus  @default(PENDING_CUSTOMER)
  customerDecision     CustomerDecisionType?
  customerDecisionAt   DateTime?
  decisionByUserId     Int?
  decisionNotes        String?
  createdAt            DateTime               @default(now())
  updatedAt            DateTime               @updatedAt
  
  job                  Job
  foreman              User
  decisionBy           User?
  requiredParts        ForemanRequiredPart[]
}

model ForemanRequiredPart {
  id                 Int
  foremanResponseId  Int
  partId             Int?
  name               String
  quantity           Int
  unitPrice          Decimal
  totalPrice         Decimal
  partNumber         String?
  supplier           String?
  inStock            Boolean
  
  foremanResponse    ForemanResponse
  part               Part?
}
```

### Enums
```prisma
enum ForemanResponseStatus {
  PENDING_CUSTOMER  // รอการตัดสินใจจากลูกค้า
  APPROVED          // ลูกค้าอนุมัติ - เริ่มซ่อม
  REJECTED          // ลูกค้าไม่อนุมัติ - ยกเลิก
  IN_PROGRESS       // กำลังซ่อม
  COMPLETED         // ซ่อมเสร็จ
}

enum CustomerDecisionType {
  APPROVED
  REJECTED
}
```

## API Endpoints

### 1. Create Foreman Response
```
POST /foreman-responses
```
สร้างการตอบกลับใหม่จากหัวหน้าช่าง

**Request Body:**
```json
{
  "jobId": 1,
  "foremanAnalysis": "ตรวจสอบแล้วพบว่ากระบอกสูบมีรอยขีดข่วน...",
  "estimatedCost": 4500,
  "estimatedDuration": "2-3 วัน",
  "foremanId": 2,
  "additionalNotes": "แนะนำให้เปลี่ยนถ่ายน้ำมันเครื่อง",
  "requiredParts": [
    {
      "partId": 10,
      "name": "ชุดลูกสูบ Honda Wave 125i",
      "quantity": 1,
      "unitPrice": 2500,
      "totalPrice": 2500,
      "inStock": true
    }
  ],
  "assessmentNumber": 1
}
```

### 2. Get All Foreman Responses (with pagination)
```
GET /foreman-responses?page=1&limit=10&status=PENDING_CUSTOMER&search=สมชาย
```

**Query Parameters:**
- `page` (optional): หน้าที่ต้องการ (default: 1)
- `limit` (optional): จำนวนรายการต่อหน้า (default: 10)
- `status` (optional): กรองตามสถานะ
- `search` (optional): ค้นหาจากชื่อลูกค้าหรือเลขคิว
- `sortBy` (optional): เรียงตาม (respondedAt, queueNumber, assessmentNumber)
- `sortOrder` (optional): asc/desc
- `dateFrom` (optional): กรองตั้งแต่วันที่
- `dateTo` (optional): กรองจนถึงวันที่

### 3. Get Single Foreman Response
```
GET /foreman-responses/:id
```

### 4. Get Foreman Responses by Job ID
```
GET /foreman-responses/job/:jobId
```
ดึงการตอบกลับทั้งหมดของ Job นั้น (อาจมีหลายครั้งถ้ามีการประเมินซ้ำ)

### 5. Get Pending Responses
```
GET /foreman-responses/pending
```
ดึงรายการที่รอการตัดสินใจจากลูกค้า

### 6. Update Customer Decision
```
PATCH /foreman-responses/:id/decision
```
บันทึกการตัดสินใจของลูกค้า

**Request Body:**
```json
{
  "decision": "APPROVED",
  "decisionByUserId": 5,
  "notes": "ลูกค้ายืนยันทางโทรศัพท์"
}
```

### 7. Get Statistics
```
GET /foreman-responses/stats
```
**Response:**
```json
{
  "pending": 5,
  "approved": 20,
  "rejected": 3,
  "total": 28
}
```

## Frontend Integration

### 1. Service Layer
```typescript
import foremanResponseService from '@/services/foremanResponseService'

// Get list
const responses = await foremanResponseService.getForemanResponses({
  page: 1,
  limit: 10,
  status: 'PENDING_CUSTOMER'
})

// Get single
const response = await foremanResponseService.getForemanResponseById('123')

// Update customer decision
await foremanResponseService.updateCustomerDecision('123', {
  decision: 'approved',
  decisionBy: 'นายสมชาย',
  notes: 'Optional notes'
})
```

### 2. React Hooks
```typescript
import { useForemanResponse, useCustomerDecision } from '@/hooks/useForemanResponse'

// In component
function ForemanResponseDetailPage() {
  const { id } = useParams()
  const { data, loading, error, refetch } = useForemanResponse(id)
  const { submitDecision, loading: submitting } = useCustomerDecision()

  const handleApprove = async () => {
    await submitDecision(id, {
      decision: 'approved',
      decisionBy: currentUser.name
    })
    refetch()
  }
}
```

## Migration Steps

1. **Run Prisma Migration:**
```bash
cd backend
npx prisma migrate dev --name add_foreman_response_system
```

2. **Generate Prisma Client:**
```bash
npx prisma generate
```

3. **Register Module in AppModule:**
```typescript
// src/app.module.ts
import { ForemanResponsesModule } from './foreman-responses/foreman-responses.module';

@Module({
  imports: [
    // ... other modules
    ForemanResponsesModule,
  ],
})
export class AppModule {}
```

4. **Test API:**
```bash
npm run start:dev
# Open http://localhost:3000/api (Swagger documentation)
```

## Workflow

1. **Foreman Analysis** → หัวหน้าช่างสร้าง ForemanResponse ผ่าน POST /foreman-responses
2. **Reception View** → พนักงาน Reception ดูรายละเอียดผ่าน GET /foreman-responses/:id
3. **Customer Notification** → Reception แจ้งลูกค้าเกี่ยวกับผลการประเมินและราคา
4. **Customer Decision** → Reception บันทึกคำตัดสินใจผ่าน PATCH /foreman-responses/:id/decision
5. **Foreman Notification** → (TODO: Implement WebSocket/Notification) แจ้งหัวหน้าช่างเมื่อลูกค้าตัดสินใจ
6. **Start Repair** → หัวหน้าช่างเริ่มงานซ่อมถ้าลูกค้าอนุมัติ

## Testing

### Sample Data
```typescript
// Seed foreman response
await prisma.foremanResponse.create({
  data: {
    jobId: 1,
    assessmentNumber: 1,
    foremanAnalysis: "ตรวจสอบแล้วพบว่ากระบอกสูบมีรอยขีดข่วน...",
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
        }
      ]
    }
  }
})
```

## Future Enhancements
- [ ] WebSocket notification to Foreman when customer decides
- [ ] PDF export for quotation
- [ ] SMS/Email notification to customer
- [ ] Multiple assessment history tracking
- [ ] Parts availability check integration
- [ ] Auto-create PartRequisition when approved

## Notes
- `assessmentNumber` ใช้สำหรับเก็บครั้งที่ประเมิน (กรณีที่ต้องประเมินซ้ำ)
- `status` จะอัปเดตอัตโนมัติเมื่อลูกค้าตัดสินใจ
- `customerDecisionAt` และ `decisionByUserId` จะถูก set เมื่อมีการตัดสินใจ
- Required Parts สามารถ link กับ Part ในระบบหรือเป็น custom part ได้
