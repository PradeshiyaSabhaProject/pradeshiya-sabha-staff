export interface KpiMetric {
  id: string
  title: string
  category: 'Attendance & Punctuality' | 'Work Execution' | 'Revenue & Field Duty' | 'Compliance & Audit' | 'Team Performance'
  weightage: number // Percentage e.g. 25 = 25%
  targetValue: number
  actualValue: number
  unit: string
  score: number // Calculated score 0 - 100
  historicalScores?: number[] // Last 4 months
  description: string
  autoSourceFormula?: string
}

export interface EmployeeKpiProfile {
  employeeId: string
  employeeName: string
  designation: string
  department: string
  avatarInitials: string
  isManager: boolean
  managerId?: string
  managerName?: string
  overallScore: number // 0 - 100
  performanceGrade: 'Outstanding' | 'Exceeds Expectations' | 'Meets Expectations' | 'Needs Improvement'
  metrics: KpiMetric[]
  subordinateIds?: string[]
  subordinatesAvgScore?: number
  subordinateCascadingWeight?: number // e.g. 35% weight of manager score comes from team
  cascadingImpactPoints?: number // Points contributed by subordinates to manager score
  lastCalculatedAt: string
}

export const INITIAL_KPI_PROFILES: EmployeeKpiProfile[] = [
  {
    employeeId: 'PS-EMP-0012',
    employeeName: 'Kasun Perera',
    designation: 'Senior Revenue Inspector',
    department: 'Revenue & Finance Department',
    avatarInitials: 'KP',
    isManager: false,
    managerId: 'PS-EMP-0034',
    managerName: 'Eng. Samantha Bandara',
    overallScore: 91.2,
    performanceGrade: 'Exceeds Expectations',
    lastCalculatedAt: '2026-08-08 09:30 AM',
    metrics: [
      {
        id: 'MET-101',
        title: 'Biometric Attendance & Punctuality Rate',
        category: 'Attendance & Punctuality',
        weightage: 25,
        targetValue: 95,
        actualValue: 96.5,
        unit: '%',
        score: 96.5,
        historicalScores: [92, 94, 95, 96.5],
        description: 'Biometric log check-ins before 08:30 AM Roster shift without unexcused late entries.',
        autoSourceFormula: 'Biometric Log Punctuality Index'
      },
      {
        id: 'MET-102',
        title: 'Assessments & Rate Tax Collection Target',
        category: 'Revenue & Field Duty',
        weightage: 40,
        targetValue: 2.5,
        actualValue: 2.75,
        unit: 'LKR Million',
        score: 95.0,
        historicalScores: [88, 90, 92, 95.0],
        description: 'Monthly commercial & residential property tax revenue collected against council targets.',
        autoSourceFormula: 'Revenue & Finance Billing Ledger'
      },
      {
        id: 'MET-103',
        title: 'Revenue Audit & Inspection Clearance Speed',
        category: 'Work Execution',
        weightage: 20,
        targetValue: 48,
        actualValue: 42,
        unit: 'Hours avg turnaround',
        score: 88.0,
        historicalScores: [82, 85, 86, 88.0],
        description: 'Average response time to process trade license and tax assessment applications.',
        autoSourceFormula: 'Application Management Resolution Time'
      },
      {
        id: 'MET-104',
        title: 'Compliance & Audit Zero Defect Rate',
        category: 'Compliance & Audit',
        weightage: 15,
        targetValue: 100,
        actualValue: 92,
        unit: '% Compliance',
        score: 82.0,
        historicalScores: [80, 80, 81, 82.0],
        description: 'Adherence to government financial guidelines and absence of audit query flags.',
        autoSourceFormula: 'System Audit Log Verification'
      }
    ]
  },
  {
    employeeId: 'PS-EMP-0019',
    employeeName: 'Nimali Fernando',
    designation: 'Subject Clerk (Engineering)',
    department: 'Works & Engineering Department',
    avatarInitials: 'NF',
    isManager: false,
    managerId: 'PS-EMP-0034',
    managerName: 'Eng. Samantha Bandara',
    overallScore: 84.5,
    performanceGrade: 'Meets Expectations',
    lastCalculatedAt: '2026-08-08 09:30 AM',
    metrics: [
      {
        id: 'MET-201',
        title: 'Biometric Attendance & Punctuality Rate',
        category: 'Attendance & Punctuality',
        weightage: 30,
        targetValue: 95,
        actualValue: 91.0,
        unit: '%',
        score: 91.0,
        historicalScores: [88, 89, 90, 91.0],
        description: 'On-time biometric check-in against assigned Subject Clerk Roster.',
        autoSourceFormula: 'Biometric Log Punctuality Index'
      },
      {
        id: 'MET-202',
        title: 'Inward / Outward Letter Processing Turnaround',
        category: 'Work Execution',
        weightage: 45,
        targetValue: 24,
        actualValue: 28,
        unit: 'Hours avg',
        score: 82.0,
        historicalScores: [78, 80, 81, 82.0],
        description: 'Speed of dispatching incoming letters to engineering technical officers.',
        autoSourceFormula: 'Letter Management System Pipeline'
      },
      {
        id: 'MET-203',
        title: 'Registry Archive & File Compliance',
        category: 'Compliance & Audit',
        weightage: 25,
        targetValue: 100,
        actualValue: 88,
        unit: '% Documented',
        score: 88.0,
        historicalScores: [84, 85, 86, 88.0],
        description: 'Complete digital archiving of approved building plan files.',
        autoSourceFormula: 'Document Archive Index'
      }
    ]
  },
  {
    employeeId: 'PS-EMP-0041',
    employeeName: 'Chaminda Rathnayake',
    designation: 'Public Health Inspector (PHI)',
    department: 'Public Health & Environment',
    avatarInitials: 'CR',
    isManager: false,
    managerId: 'PS-EMP-0034',
    managerName: 'Eng. Samantha Bandara',
    overallScore: 88.0,
    performanceGrade: 'Meets Expectations',
    lastCalculatedAt: '2026-08-08 09:30 AM',
    metrics: [
      {
        id: 'MET-301',
        title: 'Biometric Attendance & Punctuality Rate',
        category: 'Attendance & Punctuality',
        weightage: 25,
        targetValue: 95,
        actualValue: 94.0,
        unit: '%',
        score: 94.0,
        historicalScores: [90, 92, 93, 94.0],
        description: 'Morning check-in compliance at Sanitation Depot Biometric Terminal.',
        autoSourceFormula: 'Biometric Log Punctuality Index'
      },
      {
        id: 'MET-302',
        title: 'Food Premises Sanitation Field Inspections',
        category: 'Revenue & Field Duty',
        weightage: 45,
        targetValue: 40,
        actualValue: 38,
        unit: 'Inspections/month',
        score: 88.0,
        historicalScores: [82, 85, 86, 88.0],
        description: 'Monthly sanitary inspections of commercial eateries and markets.',
        autoSourceFormula: 'Health Field Inspection Registry'
      },
      {
        id: 'MET-303',
        title: 'Public Health Complaint Resolution Speed',
        category: 'Work Execution',
        weightage: 30,
        targetValue: 48,
        actualValue: 45,
        unit: 'Hours turnaround',
        score: 85.0,
        historicalScores: [80, 82, 84, 85.0],
        description: 'Action taken on dengue and waste disposal public complaints.',
        autoSourceFormula: 'Complain Management Resolution Index'
      }
    ]
  },
  {
    id: 'PS-EMP-0062',
    employeeId: 'PS-EMP-0062',
    employeeName: 'Upul Dissanayake',
    designation: 'Works Overseer',
    department: 'Roads & Infrastructure',
    avatarInitials: 'UD',
    isManager: false,
    managerId: 'PS-EMP-0034',
    managerName: 'Eng. Samantha Bandara',
    overallScore: 68.5,
    performanceGrade: 'Needs Improvement',
    lastCalculatedAt: '2026-08-08 09:30 AM',
    metrics: [
      {
        id: 'MET-401',
        title: 'Biometric Attendance & Punctuality Rate',
        category: 'Attendance & Punctuality',
        weightage: 35,
        targetValue: 95,
        actualValue: 72.0,
        unit: '%',
        score: 72.0,
        historicalScores: [75, 74, 70, 72.0],
        description: 'Biometric logs penalty deduction due to unexcused absences and missed punches.',
        autoSourceFormula: 'Biometric Log Punctuality Index'
      },
      {
        id: 'MET-402',
        title: 'Road & Drainage Culvert Repair Execution',
        category: 'Work Execution',
        weightage: 45,
        targetValue: 15,
        actualValue: 10,
        unit: 'Projects completed',
        score: 66.7,
        historicalScores: [70, 68, 65, 66.7],
        description: 'Supervision and completion of ward infrastructure repair work orders.',
        autoSourceFormula: 'Civil Works Execution Log'
      },
      {
        id: 'MET-403',
        title: 'Safety & Site Compliance Score',
        category: 'Compliance & Audit',
        weightage: 20,
        targetValue: 100,
        actualValue: 68,
        unit: '% Compliance',
        score: 68.0,
        historicalScores: [72, 70, 68, 68.0],
        description: 'Safety gear and road hazard warning barrier setup compliance.',
        autoSourceFormula: 'Safety Audit Checklist'
      }
    ]
  },
  {
    employeeId: 'PS-EMP-0034',
    employeeName: 'Eng. Samantha Bandara',
    designation: 'Technical Officer & Division Manager',
    department: 'Works & Civil Engineering Department',
    avatarInitials: 'SB',
    isManager: true,
    subordinateIds: ['PS-EMP-0012', 'PS-EMP-0019', 'PS-EMP-0041', 'PS-EMP-0062'],
    subordinatesAvgScore: 83.05, // (91.2 + 84.5 + 88.0 + 68.5) / 4 = 83.05
    subordinateCascadingWeight: 35, // 35% weightage of manager's overall score comes from subordinates
    cascadingImpactPoints: 29.07, // 83.05 * 0.35 = 29.07 points
    overallScore: 88.8, // (Direct metrics 65% = 59.73) + (Subordinates 35% = 29.07) = 88.8%
    performanceGrade: 'Exceeds Expectations',
    lastCalculatedAt: '2026-08-08 09:30 AM',
    metrics: [
      {
        id: 'MET-501',
        title: 'Department Team Execution Index (Subordinates Average KPI)',
        category: 'Team Performance',
        weightage: 35,
        targetValue: 85,
        actualValue: 83.05,
        unit: '% Team Avg',
        score: 83.05,
        historicalScores: [80, 81, 82, 83.05],
        description: 'Direct cascading performance index calculated automatically from the weighted average KPI of assigned subordinates (Kasun, Nimali, Chaminda, Upul).',
        autoSourceFormula: 'Subordinate KPI Cascading Aggregator'
      },
      {
        id: 'MET-502',
        title: 'Managerial Attendance & Punctuality',
        category: 'Attendance & Punctuality',
        weightage: 20,
        targetValue: 95,
        actualValue: 97.0,
        unit: '%',
        score: 97.0,
        historicalScores: [95, 96, 96, 97.0],
        description: 'Personal biometric check-in punctuality and timecard authorization compliance.',
        autoSourceFormula: 'Biometric Log Punctuality Index'
      },
      {
        id: 'MET-503',
        title: 'Capital Works Budget & Project Completion',
        category: 'Work Execution',
        weightage: 25,
        targetValue: 100,
        actualValue: 92.5,
        unit: '% Completed',
        score: 92.5,
        historicalScores: [88, 90, 91, 92.5],
        description: 'On-time delivery of municipal engineering road, drainage, and building projects.',
        autoSourceFormula: 'Works Management System'
      },
      {
        id: 'MET-504',
        title: 'Leave & Attendance Approval Pipeline Speed',
        category: 'Compliance & Audit',
        weightage: 20,
        targetValue: 24,
        actualValue: 18,
        unit: 'Hours avg clearance',
        score: 94.0,
        historicalScores: [90, 92, 93, 94.0],
        description: 'Managerial turnaround time in reviewing and acting on subordinate leave & correction requests.',
        autoSourceFormula: 'Approvals Queue Processing Engine'
      }
    ]
  }
]
