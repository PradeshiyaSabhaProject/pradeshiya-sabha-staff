import { Route, Navigate } from 'react-router-dom'
import FinanceOverviewPage from './pages/FinanceOverviewPage'
import BankReconciliationPage from './pages/BankReconciliationPage'
import FinancialReportsPage from './pages/FinancialReportsPage'

export const financeRoutes = (
  <>
    <Route path="finances" element={<Navigate to="/finances/overview" replace />} />
    <Route path="finances/overview" element={<FinanceOverviewPage />} />
    <Route path="finances/reconciliation" element={<BankReconciliationPage />} />
    <Route path="finances/reports" element={<FinancialReportsPage />} />
    {/* Aliases for /finance route prefix */}
    <Route path="finance" element={<Navigate to="/finances/overview" replace />} />
    <Route path="finance/overview" element={<Navigate to="/finances/overview" replace />} />
    <Route path="finance/reconciliation" element={<Navigate to="/finances/reconciliation" replace />} />
    <Route path="finance/reports" element={<Navigate to="/finances/reports" replace />} />
  </>
)

export default financeRoutes

