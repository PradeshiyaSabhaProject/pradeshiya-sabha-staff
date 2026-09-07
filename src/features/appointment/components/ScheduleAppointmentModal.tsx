import React, { useState } from 'react';
import {
  type AppointmentItem,
  GN_DIVISIONS,
  MUNICIPAL_COUNTERS,
} from '../services/appointmentApi';

interface ScheduleAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAppointment: (
    appointment: Omit<AppointmentItem, 'id' | 'status'> & { status?: AppointmentItem['status'] }
  ) => void;
  currentOfficerName?: string;
}

const SERVICES_LIST = [
  'Building Approval',
  'Business License',
  'Trade License',
  'Land Transfer',
  'Birth Certificate',
  'Death Certificate',
  'Garbage Collection',
  'Assessment & Tax Valuation',
  'Public Health & Sanitation',
  'Street Lighting & Infrastructure',
];

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

export const ScheduleAppointmentModal: React.FC<ScheduleAppointmentModalProps> = ({
  isOpen,
  onClose,
  onAddAppointment,
  currentOfficerName,
}) => {
  const [citizenName, setCitizenName] = useState('');
  const [nicNumber, setNicNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [division, setDivision] = useState(GN_DIVISIONS[0]);
  const [service, setService] = useState(SERVICES_LIST[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[2]);
  const [assignedOfficer, setAssignedOfficer] = useState(
    currentOfficerName && OFFICERS_LIST.includes(currentOfficerName)
      ? currentOfficerName
      : OFFICERS_LIST[0]
  );
  const [counter, setCounter] = useState(MUNICIPAL_COUNTERS[0]);
  const [priority, setPriority] = useState<'NORMAL' | 'URGENT' | 'VIP'>('NORMAL');
  const [remark, setRemark] = useState('');
  const [bookingType, setBookingType] = useState<'walkin' | 'phone' | 'citizen_portal'>('walkin');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenName.trim() || !nicNumber.trim() || !phone.trim() || !date) {
      setError('Please fill in all required citizen identity and appointment fields.');
      return;
    }

    const dateTime = `${date} ${timeSlot}`;

    onAddAppointment({
      citizenName: citizenName.trim(),
      nicNumber: nicNumber.trim().toUpperCase(),
      phone: phone.trim(),
      email: email.trim() || `${citizenName.toLowerCase().replace(/\s+/g, '')}@citizen.lk`,
      service,
      dateTime,
      assignedOfficer,
      remark:
        remark.trim() ||
        `${bookingType === 'walkin' ? 'Walk-in desk booking' : 'Telephone reservation'} for ${service}.`,
      documents: [
        { name: 'National Identity Card (NIC).pdf', size: '340 KB' },
        { name: 'Citizen Intake Slip.pdf', size: '120 KB' },
      ],
      counter,
      division,
      priority,
      status: 'APPROVED', // Direct staff bookings are immediately approved/scheduled
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-gray-300 rounded shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/75 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#A31736]/10 text-[#A31736] rounded border border-[#A31736]/20">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <line x1="12" y1="14" x2="12" y2="18" />
                <line x1="10" y1="16" x2="14" y2="16" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                Schedule Citizen Appointment
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Pradeshiya Sabha Municipal Front-Desk & Citizen Services
              </p>
            </div>
          </div>
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Booking Channel Switcher */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">
              Intake Channel
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'walkin', label: '🚶 Walk-In Counter' },
                { id: 'phone', label: '📞 Phone Call Intake' },
                { id: 'citizen_portal', label: '🌐 Online Request' },
              ].map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setBookingType(c.id as any)}
                  className={`py-2 px-3 text-xs font-bold rounded border transition-all text-center cursor-pointer ${
                    bookingType === c.id
                      ? 'border-[#A31736] bg-[#A31736]/10 text-[#A31736]'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Citizen Details Section */}
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <h3 className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wider">
              1. Citizen Personal & Contact Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Citizen Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priyantha Dissanayake"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  National ID (NIC) Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 198523456789 or 852345678V"
                  value={nicNumber}
                  onChange={(e) => setNicNumber(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 uppercase focus:outline-none focus:ring-1 focus:ring-[#A31736]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Contact Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 077 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g. citizen@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Grama Niladhari Division (Jurisdiction)
                </label>
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736]"
                >
                  {GN_DIVISIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Appointment Scheduling Details */}
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <h3 className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wider">
              2. Service & Scheduling Slot
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Service Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#A31736]"
                >
                  {SERVICES_LIST.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Assigned Officer / Reviewer <span className="text-red-500">*</span>
                </label>
                <select
                  value={assignedOfficer}
                  onChange={(e) => setAssignedOfficer(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#A31736]"
                >
                  {OFFICERS_LIST.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Appointment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Time Slot <span className="text-red-500">*</span>
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#A31736]"
                >
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Designated Counter / Room
                </label>
                <select
                  value={counter}
                  onChange={(e) => setCounter(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736]"
                >
                  {MUNICIPAL_COUNTERS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Priority Level
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#A31736]"
                >
                  <option value="NORMAL">Normal Citizen Queue</option>
                  <option value="URGENT">Urgent / Time-Sensitive</option>
                  <option value="VIP">Senior Citizen / Special Care</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Citizen Request Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bringing deed documents for subdivision"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736]"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 pt-4 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-bold rounded bg-white hover:bg-gray-50 transition-colors uppercase tracking-wider cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#A31736] hover:bg-[#801028] text-white text-xs font-bold rounded transition-colors uppercase tracking-wider shadow-sm cursor-pointer"
            >
              Confirm & Book Slot
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default ScheduleAppointmentModal;
