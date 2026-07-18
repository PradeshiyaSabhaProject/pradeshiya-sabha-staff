import { Route, Navigate } from 'react-router-dom'
import AllBookingsPage from './pages/AllBookingsPage'
import BookingApprovalsQueuePage from './pages/BookingApprovalsQueuePage'
import FacilitySchedulePage from './pages/FacilitySchedulePage'

export const bookingRoutes = (
  <>
    <Route path="bookings/all" element={<AllBookingsPage />} />
    <Route path="bookings/approvals" element={<BookingApprovalsQueuePage />} />
    <Route path="bookings/schedule" element={<FacilitySchedulePage />} />
    <Route path="bookings" element={<Navigate to="all" replace />} />
  </>
)

export default bookingRoutes
