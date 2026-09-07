import React, { useState } from 'react'
import type { AppUser } from '../types'

interface ResetPasswordModalProps {
  user: AppUser | null
  newPassword?: string
  isOpen: boolean
  onClose: () => void
}

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  user,
  newPassword,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false)

  if (!isOpen || !user) return null

  const handleCopy = () => {
    if (newPassword || user.tempPassword) {
      navigator.clipboard.writeText(newPassword || user.tempPassword || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded shadow-2xl max-w-md w-full overflow-hidden border border-gray-300 flex flex-col">
        
        {/* Clean Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded bg-[#A31736]/10 border border-[#A31736]/20 flex items-center justify-center font-bold text-[#A31736] text-xs shrink-0">
              {user.avatarInitials || 'U'}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-gray-900 uppercase tracking-tight truncate">Temporary Password Set</h2>
              <p className="text-xs text-gray-500 truncate">Security Credentials Updated</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded transition-colors cursor-pointer shrink-0"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-900 flex gap-2.5 shadow-xs">
            <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-bold mb-0.5 uppercase tracking-wider text-[10px] text-amber-800">Notice to Administrator</p>
              <p className="text-[11px] leading-relaxed">Please share these credentials securely with the employee. The user will be prompted to create a new password upon their first login.</p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded p-3.5 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Employee Name:</span>
              <span className="font-bold text-gray-900">{user.employeeName}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Employee ID:</span>
              <span className="font-mono font-bold text-gray-800 bg-white px-1.5 py-0.5 rounded border border-gray-200 text-[11px]">{user.employeeId}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Login Email:</span>
              <span className="font-semibold text-gray-800 truncate max-w-[180px]">{user.email}</span>
            </div>
            <hr className="border-gray-200" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Temporary Password:</span>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white border border-gray-300 rounded px-3 py-1.5 font-mono text-xs font-bold text-gray-900 tracking-wider shadow-inner select-all">
                  {newPassword || user.tempPassword || '••••••••'}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0 ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#A31736] hover:bg-[#801028] text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <CheckIcon />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#A31736] hover:bg-[#801028] text-white rounded text-xs font-bold uppercase tracking-wider shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <CheckIcon />
            <span>Done</span>
          </button>
        </div>

      </div>
    </div>
  )
}
