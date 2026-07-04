import { Route } from 'react-router-dom'
import ComplainPage from './ComplainPage'
import AssignedOfficersPage from './AssignedOfficersPage'

// Feature-scoped routes for Complaints
export const complainRoutes = (
  <>
    <Route path="complaints/all" element={<ComplainPage />} />
    <Route path="complaints" element={<ComplainPage />} />
    <Route path="complaints/officers" element={<AssignedOfficersPage />} />
  </>
)
export default complainRoutes
