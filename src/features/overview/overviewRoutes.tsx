import { Route, Navigate } from 'react-router-dom'
import OverviewPage from './OverviewPage'

// Feature-scoped routes for Overview
export const overviewRoutes = (
  <>
    <Route index element={<Navigate to="/overview" replace />} />
    <Route path="overview" element={<OverviewPage />} />
  </>
)
export default overviewRoutes

