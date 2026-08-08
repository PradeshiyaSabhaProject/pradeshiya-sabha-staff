import { Route, Navigate } from 'react-router-dom'
import { KpiOverviewPage } from './KpiOverviewPage'
import { MyKpiPage } from './MyKpiPage'
import { TeamKpiPage } from './TeamKpiPage'

const kpiRoutes = (
  <>
    <Route path="kpi" element={<Navigate to="/kpi/overview" replace />} />
    <Route path="kpi/overview" element={<KpiOverviewPage />} />
    <Route path="kpi/my-kpi" element={<MyKpiPage />} />
    <Route path="kpi/team-kpi" element={<TeamKpiPage />} />
  </>
)

export default kpiRoutes
