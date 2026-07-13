import React, { useState } from 'react';
import { useAppointmentData } from './hooks/useAppointmentData';
import { AppointmentDetailsModal } from './components/AppointmentDetailsModal';
import { type AppointmentItem } from './services/appointmentApi';

interface AppointmentPageProps {
  mode: 'all' | 'my';
}

// â”€â”€ Icons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const OrangeClockIcon = () => (
  <div className="p-2 bg-orange-50 rounded border border-orange-200 shrink-0">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-orange-500">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  </div>
);

const GreenClockIcon = () => (
  <div className="p-2 bg-green-50 rounded border border-green-200 shrink-0">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-green-500">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 15 9" />
    </svg>
  </div>
);

const RedWarningIcon = () => (
  <div className="p-2 bg-red-50 rounded border border-red-200 shrink-0">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-red-500">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  </div>
);

const PurpleClipboardIcon = () => (
  <div className="p-2 bg-purple-50 rounded border border-purple-200 shrink-0">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-purple-500">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <polyline points="9 14 11 16 15 12" />
    </svg>
  </div>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4.5 h-4.5 text-gray-700">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-green-600">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CrossIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-red-600">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const AppointmentPage: React.FC<AppointmentPageProps> = ({ mode }) => {
  const {
    loading,
    appointments,
    allAppointmentsCount,
    tabCounts,
    activeTab,
    setActiveTab,
    selectedDate,
    setSelectedDate,
    selectedService,
    setSelectedService,
    selectedStatus,
    setSelectedStatus,
    selectedOfficer,
    setSelectedOfficer,
    currentPage,
    setCurrentPage,
    totalPages,
    updateStatus,
    rescheduleAppointment,
    resetFilters,
    startIndex,
    endIndex,
  } = useAppointmentData({ mode });

  // Modal State
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openDetails = (app: AppointmentItem) => {
    setSelectedAppointment(app);
    setIsModalOpen(true);
  };

  const closeDetails = () => {
    setSelectedAppointment(null);
    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    // Generate CSV content
    const headers = 'ID,Citizen Name,Phone,Email,Service,Date & Time,Assigned Officer,Status,Remark\n';
    const rows = appointments
      .map(
        (a) =>
          `"${a.id}","${a.citizenName}","${a.phone}","${a.email}","${a.service}","${a.dateTime}","${a.assignedOfficer}","${a.status}","${a.remark.replace(/"/g, '""')}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${mode === 'my' ? 'My' : 'All'}_Appointments.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Status Style badge helper
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'border border-orange-200 bg-orange-50/50 text-[#ea580c]';
      case 'APPROVED':
        return 'border border-green-200 bg-green-50/50 text-[#16a34a]';
      case 'RESCHEDULED':
        return 'border border-blue-200 bg-blue-50/50 text-[#2563eb]';
      case 'REJECTED':
        return 'border border-red-200 bg-red-50/50 text-[#dc2626]';
      case 'COMPLETED':
        return 'border border-purple-200 bg-purple-50/50 text-[#7c3aed]';
      case 'NO-SHOW':
        return 'border border-gray-200 bg-gray-50/50 text-[#6b7280]';
      default:
        return 'border border-gray-200 bg-gray-50/50 text-gray-700';
    }
  };

  const tabs = [
    { label: 'All Appointment', count: tabCounts.all },
    { label: 'Pending', count: tabCounts.pending },
    { label: 'Approved', count: tabCounts.approved },
    { label: 'Rejected', count: tabCounts.rejected },
    { label: 'Completed', count: tabCounts.completed },
    { label: 'No-show', count: tabCounts.noShow },
    { label: 'Rescheduled', count: tabCounts.rescheduled },
  ];

  const services = [
    'All Services',
    'Building Approval',
    'Business License',
    'Death Certificate',
    'Land Transfer',
    'Birth Certificate',
    'Trade License',
    'Garbage Collection',
  ];

  const statuses = [
    'All Statuses',
    'PENDING',
    'APPROVED',
    'RESCHEDULED',
    'REJECTED',
    'COMPLETED',
    'NO-SHOW',
  ];

  const officers = [
    'All Officers',
    'M.Perera',
    'L.D.Silva',
    'N.Fernando',
    'S.Jayasooriya',
    'Dev Admin',
    'Staff Member',
  ];

  // Helper for generating page ranges
  const renderPaginationRange = () => {
    const range = [];
    // Always show page 1
    range.push(
      <button
        key={1}
        onClick={() => setCurrentPage(1)}
        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
          currentPage === 1 ? 'bg-[#A31736] text-white' : 'bg-transparent text-gray-700 hover:bg-gray-100'
        }`}
      >
        1
      </button>
    );

    if (currentPage > 3) {
      range.push(
        <span key="dots-1" className="text-gray-400 text-xs px-1">
          ...
        </span>
      );
    }

    // Mid pages
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      range.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            currentPage === i ? 'bg-[#A31736] text-white' : 'bg-transparent text-gray-700 hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }

    if (currentPage < totalPages - 2) {
      range.push(
        <span key="dots-2" className="text-gray-400 text-xs px-1">
          ...
        </span>
      );
    }

    // Always show last page if > 1
    if (totalPages > 1) {
      range.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            currentPage === totalPages ? 'bg-[#A31736] text-white' : 'bg-transparent text-gray-700 hover:bg-gray-100'
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return range;
  };

  const skeleton = (h = 'h-12') => (
    <div className={`${h} bg-gray-100 rounded-lg animate-pulse w-full`} />
  );

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* â”€â”€ Header â”€â”€ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'my' ? 'My Appointments' : 'All Appointments'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage and review all citizen's Appointment.</p>
        </div>

        {/* Quick Stats Widget */}
        <div className="bg-white border border-gray-200/80 rounded-xl px-4 py-2 flex items-center gap-2 shadow-2xs font-bold text-xs uppercase tracking-wide text-gray-700 shrink-0 self-start sm:self-center">
          <span className="text-[10px] text-gray-400">Quick Stats:</span>
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
          <span>{tabCounts.pending} Pending</span>
        </div>
      </div>

      {/* â”€â”€ Stats Cards Grid â”€â”€ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending */}
        <div className="bg-white border border-gray-300 rounded p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default min-h-[120px]">
          <div className="flex items-center justify-center gap-2">
            <OrangeClockIcon />
            <span className="text-xs font-bold text-[#ea580c]/90 uppercase tracking-wider">Pending Appointment</span>
          </div>
          <p className="text-3xl font-extrabold text-[#ea580c] text-center mt-2.5 tracking-tight">
            {loading ? '...' : tabCounts.pending.toString().padStart(2, '0')}
          </p>
        </div>

        {/* Approved */}
        <div className="bg-white border border-gray-300 rounded p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default min-h-[120px]">
          <div className="flex items-center justify-center gap-2">
            <GreenClockIcon />
            <span className="text-xs font-bold text-[#16a34a]/90 uppercase tracking-wider">Approved Appointment</span>
          </div>
          <p className="text-3xl font-extrabold text-[#16a34a] text-center mt-2.5 tracking-tight">
            {loading ? '...' : tabCounts.approved.toString().padStart(2, '0')}
          </p>
        </div>

        {/* Rejected */}
        <div className="bg-white border border-gray-300 rounded p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default min-h-[120px]">
          <div className="flex items-center justify-center gap-2">
            <RedWarningIcon />
            <span className="text-xs font-bold text-[#dc2626]/90 uppercase tracking-wider">Rejected Appointment</span>
          </div>
          <p className="text-3xl font-extrabold text-[#dc2626] text-center mt-2.5 tracking-tight">
            {loading ? '...' : tabCounts.rejected.toString().padStart(2, '0')}
          </p>
        </div>

        {/* Completed */}
        <div className="bg-white border border-gray-300 rounded p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default min-h-[120px]">
          <div className="flex items-center justify-center gap-2">
            <PurpleClipboardIcon />
            <span className="text-xs font-bold text-[#7c3aed]/90 uppercase tracking-wider">Completed Appointment</span>
          </div>
          <p className="text-3xl font-extrabold text-[#7c3aed] text-center mt-2.5 tracking-tight">
            {loading ? '...' : tabCounts.completed.toString().padStart(2, '0')}
          </p>
        </div>
      </div>

      {/* â”€â”€ Main content Card (Tabs + Filters + Table) â”€â”€ */}
      <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden flex flex-col">
        
        {/* Tabs Bar */}
        <div className="overflow-x-auto border-b border-gray-200">
          <div className="flex px-4 min-w-[700px]">
            {tabs.map((tab) => {
              const cleanedLabel = tab.label === 'All Appointment' ? 'All Appointment' : tab.label;
              const isActive = activeTab === cleanedLabel;
              return (
                <button
                  key={tab.label}
                  onClick={() => {
                    setActiveTab(cleanedLabel);
                  }}
                  className={`py-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer outline-none whitespace-nowrap ${
                    isActive
                      ? 'border-[#A31736] text-[#A31736]'
                      : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-200'
                  }`}
                >
                  {tab.label}({loading ? '..' : tab.count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters Panel */}
        <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Input */}
            <div className="relative flex items-center">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9 w-40 cursor-pointer"
                placeholder="Date"
              />
            </div>

            {/* Services Dropdown */}
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9 w-44 cursor-pointer"
            >
              {services.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Statuses Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9 w-40 cursor-pointer"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s === 'All Statuses' ? 'All Statuses' : s}
                </option>
              ))}
            </select>

            {/* Officers Dropdown */}
            <select
              value={selectedOfficer}
              onChange={(e) => setSelectedOfficer(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9 w-40 cursor-pointer"
            >
              {officers.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetFilters}
              className="border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold px-4 py-2 rounded transition-colors cursor-pointer h-9 shadow-xs uppercase tracking-wider"
            >
              Filter
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-[#A31736] hover:bg-[#801028] text-white text-xs font-semibold px-4 py-2 rounded transition-colors cursor-pointer h-9 shadow-xs uppercase tracking-wider"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-6 w-32">ID</th>
                <th className="py-3 px-6">Citizen Name</th>
                <th className="py-3 px-6">Service</th>
                <th className="py-3 px-6">Date & Time</th>
                <th className="py-3 px-6">Assigned Officer</th>
                <th className="py-3 px-6 text-center">Status</th>
                <th className="py-3 px-6 text-center w-36">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td colSpan={7} className="py-4 px-6">
                      {skeleton('h-10')}
                    </td>
                  </tr>
                ))
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 font-medium italic">
                    No appointments found matching the selected filters.
                  </td>
                </tr>
              ) : (
                appointments.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/40 transition-colors">
                    {/* ID */}
                    <td className="py-4.5 px-6 font-bold text-gray-700 whitespace-nowrap">{app.id}</td>

                    {/* Citizen Name & Phone */}
                    <td className="py-4.5 px-6 whitespace-nowrap">
                      <div className="font-bold text-gray-900">{app.citizenName}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5 font-medium">{app.phone}</div>
                    </td>

                    {/* Service */}
                    <td className="py-4.5 px-6 font-bold text-gray-800 whitespace-nowrap">{app.service}</td>

                    {/* Date & Time */}
                    <td className="py-4.5 px-6 whitespace-nowrap">
                      <div className="font-bold text-gray-900">{app.dateTime.split(' ')[0]}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5 font-medium">
                        {app.dateTime.split(' ').slice(1).join(' ')}
                      </div>
                    </td>

                    {/* Assigned Officer */}
                    <td className="py-4.5 px-6 font-bold text-gray-800 whitespace-nowrap">{app.assignedOfficer}</td>

                    {/* Status Pill Badge */}
                    <td className="py-4.5 px-6 text-center whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-3 py-1.5 rounded-md uppercase tracking-wide inline-block ${getStatusBadgeClass(app.status)}`}>
                        {app.status}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-4.5 px-6 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Eye Button */}
                        <button
                          onClick={() => openDetails(app)}
                          className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 p-1.5 rounded-lg transition-colors cursor-pointer shadow-3xs flex items-center justify-center"
                          title="View Details"
                        >
                          <EyeIcon />
                        </button>

                        {/* Approve and Reject (Only for 'my' mode and status is PENDING) */}
                        {mode === 'my' && app.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => updateStatus(app.id, 'APPROVED')}
                              className="border border-green-200 bg-green-50 hover:bg-green-100 p-1.5 rounded-lg transition-colors cursor-pointer shadow-3xs flex items-center justify-center"
                              title="Approve Appointment"
                            >
                              <CheckIcon />
                            </button>
                            <button
                              onClick={() => updateStatus(app.id, 'REJECTED')}
                              className="border border-red-200 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition-colors cursor-pointer shadow-3xs flex items-center justify-center"
                              title="Reject Appointment"
                            >
                              <CrossIcon />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {!loading && appointments.length > 0 && (
          <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
            <span className="text-xs font-medium text-gray-500">
              Showing {startIndex}-{endIndex} of {allAppointmentsCount} results
            </span>

            <div className="flex items-center gap-1">
              {/* Prev Button */}
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                className="w-8 h-8 rounded-lg text-xs font-bold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center justify-center cursor-pointer shadow-3xs"
              >
                &lt;
              </button>

              {/* Page numbers */}
              {renderPaginationRange()}

              {/* Next Button */}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
                className="w-8 h-8 rounded-lg text-xs font-bold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center justify-center cursor-pointer shadow-3xs"
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Appointment Details Modal */}
      <AppointmentDetailsModal
        isOpen={isModalOpen}
        onClose={closeDetails}
        appointment={selectedAppointment}
        mode={mode}
        onUpdateStatus={updateStatus}
        onReschedule={rescheduleAppointment}
      />
    </div>
  );
};

export default AppointmentPage;

