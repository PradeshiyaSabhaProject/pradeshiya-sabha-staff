import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  CheckCircle,
  RotateCcw,
  Clock,
  Eye,
  Building,
  User,
  MessageSquare,
  AlertCircle,
  AlertTriangle,
  X,
  FileText,
  Paperclip,
  Plus,
  Check,
  ShieldCheck,
  Upload,
  Search,
  Filter,
  Compass,
  Activity,
  Layers,
} from 'lucide-react'
import { useVaripanam } from '../context/VaripanamContext'
import type { PropertySubmission, PropertySubmissionPurpose, SubmissionDocument } from '../types/varipanam'
import NeedsConfirmationBadge from '../components/shared/NeedsConfirmationBadge'
import { formatLKR } from '../utils/formatters'

const OFFICER_PRESETS = [
  'S. K. Alahakoon (Revenue Inspector)',
  'M. D. Bandara (Legal & Title Officer)',
  'K. P. Jayawardena (Licensed Surveyor)',
  'G. Fernando (Town Planning Officer)',
  'H. M. Wickramasinghe (Secretary)',
  'K. Somapala (Chief Assessor)',
  'Subject Clerk (Revenue Division)',
  'Other',
]

const DOCUMENT_TYPES = [
  'Deed Plan',
  'Survey Plan',
  'Notary Report',
  'Certificate of Conformity (CoC)',
  'Approved Building & Site Plan',
  'ATD Application (Form ATD-1)',
  'Deed of Transfer',
  'Street Line Certificate',
  'Title Report',
  'Tax Clearance Certificate',
  'Ownership Declaration Affidavit',
  'Subdivision Approval Certificate',
  'Other Document',
]

export const getSubmissionPurposeBadge = (purpose?: PropertySubmissionPurpose) => {
  switch (purpose) {
    case 'OWNERSHIP_CHANGE':
      return {
        label: 'Ownership Change',
        shortLabel: 'Ownership Change',
        classes: 'bg-blue-100 text-blue-800 border-blue-200',
        dotClass: 'bg-blue-600',
      }
    case 'DESCRIPTION_CHANGE':
      return {
        label: 'Description Change',
        shortLabel: 'Desc Change',
        classes: 'bg-purple-100 text-purple-800 border-purple-200',
        dotClass: 'bg-purple-600',
      }
    case 'NEW_PROPERTY':
    default:
      return {
        label: 'New Property (New Number)',
        shortLabel: 'New Property',
        classes: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        dotClass: 'bg-emerald-600',
      }
  }
}

export const SUBMISSION_PHASES = [
  {
    step: 1,
    title: 'Phase 1: Application Intake',
    shortTitle: 'Intake & Lodgement',
    description: 'Initial application, cadastral coordinates & ownership filed',
    defaultOfficer: 'Subject Clerk (Revenue Division)',
  },
  {
    step: 2,
    title: 'Phase 2: Technical & Survey Review',
    shortTitle: 'Technical & Survey',
    description: 'Cadastral survey plan, boundary check & deed verification',
    defaultOfficer: 'K. P. Jayawardena (Licensed Surveyor) / M. D. Bandara (Legal)',
  },
  {
    step: 3,
    title: 'Phase 3: Valuation & Assessment',
    shortTitle: 'Valuation & Assessment',
    description: 'Physical inspection & annual rental value computation',
    defaultOfficer: 'S. K. Alahakoon (Revenue Inspector)',
  },
  {
    step: 4,
    title: 'Phase 4: Final Secretary Sign-off',
    shortTitle: 'Secretary Approval',
    description: 'Statutory approval and entry endorsement by Secretary',
    defaultOfficer: 'H. M. Wickramasinghe (Secretary)',
  },
  {
    step: 5,
    title: 'Phase 5: Registered & Cadastre Enrolled',
    shortTitle: 'Registered',
    description: 'Assessment register active, notice generated for tax collection',
    defaultOfficer: 'Cadastre System Administrator',
  },
]

export const getSubmissionPhaseInfo = (sub: PropertySubmission) => {
  let phase = sub.currentPhase
  let officer = sub.approvingOfficer

  if (!phase) {
    if (sub.status === 'APPROVED') {
      phase = 'Phase 5: Registered & Cadastre Enrolled'
    } else if (sub.status === 'SENT_BACK') {
      phase = 'Phase 2: Returned for Clarification'
    } else if (sub.status === 'DRAFT') {
      phase = 'Phase 1: Application Intake & Lodgement'
    } else {
      phase = 'Phase 4: Final Secretary Sign-off'
    }
  }

  if (!officer) {
    if (sub.status === 'APPROVED') {
      officer = 'H. M. Wickramasinghe (Secretary)'
    } else if (sub.status === 'DRAFT') {
      officer = 'Subject Clerk (Revenue Division)'
    } else {
      officer = 'H. M. Wickramasinghe (Secretary)'
    }
  }

  let stepNumber = 1
  if (phase.includes('Phase 1')) stepNumber = 1
  else if (phase.includes('Phase 2')) stepNumber = 2
  else if (phase.includes('Phase 3')) stepNumber = 3
  else if (phase.includes('Phase 4')) stepNumber = 4
  else if (phase.includes('Phase 5')) stepNumber = 5

  return { phase, officer, stepNumber }
}

export const ApprovalsPage: React.FC = () => {
  const {
    propertySubmissions,
    approveSubmission,
    sendBackSubmission,
    updateSubmissionDocuments,
  } = useVaripanam()

  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'track' ? 'track' : 'queue'
  const [activeTab, setActiveTab] = useState<'queue' | 'track'>(initialTab)
  const [selectedSubmission, setSelectedSubmission] = useState<PropertySubmission | null>(null)

  // Track Submissions search, filter & tracking modal states
  const [trackSearchQuery, setTrackSearchQuery] = useState<string>('')
  const [trackFilterOfficer, setTrackFilterOfficer] = useState<string>('ALL')
  const [trackFilterPhase, setTrackFilterPhase] = useState<string>('ALL')
  const [trackFilterPurpose, setTrackFilterPurpose] = useState<string>('ALL')
  const [trackingSubmission, setTrackingSubmission] = useState<PropertySubmission | null>(null)

  // Approval / Send back dialog states
  const [showSendBackDialog, setShowSendBackDialog] = useState<boolean>(false)
  const [sendBackMessage, setSendBackMessage] = useState<string>('')
  const [sendBackError, setSendBackError] = useState<string | null>(null)
  const [approveComment, setApproveComment] = useState<string>('')
  const [showApproveDialog, setShowApproveDialog] = useState<boolean>(false)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)

  // Document upload form state
  const [newDocName, setNewDocName] = useState<string>('')
  const [newDocType, setNewDocType] = useState<string>(DOCUMENT_TYPES[0])
  const [newDocOfficer, setNewDocOfficer] = useState<string>(OFFICER_PRESETS[0])
  const [customOfficerName, setCustomOfficerName] = useState<string>('')
  const [newDocNotes, setNewDocNotes] = useState<string>('')
  const [docUploadSuccess, setDocUploadSuccess] = useState<string | null>(null)
  const [docUploadError, setDocUploadError] = useState<string | null>(null)
  const [showAddDocForm, setShowAddDocForm] = useState<boolean>(false)

  // Document inspection modal state
  const [inspectingDoc, setInspectingDoc] = useState<SubmissionDocument | null>(null)
  const [docComment, setDocComment] = useState<string>('')
  const [docCommentError, setDocCommentError] = useState<string | null>(null)

  // Submissions waiting in queue (status: PENDING_APPROVAL)
  const queueSubmissions = propertySubmissions.filter((s) => s.status === 'PENDING_APPROVAL')

  // Submissions submitted / tracked
  const trackSubmissions = propertySubmissions

  // Helper to ensure submission documents array exists
  const getSubmissionDocs = (sub: PropertySubmission): SubmissionDocument[] => {
    if (sub.documents && sub.documents.length > 0) {
      return sub.documents
    }
    if (sub.attachments && sub.attachments.length > 0) {
      return sub.attachments.map((att, idx) => ({
        id: `doc-${sub.id}-${idx}`,
        name: att.name,
        type: att.type === 'Survey' ? 'Survey Plan' : att.type === 'Deed' ? 'Deed of Transfer' : att.type,
        assignedOfficer: idx === 0 ? 'K. P. Jayawardena (Licensed Surveyor)' : 'M. D. Bandara (Legal & Title Officer)',
        uploadedAt: sub.submittedAt,
        uploadedBy: sub.submittedBy,
        status: idx === 1 ? 'APPROVED' : 'PENDING',
        fileSize: '2.4 MB',
        officerComment: idx === 1 ? 'Verified against Land Registry records.' : undefined,
      }))
    }
    return []
  }

  const handleSelectSubmission = (sub: PropertySubmission) => {
    const docs = getSubmissionDocs(sub)
    setSelectedSubmission({ ...sub, documents: docs })
    setDocUploadError(null)
    setDocUploadSuccess(null)
  }

  const handleApprove = async () => {
    if (!selectedSubmission) return
    setIsProcessing(true)
    try {
      await approveSubmission(selectedSubmission.id, approveComment)
      setShowApproveDialog(false)
      setSelectedSubmission(null)
      setApproveComment('')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSendBack = async () => {
    if (!selectedSubmission) return
    if (!sendBackMessage || sendBackMessage.trim().length < 10) {
      setSendBackError('A specific reason for revision is REQUIRED (minimum 10 characters).')
      return
    }

    setIsProcessing(true)
    try {
      await sendBackSubmission(selectedSubmission.id, sendBackMessage.trim())
      setShowSendBackDialog(false)
      setSelectedSubmission(null)
      setSendBackMessage('')
      setSendBackError(null)
    } finally {
      setIsProcessing(false)
    }
  }

  // Add document handler
  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubmission) return
    setDocUploadError(null)
    setDocUploadSuccess(null)

    const finalName = newDocName.trim()
    if (!finalName) {
      setDocUploadError('Document title / filename is required.')
      return
    }

    const assignedOfficerName =
      newDocOfficer === 'Other' ? (customOfficerName.trim() || 'Assigned Officer') : newDocOfficer

    const newDoc: SubmissionDocument = {
      id: `doc-${Date.now()}`,
      name: finalName.includes('.') ? finalName : `${finalName}.pdf`,
      type: newDocType,
      assignedOfficer: assignedOfficerName,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Super Admin',
      status: 'PENDING',
      fileSize: `${(Math.random() * 2 + 1.2).toFixed(1)} MB`,
      officerComment: newDocNotes.trim() || undefined,
    }

    const currentDocs = getSubmissionDocs(selectedSubmission)
    const updatedDocs = [newDoc, ...currentDocs]

    updateSubmissionDocuments(selectedSubmission.id, updatedDocs)
    setSelectedSubmission({
      ...selectedSubmission,
      documents: updatedDocs,
    })

    setNewDocName('')
    setNewDocNotes('')
    setCustomOfficerName('')
    setDocUploadSuccess(`Document "${newDoc.name}" submitted and assigned to ${assignedOfficerName}!`)
    setShowAddDocForm(false)
    setTimeout(() => setDocUploadSuccess(null), 3500)
  }

  // Open Document Viewer
  const handleOpenDocViewer = (doc: SubmissionDocument) => {
    setInspectingDoc(doc)
    setDocComment(doc.officerComment || '')
    setDocCommentError(null)
  }

  // Approve Document
  const handleApproveDoc = () => {
    if (!selectedSubmission || !inspectingDoc) return
    const currentDocs = getSubmissionDocs(selectedSubmission)
    const updatedDocs = currentDocs.map((d) =>
      d.id === inspectingDoc.id
        ? {
          ...d,
          status: 'APPROVED' as const,
          officerComment: docComment.trim() || d.officerComment || 'Approved by inspecting officer.',
        }
        : d
    )

    updateSubmissionDocuments(selectedSubmission.id, updatedDocs)
    setSelectedSubmission({
      ...selectedSubmission,
      documents: updatedDocs,
    })
    setInspectingDoc(null)
  }

  // Flag Document Issue
  const handleFlagDocIssue = () => {
    if (!selectedSubmission || !inspectingDoc) return
    if (!docComment.trim()) {
      setDocCommentError('Please provide a specific comment explaining the issue for this document.')
      return
    }

    const currentDocs = getSubmissionDocs(selectedSubmission)
    const updatedDocs = currentDocs.map((d) =>
      d.id === inspectingDoc.id
        ? {
          ...d,
          status: 'HAS_ISSUE' as const,
          officerComment: docComment.trim(),
        }
        : d
    )

    updateSubmissionDocuments(selectedSubmission.id, updatedDocs)
    setSelectedSubmission({
      ...selectedSubmission,
      documents: updatedDocs,
    })
    setInspectingDoc(null)
  }

  const currentDocs = selectedSubmission ? getSubmissionDocs(selectedSubmission) : []
  const flaggedDocs = currentDocs.filter((d) => d.status === 'HAS_ISSUE')
  const approvedDocs = currentDocs.filter((d) => d.status === 'APPROVED')
  const pendingDocs = currentDocs.filter((d) => d.status === 'PENDING')

  // Approving officers list for Track filter
  const approvingOfficersList = Array.from(
    new Set(trackSubmissions.map((s) => getSubmissionPhaseInfo(s).officer))
  ).filter(Boolean)

  // Filter track submissions
  const filteredTrackSubmissions = trackSubmissions.filter((sub) => {
    const info = getSubmissionPhaseInfo(sub)

    if (trackSearchQuery.trim()) {
      const q = trackSearchQuery.toLowerCase()
      const match =
        sub.assessmentNumber.toLowerCase().includes(q) ||
        sub.propertyNumber.toLowerCase().includes(q) ||
        sub.ownerName.toLowerCase().includes(q) ||
        sub.ownerNic.toLowerCase().includes(q) ||
        sub.postalAddress.toLowerCase().includes(q) ||
        sub.description.toLowerCase().includes(q) ||
        info.phase.toLowerCase().includes(q) ||
        info.officer.toLowerCase().includes(q)
      if (!match) return false
    }

    if (trackFilterOfficer !== 'ALL') {
      if (info.officer !== trackFilterOfficer) return false
    }

    if (trackFilterPhase !== 'ALL') {
      if (!info.phase.toLowerCase().includes(trackFilterPhase.toLowerCase())) return false
    }

    if (trackFilterPurpose !== 'ALL') {
      const p = sub.submissionType || 'NEW_PROPERTY'
      if (p !== trackFilterPurpose) return false
    }

    return true
  })

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-gray-900 tracking-tight">
              Property Submissions & Approvals
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-[#A31736] border border-rose-200">
              {queueSubmissions.length} Pending In Queue
            </span>
            <NeedsConfirmationBadge tooltip="Approving designations are configurable in Settings (Default: Secretary, Revenue Inspector)." />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Two-stage validation pipeline: designated officers approve or send back new cadastral assessment units.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
          <button
            type="button"
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeTab === 'queue' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'hover:text-gray-900'
              }`}
          >
            Approval Queue ({queueSubmissions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('track')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeTab === 'track' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'hover:text-gray-900'
              }`}
          >
            Track Submissions ({trackSubmissions.length})
          </button>
        </div>
      </div>

      {/* ── Active Tab 1: Approval Queue View ── */}
      {activeTab === 'queue' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div>
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                Pending Approvals Queue
              </h2>
              <p className="text-[11px] text-gray-500">
                Submissions awaiting statutory review, document verification, and officer endorsement.
              </p>
            </div>
            <span className="text-xs font-bold text-gray-700 bg-white border border-gray-200 px-2.5 py-1 rounded-lg">
              {queueSubmissions.length} item{queueSubmissions.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-3.5">Assessment No</th>
                  <th className="p-3.5">Property Details</th>
                  <th className="p-3.5">Owner Name</th>
                  <th className="p-3.5">Submitted By</th>
                  <th className="p-3.5">Date & Waiting</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {queueSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500 font-medium">
                      No property submissions pending approval in the queue.
                    </td>
                  </tr>
                ) : (
                  queueSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3.5">
                        <span className="font-black text-gray-900 block">{sub.assessmentNumber}</span>
                        {(() => {
                          const badge = getSubmissionPurposeBadge(sub.submissionType)
                          return (
                            <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.classes}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                              <span>{badge.shortLabel}</span>
                            </span>
                          )
                        })()}
                      </td>
                      <td className="p-3.5">
                        <p className="font-semibold text-gray-800">{sub.propertyNumber}</p>
                        <p className="text-[11px] text-gray-400">{sub.propertyType}</p>
                      </td>
                      <td className="p-3.5">
                        <p className="font-semibold text-gray-800">{sub.ownerName}</p>
                        <p className="text-[11px] text-gray-400">{sub.ownerNic}</p>
                      </td>
                      <td className="p-3.5 font-medium">{sub.submittedBy}</td>
                      <td className="p-3.5">
                        <p>{new Date(sub.submittedAt).toLocaleDateString()}</p>
                        <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                          {sub.daysWaiting} days
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 whitespace-nowrap inline-block">
                          {sub.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleSelectSubmission(sub)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#A31736] bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Active Tab 2: Track Submissions View (Phase & Approving Officer Tracker) ── */}
      {activeTab === 'track' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={trackSearchQuery}
                  onChange={(e) => setTrackSearchQuery(e.target.value)}
                  placeholder="Search by assessment no, property, owner, or approving officer..."
                  className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#A31736] focus:bg-white transition-all font-medium placeholder:text-gray-400"
                />
                {trackSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setTrackSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Which Officer to Approve Filter */}
              <div className="flex items-center gap-2 min-w-[240px]">
                <div className="relative w-full">
                  <User className="w-3.5 h-3.5 text-[#A31736] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={trackFilterOfficer}
                    onChange={(e) => setTrackFilterOfficer(e.target.value)}
                    className="w-full pl-8.5 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:border-[#A31736] focus:bg-white transition-all cursor-pointer appearance-none"
                    title="Filter by which officer to approve"
                  >
                    <option value="ALL">Which Officer: All Officers</option>
                    {approvingOfficersList.map((off) => (
                      <option key={off} value={off}>
                        Officer: {off}
                      </option>
                    ))}
                  </select>
                  <Filter className="w-3 h-3 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Phase / Stage Filter */}
              <div className="flex items-center gap-2 min-w-[200px]">
                <div className="relative w-full">
                  <Layers className="w-3.5 h-3.5 text-[#A31736] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={trackFilterPhase}
                    onChange={(e) => setTrackFilterPhase(e.target.value)}
                    className="w-full pl-8.5 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:border-[#A31736] focus:bg-white transition-all cursor-pointer appearance-none"
                    title="Filter by statutory processing phase"
                  >
                    <option value="ALL">All Phases</option>
                    <option value="Phase 1">Phase 1: Application Intake</option>
                    <option value="Phase 2">Phase 2: Technical & Survey Review</option>
                    <option value="Phase 3">Phase 3: Valuation & Assessment</option>
                    <option value="Phase 4">Phase 4: Final Secretary Sign-off</option>
                    <option value="Phase 5">Phase 5: Registered & Enrolled</option>
                  </select>
                  <Filter className="w-3 h-3 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Purpose Filter */}
              <div className="flex items-center gap-2 min-w-[210px]">
                <div className="relative w-full">
                  <Building className="w-3.5 h-3.5 text-[#A31736] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={trackFilterPurpose}
                    onChange={(e) => setTrackFilterPurpose(e.target.value)}
                    className="w-full pl-8.5 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:border-[#A31736] focus:bg-white transition-all cursor-pointer appearance-none"
                    title="Filter by submission purpose"
                  >
                    <option value="ALL">All Purposes</option>
                    <option value="NEW_PROPERTY">New Property (New Number)</option>
                    <option value="OWNERSHIP_CHANGE">Ownership Change</option>
                    <option value="DESCRIPTION_CHANGE">Description Change</option>
                  </select>
                  <Filter className="w-3 h-3 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Reset Filters */}
              {(trackSearchQuery || trackFilterOfficer !== 'ALL' || trackFilterPhase !== 'ALL' || trackFilterPurpose !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setTrackSearchQuery('')
                    setTrackFilterOfficer('ALL')
                    setTrackFilterPhase('ALL')
                    setTrackFilterPurpose('ALL')
                  }}
                  className="px-3 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors shrink-0 cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-100 gap-1">
              <span>
                Tracking <strong>{filteredTrackSubmissions.length}</strong> of{' '}
                <strong>{trackSubmissions.length}</strong> submissions across statutory phases.
              </span>
              <span className="font-medium text-[#A31736] flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" />
                <span>Click "Track Phase" to see which phase the submission is in and the assigned approving officer</span>
              </span>
            </div>
          </div>

          {/* Track Submissions Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-3.5">Assessment No</th>
                    <th className="p-3.5">Property Details</th>
                    <th className="p-3.5">Owner Particulars</th>
                    <th className="p-3.5">Current Phase ("Face")</th>
                    <th className="p-3.5">Which Officer to Approve</th>
                    <th className="p-3.5">Date Lodged</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {filteredTrackSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-500 font-medium">
                        No property submissions matched your search or filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTrackSubmissions.map((sub) => {
                      const info = getSubmissionPhaseInfo(sub)
                      return (
                        <tr key={sub.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="p-3.5">
                            <span className="font-black text-gray-900 block">{sub.assessmentNumber}</span>
                            {(() => {
                              const badge = getSubmissionPurposeBadge(sub.submissionType)
                              return (
                                <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.classes}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                                  <span>{badge.shortLabel}</span>
                                </span>
                              )
                            })()}
                          </td>
                          <td className="p-3.5">
                            <p className="font-semibold text-gray-800">{sub.propertyNumber}</p>
                            <p className="text-[11px] text-gray-400">{sub.propertyType}</p>
                          </td>
                          <td className="p-3.5">
                            <p className="font-semibold text-gray-800">{sub.ownerName}</p>
                            <p className="text-[11px] text-gray-400 font-mono">{sub.ownerNic}</p>
                          </td>
                          <td className="p-3.5">
                            <div className="flex flex-col gap-0.5">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold w-fit ${sub.status === 'APPROVED'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : sub.status === 'SENT_BACK'
                                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                      : 'bg-amber-100 text-amber-900 border border-amber-200'
                                  }`}
                              >
                                <Activity className="w-3 h-3 text-[#A31736]" />
                                <span>{info.phase}</span>
                              </span>
                              <span className="text-[10px] text-gray-400 pl-1 font-medium">
                                Step {info.stepNumber} of 5
                              </span>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5 bg-gray-100/80 px-2.5 py-1 rounded-lg w-fit border border-gray-200 text-gray-800">
                              <User className="w-3.5 h-3.5 text-[#A31736] shrink-0" />
                              <span className="font-bold text-[11px]">{info.officer}</span>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <p>{new Date(sub.submittedAt).toLocaleDateString()}</p>
                            <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                              {sub.daysWaiting} days waiting
                            </span>
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap inline-block ${
                                sub.status === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : sub.status === 'PENDING_APPROVAL'
                                  ? 'bg-amber-100 text-amber-800'
                                  : sub.status === 'SENT_BACK'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {sub.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => setTrackingSubmission(sub)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#A31736] hover:bg-[#801028] rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
                            >
                              <Compass className="w-3.5 h-3.5" />
                              <span>Track Phase</span>
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Review Pop-up Modal ── */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div
            className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scale-in"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 bg-gray-50/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#A31736] flex items-center justify-center border border-rose-100 shrink-0">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-black text-gray-900 tracking-tight">
                        Review Submission • Assessment No: {selectedSubmission.assessmentNumber}
                      </h2>
                      {(() => {
                        const badge = getSubmissionPurposeBadge(selectedSubmission.submissionType)
                        return (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.classes}`}>
                            {badge.label}
                          </span>
                        )
                      })()}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0 ${selectedSubmission.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : selectedSubmission.status === 'PENDING_APPROVAL'
                              ? 'bg-amber-100 text-amber-800'
                              : selectedSubmission.status === 'SENT_BACK'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {selectedSubmission.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Submitted by <strong className="text-gray-700">{selectedSubmission.submittedBy}</strong> on{' '}
                      {new Date(selectedSubmission.submittedAt).toLocaleDateString()} ({selectedSubmission.daysWaiting} days waiting)
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* ── 1. Property Dossier ── */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 mb-3">
                  <Building className="w-4 h-4 text-[#A31736]" />
                  <span>Property Dossier</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Property Specification */}
                  <div className="bg-gray-50 rounded-xl p-4 text-xs space-y-2.5 border border-gray-200">
                    <span className="font-bold text-gray-700 block text-[11px] uppercase tracking-wide border-b border-gray-200 pb-1 mb-1.5">
                      Property Specification
                    </span>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Property / Street No:</span>
                      <span className="font-semibold text-gray-900">
                        {selectedSubmission.propertyNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Property Type:</span>
                      <span className="font-semibold text-gray-900">{selectedSubmission.propertyType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Annual Value:</span>
                      <span className="font-bold text-gray-900">{formatLKR(selectedSubmission.annualAssessedValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Description:</span>
                      <span className="font-medium text-gray-800 text-right max-w-[60%]">
                        {selectedSubmission.description}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Coordinates:</span>
                      <span className="font-mono text-gray-800">
                        {selectedSubmission.latitude.toFixed(6)}, {selectedSubmission.longitude.toFixed(6)}
                      </span>
                    </div>
                  </div>

                  {/* Owner Particulars */}
                  <div className="bg-gray-50 rounded-xl p-4 text-xs space-y-2.5 border border-gray-200">
                    <span className="font-bold text-gray-700 block text-[11px] uppercase tracking-wide border-b border-gray-200 pb-1 mb-1.5">
                      Primary Owner Particulars
                    </span>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Full Legal Name:</span>
                      <span className="font-semibold text-gray-900">{selectedSubmission.ownerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">NIC Number:</span>
                      <span className="font-mono font-semibold text-gray-900">{selectedSubmission.ownerNic}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Mobile Phone:</span>
                      <span className="font-mono text-gray-900">{selectedSubmission.ownerMobile || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Postal Address:</span>
                      <span className="font-medium text-gray-800 text-right max-w-[60%]">
                        {selectedSubmission.postalAddress}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── 2. Submitted Documents Box (Directly Under Property Dossier) ── */}
              <div className="pt-5 border-t border-gray-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#A31736]" />
                      <span>Submitted Documents Box</span>
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-[#A31736] border border-rose-200">
                      {currentDocs.length} Document{currentDocs.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {flaggedDocs.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        <span>{flaggedDocs.length} Issue{flaggedDocs.length > 1 ? 's' : ''} Flagged</span>
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowAddDocForm(!showAddDocForm)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#A31736] bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{showAddDocForm ? 'Close Add Form' : 'Add Document'}</span>
                    </button>
                  </div>
                </div>

                {/* Status Summary Counts */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-200">
                    <p className="text-[10px] font-semibold text-gray-500 uppercase">Total Filed</p>
                    <p className="text-base font-black text-gray-900">{currentDocs.length}</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-2.5 border border-emerald-200">
                    <p className="text-[10px] font-semibold text-emerald-700 uppercase">Verified & Approved</p>
                    <p className="text-base font-black text-emerald-800">{approvedDocs.length}</p>
                  </div>
                  <div className="bg-rose-50 rounded-xl p-2.5 border border-rose-200">
                    <p className="text-[10px] font-semibold text-rose-700 uppercase">Issues Flagged</p>
                    <p className="text-base font-black text-rose-800">{flaggedDocs.length}</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-2.5 border border-amber-200">
                    <p className="text-[10px] font-semibold text-amber-700 uppercase">Pending Review</p>
                    <p className="text-base font-black text-amber-800">{pendingDocs.length}</p>
                  </div>
                </div>

                {/* Section: Add & Submit Document Form */}
                {showAddDocForm && (
                  <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-rose-50 text-[#A31736] flex items-center justify-center border border-rose-100">
                        <Upload className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">Add & Submit Verification Document</h4>
                        <p className="text-[11px] text-gray-500">
                          Upload statutory deed, survey, or clearance and assign reviewing officer
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleAddDocument} className="pt-2 border-t border-gray-200 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                            Document Title / Filename *
                          </label>
                          <input
                            type="text"
                            value={newDocName}
                            onChange={(e) => setNewDocName(e.target.value)}
                            placeholder="e.g. SurveyPlan_Lot45_Approved.pdf"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-[#A31736]"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                            Document Category / Type *
                          </label>
                          <select
                            value={newDocType}
                            onChange={(e) => setNewDocType(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-[#A31736]"
                          >
                            {DOCUMENT_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                            Assign Officer Name *
                          </label>
                          <select
                            value={newDocOfficer}
                            onChange={(e) => setNewDocOfficer(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-[#A31736]"
                          >
                            {OFFICER_PRESETS.map((o) => (
                              <option key={o} value={o}>
                                {o}
                              </option>
                            ))}
                          </select>
                        </div>

                        {newDocOfficer === 'Other' && (
                          <div>
                            <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                              Enter Custom Officer Name *
                            </label>
                            <input
                              type="text"
                              value={customOfficerName}
                              onChange={(e) => setCustomOfficerName(e.target.value)}
                              placeholder="e.g. W. Gunaratne (Technical Officer)"
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-[#A31736]"
                            />
                          </div>
                        )}

                        <div className={newDocOfficer === 'Other' ? 'sm:col-span-2' : ''}>
                          <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                            Optional Notes / Submission Remark
                          </label>
                          <input
                            type="text"
                            value={newDocNotes}
                            onChange={(e) => setNewDocNotes(e.target.value)}
                            placeholder="e.g. Original certified extract received at front desk"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-[#A31736]"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAddDocForm(false)}
                          className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#A31736] hover:bg-[#801028] rounded-xl transition-all cursor-pointer shadow-xs"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Submit Document</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {docUploadSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{docUploadSuccess}</span>
                  </div>
                )}

                {docUploadError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{docUploadError}</span>
                  </div>
                )}

                {/* Submitted Documents Portal List */}
                <div className="space-y-2.5">
                  {currentDocs.length === 0 ? (
                    <div className="p-6 text-center bg-gray-50 rounded-2xl border border-gray-200 text-gray-500 text-xs">
                      No documents submitted yet. Click "Add Document" above to file deeds, plans, or certificates.
                    </div>
                  ) : (
                    currentDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className={`p-4 rounded-2xl border transition-all ${doc.status === 'APPROVED'
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : doc.status === 'HAS_ISSUE'
                              ? 'bg-rose-50/40 border-rose-200'
                              : 'bg-white border-gray-200 hover:border-gray-300 shadow-2xs'
                          }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${doc.status === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                  : doc.status === 'HAS_ISSUE'
                                    ? 'bg-rose-100 text-rose-800 border-rose-200'
                                    : 'bg-gray-100 text-gray-700 border-gray-200'
                                }`}
                            >
                              <Paperclip className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-bold text-xs text-gray-900">{doc.name}</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                                  {doc.type}
                                </span>
                                {doc.fileSize && (
                                  <span className="text-[10px] text-gray-400 font-mono">{doc.fileSize}</span>
                                )}
                              </div>

                              {/* Assigned Officer & Submission Info */}
                              <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-gray-500">
                                <span className="inline-flex items-center gap-1 text-gray-800 font-medium bg-gray-100/80 px-2 py-0.5 rounded-md">
                                  <User className="w-3 h-3 text-[#A31736]" />
                                  <span>Assigned Officer:</span>
                                  <strong className="text-gray-900">{doc.assignedOfficer}</strong>
                                </span>
                                <span>
                                  Uploaded {new Date(doc.uploadedAt).toLocaleDateString()} by{' '}
                                  {doc.uploadedBy || 'Submitter'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {/* Status badge */}
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${doc.status === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : doc.status === 'HAS_ISSUE'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                                }`}
                            >
                              {doc.status === 'APPROVED' && <CheckCircle className="w-3 h-3" />}
                              {doc.status === 'HAS_ISSUE' && <AlertTriangle className="w-3 h-3" />}
                              {doc.status === 'PENDING' && <Clock className="w-3 h-3" />}
                              <span>
                                {doc.status === 'APPROVED'
                                  ? 'Verified & Approved'
                                  : doc.status === 'HAS_ISSUE'
                                    ? 'Issue Flagged'
                                    : 'Pending Review'}
                              </span>
                            </span>

                            {/* Eye icon button to inspect doc */}
                            <button
                              type="button"
                              onClick={() => handleOpenDocViewer(doc)}
                              title="Inspect, Verify or Comment on Document"
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#A31736] bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer shadow-2xs"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Review Doc</span>
                            </button>
                          </div>
                        </div>

                        {/* Officer comment box if present */}
                        {doc.officerComment && (
                          <div
                            className={`mt-2.5 p-2.5 rounded-xl text-xs flex items-start gap-2 ${doc.status === 'HAS_ISSUE'
                                ? 'bg-rose-100/70 border border-rose-200 text-rose-900'
                                : 'bg-gray-100 border border-gray-200 text-gray-700'
                              }`}
                          >
                            {doc.status === 'HAS_ISSUE' ? (
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <span className="font-bold text-[11px] block">
                                {doc.status === 'HAS_ISSUE' ? 'Officer Objection / Issue:' : 'Verification Note:'}
                              </span>
                              <p className="mt-0.5">{doc.officerComment}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* ── 3. Review Timeline & Messages ── */}
              <div className="pt-5 border-t border-gray-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 mb-3">
                  <MessageSquare className="w-4 h-4 text-[#A31736]" />
                  <span>Review History & Messages ({selectedSubmission.reviewHistory.length})</span>
                </h3>
                <div className="space-y-2.5">
                  {selectedSubmission.reviewHistory.map((ev) => (
                    <div key={ev.id} className="p-3 bg-gray-50 rounded-xl text-xs flex items-start gap-3 border border-gray-100">
                      <Clock className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900">
                            {ev.action} • {ev.actor} ({ev.actingAs})
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(ev.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {ev.message && (
                          <p className="text-gray-700 mt-1.5 font-medium bg-white p-2.5 rounded-lg border border-gray-200">
                            {ev.message}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Modal Footer: Action Buttons Under The Form ── */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200/60 rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
                {flaggedDocs.length > 0 && (
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>{flaggedDocs.length} document(s) have flagged issues.</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {selectedSubmission.status === 'PENDING_APPROVAL' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        // Pre-populate send back reason with any document issues found
                        if (flaggedDocs.length > 0) {
                          setSendBackMessage(
                            `Document issues identified:\n` +
                            flaggedDocs.map((d) => `• ${d.name} (${d.type}): ${d.officerComment}`).join('\n')
                          )
                        } else {
                          setSendBackMessage('')
                        }
                        setSendBackError(null)
                        setShowSendBackDialog(true)
                      }}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer shadow-2xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Send Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowApproveDialog(true)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs cursor-pointer active:scale-98"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve Property</span>
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-gray-500 font-medium">
                    This submission is already marked as {selectedSubmission.status.replace('_', ' ')}.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Submission Phase Tracking Pop-up Modal ── */}
      {trackingSubmission && (() => {
        const phaseInfo = getSubmissionPhaseInfo(trackingSubmission)
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
            <div
              className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scale-in"
              role="dialog"
              aria-modal="true"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-gray-100 bg-gray-50/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#A31736] flex items-center justify-center border border-rose-100 shrink-0">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-black text-gray-900 tracking-tight">
                          Submission Progress Tracker • Assessment No: {trackingSubmission.assessmentNumber}
                        </h2>
                        {(() => {
                          const badge = getSubmissionPurposeBadge(trackingSubmission.submissionType)
                          return (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.classes}`}>
                              {badge.label}
                            </span>
                          )
                        })()}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0 ${trackingSubmission.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : trackingSubmission.status === 'PENDING_APPROVAL'
                                ? 'bg-amber-100 text-amber-800'
                                : trackingSubmission.status === 'SENT_BACK'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {trackingSubmission.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Tracking pipeline phase and designated approving officer • Submitted by{' '}
                        <strong className="text-gray-700">{trackingSubmission.submittedBy}</strong> on{' '}
                        {new Date(trackingSubmission.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setTrackingSubmission(null)}
                    className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors cursor-pointer"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Scrollable Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* ── 1. Current Phase & Officer to Approve Banner ── */}
                <div className="bg-gradient-to-r from-rose-50/80 via-white to-amber-50/60 rounded-2xl border border-rose-100 p-5 shadow-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Current Phase */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full inline-block">
                        Current Processing Phase
                      </span>
                      <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[#A31736]" />
                        <span>{phaseInfo.phase}</span>
                      </h3>
                      <p className="text-xs text-gray-600">
                        Step {phaseInfo.stepNumber} of 5 in statutory property registration pipeline.
                      </p>
                    </div>

                    {/* Which Officer to Approve */}
                    <div className="bg-white/90 backdrop-blur-xs rounded-xl p-3.5 border border-rose-200/60 space-y-1 shadow-2xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#A31736]" />
                        <span>Officer Assigned to Approve:</span>
                      </span>
                      <p className="text-sm font-black text-gray-900">{phaseInfo.officer}</p>
                      <p className="text-[11px] text-gray-500">
                        {trackingSubmission.status === 'APPROVED'
                          ? 'All required statutory approvals completed and cadastre enrolled.'
                          : trackingSubmission.status === 'SENT_BACK'
                            ? 'Awaiting applicant/officer response to flagged issues before resubmission.'
                            : `Active review with ${phaseInfo.officer} (${trackingSubmission.daysWaiting} days in stage).`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ── 2. Visual Phase Pipeline Stepper ── */}
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-[#A31736]" />
                      <span>Statutory Approval Pipeline (Phases)</span>
                    </h4>
                    <span className="text-[11px] text-gray-500 font-medium">
                      Current Stage: <strong>Phase {phaseInfo.stepNumber} of 5</strong>
                    </span>
                  </div>

                  {/* Steps Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {SUBMISSION_PHASES.map((stage) => {
                      const isPassed = phaseInfo.stepNumber > stage.step || trackingSubmission.status === 'APPROVED'
                      const isCurrent = phaseInfo.stepNumber === stage.step && trackingSubmission.status !== 'APPROVED'
                      const isSentBackCurrent = isCurrent && trackingSubmission.status === 'SENT_BACK'

                      return (
                        <div
                          key={stage.step}
                          className={`relative rounded-xl p-3.5 border transition-all ${isSentBackCurrent
                              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200 shadow-xs'
                              : isCurrent
                                ? 'bg-white border-[#A31736] ring-2 ring-rose-100 shadow-xs'
                                : isPassed
                                  ? 'bg-emerald-50/60 border-emerald-200'
                                  : 'bg-white/60 border-gray-200 opacity-60'
                            }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isSentBackCurrent
                                  ? 'bg-rose-600 text-white'
                                  : isCurrent
                                    ? 'bg-[#A31736] text-white shadow-xs'
                                    : isPassed
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-gray-200 text-gray-600'
                                }`}
                            >
                              {isPassed ? <Check className="w-3.5 h-3.5" /> : stage.step}
                            </span>

                            {isCurrent && (
                              <span
                                className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${isSentBackCurrent ? 'bg-rose-200 text-rose-800' : 'bg-rose-100 text-[#A31736]'
                                  }`}
                              >
                                {isSentBackCurrent ? 'Needs Action' : 'Active'}
                              </span>
                            )}
                            {isPassed && (
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                Cleared
                              </span>
                            )}
                          </div>

                          <h5 className="font-bold text-xs text-gray-900 leading-tight">{stage.title}</h5>
                          <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{stage.description}</p>
                          <div className="mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-600 flex items-center gap-1">
                            <User className="w-3 h-3 text-[#A31736] shrink-0" />
                            <span className="truncate font-medium" title={stage.defaultOfficer}>
                              {stage.defaultOfficer}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* ── 3. Property Dossier ── */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 mb-3">
                    <Building className="w-4 h-4 text-[#A31736]" />
                    <span>Property Dossier</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Property Specification */}
                    <div className="bg-gray-50 rounded-xl p-4 text-xs space-y-2.5 border border-gray-200">
                      <span className="font-bold text-gray-700 block text-[11px] uppercase tracking-wide border-b border-gray-200 pb-1 mb-1.5">
                        Property Specification
                      </span>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Property / Street No:</span>
                        <span className="font-semibold text-gray-900">{trackingSubmission.propertyNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Property Type:</span>
                        <span className="font-semibold text-gray-900">{trackingSubmission.propertyType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Annual Value:</span>
                        <span className="font-bold text-gray-900">{formatLKR(trackingSubmission.annualAssessedValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Description:</span>
                        <span className="font-medium text-gray-800 text-right max-w-[60%]">
                          {trackingSubmission.description}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Coordinates:</span>
                        <span className="font-mono text-gray-800">
                          {trackingSubmission.latitude.toFixed(6)}, {trackingSubmission.longitude.toFixed(6)}
                        </span>
                      </div>
                    </div>

                    {/* Owner Particulars */}
                    <div className="bg-gray-50 rounded-xl p-4 text-xs space-y-2.5 border border-gray-200">
                      <span className="font-bold text-gray-700 block text-[11px] uppercase tracking-wide border-b border-gray-200 pb-1 mb-1.5">
                        Primary Owner Particulars
                      </span>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Full Legal Name:</span>
                        <span className="font-semibold text-gray-900">{trackingSubmission.ownerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">NIC Number:</span>
                        <span className="font-mono font-semibold text-gray-900">{trackingSubmission.ownerNic}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Mobile Phone:</span>
                        <span className="font-mono text-gray-900">{trackingSubmission.ownerMobile || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Postal Address:</span>
                        <span className="font-medium text-gray-800 text-right max-w-[60%]">
                          {trackingSubmission.postalAddress}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer: Simple Close Button */}
              <div className="p-4 border-t border-gray-100 bg-gray-50/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-gray-500">
                  To review documents, verify attachments, or approve submissions, use the <strong>Approval Queue</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setTrackingSubmission(null)}
                  className="px-5 py-2 text-xs font-bold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors cursor-pointer shadow-2xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Document Inspection & Review Viewer Modal (Eye Icon Popup) ── */}
      {inspectingDoc && selectedSubmission && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[70] flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div
            className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scale-in"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#A31736]/10 text-[#A31736] flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900">{inspectingDoc.name}</h3>
                  <p className="text-[11px] text-gray-500">
                    Category: <strong className="text-gray-700">{inspectingDoc.type}</strong> • Assigned Officer:{' '}
                    <strong className="text-[#A31736]">{inspectingDoc.assignedOfficer}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingDoc(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Document Preview Canvas */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="border border-gray-300 rounded-xl bg-amber-50/20 p-5 shadow-xs relative overflow-hidden font-serif">
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none text-4xl font-black rotate-[-25deg] text-gray-900 uppercase">
                  Homagama Pradeshiya Sabha • Certified Cadastre Copy
                </div>

                {/* Simulated Official Document Sheet */}
                <div className="border-b-2 border-gray-800 pb-3 mb-4 text-center">
                  <p className="text-[11px] uppercase tracking-widest text-gray-500 font-sans font-bold">
                    Democratic Socialist Republic of Sri Lanka
                  </p>
                  <h4 className="text-sm font-black text-gray-900 font-sans tracking-tight">
                    HOMAGAMA PRADESHIYA SABHA • STATUTORY ATTESTATION
                  </h4>
                  <p className="text-[10px] text-gray-600 font-sans mt-0.5">
                    Cadastral Document Archive: Assessment No. {selectedSubmission.assessmentNumber} (
                    {selectedSubmission.propertyNumber})
                  </p>
                </div>

                <div className="space-y-3 text-xs text-gray-800 font-sans">
                  <div className="grid grid-cols-2 gap-3 bg-white/80 p-3 rounded-lg border border-gray-200">
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase font-bold">Document Type</span>
                      <span className="font-bold text-gray-900">{inspectingDoc.type}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase font-bold">Reference File</span>
                      <span className="font-mono font-bold text-gray-900">{inspectingDoc.name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase font-bold">Assigned Officer</span>
                      <span className="font-semibold text-gray-900">{inspectingDoc.assignedOfficer}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase font-bold">Lodged Date</span>
                      <span className="font-semibold text-gray-900">
                        {new Date(inspectingDoc.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/80 p-3 rounded-lg border border-gray-200 space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-500">Property Owner:</span>
                      <span className="font-bold text-gray-900">{selectedSubmission.ownerName}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-500">Owner NIC:</span>
                      <span className="font-mono text-gray-900">{selectedSubmission.ownerNic}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-500">Current Status:</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${inspectingDoc.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inspectingDoc.status === 'HAS_ISSUE'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                      >
                        {inspectingDoc.status}
                      </span>
                    </div>
                  </div>

                  <div className="border border-dashed border-gray-300 rounded-lg p-3 text-center bg-gray-50 text-[11px] text-gray-500">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                    <span>Digitally certified copy verified against the official council register.</span>
                  </div>
                </div>
              </div>

              {/* Officer Review & Comment Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#A31736]" />
                    <span>Officer Comment / Issue Notes</span>
                  </label>
                  <span className="text-[10px] text-gray-400">Required if flagging an issue</span>
                </div>

                {docCommentError && (
                  <p className="text-xs text-rose-700 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{docCommentError}</span>
                  </p>
                )}

                <textarea
                  value={docComment}
                  onChange={(e) => {
                    setDocComment(e.target.value)
                    if (e.target.value.trim()) setDocCommentError(null)
                  }}
                  placeholder="Enter comments or describe specific issues (e.g., Boundary line survey discrepancy, Notarial seal missing, Boundary setback under 15ft)..."
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none focus:border-[#A31736] h-20 resize-none"
                />
              </div>
            </div>

            {/* Footer with Approve and Flag Issue buttons */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setInspectingDoc(null)}
                className="px-3.5 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-xl"
              >
                Close Viewer
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleFlagDocIssue}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-xl transition-all cursor-pointer shadow-2xs"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Flag Issue (Reject Doc)</span>
                </button>
                <button
                  type="button"
                  onClick={handleApproveDoc}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Approve Document</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Dialog: Approve Confirmation ── */}
      {showApproveDialog && selectedSubmission && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>Approve Property Assessment</span>
            </h3>
            <p className="text-xs text-gray-600">
              Confirm approval for assessment number <strong>{selectedSubmission.assessmentNumber}</strong> (
              {selectedSubmission.propertyNumber}). Once approved, the assessment number will be locked and the property
              will be active on the registry, GIS map, and KPI ledger.
            </p>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Optional Officer Comment</label>
              <textarea
                value={approveComment}
                onChange={(e) => setApproveComment(e.target.value)}
                placeholder="e.g. Survey verified, statutory deeds attested, valuation rate accepted."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-600 h-20 resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowApproveDialog(false)}
                className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={isProcessing}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer disabled:opacity-50"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Dialog: Send Back with Mandatory Message (min 10 chars) ── */}
      {showSendBackDialog && selectedSubmission && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-rose-800 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-rose-600" />
              <span>Send Back Property for Revision</span>
            </h3>
            <p className="text-xs text-gray-600">
              Sending back requires a specific explanation for the submitter. The record will be set to{' '}
              <strong>SENT_BACK</strong>, allowing the submitter to edit and resubmit.
            </p>
            {sendBackError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{sendBackError}</span>
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Reason for Return * <span className="text-gray-400 font-normal">(Min 10 characters)</span>
              </label>
              <textarea
                value={sendBackMessage}
                onChange={(e) => {
                  setSendBackMessage(e.target.value)
                  if (e.target.value.trim().length >= 10) setSendBackError(null)
                }}
                placeholder="e.g. Assessment number format mismatch. Survey plan setback requires correction."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-rose-600 h-24 resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSendBackDialog(false)}
                className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendBack}
                disabled={isProcessing}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer disabled:opacity-50"
              >
                Send Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApprovalsPage

