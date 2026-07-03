import { useState, useEffect } from 'react'

export interface AssignedOfficer {
  id: string
  refId: string
  name: string
  phone: string
  role: string
  assignedCategory: string
  assignedLetters: number
  completedLetters: number
  remainingLetters: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'NO-SHOW' | 'RESCHEDULED'
}

const DUMMY_OFFICERS: AssignedOfficer[] = [
  {
    id: '1',
    refId: '#OFF-001',
    name: 'M. Perera',
    phone: '0713451689',
    role: 'Field Officer',
    assignedCategory: 'Type 1',
    assignedLetters: 15,
    completedLetters: 10,
    remainingLetters: 5,
    status: 'PENDING'
  },
  {
    id: '2',
    refId: '#OFF-002',
    name: 'L.D. Silva',
    phone: '0775642312',
    role: 'Senior Supervisor',
    assignedCategory: 'Type 2',
    assignedLetters: 22,
    completedLetters: 18,
    remainingLetters: 4,
    status: 'APPROVED'
  },
  {
    id: '3',
    refId: '#OFF-003',
    name: 'N. Fernando',
    phone: '0763456789',
    role: 'Inspector',
    assignedCategory: 'Type 3',
    assignedLetters: 8,
    completedLetters: 5,
    remainingLetters: 3,
    status: 'RESCHEDULED'
  },
  {
    id: '4',
    refId: '#OFF-004',
    name: 'S. Kumara',
    phone: '0771234567',
    role: 'Field Officer',
    assignedCategory: 'Type 4',
    assignedLetters: 12,
    completedLetters: 8,
    remainingLetters: 4,
    status: 'REJECTED'
  },
  {
    id: '5',
    refId: '#OFF-005',
    name: 'K. Jayawardena',
    phone: '0759876543',
    role: 'Inspector',
    assignedCategory: 'Type 5',
    assignedLetters: 18,
    completedLetters: 15,
    remainingLetters: 3,
    status: 'COMPLETED'
  },
  {
    id: '6',
    refId: '#OFF-006',
    name: 'M. Perera',
    phone: '0713451689',
    role: 'Field Officer',
    assignedCategory: 'Type 1',
    assignedLetters: 20,
    completedLetters: 15,
    remainingLetters: 5,
    status: 'PENDING'
  },
  {
    id: '7',
    refId: '#OFF-007',
    name: 'L.D. Silva',
    phone: '0775642312',
    role: 'Senior Supervisor',
    assignedCategory: 'Type 2',
    assignedLetters: 14,
    completedLetters: 12,
    remainingLetters: 2,
    status: 'APPROVED'
  }
]

export const useAssignedOfficersData = () => {
  const [loading, setLoading] = useState(true)
  const [officers, setOfficers] = useState<AssignedOfficer[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setOfficers(DUMMY_OFFICERS)
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const stats = {
    pending: 12,
    approved: 28,
    rejected: 3,
    completed: 18,
    total: 63
  }

  return {
    loading,
    officers,
    stats
  }
}
