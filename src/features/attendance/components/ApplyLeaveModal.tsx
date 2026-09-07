import React, { useState } from 'react'
import { useLeave } from '../../../context/LeaveContext'

interface ApplyLeaveModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (data: {
    leaveType: string
    startDate: string
    endDate: string
    daysCount: number
    reason: string
  }) => void
}

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { applyLeave, leaveBalances } = useLeave()
  const myBalance = leaveBalances.find((b) => b.employeeId === 'PS-EMP-0012') || leaveBalances[0]

  const [leaveType, setLeaveType] = useState<'Annual Leave' | 'Casual Leave' | 'Medical Leave' | 'Duty Leave' | 'Compensatory Leave (Comp-Off)' | 'No-Pay Leave'>('Annual Leave')
  const [startDate, setStartDate] = useState('2026-07-22')
  const [endDate, setEndDate] = useState('2026-07-23')
  const [daysCount, setDaysCount] = useState(2)
  const [reason, setReason] = useState('')
  const [handoverOfficer, setHandoverOfficer] = useState('Ruwan Kumara (Accountant)')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    applyLeave({
      leaveType,
      startDate,
      endDate,
      daysCount,
      reason,
      handoverOfficer
    })

    if (onSubmit) {
      onSubmit({ leaveType, startDate, endDate, daysCount, reason })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white border border-gray-300 rounded shadow-xl max-w-lg w-full overflow-hidden text-left">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">Apply for Leave</h3>
            <p className="text-xs text-gray-500 mt-0.5">Submit multi-level leave approval request</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="leave-category" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Leave Category
            </label>
            <select
              id="leave-category"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as any)}
              className="w-full px-3 py-1.5 rounded border border-gray-300 bg-white text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#1e3a8a]"
            >
              <option value="Annual Leave">Annual Leave (Balance: {myBalance?.annual.remaining} Days)</option>
              <option value="Casual Leave">Casual Leave (Balance: {myBalance?.casual.remaining} Days)</option>
              <option value="Medical Leave">Medical Leave (Balance: {myBalance?.medical.remaining} Days)</option>
              <option value="Duty Leave">Duty Leave (Official Outside Duty)</option>
              <option value="Compensatory Leave (Comp-Off)">Compensatory Leave (Comp-Off - Earned from Weekend/OT)</option>
              <option value="No-Pay Leave">No-Pay Leave (Unpaid Authorized)</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="start-date" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-gray-300 text-xs text-gray-800 focus:outline-none focus:border-[#1e3a8a]"
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="end-date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-gray-300 text-xs text-gray-800 focus:outline-none focus:border-[#1e3a8a]"
              />
            </div>
            <div>
              <label htmlFor="working-days" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Days Count
              </label>
              <input
                type="number"
                id="working-days"
                min={0.5}
                step={0.5}
                value={daysCount}
                onChange={(e) => setDaysCount(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded border border-gray-300 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#1e3a8a]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="handover-officer" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Acting Officer / Handover Duty
            </label>
            <input
              type="text"
              id="handover-officer"
              value={handoverOfficer}
              onChange={(e) => setHandoverOfficer(e.target.value)}
              className="w-full px-3 py-1.5 rounded border border-gray-300 text-xs text-gray-800 focus:outline-none focus:border-[#1e3a8a]"
              placeholder="Name & designation of acting officer..."
            />
          </div>

          <div>
            <label htmlFor="leave-reason" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Reason &amp; Details
            </label>
            <textarea
              id="leave-reason"
              rows={3}
              required
              placeholder="State clear reason for leave request..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded border border-gray-300 text-xs text-gray-800 focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
            />
          </div>

          {/* Multi-level workflow preview box */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                Approval Workflow (3 Levels)
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-white p-2 rounded border border-gray-200">
                <div className="font-bold text-gray-800 text-[11px]">1. Line Manager</div>
                <div className="text-[10px] text-gray-500 truncate">Eng. S. Bandara</div>
              </div>
              <div className="bg-white p-2 rounded border border-gray-200">
                <div className="font-bold text-gray-800 text-[11px]">2. Dept Head</div>
                <div className="text-[10px] text-gray-500 truncate">Revenue Officer</div>
              </div>
              <div className="bg-white p-2 rounded border border-gray-200">
                <div className="font-bold text-gray-800 text-[11px]">3. Secretary</div>
                <div className="text-[10px] text-gray-500 truncate">Council Secretary</div>
              </div>
            </div>
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
              Submit Leave Application
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ApplyLeaveModal
