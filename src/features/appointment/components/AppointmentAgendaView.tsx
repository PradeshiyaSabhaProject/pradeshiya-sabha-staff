import React from 'react';
import { type AppointmentItem, type AppointmentStatus } from '../services/appointmentApi';

interface AppointmentAgendaViewProps {
  appointments: AppointmentItem[];
  selectedDate: string;
  onSelectAppointment: (app: AppointmentItem) => void;
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
}

const TIME_BLOCKS = [
  { label: '08:30 AM - 09:30 AM', startHour: '08' },
  { label: '09:30 AM - 10:30 AM', startHour: '09' },
  { label: '10:30 AM - 11:30 AM', startHour: '10' },
  { label: '11:30 AM - 12:30 PM', startHour: '11' },
  { label: '01:00 PM - 02:00 PM', startHour: '01' },
  { label: '02:00 PM - 03:00 PM', startHour: '02' },
  { label: '03:00 PM - 04:00 PM', startHour: '03' },
  { label: '04:00 PM - 05:00 PM', startHour: '04' },
];

export const AppointmentAgendaView: React.FC<AppointmentAgendaViewProps> = ({
  appointments,
  selectedDate,
  onSelectAppointment,
  onUpdateStatus,
}) => {
  const getStatusBadgeClass = (status: AppointmentStatus) => {
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

  return (
    <div className="p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-200 pb-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Daily Municipal Consultation Timeline
          </h3>
          <p className="text-xs text-gray-500">
            {selectedDate
              ? `Displaying booked slots for ${selectedDate}`
              : 'Showing all scheduled citizen appointments across timeline blocks'}
          </p>
        </div>
        <div className="text-xs text-gray-500 font-medium">
          <span className="font-bold text-gray-900">{appointments.length}</span> consultations in queue
        </div>
      </div>

      {/* Timeline Slots */}
      <div className="space-y-4">
        {TIME_BLOCKS.map((block) => {
          const slotAppointments = appointments.filter((app) => {
            const timePart = app.dateTime.split(' ').slice(1).join(' ');
            return timePart.startsWith(block.startHour);
          });

          return (
            <div
              key={block.label}
              className="border border-gray-200 rounded overflow-hidden bg-white shadow-3xs"
            >
              <div className="bg-gray-50/75 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#A31736]" />
                  <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    {block.label}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-gray-500">
                  {slotAppointments.length} {slotAppointments.length === 1 ? 'Booking' : 'Bookings'}
                </span>
              </div>

              <div className="p-3">
                {slotAppointments.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-1 px-1">
                    No citizen consultations scheduled in this time slot.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {slotAppointments.map((app) => (
                      <div
                        key={app.id}
                        className="border border-gray-200 rounded p-3 bg-white hover:border-[#A31736]/40 hover:shadow-xs transition-all flex flex-col justify-between space-y-2"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-mono text-[11px] font-bold text-[#A31736]">
                              {app.id}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border ${getStatusBadgeClass(
                                app.status
                              )}`}
                            >
                              {app.status}
                            </span>
                          </div>

                          <p className="text-xs font-bold text-gray-900 truncate">
                            {app.citizenName}
                          </p>
                          <p className="text-[11px] font-semibold text-[#1e3a8a] mt-0.5 truncate">
                            {app.service}
                          </p>
                          <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-1">
                            <span>📞 {app.phone}</span>
                            <span>•</span>
                            <span className="truncate">{app.assignedOfficer}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-1">
                          <button
                            type="button"
                            onClick={() => onSelectAppointment(app)}
                            className="text-xs font-bold text-[#1e3a8a] hover:underline cursor-pointer"
                          >
                            View Record &rarr;
                          </button>

                          <div className="flex items-center gap-1">
                            {app.status === 'PENDING' && (
                              <button
                                type="button"
                                onClick={() => onUpdateStatus(app.id, 'APPROVED')}
                                className="px-2 py-0.5 text-[10px] font-bold bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors uppercase tracking-wider cursor-pointer"
                              >
                                Approve
                              </button>
                            )}
                            {app.status === 'APPROVED' && (
                              <button
                                type="button"
                                onClick={() => onUpdateStatus(app.id, 'COMPLETED')}
                                className="px-2 py-0.5 text-[10px] font-bold bg-[#A31736] text-white rounded hover:bg-[#801028] transition-colors uppercase tracking-wider cursor-pointer"
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AppointmentAgendaView;
