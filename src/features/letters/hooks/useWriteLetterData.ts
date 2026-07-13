import { useState, useEffect } from 'react'

export interface SentLetterAttachment {
  id: string
  name: string
  size: string
  type: 'image' | 'pdf' | 'doc'
  url: string
}

export interface SentLetter {
  id: string
  refNo: string
  dateTime: string
  senderName: string
  senderId: string
  department: string
  recipientOfficer: string
  subject: string
  body: string
  status: 'SENT' | 'DELIVERED' | 'IN REVIEW' | 'APPROVED'
  attachments: SentLetterAttachment[]
}

export interface DepartmentOption {
  name: string
  officers: string[]
}

export const DEPARTMENTS_DATA: DepartmentOption[] = [
  {
    name: 'Administration & HR',
    officers: ['M. Perera (Administrative Officer)', 'L.D. Silva (Senior Supervisor)', 'C. Weerasinghe (HR Manager)']
  },
  {
    name: 'Engineering & Works',
    officers: ['S. Kumara (Chief Engineer)', 'K. Jayawardena (Technical Inspector)', 'D. Bandara (Roads Supervisor)']
  },
  {
    name: 'Revenue & Finance',
    officers: ['N. Fernando (Chief Accountant)', 'A. Rathnayake (Revenue Inspector)', 'P. Karunaratne (Tax Assessor)']
  },
  {
    name: 'Planning & Development',
    officers: ['P. Wijesinghe (Planning Officer)', 'T. Perera (Surveyor)', 'M. Dissanayake (Zoning Inspector)']
  },
  {
    name: 'Health & Sanitation',
    officers: ['Dr. R. de Silva (MOH Officer)', 'K. Gamage (Public Health Inspector)']
  },
  {
    name: 'Waste Management',
    officers: ['B. Gunawardena (Waste Supervisor)', 'W. Senanayake (Logistics Coordinator)']
  }
]

const INITIAL_SENT_LETTERS: SentLetter[] = [
  {
    id: '1',
    refNo: '#PS-OUT-2026-0891',
    dateTime: '2026-08-10 | 09:30 AM',
    senderName: 'Anuradha Wijesinghe',
    senderId: 'EMP-2026-042',
    department: 'Administration & HR',
    recipientOfficer: 'M. Perera (Administrative Officer)',
    subject: 'Request for Annual Leave & Shift Replacement Notice',
    body: 'I am writing to formally request annual leave from August 20th to August 25th, 2026. I have coordinated with Mr. S. Kumara to cover my shift responsibilities during this duration. All ongoing departmental reports have been handed over accordingly.',
    status: 'DELIVERED',
    attachments: [
      { id: 'a1', name: 'Leave_Application_Form.pdf', size: '450 KB', type: 'pdf', url: '#' }
    ]
  },
  {
    id: '2',
    refNo: '#PS-OUT-2026-0895',
    dateTime: '2026-08-12 | 02:15 PM',
    senderName: 'Anuradha Wijesinghe',
    senderId: 'EMP-2026-042',
    department: 'Engineering & Works',
    recipientOfficer: 'S. Kumara (Chief Engineer)',
    subject: 'Urgent Maintenance Required for Sector 4 Drainage System',
    body: 'Following the recent heavy rains, the main municipal drainage system along Sector 4 Cross Road has shown signs of severe blockage and minor embankment erosion. Immediate maintenance inspection and clearance equipment deployment are requested before the next monsoon cycle begins.',
    status: 'IN REVIEW',
    attachments: [
      { id: 'a2', name: 'Site_Erosion_Photos.jpg', size: '2.1 MB', type: 'image', url: '#' },
      { id: 'a3', name: 'Preliminary_Inspection_Report.pdf', size: '1.2 MB', type: 'pdf', url: '#' }
    ]
  },
  {
    id: '3',
    refNo: '#PS-OUT-2026-0899',
    dateTime: '2026-08-14 | 11:00 AM',
    senderName: 'Anuradha Wijesinghe',
    senderId: 'EMP-2026-042',
    department: 'Revenue & Finance',
    recipientOfficer: 'N. Fernando (Chief Accountant)',
    subject: 'Submission of Monthly Procurement Expense Receipts - July 2026',
    body: 'Please find attached the finalized expense receipts, vendor invoices, and procurement log for the municipal office supplies and hardware equipment purchased during the month of July 2026. Kindly verify and initiate the budget reconciliation process.',
    status: 'APPROVED',
    attachments: [
      { id: 'a4', name: 'July_Expenses_Summary.pdf', size: '890 KB', type: 'pdf', url: '#' }
    ]
  },
  {
    id: '4',
    refNo: '#PS-OUT-2026-0902',
    dateTime: '2026-08-15 | 04:45 PM',
    senderName: 'Anuradha Wijesinghe',
    senderId: 'EMP-2026-042',
    department: 'Health & Sanitation',
    recipientOfficer: 'Dr. R. de Silva (MOH Officer)',
    subject: 'Community Dengue Prevention & Fogging Campaign Schedule',
    body: 'This letter serves to confirm the finalized operational schedule for the upcoming community dengue awareness and mosquito fogging campaign across Homagama North GN divisions starting next Monday. Support teams have been fully briefed.',
    status: 'DELIVERED',
    attachments: []
  }
]

export const useWriteLetterData = () => {
  const [loading, setLoading] = useState(true)
  const [sentLetters, setSentLetters] = useState<SentLetter[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setSentLetters(INITIAL_SENT_LETTERS)
      setLoading(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [])

  const addSentLetter = (newLetter: Omit<SentLetter, 'id' | 'refNo' | 'dateTime' | 'senderName' | 'senderId' | 'status'>) => {
    const now = new Date()
    const formattedDate = now.toISOString().split('T')[0]
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const randomNum = Math.floor(1000 + Math.random() * 9000)
    
    const letterEntry: SentLetter = {
      id: Date.now().toString(),
      refNo: `#PS-OUT-2026-${randomNum}`,
      dateTime: `${formattedDate} | ${formattedTime}`,
      senderName: 'Anuradha Wijesinghe',
      senderId: 'EMP-2026-042',
      status: 'SENT',
      ...newLetter
    }

    setSentLetters(prev => [letterEntry, ...prev])
    return letterEntry
  }

  const stats = {
    totalSent: sentLetters.length,
    delivered: sentLetters.filter(l => l.status === 'DELIVERED').length,
    inReview: sentLetters.filter(l => l.status === 'IN REVIEW').length,
    approved: sentLetters.filter(l => l.status === 'APPROVED').length
  }

  return {
    loading,
    sentLetters,
    departments: DEPARTMENTS_DATA,
    addSentLetter,
    stats
  }
}

