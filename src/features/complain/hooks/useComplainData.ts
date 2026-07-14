import { useState, useEffect } from 'react'

export type ComplaintStatus = 'PENDING' | 'REVIEWING' | 'IN PROGRESS' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'NO-SHOW' | 'RESCHEDULED'

export interface ComplaintAttachment {
  id: string
  name: string
  size: string
  type: 'image' | 'pdf'
  url: string
}

export interface OfficerRemark {
  id: string
  text: string
  date: string
  time: string
  author: string
}

export interface Complaint {
  id: string
  refId: string
  citizenName: string
  citizenNic: string
  citizenPhone: string
  citizenEmail: string
  category: string
  date: string
  time: string
  assignedOfficer: string
  assignedTechnician?: string
  status: ComplaintStatus
  description: string
  attachments: ComplaintAttachment[]
  officerRemarks?: OfficerRemark[]
  citizenNotified?: boolean
  dueDate?: string
}

const formatRelativeDate = (daysOffset: number): string => {
  const d = new Date()
  d.setDate(d.getDate() + daysOffset)
  return d.toISOString().slice(0, 10)
}

const getRealisticComplaints = (): Complaint[] => [
  {
    id: '1',
    refId: '#PS-2026-0842',
    citizenName: 'Kamal Silva',
    citizenNic: '196523456789',
    citizenPhone: '0713451689',
    citizenEmail: 'kamalsilva65@gmail.com',
    category: 'Waste Management',
    date: formatRelativeDate(-3),
    time: '10:30 AM',
    assignedOfficer: 'M.Perera',
    assignedTechnician: 'M.Perera',
    status: 'PENDING',
    description: 'The garbage collection truck has not visited our street for the last three days, leading to an accumulation of waste and hygiene concerns in the neighborhood. We request immediate action to resolve this issue.',
    attachments: [
      { id: 'a1', name: 'NIC Front.jpg', size: '120 KB', type: 'image', url: '#' },
      { id: 'a2', name: 'NIC Back.jpg', size: '110 KB', type: 'image', url: '#' },
      { id: 'a3', name: 'Site Photo.jpg', size: '2.1 MB', type: 'image', url: '#' },
      { id: 'a4', name: 'Waste Management Request.pdf', size: '1.4 MB', type: 'pdf', url: '#' },
    ],
    dueDate: formatRelativeDate(0) // Due Today
  },
  {
    id: '2',
    refId: '#PS-2026-0843',
    citizenName: 'Sampath Bandara',
    citizenNic: '198234567812',
    citizenPhone: '0775642312',
    citizenEmail: 'sampath.b@example.com',
    category: 'Public Roads',
    date: formatRelativeDate(-2),
    time: '11:00 AM',
    assignedOfficer: 'L.D.Silva',
    assignedTechnician: 'L.D.Silva',
    status: 'APPROVED',
    description: 'Large pothole on main street causing traffic delays.',
    attachments: [
      { id: 'a5', name: 'Road_Damage.jpg', size: '3.4 MB', type: 'image', url: '#' },
    ],
    dueDate: formatRelativeDate(4) // 04 days left
  },
  {
    id: '6',
    refId: '#PS-2026-0852',
    citizenName: 'Ayesha Fernando',
    citizenNic: '199456789012',
    citizenPhone: '0719876543',
    citizenEmail: 'ayesha.f@example.com',
    category: 'Water Supply',
    date: formatRelativeDate(-4),
    time: '01:20 PM',
    assignedOfficer: 'P.Kumara',
    assignedTechnician: 'P.Kumara',
    status: 'REVIEWING',
    description: 'Water pressure in the neighborhood has been low for two days. Please inspect the main supply line.',
    attachments: [
      { id: 'a6', name: 'Water_Pipe.jpg', size: '1.2 MB', type: 'image', url: '#' },
    ],
    dueDate: formatRelativeDate(1) // 01 day left
  },
  {
    id: '7',
    refId: '#PS-2026-0853',
    citizenName: 'Ruwan Jayasuriya',
    citizenNic: '198765432109',
    citizenPhone: '0773344556',
    citizenEmail: 'ruwan.j@example.com',
    category: 'Public Roads',
    date: formatRelativeDate(-1),
    time: '08:00 AM',
    assignedOfficer: 'L.D.Silva',
    assignedTechnician: 'L.D.Silva',
    status: 'IN PROGRESS',
    description: 'Road resurfacing work is scheduled, but the barriers are not placed correctly and traffic is getting blocked.',
    attachments: [],
    dueDate: formatRelativeDate(6) // 06 days left
  },
  {
    id: '3',
    refId: '#PS-2026-0850',
    citizenName: 'Nimal Perera',
    citizenNic: '199023456745',
    citizenPhone: '0763456789',
    citizenEmail: 'nimalp@example.com',
    category: 'Street Lighting',
    date: formatRelativeDate(-10),
    time: '02:45 PM',
    assignedOfficer: 'N.Fernando',
    assignedTechnician: 'N.Fernando',
    status: 'RESCHEDULED',
    description: 'Street light pole #45 is not working.',
    attachments: [],
    dueDate: formatRelativeDate(-2) // Overdue
  },
  {
    id: '4',
    refId: '#PS-2026-0851',
    citizenName: 'Sunil Shantha',
    citizenNic: '197523456123',
    citizenPhone: '0712345678',
    citizenEmail: 'sunil.sh@example.com',
    category: 'Waste Management',
    date: formatRelativeDate(-14),
    time: '09:15 AM',
    assignedOfficer: 'M.Perera',
    assignedTechnician: 'M.Perera',
    status: 'COMPLETED',
    description: 'Garbage not collected last week.',
    attachments: [],
    dueDate: formatRelativeDate(-4)
  },
  {
    id: '5',
    refId: '#PS-2026-0855',
    citizenName: 'Priyanka Kumuduni',
    citizenNic: '198856789123',
    citizenPhone: '0771234567',
    citizenEmail: 'priyanka.k@example.com',
    category: 'Public Roads',
    date: formatRelativeDate(-12),
    time: '10:00 AM',
    assignedOfficer: 'L.D.Silva',
    status: 'REJECTED',
    description: 'Request for new road construction (out of budget).',
    attachments: [],
    dueDate: formatRelativeDate(-5)
  },
]

const CURRENT_SEED_VERSION = 'v4_realistic_live_deadlines'

export const useComplainData = () => {
  const [loading, setLoading] = useState(true)
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const seedVer = localStorage.getItem('pradeshiya_complaints_seed_ver')
    if (seedVer !== CURRENT_SEED_VERSION) {
      const realisticData = getRealisticComplaints()
      localStorage.setItem('pradeshiya_complaints', JSON.stringify(realisticData))
      localStorage.setItem('pradeshiya_complaints_seed_ver', CURRENT_SEED_VERSION)
      return realisticData
    }
    const saved = localStorage.getItem('pradeshiya_complaints')
    return saved ? JSON.parse(saved) : getRealisticComplaints()
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const saveComplaints = (updatedList: Complaint[]) => {
    setComplaints(updatedList)
    localStorage.setItem('pradeshiya_complaints', JSON.stringify(updatedList))
  }

  const updateComplaint = (id: string, updatedFields: Partial<Complaint>) => {
    const updated = complaints.map(c => c.id === id ? { ...c, ...updatedFields } : c)
    saveComplaints(updated)
    return updated.find(c => c.id === id) || null
  }

  const stats = {
    pending: complaints.filter(c => c.status === 'PENDING' || c.status === 'REVIEWING').length,
    approved: complaints.filter(c => c.status === 'APPROVED' || c.status === 'IN PROGRESS').length,
    rejected: complaints.filter(c => c.status === 'REJECTED').length,
    completed: complaints.filter(c => c.status === 'COMPLETED').length,
    total: complaints.length
  }

  return {
    loading,
    complaints,
    updateComplaint,
    stats
  }
}

