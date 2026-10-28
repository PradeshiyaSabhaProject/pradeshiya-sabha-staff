import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth, DUMMY_USERS } from '../../../context/AuthContext'

interface VaripanamGuardProps {
  children: React.ReactNode
}

export const VaripanamGuard: React.FC<VaripanamGuardProps> = ({ children }) => {
  const { user, login } = useAuth()

  const isAuthorized = user?.role === 'superadmin' || user?.role === 'admin'

  if (!isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white border border-gray-300 rounded shadow-xs text-center animate-fade-in">
        <div className="w-14 h-14 bg-rose-50 text-[#A31736] rounded flex items-center justify-center mx-auto mb-4 border border-rose-200">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-7 h-7">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2 className="text-lg font-bold uppercase tracking-wide text-gray-900 mb-2">Super Admin Access Only</h2>
        <p className="text-xs text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
          The <strong>Varipanam / Assessment Rates</strong> sub-module contains statutory revenue assessments, warrant enforcement authorizations, and valuation adjustments restricted to Council Super Administrators.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded p-4 text-xs text-amber-800 text-left mb-6 space-y-1">
          <p className="font-bold uppercase tracking-wider text-[11px]">Current Active Session:</p>
          <p>
            User: <span className="font-semibold">{user?.name || 'Anonymous'}</span> ({user?.email})
          </p>
          <p>
            Current Role: <span className="font-semibold uppercase tracking-wider">{user?.role || 'None'}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/overview"
            className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold px-4 py-2 rounded border border-gray-300 transition-colors uppercase tracking-wider shadow-2xs"
          >
            Back to Overview
          </Link>
          <button
            type="button"
            onClick={() => login(DUMMY_USERS.superadmin)}
            className="inline-flex items-center gap-1.5 bg-[#A31736] hover:bg-[#801028] text-white text-xs font-bold px-4 py-2 rounded transition-colors shadow-2xs uppercase tracking-wider cursor-pointer"
          >
            Switch to Super Admin (Dev Bypass)
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default VaripanamGuard
