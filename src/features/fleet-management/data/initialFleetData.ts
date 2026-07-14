export type VehicleCategory =
  | 'Garbage Compactor'
  | 'Water Bowser'
  | 'Heavy Equipment (JCB)'
  | 'Official Vehicle (Cab/Van)'
  | 'Tractor & Trailer'
  | 'Gully Bowser'

export type VehicleStatus =
  | 'Available'
  | 'On Mission'
  | 'In Maintenance'
  | 'Permit Due'

export interface MaintenanceLog {
  id: string
  vehicleId: string
  workshopName: string
  maintenanceType: string
  startDate: string
  estimatedCompletionDate: string
  completedDate?: string
  costLKR: number
  notes: string
  status: 'In Progress' | 'Completed'
}

export interface DispatchMission {
  id: string
  vehicleId: string
  destination: string
  purpose: string
  dispatchedAt: string
  estimatedReturn: string
  assignedDriverId: string
  assignedDriverName: string
  status: 'Active' | 'Completed'
}

export interface DriverRecord {
  id: string
  name: string
  employeeId: string
  phone: string
  licenseNumber: string
  licenseGrade: 'Heavy Vehicle (Class E)' | 'Light Vehicle (Class B)' | 'Special Equipment (Class G)'
  assignedVehicleId: string | null
  assignedVehicleReg: string | null
  status: 'On Duty' | 'Off Duty' | 'On Leave'
}

export interface VehicleRecord {
  id: string
  registrationNumber: string // e.g. WP LA-4821
  name: string // e.g. Isuzu Forward Compactor 8t
  category: VehicleCategory
  department: string // e.g. Solid Waste Management
  fuelType: 'Diesel' | 'Petrol' | 'EV'
  odometerKm: number
  yearOfManufacture: number
  status: VehicleStatus
  // Location & mission state
  currentLocation: string // e.g. "Municipal Depot - Bay 04" or "Ward 04 - Solid Waste Route A"
  activeMission?: {
    destination: string
    purpose: string
    dispatchedAt: string
    estimatedReturn: string
  }
  // Driver assignment
  assignedDriverId: string | null
  assignedDriverName: string | null
  // Compliance & Permit dates (ISO YYYY-MM-DD)
  permitExpiryDate: string
  revenueLicenseExpiryDate: string
  insuranceExpiryDate: string
  // Maintenance state
  activeMaintenance?: {
    workshopName: string
    maintenanceType: string
    startDate: string
    estimatedCompletionDate: string
    notes: string
    estimatedCostLKR: number
  }
  maintenanceHistory: MaintenanceLog[]
}

export const INITIAL_DRIVERS: DriverRecord[] = [
  {
    id: 'DRV-01',
    name: 'Sarath Bandara',
    employeeId: 'PS-DRV-001',
    phone: '077-4182931',
    licenseNumber: 'DL-8931244',
    licenseGrade: 'Heavy Vehicle (Class E)',
    assignedVehicleId: 'VEH-001',
    assignedVehicleReg: 'WP LA-4821',
    status: 'On Duty',
  },
  {
    id: 'DRV-02',
    name: 'Chamal Priyantha',
    employeeId: 'PS-DRV-002',
    phone: '071-8831920',
    licenseNumber: 'DL-7721839',
    licenseGrade: 'Heavy Vehicle (Class E)',
    assignedVehicleId: 'VEH-002',
    assignedVehicleReg: 'WP LG-1102',
    status: 'On Duty',
  },
  {
    id: 'DRV-03',
    name: 'Kamal Jayasinghe',
    employeeId: 'PS-DRV-003',
    phone: '076-9928131',
    licenseNumber: 'DL-6612984',
    licenseGrade: 'Special Equipment (Class G)',
    assignedVehicleId: 'VEH-003',
    assignedVehicleReg: 'WP JZ-9012',
    status: 'On Duty',
  },
  {
    id: 'DRV-04',
    name: 'Nalaka Kumara',
    employeeId: 'PS-DRV-004',
    phone: '078-1123490',
    licenseNumber: 'DL-9012831',
    licenseGrade: 'Light Vehicle (Class B)',
    assignedVehicleId: 'VEH-004',
    assignedVehicleReg: 'WP CAB-3108',
    status: 'On Duty',
  },
  {
    id: 'DRV-05',
    name: 'Sunil Rodrigo',
    employeeId: 'PS-DRV-005',
    phone: '070-4491029',
    licenseNumber: 'DL-5541920',
    licenseGrade: 'Heavy Vehicle (Class E)',
    assignedVehicleId: 'VEH-005',
    assignedVehicleReg: 'WP TR-4421',
    status: 'On Duty',
  },
  {
    id: 'DRV-06',
    name: 'Nuwan Pradeep',
    employeeId: 'PS-DRV-006',
    phone: '077-8899123',
    licenseNumber: 'DL-3391021',
    licenseGrade: 'Heavy Vehicle (Class E)',
    assignedVehicleId: 'VEH-006',
    assignedVehicleReg: 'WP GB-2291',
    status: 'On Duty',
  },
  {
    id: 'DRV-07',
    name: 'Roshan Fernando',
    employeeId: 'PS-DRV-007',
    phone: '071-1234890',
    licenseNumber: 'DL-4481029',
    licenseGrade: 'Light Vehicle (Class B)',
    assignedVehicleId: null,
    assignedVehicleReg: null,
    status: 'On Duty',
  },
  {
    id: 'DRV-08',
    name: 'Ajith Gunawardena',
    employeeId: 'PS-DRV-008',
    phone: '075-8839201',
    licenseNumber: 'DL-2193840',
    licenseGrade: 'Special Equipment (Class G)',
    assignedVehicleId: null,
    assignedVehicleReg: null,
    status: 'On Duty',
  },
]

export const INITIAL_VEHICLES: VehicleRecord[] = [
  {
    id: 'VEH-001',
    registrationNumber: 'WP LA-4821',
    name: 'Isuzu Forward Compactor 8 Ton',
    category: 'Garbage Compactor',
    department: 'Solid Waste Management',
    fuelType: 'Diesel',
    odometerKm: 64200,
    yearOfManufacture: 2021,
    status: 'On Mission',
    currentLocation: 'Ward 04 - Solid Waste Route A (Market Area)',
    activeMission: {
      destination: 'Ward 04 - Solid Waste Route A',
      purpose: 'Daily Morning Garbage Collection & Transportation to Recycling Depot',
      dispatchedAt: '2026-07-12 06:30 AM',
      estimatedReturn: '2026-07-12 01:30 PM',
    },
    assignedDriverId: 'DRV-01',
    assignedDriverName: 'Sarath Bandara',
    permitExpiryDate: '2026-12-15',
    revenueLicenseExpiryDate: '2026-11-30',
    insuranceExpiryDate: '2026-12-31',
    maintenanceHistory: [
      {
        id: 'MAINT-101',
        vehicleId: 'VEH-001',
        workshopName: 'Municipal Central Workshop',
        maintenanceType: 'Hydraulic Compactor Cylinder Servicing',
        startDate: '2026-05-10',
        estimatedCompletionDate: '2026-05-12',
        completedDate: '2026-05-12',
        costLKR: 85000,
        notes: 'Replaced hydraulic fluid seals and lubricated compactor ram.',
        status: 'Completed',
      },
    ],
  },
  {
    id: 'VEH-002',
    registrationNumber: 'WP LG-1102',
    name: 'Tata LPK 1618 Water Bowser 10,000L',
    category: 'Water Bowser',
    department: 'Works & Engineering',
    fuelType: 'Diesel',
    odometerKm: 81450,
    yearOfManufacture: 2019,
    status: 'Available',
    currentLocation: 'Municipal Depot - Heavy Vehicle Bay 02',
    assignedDriverId: 'DRV-02',
    assignedDriverName: 'Chamal Priyantha',
    permitExpiryDate: '2026-10-20',
    revenueLicenseExpiryDate: '2026-10-20',
    insuranceExpiryDate: '2026-11-15',
    maintenanceHistory: [
      {
        id: 'MAINT-102',
        vehicleId: 'VEH-002',
        workshopName: 'Central Auto Service Ltd',
        maintenanceType: 'Water Pump & Valve Inspection',
        startDate: '2026-04-18',
        estimatedCompletionDate: '2026-04-19',
        completedDate: '2026-04-19',
        costLKR: 42000,
        notes: 'Tested discharge nozzles and replaced bronze ball valves.',
        status: 'Completed',
      },
    ],
  },
  {
    id: 'VEH-003',
    registrationNumber: 'WP JZ-9012',
    name: 'JCB 3DX Super Backhoe Loader',
    category: 'Heavy Equipment (JCB)',
    department: 'Works & Engineering',
    fuelType: 'Diesel',
    odometerKm: 34210,
    yearOfManufacture: 2022,
    status: 'In Maintenance',
    currentLocation: 'Municipal Mechanical Workshop - Bay 1',
    assignedDriverId: 'DRV-03',
    assignedDriverName: 'Kamal Jayasinghe',
    permitExpiryDate: '2027-03-10',
    revenueLicenseExpiryDate: '2027-03-10',
    insuranceExpiryDate: '2027-03-31',
    activeMaintenance: {
      workshopName: 'Municipal Mechanical Workshop',
      maintenanceType: 'Hydraulic Hose Replacement & Boom Pin Overhaul',
      startDate: '2026-07-10',
      estimatedCompletionDate: '2026-07-14',
      notes: 'Front bucket hydraulic line pressure leak detected during field excavation.',
      estimatedCostLKR: 145000,
    },
    maintenanceHistory: [
      {
        id: 'MAINT-103',
        vehicleId: 'VEH-003',
        workshopName: 'Municipal Mechanical Workshop',
        maintenanceType: 'Hydraulic Hose Replacement & Boom Pin Overhaul',
        startDate: '2026-07-10',
        estimatedCompletionDate: '2026-07-14',
        costLKR: 145000,
        notes: 'Front bucket hydraulic line pressure leak detected during field excavation.',
        status: 'In Progress',
      },
    ],
  },
  {
    id: 'VEH-004',
    registrationNumber: 'WP CAB-3108',
    name: 'Mahindra Scorpio Double Cab 4x4',
    category: 'Official Vehicle (Cab/Van)',
    department: 'Chairman & Council Administration',
    fuelType: 'Diesel',
    odometerKm: 52100,
    yearOfManufacture: 2026,
    status: 'Permit Due',
    currentLocation: 'Pradeshiya Sabha Head Office Parking',
    assignedDriverId: 'DRV-04',
    assignedDriverName: 'Nalaka Kumara',
    // Deliberately set overdue / due within days to show the Permit/License Due workflow clearly!
    permitExpiryDate: '2026-07-08', // Overdue permit
    revenueLicenseExpiryDate: '2026-07-15', // Expiring in 3 days
    insuranceExpiryDate: '2026-07-20',
    maintenanceHistory: [
      {
        id: 'MAINT-104',
        vehicleId: 'VEH-004',
        workshopName: 'Mahindra Authorized Service Centre',
        maintenanceType: '50,000 km Scheduled Full Service',
        startDate: '2026-06-02',
        estimatedCompletionDate: '2026-06-03',
        completedDate: '2026-06-03',
        costLKR: 68500,
        notes: 'Engine oil, fuel filter, AC cabin filter replacement and brake pad inspection.',
        status: 'Completed',
      },
    ],
  },
  {
    id: 'VEH-005',
    registrationNumber: 'WP TR-4421',
    name: 'Tafe 45DI Tractor with Hydraulic Tipping Trailer',
    category: 'Tractor & Trailer',
    department: 'Solid Waste Management',
    fuelType: 'Diesel',
    odometerKm: 48900,
    yearOfManufacture: 2020,
    status: 'On Mission',
    currentLocation: 'Ward 08 - Rural Road Brush & Debris Clearance',
    activeMission: {
      destination: 'Ward 08 - Rural Access Roads',
      purpose: 'Clearing monsoon drainage canals and hauling organic tree cuttings',
      dispatchedAt: '2026-07-12 07:15 AM',
      estimatedReturn: '2026-07-12 03:00 PM',
    },
    assignedDriverId: 'DRV-05',
    assignedDriverName: 'Sunil Rodrigo',
    permitExpiryDate: '2026-09-18',
    revenueLicenseExpiryDate: '2026-09-18',
    insuranceExpiryDate: '2026-10-01',
    maintenanceHistory: [],
  },
  {
    id: 'VEH-006',
    registrationNumber: 'WP GB-2291',
    name: 'Ashok Leyland 8000L Gully Vacuum Bowser',
    category: 'Gully Bowser',
    department: 'Public Health & Sanitation',
    fuelType: 'Diesel',
    odometerKm: 92300,
    yearOfManufacture: 2018,
    status: 'Permit Due',
    currentLocation: 'Sanitation Unit Depot - Yard C',
    assignedDriverId: 'DRV-06',
    assignedDriverName: 'Nuwan Pradeep',
    permitExpiryDate: '2026-07-10', // Overdue
    revenueLicenseExpiryDate: '2026-07-10',
    insuranceExpiryDate: '2026-08-01',
    maintenanceHistory: [
      {
        id: 'MAINT-105',
        vehicleId: 'VEH-006',
        workshopName: 'Sanitation Specialized Workshop',
        maintenanceType: 'Vacuum Pump Rotary Vane Replacement',
        startDate: '2026-03-11',
        estimatedCompletionDate: '2026-03-14',
        completedDate: '2026-03-14',
        costLKR: 112000,
        notes: 'Vacuum seal overhaul and tank interior pressure cleaning.',
        status: 'Completed',
      },
    ],
  },
]

export type FleetActionType =
  | 'ADD_VEHICLE'
  | 'DISPATCH_VEHICLE'
  | 'RETURN_MISSION'
  | 'SCHEDULE_MAINTENANCE'
  | 'COMPLETE_MAINTENANCE'
  | 'ASSIGN_DRIVER'
  | 'RENEW_PERMIT'

export type ApprovalStatus = 'Pending Approval' | 'Approved' | 'Rejected'

export interface FleetApprovalRequest {
  id: string
  requestNumber: string // e.g., "FL-REQ-2026-001"
  actionType: FleetActionType
  title: string
  description: string
  requestedBy: string
  requestedAt: string
  targetVehicleId?: string
  targetVehicleReg?: string
  targetDriverName?: string
  status: ApprovalStatus
  payload: any
  requiredApproverRole: string
  approverName?: string
  approvedAt?: string
  rejectionReason?: string
}

export const INITIAL_APPROVAL_REQUESTS: FleetApprovalRequest[] = [
  {
    id: 'REQ-001',
    requestNumber: 'FL-REQ-2026-018',
    actionType: 'DISPATCH_VEHICLE',
    title: 'Dispatch Compactor WP LA-4821 to Ward 04 Emergency Route',
    description: 'Special weekend monsoon solid waste clearance along Market Road & Canal banks.',
    requestedBy: 'K.A. Dissanayake (Transport Officer)',
    requestedAt: '2026-07-12 08:30 AM',
    targetVehicleId: 'VEH-001',
    targetVehicleReg: 'WP LA-4821',
    targetDriverName: 'Wimalasiri Fernando',
    status: 'Pending Approval',
    requiredApproverRole: 'Municipal Engineer / Secretary',
    payload: {
      vehicleId: 'VEH-001',
      mission: {
        destinationWard: 'Ward 04 - Solid Waste Route A',
        purpose: 'Special weekend monsoon solid waste clearance along Market Road & Canal banks.',
        estimatedReturn: '2026-07-12 at 17:00 PM',
        driverId: 'DRV-01',
      },
    },
  },
  {
    id: 'REQ-002',
    requestNumber: 'FL-REQ-2026-019',
    actionType: 'SCHEDULE_MAINTENANCE',
    title: 'Schedule Workshop Maintenance for Gully Bowser WP GB-2291',
    description: 'Hydraulic Vacuum Pump rotary seal replacement and pressure testing.',
    requestedBy: 'S.M. Bandara (Senior Mechanic)',
    requestedAt: '2026-07-12 09:10 AM',
    targetVehicleId: 'VEH-006',
    targetVehicleReg: 'WP GB-2291',
    status: 'Pending Approval',
    requiredApproverRole: 'Chief Mechanical Engineer',
    payload: {
      vehicleId: 'VEH-006',
      maintenanceData: {
        workshopName: 'Municipal Central Workshop',
        maintenanceType: 'Hydraulic System & Compactor Repair',
        startDate: '2026-07-13',
        estimatedCompletionDate: '2026-07-16',
        estimatedCostLKR: 85000,
        notes: '',
      },
    },
  },
  {
    id: 'REQ-003',
    requestNumber: 'FL-REQ-2026-014',
    actionType: 'ASSIGN_DRIVER',
    title: 'Reassign Operator Sunil Rodrigo to CAB WP KD-1102',
    description: 'Reassigning driver to cover administrative site inspection tours for Works Dept.',
    requestedBy: 'K.A. Dissanayake (Transport Officer)',
    requestedAt: '2026-07-11 02:15 PM',
    targetVehicleId: 'VEH-003',
    targetVehicleReg: 'WP KD-1102',
    targetDriverName: 'Sunil Rodrigo',
    status: 'Approved',
    requiredApproverRole: 'Secretary / HR Officer',
    approverName: 'Eng. H.L. Jayawardena',
    approvedAt: '2026-07-11 04:00 PM',
    payload: {
      vehicleId: 'VEH-003',
      driverId: 'DRV-05',
    },
  },
]


