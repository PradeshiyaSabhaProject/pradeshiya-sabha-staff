import React from 'react'
import { Route, Navigate } from 'react-router-dom'
import { AttendanceDashboardPage } from './AttendanceDashboardPage'
import { TimecardsPage } from './TimecardsPage'
import { MyLeavePage } from './MyLeavePage'
import { MyAttendanceCorrectionPage } from './MyAttendanceCorrectionPage'
import { AttendanceApprovalsPage } from './AttendanceApprovalsPage'
import { StaffRosterPage } from './StaffRosterPage'

const attendanceRoutes = (
  <>
    <Route path="attendance" element={<Navigate to="/attendance/dashboard" replace />} />
    <Route path="attendance/dashboard" element={<AttendanceDashboardPage />} />
    <Route path="attendance/timecards" element={<TimecardsPage />} />
    <Route path="attendance/my-leave" element={<MyLeavePage />} />
    <Route path="attendance/apply-leave" element={<Navigate to="/attendance/my-leave" replace />} />
    <Route path="attendance/my-corrections" element={<MyAttendanceCorrectionPage />} />
    <Route path="attendance/approvals" element={<AttendanceApprovalsPage />} />
    <Route path="attendance/rosters" element={<StaffRosterPage />} />
    <Route path="attendance/request-regularization" element={<Navigate to="/attendance/my-corrections" replace />} />
    <Route path="attendance/leave" element={<Navigate to="/attendance/my-leave" replace />} />
  </>
)

export default attendanceRoutes
