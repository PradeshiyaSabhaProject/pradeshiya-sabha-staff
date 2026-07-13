import { Route, Navigate } from 'react-router-dom'
import AssetOverviewPage from './AssetOverviewPage'
import AssetDirectoryPage from './AssetDirectoryPage'
import InteractiveGISMappingPage from './InteractiveGISMappingPage'

// Feature-scoped routes for Asset Management
export const assetRoutes = (
  <>
    <Route path="assets" element={<Navigate to="/assets/overview" replace />} />
    <Route path="assets/overview" element={<AssetOverviewPage />} />
    <Route path="assets/directory" element={<AssetDirectoryPage />} />
    <Route path="assets/gis-mapping" element={<InteractiveGISMappingPage />} />
  </>
)

export default assetRoutes

