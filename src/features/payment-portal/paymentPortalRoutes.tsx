import { Route, Navigate } from 'react-router-dom'
import PaymentPortalLayout from './context/PaymentPortalContext'
import PaymentOverviewPage from './pages/PaymentOverviewPage'
import PaymentCollectionPage from './pages/PaymentCollectionPage'
import VaripanamCollectionPage from './pages/VaripanamCollectionPage'
import TotalPaymentsPage from './pages/TotalPaymentsPage'

export const paymentPortalRoutes = (
  <Route path="payment-portal" element={<PaymentPortalLayout />}>
    <Route index element={<Navigate to="/payment-portal/overview" replace />} />
    <Route path="overview" element={<PaymentOverviewPage />} />
    <Route path="collection" element={<PaymentCollectionPage />} />
    <Route path="collection/varipanam" element={<VaripanamCollectionPage />} />
    <Route path="total-payments" element={<TotalPaymentsPage />} />
  </Route>
)

export default paymentPortalRoutes
