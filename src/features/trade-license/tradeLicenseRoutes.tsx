import { Route, Navigate } from 'react-router-dom'
import TradeLicenseLayout from './components/TradeLicenseLayout'
import TradeDashboardPage from './pages/TradeDashboardPage'
import TradeApplicationsPage from './pages/TradeApplicationsPage'
import ApplicationDetailPage from './pages/ApplicationDetailPage'
import AssignmentsInspectionsPage from './pages/AssignmentsInspectionsPage'
import TradeApprovalsPage from './pages/TradeApprovalsPage'
import LicensesPaymentsPage from './pages/LicensesPaymentsPage'

export const tradeLicenseRoutes = (
  <Route path="trade-license" element={<TradeLicenseLayout />}>
    <Route index element={<Navigate to="/trade-license/dashboard" replace />} />
    <Route path="dashboard" element={<TradeDashboardPage />} />
    <Route path="applications" element={<TradeApplicationsPage />} />
    <Route path="applications/:id" element={<ApplicationDetailPage />} />
    <Route path="inspections" element={<AssignmentsInspectionsPage />} />
    <Route path="approvals" element={<TradeApprovalsPage />} />
    <Route path="licenses" element={<LicensesPaymentsPage />} />
  </Route>
)

export default tradeLicenseRoutes
