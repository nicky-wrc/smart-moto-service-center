import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Inventory (พนักงานคงคลัง)
import InventoryLayout from './pages/inventory/InventoryLayout'
import InventoryIndex from './pages/inventory'
import RequestsPage from './pages/inventory/RequestsPage'
import PartsPage from './pages/inventory/PartsPage'
import PurchaseOrdersPage from './pages/inventory/PurchaseOrdersPage'
import ReportsPage from './pages/inventory/ReportsPage'

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

// Other roles (placeholder — layouts TBD)
import OwnerPage from './pages/owner'
import ReceptionPage from './pages/reception'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Navigate to="/foreman/jobs" replace />} />

        {/* พนักงานคงคลัง */}
        <Route path="/inventory" element={<InventoryLayout />}>
          <Route index element={<InventoryIndex />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="parts" element={<PartsPage />} />
          <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>

        {/* หัวหน้าช่าง */}
        <Route path="/foreman" element={<ForemanLayout />}>
          <Route index element={<ForemanIndex />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="jobs" element={<JobOrdersPage />} />
          <Route path="jobs/:id" element={<JobDetailPage />} />
          <Route path="mechanics" element={<MechanicsPage />} />
          <Route path="history" element={<JobHistoryPage />} />
        </Route>

        {/* ช่าง */}
        <Route path="/mechanic" element={<MechanicLayout />}>
          <Route index element={<MechanicIndex />} />
          <Route path="jobs" element={<MechanicJobsPage />} />
          <Route path="jobs/:id" element={<MechanicJobDetailPage />} />
          <Route path="history" element={<MechanicHistoryPage />} />
        </Route>

        {/* บัญชี */}
        <Route path="/accountant" element={<AccountantLayout />}>
          <Route index element={<AccountIndex />} />
          <Route path="dashboard" element={<AccountantDashboardPage />} />
          <Route path="historys" element={<PaymentHistoryPage />} />
          <Route path="historys/:id" element={<PaymentHistoryDetailPage />} />
          <Route path="pendingpayment" element={<Pendingpayment />} />
          <Route path="pendingpayment/:id" element={<PendingpaymentDetail />} />
        </Route>

        {/* roles อื่น — layouts จะสร้างเพิ่มในภายหลัง */}
        <Route path="/reception/*" element={<ReceptionPage />} />
        <Route path="/owner/*" element={<OwnerPage />} />
      </Routes>
    </BrowserRouter>
  )
}
