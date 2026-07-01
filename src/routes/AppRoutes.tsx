import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import overviewRoutes from '../features/overview/overviewRoutes'

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Main Layout wrapping all feature routes */}
      <Route path="/" element={<DashboardLayout />}>
        {/* Import feature routes */}
        {overviewRoutes}

        {/* Dummy settings route for navigation demonstration */}
        <Route
          path="settings"
          element={
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-300">
              <h2 className="text-xl font-bold text-white mb-2">System Settings</h2>
              <p className="text-sm text-slate-400">
                This is a dummy settings view. Feature teams can plug their own routes into AppRoutes.
              </p>
            </div>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
export default AppRoutes
