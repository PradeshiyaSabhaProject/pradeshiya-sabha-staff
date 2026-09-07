import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GN_DIVISIONS,
  MUNICIPAL_COUNTERS,
  type AppointmentItem,
} from './services/appointmentApi';
import { useAppointmentData } from './hooks/useAppointmentData';
import { AppointmentSlipModal } from './components/AppointmentSlipModal';
import { useAuth } from '../../context/AuthContext';

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

export const ScheduleAppointmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addAppointment } = useAppointmentData({ mode: 'all' });

  // Form Fields State
  const [citizenName, setCitizenName] = useState('');
  const [nicNumber, setNicNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [division, setDivision] = useState(GN_DIVISIONS[0]);
  const [service, setService] = useState(SERVICES_LIST[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[2]);
  const [assignedOfficer, setAssignedOfficer] = useState(
    user?.name && OFFICERS_LIST.includes(user.name) ? user.name : OFFICERS_LIST[0]
  );
  const [counter, setCounter] = useState(MUNICIPAL_COUNTERS[0]);
  const [priority, setPriority] = useState<'NORMAL' | 'URGENT' | 'VIP'>('NORMAL');
  const [remark, setRemark] = useState('');
  const [bookingType, setBookingType] = useState<'walkin' | 'phone' | 'citizen_portal'>('walkin');

  // Success Confirmation & Slip State
  const [createdAppointment, setCreatedAppointment] = useState<AppointmentItem | null>(null);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenName.trim() || !nicNumber.trim() || !phone.trim() || !date) {
      setErrorMessage('Please fill in all mandatory citizen identification and schedule fields.');
      return;
    }

    const dateTime = `${date} ${timeSlot}`;

    const newApp = addAppointment({
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
        { name: 'Citizen Intake Registration Slip.pdf', size: '120 KB' },
      ],
      counter,
      division,
      priority,
      status: 'APPROVED', // Staff-scheduled appointments are directly confirmed
    });

    setCreatedAppointment(newApp);
    setIsSuccess(true);
    setErrorMessage('');
  };

  const handleResetForm = () => {
    setCitizenName('');
    setNicNumber('');
    setPhone('');
    setEmail('');
    setDivision(GN_DIVISIONS[0]);
    setService(SERVICES_LIST[0]);
    setDate(new Date().toISOString().split('T')[0]);
    setTimeSlot(TIME_SLOTS[2]);
    setCounter(MUNICIPAL_COUNTERS[0]);
    setPriority('NORMAL');
    setRemark('');
    setIsSuccess(false);
    setCreatedAppointment(null);
    setErrorMessage('');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* ── Institutional Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            Schedule Citizen Appointment
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Front-desk municipal intake, citizen registration, time slot reservation, and counter allocation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/appointments/all')}
            className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold px-4 py-2 rounded transition-colors uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-500">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            <span>View All Appointments</span>
          </button>
        </div>
      </div>

      {/* ── Quick Overview Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Active Intake Counter */}
        <div className="bg-white border border-gray-300 rounded p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Intake Counter
            </p>
            <p className="text-base font-bold text-gray-900 mt-0.5">
              Counter 01 - Helpdesk
            </p>
            <p className="text-[11px] text-gray-400">Homagama Council Complex</p>
          </div>
          <div className="p-2 bg-blue-50 text-blue-800 rounded border border-blue-200">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-white border border-gray-300 rounded p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Consultation Hours
            </p>
            <p className="text-base font-bold text-gray-900 mt-0.5">
              08:30 AM – 04:30 PM
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold">● Counter Desk Active</p>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
        </div>

        {/* Priority Queue Support */}
        <div className="bg-white border border-gray-300 rounded p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Service Fast-Track
            </p>
            <p className="text-base font-bold text-gray-900 mt-0.5">
              Token Pass & SMS Alerts
            </p>
            <p className="text-[11px] text-gray-400">Automatic Citizen Notification</p>
          </div>
          <div className="p-2 bg-[#A31736]/10 text-[#A31736] rounded border border-[#A31736]/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
        </div>

      </div>

      {/* ── Success Confirmation Banner (When booked) ── */}
      {isSuccess && createdAppointment && (
        <div className="bg-emerald-50 border border-emerald-300 rounded p-5 shadow-sm space-y-3 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600 text-white rounded-full">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wide">
                  Appointment Scheduled & Confirmed Successfully!
                </h3>
                <p className="text-xs text-emerald-800">
                  Reference Token: <span className="font-mono font-bold text-emerald-950">{createdAppointment.id}</span> • Scheduled for {createdAppointment.citizenName} on {createdAppointment.dateTime}.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSlipModal(true)}
                className="px-4 py-2 bg-[#1e3a8a] hover:bg-[#172554] text-white text-xs font-bold rounded transition-colors uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                <span>Print Visitor Pass</span>
              </button>

              <button
                type="button"
                onClick={handleResetForm}
                className="px-3.5 py-2 border border-emerald-300 bg-white hover:bg-emerald-100 text-emerald-900 text-xs font-bold rounded transition-colors uppercase tracking-wider cursor-pointer"
              >
                + Schedule Another
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Structured Scheduling Form ── */}
      <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
        
        {/* Form Header Bar */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/75 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 uppercase tracking-wide">
              Citizen Intake & Appointment Booking Form
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Enter citizen profile, allocate available council officer, and issue verified token slip.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-gray-500 whitespace-nowrap">
            Fields marked with <span className="text-red-500">*</span> are mandatory
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 font-medium">
              {errorMessage}
            </div>
          )}

          {/* Intake Channel Selector */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">
              Intake Channel
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'walkin', label: '🚶 Walk-In Front Desk Counter' },
                { id: 'phone', label: '📞 Telephone Call Inquiry' },
                { id: 'citizen_portal', label: '🌐 Online Citizen Portal Request' },
              ].map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setBookingType(c.id as any)}
                  className={`py-2.5 px-4 text-xs font-bold rounded border transition-all text-center cursor-pointer ${
                    bookingType === c.id
                      ? 'border-[#A31736] bg-[#A31736]/10 text-[#A31736]'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 1: Citizen Identification & Demographics */}
          <div className="border-t border-gray-200 pt-5 space-y-4">
            <h3 className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wider flex items-center gap-2">
              <span>1. Citizen Identity & Demographic Profile</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Citizen Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunil Shantha Jayawardena"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  National Identity Card (NIC) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 198523456789 or 852345678V"
                  value={nicNumber}
                  onChange={(e) => setNicNumber(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 uppercase focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Contact Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 077 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. citizen@example.lk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Grama Niladhari Division
                </label>
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9"
                >
                  {GN_DIVISIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Citizen Priority Level
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9"
                >
                  <option value="NORMAL">Normal Citizen Queue</option>
                  <option value="URGENT">Urgent / Court / Time-Sensitive</option>
                  <option value="VIP">Senior Citizen / Differently Abled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Service & Schedule Allocation */}
          <div className="border-t border-gray-200 pt-5 space-y-4">
            <h3 className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wider flex items-center gap-2">
              <span>2. Service Area, Date & Counter Assignment</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Service Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 font-bold focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9"
                >
                  {SERVICES_LIST.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Assigned Municipal Officer <span className="text-red-500">*</span>
                </label>
                <select
                  value={assignedOfficer}
                  onChange={(e) => setAssignedOfficer(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 font-semibold focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9"
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
                  Appointment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Preferred Time Slot <span className="text-red-500">*</span>
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 font-semibold focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9 cursor-pointer"
                >
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Designated Service Counter / Desk
                </label>
                <select
                  value={counter}
                  onChange={(e) => setCounter(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9"
                >
                  {MUNICIPAL_COUNTERS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Consultation Purpose & Verification Checklist */}
          <div className="border-t border-gray-200 pt-5 space-y-4">
            <h3 className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wider flex items-center gap-2">
              <span>3. Consultation Purpose & Document Intake</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-7">
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Citizen Request Remarks & Consultation Goal
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Submitting initial survey blueprint for house extension and deed clearance..."
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded p-2.5 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#A31736]"
                />
              </div>

              <div className="md:col-span-5 bg-gray-50 border border-gray-200 rounded p-3 text-xs space-y-2">
                <p className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                  Document Checklist Reminder
                </p>
                <ul className="text-gray-600 text-[11px] space-y-1">
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-600">✓</span> Original National Identity Card (NIC)
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-600">✓</span> Deed copy / Land registry clearance
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-600">✓</span> Assessment tax clearance certificate
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-600">✓</span> Completed Pradeshiya Sabha application form
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Form Actions Toolbar */}
          <div className="border-t border-gray-200 pt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-bold rounded bg-white hover:bg-gray-100 transition-colors uppercase tracking-wider cursor-pointer"
            >
              Clear Form
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/appointments/all')}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-bold rounded bg-white hover:bg-gray-50 transition-colors uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2 bg-[#A31736] hover:bg-[#801028] text-white text-xs font-bold rounded transition-colors uppercase tracking-wider shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>Confirm & Issue Appointment Token</span>
              </button>
            </div>
          </div>

        </form>

      </div>

      {/* Printable Visitor Slip Modal */}
      <AppointmentSlipModal
        isOpen={showSlipModal}
        onClose={() => setShowSlipModal(false)}
        appointment={createdAppointment}
      />
    </div>
  );
};

export default ScheduleAppointmentPage;
