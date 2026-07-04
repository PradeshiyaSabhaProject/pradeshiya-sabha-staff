import { Route, Navigate } from 'react-router-dom'
import AssetOverviewPage from './AssetOverviewPage'
import AssetDirectoryPage from './AssetDirectoryPage'

// Feature-scoped routes for Asset Management
export const assetRoutes = (
  <>
    <Route path="assets" element={<Navigate to="/assets/overview" replace />} />
    <Route path="assets/overview" element={<AssetOverviewPage />} />
    <Route path="assets/directory" element={<AssetDirectoryPage />} />
  </>
)

export default assetRoutes
