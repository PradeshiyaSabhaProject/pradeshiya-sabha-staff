/*
 * Default Trade License configuration.
 *
 * Only values that are written in the requirements PDF are marked `confirmed: true`.
 * Everything else is a configurable placeholder (null amount or `confirmed: false`) and
 * the UI asks an authorised officer to confirm before it is applied. No fee values are
 * invented here.
 */
import type {
  ApprovalStage,
  BusinessCategory,
  ChecklistTemplate,
  Designation,
  InspectionType,
  TradeLicenseSettings,
} from '../types/tradeLicense'

export const INSPECTION_TYPE_LABELS: Record<InspectionType, string> = {
  RI_BYLAW: 'RI On-Site By-Law Inspection',
  PHI: 'PHI Sanitary / Health Inspection',
  ENVIRONMENTAL: 'Environmental Inspection',
  FIRE: 'Fire Safety Approval',
}

/** Which officer submits the report for each inspection type. */
export const INSPECTION_TYPE_DESIGNATION: Record<InspectionType, Designation> = {
  RI_BYLAW: 'Revenue Inspector',
  PHI: 'Public Health Inspector',
  ENVIRONMENTAL: 'Environmental Officer',
  FIRE: 'Fire Safety Officer',
}

export const APPROVAL_STAGE_LABELS: Record<ApprovalStage, string> = {
  RI_VERIFICATION: 'Revenue Inspector Verification',
  CHIEF_INSPECTOR: 'Chief Inspector Review',
  SECRETARY: 'Secretary Endorsement',
  CHAIRMAN: 'Chairman Final Approval',
}

export const APPROVAL_STAGE_SHORT: Record<ApprovalStage, string> = {
  RI_VERIFICATION: 'RI',
  CHIEF_INSPECTOR: 'CI',
  SECRETARY: 'Secretary',
  CHAIRMAN: 'Chairman',
}

export const APPROVAL_STAGE_DESIGNATION: Record<ApprovalStage, Designation> = {
  RI_VERIFICATION: 'Revenue Inspector',
  CHIEF_INSPECTOR: 'Chief Inspector',
  SECRETARY: 'Secretary',
  CHAIRMAN: 'Chairman',
}

export const ALL_APPROVAL_STAGES: ApprovalStage[] = ['RI_VERIFICATION', 'CHIEF_INSPECTOR', 'SECRETARY', 'CHAIRMAN']

export const DEFAULT_SETTINGS: TradeLicenseSettings = {
  // Requirements table: "Annual assessment value | Trade licence" — only ">1500 → 1000" is filled in.
  feeBands: [
    { id: 'band-500', label: '500', minExclusive: null, maxInclusive: 500, licenseFee: null, confirmed: false },
    { id: 'band-750', label: '750', minExclusive: 500, maxInclusive: 750, licenseFee: null, confirmed: false },
    { id: 'band-1000', label: '1000', minExclusive: 750, maxInclusive: 1000, licenseFee: null, confirmed: false },
    { id: 'band-1500', label: '>1500', minExclusive: 1500, maxInclusive: null, licenseFee: 1000, confirmed: true },
  ],
  touristHotelTurnoverRate: 0.01,
  stampDutyRate: 0.1,
  stampDutyCap: 2000,
  processingFee: { amount: null, confirmed: false },
  allowPartialPayments: false,
  partialPaymentsConfirmed: false,
  validityEndsDec31: true,
  validityConfirmed: false,
  // Diagram: RI → Chief Inspector → Secretary → Chairman. Page 1 omits the CI, so unconfirmed.
  approvalChain: ['RI_VERIFICATION', 'CHIEF_INSPECTOR', 'SECRETARY', 'CHAIRMAN'],
  approvalChainConfirmed: false,
  correctionDeadlineDays: 14,
  legalNoticeDays: 14,
  overdueApplicationDays: 30,
  overdueApplicationDaysConfirmed: false,
  voteCodes: { PROCESSING_FEE: '', LICENSE_FEE: '', STAMP_DUTY: '' },
}

const BASE_DOCUMENTS = ['Completed application form (Part A)', "Copy of applicant's NIC"]

// Categories follow the inspection areas listed in the requirements. The PDF states the
// final approval matrix must define which inspections are mandatory, so all are unconfirmed.
export const DEFAULT_CATEGORIES: BusinessCategory[] = [
  {
    id: 'cat-general',
    name: 'General Trade / Retail',
    description: 'Standard trades that do not need PHI/MOH clearance.',
    requiredInspections: ['RI_BYLAW'],
    mohSignOffRequired: false,
    approvalStages: [],
    requiredDocuments: [...BASE_DOCUMENTS],
    active: true,
    confirmed: false,
  },
  {
    id: 'cat-food',
    name: 'Food & Restaurant Operations',
    description: 'Food / eating houses – PHI inspection with MOH-signed report.',
    requiredInspections: ['RI_BYLAW', 'PHI'],
    mohSignOffRequired: true,
    approvalStages: [],
    requiredDocuments: [...BASE_DOCUMENTS],
    active: true,
    confirmed: false,
  },
  {
    id: 'cat-hotel',
    name: 'Hotels & Lodging',
    description: 'Hotels. Tourist Board registered hotels are charged 1% of previous year turnover.',
    requiredInspections: ['RI_BYLAW', 'PHI'],
    mohSignOffRequired: true,
    approvalStages: [],
    requiredDocuments: [...BASE_DOCUMENTS, 'Tourist Board registration certificate (if registered)'],
    active: true,
    confirmed: false,
  },
  {
    id: 'cat-salon',
    name: 'Salons & Personal Care',
    description: 'Salons – public health and sanitation review.',
    requiredInspections: ['RI_BYLAW', 'PHI'],
    mohSignOffRequired: true,
    approvalStages: [],
    requiredDocuments: [...BASE_DOCUMENTS],
    active: true,
    confirmed: false,
  },
  {
    id: 'cat-chemical',
    name: 'Chemical-Related / Dangerous & Offensive Trades',
    description: 'Chemical-related activities – health, environmental and fire approvals.',
    requiredInspections: ['RI_BYLAW', 'PHI', 'ENVIRONMENTAL', 'FIRE'],
    mohSignOffRequired: true,
    approvalStages: [],
    requiredDocuments: [...BASE_DOCUMENTS],
    active: true,
    confirmed: false,
  },
]

const item = (id: string, label: string) => ({ id, label, mandatory: true })

// Checklist items are drafted only from wording in the requirements document and workflow
// diagram. By-law conditions must be supplied by the Pradeshiya Sabha – all marked unconfirmed.
const RI_ITEMS = [
  item('ri-premises', 'Business operates at the registered premises'),
  item('ri-fire', 'Fire safety arrangements in place'),
  item('ri-layout', 'Building layout acceptable'),
  item('ri-nuisance', 'No public nuisance'),
  item('ri-ventilation', 'Proper ventilation'),
  item('ri-zoning', 'Statutory zoning complied with'),
]

const now = '2026-01-01T00:00:00.000Z'
const tpl = (categoryId: string, inspectionType: InspectionType, items: ReturnType<typeof item>[]): ChecklistTemplate => ({
  id: `chk-${categoryId}-${inspectionType}`.toLowerCase(),
  categoryId,
  inspectionType,
  items,
  confirmed: false,
  updatedAt: now,
})

export const DEFAULT_CHECKLISTS: ChecklistTemplate[] = [
  tpl('cat-general', 'RI_BYLAW', RI_ITEMS),
  tpl('cat-food', 'RI_BYLAW', RI_ITEMS),
  tpl('cat-food', 'PHI', [
    item('phi-food-safety', 'Food safety standards'),
    item('phi-medical', 'Medical certificates of food handlers'),
    item('phi-sanitation', 'Toilets and sanitation'),
    item('phi-cleanliness', 'Cleanliness of premises'),
    item('phi-wastewater', 'Wastewater / disposal arrangements'),
    item('phi-waste', 'Waste management standards'),
  ]),
  tpl('cat-hotel', 'RI_BYLAW', RI_ITEMS),
  tpl('cat-hotel', 'PHI', [
    item('phi-sanitation', 'Toilets and sanitation'),
    item('phi-cleanliness', 'Cleanliness of premises'),
    item('phi-wastewater', 'Wastewater / disposal arrangements'),
    item('phi-waste', 'Waste management standards'),
    item('phi-public-health', 'Public-health requirements'),
  ]),
  tpl('cat-salon', 'RI_BYLAW', RI_ITEMS),
  tpl('cat-salon', 'PHI', [
    item('phi-sanitation', 'Toilets and sanitation'),
    item('phi-cleanliness', 'Cleanliness of premises'),
    item('phi-waste', 'Waste management standards'),
    item('phi-public-health', 'Public-health requirements'),
  ]),
  tpl('cat-chemical', 'RI_BYLAW', RI_ITEMS),
  tpl('cat-chemical', 'PHI', [
    item('phi-public-health', 'Public-health requirements'),
    item('phi-wastewater', 'Wastewater / disposal arrangements'),
  ]),
  tpl('cat-chemical', 'ENVIRONMENTAL', [
    item('env-requirements', 'Environmental requirements met'),
    item('env-chemical', 'Chemical-related activity controls'),
    item('env-wastewater', 'Wastewater / disposal arrangements'),
  ]),
  tpl('cat-chemical', 'FIRE', [item('fire-approval', 'Fire-related approval obtained')]),
]

/** Designations each portal role may act as. Super/admin can act for any office. */
export const OPERATIONAL_DESIGNATIONS: Designation[] = [
  'Counter Officer',
  'Cashier',
  'Revenue Inspector',
  'Public Health Inspector',
  'Medical Officer of Health',
  'Environmental Officer',
  'Fire Safety Officer',
]

export const ALL_DESIGNATIONS: Designation[] = [
  ...OPERATIONAL_DESIGNATIONS,
  'Chief Inspector',
  'Secretary',
  'Chairman',
  'System Administrator',
]

export function designationsForRole(role?: string): Designation[] {
  if (role === 'superadmin' || role === 'admin') return ALL_DESIGNATIONS
  if (role === 'staff') return OPERATIONAL_DESIGNATIONS
  return []
}
