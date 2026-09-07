import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getAppointments, type AppointmentItem, type AppointmentStatus } from '../services/appointmentApi';

export interface UseAppointmentDataProps {
  mode: 'all' | 'my';
}

export function useAppointmentData({ mode }: UseAppointmentDataProps) {
  const { user } = useAuth();
  
  // Restore staff changes after reload, or initialize from the local appointment source.
  const [appointments, setAppointments] = useState<AppointmentItem[]>(() => {
    const saved = localStorage.getItem('pradeshiya_appointments');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return getAppointments();
  });

  const [loading, setLoading] = useState(true);

  // Persist status and reschedule updates made from the staff appointment screens.
  useEffect(() => {
    localStorage.setItem('pradeshiya_appointments', JSON.stringify(appointments));
  }, [appointments]);

  // Simulate the initial loading state used while the appointment list is prepared.
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  // Filter changes reset the page so a new result set always starts at page one.
  const [activeTab, setActiveTab] = useState('All Appointment');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [dateFilterShortcut, setDateFilterShortcut] = useState<'all' | 'today' | 'tomorrow' | 'this-week'>('all');
  const [selectedService, setSelectedService] = useState('All Services');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedOfficer, setSelectedOfficer] = useState('All Officers');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const handleActiveTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };
  const handleSearchQueryChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };
  const handleSelectedDateChange = (date: string) => {
    setSelectedDate(date);
    setDateFilterShortcut('all');
    setCurrentPage(1);
  };
  const handleDateFilterShortcutChange = (shortcut: 'all' | 'today' | 'tomorrow' | 'this-week') => {
    setDateFilterShortcut(shortcut);
    setSelectedDate('');
    setCurrentPage(1);
  };
  const handleSelectedServiceChange = (service: string) => {
    setSelectedService(service);
    setCurrentPage(1);
  };
  const handleSelectedStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };
  const handleSelectedOfficerChange = (officer: string) => {
    setSelectedOfficer(officer);
    setCurrentPage(1);
  };

  // Select the complete queue or only appointments assigned to the signed-in staff member.
  const modeFiltered = useMemo(() => {
    if (mode === 'my') {
      const userName = user?.name || '';
      return appointments.filter(
        (app) => app.assignedOfficer.toLowerCase() === userName.toLowerCase()
      );
    }
    return appointments;
  }, [appointments, mode, user]);

  // Counts are based on the whole mode-specific list, not only the current page.
  const tabCounts = useMemo(() => {
    const counts = {
      all: modeFiltered.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      completed: 0,
      noShow: 0,
      rescheduled: 0,
    };
    modeFiltered.forEach((app) => {
      if (app.status === 'PENDING') counts.pending++;
      else if (app.status === 'APPROVED') counts.approved++;
      else if (app.status === 'REJECTED') counts.rejected++;
      else if (app.status === 'COMPLETED') counts.completed++;
      else if (app.status === 'NO-SHOW') counts.noShow++;
      else if (app.status === 'RESCHEDULED') counts.rescheduled++;
    });
    return counts;
  }, [modeFiltered]);

  // Narrow the mode-specific list to the selected status tab.
  const tabFiltered = useMemo(() => {
    return modeFiltered.filter((app) => {
      switch (activeTab) {
        case 'Pending':
          return app.status === 'PENDING';
        case 'Approved':
          return app.status === 'APPROVED';
        case 'Rejected':
          return app.status === 'REJECTED';
        case 'Completed':
          return app.status === 'COMPLETED';
        case 'No-show':
          return app.status === 'NO-SHOW';
        case 'Rescheduled':
          return app.status === 'RESCHEDULED';
        default:
          return true;
      }
    });
  }, [modeFiltered, activeTab]);

  // Apply the remaining date, service, status, and officer controls.
  const fullyFiltered = useMemo(() => {
    return tabFiltered.filter((app) => {
      // The date is the first part of the stored date-time string.
      if (selectedDate && !app.dateTime.startsWith(selectedDate)) {
        return false;
      }

      // Service Filter
      if (selectedService !== 'All Services' && app.service !== selectedService) {
        return false;
      }
      // This can further narrow an already selected status tab.
      if (selectedStatus !== 'All Statuses' && app.status !== selectedStatus) {
        return false;
      }

      // Officer Filter
      if (selectedOfficer !== 'All Officers' && app.assignedOfficer !== selectedOfficer) {
        return false;
      }

      return true;
    });
  }, [tabFiltered, searchQuery, selectedDate, selectedService, selectedStatus, selectedOfficer]);

  // Paginate only after all mode, tab, and control filters are applied.
  const paginatedAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return fullyFiltered.slice(startIndex, startIndex + itemsPerPage);
  }, [fullyFiltered, currentPage]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(fullyFiltered.length / itemsPerPage));
  }, [fullyFiltered]);

  // Update the source list; derived counts and visible rows recalculate automatically.
  const updateStatus = (id: string, newStatus: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((app) =>
        app.id === id
          ? {
              ...app,
              status: newStatus,
              rejectionReason: rejectionReason || app.rejectionReason,
              resolutionNotes: resolutionNotes || app.resolutionNotes,
            }
          : app
      )
    );
  };

  const rescheduleAppointment = (id: string, newDateTime: string, newOfficer?: string, counter?: string) => {
    setAppointments((prev) =>
      prev.map((app) =>
        app.id === id
          ? {
              ...app,
              status: 'RESCHEDULED',
              dateTime: newDateTime,
              assignedOfficer: newOfficer || app.assignedOfficer,
              counter: counter || app.counter,
            }
          : app
      )
    );
  };

  const addAppointment = (newApp: Omit<AppointmentItem, 'id' | 'status'> & { status?: AppointmentStatus }) => {
    const newId = `#PS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const created: AppointmentItem = {
      ...newApp,
      id: newId,
      status: newApp.status || 'PENDING',
    };
    setAppointments((prev) => [created, ...prev]);
    return created;
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDate('');
    setDateFilterShortcut('all');
    setSelectedService('All Services');
    setSelectedStatus('All Statuses');
    setSelectedOfficer('All Officers');
    setCurrentPage(1);
  };

  return {
    loading,
    appointments: paginatedAppointments,
    allAppointments: fullyFiltered,
    allAppointmentsCount: fullyFiltered.length,
    tabCounts,
    activeTab,
    setActiveTab: handleActiveTabChange,
    searchQuery,
    setSearchQuery: handleSearchQueryChange,
    selectedDate,
    setSelectedDate: handleSelectedDateChange,
    dateFilterShortcut,
    setDateFilterShortcut: handleDateFilterShortcutChange,
    selectedService,
    setSelectedService: handleSelectedServiceChange,
    selectedStatus,
    setSelectedStatus: handleSelectedStatusChange,
    selectedOfficer,
    setSelectedOfficer: handleSelectedOfficerChange,
    viewMode,
    setViewMode,
    currentPage,
    setCurrentPage,
    totalPages,
    updateStatus,
    rescheduleAppointment,
    addAppointment,
    resetFilters,
    startIndex: (currentPage - 1) * itemsPerPage + 1,
    endIndex: Math.min(currentPage * itemsPerPage, fullyFiltered.length),
  };
}

