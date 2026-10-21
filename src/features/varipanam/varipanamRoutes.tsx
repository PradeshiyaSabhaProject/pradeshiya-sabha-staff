import { Route, Navigate } from 'react-router-dom'
import VaripanamLayout from './components/VaripanamLayout'
import VaripanamOverviewPage from './pages/VaripanamOverviewPage'
import PropertyRegistryPage from './pages/PropertyRegistryPage'
import Property360Page from './pages/Property360Page'
import AddNewPropertyPage from './pages/AddNewPropertyPage'
import ApprovalsPage from './pages/ApprovalsPage'
import SubdivisionPage from './pages/SubdivisionPage'
import OwnershipChangePage from './pages/OwnershipChangePage'
import ValuationReliefPage from './pages/ValuationReliefPage'
import AssessmentNoticesPage from './pages/AssessmentNoticesPage'
import BillingPaymentsPage from './pages/BillingPaymentsPage'
import ArrearsWarrantsPage from './pages/ArrearsWarrantsPage'
import FieldCollectionPage from './pages/FieldCollectionPage'
import HistoricalSearchPage from './pages/HistoricalSearchPage'
import VaripanamReportsPage from './pages/VaripanamReportsPage'
import VaripanamSettingsPage from './pages/VaripanamSettingsPage'

export const varipanamRoutes = (
  <>
    {/* Varipanam Management Routes */}
    <Route path="varipanam" element={<VaripanamLayout />}>
      <Route index element={<Navigate to="/varipanam/overview" replace />} />
      <Route path="dashboard" element={<Navigate to="/varipanam/overview" replace />} />
      <Route path="overview" element={<VaripanamOverviewPage />} />
      <Route path="properties" element={<PropertyRegistryPage />} />
      <Route path="properties/:id" element={<Property360Page />} />
      <Route path="add-property" element={<AddNewPropertyPage />} />
      <Route path="approvals" element={<ApprovalsPage />} />
      <Route path="subdivision" element={<SubdivisionPage />} />
      <Route path="atd" element={<Navigate to="/varipanam/approvals" replace />} />
      <Route path="ownership-change" element={<OwnershipChangePage />} />
      <Route path="valuation-relief" element={<ValuationReliefPage />} />
      <Route path="notices" element={<AssessmentNoticesPage />} />
      <Route path="billing-payments" element={<BillingPaymentsPage />} />
      <Route path="arrears-warrants" element={<ArrearsWarrantsPage />} />
      <Route path="field-collection" element={<FieldCollectionPage />} />
      <Route path="historical-search" element={<HistoricalSearchPage />} />
      <Route path="reports" element={<VaripanamReportsPage />} />
      <Route path="settings" element={<VaripanamSettingsPage />} />
    </Route>

    {/* Legacy finances/varipanam routes for backwards compatibility */}
    <Route path="finances/varipanam" element={<Navigate to="/varipanam/overview" replace />} />
    <Route path="finances/varipanam/dashboard" element={<Navigate to="/varipanam/overview" replace />} />
    <Route path="finances/varipanam/overview" element={<Navigate to="/varipanam/overview" replace />} />
    <Route path="finances/varipanam/properties" element={<Navigate to="/varipanam/properties" replace />} />
    <Route path="finances/varipanam/properties/:id" element={<Navigate to="/varipanam/properties/:id" replace />} />
    <Route path="finances/varipanam/add-property" element={<Navigate to="/varipanam/add-property" replace />} />
    <Route path="finances/varipanam/approvals" element={<Navigate to="/varipanam/approvals" replace />} />
    <Route path="finances/varipanam/subdivision" element={<Navigate to="/varipanam/subdivision" replace />} />
    <Route path="finances/varipanam/ownership-change" element={<Navigate to="/varipanam/ownership-change" replace />} />
    <Route path="finances/varipanam/valuation-relief" element={<Navigate to="/varipanam/valuation-relief" replace />} />
    <Route path="finances/varipanam/notices" element={<Navigate to="/varipanam/notices" replace />} />
    <Route path="finances/varipanam/billing-payments" element={<Navigate to="/varipanam/billing-payments" replace />} />
    <Route path="finances/varipanam/arrears-warrants" element={<Navigate to="/varipanam/arrears-warrants" replace />} />
    <Route path="finances/varipanam/field-collection" element={<Navigate to="/varipanam/field-collection" replace />} />
    <Route path="finances/varipanam/historical-search" element={<Navigate to="/varipanam/historical-search" replace />} />
    <Route path="finances/varipanam/reports" element={<Navigate to="/varipanam/reports" replace />} />
    <Route path="finances/varipanam/settings" element={<Navigate to="/varipanam/settings" replace />} />
  </>
)

export default varipanamRoutes
