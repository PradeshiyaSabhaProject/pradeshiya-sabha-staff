import React from 'react'
import { Outlet } from 'react-router-dom'
import TopBar from '../components/layout/TopBar'
import Sidebar from '../components/layout/Sidebar'

const DashboardLayout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* â”€â”€ Sticky Top Header (two-row) â”€â”€ */}
      <TopBar />

      {/* â”€â”€ Body: Sidebar + Main Content (fills remaining height) â”€â”€ */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar â€” fixed height, only middle nav scrolls */}
        <Sidebar />

        {/* Main content â€” scrolls independently */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout

