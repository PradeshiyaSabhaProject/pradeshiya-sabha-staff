import { Route } from 'react-router-dom'
import ComplainPage from './ComplainPage'

// Feature-scoped routes for Complaints
export const complainRoutes = (
  <>
    <Route path="complaints" element={<ComplainPage />} />
  </>
)
export default complainRoutes
