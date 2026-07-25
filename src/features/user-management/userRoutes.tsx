import { Route, Navigate } from 'react-router-dom'
import { CreateUserPage } from './CreateUserPage'
import { ManageUsersPage } from './ManageUsersPage'
import { AddStaffMemberPage } from './AddStaffMemberPage'
import { ApproveStaffPage } from './ApproveStaffPage'

const userRoutes = (
  <>
    <Route path="users" element={<Navigate to="/users/manage" replace />} />
    <Route path="users/create" element={<CreateUserPage />} />
    <Route path="users/staff/create" element={<AddStaffMemberPage />} />
    <Route path="users/staff/approve" element={<ApproveStaffPage />} />
    <Route path="users/manage" element={<ManageUsersPage />} />
    <Route path="user-management" element={<Navigate to="/users/manage" replace />} />
    <Route path="user-management/create" element={<Navigate to="/users/create" replace />} />
    <Route path="user-management/manage" element={<Navigate to="/users/manage" replace />} />
  </>
)

export default userRoutes
