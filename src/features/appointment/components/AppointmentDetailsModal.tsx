import React, { useState } from 'react';
import {
  type AppointmentItem,
  type AppointmentStatus,
  MUNICIPAL_COUNTERS,
} from '../services/appointmentApi';
import { AppointmentSlipModal } from './AppointmentSlipModal';

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentItem | null;
  mode: 'all' | 'my';
  onUpdateStatus: (
    id: string,
    status: AppointmentStatus,
    rejectionReason?: string,
    resolutionNotes?: string
  ) => void;
  onReschedule: (
    id: string,
    newDateTime: string,
    newOfficer?: string,
    counter?: string
  ) => void;
}

const OFFICERS_LIST = [
  'M.Perera',
  'L.D.Silva',
  'N.Fernando',
  'S.Jayasooriya',
  'Dev Admin',
  'Staff Member',
];

const TIME_SLOTS = [
  '08.30 AM',
  '09.00 AM',
  '09.30 AM',
  '10.00 AM',
  '10.30 AM',
  '11.00 AM',
  '11.30 AM',
  '01.00 PM',
  '01.30 PM',
  '02.00 PM',
  '02.30 PM',
  '03.00 PM',
  '03.30 PM',
  '04.00 PM',
];

export const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  isOpen,
  onClose,
  appointment,
  mode,
  onUpdateStatus,
  onReschedule,
}) => {
  // Modal sub-flows
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showSlipModal, setShowSlipModal] = useState(false);

  // Reschedule Form State
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState(TIME_SLOTS[0]);
  const [newOfficer, setNewOfficer] = useState('');
  const [newCounter, setNewCounter] = useState(MUNICIPAL_COUNTERS[0]);

  // Reject / Complete Notes State
  const [rejectionReason, setRejectionReason] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  if (!isOpen || !appointment) return null;

  const isMyMode = mode === 'my';
  const showPendingActions = isMyMode && appointment.status === 'PENDING';
  const showApprovedActions = isMyMode && (appointment.status === 'APPROVED' || appointment.status === 'RESCHEDULED');

  const getStatusBadgeStyle = (status: AppointmentStatus) => {
    switch (status) {
      case 'PENDING':
        return 'border-amber-200 bg-amber-50 text-amber-800';
      case 'APPROVED':
        return 'border-emerald-200 bg-emerald-50 text-emerald-800';
      case 'RESCHEDULED':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'REJECTED':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'COMPLETED':
        return 'border-purple-200 bg-purple-50 text-purple-800';
      case 'NO-SHOW':
        return 'border-gray-300 bg-gray-100 text-gray-700';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-700';
    }
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) return;
    const formattedDateTime = `${newDate} ${newTime}`;
    onReschedule(appointment.id, formattedDateTime, newOfficer || appointment.assignedOfficer, newCounter);
    setIsRescheduling(false);
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStatus(appointment.id, 'REJECTED', rejectionReason || 'Requirements not fulfilled.');
    setIsRejecting(false);
    onClose();
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStatus(
      appointment.id,
      'COMPLETED',
      undefined,
      resolutionNotes || 'Citizen consultation completed successfully.'
    );
    setIsCompleting(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
        <div className="relative w-full max-w-3xl bg-white border border-gray-300 rounded shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          
          {/* Header Bar */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/75 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm text-gray-900 uppercase tracking-wide">
                Appointment Record
              </span>
              <span className="font-mono text-xs font-bold text-[#A31736] bg-[#A31736]/10 px-2 py-0.5 rounded border border-[#A31736]/20">
                {appointment.id}
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wide border ${getStatusBadgeStyle(appointment.status)}`}>
                {appointment.status}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSlipModal(true)}
                className="px-2.5 py-1 text-xs font-bold text-[#1e3a8a] bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                title="Print Token Pass"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                <span>Print Pass</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded hover:bg-gray-200/60 transition-colors cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="overflow-y-auto p-6 space-y-6">
            
            {/* Citizen & Scheduling Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Column: Citizen Identity */}
              <div className="md:col-span-7 space-y-3">
                <h4 className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wider border-b border-gray-200 pb-1.5">
                  Citizen Identification & Contact
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-semibold text-gray-500">Citizen Name:</span>
                    <span className="col-span-2 font-bold text-gray-900">{appointment.citizenName}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-semibold text-gray-500">NIC Number:</span>
                    <span className="col-span-2 font-mono font-medium text-gray-900">{appointment.nicNumber}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-semibold text-gray-500">Phone Number:</span>
                    <span className="col-span-2 font-semibold text-gray-900">{appointment.phone}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-semibold text-gray-500">Email Address:</span>
                    <span className="col-span-2 text-gray-700 break-all">{appointment.email}</span>
                  </div>
                  {appointment.division && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="font-semibold text-gray-500">GN Division:</span>
                      <span className="col-span-2 font-medium text-gray-800">{appointment.division}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-semibold text-gray-500">Service Area:</span>
                    <span className="col-span-2 font-bold text-[#A31736]">{appointment.service}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-semibold text-gray-500">Scheduled Slot:</span>
                    <span className="col-span-2 font-semibold text-gray-900">{appointment.dateTime}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-semibold text-gray-500">Assigned Officer:</span>
                    <span className="col-span-2 font-semibold text-gray-900">{appointment.assignedOfficer}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-semibold text-gray-500">Desk / Counter:</span>
                    <span className="col-span-2 font-medium text-gray-800">
                      {appointment.counter || 'Counter 01 - Citizen Reception'}
                    </span>
                  </div>
                </div>

                {/* Citizen Remarks */}
                <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded text-xs">
                  <p className="font-bold text-gray-600 uppercase tracking-wider text-[10px] mb-1">
                    Citizen Request Notes:
                  </p>
                  <p className="text-gray-800 italic leading-relaxed">
                    "{appointment.remark}"
                  </p>
                </div>

                {/* Rejection / Resolution Reason display if applicable */}
                {appointment.rejectionReason && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-xs">
                    <p className="font-bold text-red-800 uppercase tracking-wider text-[10px] mb-1">
                      Reason for Rejection:
                    </p>
                    <p className="text-red-700 font-medium">
                      {appointment.rejectionReason}
                    </p>
                  </div>
                )}

                {appointment.resolutionNotes && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs">
                    <p className="font-bold text-emerald-800 uppercase tracking-wider text-[10px] mb-1">
                      Consultation Outcome / Resolution:
                    </p>
                    <p className="text-emerald-700 font-medium">
                      {appointment.resolutionNotes}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Attached Verification Documents */}
              <div className="md:col-span-5 space-y-3">
                <h4 className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wider border-b border-gray-200 pb-1.5">
                  Attached Verification Documents ({appointment.documents.length})
                </h4>
                <div className="space-y-2">
                  {appointment.documents.map((doc) => (
                    <div
                      key={doc.name}
                      className="flex items-center justify-between border border-gray-300 rounded p-2.5 bg-gray-50/50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 bg-blue-50 text-blue-800 rounded border border-blue-200 shrink-0">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{doc.name}</p>
                          <p className="text-[10px] text-gray-500">{doc.size}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => alert(`Downloading verified attachment: ${doc.name}`)}
                        className="p-1.5 hover:bg-white border border-gray-300 rounded text-gray-700 hover:text-gray-900 transition-colors shrink-0 cursor-pointer"
                        title="Download Document"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Audit Information */}
                <div className="p-3 bg-gray-50 border border-gray-200 rounded text-[11px] text-gray-600 space-y-1">
                  <p className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                    Municipal Audit Trail
                  </p>
                  <p>• Logged in Municipal Front-Desk Portal</p>
                  <p>• Assigned to Officer: {appointment.assignedOfficer}</p>
                  <p>• Security Token: VALIDATED</p>
                </div>
              </div>

            </div>

            {/* Reschedule Drawer Panel */}
            {isRescheduling && (
              <form onSubmit={handleRescheduleSubmit} className="p-4 bg-blue-50 border border-blue-200 rounded space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wider">
                    Reschedule Appointment Slot
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsRescheduling(false)}
                    className="text-xs text-gray-500 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      New Date
                    </label>
                    <input
                      type="date"
                      required
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded px-3 py-1.5 bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      New Time Slot
                    </label>
                    <select
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded px-3 py-1.5 bg-white text-gray-900"
                    >
                      {TIME_SLOTS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Reassigned Officer
                    </label>
                    <select
                      value={newOfficer || appointment.assignedOfficer}
                      onChange={(e) => setNewOfficer(e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded px-3 py-1.5 bg-white text-gray-900"
                    >
                      {OFFICERS_LIST.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Assigned Counter
                    </label>
                    <select
                      value={newCounter}
                      onChange={(e) => setNewCounter(e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded px-3 py-1.5 bg-white text-gray-900"
                    >
                      {MUNICIPAL_COUNTERS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#1e3a8a] hover:bg-[#172554] text-white text-xs font-bold rounded transition-colors uppercase tracking-wider cursor-pointer"
                  >
                    Confirm Reschedule
                  </button>
                </div>
              </form>
            )}

            {/* Reject Form Panel */}
            {isRejecting && (
              <form onSubmit={handleRejectSubmit} className="p-4 bg-red-50 border border-red-200 rounded space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider">
                    Reject Citizen Appointment
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsRejecting(false)}
                    className="text-xs text-gray-500 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    State Rejection Reason / Missing Documentation
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="e.g. Original deed endorsement from Land Registry missing."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full text-xs border border-red-300 rounded p-2 bg-white text-gray-900"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded transition-colors uppercase tracking-wider cursor-pointer"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </form>
            )}

            {/* Complete Consultation Form Panel */}
            {isCompleting && (
              <form onSubmit={handleCompleteSubmit} className="p-4 bg-purple-50 border border-purple-200 rounded space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                    Mark Consultation as Completed
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsCompleting(false)}
                    className="text-xs text-gray-500 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Consultation Outcome / Service Delivery Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Approved initial inspection plan. Forwarded to technical officer."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    className="w-full text-xs border border-purple-300 rounded p-2 bg-white text-gray-900"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded transition-colors uppercase tracking-wider cursor-pointer"
                  >
                    Finalize & Complete
                  </button>
                </div>
              </form>
            )}

          </div>

          {/* Footer Actions */}
          {!isRescheduling && !isRejecting && !isCompleting && (
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50/75 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowNotificationModal(true)}
                  className="px-3 py-1.5 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded transition-colors uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-gray-500">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  <span>Notify Citizen</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsRescheduling(true)}
                  className="px-3 py-1.5 border border-blue-300 bg-white hover:bg-blue-50 text-blue-800 text-xs font-semibold rounded transition-colors uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>Reschedule Slot</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* Pending Actions */}
                {showPendingActions && (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsRejecting(true)}
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded transition-colors uppercase tracking-wider cursor-pointer shadow-xs"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateStatus(appointment.id, 'APPROVED');
                        onClose();
                      }}
                      className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded transition-colors uppercase tracking-wider cursor-pointer shadow-xs"
                    >
                      Approve & Confirm
                    </button>
                  </>
                )}

                {/* Approved Actions */}
                {showApprovedActions && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateStatus(appointment.id, 'NO-SHOW');
                        onClose();
                      }}
                      className="px-3 py-1.5 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded transition-colors uppercase tracking-wider cursor-pointer"
                    >
                      Mark No-Show
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCompleting(true)}
                      className="px-5 py-1.5 bg-[#A31736] hover:bg-[#801028] text-white text-xs font-bold rounded transition-colors uppercase tracking-wider cursor-pointer shadow-xs"
                    >
                      Mark Consultation Complete
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Citizen SMS/Email Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white border border-gray-300 rounded shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-gray-200 pb-3">
              <div className="p-1.5 bg-[#A31736]/10 text-[#A31736] rounded">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Dispatch Citizen Notification
                </h3>
                <p className="text-[11px] text-gray-500">
                  Automated SMS & Email Gateway
                </p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded p-3 text-xs space-y-1.5 text-gray-700">
              <p><span className="font-semibold text-gray-500">Recipient:</span> {appointment.citizenName}</p>
              <p><span className="font-semibold text-gray-500">Contact:</span> {appointment.phone} | {appointment.email}</p>
              <p><span className="font-semibold text-gray-500">Reference:</span> {appointment.id}</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-900 italic">
              "Dear {appointment.citizenName}, your appointment for {appointment.service} at Homagama Pradeshiya Sabha is set for {appointment.dateTime} at {appointment.counter || 'Counter 01'}. Officer in charge: {appointment.assignedOfficer}."
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowNotificationModal(false)}
                className="px-4 py-1.5 border border-gray-300 text-gray-700 text-xs font-bold rounded bg-white hover:bg-gray-50 uppercase tracking-wider cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  alert('Notification dispatched successfully via SMS & Email gateway.');
                  setShowNotificationModal(false);
                }}
                className="px-4 py-1.5 bg-[#A31736] hover:bg-[#801028] text-white text-xs font-bold rounded uppercase tracking-wider shadow-sm cursor-pointer"
              >
                Send Notification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slip Modal */}
      <AppointmentSlipModal
        isOpen={showSlipModal}
        onClose={() => setShowSlipModal(false)}
        appointment={appointment}
      />
    </>
  );
};

export default AppointmentDetailsModal;
