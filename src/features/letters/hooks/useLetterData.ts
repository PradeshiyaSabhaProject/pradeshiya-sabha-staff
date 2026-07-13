import { useState, useEffect } from 'react'

export type LetterStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'NO-SHOW' | 'RESCHEDULED'

export interface LetterAttachment {
  id: string
  name: string
  size: string
  type: 'image' | 'pdf'
  url: string
}

export interface Letter {
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
  status: LetterStatus
  remarks: string
  attachments: LetterAttachment[]
}

const DUMMY_LETTERS: Letter[] = [
  {
    id: '1',
    refId: '#PS-2026-0842',
    citizenName: 'Kamal Silva',
    citizenNic: '196523456789',
    citizenPhone: '0713451689',
    citizenEmail: 'kamalsilva65@gmail.com',
    category: 'Type 1',
    date: '2026-06-05',
    time: '10:30 AM',
    assignedOfficer: 'M.Perera',
    status: 'PENDING',
    remarks: 'Need urgent clearance for the accumulated waste in the back alley.',
    attachments: [
      { id: 'a1', name: 'NIC Front.jpg', size: '120 KB', type: 'image', url: '#' },
      { id: 'a2', name: 'NIC Back.jpg', size: '110 KB', type: 'image', url: '#' },
      { id: 'a3', name: 'Letter Image.jpg', size: '2.4 MB', type: 'image', url: '#' },
      { id: 'a4', name: 'Supporting Doc.pdf', size: '1.1 MB', type: 'pdf', url: '#' },
    ]
  },
  {
    id: '2',
    refId: '#PS-2026-0843',
    citizenName: 'Sampath Bandara',
    citizenNic: '198234567812',
    citizenPhone: '0775642312',
    citizenEmail: 'sampath.b@example.com',
    category: 'Type 2',
    date: '2026-06-05',
    time: '11:00 AM',
    assignedOfficer: 'L.D.Silva',
    status: 'APPROVED',
    remarks: 'Requesting formal approval for road construction material transport across municipal roads.',
    attachments: [
      { id: 'a5', name: 'Letter Image.jpg', size: '1.8 MB', type: 'image', url: '#' },
    ]
  },
  {
    id: '3',
    refId: '#PS-2026-0850',
    citizenName: 'Nimal Perera',
    citizenNic: '199023456745',
    citizenPhone: '0763456789',
    citizenEmail: 'nimalp@example.com',
    category: 'Type 3',
    date: '2026-06-05',
    time: '02:45 PM',
    assignedOfficer: 'N.Fernando',
    status: 'RESCHEDULED',
    remarks: 'Inquiry regarding the scheduled land assessment and property valuation dates.',
    attachments: []
  },
  {
    id: '4',
    refId: '#PS-2026-0855',
    citizenName: 'Lasantha Wijesiri',
    citizenNic: '198512345678',
    citizenPhone: '0763408997',
    citizenEmail: 'lasantha.w@example.com',
    category: 'Type 4',
    date: '2026-07-02',
    time: '08:30 AM',
    assignedOfficer: 'K.Perera',
    status: 'REJECTED',
    remarks: 'Application for commercial stall permit at the annual Homagama public market festival.',
    attachments: []
  },
  {
    id: '5',
    refId: '#PS-2026-0876',
    citizenName: 'Dilrukshi Pathirana',
    citizenNic: '199256789123',
    citizenPhone: '0705308777',
    citizenEmail: 'dilrukshi.p@example.com',
    category: 'Type 1',
    date: '2026-07-16',
    time: '09:55 AM',
    assignedOfficer: 'M.Perera',
    status: 'PENDING',
    remarks: 'Official complaint regarding street lighting maintenance and repair in sector 4.',
    attachments: []
  },
  {
    id: '6',
    refId: '#PS-2026-0860',
    citizenName: 'S.Pathum',
    citizenNic: '198912345678',
    citizenPhone: '0754326768',
    citizenEmail: 's.pathum@example.com',
    category: 'Type 2',
    date: '2026-08-13',
    time: '03:48 PM',
    assignedOfficer: 'L.D.Silva',
    status: 'COMPLETED',
    remarks: 'Request for municipal drainage clearance before the upcoming monsoon season.',
    attachments: [
      { id: 'a6', name: 'Drainage_Photo.jpg', size: '3.1 MB', type: 'image', url: '#' },
    ]
  },
  {
    id: '7',
    refId: '#PS-2026-0877',
    citizenName: 'Dilrukshi Pathirana',
    citizenNic: '199256789123',
    citizenPhone: '0705308777',
    citizenEmail: 'dilrukshi.p@example.com',
    category: 'Type 3',
    date: '2026-07-16',
    time: '09:55 AM',
    assignedOfficer: 'N.Fernando',
    status: 'PENDING',
    remarks: 'Follow-up correspondence regarding community hall reservation fees.',
    attachments: []
  }
]

let currentLetters: Letter[] = [...DUMMY_LETTERS]
type Listener = () => void
const listeners: Set<Listener> = new Set()

export const updateLetterInStore = (updatedLetter: Letter) => {
  currentLetters = currentLetters.map(l => l.id === updatedLetter.id ? updatedLetter : l)
  listeners.forEach(fn => fn())
}

export const useLetterData = () => {
  const [loading, setLoading] = useState(true)
  const [letters, setLetters] = useState<Letter[]>(currentLetters)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLetters([...currentLetters])
      setLoading(false)
    }, 300)
    
    const listener = () => setLetters([...currentLetters])
    listeners.add(listener)
    return () => {
      clearTimeout(timer)
      listeners.delete(listener)
    }
  }, [])

  // Calculate dynamic stats from currentLetters
  const stats = {
    pending: currentLetters.filter(l => l.status === 'PENDING').length,
    approved: currentLetters.filter(l => l.status === 'APPROVED').length,
    rejected: currentLetters.filter(l => l.status === 'REJECTED').length,
    completed: currentLetters.filter(l => l.status === 'COMPLETED').length,
    total: currentLetters.length
  }

  return {
    loading,
    letters,
    stats,
    updateLetter: updateLetterInStore
  }
}

