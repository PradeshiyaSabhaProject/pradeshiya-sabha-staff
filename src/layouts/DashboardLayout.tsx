import React from 'react'
import { Outlet } from 'react-router-dom'
import TopBar from '../components/layout/TopBar'
import Sidebar from '../components/layout/Sidebar'

const DashboardLayout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* ── Sticky Top Header (two-row) ── */}
      <TopBar />

      {/* ── Body: Sidebar + Main Content (fills remaining height) ── */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar — responsive (drawer on mobile, collapsible rail on desktop) */}
        <Sidebar />

        {/* Main content — scrolls independently */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout

