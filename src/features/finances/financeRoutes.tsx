import { Route, Navigate } from 'react-router-dom'
import FinanceOverviewPage from './pages/FinanceOverviewPage'
import BankReconciliationPage from './pages/BankReconciliationPage'
import AssessmentRatesPage from './pages/AssessmentRatesPage'

export const financeRoutes = (
  <>
    <Route path="finances" element={<Navigate to="/finances/overview" replace />} />
    <Route path="finances/overview" element={<FinanceOverviewPage />} />
    <Route path="finances/reconciliation" element={<BankReconciliationPage />} />
    <Route path="finances/assessment-rates" element={<AssessmentRatesPage />} />
  </>
)

export default financeRoutes

