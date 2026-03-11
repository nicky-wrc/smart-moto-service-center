import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { RequestHistoryProvider } from './contexts/RequestHistoryContext'

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

// Mechanic (ช่าง)
import MechanicLayout from './pages/mechanic/MechanicLayout'
import MechanicIndex from './pages/mechanic'
import MechanicJobsPage from './pages/mechanic/MechanicJobsPage'
import MechanicJobDetailPage from './pages/mechanic/MechanicJobDetailPage'
import MechanicHistoryPage from './pages/mechanic/MechanicHistoryPage'

// Other roles (placeholder — layouts TBD)
import OwnerPage from './pages/owner'
import AccountantPage from './pages/accountant'
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

export default function App() {
  return (
    <RequestHistoryProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<Navigate to="/foreman/jobs" replace />} />

          {/* พนักงานคงคลัง */}
          <Route path="/inventory" element={<InventoryLayout />}>
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
          <Route path="/foreman" element={<ForemanLayout />}>
            <Route index element={<ForemanIndex />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="jobs" element={<JobOrdersPage />} />
            <Route path="jobs/:id" element={<JobDetailPage />} />
            <Route path="history" element={<JobHistoryPage />} />
          </Route>

          {/* ช่าง */}
          <Route path="/mechanic" element={<MechanicLayout />}>
            <Route index element={<MechanicIndex />} />
            <Route path="jobs" element={<MechanicJobsPage />} />
            <Route path="jobs/:id" element={<MechanicJobDetailPage />} />
            <Route path="history" element={<MechanicHistoryPage />} />
          </Route>

          {/* พนักงานรับรถ (Reception) */}
          <Route path="/reception" element={<ReceptionLayout />}>
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
          </Route>

          {/* roles อื่น — layouts จะสร้างเพิ่มในภายหลัง */}
          <Route path="/accountant/*" element={<AccountantPage />} />
          <Route path="/owner/*" element={<OwnerPage />} />
        </Routes>
      </BrowserRouter>
    </RequestHistoryProvider>
  )
}
