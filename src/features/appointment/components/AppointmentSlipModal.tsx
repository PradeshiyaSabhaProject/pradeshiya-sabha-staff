import React from 'react';
import { type AppointmentItem } from '../services/appointmentApi';

interface AppointmentSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentItem | null;
}

export const AppointmentSlipModal: React.FC<AppointmentSlipModalProps> = ({
  isOpen,
  onClose,
  appointment,
}) => {
  if (!isOpen || !appointment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in print:p-0 print:bg-white">
      <div className="relative w-full max-w-md bg-white border border-gray-300 rounded shadow-2xl overflow-hidden flex flex-col print:border-none print:shadow-none print:max-w-full">
        
        {/* Header toolbar (Hidden on print) */}
        <div className="px-5 py-3 border-b border-gray-200 bg-gray-50/75 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Visitor Slip / Token Pass
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1 bg-[#1e3a8a] text-white text-xs font-bold rounded hover:bg-[#172554] transition-colors flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              <span>Print Slip</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-200/60 transition-colors cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Printable Ticket Body */}
        <div className="p-6 bg-white space-y-4 text-center">
          {/* Municipal Crest / Header */}
          <div className="border-b-2 border-dashed border-gray-300 pb-4">
            <div className="inline-block p-2 bg-[#A31736]/10 rounded-full mb-1 text-[#A31736]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">
              HOMAGAMA PRADESHIYA SABHA
            </h2>
            <p className="text-[11px] text-gray-500 font-medium">
              Official Citizen Appointment & Consultation Token
            </p>
          </div>

          {/* Reference & Token Box */}
          <div className="bg-gray-50 border border-gray-200 rounded p-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Reference Token
            </p>
            <p className="text-2xl font-black text-[#A31736] tracking-tight">
              {appointment.id}
            </p>
            <div className="inline-block mt-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-extrabold uppercase tracking-wider">
              {appointment.status}
            </div>
          </div>

          {/* Key Appointment Details */}
          <div className="text-left text-xs space-y-2 border-y border-dashed border-gray-200 py-3 text-gray-700">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-500">Citizen:</span>
              <span className="font-bold text-gray-900">{appointment.citizenName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-500">NIC Number:</span>
              <span className="font-mono font-medium text-gray-900">{appointment.nicNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-500">Service:</span>
              <span className="font-bold text-[#1e3a8a]">{appointment.service}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-500">Scheduled Date & Time:</span>
              <span className="font-bold text-gray-900">{appointment.dateTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-500">Assigned Officer:</span>
              <span className="font-semibold text-gray-900">{appointment.assignedOfficer}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-500">Desk / Counter:</span>
              <span className="font-bold text-gray-900">
                {appointment.counter || 'Counter 01 - Citizen Reception'}
              </span>
            </div>
          </div>

          {/* Citizen Notice / Instructions */}
          <div className="text-[10px] text-gray-500 text-left space-y-1 bg-amber-50/50 p-2.5 rounded border border-amber-200/60">
            <p className="font-bold text-amber-900 uppercase tracking-wide">
              Citizen Instructions:
            </p>
            <ul className="list-disc pl-4 space-y-0.5 text-amber-800">
              <li>Please arrive 10 minutes prior to your scheduled slot.</li>
              <li>Carry original NIC and physical copies of uploaded documents.</li>
              <li>Present this token slip at the gate security and reception counter.</li>
            </ul>
          </div>

          {/* Barcode / Stamp Mock */}
          <div className="pt-2 flex flex-col items-center">
            <div className="font-mono text-[9px] text-gray-400 tracking-widest">
              ||| | ||||| ||| || |||| ||||| || |
            </div>
            <p className="text-[9px] text-gray-400 mt-1">
              Issued by Pradeshiya Sabha Municipal System • 2026
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AppointmentSlipModal;
