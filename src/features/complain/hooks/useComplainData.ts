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

const DUMMY_COMPLAINTS: Complaint[] = [
  {
    id: '1',
    refId: '#PS-2026-0842',
    citizenName: 'Kamal Silva',
    citizenNic: '196523456789',
    citizenPhone: '0713451689',
    citizenEmail: 'kamalsilva65@gmail.com',
    category: 'Waste Management',
    date: '2026-06-05',
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
    dueDate: '2026-06-12'
  },
  {
    id: '2',
    refId: '#PS-2026-0843',
    citizenName: 'Sampath Bandara',
    citizenNic: '198234567812',
    citizenPhone: '0775642312',
    citizenEmail: 'sampath.b@example.com',
    category: 'Public Roads',
    date: '2026-06-05',
    time: '11:00 AM',
    assignedOfficer: 'L.D.Silva',
    assignedTechnician: 'L.D.Silva',
    status: 'APPROVED',
    description: 'Large pothole on main street causing traffic delays.',
    attachments: [
      { id: 'a5', name: 'Road_Damage.jpg', size: '3.4 MB', type: 'image', url: '#' },
    ],
    dueDate: '2026-06-14'
  },
  {
    id: '6',
    refId: '#PS-2026-0852',
    citizenName: 'Ayesha Fernando',
    citizenNic: '199456789012',
    citizenPhone: '0719876543',
    citizenEmail: 'ayesha.f@example.com',
    category: 'Water Supply',
    date: '2026-06-08',
    time: '01:20 PM',
    assignedOfficer: 'P.Kumara',
    assignedTechnician: 'P.Kumara',
    status: 'REVIEWING',
    description: 'Water pressure in the neighborhood has been low for two days. Please inspect the main supply line.',
    attachments: [
      { id: 'a6', name: 'Water_Pipe.jpg', size: '1.2 MB', type: 'image', url: '#' },
    ],
    dueDate: '2026-06-15'
  },
  {
    id: '7',
    refId: '#PS-2026-0853',
    citizenName: 'Ruwan Jayasuriya',
    citizenNic: '198765432109',
    citizenPhone: '0773344556',
    citizenEmail: 'ruwan.j@example.com',
    category: 'Public Roads',
    date: '2026-06-09',
    time: '08:00 AM',
    assignedOfficer: 'L.D.Silva',
    assignedTechnician: 'L.D.Silva',
    status: 'IN PROGRESS',
    description: 'Road resurfacing work is scheduled, but the barriers are not placed correctly and traffic is getting blocked.',
    attachments: [],
    dueDate: '2026-06-16'
  },
  {
    id: '3',
    refId: '#PS-2026-0850',
    citizenName: 'Nimal Perera',
    citizenNic: '199023456745',
    citizenPhone: '0763456789',
    citizenEmail: 'nimalp@example.com',
    category: 'Street Lighting',
    date: '2026-06-05',
    time: '02:45 PM',
    assignedOfficer: 'N.Fernando',
    assignedTechnician: 'N.Fernando',
    status: 'RESCHEDULED',
    description: 'Street light pole #45 is not working.',
    attachments: [],
    dueDate: '2026-06-18'
  },
  {
    id: '4',
    refId: '#PS-2026-0851',
    citizenName: 'Sunil Shantha',
    citizenNic: '197523456123',
    citizenPhone: '0712345678',
    citizenEmail: 'sunil.sh@example.com',
    category: 'Waste Management',
    date: '2026-06-06',
    time: '09:15 AM',
    assignedOfficer: 'M.Perera',
    assignedTechnician: 'M.Perera',
    status: 'COMPLETED',
    description: 'Garbage not collected last week.',
    attachments: [],
    dueDate: '2026-06-13'
  },
  {
    id: '5',
    refId: '#PS-2026-0855',
    citizenName: 'Priyanka Kumuduni',
    citizenNic: '198856789123',
    citizenPhone: '0771234567',
    citizenEmail: 'priyanka.k@example.com',
    category: 'Public Roads',
    date: '2026-06-07',
    time: '10:00 AM',
    assignedOfficer: 'L.D.Silva',
    status: 'REJECTED',
    description: 'Request for new road construction (out of budget).',
    attachments: [],
    dueDate: '2026-06-17'
  },
]

export const useComplainData = () => {
  const [loading, setLoading] = useState(true)
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem('pradeshiya_complaints')
    return saved ? JSON.parse(saved) : DUMMY_COMPLAINTS
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

