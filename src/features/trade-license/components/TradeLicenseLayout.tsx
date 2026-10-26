import React from 'react'
import { Link, Outlet } from 'react-router-dom'
import { CheckCircle2, Lock, X, AlertCircle } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { TradeLicenseProvider, useTradeLicense } from '../context/TradeLicenseContext'
import { designationsForRole } from '../config/defaultConfig'
import { ErrorBanner, Spinner } from './ui'

const Toasts: React.FC = () => {
  const { toasts, dismissToast } = useTradeLicense()
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[80] flex flex-col gap-2 w-[min(92vw,420px)]" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-2 p-3 rounded-xl shadow-lg border text-xs font-medium animate-fade-in ${
            t.kind === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {t.kind === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
          <span className="flex-1">{t.message}</span>
          <button type="button" onClick={() => dismissToast(t.id)} className="p-0.5 rounded hover:bg-black/5 cursor-pointer" aria-label="Dismiss">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}

const Body: React.FC = () => {
  const { isLoading, loadError, db } = useTradeLicense()
  return (
    <div className="space-y-4 animate-fade-in pb-12">
      {isLoading && !db ? <Spinner label="Loading trade licence records…" /> : loadError ? <ErrorBanner message={loadError} /> : <Outlet />}
      <Toasts />
    </div>
  )
}

export const TradeLicenseLayout: React.FC = () => {
  const { user } = useAuth()
  if (designationsForRole(user?.role).length === 0) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white border border-rose-200 rounded-2xl shadow-sm text-center animate-fade-in">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Council Officers Only</h2>
        <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
          The Trade License module is available to authorised Pradeshiya Sabha staff. Your current role (
          <strong className="uppercase">{user?.role || 'none'}</strong>) does not have access.
        </p>
        <Link to="/overview" className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">
          Back to Overview
        </Link>
      </div>
    )
  }
  return (
    <TradeLicenseProvider>
      <Body />
    </TradeLicenseProvider>
  )
}

export default TradeLicenseLayout
