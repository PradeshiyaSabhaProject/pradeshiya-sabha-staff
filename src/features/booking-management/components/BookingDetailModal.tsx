import React, { useState } from 'react'
import type { FacilityBooking, BookingStatus } from '../types'

interface BookingDetailModalProps {
  booking: FacilityBooking | null
  onClose: () => void
  onApprove?: (id: string, officerName: string, remark?: string) => void
  onReject?: (id: string, officerName: string, reason: string) => void
  onAddRemark?: (id: string, officerName: string, text: string) => void
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

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const PdfIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-red-500">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
)

const ImageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-blue-500">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
)

function getRemarkCardStyle(action: string | undefined): string {
  switch (action) {
    case 'APPROVED':
      return 'bg-green-50/70 border-green-200 text-green-950'
    case 'REJECTED':
      return 'bg-red-50/70 border-red-200 text-red-950'
    default:
      return 'bg-gray-50 border-gray-200 text-gray-800'
  }
}

const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  booking,
  onClose,
  onApprove,
  onReject,
  onAddRemark
}) => {
  const [newRemarkText, setNewRemarkText] = useState('')
  const [showRejectionForm, setShowRejectionForm] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [approveRemark, setApproveRemark] = useState('')
  const [showApproveForm, setShowApproveForm] = useState(false)
  const [actionSuccess, setActionSuccess] = useState<'APPROVED' | 'REJECTED' | null>(null)
  const [currentOfficerName] = useState('Staff Officer (M. Fernando)')

  if (!booking) return null

  const getStatusStyle = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'COMPLETED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const handleConfirmApprove = () => {
    if (!onApprove || !booking) return
    onApprove(booking.id, currentOfficerName, approveRemark.trim())
    setActionSuccess('APPROVED')
    setTimeout(() => {
      onClose()
    }, 1400)
  }

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!onReject || !booking || !rejectionReason.trim()) return
    onReject(booking.id, currentOfficerName, rejectionReason.trim())
    setActionSuccess('REJECTED')
    setTimeout(() => {
      onClose()
    }, 1400)
  }

  const handleAddRemarkSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRemarkText.trim() || !onAddRemark || !booking) return
    onAddRemark(booking.id, currentOfficerName, newRemarkText.trim())
    setNewRemarkText('')
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded border border-gray-300 max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/80 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900 uppercase tracking-tight">
                Booking Dossier - {booking.refId}
              </h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${getStatusStyle(booking.status)}`}>
                {booking.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Submitted on {booking.submittedDate} at {booking.submittedTime} • Facility: <span className="font-bold text-gray-800">{booking.facilityName}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 hover:bg-gray-200 p-1 rounded transition-colors cursor-pointer shrink-0"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Success Banner if action just taken */}
        {actionSuccess && (
          <div className={`px-6 py-3 text-xs font-bold flex items-center gap-2 ${
            actionSuccess === 'APPROVED' ? 'bg-emerald-700 text-white' : 'bg-[#A31736] text-white'
          }`}>
            <CheckIcon />
            <span>
              Booking successfully marked as <strong>{actionSuccess}</strong>! Updating municipal schedule...
            </span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs text-gray-700">
          {/* Grid: Citizen & Event Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Section 1: Citizen Details */}
            <div className="bg-gray-50 border border-gray-200 rounded p-3.5 space-y-2.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200 pb-1.5 flex items-center justify-between">
                <span>Citizen Applicant Profile</span>
                <span className="text-gray-400 font-mono text-[10px]">Verified NIC</span>
              </h3>
              <div className="grid grid-cols-2 gap-y-2 text-xs">
                <div>
                  <span className="text-gray-400 font-semibold block text-[11px]">Full Name</span>
                  <span className="font-bold text-gray-900">{booking.citizenName}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold block text-[11px]">National ID (NIC)</span>
                  <span className="font-bold text-gray-900 font-mono">{booking.citizenNic}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold block text-[11px]">Phone Number</span>
                  <span className="font-bold text-gray-900">{booking.citizenPhone}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold block text-[11px]">Email Address</span>
                  <span className="font-bold text-gray-900 truncate block">{booking.citizenEmail}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400 font-semibold block text-[11px]">Residential Address</span>
                  <span className="font-medium text-gray-800">{booking.citizenAddress}</span>
                </div>
              </div>
            </div>

            {/* Section 2: Reservation Schedule */}
            <div className="bg-gray-50 border border-gray-200 rounded p-3.5 space-y-2.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200 pb-1.5 flex items-center justify-between">
                <span>Facility &amp; Event Allocation</span>
                <span className="text-gray-400 font-mono text-[10px]">Time Slot Allocation</span>
              </h3>
              <div className="grid grid-cols-2 gap-y-2 text-xs">
                <div className="col-span-2">
                  <span className="text-gray-400 font-semibold block text-[11px]">Target Municipal Venue</span>
                  <span className="font-bold text-gray-900 text-xs bg-white px-2 py-0.5 rounded border border-gray-200 inline-block mt-0.5">
                    🏢 {booking.facilityName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold block text-[11px]">Booking Date</span>
                  <span className="font-bold text-[#A31736]">{booking.bookingDate}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold block text-[11px]">Reserved Time Slot</span>
                  <span className="font-bold text-gray-900">{booking.timeSlot}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold block text-[11px]">Event Category</span>
                  <span className="font-bold text-gray-800">{booking.eventType}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold block text-[11px]">Expected Attendees</span>
                  <span className="font-bold text-gray-800">~{booking.expectedAttendees} Persons</span>
                </div>
              </div>
            </div>
          </div>

          {/* Special Requirements */}
          {booking.specialRequirements && (
            <div className="bg-amber-50/50 border border-amber-200 rounded p-3 text-xs">
              <span className="font-bold text-amber-900 uppercase tracking-wider block mb-0.5 text-[11px]">
                Citizen Special Requests &amp; Setup Requirements
              </span>
              <p className="text-amber-950 font-medium leading-relaxed">
                {booking.specialRequirements}
              </p>
            </div>
          )}

          {/* Section 3: Financial Summary */}
          <div className="bg-white border border-gray-200 rounded p-3.5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-700 border-b border-gray-100 pb-1.5 mb-2.5">
              Financial Tariff &amp; Payment Verification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
                <span className="text-gray-500 font-semibold block text-[11px]">Base Rental Fee</span>
                <span className="text-sm font-bold text-gray-900 mt-0.5 block">
                  Rs. {booking.rentalFee.toLocaleString()}
                </span>
              </div>
              <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
                <span className="text-gray-500 font-semibold block text-[11px]">Refundable Security Deposit</span>
                <span className="text-sm font-bold text-gray-900 mt-0.5 block">
                  Rs. {booking.securityDeposit.toLocaleString()}
                </span>
              </div>
              <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
                <span className="text-gray-500 font-semibold block text-[11px]">Total Tariff</span>
                <span className="text-sm font-bold text-[#A31736] mt-0.5 block">
                  Rs. {(booking.rentalFee + booking.securityDeposit).toLocaleString()}
                </span>
              </div>
              <div className="bg-gray-50 p-2.5 rounded border border-gray-200 flex flex-col justify-between">
                <span className="text-gray-500 font-semibold block text-[11px]">Payment Status</span>
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase inline-block mt-0.5 ${
                    booking.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    ✓ {booking.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Attachments */}
          <div className="space-y-2.5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-700 flex items-center justify-between">
              <span>Attached Verification Documents ({booking.attachments.length})</span>
              <span className="text-gray-400 text-[10px] font-normal">Submitted by citizen upon intake</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {booking.attachments.map((att) => (
                <div key={att.id} className="flex items-center gap-2.5 p-2.5 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition-colors">
                  <div className="shrink-0">
                    {att.type === 'pdf' ? <PdfIcon /> : <ImageIcon />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-gray-900 truncate block">{att.name}</span>
                    <span className="text-[10px] text-gray-400 font-semibold">{att.size}</span>
                  </div>
                  <a
                    href={att.url}
                    onClick={(e) => { e.preventDefault(); alert(`Previewing document: ${att.name}`) }}
                    className="text-xs font-bold text-[#A31736] hover:underline shrink-0 uppercase tracking-wider"
                  >
                    View →
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Remarks & Timeline */}
          <div className="space-y-2.5 pt-1">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200 pb-1.5">
              Staff Review History &amp; Audit Log
            </h3>
            {(!booking.remarks || booking.remarks.length === 0) ? (
              <p className="text-xs text-gray-400 italic py-1">No audit remarks or review logs recorded for this booking yet.</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {booking.remarks.map((rem) => (
                  <div key={rem.id} className={`p-2.5 rounded border text-xs ${getRemarkCardStyle(rem.action)}`}>
                    <div className="flex items-center justify-between font-bold mb-0.5 text-[11px]">
                      <span className="text-gray-900 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#A31736]"></span>
                        {rem.author}
                      </span>
                      <span className="text-gray-400 text-[10px]">{rem.date} at {rem.time}</span>
                    </div>
                    <p className="leading-relaxed">{rem.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Note Form */}
            {onAddRemark && (
              <form onSubmit={handleAddRemarkSubmit} className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add internal staff note or inspection comment..."
                  value={newRemarkText}
                  onChange={(e) => setNewRemarkText(e.target.value)}
                  className="flex-1 bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-800 outline-none focus:border-[#A31736]"
                />
                <button
                  type="submit"
                  disabled={!newRemarkText.trim()}
                  className="px-4 py-1.5 bg-gray-800 hover:bg-black disabled:bg-gray-300 text-white font-bold text-xs rounded transition-colors shrink-0 cursor-pointer uppercase tracking-wider"
                >
                  Add Note
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Modal Footer: Action Controls */}
        <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <span>Assigned Officer: <strong className="text-gray-800">{booking.assignedOfficer || 'Unassigned Intake'}</strong></span>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded uppercase tracking-wider transition-colors cursor-pointer"
            >
              Close
            </button>

            {/* Approval & Rejection buttons */}
            {onApprove && onReject && !showRejectionForm && !showApproveForm && (
              <>
                <button
                  type="button"
                  onClick={() => setShowRejectionForm(true)}
                  className="px-4 py-1.5 bg-[#A31736] hover:bg-[#801028] text-white font-bold text-xs rounded uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <XIcon />
                  <span>Reject</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowApproveForm(true)}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <CheckIcon />
                  <span>Approve</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Inline Approve Confirmation Drawer */}
        {showApproveForm && (
          <div className="bg-green-50 px-6 py-3.5 border-t border-green-200 flex flex-col gap-2.5 animate-fade-in">
            <div className="flex items-center justify-between text-xs font-bold text-green-900 uppercase tracking-wider">
              <span>Confirm Official Approval for Venue Reservation</span>
              <button
                type="button"
                onClick={() => setShowApproveForm(false)}
                className="text-gray-500 hover:text-gray-800 font-bold cursor-pointer"
              >
                ✕ Cancel
              </button>
            </div>
            <input
              type="text"
              placeholder="Optional approval remark or confirmation note (e.g., 'Sound permit checked. Hall reserved')..."
              value={approveRemark}
              onChange={(e) => setApproveRemark(e.target.value)}
              className="w-full bg-white border border-green-300 rounded px-3 py-1.5 text-xs text-gray-800 outline-none focus:border-green-600"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleConfirmApprove}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
              >
                ✓ Confirm Official Approval
              </button>
            </div>
          </div>
        )}

        {/* Inline Rejection Reason Drawer */}
        {showRejectionForm && (
          <form onSubmit={handleConfirmReject} className="bg-red-50 px-6 py-3.5 border-t border-red-200 flex flex-col gap-2.5 animate-fade-in">
            <div className="flex items-center justify-between text-xs font-bold text-red-900 uppercase tracking-wider">
              <span>Mandatory Rejection Reason (Notified to Citizen)</span>
              <button
                type="button"
                onClick={() => setShowRejectionForm(false)}
                className="text-gray-500 hover:text-gray-800 font-bold cursor-pointer"
              >
                ✕ Cancel
              </button>
            </div>
            <textarea
              required
              rows={2}
              placeholder="State clear reasons for rejection (e.g., 'Facility already booked for official council session on this date', 'Required police clearance missing')..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full bg-white border border-red-300 rounded p-2.5 text-xs text-gray-800 outline-none focus:border-red-600"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#A31736] hover:bg-[#801028] text-white font-bold text-xs rounded uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
              >
                Confirm Rejection &amp; Notify
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default BookingDetailModal
