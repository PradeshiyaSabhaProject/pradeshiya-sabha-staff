import { Route, Navigate } from 'react-router-dom'
import FinanceOverviewPage from './pages/FinanceOverviewPage'
import BankReconciliationPage from './pages/BankReconciliationPage'
import InvoicesRevenuesPage from './pages/InvoicesRevenuesPage'

export const financeRoutes = (
  <>
    <Route path="finances" element={<Navigate to="/finances/overview" replace />} />
    <Route path="finances/overview" element={<FinanceOverviewPage />} />
    <Route path="finances/invoices" element={<InvoicesRevenuesPage />} />
    <Route path="finances/reconciliation" element={<BankReconciliationPage />} />
  </>
)

export default financeRoutes

