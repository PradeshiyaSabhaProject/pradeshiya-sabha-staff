import { Route, Navigate } from 'react-router-dom'
import VaripanamGuard from './components/VaripanamGuard'
import VaripanamDashboardPage from './pages/VaripanamDashboardPage'
import Property360Page from './pages/Property360Page'

export const varipanamRoutes = (
  <>
    {/* Varipanam Feature Routes */}
    <Route
      path="varipanam"
      element={
        <VaripanamGuard>
          <Navigate to="/varipanam/dashboard" replace />
        </VaripanamGuard>
      }
    />
    <Route
      path="varipanam/dashboard"
      element={
        <VaripanamGuard>
          <VaripanamDashboardPage />
        </VaripanamGuard>
      }
    />
    <Route
      path="varipanam/properties"
      element={
        <VaripanamGuard>
          <VaripanamDashboardPage />
        </VaripanamGuard>
      }
    />
    <Route
      path="varipanam/properties/:id"
      element={
        <VaripanamGuard>
          <Property360Page />
        </VaripanamGuard>
      }
    />

    {/* Legacy finances aliases for backwards compatibility */}
    <Route path="finances" element={<Navigate to="/varipanam/dashboard" replace />} />
    <Route path="finances/varipanam" element={<Navigate to="/varipanam/dashboard" replace />} />
    <Route path="finances/varipanam/dashboard" element={<Navigate to="/varipanam/dashboard" replace />} />
    <Route path="finances/varipanam/properties" element={<Navigate to="/varipanam/properties" replace />} />
    <Route path="finances/varipanam/properties/:id" element={<Navigate to="/varipanam/properties/:id" replace />} />
  </>
)

export default varipanamRoutes
