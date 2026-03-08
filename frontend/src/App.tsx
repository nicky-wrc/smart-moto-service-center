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

// บัญชี
import AccountIndex from './pages/accountant/'
import AccountantLayout from './pages/accountant/AccountantLayout'
import Accountanthistorys from './pages/accountant/Accountanthistorys'
import Accountanthistory from './pages/accountant/Accountanthistory'

// Other roles (placeholder — layouts TBD)
import MechanicPage from './pages/mechanic'
import OwnerPage from './pages/owner'
import ReceptionPage from './pages/reception'
import Pendingpayment from './pages/accountant/Pendingpayment'
import PendingpaymentDetail from './pages/accountant/PendingpaymentDetail'


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
          <Route path="history" element={<JobHistoryPage />} />
        </Route>
        
        {/* บัญชี */}
        <Route path="/accountant" element={<AccountantLayout />}>
          <Route index element={<AccountIndex />} />
          <Route path="historys" element={<Accountanthistorys />} />
          <Route path="history" element={<Accountanthistory />} />
          <Route path="pendingpayment" element={<Pendingpayment />} />
          <Route path="pendingpayment/:id" element={<PendingpaymentDetail />} />
        </Route>
        

        {/* roles อื่น — layouts จะสร้างเพิ่มในภายหลัง */}
        <Route path="/reception/*" element={<ReceptionPage />} />
        <Route path="/mechanic/*" element={<MechanicPage />} />
        <Route path="/owner/*" element={<OwnerPage />} />
      </Routes>
    </BrowserRouter>
  )
}
