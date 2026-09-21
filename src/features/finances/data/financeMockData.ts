export interface MonthlyCashFlow {
  month: string
  shortMonth: string
  inflows: number // in LKR
  outflows: number // in LKR
  net: number // in LKR
  inflowBreakdown: {
    assessmentRates: number
    tradeLicenses: number
    propertyRents: number
    serviceFees: number
    governmentGrants: number
    other: number
  }
  outflowBreakdown: {
    personalEmoluments: number
    capitalWorks: number
    fuelAndTransport: number
    solidWasteManagement: number
    streetLightingUtilities: number
    officeAdministration: number
  }
}

export interface WatchlistAccount {
  id: string
  code: string
  name: string
  category: 'Revenue' | 'Expense' | 'Capital Fund' | 'Receivable' | 'Liability'
  voteHead: string
  allocatedBudget: number // LKR
  actualYTD: number // LKR
  targetOrBudget: number // Target for Rev, Budget for Exp
  percentage: number
  status: 'On Track' | 'Over Budget' | 'Collection Lag' | 'Surplus Ahead' | 'Caution'
  trend: 'up' | 'down' | 'stable'
  variance: number // actual - budget
  description: string
  lastUpdated: string
  recentEntries: {
    id: string
    date: string
    description: string
    type: 'Debit' | 'Credit'
    amount: number
    refNo: string
  }[]
}

export type RevenueCategory =
  | 'Assessment Rates'
  | 'Shop/Stall Rentals'
  | 'Public Ground & Property Hire'
  | 'Building Approvals'
  | 'Trade Licenses'
  | 'Vehicle & Machinery Hire'

export type InvoiceStatus =
  | 'Draft'
  | 'Approved & Issued'
  | 'Partially Paid'
  | 'Paid'
  | 'Overdue'

export interface PaymentRecord {
  id: string
  receiptNumber: string
  date: string
  amount: number
  paymentMethod: 'Cash' | 'Cheque' | 'Bank Transfer' | 'Online Gateway'
  collectedBy: string
  notes?: string
  customerName?: string
}

export interface RentalDetails {
  // Vehicle/Machinery hire fields
  machineryType?: string
  registrationNumber?: string
  operatorName?: string
  hireDurationDaysOrHours?: string
  depositAmount?: number
  // Ground/Property hire fields
  venueName?: string
  eventDate?: string
  eventType?: string
  capacity?: number
  securityDeposit?: number
}

export interface InvoiceItem {
  id: string
  invoiceNumber: string
  customerName: string
  customerNICorBRN: string
  customerPhone?: string
  customerEmail?: string
  category: RevenueCategory
  propertyOrRefId: string
  amount: number
  paidAmount?: number
  issueDate: string
  dueDate: string
  status: InvoiceStatus
  wardNumber: string
  notes?: string
  paymentHistory?: PaymentRecord[]
  rentalDetails?: RentalDetails
  remindersSent?: number
  lastReminderDate?: string
}

export interface PaymentVoucher {
  id: string
  voucherNumber: string
  payeeName: string
  category: 'Fuel & Fleet' | 'Capital Works' | 'Waste Management Contractor' | 'Utility Bills' | 'Staff Overtime & Allowances' | 'Office Supplies & IT'
  voteNumber: string
  amount: number
  paymentDate: string
  paymentMethod: 'Cheque' | 'SLIPS EFT' | 'Direct Debit' | 'Petty Cash'
  chequeOrEftRef: string
  status: 'Authorized & Paid' | 'Pending Approval' | 'Under Review' | 'Draft'
  approvedBy: string
  description: string
}

export interface BankAccountSummary {
  id: string
  bankName: string
  accountNumber: string
  accountType: 'Current Operating' | 'Capital Development' | 'Rates Collection Escrow' | 'Gratuity Fund'
  balance: number
  lastReconciledDate: string
  unreconciledCount: number
}

export interface BankStatementRecord {
  id: string
  date: string
  description: string
  reference: string
  type: 'Credit' | 'Debit'
  amount: number
  bankAccountId: string
  status: 'Matched' | 'Unreconciled' | 'Requires Attention'
  matchedVoucherOrInvoice?: string
}

export interface JournalEntry {
  id: string
  journalNumber: string
  date: string
  debitAccountCode: string
  debitAccountName: string
  creditAccountCode: string
  creditAccountName: string
  amount: number
  narration: string
  referenceDoc: string
  postedBy: string
}

export const INITIAL_MONTHLY_CASH_FLOW: MonthlyCashFlow[] = [
  {
    month: 'January 2026',
    shortMonth: 'Jan',
    inflows: 14500000,
    outflows: 10800000,
    net: 3700000,
    inflowBreakdown: {
      assessmentRates: 7800000,
      tradeLicenses: 3200000,
      propertyRents: 1500000,
      serviceFees: 900000,
      governmentGrants: 800000,
      other: 300000,
    },
    outflowBreakdown: {
      personalEmoluments: 5100000,
      capitalWorks: 2200000,
      fuelAndTransport: 1100000,
      solidWasteManagement: 1200000,
      streetLightingUtilities: 750000,
      officeAdministration: 450000,
    },
  },
  {
    month: 'February 2026',
    shortMonth: 'Feb',
    inflows: 18200000,
    outflows: 12400000,
    net: 5800000,
    inflowBreakdown: {
      assessmentRates: 10400000,
      tradeLicenses: 4100000,
      propertyRents: 1600000,
      serviceFees: 1100000,
      governmentGrants: 700000,
      other: 300000,
    },
    outflowBreakdown: {
      personalEmoluments: 5150000,
      capitalWorks: 3400000,
      fuelAndTransport: 1250000,
      solidWasteManagement: 1300000,
      streetLightingUtilities: 800000,
      officeAdministration: 500000,
    },
  },
  {
    month: 'March 2026',
    shortMonth: 'Mar',
    inflows: 22500000,
    outflows: 15100000,
    net: 7400000,
    inflowBreakdown: {
      assessmentRates: 13500000,
      tradeLicenses: 4800000,
      propertyRents: 1700000,
      serviceFees: 1300000,
      governmentGrants: 850000,
      other: 350000,
    },
    outflowBreakdown: {
      personalEmoluments: 5300000,
      capitalWorks: 5200000,
      fuelAndTransport: 1400000,
      solidWasteManagement: 1500000,
      streetLightingUtilities: 950000,
      officeAdministration: 750000,
    },
  },
  {
    month: 'April 2026',
    shortMonth: 'Apr',
    inflows: 13800000,
    outflows: 14200000,
    net: -400000,
    inflowBreakdown: {
      assessmentRates: 6800000,
      tradeLicenses: 2900000,
      propertyRents: 1600000,
      serviceFees: 1200000,
      governmentGrants: 900000,
      other: 400000,
    },
    outflowBreakdown: {
      personalEmoluments: 5900000,
      capitalWorks: 4100000,
      fuelAndTransport: 1300000,
      solidWasteManagement: 1450000,
      streetLightingUtilities: 850000,
      officeAdministration: 600000,
    },
  },
  {
    month: 'May 2026',
    shortMonth: 'May',
    inflows: 17100000,
    outflows: 13600000,
    net: 3500000,
    inflowBreakdown: {
      assessmentRates: 9200000,
      tradeLicenses: 3400000,
      propertyRents: 1650000,
      serviceFees: 1400000,
      governmentGrants: 1100000,
      other: 350000,
    },
    outflowBreakdown: {
      personalEmoluments: 5200000,
      capitalWorks: 4400000,
      fuelAndTransport: 1350000,
      solidWasteManagement: 1350000,
      streetLightingUtilities: 800000,
      officeAdministration: 500000,
    },
  },
  {
    month: 'June 2026',
    shortMonth: 'Jun',
    inflows: 19400000,
    outflows: 14800000,
    net: 4600000,
    inflowBreakdown: {
      assessmentRates: 11100000,
      tradeLicenses: 3600000,
      propertyRents: 1700000,
      serviceFees: 1500000,
      governmentGrants: 1150000,
      other: 350000,
    },
    outflowBreakdown: {
      personalEmoluments: 5250000,
      capitalWorks: 5100000,
      fuelAndTransport: 1450000,
      solidWasteManagement: 1500000,
      streetLightingUtilities: 900000,
      officeAdministration: 600000,
    },
  },
  {
    month: 'July 2026',
    shortMonth: 'Jul',
    inflows: 16900000,
    outflows: 13100000,
    net: 3800000,
    inflowBreakdown: {
      assessmentRates: 9300000,
      tradeLicenses: 3100000,
      propertyRents: 1600000,
      serviceFees: 1400000,
      governmentGrants: 1200000,
      other: 300000,
    },
    outflowBreakdown: {
      personalEmoluments: 5250000,
      capitalWorks: 3900000,
      fuelAndTransport: 1350000,
      solidWasteManagement: 1350000,
      streetLightingUtilities: 750000,
      officeAdministration: 500000,
    },
  },
  {
    month: 'August 2026',
    shortMonth: 'Aug',
    inflows: 20100000,
    outflows: 14900000,
    net: 5200000,
    inflowBreakdown: {
      assessmentRates: 12000000,
      tradeLicenses: 3500000,
      propertyRents: 1750000,
      serviceFees: 1350000,
      governmentGrants: 1100000,
      other: 400000,
    },
    outflowBreakdown: {
      personalEmoluments: 5300000,
      capitalWorks: 5300000,
      fuelAndTransport: 1400000,
      solidWasteManagement: 1400000,
      streetLightingUtilities: 900000,
      officeAdministration: 600000,
    },
  },
  {
    month: 'September 2026',
    shortMonth: 'Sep',
    inflows: 15950000,
    outflows: 13500000,
    net: 2450000,
    inflowBreakdown: {
      assessmentRates: 8900000,
      tradeLicenses: 2850000,
      propertyRents: 1700000,
      serviceFees: 1200000,
      governmentGrants: 1000000,
      other: 300000,
    },
    outflowBreakdown: {
      personalEmoluments: 5200000,
      capitalWorks: 4400000,
      fuelAndTransport: 1300000,
      solidWasteManagement: 1350000,
      streetLightingUtilities: 750000,
      officeAdministration: 500000,
    },
  },
]

export const INITIAL_WATCHLIST_ACCOUNTS: WatchlistAccount[] = [
  {
    id: 'acc-1',
    code: 'REV-101',
    name: 'Assessment Rates Receivable',
    category: 'Receivable',
    voteHead: 'Vote 1-01 (General Property Rates)',
    allocatedBudget: 120000000, // Annual Target
    actualYTD: 89000000, // Collected YTD
    targetOrBudget: 120000000,
    percentage: 74.2,
    status: 'On Track',
    trend: 'up',
    variance: 4200000, // Ahead of prorated benchmark
    description: 'Quarterly property tax revenue collected from residential, commercial, and industrial properties in Homagama.',
    lastUpdated: '2026-09-18',
    recentEntries: [
      { id: 're-1', date: '2026-09-18', description: 'Batch Rates Inward - Ward 04 Katuwawala', type: 'Credit', amount: 1450000, refNo: 'CR-8821' },
      { id: 're-2', date: '2026-09-15', description: 'Commercial Rates - High Level Road Zone', type: 'Credit', amount: 2890000, refNo: 'CR-8799' },
      { id: 're-3', date: '2026-09-10', description: 'Online Citizen Gateway Rate Settlements', type: 'Credit', amount: 875000, refNo: 'CR-8742' },
    ],
  },
  {
    id: 'acc-2',
    code: 'EXP-304',
    name: 'Fuel Expense Account',
    category: 'Expense',
    voteHead: 'Vote 3-04 (Vehicular Fuel & Lubricants)',
    allocatedBudget: 18000000,
    actualYTD: 14650000,
    targetOrBudget: 18000000,
    percentage: 81.4,
    status: 'Over Budget',
    trend: 'up',
    variance: -1150000,
    description: 'Diesel and petrol consumption for municipal waste compactors, gullies, tractors, and inspection vehicles.',
    lastUpdated: '2026-09-19',
    recentEntries: [
      { id: 'fe-1', date: '2026-09-19', description: 'Ceypetco Fuel Dispatch - Waste Compactors 1-6', type: 'Debit', amount: 480000, refNo: 'PV-9042' },
      { id: 'fe-2', date: '2026-09-12', description: 'Monthly Bulk Diesel Tanker Fill (6,000L)', type: 'Debit', amount: 2160000, refNo: 'PV-8991' },
    ],
  },
  {
    id: 'acc-3',
    code: 'CAP-501',
    name: 'Capital Development Fund',
    category: 'Capital Fund',
    voteHead: 'Vote 5-01 (Provincial Infrastructure Grant)',
    allocatedBudget: 65000000,
    actualYTD: 48200000,
    targetOrBudget: 65000000,
    percentage: 74.1,
    status: 'On Track',
    trend: 'stable',
    variance: 1800000,
    description: 'Central and Provincial Government capital grants allocated for bridge rehabilitation, rural byroads, and community hall builds.',
    lastUpdated: '2026-09-14',
    recentEntries: [
      { id: 'cf-1', date: '2026-09-14', description: 'Stage 2 Concreting - Meegoda Access Road', type: 'Debit', amount: 3850000, refNo: 'PV-8940' },
      { id: 'cf-2', date: '2026-08-28', description: 'Grant Tranche 3 Disbursal - Western Province Ministry', type: 'Credit', amount: 15000000, refNo: 'GR-3012' },
    ],
  },
  {
    id: 'acc-4',
    code: 'REV-108',
    name: 'Solid Waste Management Levy',
    category: 'Revenue',
    voteHead: 'Vote 1-08 (Sanitation & Commercial Garbage)',
    allocatedBudget: 22000000,
    actualYTD: 14200000,
    targetOrBudget: 22000000,
    percentage: 64.5,
    status: 'Collection Lag',
    trend: 'down',
    variance: -2300000,
    description: 'Commercial waste removal levies from factories, shopping complexes, and recycled bulk material auctions.',
    lastUpdated: '2026-09-17',
    recentEntries: [
      { id: 'sw-1', date: '2026-09-17', description: 'Homagama Industrial Estate Waste Fees', type: 'Credit', amount: 920000, refNo: 'CR-8810' },
      { id: 'sw-2', date: '2026-09-05', description: 'Plastic & Metal Scrap Auction Lot #4', type: 'Credit', amount: 340000, refNo: 'CR-8715' },
    ],
  },
  {
    id: 'acc-5',
    code: 'EXP-312',
    name: 'Street Lighting & CEB Utilities',
    category: 'Expense',
    voteHead: 'Vote 3-12 (Public Lighting & Electricity)',
    allocatedBudget: 12500000,
    actualYTD: 8750000,
    targetOrBudget: 12500000,
    percentage: 70.0,
    status: 'On Track',
    trend: 'stable',
    variance: 625000,
    description: 'Monthly electricity settlement with Ceylon Electricity Board (CEB) for 4,200 public streetlight points and council complexes.',
    lastUpdated: '2026-09-16',
    recentEntries: [
      { id: 'ceb-1', date: '2026-09-16', description: 'CEB Homagama South Grid Bill Settlement', type: 'Debit', amount: 790000, refNo: 'PV-9011' },
      { id: 'ceb-2', date: '2026-08-16', description: 'CEB Main Council Complex Solar Net Settlement', type: 'Debit', amount: 145000, refNo: 'PV-8890' },
    ],
  },
  {
    id: 'acc-6',
    code: 'REV-104',
    name: 'Trade Licensing Inflows',
    category: 'Revenue',
    voteHead: 'Vote 1-04 (Trade Tax & Dangerous Business Licenses)',
    allocatedBudget: 35000000,
    actualYTD: 28900000,
    targetOrBudget: 35000000,
    percentage: 82.6,
    status: 'Surplus Ahead',
    trend: 'up',
    variance: 2650000,
    description: 'Annual licensing fees collected from retail stores, restaurants, garages, timber mills, and manufacturing plants.',
    lastUpdated: '2026-09-19',
    recentEntries: [
      { id: 'tl-1', date: '2026-09-19', description: 'Supermarket Chain Multi-Branch License', type: 'Credit', amount: 450000, refNo: 'CR-8829' },
      { id: 'tl-2', date: '2026-09-11', description: 'New Pharmacy & Food Outlet Registrations', type: 'Credit', amount: 180000, refNo: 'CR-8750' },
    ],
  },
]

export const INITIAL_BANK_ACCOUNTS: BankAccountSummary[] = [
  {
    id: 'bank-1',
    bankName: 'Bank of Ceylon',
    accountNumber: 'BOC-0004128910',
    accountType: 'Current Operating',
    balance: 28450000,
    lastReconciledDate: '2026-09-18',
    unreconciledCount: 3,
  },
  {
    id: 'bank-2',
    bankName: "People's Bank",
    accountNumber: 'PB-2041001928',
    accountType: 'Capital Development',
    balance: 18250000,
    lastReconciledDate: '2026-09-17',
    unreconciledCount: 1,
  },
  {
    id: 'bank-3',
    bankName: 'Commercial Bank',
    accountNumber: 'CB-8810294101',
    accountType: 'Rates Collection Escrow',
    balance: 7500000,
    lastReconciledDate: '2026-09-19',
    unreconciledCount: 0,
  },
]

export const INITIAL_INVOICES: InvoiceItem[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-0941',
    customerName: 'K. D. Gunasekara Constructions',
    customerNICorBRN: 'PV00291044',
    customerPhone: '+94 77 123 4567',
    customerEmail: 'kdg.constructions@gmail.com',
    category: 'Vehicle & Machinery Hire',
    propertyOrRefId: 'VEH-JCB-2026-041',
    amount: 185000,
    paidAmount: 0,
    issueDate: '2026-09-18',
    dueDate: '2026-10-05',
    status: 'Approved & Issued',
    wardNumber: 'Ward 06 - Godigamuwa',
    notes: 'JCB backhoe excavation for storm drain construction. Operator + fuel by council.',
    rentalDetails: {
      machineryType: 'JCB Backhoe Loader (CAT 428)',
      registrationNumber: 'WP-CAT-9911',
      operatorName: 'N. M. Rathnayake',
      hireDurationDaysOrHours: '3 Days',
      depositAmount: 50000,
    },
    remindersSent: 0,
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-0940',
    customerName: 'Sunil Premaratne Weerasinghe',
    customerNICorBRN: '197412903810',
    customerPhone: '+94 71 445 8821',
    customerEmail: 'sunilweerasinghe@yahoo.com',
    category: 'Assessment Rates',
    propertyOrRefId: 'AST-KAT-1029-B',
    amount: 38500,
    paidAmount: 38500,
    issueDate: '2026-09-17',
    dueDate: '2026-09-30',
    status: 'Paid',
    wardNumber: 'Ward 04 - Katuwawala',
    notes: 'Quarter 3 2026 assessment rates. 10% early-payment rebate applied.',
    paymentHistory: [
      {
        id: 'pmt-001',
        receiptNumber: 'RCP-2026-1841',
        date: '2026-09-19',
        amount: 38500,
        paymentMethod: 'Online Gateway',
        collectedBy: 'Online Self-Service Portal',
        notes: 'Full settlement via e-payment gateway. Ref: OLG-8821-KAT',
        customerName: 'Sunil Premaratne Weerasinghe',
      },
    ],
    remindersSent: 0,
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2026-0939',
    customerName: 'Apex Freight & Logistics (Pvt) Ltd',
    customerNICorBRN: 'PV00118239',
    customerPhone: '+94 11 290 4400',
    customerEmail: 'finance@apexfreight.lk',
    category: 'Trade Licenses',
    propertyOrRefId: 'TL-2026-HOM-339',
    amount: 280000,
    paidAmount: 140000,
    issueDate: '2026-09-15',
    dueDate: '2026-09-30',
    status: 'Partially Paid',
    wardNumber: 'Ward 08 - Pitipana Techno City',
    notes: 'Annual dangerous trade license for bulk freight storage & forklift operations.',
    paymentHistory: [
      {
        id: 'pmt-002',
        receiptNumber: 'RCP-2026-1835',
        date: '2026-09-18',
        amount: 140000,
        paymentMethod: 'Cheque',
        collectedBy: 'Revenue Officer - H. Jayawardena',
        notes: 'First instalment. Cheque no: CB-001928. Remaining 140,000 due by 30 Sep.',
        customerName: 'Apex Freight & Logistics (Pvt) Ltd',
      },
    ],
    remindersSent: 1,
    lastReminderDate: '2026-09-20',
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-2026-0938',
    customerName: 'Priyantha Ruwan Dissanayake',
    customerNICorBRN: '198804201540',
    customerPhone: '+94 76 391 0022',
    category: 'Public Ground & Property Hire',
    propertyOrRefId: 'GRD-HOM-TWNH-011',
    amount: 65000,
    paidAmount: 0,
    issueDate: '2026-09-14',
    dueDate: '2026-09-28',
    status: 'Overdue',
    wardNumber: 'Ward 01 - Homagama North',
    notes: 'Town Hall auditorium hire for political rally event on 2026-09-25. 500-seat capacity.',
    rentalDetails: {
      venueName: 'Homagama Town Hall Auditorium',
      eventDate: '2026-09-25',
      eventType: 'Political Rally',
      capacity: 500,
      securityDeposit: 15000,
    },
    remindersSent: 2,
    lastReminderDate: '2026-09-21',
  },
  {
    id: 'inv-5',
    invoiceNumber: 'INV-2026-0937',
    customerName: 'Chamara Silva Building Contractors',
    customerNICorBRN: 'PV00441820',
    customerPhone: '+94 77 882 9910',
    customerEmail: 'chamarabc@sltnet.lk',
    category: 'Building Approvals',
    propertyOrRefId: 'BLD-2026-APP-0221',
    amount: 124500,
    paidAmount: 124500,
    issueDate: '2026-09-12',
    dueDate: '2026-09-26',
    status: 'Paid',
    wardNumber: 'Ward 03 - Meegoda',
    notes: 'Building plan approval fee for 2-storey commercial complex. 1,850 sq ft footprint.',
    paymentHistory: [
      {
        id: 'pmt-003',
        receiptNumber: 'RCP-2026-1822',
        date: '2026-09-13',
        amount: 124500,
        paymentMethod: 'Bank Transfer',
        collectedBy: 'Revenue Counter Officer - K. Perera',
        notes: 'Paid via SLIPS transfer. Ref BOC-TRF-0091224.',
        customerName: 'Chamara Silva Building Contractors',
      },
    ],
    remindersSent: 0,
  },
  {
    id: 'inv-6',
    invoiceNumber: 'INV-2026-0936',
    customerName: 'Nilmini Devika Perera',
    customerNICorBRN: '199202814821',
    customerPhone: '+94 70 112 9009',
    category: 'Shop/Stall Rentals',
    propertyOrRefId: 'MKT-STALL-B-09',
    amount: 12500,
    paidAmount: 0,
    issueDate: '2026-09-01',
    dueDate: '2026-09-15',
    status: 'Overdue',
    wardNumber: 'Ward 02 - Homagama Town',
    notes: 'Monthly rental for Market Stall B-09, Homagama Municipal Market. Vegetables & dry goods.',
    remindersSent: 3,
    lastReminderDate: '2026-09-21',
  },
  {
    id: 'inv-7',
    invoiceNumber: 'INV-2026-0935',
    customerName: 'Lakshmi Events Management (Pvt) Ltd',
    customerNICorBRN: 'PV00594822',
    customerPhone: '+94 11 344 7700',
    customerEmail: 'events@lakshmi.lk',
    category: 'Public Ground & Property Hire',
    propertyOrRefId: 'GRD-HOM-PLAY-003',
    amount: 45000,
    paidAmount: 45000,
    issueDate: '2026-09-05',
    dueDate: '2026-09-20',
    status: 'Paid',
    wardNumber: 'Ward 05 - Siddamulla',
    notes: 'Public playground hire for 2-day cultural festival. Includes temporary stage setup permit.',
    rentalDetails: {
      venueName: 'Siddamulla Community Grounds',
      eventDate: '2026-09-22',
      eventType: 'Cultural Festival',
      capacity: 800,
      securityDeposit: 10000,
    },
    paymentHistory: [
      {
        id: 'pmt-004',
        receiptNumber: 'RCP-2026-1800',
        date: '2026-09-08',
        amount: 45000,
        paymentMethod: 'Cash',
        collectedBy: 'Revenue Counter Officer - M. Ranasinghe',
        notes: 'Full payment cash at counter. Deposit refunded post-event.',
        customerName: 'Lakshmi Events Management (Pvt) Ltd',
      },
    ],
    remindersSent: 0,
  },
  {
    id: 'inv-8',
    invoiceNumber: 'INV-2026-0934',
    customerName: 'Gamini Perera Farm Holdings',
    customerNICorBRN: '196802204410',
    customerPhone: '+94 77 001 8833',
    category: 'Vehicle & Machinery Hire',
    propertyOrRefId: 'VEH-TRC-2026-028',
    amount: 55000,
    paidAmount: 55000,
    issueDate: '2026-09-08',
    dueDate: '2026-09-22',
    status: 'Paid',
    wardNumber: 'Ward 07 - Bokundara',
    notes: 'Tractor with attachments for land preparation at farm. 5-hour hire.',
    rentalDetails: {
      machineryType: 'Kubota Tractor M7040 with rotovator',
      registrationNumber: 'WP-TRC-8814',
      operatorName: 'W. D. Bandara',
      hireDurationDaysOrHours: '5 Hours',
      depositAmount: 10000,
    },
    paymentHistory: [
      {
        id: 'pmt-005',
        receiptNumber: 'RCP-2026-1790',
        date: '2026-09-10',
        amount: 55000,
        paymentMethod: 'Cash',
        collectedBy: 'Revenue Counter Officer - K. Perera',
        notes: 'Paid in full at counter. Deposit 10,000 refunded on vehicle return.',
        customerName: 'Gamini Perera Farm Holdings',
      },
    ],
    remindersSent: 0,
  },
  {
    id: 'inv-9',
    invoiceNumber: 'INV-2026-0933',
    customerName: 'Ruwan Manoj Senevirathne',
    customerNICorBRN: '198711203540',
    customerPhone: '+94 71 628 4411',
    category: 'Assessment Rates',
    propertyOrRefId: 'AST-BOK-0441-C',
    amount: 24000,
    paidAmount: 0,
    issueDate: '2026-08-15',
    dueDate: '2026-08-31',
    status: 'Overdue',
    wardNumber: 'Ward 07 - Bokundara',
    notes: 'Q2 assessment rates for residential property. Defaulted. SMS reminders sent x3.',
    remindersSent: 3,
    lastReminderDate: '2026-09-18',
  },
  {
    id: 'inv-10',
    invoiceNumber: 'INV-2026-0932',
    customerName: 'Wasantha Kumara Jayawickrema',
    customerNICorBRN: '197006104392',
    customerPhone: '+94 72 441 0021',
    category: 'Vehicle & Machinery Hire',
    propertyOrRefId: 'VEH-GUL-2026-019',
    amount: 38000,
    paidAmount: 0,
    issueDate: '2026-09-20',
    dueDate: '2026-10-10',
    status: 'Draft',
    wardNumber: 'Ward 03 - Meegoda',
    notes: 'Gully bowser hire for septic tank emptying at residential compound. 3 trips.',
    rentalDetails: {
      machineryType: 'Gully Bowser (3,000 Litre)',
      registrationNumber: 'WP-GUL-3391',
      operatorName: 'S. Wimalasena',
      hireDurationDaysOrHours: '3 Trips',
      depositAmount: 0,
    },
    remindersSent: 0,
  },
]

export const INITIAL_PAYMENT_VOUCHERS: PaymentVoucher[] = [
  {
    id: 'pv-1',
    voucherNumber: 'PV-2026-1892',
    payeeName: 'Ceylon Petroleum Corporation (Ceypetco)',
    category: 'Fuel & Fleet',
    voteNumber: 'Vote 3-04',
    amount: 480000,
    paymentDate: '2026-09-19',
    paymentMethod: 'Cheque',
    chequeOrEftRef: 'CHQ-BOC-591024',
    status: 'Authorized & Paid',
    approvedBy: 'Municipal Secretary / Accountant',
    description: 'Weekly diesel allocation for garbage compactors 01 to 06 and tractor fleet.',
  },
  {
    id: 'pv-2',
    voucherNumber: 'PV-2026-1891',
    payeeName: 'Gamage Engineering & Concreting Works',
    category: 'Capital Works',
    voteNumber: 'Vote 5-01',
    amount: 3850000,
    paymentDate: '2026-09-14',
    paymentMethod: 'SLIPS EFT',
    chequeOrEftRef: 'EFT-PB-994102',
    status: 'Authorized & Paid',
    approvedBy: 'Chief Engineer & Chairman',
    description: 'Interim payment certificate #02 for Meegoda drainage culvert and pavement concreting.',
  },
  {
    id: 'pv-3',
    voucherNumber: 'PV-2026-1890',
    payeeName: 'Ceylon Electricity Board (CEB)',
    category: 'Utility Bills',
    voteNumber: 'Vote 3-12',
    amount: 790000,
    paymentDate: '2026-09-16',
    paymentMethod: 'Direct Debit',
    chequeOrEftRef: 'DD-BOC-00912',
    status: 'Authorized & Paid',
    approvedBy: 'Accountant',
    description: 'August public street lighting bill for Homagama South division.',
  },
]

export const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'jnl-1',
    journalNumber: 'JV-2026-0412',
    date: '2026-09-18',
    debitAccountCode: 'REV-101',
    debitAccountName: 'Assessment Rates Receivable',
    creditAccountCode: 'REV-901',
    creditAccountName: 'Assessment Revenue Accrual Account',
    amount: 1450000,
    narration: 'To recognize Q3 assessment tax revenue due from commercial zone ward 04.',
    referenceDoc: 'DOC-AST-2026-Q3-04',
    postedBy: 'Finance Officer - Gamini Perera',
  },
  {
    id: 'jnl-2',
    journalNumber: 'JV-2026-0411',
    date: '2026-09-15',
    debitAccountCode: 'EXP-304',
    debitAccountName: 'Fuel Expense Account',
    creditAccountCode: 'LIAB-201',
    creditAccountName: 'Accounts Payable - Ceypetco',
    amount: 2160000,
    narration: 'Provision for bulk monthly diesel procurement invoice #CP-90124.',
    referenceDoc: 'CP-INV-90124',
    postedBy: 'Senior Bookkeeper - H. Jayawardena',
  },
]
