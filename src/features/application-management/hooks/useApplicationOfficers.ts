import { useState, useEffect } from 'react'

export interface ApplicationOfficer {
  id: string
  officerId: string
  name: string
  phone: string
  role: string
  department: string
  categoryFocus: string
  assignedApplications: number
  completedApplications: number
  remainingApplications: number
  status: 'Available' | 'On Inspection' | 'In Office'
}

const DUMMY_APPLICATION_OFFICERS: ApplicationOfficer[] = [
  {
    id: 'off-1',
    officerId: '#APP-OFF-001',
    name: 'M. Perera',
    phone: '0713451689',
    role: 'Senior Planning Officer',
    department: 'Urban Planning & Works',
    categoryFocus: 'Building & Construction Permit',
    assignedApplications: 18,
    completedApplications: 12,
    remainingApplications: 6,
    status: 'In Office'
  },
  {
    id: 'off-2',
    officerId: '#APP-OFF-002',
    name: 'L.D. Silva',
    phone: '0775642312',
    role: 'Revenue & Trade Supervisor',
    department: 'Revenue Department',
    categoryFocus: 'Trade & Business License',
    assignedApplications: 24,
    completedApplications: 20,
    remainingApplications: 4,
    status: 'Available'
  },
  {
    id: 'off-3',
    officerId: '#APP-OFF-003',
    name: 'P. Kumara',
    phone: '0763456789',
    role: 'Environmental Officer',
    department: 'Health & Sanitation',
    categoryFocus: 'Environmental & Tree Cutting Clearance',
    assignedApplications: 14,
    completedApplications: 10,
    remainingApplications: 4,
    status: 'On Inspection'
  },
  {
    id: 'off-4',
    officerId: '#APP-OFF-004',
    name: 'N. Fernando',
    phone: '0771234567',
    role: 'Water Utilities Inspector',
    department: 'Water Supply Department',
    categoryFocus: 'Water & Sewerage Connection',
    assignedApplications: 16,
    completedApplications: 14,
    remainingApplications: 2,
    status: 'Available'
  },
  {
    id: 'off-5',
    officerId: '#APP-OFF-005',
    name: 'R. M. Bandara',
    phone: '0759876543',
    role: 'Chief Structural Engineer',
    department: 'Engineering Department',
    categoryFocus: 'Building & Construction Permit',
    assignedApplications: 11,
    completedApplications: 8,
    remainingApplications: 3,
    status: 'On Inspection'
  },
  {
    id: 'off-6',
    officerId: '#APP-OFF-006',
    name: 'S. P. Liyanage',
    phone: '0718877665',
    role: 'Public Health Inspector (PHI)',
    department: 'Health & Sanitation',
    categoryFocus: 'Trade & Business License',
    assignedApplications: 19,
    completedApplications: 16,
    remainingApplications: 3,
    status: 'Available'
  }
]

export const useApplicationOfficers = () => {
  const [loading, setLoading] = useState(true)
  const [officers, setOfficers] = useState<ApplicationOfficer[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setOfficers(DUMMY_APPLICATION_OFFICERS)
      setLoading(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [])

  return {
    loading,
    officers
  }
}
