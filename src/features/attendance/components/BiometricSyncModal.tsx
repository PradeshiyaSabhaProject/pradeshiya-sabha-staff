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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white border border-gray-300 rounded shadow-xl max-w-lg w-full overflow-hidden text-left">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
              Biometric Hardware Sync
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Live hardware connection &amp; punch fetch</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold"
          >
            ✕
          </button>
        </div>

        {/* Device Status List */}
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-white border border-gray-300 rounded">
              <div className="flex items-center space-x-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <div>
                  <div className="text-xs font-bold text-gray-900">Main Gate - ZKTeco F18 #1</div>
                  <div className="text-[11px] text-gray-500 font-mono">IP: 192.168.1.201 • Port: 4370</div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border bg-emerald-100 text-emerald-800 border-emerald-300">
                Online (12 ms)
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-white border border-gray-300 rounded">
              <div className="flex items-center space-x-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <div>
                  <div className="text-xs font-bold text-gray-900">Annex Works Dept - ZKTeco F18 #2</div>
                  <div className="text-[11px] text-gray-500 font-mono">IP: 192.168.1.202 • Port: 4370</div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border bg-emerald-100 text-emerald-800 border-emerald-300">
                Online (15 ms)
              </span>
            </div>
          </div>

          {/* Sync Progress Bar */}
          {syncing && (
            <div className="p-4 bg-gray-50 rounded border border-gray-200 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-gray-700">
                <span>Pulling latest raw attendance punches...</span>
                <span className="font-bold">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-sm h-2 overflow-hidden">
                <div
                  className="bg-[#A31736] h-2 rounded-sm transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {logsSynced !== null && !syncing && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded flex items-center space-x-2.5 text-emerald-900 text-xs">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 text-emerald-700 shrink-0">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <div>
                <strong>Successfully Synced!</strong> Fetched {logsSynced} daily punch events and refreshed employee timecards.
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold px-3.5 py-1.5 rounded border border-gray-300 transition-colors uppercase tracking-wider cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleStartSync}
              disabled={syncing}
              className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition-colors shadow-sm uppercase tracking-wider cursor-pointer disabled:opacity-60"
            >
              {syncing ? 'Syncing...' : 'Sync Punches Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BiometricSyncModal
