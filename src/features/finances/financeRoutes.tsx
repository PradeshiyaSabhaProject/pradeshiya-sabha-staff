import { Route, Navigate } from 'react-router-dom'
import FinanceOverviewPage from './pages/FinanceOverviewPage'
import BankReconciliationPage from './pages/BankReconciliationPage'
import InvoicesRevenuesPage from './pages/InvoicesRevenuesPage'
import VaripanamLayout from '../varipanam/components/VaripanamLayout'
import VaripanamOverviewPage from '../varipanam/pages/VaripanamOverviewPage'
import PropertyRegistryPage from '../varipanam/pages/PropertyRegistryPage'
import Property360Page from '../varipanam/pages/Property360Page'
import AddNewPropertyPage from '../varipanam/pages/AddNewPropertyPage'
import ApprovalsPage from '../varipanam/pages/ApprovalsPage'
import SubdivisionPage from '../varipanam/pages/SubdivisionPage'
import OwnershipChangePage from '../varipanam/pages/OwnershipChangePage'
import ValuationReliefPage from '../varipanam/pages/ValuationReliefPage'
import AssessmentNoticesPage from '../varipanam/pages/AssessmentNoticesPage'
import BillingPaymentsPage from '../varipanam/pages/BillingPaymentsPage'
import ArrearsWarrantsPage from '../varipanam/pages/ArrearsWarrantsPage'
import FieldCollectionPage from '../varipanam/pages/FieldCollectionPage'
import HistoricalSearchPage from '../varipanam/pages/HistoricalSearchPage'
import VaripanamReportsPage from '../varipanam/pages/VaripanamReportsPage'
import VaripanamSettingsPage from '../varipanam/pages/VaripanamSettingsPage'

export const financeRoutes = (
  <>
    <Route path="finances" element={<Navigate to="/finances/overview" replace />} />
    <Route path="finances/overview" element={<FinanceOverviewPage />} />
    <Route path="finances/invoices" element={<InvoicesRevenuesPage />} />
    <Route path="finances/reconciliation" element={<BankReconciliationPage />} />

    {/* Varipanam / Property Assessment Rates (15 Sub-Category Routes) */}
    <Route path="finances/varipanam" element={<VaripanamLayout />}>
      <Route index element={<Navigate to="/finances/varipanam/overview" replace />} />
      <Route path="dashboard" element={<Navigate to="/finances/varipanam/overview" replace />} />
      <Route path="overview" element={<VaripanamOverviewPage />} />
      <Route path="properties" element={<PropertyRegistryPage />} />
      <Route path="properties/:id" element={<Property360Page />} />
      <Route path="add-property" element={<AddNewPropertyPage />} />
      <Route path="approvals" element={<ApprovalsPage />} />
      <Route path="subdivision" element={<SubdivisionPage />} />
      <Route path="atd" element={<Navigate to="/finances/varipanam/approvals" replace />} />
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
  </>
)

export default financeRoutes
