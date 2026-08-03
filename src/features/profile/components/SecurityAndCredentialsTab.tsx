import React, { useState } from 'react'
import type { SecuritySession } from '../types'
import Input from '../../../components/Input'
import Button from '../../../components/Button'

interface SecurityAndCredentialsTabProps {
  sessions: SecuritySession[]
  onRevokeSession: (sessionId: string) => void
  onUpdatePassword: (current: string, next: string) => void
}


const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-[#801028]">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-blue-600">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-emerald-600">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

const MonitorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-gray-700">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
)

export const SecurityAndCredentialsTab: React.FC<SecurityAndCredentialsTabProps> = ({
  sessions,
  onRevokeSession,
  onUpdatePassword,
}) => {
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [passMessage, setPassMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [registeredPhone] = useState('+94 77 342 9182')

  // OTP Verification state strictly for updating password/credentials
  const [isVerifyingPasswordOtp, setIsVerifyingPasswordOtp] = useState(false)
  const [passwordOtpCode, setPasswordOtpCode] = useState('')
  const [passwordOtpError, setPasswordOtpError] = useState('')

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPassMessage(null)
    if (!currentPass || !newPass) {
      setPassMessage({ type: 'error', text: 'Please fill out all password fields.' })
      return
    }
    if (newPass !== confirmPass) {
      setPassMessage({ type: 'error', text: 'New password and confirmation do not match.' })
      return
    }
    if (newPass.length < 8) {
      setPassMessage({ type: 'error', text: 'Password must be at least 8 characters with numbers & symbols.' })
      return
    }

    setPasswordOtpError('')
    setPasswordOtpCode('')
    setIsVerifyingPasswordOtp(true)
  }

  const executeCredentialUpdate = () => {
    onUpdatePassword(currentPass, newPass)
    setPassMessage({ type: 'success', text: '✔ Security credentials updated successfully across all council terminals.' })
    setCurrentPass('')
    setNewPass('')
    setConfirmPass('')
    setIsVerifyingPasswordOtp(false)
    setTimeout(() => setPassMessage(null), 5000)
  }

  const handleConfirmPasswordOtp = () => {
    if (passwordOtpCode.trim().length < 6) {
      setPasswordOtpError('Please enter the valid 6-digit SMS verification code.')
      return
    }
    setPasswordOtpError('')
    executeCredentialUpdate()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Update Security Credentials Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
          <div className="p-1.5 rounded bg-[#801028]/10">
            <LockIcon />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">Update Security Credentials</h3>
            <p className="text-xs text-gray-500">Modify your council terminal login password (requires SMS OTP verification)</p>
          </div>
        </div>

        {passMessage && (
          <div
            className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 border ${passMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
              }`}
          >
            <span>{passMessage.type === 'success' ? '✔' : '⚠'}</span>
            <span>{passMessage.text}</span>
          </div>
        )}

        {isVerifyingPasswordOtp ? (
          <div className="bg-red-50/50 border border-[#801028]/30 rounded-xl p-5 space-y-4 animate-fade-in max-w-2xl">
            <div className="flex items-center gap-2.5 text-[#801028]">
              <PhoneIcon />
              <h4 className="font-bold text-sm">SMS OTP Verification Required</h4>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">
              To complete updating your security credentials, please enter the 6-digit verification code sent via SMS to your registered mobile <strong className="font-mono text-gray-900">{registeredPhone}</strong>.
            </p>

            {passwordOtpError && (
              <div className="bg-red-100 text-red-800 p-2 rounded text-xs font-semibold">
                ⚠️ {passwordOtpError}
              </div>
            )}

            <div>
              <label htmlFor="passwordOtpCode" className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">/*change*/
                Enter 6-Digit SMS OTP
              </label>
              <div className="flex gap-2 max-w-md">
                <input
                  id="passwordOtpCode"
                  name="passwordOtpCode"
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 894215"
                  value={passwordOtpCode}
                  onChange={(e) => setPasswordOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 bg-white border border-gray-300 rounded-lg px-3.5 py-2 font-mono font-bold text-base tracking-widest text-center text-[#801028] focus:outline-none focus:ring-2 focus:ring-[#801028] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setPasswordOtpCode('894215')}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  Auto-fill Demo
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 max-w-md">
              <button
                type="button"
                onClick={() => setIsVerifyingPasswordOtp(false)}
                className="text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                Cancel
              </button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleConfirmPasswordOtp}
                  className="text-xs py-2 uppercase tracking-wider shadow-sm"
                >
                  Verify & Update Credentials
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-2xl">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••••••"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
            />
            <Input
              label="New Strong Password"
              type="password"
              placeholder="••••••••••••"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••••••"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
            />

            <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-200 text-xs space-y-1.5 text-gray-600">
              <p className="font-bold text-gray-700">Council Password & Credential Policy:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                <li>Minimum 8 characters (12+ recommended for Grade I / II Officers)</li>
                <li>At least one uppercase letter and one numeric digit</li>
                <li>At least one special symbol (! @ # $ % &)</li>
                <li>Requires SMS OTP verification sent to registered mobile before updating</li>
              </ul>
            </div>

            <Button type="submit" variant="primary" className="justify-center shadow-sm uppercase tracking-wider">
              Update Security Credentials
            </Button>
          </form>
        )}
      </div>

      {/* Active Sessions Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-emerald-50">
              <GlobeIcon />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Active Logged-In Sessions</h3>
              <p className="text-xs text-gray-500">Manage all devices currently accessing your administrative profile</p>
            </div>
          </div>
          <span className="text-xs font-bold bg-gray-100 px-3 py-1 rounded-full text-gray-700 border border-gray-200">
            {sessions.length} {sessions.length === 1 ? 'Active Device' : 'Active Devices'}
          </span>
        </div>

        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${session.isCurrent
                  ? 'bg-red-50/20 border-[#801028]/30 shadow-2xs'
                  : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-gray-100 border border-gray-200 shrink-0 mt-0.5">
                  <MonitorIcon />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-gray-900">{session.device}</h4>
                    {session.isCurrent && (
                      <span className="bg-[#801028] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">
                        Current Session
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">
                    <span className="font-medium">{session.browser}</span> • <span className="font-mono text-gray-500">{session.ipAddress}</span>
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                    <span>{session.location}</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-semibold">{session.lastActive}</span>
                  </p>
                </div>
              </div>

              {!session.isCurrent && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onRevokeSession(session.id)}
                  className="shrink-0 w-full sm:w-auto text-xs py-1.5 uppercase tracking-wider"
                >
                  Revoke Access
                </Button>
              )}
            </div>
          ))}

          {sessions.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">No active sessions recorded.</div>
          )}
        </div>
      </div>
    </div>
  )
}
export default SecurityAndCredentialsTab

