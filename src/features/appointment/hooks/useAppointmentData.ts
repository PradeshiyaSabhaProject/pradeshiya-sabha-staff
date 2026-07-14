import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getAppointments, type AppointmentItem, type AppointmentStatus } from '../services/appointmentApi';

export interface UseAppointmentDataProps {
  mode: 'all' | 'my';
}

export function useAppointmentData({ mode }: UseAppointmentDataProps) {
  const { user } = useAuth();
  
  // Local state initialized from localStorage if available, else getAppointments()
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

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('pradeshiya_appointments', JSON.stringify(appointments));
  }, [appointments]);

  // Loading simulation on mount
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  // Filters State
  const [activeTab, setActiveTabState] = useState('All Appointment');
  const [selectedDate, setSelectedDateState] = useState('');
  const [selectedService, setSelectedServiceState] = useState('All Services');
  const [selectedStatus, setSelectedStatusState] = useState('All Statuses');
  const [selectedOfficer, setSelectedOfficerState] = useState('All Officers');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    setCurrentPage(1);
  };
  const setSelectedDate = (date: string) => {
    setSelectedDateState(date);
    setCurrentPage(1);
  };
  const setSelectedService = (service: string) => {
    setSelectedServiceState(service);
    setCurrentPage(1);
  };
  const setSelectedStatus = (status: string) => {
    setSelectedStatusState(status);
    setCurrentPage(1);
  };
  const setSelectedOfficer = (officer: string) => {
    setSelectedOfficerState(officer);
    setCurrentPage(1);
  };

  // 1. Filter by mode (All vs My)
  const modeFiltered = useMemo(() => {
    if (mode === 'my') {
      const userName = user?.name || '';
      return appointments.filter(
        (app) => app.assignedOfficer.toLowerCase() === userName.toLowerCase()
      );
    }
    return appointments;
  }, [appointments, mode, user]);

  // 2. Compute tab counts and statistics based on the mode-filtered list
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

  // 3. Apply active tab filter
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

  // 4. Apply search control filters
  const fullyFiltered = useMemo(() => {
    return tabFiltered.filter((app) => {
      // Date Filter: checking starting sequence (e.g. 2026-06-05)
      if (selectedDate && !app.dateTime.startsWith(selectedDate)) {
        return false;
      }
      // Service Filter
      if (selectedService !== 'All Services' && app.service !== selectedService) {
        return false;
      }
      // Status Filter (redundant if using tabs, but useful for search bar)
      if (selectedStatus !== 'All Statuses' && app.status !== selectedStatus) {
        return false;
      }
      // Officer Filter
      if (selectedOfficer !== 'All Officers' && app.assignedOfficer !== selectedOfficer) {
        return false;
      }
      return true;
    });
  }, [tabFiltered, selectedDate, selectedService, selectedStatus, selectedOfficer]);

  // 5. Pagination
  const paginatedAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return fullyFiltered.slice(startIndex, startIndex + itemsPerPage);
  }, [fullyFiltered, currentPage]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(fullyFiltered.length / itemsPerPage));
  }, [fullyFiltered]);

  // 6. Action handlers
  const updateStatus = (id: string, newStatus: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );
  };

  const rescheduleAppointment = (id: string, newDateTime: string) => {
    setAppointments((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: 'RESCHEDULED', dateTime: newDateTime } : app))
    );
  };

  const resetFilters = () => {
    setSelectedDate('');
    setSelectedService('All Services');
    setSelectedStatus('All Statuses');
    setSelectedOfficer('All Officers');
    setCurrentPage(1);
  };

  return {
    loading,
    appointments: paginatedAppointments,
    allAppointmentsCount: fullyFiltered.length,
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
    startIndex: (currentPage - 1) * itemsPerPage + 1,
    endIndex: Math.min(currentPage * itemsPerPage, fullyFiltered.length),
  };
}

