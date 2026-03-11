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
