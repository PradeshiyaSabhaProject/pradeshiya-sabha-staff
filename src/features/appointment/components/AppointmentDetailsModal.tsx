import React, { useState } from 'react';
import { type AppointmentItem, type AppointmentStatus } from '../services/appointmentApi';

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentItem | null;
  mode: 'all' | 'my';
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  onReschedule: (id: string, newDateTime: string) => void;
}

// â”€â”€ Icons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-gray-500">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-gray-700">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const CheckCircleIcon = ({ className = 'w-6 h-6 text-[#A31736]' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  isOpen,
  onClose,
  appointment,
  mode,
  onUpdateStatus,
  onReschedule,
}) => {
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [rescheduleError, setRescheduleError] = useState('');
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  if (!isOpen || !appointment) return null;

  const isMyMode = mode === 'my';
  const showPendingActions = isMyMode && appointment.status === 'PENDING';
  const showApprovedActions = isMyMode && appointment.status === 'APPROVED';

  // Format status style classes
  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'PENDING':
        return 'text-[#ea580c] font-bold';
      case 'APPROVED':
        return 'text-[#16a34a] font-bold';
      case 'RESCHEDULED':
        return 'text-[#2563eb] font-bold';
      case 'REJECTED':
        return 'text-[#dc2626] font-bold';
      case 'COMPLETED':
        return 'text-[#7c3aed] font-bold';
      case 'NO-SHOW':
        return 'text-[#6b7280] font-bold';
      default:
        return 'text-gray-700';
    }
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newTime) {
      setRescheduleError('Please select both date and time.');
      return;
    }
    // Convert 24hr format from input to 12hr AM/PM format
    const [hours24, minutes] = newTime.split(':');
    const hrs = parseInt(hours24);
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    const hrs12 = hrs % 12 || 12;
    const formattedTime = `${hrs12.toString().padStart(2, '0')}.${minutes} ${ampm}`;
    const formattedDateTime = `${newDate} ${formattedTime}`;

    onReschedule(appointment.id, formattedDateTime);
    setIsRescheduling(false);
    setRescheduleError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
        >
          <CloseIcon />
        </button>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 text-center mb-8">
          Appointment Details - {appointment.id}
        </h3>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-6">
          
          {/* Left Column: Details */}
          <div className="md:col-span-7 space-y-3.5 text-sm text-gray-800">
            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-4 font-medium text-gray-500">Citizen Name</span>
              <span className="col-span-1 text-gray-400">:</span>
              <span className="col-span-7 font-bold text-gray-900">{appointment.citizenName}</span>
            </div>

            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-4 font-medium text-gray-500">NIC Number</span>
              <span className="col-span-1 text-gray-400">:</span>
              <span className="col-span-7 font-semibold text-gray-900">{appointment.nicNumber}</span>
            </div>

            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-4 font-medium text-gray-500">Phone</span>
              <span className="col-span-1 text-gray-400">:</span>
              <span className="col-span-7 font-semibold text-gray-900">{appointment.phone}</span>
            </div>

            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-4 font-medium text-gray-500">Email</span>
              <span className="col-span-1 text-gray-400">:</span>
              <span className="col-span-7 text-gray-700 break-all">{appointment.email}</span>
            </div>

            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-4 font-medium text-gray-500">Service</span>
              <span className="col-span-1 text-gray-400">:</span>
              <span className="col-span-7 font-bold text-gray-900">{appointment.service}</span>
            </div>

            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-4 font-medium text-gray-500">Date & Time</span>
              <span className="col-span-1 text-gray-400">:</span>
              <span className="col-span-7 font-semibold text-gray-900">
                {appointment.dateTime.split(' ')[0]} <span className="text-gray-300 mx-1">|</span> {appointment.dateTime.split(' ').slice(1).join(' ')}
              </span>
            </div>

            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-4 font-medium text-gray-500">Status</span>
              <span className="col-span-1 text-gray-400">:</span>
              <div className="col-span-7 flex items-center gap-3">
                <span className={`font-bold uppercase ${getStatusBadge(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-4 font-medium text-gray-500">Remark</span>
              <span className="col-span-1 text-gray-400">:</span>
              <span className="col-span-7 text-gray-600 italic leading-relaxed">
                {appointment.remark}
              </span>
            </div>
          </div>

          {/* Right Column: Attached Documents */}
          <div className="md:col-span-5 space-y-3">
            {appointment.documents.map((doc, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between border border-gray-200/80 rounded-xl p-3 bg-white hover:bg-gray-50/50 hover:border-gray-300 transition-colors shadow-2xs group"
              >
                <div className="flex items-center gap-3">
                  <div className="shrink-0">
                    <FileIcon />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">{doc.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{doc.size}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 shadow-3xs flex items-center justify-center shrink-0 cursor-pointer"
                  onClick={() => alert(`Downloading ${doc.name}...`)}
                  title={`Download ${doc.name}`}
                >
                  <DownloadIcon />
                </button>
              </div>
            ))}
          </div>

        </div>

        {/* Reschedule Panel (Conditional) */}
        {isRescheduling && (
          <form onSubmit={handleRescheduleSubmit} className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 mb-6 space-y-3.5 animate-fade-in">
            <h4 className="text-sm font-bold text-[#1e3a8a]">Reschedule Appointment</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Select New Date</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Select New Time</label>
                <input
                  type="time"
                  required
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            {rescheduleError && <p className="text-xs text-red-500 font-medium">{rescheduleError}</p>}
            <div className="flex justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setIsRescheduling(false)}
                className="px-4 py-1.5 border border-gray-300 text-gray-700 text-xs font-bold rounded-lg bg-white hover:bg-gray-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer"
              >
                Save Schedule
              </button>
            </div>
          </form>
        )}

        {/* Action Buttons at the Bottom */}
        {!isRescheduling && (showPendingActions || showApprovedActions) && (
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4 pt-6 border-t border-gray-100">
            {showPendingActions && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateStatus(appointment.id, 'APPROVED');
                    onClose();
                  }}
                  className="bg-[#16a34a] hover:bg-[#15803d] text-white font-bold px-7 py-2.5 rounded-lg transition-all hover:scale-102 active:scale-98 shadow-sm cursor-pointer min-w-[120px]"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateStatus(appointment.id, 'REJECTED');
                    onClose();
                  }}
                  className="bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold px-7 py-2.5 rounded-lg transition-all hover:scale-102 active:scale-98 shadow-sm cursor-pointer min-w-[120px]"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => setIsRescheduling(true)}
                  className="border-2 border-[#2563eb] hover:bg-blue-50 text-[#2563eb] font-bold px-7 py-2.5 rounded-lg transition-all hover:scale-102 active:scale-98 cursor-pointer min-w-[120px] bg-white text-center"
                >
                  Reschedule
                </button>
              </>
            )}
            {showApprovedActions && (
              <>
                <button
                  type="button"
                  onClick={() => setShowNotificationModal(true)}
                  title="Notify client about approval"
                  className="flex items-center justify-center gap-2 border-2 border-[#A31736] hover:bg-[#A31736] hover:text-white text-[#A31736] font-bold px-7 py-2.5 rounded-lg transition-all hover:scale-102 active:scale-98 cursor-pointer min-w-[120px] bg-white text-center shadow-sm"
                >
                  <BellIcon />
                  <span>Notify</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsRescheduling(true)}
                  className="border-2 border-[#2563eb] hover:bg-blue-50 text-[#2563eb] font-bold px-7 py-2.5 rounded-lg transition-all hover:scale-102 active:scale-98 cursor-pointer min-w-[120px] bg-white text-center"
                >
                  Reschedule
                </button>
              </>
            )}
          </div>
        )}

        {/* Notification Modal */}
        {showNotificationModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-[#A31736]/10 via-white to-[#A31736]/5 p-6 flex flex-col items-center">
                <div className="mb-4 rounded-full bg-[#A31736]/10 p-3">
                  <CheckCircleIcon />
                </div>
                <h3 className="text-lg font-bold text-[#A31736] text-center mb-2">
                  Notification Sent Successfully
                </h3>
                <p className="text-sm text-gray-700 text-center">
                  The client has been notified about the appointment approval.
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-[#A31736]/5 border border-[#A31736]/20 rounded-lg p-4">
                  <p className="text-xs font-bold text-[#A31736] mb-2">Appointment Details:</p>
                  <div className="space-y-1.5 text-xs text-gray-700">
                    <p>
                      <span className="font-semibold text-gray-900">Client:</span> {appointment.citizenName}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">Service:</span> {appointment.service}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">Scheduled:</span> {appointment.dateTime}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">Contact:</span> {appointment.phone} / {appointment.email}
                    </p>
                  </div>
                </div>
                <div className="bg-[#A31736]/5 border border-[#A31736]/20 rounded-lg p-4">
                  <p className="text-xs font-bold text-[#A31736] mb-1">Notification Message:</p>
                  <p className="text-xs text-gray-700 italic leading-relaxed">
                    "Dear {appointment.citizenName}, Your appointment for {appointment.service} has been approved by {appointment.assignedOfficer}. Your scheduled appointment is on {appointment.dateTime}. Please come prepared with the necessary documents. If you have any questions, please contact us at the Pradeshiya Sabha office."
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 border-t border-gray-100 p-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNotificationModal(false)}
                  className="px-6 py-2.5 border border-[#A31736]/20 text-white text-sm font-bold rounded-lg bg-[#A31736] hover:bg-[#801028] transition-all cursor-pointer shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

