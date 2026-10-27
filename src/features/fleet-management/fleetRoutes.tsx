import { Route, Navigate } from 'react-router-dom'
import { FleetOverviewPage } from './FleetOverviewPage'
import { FleetDirectoryPage } from './FleetDirectoryPage'
import { FleetDispatchPage } from './FleetDispatchPage'
import { FleetMaintenancePage } from './FleetMaintenancePage'
import { FleetDriversPage } from './FleetDriversPage'
import { FleetApprovalsPage } from './FleetApprovalsPage'
import { FleetBookingsPage } from './FleetBookingsPage'
import { FleetTechnicalReviewsPage } from './FleetTechnicalReviewsPage'
import { FLEET_TECHNICAL_REVIEW_ROUTE } from './fleetNavigation'

export const fleetRoutes = (
  <>
    <Route path="fleet" element={<Navigate to="/fleet/overview" replace />} />
    <Route path="fleet/overview" element={<FleetOverviewPage />} />
    <Route path="fleet/vehicles" element={<FleetDirectoryPage />} />
    <Route path="fleet/dispatch" element={<FleetDispatchPage />} />
    <Route path="fleet/bookings" element={<FleetBookingsPage />} />
    <Route path="fleet/maintenance" element={<FleetMaintenancePage />} />
    <Route path="fleet/drivers" element={<FleetDriversPage />} />
    <Route path="fleet/approvals" element={<FleetApprovalsPage />} />
    <Route path={FLEET_TECHNICAL_REVIEW_ROUTE} element={<FleetTechnicalReviewsPage />} />
  </>
)

export default fleetRoutes
