import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Package, Wrench } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthGuard } from './guards/AuthGuard';
import { RoleGuard } from './guards/RoleGuard';
import { MainLayout } from './components/Layout/MainLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CustomerSearchPage } from './pages/reception/CustomerSearchPage';
import { CustomerCreatePage } from './pages/reception/CustomerCreatePage';
import { CustomerDetailPage } from './pages/reception/CustomerDetailPage';
import { MotorcycleCreatePage } from './pages/reception/MotorcycleCreatePage';
import { JobCreatePage } from './pages/reception/JobCreatePage';
import { JobQueuePage } from './pages/workshop/JobQueuePage';
import { AppointmentsPage } from './pages/reception/AppointmentsPage';
import { AppointmentCalendarPage } from './pages/reception/AppointmentCalendarPage';
import { CreateAppointmentPage } from './pages/reception/CreateAppointmentPage';
import { AppointmentDetailPage } from './pages/reception/AppointmentDetailPage';
import { JobDetailPage } from './pages/workshop/JobDetailPage';
import { PartRequisitionPage } from './pages/workshop/PartRequisitionPage';
import { PartMasterPage } from './pages/inventory/PartMasterPage';
import { GoodsReceiptPage } from './pages/inventory/GoodsReceiptPage';
import { ReceiptHistoryPage } from './pages/inventory/ReceiptHistoryPage';
import { PackagesPage } from './pages/inventory/PackagesPage';
import { IssueRequisitionsPage } from './pages/inventory/IssueRequisitionsPage';
import { QuotationsPage } from './pages/billing/QuotationsPage';
import { PaymentsPage } from './pages/billing/PaymentsPage';

// Placeholder pages (จะสร้างต่อ)
const ReceptionPage = () => (
  <div>
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Reception</h1>
    <div className="card">
      <p className="text-gray-600">เลือกเมนูจาก navigation bar ด้านบน</p>
    </div>
  </div>
);
const WorkshopPage = () => (
  <div>
    <h1 className="text-2xl font-bold text-gray-900 mb-4">งานช่าง</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Link to="/workshop/queue" className="card hover:shadow-lg transition">
        <Wrench className="w-12 h-12 text-blue-500 mb-2" />
        <h3 className="font-semibold text-gray-900 mb-1">คิวงาน</h3>
        <p className="text-sm text-gray-600">ดูงานที่รอรับและกำลังทำ</p>
      </Link>
      <Link to="/workshop/requisitions" className="card hover:shadow-lg transition">
        <Package className="w-12 h-12 text-green-500 mb-2" />
        <h3 className="font-semibold text-gray-900 mb-1">ขอเบิกอะไหล่</h3>
        <p className="text-sm text-gray-600">สร้างคำขอเบิกอะไหล่</p>
      </Link>
    </div>
  </div>
);

const InventoryPage = () => (
  <div>
    <h1 className="text-2xl font-bold text-gray-900 mb-4">หน้าคลังอะไหล่</h1>
    <div className="card">
      <p className="text-gray-600 mb-4">เลือกเมนูจาก navigation bar ด้านบน</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/inventory/parts" className="card hover:shadow-lg transition">
          <Package className="w-12 h-12 text-blue-500 mb-2" />
          <h3 className="font-semibold text-gray-900">จัดการอะไหล่</h3>
          <p className="text-sm text-gray-600">ดูและจัดการอะไหล่ทั้งหมด</p>
        </Link>
            <Link to="/inventory/packages" className="card hover:shadow-lg transition">
              <Package className="w-12 h-12 text-green-500 mb-2" />
              <h3 className="font-semibold text-gray-900">ชุดอะไหล่</h3>
              <p className="text-sm text-gray-600">จัดการชุดอะไหล่</p>
            </Link>
            <Link to="/inventory/receipts" className="card hover:shadow-lg transition">
              <Package className="w-12 h-12 text-orange-500 mb-2" />
              <h3 className="font-semibold text-gray-900">รับของเข้า</h3>
              <p className="text-sm text-gray-600">ประวัติการรับของเข้า</p>
            </Link>
            <Link to="/inventory/issue" className="card hover:shadow-lg transition">
              <Package className="w-12 h-12 text-red-500 mb-2" />
              <h3 className="font-semibold text-gray-900">เบิกอะไหล่</h3>
              <p className="text-sm text-gray-600">อนุมัติและเบิกอะไหล่</p>
            </Link>
      </div>
    </div>
  </div>
);
const BillingPage = () => (
  <div>
    <h1 className="text-2xl font-bold text-gray-900 mb-4">หน้าการเงิน</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Link to="/billing/quotations" className="card hover:shadow-lg transition">
        <h3 className="font-semibold text-gray-900 mb-2">ใบเสนอราคา</h3>
        <p className="text-sm text-gray-600">จัดการใบเสนอราคา</p>
      </Link>
      <Link to="/billing/payments" className="card hover:shadow-lg transition">
        <h3 className="font-semibold text-gray-900 mb-2">การชำระเงิน</h3>
        <p className="text-sm text-gray-600">ดูประวัติการชำระเงิน</p>
      </Link>
    </div>
  </div>
);
const AdminPage = () => (
  <div className="card">
    <h1 className="text-2xl font-bold">หน้าจัดการระบบ</h1>
    <p className="text-gray-600 mt-2">กำลังพัฒนา...</p>
  </div>
);

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <AuthGuard>
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          </AuthGuard>
        }
      />

      {/* Reception Routes */}
      <Route
        path="/reception"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={['SERVICE_ADVISOR', 'ADMIN', 'MANAGER']}>
              <MainLayout>
                <ReceptionPage />
              </MainLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />
      <Route
        path="/reception/customers"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={['SERVICE_ADVISOR', 'ADMIN', 'MANAGER']}>
              <MainLayout>
                <CustomerSearchPage />
              </MainLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />
      <Route
        path="/reception/customers/new"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={['SERVICE_ADVISOR', 'ADMIN', 'MANAGER']}>
              <MainLayout>
                <CustomerCreatePage />
              </MainLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />
      <Route
        path="/reception/customers/:id"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={['SERVICE_ADVISOR', 'ADMIN', 'MANAGER']}>
              <MainLayout>
                <CustomerDetailPage />
              </MainLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />
      <Route
        path="/reception/motorcycles/new"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={['SERVICE_ADVISOR', 'ADMIN', 'MANAGER']}>
              <MainLayout>
                <MotorcycleCreatePage />
              </MainLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />
      <Route
        path="/reception/jobs/new"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={['SERVICE_ADVISOR', 'ADMIN', 'MANAGER']}>
              <MainLayout>
                <JobCreatePage />
              </MainLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />
      <Route
        path="/reception/appointments"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={['SERVICE_ADVISOR', 'ADMIN', 'MANAGER']}>
              <MainLayout>
                <AppointmentsPage />
              </MainLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />
      <Route
        path="/reception/appointments/calendar"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={['SERVICE_ADVISOR', 'ADMIN', 'MANAGER']}>
              <MainLayout>
                <AppointmentCalendarPage />
              </MainLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />
          <Route
            path="/reception/appointments/new"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={['SERVICE_ADVISOR', 'ADMIN', 'MANAGER']}>
                  <MainLayout>
                    <CreateAppointmentPage />
                  </MainLayout>
                </RoleGuard>
              </AuthGuard>
            }
          />
          <Route
            path="/reception/appointments/:id"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={['SERVICE_ADVISOR', 'ADMIN', 'MANAGER']}>
                  <MainLayout>
                    <AppointmentDetailPage />
                  </MainLayout>
                </RoleGuard>
              </AuthGuard>
            }
          />

      {/* Workshop Routes */}
      <Route
        path="/workshop"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={['TECHNICIAN', 'FOREMAN', 'ADMIN', 'MANAGER']}>
              <MainLayout>
                <WorkshopPage />
              </MainLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />
      <Route
        path="/workshop/queue"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={['TECHNICIAN', 'FOREMAN', 'ADMIN', 'MANAGER']}>
              <MainLayout>
                <JobQueuePage />
              </MainLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />
      <Route
        path="/workshop/jobs/:id"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={['TECHNICIAN', 'FOREMAN', 'ADMIN', 'MANAGER']}>
              <MainLayout>
                <JobDetailPage />
              </MainLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />
      <Route
        path="/workshop/requisitions"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={['TECHNICIAN', 'FOREMAN', 'ADMIN', 'MANAGER']}>
              <MainLayout>
                <PartRequisitionPage />
              </MainLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />

      {/* Inventory Routes */}
      <Route
        path="/inventory"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={['STOCK_KEEPER', 'ADMIN', 'MANAGER']}>
              <MainLayout>
                <InventoryPage />
              </MainLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />
      <Route
        path="/inventory/parts"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={['STOCK_KEEPER', 'ADMIN', 'MANAGER']}>
              <MainLayout>
                <PartMasterPage />
              </MainLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />
      <Route
        path="/inventory/packages"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={['STOCK_KEEPER', 'ADMIN', 'MANAGER']}>
              <MainLayout>
                <div className="card">
                  <h1 className="text-2xl font-bold">ชุดอะไหล่</h1>
                  <p className="text-gray-600 mt-2">กำลังพัฒนา...</p>
                </div>
              </MainLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />
          <Route
            path="/inventory/receipts"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={['STOCK_KEEPER', 'ADMIN', 'MANAGER']}>
                  <MainLayout>
                    <ReceiptHistoryPage />
                  </MainLayout>
                </RoleGuard>
              </AuthGuard>
            }
          />
          <Route
            path="/inventory/receipts/new"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={['STOCK_KEEPER', 'ADMIN', 'MANAGER']}>
                  <MainLayout>
                    <GoodsReceiptPage />
                  </MainLayout>
                </RoleGuard>
              </AuthGuard>
            }
          />
          <Route
            path="/inventory/packages"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={['STOCK_KEEPER', 'ADMIN', 'MANAGER']}>
                  <MainLayout>
                    <PackagesPage />
                  </MainLayout>
                </RoleGuard>
              </AuthGuard>
            }
          />
          <Route
            path="/inventory/issue"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={['STOCK_KEEPER', 'ADMIN', 'MANAGER']}>
                  <MainLayout>
                    <IssueRequisitionsPage />
                  </MainLayout>
                </RoleGuard>
              </AuthGuard>
            }
          />

          {/* Billing Routes */}
          <Route
            path="/billing"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={['CASHIER', 'ADMIN', 'MANAGER']}>
                  <MainLayout>
                    <BillingPage />
                  </MainLayout>
                </RoleGuard>
              </AuthGuard>
            }
          />
          <Route
            path="/billing/quotations"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={['CASHIER', 'ADMIN', 'MANAGER']}>
                  <MainLayout>
                    <QuotationsPage />
                  </MainLayout>
                </RoleGuard>
              </AuthGuard>
            }
          />
          <Route
            path="/billing/payments"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={['CASHIER', 'ADMIN', 'MANAGER']}>
                  <MainLayout>
                    <PaymentsPage />
                  </MainLayout>
                </RoleGuard>
              </AuthGuard>
            }
          />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={['ADMIN', 'MANAGER']}>
              <MainLayout>
                <AdminPage />
              </MainLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />

      {/* Default Route */}
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
