import { Route, Navigate } from 'react-router-dom'
import AllLettersPage from './pages/AllLettersPage'
import MyLettersPage from './pages/MyLettersPage'
import InwardLettersPage from './pages/InwardLettersPage'
import OutwardLettersPage from './pages/OutwardLettersPage'
import AssignedOfficersPage from './pages/AssignedOfficersPage'
import WriteLetterPage from './pages/WriteLetterPage'

export const letterRoutes = (
  <>
    <Route path="letters" element={<Navigate to="all" replace />} />
    <Route path="letters/all" element={<AllLettersPage />} />
    <Route path="letters/my" element={<MyLettersPage />} />
    <Route path="letters/inward" element={<InwardLettersPage />} />
    <Route path="letters/outward" element={<OutwardLettersPage />} />
    <Route path="letters/assigned" element={<AssignedOfficersPage />} />
    <Route path="letters/write" element={<WriteLetterPage />} />
  </>
)

export default letterRoutes

