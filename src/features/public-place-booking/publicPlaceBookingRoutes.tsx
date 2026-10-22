import { Navigate, Route } from 'react-router-dom'
import PublicPlaceBookingPage from './pages/PublicPlaceBookingPage'

const publicPlaceBookingRoutes = (
  <>
    <Route path="public-place-booking" element={<Navigate to="/public-place-booking/dashboard" replace />} />
    <Route path="public-place-booking/:section" element={<PublicPlaceBookingPage />} />
  </>
)

export default publicPlaceBookingRoutes
