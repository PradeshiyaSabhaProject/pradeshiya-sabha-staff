import { useState, useEffect } from 'react'

export interface Officer {
  id: string
  officerId: string
  name: string
  phone: string
  role: string
  category: string
  assignedComplaints: number
  completedComplaints: number
  remainingComplaints: number
}

const DUMMY_OFFICERS: Officer[] = [
  {
    id: '1',
    officerId: '#OFF-001',
    name: 'M. Perera',
    phone: '0713451689',
    role: 'Field Officer',
    category: 'Waste Management',
    assignedComplaints: 15,
    completedComplaints: 10,
    remainingComplaints: 5
  },
  {
    id: '2',
    officerId: '#OFF-002',
    name: 'L.D. Silva',
    phone: '0775642312',
    role: 'Senior Supervisor',
    category: 'Public Roads',
    assignedComplaints: 22,
    completedComplaints: 18,
    remainingComplaints: 4
  },
  {
    id: '3',
    officerId: '#OFF-003',
    name: 'N. Fernando',
    phone: '0763456789',
    role: 'Inspector',
    category: 'Street Lighting',
    assignedComplaints: 8,
    completedComplaints: 5,
    remainingComplaints: 3
  },
  {
    id: '4',
    officerId: '#OFF-004',
    name: 'S. Kumara',
    phone: '0771234567',
    role: 'Field Officer',
    category: 'Water Supply',
    assignedComplaints: 12,
    completedComplaints: 8,
    remainingComplaints: 4
  },
  {
    id: '5',
    officerId: '#OFF-005',
    name: 'K. Jayawardena',
    phone: '0759876543',
    role: 'Inspector',
    category: 'Public Health',
    assignedComplaints: 18,
    completedComplaints: 15,
    remainingComplaints: 3
  },
]

export const useOfficerData = () => {
  const [loading, setLoading] = useState(true)
  const [officers, setOfficers] = useState<Officer[]>([])

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setOfficers(DUMMY_OFFICERS)
      setLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  return {
    loading,
    officers,
  }
}

