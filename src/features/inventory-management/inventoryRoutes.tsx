import { Route, Navigate } from 'react-router-dom'
import InventoryOverviewPage from './pages/InventoryOverviewPage'
import AllInventoryPage from './pages/AllInventoryPage'
import StockUsagePage from './pages/StockUsagePage'
import InventoryRequestPage from './pages/InventoryRequestPage'
import InventoryApprovePage from './pages/InventoryApprovePage'

export const inventoryRoutes = (
  <>
    <Route path="inventory-management" element={<Navigate to="/inventory-management/overview" replace />} />
    <Route path="inventory-management/overview" element={<InventoryOverviewPage />} />
    <Route path="inventory-management/all" element={<AllInventoryPage />} />
    <Route path="inventory-management/usage" element={<StockUsagePage />} />
    <Route path="inventory-management/request" element={<InventoryRequestPage />} />
    <Route path="inventory-management/approve" element={<InventoryApprovePage />} />
  </>
)

export default inventoryRoutes
