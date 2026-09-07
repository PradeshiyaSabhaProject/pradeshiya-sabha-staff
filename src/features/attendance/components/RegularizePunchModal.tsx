import React, { useState } from 'react'

interface RegularizePunchModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    employeeName: string
    date: string
    reasonType: string
    requestedCheckIn: string
    requestedCheckOut: string
    justification: string
  }) => void
}

export const RegularizePunchModal: React.FC<RegularizePunchModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [employeeName] = useState('Kasun Perera (PS-EMP-0012)')
  const [date, setDate] = useState('2026-07-10')
  const [reasonType, setReasonType] = useState('Forgot to Punch Out')
  const [requestedCheckIn, setRequestedCheckIn] = useState('08:30')
  const [requestedCheckOut, setRequestedCheckOut] = useState('16:30')
  const [justification, setJustification] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      employeeName,
      date,
      reasonType,
      requestedCheckIn,
      requestedCheckOut,
      justification
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white border border-gray-300 rounded shadow-xl max-w-lg w-full overflow-hidden text-left">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
              Attendance Regularization
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Correct missed biometric punch or field duty</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="emp-name" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Employee
            </label>
            <input
              type="text"
              id="emp-name"
              readOnly
              value={employeeName}
              className="w-full px-3 py-1.5 rounded border border-gray-300 bg-gray-100 text-xs font-semibold text-gray-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="corr-date" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Correction Date
              </label>
              <input
                type="date"
                id="corr-date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-gray-300 text-xs text-gray-800 focus:outline-none focus:border-[#1e3a8a]"
              />
            </div>
            <div>
              <label htmlFor="reason-type" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Reason Type
              </label>
              <select
                id="reason-type"
                value={reasonType}
                onChange={(e) => setReasonType(e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-gray-300 bg-white text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#1e3a8a]"
              >
                <option value="Forgot to Punch Out">Forgot to Punch Out</option>
                <option value="Forgot to Punch In">Forgot to Punch In</option>
                <option value="Official Field Duty">Official Field Duty Outside</option>
                <option value="Biometric Machine Fault">Biometric Machine Fault / Offline</option>
                <option value="Weekend Duty Regularization">Weekend Duty Regularization (Sat/Sun Work)</option>
                <option value="Overtime Authorization">Overtime Authorization (&gt;04:30 PM)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="actual-in" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Actual In Time
              </label>
              <input
                type="time"
                id="actual-in"
                value={requestedCheckIn}
                onChange={(e) => setRequestedCheckIn(e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-gray-300 text-xs text-gray-800 focus:outline-none focus:border-[#1e3a8a]"
              />
            </div>
            <div>
              <label htmlFor="actual-out" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Actual Out Time
              </label>
              <input
                type="time"
                id="actual-out"
                value={requestedCheckOut}
                onChange={(e) => setRequestedCheckOut(e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-gray-300 text-xs text-gray-800 focus:outline-none focus:border-[#1e3a8a]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="justification" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Justification / Memo Reference
            </label>
            <textarea
              id="justification"
              rows={3}
              required
              placeholder="State official duty purpose or explanation for missed scan..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="w-full px-3 py-2 rounded border border-gray-300 text-xs text-gray-800 focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded border border-amber-200 text-xs text-amber-900 flex items-start space-x-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0 text-amber-700 mt-0.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p>
              Submission forwards directly to your supervising engineer or department head for biometric audit authorization.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold px-3.5 py-1.5 rounded border border-gray-300 transition-colors uppercase tracking-wider cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition-colors shadow-sm uppercase tracking-wider cursor-pointer"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegularizePunchModal
