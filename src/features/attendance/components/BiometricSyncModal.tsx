import React, { useState } from 'react'

interface BiometricSyncModalProps {
  isOpen: boolean
  onClose: () => void
  onSyncComplete: () => void
}

export const BiometricSyncModal: React.FC<BiometricSyncModalProps> = ({ isOpen, onClose, onSyncComplete }) => {
  const [syncing, setSyncing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [logsSynced, setLogsSynced] = useState<number | null>(null)

  if (!isOpen) return null

  const handleStartSync = () => {
    setSyncing(true)
    setProgress(20)
    setTimeout(() => setProgress(55), 400)
    setTimeout(() => setProgress(85), 800)
    setTimeout(() => {
      setProgress(100)
      setSyncing(false)
      setLogsSynced(142)
      onSyncComplete()
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-lg w-full overflow-hidden text-left">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold">Biometric Fingerprint Machine Sync</h3>
              <p className="text-xs text-emerald-100">Live hardware connection & timecard fetch</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Device Status List */}
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
              <div className="flex items-center space-x-3">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                <div>
                  <div className="text-sm font-bold text-gray-800">Main Building Gate - ZKTeco F18 #1</div>
                  <div className="text-xs text-gray-500">IP: 192.168.1.201 • Port: 4370 • Biometric Template v10.0</div>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                Online (12 ms)
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
              <div className="flex items-center space-x-3">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                <div>
                  <div className="text-sm font-bold text-gray-800">Annex Works Dept - ZKTeco F18 #2</div>
                  <div className="text-xs text-gray-500">IP: 192.168.1.202 • Port: 4370 • Biometric Template v10.0</div>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                Online (15 ms)
              </span>
            </div>
          </div>

          {/* Sync Progress Bar */}
          {syncing && (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-gray-600">
                <span>Pulling latest raw attendance punches...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {logsSynced !== null && !syncing && (
            <div className="p-3.5 bg-emerald-100/80 border border-emerald-300 rounded-xl flex items-center space-x-3 text-emerald-900 text-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5 text-emerald-700 shrink-0">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <div>
                <strong>Successfully Synced!</strong> Fetched {logsSynced} daily punch events and refreshed all employee timecards.
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
            >
              Close
            </button>
            <button
              onClick={handleStartSync}
              disabled={syncing}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-semibold shadow-md transition disabled:opacity-60"
            >
              {syncing ? 'Syncing...' : 'Sync Punches Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
