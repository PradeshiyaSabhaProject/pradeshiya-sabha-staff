import { useState, useEffect } from 'react'
import type { ApplicationForm } from '../types'

const formatRelativeDate = (daysOffset: number): string => {
  const d = new Date()
  d.setDate(d.getDate() + daysOffset)
  return d.toISOString().slice(0, 10)
}

const getRealisticApplications = (): ApplicationForm[] => [
  {
    id: 'app-1',
    refId: '#PS-APP-2026-0101',
    applicantName: 'Chandana Gunawardena',
    applicantNic: '197823456789',
    applicantPhone: '0714567890',
    applicantEmail: 'chandana.g@example.com',
    applicantAddress: 'No. 45/2, Temple Road, Homagama',
    category: 'Building & Construction Permit',
    date: formatRelativeDate(-4),
    time: '09:45 AM',
    assignedOfficer: 'M.Perera',
    assignedInspector: 'R. M. Bandara',
    status: 'INSPECTION',
    feeStatus: 'PAID',
    feeAmount: 15000,
    description: 'Application for new 2-story residential building permit on 15.5 perch land lot.',
    customData: {
      proposedLandArea: '15.5 Perches',
      buildingStoreys: '2 Storeys (Residential)',
      propertyAssessmentNo: 'HM/2025/1104'
    },
    attachments: [
      { id: 'att-1', name: 'Surveyor_Plan_Lot12.pdf', size: '3.2 MB', type: 'pdf', url: '#' },
      { id: 'att-2', name: 'Architectural_Drawings.pdf', size: '6.8 MB', type: 'pdf', url: '#' },
      { id: 'att-3', name: 'Applicant_NIC_Copy.pdf', size: '450 KB', type: 'pdf', url: '#' },
      { id: 'att-4', name: 'Land_Deed_Copy.pdf', size: '2.1 MB', type: 'pdf', url: '#' }
    ],
    officerRemarks: [
      {
        id: 'rem-101',
        text: 'Initial documentation verified. Site visit scheduled with Engineer R. M. Bandara.',
        date: formatRelativeDate(-2),
        time: '11:15 AM',
        author: 'Planning Officer M.Perera'
      }
    ],
    dueDate: formatRelativeDate(1) // 01 day left
  },
  {
    id: 'app-2',
    refId: '#PS-APP-2026-0102',
    applicantName: 'Sriyani Fernando',
    applicantNic: '198567890123',
    applicantPhone: '0778899001',
    applicantEmail: 'sriyani.bakers@example.com',
    applicantAddress: '112 High Level Road, Kottawa',
    category: 'Trade & Business License',
    date: formatRelativeDate(-3),
    time: '10:30 AM',
    assignedOfficer: 'L.D.Silva',
    assignedInspector: 'S. P. Liyanage',
    status: 'PENDING',
    feeStatus: 'PAID',
    feeAmount: 8500,
    description: 'Annual renewal and new hygiene license application for Sriyani Bakery & Confectionery.',
    customData: {
      businessName: 'Sriyani Bakery & Confectionery',
      businessRegistrationNo: 'PV-2021-98453',
      propertyAssessmentNo: 'KT/2024/089'
    },
    attachments: [
      { id: 'att-5', name: 'Business_Registration_Certificate.pdf', size: '1.1 MB', type: 'pdf', url: '#' },
      { id: 'att-6', name: 'PHIs_Hygiene_Report.pdf', size: '1.4 MB', type: 'pdf', url: '#' }
    ],
    dueDate: formatRelativeDate(0) // Due Today
  },
  {
    id: 'app-3',
    refId: '#PS-APP-2026-0103',
    applicantName: 'Wimalasiri Senanayake',
    applicantNic: '196234567812',
    applicantPhone: '0702345678',
    applicantEmail: 'wimalasiri.s@example.com',
    applicantAddress: 'Lot 8, Green Valley Estate, Mattegoda',
    category: 'Environmental & Tree Cutting Clearance',
    date: formatRelativeDate(-2),
    time: '02:15 PM',
    assignedOfficer: 'P.Kumara',
    status: 'REVIEWING',
    feeStatus: 'PENDING',
    feeAmount: 3000,
    description: 'Request for safety clearance and removal of old Jack tree leaning dangerously over public utility wire.',
    customData: {
      treeTypeAndCount: '1 Jack Tree (Artocarpus heterophyllus) - Leaning risk',
      proposedLandArea: '20 Perches'
    },
    attachments: [
      { id: 'att-7', name: 'Site_Photo_Tree_Hazard.jpg', size: '4.2 MB', type: 'image', url: '#' },
      { id: 'att-8', name: 'Grama_Niladhari_Letter.pdf', size: '890 KB', type: 'pdf', url: '#' }
    ],
    dueDate: formatRelativeDate(3) // 03 days left
  },
  {
    id: 'app-4',
    refId: '#PS-APP-2026-0104',
    applicantName: 'Dilani Kothalawala',
    applicantNic: '199145678901',
    applicantPhone: '0761122334',
    applicantEmail: 'dilani.k@example.com',
    applicantAddress: '34B, Station Road, Homagama',
    category: 'Water & Sewerage Connection',
    date: formatRelativeDate(-6),
    time: '11:00 AM',
    assignedOfficer: 'N.Fernando',
    assignedInspector: 'D. M. Karunaratne',
    status: 'APPROVED',
    feeStatus: 'PAID',
    feeAmount: 12500,
    description: 'Application for new 3/4 inch residential water meter and municipal sewerage connection.',
    customData: {
      connectionPipeSize: '3/4 inch residential connection',
      propertyAssessmentNo: 'HM/2026/044'
    },
    attachments: [
      { id: 'att-9', name: 'Water_Board_Receipt.pdf', size: '650 KB', type: 'pdf', url: '#' },
      { id: 'att-10', name: 'Deed_Copy.pdf', size: '2.5 MB', type: 'pdf', url: '#' }
    ],
    officerRemarks: [
      {
        id: 'rem-102',
        text: 'Pressure test passed. Water supply line connection approved and voucher issued.',
        date: formatRelativeDate(-1),
        time: '03:40 PM',
        author: 'Water Supply Inspector D. M. Karunaratne'
      }
    ],
    dueDate: formatRelativeDate(5)
  },
  {
    id: 'app-5',
    refId: '#PS-APP-2026-0105',
    applicantName: 'Rotary Club of Homagama',
    applicantNic: '198345678912',
    applicantPhone: '0773344555',
    applicantEmail: 'rotary.homagama@example.com',
    applicantAddress: 'Community Center Bldg, Homagama Town',
    category: 'Public Hall & Ground Booking',
    date: formatRelativeDate(-1),
    time: '08:30 AM',
    assignedOfficer: 'L.D.Silva',
    status: 'PENDING',
    feeStatus: 'PENDING',
    feeAmount: 25000,
    description: 'Booking application for Homagama Town Hall for Annual Free Medical Camp and Youth Empowerment Seminar.',
    customData: {
      bookingDate: '2026-08-15',
      expectedAttendees: '350+ Citizens & Doctors'
    },
    attachments: [
      { id: 'att-11', name: 'Event_Proposal_and_Agenda.pdf', size: '1.8 MB', type: 'pdf', url: '#' }
    ],
    dueDate: formatRelativeDate(4)
  },
  {
    id: 'app-6',
    refId: '#PS-APP-2026-0106',
    applicantName: 'MegaTech Electronics (Pvt) Ltd',
    applicantNic: '198765432109',
    applicantPhone: '0112894567',
    applicantEmail: 'info@megatech.lk',
    applicantAddress: '88 Main Street, Homagama',
    category: 'Advertisement & Signboard Permit',
    date: formatRelativeDate(-10),
    time: '01:20 PM',
    assignedOfficer: 'M.Perera',
    status: 'RETURNED',
    feeStatus: 'PENDING',
    feeAmount: 6000,
    description: 'Application to install a 12x4 ft illuminated LED display signboard above retail showroom entrance.',
    customData: {
      signboardDimensions: '12 ft (Width) x 4 ft (Height) LED Panel',
      displayLocation: 'Above front awning facing High Level Road'
    },
    attachments: [
      { id: 'att-12', name: 'Signboard_Design_Mockup.jpg', size: '3.5 MB', type: 'image', url: '#' }
    ],
    officerRemarks: [
      {
        id: 'rem-103',
        text: 'Returned for additional clarification: Signboard clearance height from sidewalk must exceed 9 feet as per municipal safety code.',
        date: formatRelativeDate(-5),
        time: '10:00 AM',
        author: 'Senior Planning Officer M.Perera'
      }
    ],
    dueDate: formatRelativeDate(-1) // Overdue / Action required
  },
  {
    id: 'app-7',
    refId: '#PS-APP-2026-0107',
    applicantName: 'Dayananda Rajapakse',
    applicantNic: '197123456712',
    applicantPhone: '0718899223',
    applicantEmail: 'dayananda.r@example.com',
    applicantAddress: 'No. 12, Lake View Road, Pannipitiya',
    category: 'Building & Construction Permit',
    date: formatRelativeDate(-12),
    time: '11:45 AM',
    assignedOfficer: 'P.Kumara',
    status: 'REJECTED',
    feeStatus: 'EXEMPT',
    feeAmount: 0,
    description: 'Application for boundary wall extension onto municipal reservation area near canal drainage.',
    customData: {
      proposedLandArea: '10 Perches',
      buildingStoreys: 'Boundary Wall Construction'
    },
    attachments: [],
    officerRemarks: [
      {
        id: 'rem-104',
        text: 'Rejected: Construction encroaches on the mandatory 15-foot canal reservation line defined under the Irrigation & Drainage Act.',
        date: formatRelativeDate(-8),
        time: '02:30 PM',
        author: 'Chief Engineer R. M. Bandara'
      }
    ],
    dueDate: formatRelativeDate(-3)
  }
]

const CURRENT_SEED_VERSION = 'v1_realistic_applications_live'

export const useApplicationData = () => {
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<ApplicationForm[]>(() => {
    const seedVer = localStorage.getItem('pradeshiya_applications_seed_ver')
    if (seedVer !== CURRENT_SEED_VERSION) {
      const realisticData = getRealisticApplications()
      localStorage.setItem('pradeshiya_applications', JSON.stringify(realisticData))
      localStorage.setItem('pradeshiya_applications_seed_ver', CURRENT_SEED_VERSION)
      return realisticData
    }
    const saved = localStorage.getItem('pradeshiya_applications')
    return saved ? JSON.parse(saved) : getRealisticApplications()
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 450)
    return () => clearTimeout(timer)
  }, [])

  const saveApplications = (updatedList: ApplicationForm[]) => {
    setApplications(updatedList)
    localStorage.setItem('pradeshiya_applications', JSON.stringify(updatedList))
  }

  const updateApplication = (id: string, updatedFields: Partial<ApplicationForm>) => {
    const updated = applications.map(a => a.id === id ? { ...a, ...updatedFields } : a)
    saveApplications(updated)
    return updated.find(a => a.id === id) || null
  }

  const stats = {
    pending: applications.filter(a => a.status === 'PENDING').length,
    reviewing: applications.filter(a => a.status === 'REVIEWING').length,
    inspection: applications.filter(a => a.status === 'INSPECTION').length,
    approved: applications.filter(a => a.status === 'APPROVED').length,
    rejected: applications.filter(a => a.status === 'REJECTED').length,
    returned: applications.filter(a => a.status === 'RETURNED').length,
    total: applications.length
  }

  return {
    loading,
    applications,
    updateApplication,
    stats
  }
}
