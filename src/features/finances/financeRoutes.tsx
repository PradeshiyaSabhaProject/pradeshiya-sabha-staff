import { Route, Navigate } from 'react-router-dom'
import FinanceOverviewPage from './pages/FinanceOverviewPage'

export const financeRoutes = (
  <>
    <Route path="finances" element={<Navigate to="/finances/overview" replace />} />
    <Route path="finances/overview" element={<FinanceOverviewPage />} />
  </>
)

export default financeRoutes

