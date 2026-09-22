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

export interface InvoiceItem {
  id: string
  invoiceNumber: string
  customerName: string
  customerNICorBRN: string
  category: 'Assessment Tax' | 'Trade License' | 'Building Application Fee' | 'Market Stall Lease' | 'Gully Bowser Service' | 'Hall Booking' | 'Advertising Signboard'
  propertyOrRefId: string
  amount: number
  issueDate: string
  dueDate: string
  status: 'Paid' | 'Pending' | 'Overdue' | 'Partially Paid'
  paymentMethod?: 'Cash Counter' | 'Online Gateway' | 'Bank Transfer' | 'Cheque'
  wardNumber: string
  notes?: string
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
    customerName: 'K. D. Gunasekara Enterprises',
    customerNICorBRN: 'PV00291044',
    category: 'Trade License',
    propertyOrRefId: 'TL-2026-HOM-481',
    amount: 145000,
    issueDate: '2026-09-18',
    dueDate: '2026-10-05',
    status: 'Pending',
    wardNumber: 'Ward 02 - Homagama Town',
    notes: 'Annual dangerous trade inspection & food hygiene certification surcharge included.',
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-0940',
    customerName: 'Sunil Weerasinghe',
    customerNICorBRN: '197412903810',
    category: 'Assessment Tax',
    propertyOrRefId: 'AST-KAT-1029',
    amount: 38500,
    issueDate: '2026-09-17',
    dueDate: '2026-09-30',
    status: 'Paid',
    paymentMethod: 'Online Gateway',
    wardNumber: 'Ward 04 - Katuwawala',
    notes: 'Quarter 3 assessment tax with 10% on-time rebate.',
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2026-0939',
    customerName: 'Apex Logistics Warehouse Ltd',
    customerNICorBRN: 'PV00118239',
    category: 'Solid Waste Surcharges & Recycling' as any,
    propertyOrRefId: 'SW-IND-004',
    amount: 280000,
    issueDate: '2026-09-15',
    dueDate: '2026-09-30',
    status: 'Pending',
    wardNumber: 'Ward 08 - Pitipana Techno City',
    notes: 'Monthly bulk cardboard and industrial non-hazardous waste collection.',
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

// ═════════════════════════════════════════════════════════════════
// Assessment Rates & Taxes Module Types
// ═════════════════════════════════════════════════════════════════

export interface PropertyAssessment {
  id: string
  assessmentNo: string
  ward: string
  propertyOwner: string
  propertyAddress: string
  propertyType: 'Residential' | 'Commercial' | 'Industrial' | 'Agricultural'
  annualValue: number // LKR
  percentageRate: number // e.g., 12.5%
  rateableValue: number // computed as annualValue * percentageRate / 100
  status: 'Active' | 'Exempted' | 'Under Assessment' | 'Disputed'
  lastAssessmentDate: string
  nextAssessmentDate: string
}

export type QuarterType = 'Q1' | 'Q2' | 'Q3' | 'Q4'

export interface QuarterlyBillingRun {
  id: string
  billingRunNumber: string
  quarter: QuarterType
  fiscalYear: string
  runDate: string
  dueDate: string
  totalPropertiesIncluded: number
  totalBilledAmount: number
  earlyPaymentDiscountPercent: number // e.g., 10%
  earlyPaymentDeadline: string
  latePaymentSurchargePercent: number // e.g., 10%
  latePenaltyAppliedAfter: string // days after due date
  status: 'Generated' | 'In Progress' | 'Completed' | 'Locked'
  generatedBy: string
  generatedAt: string
}

export interface PropertyPaymentHistory {
  id: string
  assessmentNo: string
  propertyOwner: string
  billingRunId: string
  quarter: QuarterType
  fiscalYear: string
  grossAmount: number // before discount/surcharge
  discountAmount: number // early payment discount
  surchargeAmount: number // late payment surcharge
  netAmount: number // gross - discount + surcharge
  paidAmount: number
  remainingBalance: number
  paymentDate?: string
  paymentMethod?: 'Cash Counter' | 'Online Gateway' | 'Bank Transfer' | 'Cheque' | 'Partial'
  paymentReference?: string
  status: 'Pending' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Written Off'
  notes?: string
}

export const INITIAL_PROPERTY_ASSESSMENTS: PropertyAssessment[] = [
  {
    id: 'prop-1',
    assessmentNo: 'AST-HOM-001',
    ward: 'Ward 01 - Homagama Central',
    propertyOwner: 'K. D. Gunasekara',
    propertyAddress: 'High Level Road, Homagama',
    propertyType: 'Commercial',
    annualValue: 450000,
    percentageRate: 12.5,
    rateableValue: 56250,
    status: 'Active',
    lastAssessmentDate: '2024-06-15',
    nextAssessmentDate: '2027-06-15',
  },
  {
    id: 'prop-2',
    assessmentNo: 'AST-KAT-1029',
    ward: 'Ward 04 - Katuwawala',
    propertyOwner: 'Sunil Weerasinghe',
    propertyAddress: 'Galle Road, Katuwawala',
    propertyType: 'Residential',
    annualValue: 280000,
    percentageRate: 10.0,
    rateableValue: 28000,
    status: 'Active',
    lastAssessmentDate: '2024-03-20',
    nextAssessmentDate: '2027-03-20',
  },
  {
    id: 'prop-3',
    assessmentNo: 'AST-PIT-0842',
    ward: 'Ward 08 - Pitipana Techno City',
    propertyOwner: 'Apex Logistics Warehouse Ltd',
    propertyAddress: 'Zone A Industrial Estate, Pitipana',
    propertyType: 'Industrial',
    annualValue: 1200000,
    percentageRate: 15.0,
    rateableValue: 180000,
    status: 'Active',
    lastAssessmentDate: '2025-01-10',
    nextAssessmentDate: '2028-01-10',
  },
  {
    id: 'prop-4',
    assessmentNo: 'AST-HOM-0205',
    ward: 'Ward 02 - Homagama Town',
    propertyOwner: 'Nirmala Kumari de Silva',
    propertyAddress: 'Middle Lane, Homagama Town',
    propertyType: 'Residential',
    annualValue: 320000,
    percentageRate: 10.0,
    rateableValue: 32000,
    status: 'Active',
    lastAssessmentDate: '2024-05-08',
    nextAssessmentDate: '2027-05-08',
  },
  {
    id: 'prop-5',
    assessmentNo: 'AST-GAL-0568',
    ward: 'Ward 05 - Galoluwa',
    propertyOwner: 'Premium Trading Company',
    propertyAddress: 'Main Street, Galoluwa Junction',
    propertyType: 'Commercial',
    annualValue: 680000,
    percentageRate: 12.5,
    rateableValue: 85000,
    status: 'Active',
    lastAssessmentDate: '2024-08-22',
    nextAssessmentDate: '2027-08-22',
  },
  {
    id: 'prop-6',
    assessmentNo: 'AST-MEE-0401',
    ward: 'Ward 03 - Meegoda',
    propertyOwner: 'Lakshmi Fernando',
    propertyAddress: 'Estate Road, Meegoda',
    propertyType: 'Agricultural',
    annualValue: 180000,
    percentageRate: 8.0,
    rateableValue: 14400,
    status: 'Exempted',
    lastAssessmentDate: '2023-12-10',
    nextAssessmentDate: '2026-12-10',
  },
]

export const INITIAL_QUARTERLY_BILLING_RUNS: QuarterlyBillingRun[] = [
  {
    id: 'qbr-1',
    billingRunNumber: 'BRN-2026-Q1',
    quarter: 'Q1',
    fiscalYear: '2026',
    runDate: '2026-03-15',
    dueDate: '2026-04-15',
    totalPropertiesIncluded: 847,
    totalBilledAmount: 28450000,
    earlyPaymentDiscountPercent: 10,
    earlyPaymentDeadline: '2026-04-01',
    latePaymentSurchargePercent: 10,
    latePenaltyAppliedAfter: '30',
    status: 'Completed',
    generatedBy: 'Finance Officer - Gamini Perera',
    generatedAt: '2026-03-15T08:30:00Z',
  },
  {
    id: 'qbr-2',
    billingRunNumber: 'BRN-2026-Q2',
    quarter: 'Q2',
    fiscalYear: '2026',
    runDate: '2026-06-15',
    dueDate: '2026-07-15',
    totalPropertiesIncluded: 862,
    totalBilledAmount: 29100000,
    earlyPaymentDiscountPercent: 10,
    earlyPaymentDeadline: '2026-07-01',
    latePaymentSurchargePercent: 10,
    latePenaltyAppliedAfter: '30',
    status: 'Completed',
    generatedBy: 'Finance Officer - Gamini Perera',
    generatedAt: '2026-06-15T08:45:00Z',
  },
  {
    id: 'qbr-3',
    billingRunNumber: 'BRN-2026-Q3',
    quarter: 'Q3',
    fiscalYear: '2026',
    runDate: '2026-09-15',
    dueDate: '2026-10-15',
    totalPropertiesIncluded: 875,
    totalBilledAmount: 29850000,
    earlyPaymentDiscountPercent: 10,
    earlyPaymentDeadline: '2026-10-01',
    latePaymentSurchargePercent: 10,
    latePenaltyAppliedAfter: '30',
    status: 'In Progress',
    generatedBy: 'Finance Officer - Gamini Perera',
    generatedAt: '2026-09-15T09:00:00Z',
  },
  {
    id: 'qbr-4',
    billingRunNumber: 'BRN-2026-Q4',
    quarter: 'Q4',
    fiscalYear: '2026',
    runDate: '2026-12-15',
    dueDate: '2027-01-15',
    totalPropertiesIncluded: 0,
    totalBilledAmount: 0,
    earlyPaymentDiscountPercent: 10,
    earlyPaymentDeadline: '2027-01-01',
    latePaymentSurchargePercent: 10,
    latePenaltyAppliedAfter: '30',
    status: 'Generated',
    generatedBy: 'Finance Officer - Gamini Perera',
    generatedAt: '2026-09-20T10:00:00Z',
  },
]

export const INITIAL_PAYMENT_HISTORIES: PropertyPaymentHistory[] = [
  {
    id: 'ph-1',
    assessmentNo: 'AST-HOM-001',
    propertyOwner: 'K. D. Gunasekara',
    billingRunId: 'qbr-1',
    quarter: 'Q1',
    fiscalYear: '2026',
    grossAmount: 56250,
    discountAmount: 5625, // 10% early payment discount
    surchargeAmount: 0,
    netAmount: 50625,
    paidAmount: 50625,
    remainingBalance: 0,
    paymentDate: '2026-03-28',
    paymentMethod: 'Online Gateway',
    paymentReference: 'TXN-BOC-00812400',
    status: 'Paid',
  },
  {
    id: 'ph-2',
    assessmentNo: 'AST-KAT-1029',
    propertyOwner: 'Sunil Weerasinghe',
    billingRunId: 'qbr-1',
    quarter: 'Q1',
    fiscalYear: '2026',
    grossAmount: 28000,
    discountAmount: 2800, // 10% early payment discount
    surchargeAmount: 0,
    netAmount: 25200,
    paidAmount: 25200,
    remainingBalance: 0,
    paymentDate: '2026-04-05',
    paymentMethod: 'Bank Transfer',
    paymentReference: 'CR-8642',
    status: 'Paid',
  },
  {
    id: 'ph-3',
    assessmentNo: 'AST-PIT-0842',
    propertyOwner: 'Apex Logistics Warehouse Ltd',
    billingRunId: 'qbr-2',
    quarter: 'Q2',
    fiscalYear: '2026',
    grossAmount: 180000,
    discountAmount: 0,
    surchargeAmount: 18000, // 10% late payment surcharge
    netAmount: 198000,
    paidAmount: 198000,
    remainingBalance: 0,
    paymentDate: '2026-08-10',
    paymentMethod: 'Cheque',
    paymentReference: 'CHQ-PB-891054',
    status: 'Paid',
    notes: 'Payment received 26 days after due date; late penalty applied',
  },
  {
    id: 'ph-4',
    assessmentNo: 'AST-HOM-0205',
    propertyOwner: 'Nirmala Kumari de Silva',
    billingRunId: 'qbr-3',
    quarter: 'Q3',
    fiscalYear: '2026',
    grossAmount: 32000,
    discountAmount: 0,
    surchargeAmount: 0,
    netAmount: 32000,
    paidAmount: 0,
    remainingBalance: 32000,
    status: 'Overdue',
    notes: 'Payment overdue by 5 days; reminder sent via SMS',
  },
  {
    id: 'ph-5',
    assessmentNo: 'AST-GAL-0568',
    propertyOwner: 'Premium Trading Company',
    billingRunId: 'qbr-3',
    quarter: 'Q3',
    fiscalYear: '2026',
    grossAmount: 85000,
    discountAmount: 8500, // 10% early payment discount
    surchargeAmount: 0,
    netAmount: 76500,
    paidAmount: 76500,
    remainingBalance: 0,
    paymentDate: '2026-09-28',
    paymentMethod: 'Online Gateway',
    paymentReference: 'TXN-CB-00944821',
    status: 'Paid',
  },
  {
    id: 'ph-6',
    assessmentNo: 'AST-MEE-0401',
    propertyOwner: 'Lakshmi Fernando',
    billingRunId: 'qbr-2',
    quarter: 'Q2',
    fiscalYear: '2026',
    grossAmount: 14400,
    discountAmount: 0,
    surchargeAmount: 0,
    netAmount: 0,
    paidAmount: 0,
    remainingBalance: 0,
    status: 'Paid',
    notes: 'Property exempted; no payment due',
  },
]
