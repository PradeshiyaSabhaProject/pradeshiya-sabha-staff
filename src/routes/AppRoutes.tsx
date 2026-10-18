import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import overviewRoutes from '../features/overview/overviewRoutes'
import assetRoutes from '../features/asset-management/assetRoutes'
import appointmentRoutes from '../features/appointment/appointmentRoutes'
import complainRoutes from '../features/complain/complainRoutes'
import letterRoutes from '../features/letters/letterRoutes'
import applicationRoutes from '../features/application-management/applicationRoutes'
import attendanceRoutes from '../features/attendance/attendanceRoutes'
import kpiRoutes from '../features/kpi/kpiRoutes'
import fleetRoutes from '../features/fleet-management/fleetRoutes'
import userRoutes from '../features/user-management/userRoutes'
import bookingRoutes from '../features/booking-management/bookingRoutes'
import inventoryRoutes from '../features/inventory-management/inventoryRoutes'
import profileRoutes from '../features/profile/profileRoutes'
import LoginPage from '../features/auth/LoginPage'
import { useAuth } from '../context/AuthContext'

const DummySection: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-300 animate-fade-in shadow-sm">
    <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
    <p className="text-sm text-slate-400">{desc}</p>
  </div>
)

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  if (user) {
    return <Navigate to="/overview" replace />
  }
  return <>{children}</>
}

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Login Route */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Main Layout wrapping all feature routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Import feature routes */}
        {overviewRoutes}
        {attendanceRoutes}
        {kpiRoutes}

        {/* Appointment Management Routes */}
        {appointmentRoutes}
        <Route path="appointments/audits" element={<DummySection title="System Audits (Restricted)" desc="Confidential audit logs and system administration activity." />} />

        {/* Other Feature Routes */}
        {assetRoutes}
        {fleetRoutes}
        {complainRoutes}
        {letterRoutes}
        {applicationRoutes}
        {bookingRoutes}
        {inventoryRoutes}
        {userRoutes}
        {profileRoutes}
        <Route path="archive" element={<DummySection title="Data Archive" desc="Historical council records, closed complaints, and archived resolutions." />} />

        {/* Settings Route */}
        <Route path="settings" element={<DummySection title="System Settings" desc="Configure portal preferences, language rules, and integration endpoints." />} />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Route>
    </Routes>
  )
}
export default AppRoutes

