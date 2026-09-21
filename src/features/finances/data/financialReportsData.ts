export interface RevenueLineItem {
  id: string
  code: string
  title: string
  category: 'Assessment Rates' | 'Trade Licenses' | 'Property Rents' | 'Service Fees' | 'Government Grants' | 'Miscellaneous'
  budgetAnnual: number // Annual budgeted target in LKR
  actualYTD: number // Realized Year-to-Date in LKR
  q1Actual: number
  q2Actual: number
  q3Actual: number
  priorYearAudited: number // FY 2025 actual
  notes: string
}

export interface ExpenditureLineItem {
  id: string
  code: string
  title: string
  category: 'Personal Emoluments' | 'Infrastructure Works' | 'Vehicular Fleet' | 'Solid Waste' | 'Street Lighting & Utilities' | 'General Administration'
  budgetAnnual: number
  actualYTD: number
  q1Actual: number
  q2Actual: number
  q3Actual: number
  priorYearAudited: number
  notes: string
}

export interface BalanceSheetItem {
  id: string
  code: string
  name: string
  currentYearAmount: number // As at 30 Sep 2026
  priorYearAmount: number // As at 31 Dec 2025
  noteNumber?: string
}

export interface BalanceSheetSection {
  title: string
  category: 'Current Assets' | 'Non-Current Assets' | 'Current Liabilities' | 'Long-Term Liabilities' | 'Municipal Equity & Fund Balances'
  items: BalanceSheetItem[]
  totalCurrentYear: number
  totalPriorYear: number
}

export interface TrialBalanceAccount {
  code: string
  name: string
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense'
  debit: number
  credit: number
}

export interface WardAssessmentRecord {
  wardNumber: string
  wardName: string
  inspectorOfficer: string
  totalRateableProperties: number
  annualWarrantDemand: number // LKR
  collectedYTD: number // LKR
  arrearsOutstanding: number // LKR
  efficiencyPercentage: number // %
  lastAuditDate: string
  status: 'High Efficiency' | 'Satisfactory' | 'Collection Lag' | 'Critical Attention'
}

// ── 1. Income & Expenditure Dataset ───────────────────────────────────────

export const REVENUE_ITEMS: RevenueLineItem[] = [
  {
    id: 'rev-01',
    code: '4101',
    title: 'General Assessment Rates (Residential & Commercial Properties)',
    category: 'Assessment Rates',
    budgetAnnual: 120000000,
    actualYTD: 89000000,
    q1Actual: 31700000,
    q2Actual: 27100000,
    q3Actual: 30200000,
    priorYearAudited: 114200000,
    notes: 'Quarterly rate bills dispatched across 12 wards with 10% prompt payment discount',
  },
  {
    id: 'rev-02',
    code: '4102',
    title: 'Assessment Rates Arrears & Warrant Surcharges (10% Penalty)',
    category: 'Assessment Rates',
    budgetAnnual: 12000000,
    actualYTD: 8450000,
    q1Actual: 2800000,
    q2Actual: 2900000,
    q3Actual: 2750000,
    priorYearAudited: 10800000,
    notes: 'Statutory warrant costs and overdue recovery notices issued',
  },
  {
    id: 'rev-03',
    code: '4201',
    title: 'Annual Trade & Business Operation Licenses',
    category: 'Trade Licenses',
    budgetAnnual: 28000000,
    actualYTD: 22800000,
    q1Actual: 12100000,
    q2Actual: 5800000,
    q3Actual: 4900000,
    priorYearAudited: 26100000,
    notes: 'Licenses for grocery stores, restaurants, pharmacies, hardware and retail outlets',
  },
  {
    id: 'rev-04',
    code: '4202',
    title: 'Dangerous & Offensive Trade Licensure (Manufacturing & Heavy Industry)',
    category: 'Trade Licenses',
    budgetAnnual: 14000000,
    actualYTD: 11250000,
    q1Actual: 4200000,
    q2Actual: 3600000,
    q3Actual: 3450000,
    priorYearAudited: 13200000,
    notes: 'Timber sawmills, paint factories, tyre service centres, chemical depots',
  },
  {
    id: 'rev-05',
    code: '4301',
    title: 'Municipal Public Market Stall Rentals (Homagama & Meegoda)',
    category: 'Property Rents',
    budgetAnnual: 15000000,
    actualYTD: 11300000,
    q1Actual: 3800000,
    q2Actual: 3750000,
    q3Actual: 3750000,
    priorYearAudited: 14400000,
    notes: '184 active municipal market stalls and retail boutique leases',
  },
  {
    id: 'rev-06',
    code: '4302',
    title: 'Council Civic Auditorium, Reception Hall & Ground Bookings',
    category: 'Property Rents',
    budgetAnnual: 5500000,
    actualYTD: 4150000,
    q1Actual: 1000000,
    q2Actual: 1600000,
    q3Actual: 1550000,
    priorYearAudited: 4900000,
    notes: 'Pradeshiya Sabha Central Town Hall and sports grounds hires',
  },
  {
    id: 'rev-07',
    code: '4401',
    title: 'Building Plan Approvals & Development Permit Fees',
    category: 'Service Fees',
    budgetAnnual: 9000000,
    actualYTD: 6850000,
    q1Actual: 2200000,
    q2Actual: 2450000,
    q3Actual: 2200000,
    priorYearAudited: 8400000,
    notes: 'Planning clearances, boundary wall certifications, sub-division permits',
  },
  {
    id: 'rev-08',
    code: '4402',
    title: 'Gully Bowser & Septic Waste Removal Charges',
    category: 'Service Fees',
    budgetAnnual: 4500000,
    actualYTD: 3400000,
    q1Actual: 1100000,
    q2Actual: 1150000,
    q3Actual: 1150000,
    priorYearAudited: 4100000,
    notes: 'Commercial and residential cesspool extraction services by council bowsers',
  },
  {
    id: 'rev-09',
    code: '4501',
    title: 'Western Provincial Council Recurrent Salary Grant',
    category: 'Government Grants',
    budgetAnnual: 18000000,
    actualYTD: 13500000,
    q1Actual: 4500000,
    q2Actual: 4500000,
    q3Actual: 4500000,
    priorYearAudited: 17500000,
    notes: 'Provincial treasury contribution for public officer emoluments and pensions',
  },
  {
    id: 'rev-10',
    code: '4502',
    title: 'Decentralized Ward Infrastructure Development Subsidies',
    category: 'Government Grants',
    budgetAnnual: 12000000,
    actualYTD: 8750000,
    q1Actual: 2400000,
    q2Actual: 3200000,
    q3Actual: 3150000,
    priorYearAudited: 11200000,
    notes: 'Grants earmarked for rural culverts, concrete byroads, and street drains',
  },
  {
    id: 'rev-11',
    code: '4601',
    title: 'Interest on Bank Fixed Deposits & Treasury Call Accounts',
    category: 'Miscellaneous',
    budgetAnnual: 3500000,
    actualYTD: 2820000,
    q1Actual: 900000,
    q2Actual: 960000,
    q3Actual: 960000,
    priorYearAudited: 3100000,
    notes: 'Earnings from short-term statutory treasury deposits at Bank of Ceylon',
  },
  {
    id: 'rev-12',
    code: '4602',
    title: 'Tender Application Fees & Asset Auction Disposals',
    category: 'Miscellaneous',
    budgetAnnual: 2500000,
    actualYTD: 1880000,
    q1Actual: 550000,
    q2Actual: 690000,
    q3Actual: 640000,
    priorYearAudited: 2350000,
    notes: 'Non-refundable tender document fees and scrap metal / obsolete vehicle auctions',
  },
]

export const EXPENDITURE_ITEMS: ExpenditureLineItem[] = [
  {
    id: 'exp-01',
    code: '5101',
    title: 'Personal Emoluments (Council Staff Salaries, Wages & Overtime)',
    category: 'Personal Emoluments',
    budgetAnnual: 62000000,
    actualYTD: 47600000,
    q1Actual: 15550000,
    q2Actual: 16350000,
    q3Actual: 15700000,
    priorYearAudited: 59400000,
    notes: 'Includes 184 permanent and casual municipal employees across all divisions',
  },
  {
    id: 'exp-02',
    code: '5102',
    title: 'Council Statutory Contributions (EPF 12% & ETF 3%)',
    category: 'Personal Emoluments',
    budgetAnnual: 8500000,
    actualYTD: 6420000,
    q1Actual: 2100000,
    q2Actual: 2200000,
    q3Actual: 2120000,
    priorYearAudited: 8100000,
    notes: 'Mandatory employer provident fund contributions remitted to Central Bank',
  },
  {
    id: 'exp-03',
    code: '5201',
    title: 'Maintenance of Municipal Roads, Culverts & Byroad Concreting',
    category: 'Infrastructure Works',
    budgetAnnual: 32000000,
    actualYTD: 24500000,
    q1Actual: 7200000,
    q2Actual: 8800000,
    q3Actual: 8500000,
    priorYearAudited: 29800000,
    notes: 'Tarring, asphalt patching, concrete paving, and monsoon drain cleaning',
  },
  {
    id: 'exp-04',
    code: '5202',
    title: 'Public Parks, Playgrounds & Crematorium Upkeep',
    category: 'Infrastructure Works',
    budgetAnnual: 6000000,
    actualYTD: 4450000,
    q1Actual: 1400000,
    q2Actual: 1550000,
    q3Actual: 1500000,
    priorYearAudited: 5600000,
    notes: 'Gas supply and mechanical upkeep of Homagama General Cemetery crematorium',
  },
  {
    id: 'exp-05',
    code: '5301',
    title: 'Vehicular Fuel (Diesel & Petrol for Waste Fleet & Heavy Plant)',
    category: 'Vehicular Fleet',
    budgetAnnual: 18000000,
    actualYTD: 14650000,
    q1Actual: 4750000,
    q2Actual: 5100000,
    q3Actual: 4800000,
    priorYearAudited: 16900000,
    notes: 'Procurement from Ceypetco under government fuel quota and corporate card',
  },
  {
    id: 'exp-06',
    code: '5302',
    title: 'Fleet Repairs, Lubricants, Tyres & Scheduled Workshop Maintenance',
    category: 'Vehicular Fleet',
    budgetAnnual: 7500000,
    actualYTD: 5800000,
    q1Actual: 1800000,
    q2Actual: 2100000,
    q3Actual: 1900000,
    priorYearAudited: 7100000,
    notes: 'Hydraulic ram repairs on waste compactors and heavy excavator servicing',
  },
  {
    id: 'exp-07',
    code: '5401',
    title: 'Solid Waste Collection Operations & Landfill Transfer Fees',
    category: 'Solid Waste',
    budgetAnnual: 16500000,
    actualYTD: 12450000,
    q1Actual: 4000000,
    q2Actual: 4300000,
    q3Actual: 4150000,
    priorYearAudited: 15800000,
    notes: 'Tipping fees at Karadiyana / Aruwakkalu transfer and outsourced collection crews',
  },
  {
    id: 'exp-08',
    code: '5402',
    title: 'Public Health, Dengue Control & Disinfection Campaigns',
    category: 'Solid Waste',
    budgetAnnual: 3500000,
    actualYTD: 2650000,
    q1Actual: 800000,
    q2Actual: 950000,
    q3Actual: 900000,
    priorYearAudited: 3200000,
    notes: 'Chemical fogging machines, larvicide granules, and sanitary inspection logistics',
  },
  {
    id: 'exp-09',
    code: '5501',
    title: 'Street Lighting Electricity Bills (Ceylon Electricity Board)',
    category: 'Street Lighting & Utilities',
    budgetAnnual: 12500000,
    actualYTD: 8750000,
    q1Actual: 2800000,
    q2Actual: 3000000,
    q3Actual: 2950000,
    priorYearAudited: 11900000,
    notes: 'Tariff settlement for 4,200 municipal public streetlight poles across Homagama',
  },
  {
    id: 'exp-10',
    code: '5502',
    title: 'Water Supply & Council Complex Utilities',
    category: 'Street Lighting & Utilities',
    budgetAnnual: 2500000,
    actualYTD: 1840000,
    q1Actual: 580000,
    q2Actual: 640000,
    q3Actual: 620000,
    priorYearAudited: 2300000,
    notes: 'National Water Supply and Drainage Board bills for head office and ward centers',
  },
  {
    id: 'exp-11',
    code: '5601',
    title: 'General Office Administration, Stationery, Printing & Legal Expenses',
    category: 'General Administration',
    budgetAnnual: 5500000,
    actualYTD: 4180000,
    q1Actual: 1350000,
    q2Actual: 1450000,
    q3Actual: 1380000,
    priorYearAudited: 5100000,
    notes: 'Rate assessment notice printing, paper registers, courier and legal counsel fees',
  },
  {
    id: 'exp-12',
    code: '5602',
    title: 'Council Sessions, Member Allowances & Audit Oversight Charges',
    category: 'General Administration',
    budgetAnnual: 4000000,
    actualYTD: 2950000,
    q1Actual: 950000,
    q2Actual: 1000000,
    q3Actual: 1000000,
    priorYearAudited: 3800000,
    notes: 'Monthly statutory council meetings, finance committee sessions, and Auditor General fees',
  },
]

// ── 2. Balance Sheet Dataset ──────────────────────────────────────────────

export const BALANCE_SHEET_SECTIONS: BalanceSheetSection[] = [
  {
    title: 'Current Assets',
    category: 'Current Assets',
    items: [
      { id: 'ca-01', code: '1101', name: 'Cash at Bank — BOC Current Operating A/C #0004128910', currentYearAmount: 28450000, priorYearAmount: 24100000, noteNumber: 'Note 01' },
      { id: 'ca-02', code: '1102', name: "Cash at Bank — People's Bank Capital Fund A/C #2041001928", currentYearAmount: 18250000, priorYearAmount: 16500000, noteNumber: 'Note 01' },
      { id: 'ca-03', code: '1103', name: 'Cash at Bank — Commercial Bank Escrow Rates A/C #8810294101', currentYearAmount: 7500000, priorYearAmount: 6200000, noteNumber: 'Note 01' },
      { id: 'ca-04', code: '1104', name: 'Petty Cash Imprest & Cashier Floats', currentYearAmount: 250000, priorYearAmount: 250000, noteNumber: 'Note 01' },
      { id: 'ca-05', code: '1201', name: 'Assessment Rates Arrears Receivable', currentYearAmount: 31000000, priorYearAmount: 28500000, noteNumber: 'Note 02' },
      { id: 'ca-06', code: '1202', name: 'Trade Licensing & Market Stall Rental Receivables', currentYearAmount: 6850000, priorYearAmount: 5900000, noteNumber: 'Note 02' },
      { id: 'ca-07', code: '1301', name: 'Inventories & Maintenance Stores (Asphalt, Spares, Stationery)', currentYearAmount: 4650000, priorYearAmount: 4100000, noteNumber: 'Note 03' },
    ],
    totalCurrentYear: 96950000,
    totalPriorYear: 85550000,
  },
  {
    title: 'Non-Current Assets (Fixed Capital Assets)',
    category: 'Non-Current Assets',
    items: [
      { id: 'nca-01', code: '1501', name: 'Civic Buildings, Secretariat & Public Market Complexes (At Cost)', currentYearAmount: 215000000, priorYearAmount: 215000000, noteNumber: 'Note 04' },
      { id: 'nca-02', code: '1502', name: 'Public Infrastructure (Bridges, Drainage Canals & Road Networks)', currentYearAmount: 185000000, priorYearAmount: 168000000, noteNumber: 'Note 04' },
      { id: 'nca-03', code: '1503', name: 'Vehicular Fleet & Heavy Municipal Plant (14 Compactors, 6 Tractors)', currentYearAmount: 78500000, priorYearAmount: 72000000, noteNumber: 'Note 05' },
      { id: 'nca-04', code: '1504', name: 'Office Furniture, IT Infrastructure & Computerized Billing Servers', currentYearAmount: 12500000, priorYearAmount: 10800000, noteNumber: 'Note 05' },
      { id: 'nca-05', code: '1599', name: 'Less: Accumulated Depreciation on Capital Assets', currentYearAmount: -105000000, priorYearAmount: -89000000, noteNumber: 'Note 06' },
    ],
    totalCurrentYear: 386000000,
    totalPriorYear: 376800000,
  },
  {
    title: 'Current Liabilities',
    category: 'Current Liabilities',
    items: [
      { id: 'cl-01', code: '2101', name: 'Accounts Payable & Trade Creditors (Ceypetco, CEB, Suppliers)', currentYearAmount: 9850000, priorYearAmount: 8400000, noteNumber: 'Note 07' },
      { id: 'cl-02', code: '2102', name: 'Contractor Retention Monies Held on Civil Works Contracts', currentYearAmount: 14200000, priorYearAmount: 12800000, noteNumber: 'Note 08' },
      { id: 'cl-03', code: '2103', name: 'Refundable Tender, Hall Booking & Development Security Deposits', currentYearAmount: 6400000, priorYearAmount: 5900000, noteNumber: 'Note 08' },
      { id: 'cl-04', code: '2104', name: 'Accrued Operating Expenses & Statutory Remittances Due', currentYearAmount: 4500000, priorYearAmount: 4100000, noteNumber: 'Note 09' },
    ],
    totalCurrentYear: 34950000,
    totalPriorYear: 31200000,
  },
  {
    title: 'Long-Term Liabilities',
    category: 'Long-Term Liabilities',
    items: [
      { id: 'ltl-01', code: '2501', name: 'Provincial Local Government Development Fund Loans (Roads)', currentYearAmount: 18500000, priorYearAmount: 22000000, noteNumber: 'Note 10' },
      { id: 'ltl-02', code: '2502', name: 'Provision for Staff Retirement Gratuity (Actuarial Valuation)', currentYearAmount: 24500000, priorYearAmount: 21800000, noteNumber: 'Note 11' },
    ],
    totalCurrentYear: 43000000,
    totalPriorYear: 43800000,
  },
  {
    title: 'Municipal Equity & Fund Balances',
    category: 'Municipal Equity & Fund Balances',
    items: [
      { id: 'eq-01', code: '3101', name: 'General Municipal Accumulated Fund (Balance B/F)', currentYearAmount: 295800000, priorYearAmount: 278500000, noteNumber: 'Note 12' },
      { id: 'eq-02', code: '3201', name: 'Capital Infrastructure Development Reserve Fund', currentYearAmount: 65000000, priorYearAmount: 65000000, noteNumber: 'Note 12' },
      { id: 'eq-03', code: '3301', name: 'Ward Decentralized Infrastructure Allocation Fund', currentYearAmount: 25700000, priorYearAmount: 24800000, noteNumber: 'Note 12' },
      { id: 'eq-04', code: '3401', name: 'Current Period Net Operating Surplus (from I&E Statement)', currentYearAmount: 18500000, priorYearAmount: 19050000, noteNumber: 'Note 13' },
    ],
    totalCurrentYear: 405000000,
    totalPriorYear: 387350000,
  },
]

// ── 3. Trial Balance Dataset ───────────────────────────────────────────────
// Verifies instant double-entry equality: Total Debits === Total Credits

export const TRIAL_BALANCE_ACCOUNTS: TrialBalanceAccount[] = [
  // 1000 Assets (Normal Debit)
  { code: '1101', name: 'Cash at Bank — BOC Current Operating A/C', type: 'Asset', debit: 28450000, credit: 0 },
  { code: '1102', name: "Cash at Bank — People's Bank Capital Fund A/C", type: 'Asset', debit: 18250000, credit: 0 },
  { code: '1103', name: 'Cash at Bank — Commercial Bank Escrow Rates A/C', type: 'Asset', debit: 7500000, credit: 0 },
  { code: '1104', name: 'Petty Cash Imprest & Cashier Operating Floats', type: 'Asset', debit: 250000, credit: 0 },
  { code: '1201', name: 'Assessment Rates Arrears Receivable Control', type: 'Asset', debit: 31000000, credit: 0 },
  { code: '1202', name: 'Trade Licensing & Market Stall Rental Receivables', type: 'Asset', debit: 6850000, credit: 0 },
  { code: '1301', name: 'Municipal Maintenance Stores & Fuel Inventory', type: 'Asset', debit: 4650000, credit: 0 },
  { code: '1501', name: 'Civic Buildings & Public Secretariat Complexes', type: 'Asset', debit: 215000000, credit: 0 },
  { code: '1502', name: 'Public Infrastructure (Bridges, Drainage & Roads)', type: 'Asset', debit: 185000000, credit: 0 },
  { code: '1503', name: 'Vehicular Fleet & Heavy Municipal Machinery', type: 'Asset', debit: 78500000, credit: 0 },
  { code: '1504', name: 'Office Furniture, IT Infrastructure & Servers', type: 'Asset', debit: 12500000, credit: 0 },

  // Contra-asset / Accumulated Depreciation (Credit)
  { code: '1599', name: 'Accumulated Depreciation on Capital Assets', type: 'Asset', debit: 0, credit: 105000000 },

  // 2000 Liabilities (Normal Credit)
  { code: '2101', name: 'Accounts Payable & Trade Creditors Control', type: 'Liability', debit: 0, credit: 9850000 },
  { code: '2102', name: 'Contractor Retention Monies Payable', type: 'Liability', debit: 0, credit: 14200000 },
  { code: '2103', name: 'Refundable Tender, Hall & Security Deposits', type: 'Liability', debit: 0, credit: 6400000 },
  { code: '2104', name: 'Accrued Operating Expenses & Payroll Payables', type: 'Liability', debit: 0, credit: 4500000 },
  { code: '2501', name: 'Provincial Local Government Loan Account', type: 'Liability', debit: 0, credit: 18500000 },
  { code: '2502', name: 'Provision for Staff Retirement Gratuity', type: 'Liability', debit: 0, credit: 24500000 },

  // 3000 Equity / Fund Balances (Normal Credit)
  { code: '3101', name: 'General Municipal Accumulated Fund B/F', type: 'Equity', debit: 0, credit: 295800000 },
  { code: '3201', name: 'Capital Infrastructure Development Reserve', type: 'Equity', debit: 0, credit: 65000000 },
  { code: '3301', name: 'Ward Decentralized Infrastructure Allocation Fund', type: 'Equity', debit: 0, credit: 25700000 },

  // 4000 Revenue (Normal Credit)
  { code: '4101', name: 'General Assessment Rates Revenue YTD', type: 'Revenue', debit: 0, credit: 89000000 },
  { code: '4102', name: 'Assessment Rates Surcharges & Warrant Fees', type: 'Revenue', debit: 0, credit: 8450000 },
  { code: '4201', name: 'Trade & Commercial Licensing Fees', type: 'Revenue', debit: 0, credit: 22800000 },
  { code: '4202', name: 'Dangerous & Heavy Trade License Fees', type: 'Revenue', debit: 0, credit: 11250000 },
  { code: '4301', name: 'Municipal Public Market Stall Rentals', type: 'Revenue', debit: 0, credit: 11300000 },
  { code: '4302', name: 'Civic Auditorium & Ground Hire Charges', type: 'Revenue', debit: 0, credit: 4150000 },
  { code: '4401', name: 'Building Development Clearances & Permits', type: 'Revenue', debit: 0, credit: 6850000 },
  { code: '4402', name: 'Gully Bowser Cesspool Clearance Fees', type: 'Revenue', debit: 0, credit: 3400000 },
  { code: '4501', name: 'Western Provincial Recurrent Salary Subsidy', type: 'Revenue', debit: 0, credit: 13500000 },
  { code: '4502', name: 'Decentralized Ward Development Capital Grant', type: 'Revenue', debit: 0, credit: 8750000 },
  { code: '4601', name: 'Interest on Statutory Bank Fixed Deposits', type: 'Revenue', debit: 0, credit: 2820000 },
  { code: '4602', name: 'Tender Application Fees & Disposals', type: 'Revenue', debit: 0, credit: 1880000 },

  // 5000 Expenses (Normal Debit)
  { code: '5101', name: 'Personal Emoluments (Salaries & Overtime)', type: 'Expense', debit: 47600000, credit: 0 },
  { code: '5102', name: 'EPF (12%) & ETF (3%) Council Contributions', type: 'Expense', debit: 6420000, credit: 0 },
  { code: '5201', name: 'Municipal Road Maintenance & Tarring Works', type: 'Expense', debit: 24500000, credit: 0 },
  { code: '5202', name: 'Public Parks & Crematorium Operating Upkeep', type: 'Expense', debit: 4450000, credit: 0 },
  { code: '5301', name: 'Vehicular Fuel (Compactor Diesel & Patrol)', type: 'Expense', debit: 14650000, credit: 0 },
  { code: '5302', name: 'Fleet Workshop Servicing & Tyre Overhauls', type: 'Expense', debit: 5800000, credit: 0 },
  { code: '5401', name: 'Solid Waste Landfill Transfer & Haulage', type: 'Expense', debit: 12450000, credit: 0 },
  { code: '5402', name: 'Public Sanitation & Dengue Epidemic Control', type: 'Expense', debit: 2650000, credit: 0 },
  { code: '5501', name: 'Street Lighting Power Tariff (CEB)', type: 'Expense', debit: 8750000, credit: 0 },
  { code: '5502', name: 'Council Building Water & Power Utilities', type: 'Expense', debit: 1840000, credit: 0 },
  { code: '5601', name: 'Administration, Stationery & Legal Fees', type: 'Expense', debit: 4180000, credit: 0 },
  { code: '5602', name: 'Council Sessions, Allowances & Audit Audit Fees', type: 'Expense', debit: 2950000, credit: 0 },
]

// ── 4. Assessment Collection Efficiency Report Dataset ────────────────────

export const WARD_ASSESSMENT_RECORDS: WardAssessmentRecord[] = [
  {
    wardNumber: 'Ward 01',
    wardName: 'Homagama North',
    inspectorOfficer: 'K. L. Sunil Shantha (Revenue Inspector II)',
    totalRateableProperties: 3420,
    annualWarrantDemand: 10200000,
    collectedYTD: 8364000,
    arrearsOutstanding: 1836000,
    efficiencyPercentage: 82.0,
    lastAuditDate: '2026-09-18',
    status: 'High Efficiency',
  },
  {
    wardNumber: 'Ward 02',
    wardName: 'Homagama Town Central',
    inspectorOfficer: 'M. S. Gamini Perera (Senior Revenue Officer)',
    totalRateableProperties: 4850,
    annualWarrantDemand: 26500000,
    collectedYTD: 22790000,
    arrearsOutstanding: 3710000,
    efficiencyPercentage: 86.0,
    lastAuditDate: '2026-09-19',
    status: 'High Efficiency',
  },
  {
    wardNumber: 'Ward 03',
    wardName: 'Godagama Commercial Zone',
    inspectorOfficer: 'D. Priyantha Alwis (Revenue Inspector I)',
    totalRateableProperties: 3920,
    annualWarrantDemand: 16800000,
    collectedYTD: 13272000,
    arrearsOutstanding: 3528000,
    efficiencyPercentage: 79.0,
    lastAuditDate: '2026-09-16',
    status: 'Satisfactory',
  },
  {
    wardNumber: 'Ward 04',
    wardName: 'Katuwawala Residential',
    inspectorOfficer: 'H. Nimal Jayawardena (Revenue Inspector II)',
    totalRateableProperties: 4100,
    annualWarrantDemand: 11400000,
    collectedYTD: 9234000,
    arrearsOutstanding: 2166000,
    efficiencyPercentage: 81.0,
    lastAuditDate: '2026-09-18',
    status: 'High Efficiency',
  },
  {
    wardNumber: 'Ward 05',
    wardName: 'Pitipana North (Campus Perimeter)',
    inspectorOfficer: 'T. Chaminda Ranasinghe (Revenue Inspector III)',
    totalRateableProperties: 2840,
    annualWarrantDemand: 8200000,
    collectedYTD: 6068000,
    arrearsOutstanding: 2132000,
    efficiencyPercentage: 74.0,
    lastAuditDate: '2026-09-14',
    status: 'Satisfactory',
  },
  {
    wardNumber: 'Ward 06',
    wardName: 'Pitipana South Semi-Urban',
    inspectorOfficer: 'W. A. Chandrasena (Revenue Inspector I)',
    totalRateableProperties: 2650,
    annualWarrantDemand: 7100000,
    collectedYTD: 4828000,
    arrearsOutstanding: 2272000,
    efficiencyPercentage: 68.0,
    lastAuditDate: '2026-09-12',
    status: 'Collection Lag',
  },
  {
    wardNumber: 'Ward 07',
    wardName: 'Magammana Rural Extension',
    inspectorOfficer: 'S. Bandara Dissanayake (Revenue Inspector II)',
    totalRateableProperties: 2180,
    annualWarrantDemand: 5600000,
    collectedYTD: 3696000,
    arrearsOutstanding: 1904000,
    efficiencyPercentage: 66.0,
    lastAuditDate: '2026-09-11',
    status: 'Collection Lag',
  },
  {
    wardNumber: 'Ward 08',
    wardName: 'Pitipana Techno City & Industrial Hub',
    inspectorOfficer: 'R. M. Anura Kumara (Senior Revenue Officer)',
    totalRateableProperties: 3120,
    annualWarrantDemand: 19800000,
    collectedYTD: 17622000,
    arrearsOutstanding: 2178000,
    efficiencyPercentage: 89.0,
    lastAuditDate: '2026-09-19',
    status: 'High Efficiency',
  },
  {
    wardNumber: 'Ward 09',
    wardName: 'Meegoda Agrarian & Wholesale Market',
    inspectorOfficer: 'K. G. Sarath Kumara (Revenue Inspector I)',
    totalRateableProperties: 3340,
    annualWarrantDemand: 9500000,
    collectedYTD: 7315000,
    arrearsOutstanding: 2185000,
    efficiencyPercentage: 77.0,
    lastAuditDate: '2026-09-15',
    status: 'Satisfactory',
  },
  {
    wardNumber: 'Ward 10',
    wardName: 'Panagoda Industrial & Cantonment',
    inspectorOfficer: 'E. J. Dayananda (Revenue Inspector II)',
    totalRateableProperties: 3100,
    annualWarrantDemand: 10400000,
    collectedYTD: 7800000,
    arrearsOutstanding: 2600000,
    efficiencyPercentage: 75.0,
    lastAuditDate: '2026-09-17',
    status: 'Satisfactory',
  },
  {
    wardNumber: 'Ward 11',
    wardName: 'Habarakada Sub-Urban Expansion',
    inspectorOfficer: 'A. P. Upul Senarath (Revenue Inspector III)',
    totalRateableProperties: 2790,
    annualWarrantDemand: 6900000,
    collectedYTD: 4209000,
    arrearsOutstanding: 2691000,
    efficiencyPercentage: 61.0,
    lastAuditDate: '2026-09-10',
    status: 'Critical Attention',
  },
  {
    wardNumber: 'Ward 12',
    wardName: 'Mattegoda Housing Scheme',
    inspectorOfficer: 'V. K. Nihal Fernando (Senior Revenue Officer)',
    totalRateableProperties: 4620,
    annualWarrantDemand: 13500000,
    collectedYTD: 11475000,
    arrearsOutstanding: 2025000,
    efficiencyPercentage: 85.0,
    lastAuditDate: '2026-09-18',
    status: 'High Efficiency',
  },
]
