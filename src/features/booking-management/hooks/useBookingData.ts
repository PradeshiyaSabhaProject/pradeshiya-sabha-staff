import { useState, useEffect } from 'react'
import type { FacilityBooking, BookingStatus } from '../types'

const formatRelativeDate = (daysOffset: number): string => {
  const d = new Date()
  d.setDate(d.getDate() + daysOffset)
  return d.toISOString().slice(0, 10)
}

const getRealisticBookings = (): FacilityBooking[] => [
  {
    id: 'book-1',
    refId: '#PS-FB-2026-0201',
    facilityName: 'Pradeshiya Sabha Town Hall',
    citizenName: 'Dhammika Perera',
    citizenNic: '198123456789',
    citizenPhone: '0712345678',
    citizenEmail: 'dhammika.p@example.com',
    citizenAddress: 'No. 12/A, Kottawa Road, Homagama',
    eventTitle: 'Annual Rotary Charity Gala & Award Ceremony',
    eventType: 'Community / Cultural Event',
    bookingDate: formatRelativeDate(10),
    timeSlot: '04:00 PM - 10:00 PM (Full Evening Slot)',
    submittedDate: formatRelativeDate(-3),
    submittedTime: '10:15 AM',
    expectedAttendees: 350,
    rentalFee: 45000,
    securityDeposit: 15000,
    paymentStatus: 'PAID',
    status: 'PENDING',
    specialRequirements: 'Requires VIP seating setup for 20 dignitaries, red carpet entrance, and access to backup generator power.',
    attachments: [
      { id: 'att-1', name: 'Applicant_NIC_Copy.pdf', size: '520 KB', type: 'pdf', url: '#' },
      { id: 'att-2', name: 'Police_Clearance_Notice.pdf', size: '1.2 MB', type: 'pdf', url: '#' },
      { id: 'att-3', name: 'Bank_Payment_Receipt.pdf', size: '890 KB', type: 'pdf', url: '#' }
    ],
    remarks: [
      {
        id: 'rem-1',
        author: 'Booking Desk Officer (K. Silva)',
        text: 'Payment slip verified. Awaiting Council Secretary approval for high-capacity event.',
        date: formatRelativeDate(-2),
        time: '02:30 PM',
        action: 'NOTE'
      }
    ],
    assignedOfficer: 'Council Secretary (S. Fernando)'
  },
  {
    id: 'book-2',
    refId: '#PS-FB-2026-0202',
    facilityName: 'Mattegoda Community Center',
    citizenName: 'Niroshani Jayasuriya',
    citizenNic: '199056789012',
    citizenPhone: '0773456789',
    citizenEmail: 'niroshani.j@example.com',
    citizenAddress: '45/8, Housing Scheme Road, Mattegoda',
    eventTitle: 'Childrens Art Exhibition & Workshop',
    eventType: 'Educational Workshop',
    bookingDate: formatRelativeDate(5),
    timeSlot: '08:30 AM - 04:30 PM (Full Day Slot)',
    submittedDate: formatRelativeDate(-4),
    submittedTime: '11:20 AM',
    expectedAttendees: 120,
    rentalFee: 18000,
    securityDeposit: 5000,
    paymentStatus: 'PAID',
    status: 'PENDING',
    specialRequirements: 'Needs 30 exhibition tables and sound microphone system for introductory speeches.',
    attachments: [
      { id: 'att-4', name: 'NIC_Front_Back.pdf', size: '410 KB', type: 'pdf', url: '#' },
      { id: 'att-5', name: 'Event_Program_Schedule.pdf', size: '1.5 MB', type: 'pdf', url: '#' }
    ],
    remarks: [],
    assignedOfficer: 'Community Development Officer (M. Fernando)'
  },
  {
    id: 'book-3',
    refId: '#PS-FB-2026-0203',
    facilityName: 'Kottawa Public Ground & Pavilion',
    citizenName: 'Roshan Bandara',
    citizenNic: '198734567890',
    citizenPhone: '0709876543',
    citizenEmail: 'roshan.b@example.com',
    citizenAddress: '78 High Level Road, Kottawa',
    eventTitle: 'Inter-Club Invitation T20 Cricket Tournament',
    eventType: 'Sports Tournament',
    bookingDate: formatRelativeDate(14),
    timeSlot: '07:00 AM - 06:00 PM (All Day)',
    submittedDate: formatRelativeDate(-6),
    submittedTime: '09:00 AM',
    expectedAttendees: 500,
    rentalFee: 35000,
    securityDeposit: 20000,
    paymentStatus: 'PAID',
    status: 'APPROVED',
    specialRequirements: 'Pitch preparation access required 1 day prior. Sound permit requested.',
    attachments: [
      { id: 'att-6', name: 'Club_Registration_Certificate.pdf', size: '2.1 MB', type: 'pdf', url: '#' },
      { id: 'att-7', name: 'PHI_Sanitary_Approval.pdf', size: '1.1 MB', type: 'pdf', url: '#' }
    ],
    remarks: [
      {
        id: 'rem-2',
        author: 'Sports Officer (P. Liyanage)',
        text: 'Ground condition checked. Approved for T20 match with security deposit held.',
        date: formatRelativeDate(-5),
        time: '10:45 AM',
        action: 'APPROVED'
      }
    ],
    assignedOfficer: 'Sports Officer (P. Liyanage)',
    reviewedDate: formatRelativeDate(-5)
  },
  {
    id: 'book-4',
    refId: '#PS-FB-2026-0204',
    facilityName: 'Homagama Indoor Sports Complex',
    citizenName: 'Sunil Wijesinghe',
    citizenNic: '197545678901',
    citizenPhone: '0718899002',
    citizenEmail: 'sunil.w@example.com',
    citizenAddress: '22 Station Road, Homagama',
    eventTitle: 'Western Province Badminton Championship Selection',
    eventType: 'Sports Match / Training',
    bookingDate: formatRelativeDate(2),
    timeSlot: '08:00 AM - 02:00 PM (Morning & Afternoon)',
    submittedDate: formatRelativeDate(-7),
    submittedTime: '03:10 PM',
    expectedAttendees: 80,
    rentalFee: 25000,
    securityDeposit: 10000,
    paymentStatus: 'PAID',
    status: 'APPROVED',
    specialRequirements: 'All 4 badminton courts required with synthetic mat lights.',
    attachments: [
      { id: 'att-8', name: 'Association_Letterhead.pdf', size: '950 KB', type: 'pdf', url: '#' }
    ],
    remarks: [
      {
        id: 'rem-3',
        author: 'Sports Complex Manager (R. de Silva)',
        text: 'Courts reserved. Maintenance staff alerted for lighting setup.',
        date: formatRelativeDate(-6),
        time: '11:00 AM',
        action: 'APPROVED'
      }
    ],
    assignedOfficer: 'Sports Complex Manager (R. de Silva)',
    reviewedDate: formatRelativeDate(-6)
  },
  {
    id: 'book-5',
    refId: '#PS-FB-2026-0205',
    facilityName: 'Public Crematorium & Chapel',
    citizenName: 'Amarasiri Gunathilaka',
    citizenNic: '196512345678',
    citizenPhone: '0771122334',
    citizenEmail: 'amarasiri.g@example.com',
    citizenAddress: '104 Temple Lane, Pannipitiya',
    eventTitle: 'Funeral & Cremation Service (Late Mrs. Gunathilaka)',
    eventType: 'Cremation Service',
    bookingDate: formatRelativeDate(1),
    timeSlot: '03:30 PM - 05:00 PM (Slot C)',
    submittedDate: formatRelativeDate(-1),
    submittedTime: '08:30 AM',
    expectedAttendees: 150,
    rentalFee: 7500,
    securityDeposit: 0,
    paymentStatus: 'PAID',
    status: 'APPROVED',
    specialRequirements: 'Public address microphone requested inside viewing chapel.',
    attachments: [
      { id: 'att-9', name: 'Death_Certificate_Copy.pdf', size: '1.4 MB', type: 'pdf', url: '#' },
      { id: 'att-10', name: 'Grama_Niladhari_Verification.pdf', size: '670 KB', type: 'pdf', url: '#' }
    ],
    remarks: [
      {
        id: 'rem-4',
        author: 'Health Department Supervisor (W. Karunaratne)',
        text: 'Documentation verified. Slot C allocated with priority support.',
        date: formatRelativeDate(-1),
        time: '09:15 AM',
        action: 'APPROVED'
      }
    ],
    assignedOfficer: 'Health Department Supervisor (W. Karunaratne)',
    reviewedDate: formatRelativeDate(-1)
  },
  {
    id: 'book-6',
    refId: '#PS-FB-2026-0206',
    facilityName: 'Mobile Stage & Sound Equipment',
    citizenName: 'Prashantha Alahakoon',
    citizenNic: '198345678912',
    citizenPhone: '0705566778',
    citizenEmail: 'prashantha.music@example.com',
    citizenAddress: '88, Old Road, Kottawa',
    eventTitle: 'Open-Air Musical Concert & Cultural Night',
    eventType: 'Public Entertainment',
    bookingDate: formatRelativeDate(20),
    timeSlot: '06:00 PM - 11:30 PM (Night)',
    submittedDate: formatRelativeDate(-5),
    submittedTime: '04:45 PM',
    expectedAttendees: 800,
    rentalFee: 55000,
    securityDeposit: 25000,
    paymentStatus: 'PENDING',
    status: 'REJECTED',
    specialRequirements: 'Transport of stage platform to Kottawa junction.',
    attachments: [
      { id: 'att-11', name: 'Stage_Request_Letter.pdf', size: '780 KB', type: 'pdf', url: '#' }
    ],
    remarks: [
      {
        id: 'rem-5',
        author: 'Senior Engineer (S. Kumara)',
        text: 'REJECTED: Sound emission permit from Police Department and PHI clearance missing. High risk of noise disturbance after 10 PM without valid permits.',
        date: formatRelativeDate(-4),
        time: '01:20 PM',
        action: 'REJECTED'
      }
    ],
    assignedOfficer: 'Senior Engineer (S. Kumara)',
    reviewedDate: formatRelativeDate(-4)
  },
  {
    id: 'book-7',
    refId: '#PS-FB-2026-0207',
    facilityName: 'Pradeshiya Sabha Town Hall',
    citizenName: 'Dr. Kumari Dissanayake',
    citizenNic: '197923456781',
    citizenPhone: '0719988776',
    citizenEmail: 'dr.kumari@example.com',
    citizenAddress: '15/2, Hospital Road, Homagama',
    eventTitle: 'Free Public Eye Care & Diabetes Screening Camp',
    eventType: 'Public Health / Medical Camp',
    bookingDate: formatRelativeDate(-3),
    timeSlot: '08:00 AM - 03:00 PM (Day Slot)',
    submittedDate: formatRelativeDate(-15),
    submittedTime: '09:30 AM',
    expectedAttendees: 300,
    rentalFee: 20000,
    securityDeposit: 10000,
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    specialRequirements: 'Power points for screening machinery and waiting area chairs.',
    attachments: [
      { id: 'att-12', name: 'Medical_Council_Approval.pdf', size: '1.8 MB', type: 'pdf', url: '#' }
    ],
    remarks: [
      {
        id: 'rem-6',
        author: 'Council Secretary (S. Fernando)',
        text: 'Event successfully completed. Security deposit refunded after inspection of Hall clean state.',
        date: formatRelativeDate(-2),
        time: '11:00 AM',
        action: 'APPROVED'
      }
    ],
    assignedOfficer: 'Council Secretary (S. Fernando)',
    reviewedDate: formatRelativeDate(-14)
  }
]

export const useBookingData = () => {
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<FacilityBooking[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setBookings(getRealisticBookings())
      setLoading(false)
    }, 450)
    return () => clearTimeout(timer)
  }, [])

  const stats = {
    pending: bookings.filter(b => b.status === 'PENDING').length,
    approved: bookings.filter(b => b.status === 'APPROVED').length,
    rejected: bookings.filter(b => b.status === 'REJECTED' || b.status === 'CANCELLED').length,
    completed: bookings.filter(b => b.status === 'COMPLETED').length,
    total: bookings.length,
    totalRevenue: bookings
      .filter(b => b.status === 'APPROVED' || b.status === 'COMPLETED')
      .reduce((sum, b) => sum + (b.paymentStatus === 'PAID' ? b.rentalFee : 0), 0)
  }

  const updateBooking = (id: string, updatedData: Partial<FacilityBooking>) => {
    let updatedObj: FacilityBooking | null = null
    setBookings(prev =>
      prev.map(item => {
        if (item.id === id) {
          updatedObj = { ...item, ...updatedData }
          return updatedObj
        }
        return item
      })
    )
    return updatedObj
  }

  const approveBooking = (id: string, officerName: string, remarkText?: string) => {
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10)
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const target = bookings.find(b => b.id === id)
    if (!target) return null

    const newRemark = {
      id: `rem-app-${Date.now()}`,
      author: officerName || 'Staff Officer',
      text: remarkText ? `APPROVED: ${remarkText}` : 'Booking request officially verified and APPROVED by staff. Venue reserved.',
      date: dateStr,
      time: timeStr,
      action: 'APPROVED' as const
    }

    const updatedRemarks = [...(target.remarks || []), newRemark]

    return updateBooking(id, {
      status: 'APPROVED',
      reviewedDate: dateStr,
      remarks: updatedRemarks
    })
  }

  const rejectBooking = (id: string, officerName: string, rejectionReason: string) => {
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10)
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const target = bookings.find(b => b.id === id)
    if (!target) return null

    const newRemark = {
      id: `rem-rej-${Date.now()}`,
      author: officerName || 'Staff Officer',
      text: `REJECTED: ${rejectionReason}`,
      date: dateStr,
      time: timeStr,
      action: 'REJECTED' as const
    }

    const updatedRemarks = [...(target.remarks || []), newRemark]

    return updateBooking(id, {
      status: 'REJECTED',
      reviewedDate: dateStr,
      remarks: updatedRemarks
    })
  }

  const addRemark = (id: string, officerName: string, text: string) => {
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10)
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const target = bookings.find(b => b.id === id)
    if (!target) return null

    const newRemark = {
      id: `rem-note-${Date.now()}`,
      author: officerName || 'Staff Officer',
      text,
      date: dateStr,
      time: timeStr,
      action: 'NOTE' as const
    }

    const updatedRemarks = [...(target.remarks || []), newRemark]

    return updateBooking(id, {
      remarks: updatedRemarks
    })
  }

  return {
    loading,
    bookings,
    stats,
    updateBooking,
    approveBooking,
    rejectBooking,
    addRemark
  }
}
