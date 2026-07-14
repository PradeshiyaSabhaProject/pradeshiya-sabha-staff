import { Route, Navigate } from 'react-router-dom'
import AllApplicationsPage from './AllApplicationsPage'
import MyApplicationsPage from './pages/MyApplicationsPage'
import ApplicationOfficersPage from './pages/ApplicationOfficersPage'

// Feature-scoped routes for Application Management
export const applicationRoutes = (
  <>
    <Route path="applications/all" element={<AllApplicationsPage />} />
    <Route path="applications/my" element={<MyApplicationsPage />} />
    <Route path="applications/officers" element={<ApplicationOfficersPage />} />
    <Route path="applications" element={<Navigate to="all" replace />} />
  </>
)

export default applicationRoutes
