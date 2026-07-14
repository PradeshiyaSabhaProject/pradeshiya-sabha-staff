import { Route, Navigate } from 'react-router-dom'
import { FleetOverviewPage } from './FleetOverviewPage'
import { FleetDirectoryPage } from './FleetDirectoryPage'
import { FleetDispatchPage } from './FleetDispatchPage'
import { FleetMaintenancePage } from './FleetMaintenancePage'
import { FleetDriversPage } from './FleetDriversPage'
import { FleetApprovalsPage } from './FleetApprovalsPage'

export const fleetRoutes = (
  <>
    <Route path="fleet" element={<Navigate to="/fleet/overview" replace />} />
    <Route path="fleet/overview" element={<FleetOverviewPage />} />
    <Route path="fleet/vehicles" element={<FleetDirectoryPage />} />
    <Route path="fleet/dispatch" element={<FleetDispatchPage />} />
    <Route path="fleet/maintenance" element={<FleetMaintenancePage />} />
    <Route path="fleet/drivers" element={<FleetDriversPage />} />
    <Route path="fleet/approvals" element={<FleetApprovalsPage />} />
  </>
)

export default fleetRoutes

