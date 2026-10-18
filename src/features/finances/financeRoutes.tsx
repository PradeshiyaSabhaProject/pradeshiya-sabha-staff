import { Route, Navigate } from 'react-router-dom'
import FinanceOverviewPage from './pages/FinanceOverviewPage'
import BankReconciliationPage from './pages/BankReconciliationPage'
import InvoicesRevenuesPage from './pages/InvoicesRevenuesPage'
import VaripanamGuard from './varipanam/components/VaripanamGuard'
import VaripanamDashboardPage from './varipanam/pages/VaripanamDashboardPage'
import Property360Page from './varipanam/pages/Property360Page'

export const financeRoutes = (
  <>
    <Route path="finances" element={<Navigate to="/finances/overview" replace />} />
    <Route path="finances/overview" element={<FinanceOverviewPage />} />
    <Route path="finances/invoices" element={<InvoicesRevenuesPage />} />
    <Route path="finances/reconciliation" element={<BankReconciliationPage />} />

    {/* Varipanam / Property Assessment Rates Sub-Routes (Super Admin Only) */}
    <Route
      path="finances/varipanam"
      element={
        <VaripanamGuard>
          <Navigate to="/finances/varipanam/dashboard" replace />
        </VaripanamGuard>
      }
    />
    <Route
      path="finances/varipanam/dashboard"
      element={
        <VaripanamGuard>
          <VaripanamDashboardPage />
        </VaripanamGuard>
      }
    />
    <Route
      path="finances/varipanam/properties"
      element={
        <VaripanamGuard>
          <VaripanamDashboardPage />
        </VaripanamGuard>
      }
    />
    <Route
      path="finances/varipanam/properties/:id"
      element={
        <VaripanamGuard>
          <Property360Page />
        </VaripanamGuard>
      }
    />
  </>
)

export default financeRoutes

