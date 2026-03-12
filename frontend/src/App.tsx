import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/login/LoginPage'
import { RequestHistoryProvider } from './contexts/RequestHistoryContext'
import { AlertProvider } from './contexts/AlertContext'
import { AlertInterceptor } from './components/AlertInterceptor'

// Inventory (พนักงานคงคลัง)
import InventoryLayout from './pages/inventory/InventoryLayout'
import InventoryIndex from './pages/inventory'
import RequestsPage from './pages/inventory/RequestsPage'
import RequestDetailPage from './pages/inventory/RequestDetailPage'
import PartsPage from './pages/inventory/PartsPage'
import PartDetailPage from './pages/inventory/PartDetailPage'
import PurchaseOrdersPage from './pages/inventory/PurchaseOrdersPage'
import CreatePurchaseOrderPage from './pages/inventory/CreatePurchaseOrderPage'
import EditPurchaseOrderPage from './pages/inventory/EditPurchaseOrderPage'
import PurchaseOrderDetailPage from './pages/inventory/PurchaseOrderDetailPage'
import ReportsPage from './pages/inventory/ReportsPage'
import HistoryPage from './pages/inventory/HistoryPage'
import HistoryDetailPage from './pages/inventory/HistoryDetailPage'

// Foreman (หัวหน้าช่าง)
import ForemanLayout from './pages/foreman/ForemanLayout'
import ForemanIndex from './pages/foreman'
import DashboardPage from './pages/foreman/DashboardPage'
import JobOrdersPage from './pages/foreman/JobOrdersPage'
import JobDetailPage from './pages/foreman/JobDetailPage'
import JobHistoryPage from './pages/foreman/JobHistoryPage'
import MechanicsPage from './pages/foreman/MechanicsPage'

// Mechanic (ช่าง)
import MechanicLayout from './pages/mechanic/MechanicLayout'
import MechanicIndex from './pages/mechanic'
import MechanicJobsPage from './pages/mechanic/MechanicJobsPage'
import MechanicJobDetailPage from './pages/mechanic/MechanicJobDetailPage'
import MechanicHistoryPage from './pages/mechanic/MechanicHistoryPage'

// Accountant (บัญชี)
import AccountantLayout from './pages/accountant/AccountantLayout'
import AccountIndex from './pages/accountant'
import AccountantDashboardPage from './pages/accountant/DashboardPage'
import PaymentHistoryPage from './pages/accountant/PaymentHistoryPage'
import PaymentHistoryDetailPage from './pages/accountant/PaymentHistoryDetailPage'
import Pendingpayment from './pages/accountant/Pendingpayment'
import PendingpaymentDetail from './pages/accountant/PendingpaymentDetail'

// Owner (เจ้าของร้าน)
import OwnerLayout from './pages/owner/OwnerLayout'
import OwnerIndex from './pages/owner'
import OwnerDashboardPage from './pages/owner/DashboardPage'
import OwnerReportsPage from './pages/owner/ReportsPage'
import OwnerEmployeesPage from './pages/owner/EmployeesPage'
import OwnerStockPage from './pages/owner/StockPage'
import OwnerPendingJobsPage from './pages/owner/PendingJobsPage'
import OwnerPurchaseRequestsPage from './pages/owner/PurchaseRequestsPage'
import OwnerPurchaseRequestDetailPage from './pages/owner/PurchaseRequestDetailPage'

// Reception (พนักงานรับรถ)
import ReceptionLayout from './pages/reception/ReceptionLayout'
import ReceptionIndex from './pages/reception'
import ReceptionRegisterPage from './pages/reception/ReceptionRegisterPage'
import ReceptionConfirmPage from './pages/reception/ReceptionConfirmPage'
import ReceptionSuccessPage from './pages/reception/ReceptionSuccessPage'
import ReceptionRepairPage from './pages/reception/ReceptionRepairPage'
import ReceptionRepairSuccessPage from './pages/reception/ReceptionRepairSuccessPage'
import ReceptionSearchPage from './pages/reception/ReceptionSearchPage'
import ReceptionHistoryPage from './pages/reception/ReceptionHistoryPage'
import ReceptionHistoryDetailPage from './pages/reception/ReceptionHistoryDetailPage'
import ForemanResponsePage from './pages/reception/ForemanResponsePage'
import ForemanResponseDetailPage from './pages/reception/ForemanResponseDetailPage'
import { AppointmentsPage } from './pages/reception/AppointmentsPage'
import { CreateAppointmentPage } from './pages/reception/CreateAppointmentPage'
import { AppointmentDetailPage } from './pages/reception/AppointmentDetailPage'
import { AppointmentCalendarPage } from './pages/reception/AppointmentCalendarPage'

// Workshop (ช่างซ่อม)
import WorkshopLayout from './pages/workshop/WorkshopLayout'
import WorkshopIndex from './pages/workshop'
import { JobQueuePage } from './pages/workshop/JobQueuePage'
import { JobDetailPage as WorkshopJobDetailPage } from './pages/workshop/JobDetailPage'
import { PartRequisitionPage } from './pages/workshop/PartRequisitionPage'

// Billing (การเงิน)
import BillingLayout from './pages/billing/BillingLayout'
import BillingIndex from './pages/billing'
import { QuotationsPage } from './pages/billing/QuotationsPage'
import { PaymentsPage } from './pages/billing/PaymentsPage'

export default function App() {
  return (
    <AlertProvider>
      <AlertInterceptor />
      <RequestHistoryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="/unauthorized" element={
            <div className="min-h-screen flex items-center justify-center text-gray-500">
              ไม่มีสิทธิ์เข้าถึงหน้านี้
            </div>
          } />

          {/* พนักงานคงคลัง */}
          <Route path="/inventory" element={
            <ProtectedRoute roles={['STOCK_KEEPER', 'ADMIN', 'MANAGER']}>
              <InventoryLayout />
            </ProtectedRoute>
          }>
            <Route index element={<InventoryIndex />} />
            <Route path="requests" element={<RequestsPage />} />
            <Route path="requests/:id" element={<RequestDetailPage />} />
            <Route path="parts" element={<PartsPage />} />
            <Route path="parts/:id" element={<PartDetailPage />} />
            <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
            <Route path="purchase-orders/create" element={<CreatePurchaseOrderPage />} />
            <Route path="purchase-orders/edit/:id" element={<EditPurchaseOrderPage />} />
            <Route path="purchase-orders/:id" element={<PurchaseOrderDetailPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="history/:id" element={<HistoryDetailPage />} />
          </Route>

          {/* หัวหน้าช่าง */}
          <Route path="/foreman" element={
            <ProtectedRoute roles={['FOREMAN', 'SERVICE_ADVISOR', 'ADMIN', 'MANAGER']}>
              <ForemanLayout />
            </ProtectedRoute>
          }>
            <Route index element={<ForemanIndex />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="jobs" element={<JobOrdersPage />} />
            <Route path="jobs/:id" element={<JobDetailPage />} />
            <Route path="mechanics" element={<MechanicsPage />} />
            <Route path="history" element={<JobHistoryPage />} />
          </Route>

          {/* ช่าง */}
          <Route path="/mechanic" element={
            <ProtectedRoute roles={['TECHNICIAN', 'FOREMAN', 'ADMIN', 'MANAGER']}>
              <MechanicLayout />
            </ProtectedRoute>
          }>
            <Route index element={<MechanicIndex />} />
            <Route path="jobs" element={<MechanicJobsPage />} />
            <Route path="jobs/:id" element={<MechanicJobDetailPage />} />
            <Route path="history" element={<MechanicHistoryPage />} />
          </Route>

          {/* บัญชี */}
          <Route path="/accountant" element={
            <ProtectedRoute roles={['CASHIER', 'ADMIN', 'MANAGER']}>
              <AccountantLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AccountIndex />} />
            <Route path="dashboard" element={<AccountantDashboardPage />} />
            <Route path="historys" element={<PaymentHistoryPage />} />
            <Route path="historys/:id" element={<PaymentHistoryDetailPage />} />
            <Route path="pendingpayment" element={<Pendingpayment />} />
            <Route path="pendingpayment/:id" element={<PendingpaymentDetail />} />
          </Route>

          {/* เจ้าของร้าน */}
          <Route path="/owner" element={
            <ProtectedRoute roles={['MANAGER', 'ADMIN']}>
              <OwnerLayout />
            </ProtectedRoute>
          }>
            <Route index element={<OwnerIndex />} />
            <Route path="dashboard" element={<OwnerDashboardPage />} />
            <Route path="reports" element={<OwnerReportsPage />} />
            <Route path="employees" element={<OwnerEmployeesPage />} />
            <Route path="stock" element={<OwnerStockPage />} />
            <Route path="pending-jobs" element={<OwnerPendingJobsPage />} />
            <Route path="purchase-requests" element={<OwnerPurchaseRequestsPage />} />
            <Route path="purchase-requests/:id" element={<OwnerPurchaseRequestDetailPage />} />
          </Route>

          {/* พนักงานรับรถ (Reception) */}
          <Route path="/reception" element={
            <ProtectedRoute roles={['SERVICE_ADVISOR', 'ADMIN', 'MANAGER']}>
              <ReceptionLayout />
            </ProtectedRoute>
          }>
            <Route index element={<ReceptionIndex />} />
            <Route path="register" element={<ReceptionRegisterPage />} />
            <Route path="confirm" element={<ReceptionConfirmPage />} />
            <Route path="success" element={<ReceptionSuccessPage />} />
            <Route path="search" element={<ReceptionSearchPage />} />
            <Route path="repair" element={<ReceptionRepairPage />} />
            <Route path="repair-success" element={<ReceptionRepairSuccessPage />} />
            <Route path="foreman-response" element={<ForemanResponsePage />} />
            <Route path="foreman-response/:id" element={<ForemanResponseDetailPage />} />
            <Route path="history" element={<ReceptionHistoryPage />} />
            <Route path="history/:id" element={<ReceptionHistoryDetailPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="appointments/new" element={<CreateAppointmentPage />} />
            <Route path="appointments/calendar" element={<AppointmentCalendarPage />} />
            <Route path="appointments/:id" element={<AppointmentDetailPage />} />
          </Route>
          {/* ช่างซ่อม (Workshop) */}
          <Route path="/workshop" element={
            <ProtectedRoute roles={['TECHNICIAN', 'FOREMAN', 'ADMIN', 'MANAGER']}>
              <WorkshopLayout />
            </ProtectedRoute>
          }>
            <Route index element={<WorkshopIndex />} />
            <Route path="queue" element={<JobQueuePage />} />
            <Route path="jobs/:id" element={<WorkshopJobDetailPage />} />
            <Route path="requisitions" element={<PartRequisitionPage />} />
          </Route>

          {/* การเงิน (Billing) */}
          <Route path="/billing" element={
            <ProtectedRoute roles={['CASHIER', 'ADMIN', 'MANAGER']}>
              <BillingLayout />
            </ProtectedRoute>
          }>
            <Route index element={<BillingIndex />} />
            <Route path="quotations" element={<QuotationsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </RequestHistoryProvider>
    </AlertProvider>
  )
}
