import { Route, Navigate } from 'react-router-dom'
import AssetOverviewPage from './AssetOverviewPage'

// Feature-scoped routes for Asset Management
export const assetRoutes = (
  <>
    <Route path="assets" element={<Navigate to="/assets/overview" replace />} />
    <Route path="assets/overview" element={<AssetOverviewPage />} />
  </>
)

export default assetRoutes
