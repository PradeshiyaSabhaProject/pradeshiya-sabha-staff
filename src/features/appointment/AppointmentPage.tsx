import React, { useState } from 'react';
import { useAppointmentData } from './hooks/useAppointmentData';
import { AppointmentDetailsModal } from './components/AppointmentDetailsModal';
import { AppointmentSlipModal } from './components/AppointmentSlipModal';
import { AppointmentAgendaView } from './components/AppointmentAgendaView';
import { type AppointmentItem } from './services/appointmentApi';

interface AppointmentPageProps {
  mode: 'all' | 'my';
}

// ── Icons ──────────────────────────────────────────────────────────────────
const PendingClockIcon = () => (
  <div className="p-1.5 bg-amber-50 rounded border border-amber-200 shrink-0 text-amber-700">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  </div>
);

const ApprovedCheckIcon = () => (
  <div className="p-1.5 bg-emerald-50 rounded border border-emerald-200 shrink-0 text-emerald-700">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  </div>
);

const CompletedTrophyIcon = () => (
  <div className="p-1.5 bg-purple-50 rounded border border-purple-200 shrink-0 text-purple-700">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34" />
      <path d="M18 4H6v7a6 6 0 0 0 12 0V4z" />
    </svg>
  </div>
);

const RescheduledSyncIcon = () => (
  <div className="p-1.5 bg-blue-50 rounded border border-blue-200 shrink-0 text-blue-700">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <polyline points="1 4 1 10 7 10" />
      <polyline points="23 20 23 14 17 14" />
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
    </svg>
  </div>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-700">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const PrintSmallIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-700">
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

export const AppointmentPage: React.FC<AppointmentPageProps> = ({ mode }) => {
  const {
    loading,
    appointments,
    allAppointments,
    allAppointmentsCount,
    tabCounts,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedDate,
    setSelectedDate,
    selectedService,
    setSelectedService,
    selectedOfficer,
    setSelectedOfficer,
    viewMode,
    setViewMode,
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
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [slipAppointment, setSlipAppointment] = useState<AppointmentItem | null>(null);

  const openDetails = (app: AppointmentItem) => {
    setSelectedAppointment(app);
    setIsDetailsModalOpen(true);
  };

  const closeDetails = () => {
    setSelectedAppointment(null);
    setIsDetailsModalOpen(false);
  };

  const openSlip = (app: AppointmentItem) => {
    setSlipAppointment(app);
  };

  const handleExportCSV = () => {
    const headers = 'ID,Citizen Name,NIC,Phone,Email,Service,Date & Time,Assigned Officer,Desk/Counter,Status,Remark\n';
    const rows = allAppointments
      .map(
        (a) =>
          `"${a.id}","${a.citizenName}","${a.nicNumber}","${a.phone}","${a.email}","${a.service}","${a.dateTime}","${a.assignedOfficer}","${a.counter || 'Counter 01'}","${a.status}","${a.remark.replaceAll('"', '""')}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${mode === 'my' ? 'My' : 'All'}_Appointments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Status Style badge helper
  const getStatusBadgeClass = (status: string) => {
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

  const tabs = [
    { label: 'All Appointment', count: tabCounts.all },
    { label: 'Pending', count: tabCounts.pending },
    { label: 'Approved', count: tabCounts.approved },
    { label: 'Rescheduled', count: tabCounts.rescheduled },
    { label: 'Completed', count: tabCounts.completed },
    { label: 'Rejected', count: tabCounts.rejected },
    { label: 'No-show', count: tabCounts.noShow },
  ];

  const services = [
    'All Services',
    'Building Approval',
    'Business License',
    'Trade License',
    'Death Certificate',
    'Land Transfer',
    'Birth Certificate',
    'Garbage Collection',
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

  const renderPaginationRange = () => {
    const range = [];
    range.push(
      <button
        type="button"
        key={1}
        onClick={() => setCurrentPage(1)}
        className={`w-8 h-8 rounded text-xs font-bold transition-all cursor-pointer ${
          currentPage === 1 ? 'bg-[#A31736] text-white' : 'bg-transparent text-gray-700 hover:bg-gray-100 border border-gray-200'
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

    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      range.push(
        <button
          type="button"
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`w-8 h-8 rounded text-xs font-bold transition-all cursor-pointer ${
            currentPage === i ? 'bg-[#A31736] text-white' : 'bg-transparent text-gray-700 hover:bg-gray-100 border border-gray-200'
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

    if (totalPages > 1) {
      range.push(
        <button
          type="button"
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className={`w-8 h-8 rounded text-xs font-bold transition-all cursor-pointer ${
            currentPage === totalPages ? 'bg-[#A31736] text-white' : 'bg-transparent text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return range;
  };

  const getTableBodyContent = () => {
    if (loading) {
      return [1, 2, 3, 4, 5].map((i) => (
        <tr key={i}>
          <td colSpan={7} className="py-4 px-6">
            <div className="h-9 bg-gray-100 rounded animate-pulse w-full" />
          </td>
        </tr>
      ));
    }

    if (appointments.length === 0) {
      return (
        <tr>
          <td colSpan={7} className="py-12 text-center text-gray-500 font-medium italic">
            No citizen appointments found matching the selected filters.
          </td>
        </tr>
      );
    }

    return appointments.map((app) => (
      <tr key={app.id} className="hover:bg-gray-50 transition-colors">
        {/* ID */}
        <td className="py-3.5 px-6 font-mono font-bold text-gray-900 whitespace-nowrap">
          {app.id}
        </td>

        {/* Citizen Details */}
        <td className="py-3.5 px-6 whitespace-nowrap">
          <div className="font-bold text-gray-900">{app.citizenName}</div>
          <div className="text-[11px] text-gray-500 font-medium">
            NIC: {app.nicNumber} • 📞 {app.phone}
          </div>
        </td>

        {/* Service & Division */}
        <td className="py-3.5 px-6 whitespace-nowrap">
          <div className="font-bold text-[#1e3a8a]">{app.service}</div>
          <div className="text-[11px] text-gray-500 font-medium">
            {app.division || 'Homagama Jurisdiction'}
          </div>
        </td>

        {/* Scheduled Slot */}
        <td className="py-3.5 px-6 whitespace-nowrap">
          <div className="font-bold text-gray-900">{app.dateTime.split(' ')[0]}</div>
          <div className="text-[11px] text-gray-600 font-medium">
            {app.dateTime.split(' ').slice(1).join(' ')} • {app.counter || 'Counter 01'}
          </div>
        </td>

        {/* Assigned Officer */}
        <td className="py-3.5 px-6 font-semibold text-gray-800 whitespace-nowrap">
          {app.assignedOfficer}
        </td>

        {/* Status Badge */}
        <td className="py-3.5 px-6 text-center whitespace-nowrap">
          <span
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wide inline-block border ${getStatusBadgeClass(
              app.status
            )}`}
          >
            {app.status}
          </span>
        </td>

        {/* Action Buttons */}
        <td className="py-3.5 px-6 text-center whitespace-nowrap">
          <div className="flex items-center justify-center gap-1.5">
            {/* View Details */}
            <button
              type="button"
              onClick={() => openDetails(app)}
              className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 p-1.5 rounded transition-colors cursor-pointer shadow-3xs"
              title="View Appointment Record"
            >
              <EyeIcon />
            </button>

            {/* Print Slip */}
            <button
              type="button"
              onClick={() => openSlip(app)}
              className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 p-1.5 rounded transition-colors cursor-pointer shadow-3xs"
              title="Print Visitor Pass"
            >
              <PrintSmallIcon />
            </button>

            {/* Quick Approve & Reject for My pending appointments */}
            {mode === 'my' && app.status === 'PENDING' && (
              <>
                <button
                  type="button"
                  onClick={() => updateStatus(app.id, 'APPROVED')}
                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded uppercase tracking-wider transition-colors cursor-pointer shadow-3xs"
                  title="Approve Appointment"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => updateStatus(app.id, 'REJECTED', 'Quick rejection by reviewer.')}
                  className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded uppercase tracking-wider transition-colors cursor-pointer shadow-3xs"
                  title="Reject Appointment"
                >
                  Reject
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* ── Institutional Header Banner ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {mode === 'my' ? 'My Assigned Appointments' : 'Council Appointment Management'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Citizen consultation schedules, municipal counter booking, and visitor token records.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-2 rounded transition-colors uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── Top 4 KPI Stat Cards (Matching Overview Design Language) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Pending Review */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Pending Citizen Requests
            </span>
            <PendingClockIcon />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-700 tracking-tight">
              {loading ? '...' : tabCounts.pending.toString().padStart(2, '0')}
            </p>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Needs Officer Action
            </span>
          </div>
        </div>

        {/* Approved & Scheduled */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Approved & Confirmed
            </span>
            <ApprovedCheckIcon />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight">
              {loading ? '...' : tabCounts.approved.toString().padStart(2, '0')}
            </p>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Ready for Consultation
            </span>
          </div>
        </div>

        {/* Completed Consultations */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Completed Sessions
            </span>
            <CompletedTrophyIcon />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl sm:text-3xl font-extrabold text-purple-700 tracking-tight">
              {loading ? '...' : tabCounts.completed.toString().padStart(2, '0')}
            </p>
            <span className="text-[11px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              Fulfilled Services
            </span>
          </div>
        </div>

        {/* Rescheduled / No-Shows */}
        <div className="bg-white border border-gray-300 rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Rescheduled & No-Show
            </span>
            <RescheduledSyncIcon />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-700 tracking-tight">
              {loading ? '...' : (tabCounts.rescheduled + tabCounts.noShow).toString().padStart(2, '0')}
            </p>
            <span className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Revised Timelines
            </span>
          </div>
        </div>

      </div>

      {/* ── Main Container: Status Tabs + Search & Filters Toolbar + Table / Agenda ── */}
      <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden flex flex-col">
        
        {/* Status Navigation Tabs Bar */}
        <div className="overflow-x-auto border-b border-gray-200 bg-white">
          <div className="flex px-4 min-w-[700px]">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.label;
              return (
                <button
                  type="button"
                  key={tab.label}
                  onClick={() => setActiveTab(tab.label)}
                  className={`py-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer outline-none whitespace-nowrap flex items-center gap-2 ${
                    isActive
                      ? 'border-[#A31736] text-[#A31736]'
                      : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-[#A31736]/10 text-[#A31736]' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {loading ? '..' : tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Multi-parameter Filter & Search Toolbar */}
        <div className="p-4 bg-gray-50/50 border-b border-gray-200 space-y-3">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            {/* Live Search Input */}
            <div className="md:col-span-4 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search citizen, NIC, Ref ID, or phone..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9"
              />
            </div>

            {/* Date Picker Input */}
            <div className="md:col-span-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full text-xs bg-white border border-gray-300 rounded px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9 cursor-pointer"
                title="Filter by appointment date"
              />
            </div>

            {/* Service Category Dropdown */}
            <div className="md:col-span-2">
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full text-xs bg-white border border-gray-300 rounded px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9 cursor-pointer"
              >
                {services.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Assigned Officer Dropdown */}
            <div className="md:col-span-2">
              <select
                value={selectedOfficer}
                onChange={(e) => setSelectedOfficer(e.target.value)}
                className="w-full text-xs bg-white border border-gray-300 rounded px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#A31736] h-9 cursor-pointer"
              >
                {officers.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions: View Toggle & Reset */}
            <div className="md:col-span-2 flex items-center gap-2 justify-end">
              {/* View Switcher: Table vs Agenda */}
              <div className="flex border border-gray-300 rounded overflow-hidden h-9 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`px-2.5 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-[#1e3a8a] text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Table Ledger View"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('agenda')}
                  className={`px-2.5 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer ${
                    viewMode === 'agenda'
                      ? 'bg-[#1e3a8a] text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Daily Timeline Agenda View"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </button>
              </div>

              <button
                type="button"
                onClick={resetFilters}
                className="border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold px-3 rounded transition-colors cursor-pointer h-9 uppercase tracking-wider"
                title="Reset all filters"
              >
                Reset
              </button>
            </div>

          </div>

        </div>

        {/* View Mode Switch Body */}
        {viewMode === 'agenda' ? (
          <AppointmentAgendaView
            appointments={allAppointments}
            selectedDate={selectedDate}
            onSelectAppointment={openDetails}
            onUpdateStatus={updateStatus}
          />
        ) : (
          <>
            {/* Table Content */}
            <div className="overflow-x-auto relative [-webkit-overflow-scrolling:touch]">
              <table className="w-full text-left border-collapse min-w-[860px]">
                <thead>
                  <tr className="bg-gray-100 border-y border-gray-300 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                    <th className="py-3 px-6 w-32">Ref Token</th>
                    <th className="py-3 px-6">Citizen Details</th>
                    <th className="py-3 px-6">Service Category</th>
                    <th className="py-3 px-6">Slot & Desk</th>
                    <th className="py-3 px-6">Assigned Officer</th>
                    <th className="py-3 px-6 text-center">Status</th>
                    <th className="py-3 px-6 text-center w-36">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {getTableBodyContent()}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {!loading && appointments.length > 0 && (
              <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
                <span className="text-xs font-semibold text-gray-600">
                  Showing {startIndex} to {endIndex} of {allAppointmentsCount} citizen appointments
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                    className="w-8 h-8 rounded text-xs font-bold border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center justify-center cursor-pointer shadow-3xs"
                  >
                    &lt;
                  </button>

                  {renderPaginationRange()}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
                    className="w-8 h-8 rounded text-xs font-bold border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center justify-center cursor-pointer shadow-3xs"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </div>

      {/* Appointment Details Modal */}
      <AppointmentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={closeDetails}
        appointment={selectedAppointment}
        mode={mode}
        onUpdateStatus={updateStatus}
        onReschedule={rescheduleAppointment}
      />

      {/* Direct Visitor Pass Slip Modal */}
      <AppointmentSlipModal
        isOpen={Boolean(slipAppointment)}
        onClose={() => setSlipAppointment(null)}
        appointment={slipAppointment}
      />
    </div>
  );
};

export default AppointmentPage;
