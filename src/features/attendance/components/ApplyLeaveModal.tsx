import React, { useState } from 'react'

interface ApplyLeaveModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    leaveType: string
    startDate: string
    endDate: string
    daysCount: number
    reason: string
  }) => void
}

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [leaveType, setLeaveType] = useState('Annual Leave')
  const [startDate, setStartDate] = useState('2026-07-15')
  const [endDate, setEndDate] = useState('2026-07-16')
  const [daysCount, setDaysCount] = useState(2)
  const [reason, setReason] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ leaveType, startDate, endDate, daysCount, reason })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold">Apply for Leave</h3>
              <p className="text-xs text-blue-200">Submit multi-level approval request</p>
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Leave Category</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Annual Leave">Annual Leave (Balance: 9 Days)</option>
              <option value="Casual Leave">Casual Leave (Balance: 10 Days)</option>
              <option value="Medical Leave">Medical Leave (Balance: 19 Days)</option>
              <option value="Duty Leave">Duty Leave (Official Outside Work)</option>
              <option value="No-Pay Leave">No-Pay Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Working Days</label>
              <input
                type="number"
                min={0.5}
                step={0.5}
                value={daysCount}
                onChange={(e) => setDaysCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Reason & Handover Notes</label>
            <textarea
              rows={3}
              required
              placeholder="State clear reason and officer taking over duties..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Multi-level workflow preview box */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                Multi-Level Approval Workflow
              </span>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                3 Levels Required
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-white p-2 rounded-lg border border-blue-200 shadow-2xs">
                <div className="font-bold text-gray-800">1. Line Manager</div>
                <div className="text-[11px] text-gray-500">Eng. S. Bandara</div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-blue-200 shadow-2xs">
                <div className="font-bold text-gray-800">2. Dept Head</div>
                <div className="text-[11px] text-gray-500">Director Works</div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-blue-200 shadow-2xs">
                <div className="font-bold text-gray-800">3. HR / Secretary</div>
                <div className="text-[11px] text-gray-500">Mrs. Weerasinghe</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold shadow-md transition"
            >
              Submit Leave Application
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
