import { Route, Navigate } from 'react-router-dom'
import ComplainPage from './ComplainPage'
import AssignedOfficersPage from './AssignedOfficersPage'
import MyComplaintsPage from './pages/MyComplaintsPage'

// Feature-scoped routes for Complaints
export const complainRoutes = (
  <>
    <Route path="complaints/all" element={<ComplainPage />} />
    <Route path="complaints" element={<ComplainPage />} />
    <Route path="complaints/officers" element={<AssignedOfficersPage />} />
    <Route path="complaints" element={<Navigate to="all" replace />} />
    <Route path="complaints/all" element={<ComplainPage />} />
    <Route path="complaints/my" element={<MyComplaintsPage />} />
  </>
)
export default complainRoutes

