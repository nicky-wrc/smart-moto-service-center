import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Inventory (พนักงานคงคลัง)
import InventoryLayout from './pages/inventory/InventoryLayout'
import InventoryIndex from './pages/inventory'
import RequestsPage from './pages/inventory/RequestsPage'
import RequestDetailPage from './pages/inventory/RequestDetailPage'
import PartsPage from './pages/inventory/PartsPage'
import PurchaseOrdersPage from './pages/inventory/PurchaseOrdersPage'
import ReportsPage from './pages/inventory/ReportsPage'

// Other roles (placeholder — layouts TBD)
import MechanicPage from './pages/mechanic'
import ForemanPage from './pages/foreman'
import OwnerPage from './pages/owner'
import AccountantPage from './pages/accountant'
import ReceptionPage from './pages/reception'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Navigate to="/inventory/requests" replace />} />

        {/* พนักงานคงคลัง */}
        <Route path="/inventory" element={<InventoryLayout />}>
          <Route index element={<InventoryIndex />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="requests/:id" element={<RequestDetailPage />} />
          <Route path="parts" element={<PartsPage />} />
          <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>

        {/* roles อื่น — layouts จะสร้างเพิ่มในภายหลัง */}
        <Route path="/reception/*" element={<ReceptionPage />} />
        <Route path="/foreman/*" element={<ForemanPage />} />
        <Route path="/mechanic/*" element={<MechanicPage />} />
        <Route path="/accountant/*" element={<AccountantPage />} />
        <Route path="/owner/*" element={<OwnerPage />} />
      </Routes>
    </BrowserRouter>
  )
}
