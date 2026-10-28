import React, { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, FileBadge, Pencil, Plus, Trash2 } from 'lucide-react'
import { useTradeLicense } from '../context/TradeLicenseContext'
import { APPROVAL_STAGE_DESIGNATION, APPROVAL_STAGE_LABELS, INSPECTION_TYPE_LABELS } from '../config/defaultConfig'
import { applicationPayments } from '../rules/selectors'
import { can, chargeBalance, latestInspections } from '../rules/tradeLicenseRules'
import type { Application, ApplicationDocument, Charge, Inspection } from '../types/tradeLicense'
import { LIABILITY_LABELS } from '../components/BusinessFields'
import InspectionReportModal from '../components/InspectionReportModal'
import LicenseCertificateModal from '../components/LicenseCertificateModal'
import NoticeFormModal from '../components/NoticeFormModal'
import { PAYMENT_METHOD_LABELS, chargeLabel } from '../components/labels'
import {
  ApprovalDecisionForm,
  AssignInspectionForm,
  FeeAndIssueForm,
  PaymentModal,
  RectifyForm,
  RiReviewForm,
} from '../components/WorkflowActions'
import {
  AppStatusPill,
  ApprovalStatusPill,
  DetailRow,
  EmptyState,
  ErrorBanner,
  Field,
  InfoBanner,
  InspectionStatusPill,
  Modal,
  Panel,
  PaymentStatusPill,
  Pill,
  TableShell,
  Tabs,
  btnGhost,
  btnPrimary,
  btnSecondary,
  formatDate,
  formatDateTime,
  formatLKR,
  inputCls,
} from '../components/ui'

const STEPS = ['Application', 'Processing fee', 'Documents', 'RI review', 'Inspections', 'Approvals', 'Licence fee', 'Licence issued']

function stepIndex(app: Application, processingPaid: boolean): number {
  switch (app.status) {
    case 'SUBMITTED':
      return processingPaid ? 2 : 1
    case 'DOCUMENT_REVIEW':
      return 2
    case 'RI_REVIEW':
      return 3
    case 'UNDER_INSPECTION':
    case 'CORRECTIONS_REQUESTED':
      return app.approvalStatus === 'RETURNED' ? 5 : 4
    case 'IN_APPROVAL':
      return 5
    case 'APPROVED':
      return app.feeAssessment ? 7 : 6
    case 'LICENSED':
      return 8
    default:
      return -1
  }
}

const EditApplicationModal: React.FC<{ app: Application; onClose: () => void }> = ({ app, onClose }) => {
  const { db, run } = useTradeLicense()
  const [applicant, setApplicant] = useState(app.applicant)
  const [categoryId, setCategoryId] = useState(app.categoryId)
  const [income, setIncome] = useState(app.declaredLastYearIncome === null ? '' : String(app.declaredLastYearIncome))
  const [error, setError] = useState<string | null>(null)
  if (!db) return null
  const save = async () => {
    const res = await run(
      (svc, a) => svc.updateApplication(app.id, { applicant, categoryId, declaredLastYearIncome: income === '' ? null : Number(income) }, a),
      'Application updated.'
    )
    if (res.ok) onClose()
    else setError(res.error)
  }
  return (
    <Modal
      open
      onClose={onClose}
      title={`Edit ${app.ref}`}
      size="lg"
      footer={
        <>
          <button type="button" className={btnSecondary} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={btnPrimary} onClick={save}>
            Save Changes
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Applicant name" required>
          <input className={inputCls} value={applicant.name} onChange={(e) => setApplicant({ ...applicant, name: e.target.value })} />
        </Field>
        <Field label="Applicant NIC" required>
          <input className={inputCls} value={applicant.nic} onChange={(e) => setApplicant({ ...applicant, nic: e.target.value })} />
        </Field>
        <Field label="Phone" required>
          <input className={inputCls} value={applicant.phone} onChange={(e) => setApplicant({ ...applicant, phone: e.target.value })} />
        </Field>
        <Field label="Email">
          <input className={inputCls} value={applicant.email ?? ''} onChange={(e) => setApplicant({ ...applicant, email: e.target.value })} />
        </Field>
        <Field label="Business category" hint="Changing the category reloads required inspections and documents.">
          <select className={inputCls} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {db.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Declared income last year (Rs.)">
          <input type="number" min={0} className={inputCls} value={income} onChange={(e) => setIncome(e.target.value)} />
        </Field>
      </div>
      <div className="mt-3">
        <ErrorBanner message={error} />
      </div>
    </Modal>
  )
}

const DocumentsEditor: React.FC<{ app: Application; editable: boolean }> = ({ app, editable }) => {
  const { db, run } = useTradeLicense()
  const [docs, setDocs] = useState<ApplicationDocument[]>(app.documents)
  const [error, setError] = useState<string | null>(null)
  const required = new Set(db?.categories.find((c) => c.id === app.categoryId)?.requiredDocuments ?? [])
  const dirty = JSON.stringify(docs) !== JSON.stringify(app.documents)
  const update = (i: number, patch: Partial<ApplicationDocument>) => setDocs(docs.map((d, j) => (j === i ? { ...d, ...patch } : d)))
  const save = async () => {
    const res = await run((svc, a) => svc.updateDocuments(app.id, docs, a), 'Documents saved.')
    setError(res.ok ? null : res.error)
  }
  const complete = async () => {
    const res = await run((svc, a) => svc.completeDocumentVerification(app.id, a), 'Documents validated – sent to RI.')
    setError(res.ok ? null : res.error)
  }
  return (
    <div className="space-y-3">
      <TableShell headers={['Document', 'Received', 'Verified', 'File / reference', 'Remarks', '']} isEmpty={docs.length === 0} empty={<EmptyState title="No documents listed" />}>
        {docs.map((d, i) => (
          <tr key={d.id || i}>
            <td className="px-4 py-2.5 min-w-[200px]">
              {d.id && !editable ? (
                <span className="font-semibold text-gray-800">{d.label}</span>
              ) : (
                <input className={inputCls} disabled={!editable || required.has(d.label)} value={d.label} onChange={(e) => update(i, { label: e.target.value })} />
              )}
            </td>
            <td className="px-4 py-2.5">
              <input type="checkbox" className="accent-[#A31736]" disabled={!editable} checked={d.received} onChange={(e) => update(i, { received: e.target.checked, verified: e.target.checked ? d.verified : false })} />
            </td>
            <td className="px-4 py-2.5">
              <input type="checkbox" className="accent-[#A31736]" disabled={!editable || !d.received} checked={d.verified} onChange={(e) => update(i, { verified: e.target.checked })} />
            </td>
            <td className="px-4 py-2.5">
              <input className={inputCls} disabled={!editable} value={d.fileName ?? ''} onChange={(e) => update(i, { fileName: e.target.value })} placeholder="File no. / scan ref." />
            </td>
            <td className="px-4 py-2.5">
              <input className={inputCls} disabled={!editable} value={d.remarks ?? ''} onChange={(e) => update(i, { remarks: e.target.value })} />
            </td>
            <td className="px-4 py-2.5 text-right">
              {editable && !required.has(d.label) && (
                <button type="button" onClick={() => setDocs(docs.filter((_, j) => j !== i))} className="p-1.5 text-gray-400 hover:text-rose-600 cursor-pointer" aria-label="Remove">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </td>
          </tr>
        ))}
      </TableShell>
      {editable && (
        <div className="flex flex-wrap items-center gap-2 px-4 pb-4">
          <button type="button" className={btnSecondary} onClick={() => setDocs([...docs, { id: '', label: '', received: false, verified: false }])}>
            <Plus className="w-3.5 h-3.5" /> Add Document
          </button>
          <button type="button" className={btnSecondary} onClick={save} disabled={!dirty}>
            Save Documents
          </button>
          {app.status === 'DOCUMENT_REVIEW' && (
            <button type="button" className={btnPrimary} onClick={complete} disabled={dirty} title={dirty ? 'Save changes first' : undefined}>
              <Check className="w-3.5 h-3.5" /> Complete Document Validation
            </button>
          )}
          <div className="w-full">
            <ErrorBanner message={error} />
          </div>
        </div>
      )}
      {app.documentsVerifiedBy && (
        <p className="px-4 pb-4 text-[11px] text-gray-500">
          Validated by {app.documentsVerifiedBy} on {formatDateTime(app.documentsVerifiedAt)}
        </p>
      )}
    </div>
  )
}

export const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { db, actor, run } = useTradeLicense()
  const [tab, setTab] = useState('overview')
  const [editing, setEditing] = useState(false)
  const [payCharge, setPayCharge] = useState<Charge | null>(null)
  const [viewInspection, setViewInspection] = useState<Inspection | null>(null)
  const [showCert, setShowCert] = useState(false)
  const [notice, setNotice] = useState(false)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [withdrawReason, setWithdrawReason] = useState('')

  const app = db?.applications.find((a) => a.id === id)
  const related = useMemo(() => {
    if (!db || !app) return null
    const inspections = db.inspections.filter((i) => i.applicationId === app.id).sort((a, b) => a.assignedAt.localeCompare(b.assignedAt))
    const charges = db.charges.filter((c) => c.applicationId === app.id)
    const chargeIds = new Set(charges.map((c) => c.id))
    const inspIds = new Set(inspections.map((i) => i.id))
    const approvals = db.approvals.filter((a) => a.applicationId === app.id)
    const apprIds = new Set(approvals.map((a) => a.id))
    const payments = db.payments.filter((p) => p.applicationId === app.id)
    const payIds = new Set(payments.map((p) => p.id))
    const license = db.licenses.find((l) => l.id === app.licenseId)
    const audit = db.audit.filter(
      (e) => e.entityId === app.id || chargeIds.has(e.entityId) || inspIds.has(e.entityId) || apprIds.has(e.entityId) || payIds.has(e.entityId) || e.entityId === license?.id
    )
    return { inspections, charges, approvals, payments, license, audit }
  }, [db, app])

  if (!db) return null
  if (!app || !related) {
    return (
      <Panel>
        <EmptyState
          title="Application not found"
          message="It may have been removed from this browser's records."
          action={
            <Link to="/trade-license/applications" className={btnSecondary}>
              Back to register
            </Link>
          }
        />
      </Panel>
    )
  }

  const business = db.businesses.find((b) => b.key === app.businessKey)
  const category = db.categories.find((c) => c.id === app.categoryId)
  const pay = applicationPayments(db, app)
  const step = stepIndex(app, pay.processing.status === 'PAID')
  const latest = latestInspections(app, db.inspections)
  const processingCharge = related.charges.find((c) => c.type === 'PROCESSING_FEE' && c.status === 'ACTIVE')
  const preInspection = ['SUBMITTED', 'DOCUMENT_REVIEW', 'RI_REVIEW'].includes(app.status)

  const withdraw = async () => {
    const res = await run((svc, a) => svc.withdrawApplication(app.id, withdrawReason, a), 'Application withdrawn.')
    if (res.ok) setWithdrawOpen(false)
  }

  // ── Next action panel ──
  let nextAction: React.ReactNode = null
  switch (app.status) {
    case 'SUBMITTED':
      nextAction = (
        <div className="space-y-3 text-xs">
          <p className="text-gray-600">Online submission received. The processing fee must be paid before the Business ID is issued and documents are validated.</p>
          {processingCharge && can(actor, 'PAYMENT_RECORD') ? (
            <button type="button" className={btnPrimary} onClick={() => setPayCharge(processingCharge)}>
              Record Processing Fee Payment
            </button>
          ) : (
            <InfoBanner>Processing-fee payments are recorded by the Counter Officer or Cashier.</InfoBanner>
          )}
        </div>
      )
      break
    case 'DOCUMENT_REVIEW':
      nextAction = can(actor, 'DOCUMENT_VERIFY') ? (
        <div className="space-y-3 text-xs">
          <p className="text-gray-600">Mark each document as received and verified, then complete validation to forward the file to the Revenue Inspector.</p>
          <button type="button" className={btnPrimary} onClick={() => setTab('documents')}>
            Open Documents
          </button>
        </div>
      ) : (
        <InfoBanner>Awaiting document validation by the Counter Officer / RI.</InfoBanner>
      )
      break
    case 'RI_REVIEW':
      nextAction = can(actor, 'RI_REVIEW') ? <RiReviewForm app={app} /> : <InfoBanner>Awaiting review by the Revenue Inspector.</InfoBanner>
      break
    case 'UNDER_INSPECTION':
      nextAction = (
        <div className="space-y-3">
          <ul className="space-y-1.5 text-xs">
            {app.requiredInspections.map((t) => {
              const i = latest[t]
              return (
                <li key={t} className="flex items-center justify-between gap-2">
                  <span className="text-gray-700">{INSPECTION_TYPE_LABELS[t]}</span>
                  {!i ? (
                    <Pill tone="gray">Not assigned</Pill>
                  ) : i.status === 'ASSIGNED' ? (
                    <Pill tone="teal">{`Assigned · R${i.round}`}</Pill>
                  ) : t === 'PHI' && app.mohSignOffRequired && i.recommendation === 'RECOMMEND' && !i.mohSignOff ? (
                    <Pill tone="amber">Awaiting MOH</Pill>
                  ) : (
                    <Pill tone="emerald">Reported</Pill>
                  )}
                </li>
              )
            })}
          </ul>
          {can(actor, 'INSPECTION_ASSIGN') && <AssignInspectionForm app={app} />}
          <button type="button" className={btnSecondary} onClick={() => setTab('inspections')}>
            View Inspection Reports
          </button>
        </div>
      )
      break
    case 'CORRECTIONS_REQUESTED':
      nextAction = <RectifyForm app={app} onIssueNotice={() => setNotice(true)} />
      break
    case 'IN_APPROVAL':
      nextAction = <ApprovalDecisionForm app={app} />
      break
    case 'APPROVED':
      nextAction = <FeeAndIssueForm app={app} onIssued={() => setShowCert(true)} />
      break
    case 'LICENSED':
      nextAction = (
        <div className="space-y-3 text-xs">
          <p className="text-gray-600">
            Licence <strong className="font-mono">{related.license?.licenseNo}</strong> valid until {formatDate(related.license?.validUntil)}.
          </p>
          {pay.license.outstanding > 0 && <InfoBanner tone="amber">{formatLKR(pay.license.outstanding)} licence fee / stamp duty outstanding.</InfoBanner>}
          <button type="button" className={btnPrimary} onClick={() => setShowCert(true)}>
            <FileBadge className="w-3.5 h-3.5" /> View Certificate
          </button>
        </div>
      )
      break
    case 'REJECTED':
      nextAction = <InfoBanner tone="amber">Rejected: {app.rejectionReason}</InfoBanner>
      break
    case 'WITHDRAWN':
      nextAction = <InfoBanner>This application was withdrawn.</InfoBanner>
      break
  }

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="min-w-0">
            <button type="button" onClick={() => navigate('/trade-license/applications')} className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 hover:text-[#A31736] mb-1 cursor-pointer">
              <ArrowLeft className="w-3 h-3" /> Applications register
            </button>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight font-mono">{app.ref}</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {business?.name} · Business ID <strong className="font-mono">{business?.businessId ?? 'pending (issued on processing-fee payment)'}</strong> · {category?.name} ·{' '}
              {app.channel === 'ONLINE' ? `Online (${app.portalRef})` : 'Counter'} · {app.type === 'RENEWAL' ? 'Renewal' : 'New'} {app.licenseYear}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            {preInspection && can(actor, 'APPLICATION_EDIT') && (
              <button type="button" className={btnSecondary} onClick={() => setEditing(true)}>
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
            )}
            {['SUBMITTED', 'DOCUMENT_REVIEW', 'RI_REVIEW', 'UNDER_INSPECTION', 'CORRECTIONS_REQUESTED', 'IN_APPROVAL'].includes(app.status) &&
              can(actor, 'APPLICATION_EDIT') && (
                <button type="button" className={btnSecondary} onClick={() => setWithdrawOpen(true)}>
                  Withdraw
                </button>
              )}
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
          <div className="space-y-1">
            <p className="font-bold uppercase tracking-wider text-gray-400">Application</p>
            <AppStatusPill status={app.status} />
          </div>
          <div className="space-y-1">
            <p className="font-bold uppercase tracking-wider text-gray-400">Inspection</p>
            <InspectionStatusPill status={app.inspectionStatus} />
          </div>
          <div className="space-y-1">
            <p className="font-bold uppercase tracking-wider text-gray-400">Approval</p>
            <div className="flex flex-wrap items-center gap-1">
              <ApprovalStatusPill status={app.approvalStatus} />
              {app.currentApprovalStage && <span className="text-gray-500">{APPROVAL_STAGE_DESIGNATION[app.currentApprovalStage]}</span>}
            </div>
          </div>
          <div className="space-y-1">
            <p className="font-bold uppercase tracking-wider text-gray-400">Payments</p>
            <div className="flex flex-wrap gap-1">
              <span title="Processing fee">
                <PaymentStatusPill status={pay.processing.status} />
              </span>
              <span title="Licence fee + stamp duty">
                <PaymentStatusPill status={pay.license.status} />
              </span>
            </div>
          </div>
        </div>
        {step >= 0 && (
          <ol className="flex overflow-x-auto gap-1 pt-1">
            {STEPS.map((s, i) => (
              <li key={s} className="flex-1 min-w-[92px]">
                <div className={`h-1.5 rounded-full ${i < step ? 'bg-[#A31736]' : i === step ? 'bg-[#A31736]/40' : 'bg-gray-200'}`} />
                <p className={`mt-1 text-[10px] font-bold ${i <= step ? 'text-[#A31736]' : 'text-gray-400'}`}>{s}</p>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        <div className="xl:col-span-8 space-y-4 min-w-0">
          <Tabs
            active={tab}
            onChange={setTab}
            tabs={[
              { id: 'overview', label: 'Overview' },
              { id: 'documents', label: 'Documents', count: app.documents.length },
              { id: 'inspections', label: 'Inspections', count: related.inspections.length },
              { id: 'approvals', label: 'Approvals', count: related.approvals.length },
              { id: 'fees', label: 'Fees & Payments', count: related.payments.length },
              { id: 'history', label: 'Audit Trail', count: related.audit.length },
            ]}
          />

          {tab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Panel title="Applicant">
                <DetailRow label="Name" value={app.applicant.name} />
                <DetailRow label="NIC" value={app.applicant.nic} />
                <DetailRow label="Phone" value={app.applicant.phone} />
                <DetailRow label="Email" value={app.applicant.email} />
                <DetailRow label="Relationship" value={app.applicant.relationship} />
                <DetailRow label="Declared income last year" value={formatLKR(app.declaredLastYearIncome)} />
                <DetailRow label="Registered by" value={`${app.createdBy} · ${formatDateTime(app.createdAt)}`} />
              </Panel>
              <Panel title="Business & Premises">
                <DetailRow label="Business" value={business?.name} />
                <DetailRow label="Nature of activity" value={business?.natureOfActivity} />
                <DetailRow label="Owner" value={`${business?.owner.name ?? ''} (${business?.owner.nic ?? ''})`} />
                <DetailRow label="Premises" value={business?.premises.address} />
                <DetailRow label="Assessment no." value={business?.premises.assessmentNo} />
                <DetailRow label="Building" value={[business?.premises.buildingNature, business?.premises.buildingOwnerName].filter(Boolean).join(' · ')} />
                <DetailRow label="Annual assessment value" value={business?.annualAssessmentValue ?? '—'} />
                <DetailRow label="Tourist Board hotel" value={business?.touristBoardRegistered ? `Yes · turnover ${formatLKR(business.previousYearTurnover)}` : 'No'} />
                <DetailRow label="Liable for" value={business?.liabilities.map((l) => LIABILITY_LABELS[l]).join(', ')} />
                <DetailRow label="Previous licence" value={business?.previousLicense ? `${business.previousLicense.number} ${business.previousLicense.year ?? ''}` : '—'} />
              </Panel>
              <Panel title="Inspection Requirements" className="lg:col-span-2">
                <div className="flex flex-wrap gap-2">
                  {app.requiredInspections.length === 0 ? (
                    <span className="text-xs text-gray-500">No inspections required.</span>
                  ) : (
                    app.requiredInspections.map((t) => (
                      <Pill key={t} tone="teal">
                        {INSPECTION_TYPE_LABELS[t]}
                      </Pill>
                    ))
                  )}
                  {app.mohSignOffRequired && <Pill tone="indigo">MOH sign-off on PHI report</Pill>}
                </div>
                <p className="text-[11px] text-gray-500 mt-3">Approval route: {app.approvalStages.map((s) => APPROVAL_STAGE_LABELS[s]).join(' → ')}</p>
                {app.riReview && (
                  <p className="text-[11px] text-gray-500 mt-1">
                    RI review by {app.riReview.by} on {formatDateTime(app.riReview.at)}
                    {app.riReview.notes ? ` – ${app.riReview.notes}` : ''}
                  </p>
                )}
              </Panel>
              {app.correctionRequests.length > 0 && (
                <Panel title="Correction Requests" className="lg:col-span-2" bodyClassName="p-0">
                  <TableShell headers={['Raised', 'By', 'Issues', 'Deadline', 'Status']}>
                    {app.correctionRequests.map((c) => (
                      <tr key={c.id}>
                        <td className="px-4 py-2.5 whitespace-nowrap">{formatDate(c.raisedAt)}</td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          {c.raisedBy}
                          <p className="text-[10px] text-gray-400">{c.raisedByDesignation}</p>
                        </td>
                        <td className="px-4 py-2.5 whitespace-pre-line min-w-[220px]">
                          {c.issues}
                          {c.resolutionNote && <p className="text-[10px] text-emerald-700 mt-1">Rectified: {c.resolutionNote}</p>}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">{formatDate(c.deadline)}</td>
                        <td className="px-4 py-2.5">
                          <Pill tone={c.status === 'RECTIFIED' ? 'emerald' : c.status === 'DEADLINE_MISSED' ? 'rose' : 'amber'}>{c.status.replace('_', ' ').toLowerCase()}</Pill>
                        </td>
                      </tr>
                    ))}
                  </TableShell>
                </Panel>
              )}
            </div>
          )}

          {tab === 'documents' && (
            <Panel title="Required Documents" bodyClassName="p-0">
              <DocumentsEditor key={app.updatedAt} app={app} editable={preInspection && can(actor, 'DOCUMENT_VERIFY')} />
            </Panel>
          )}

          {tab === 'inspections' && (
            <Panel title="Inspections & Reports" bodyClassName="p-0">
              <TableShell
                headers={['Inspection', 'Round', 'Officer', 'Status', 'Recommendation', 'MOH', '']}
                isEmpty={related.inspections.length === 0}
                empty={<EmptyState title="No inspections assigned yet" message="The Revenue Inspector assigns inspections after RI review." />}
              >
                {related.inspections.map((i) => (
                  <tr key={i.id}>
                    <td className="px-4 py-2.5 font-semibold text-gray-800">{INSPECTION_TYPE_LABELS[i.type]}</td>
                    <td className="px-4 py-2.5">{i.round}</td>
                    <td className="px-4 py-2.5">
                      {i.assignedTo}
                      <p className="text-[10px] text-gray-400">{i.dueDate ? `Due ${formatDate(i.dueDate)}` : `Assigned ${formatDate(i.assignedAt)}`}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <Pill tone={i.status === 'ASSIGNED' ? 'teal' : 'gray'}>{i.status === 'ASSIGNED' ? 'Assigned' : 'Report submitted'}</Pill>
                    </td>
                    <td className="px-4 py-2.5">
                      {i.recommendation ? (
                        <Pill tone={i.recommendation === 'RECOMMEND' ? 'emerald' : i.recommendation === 'CORRECTIONS_REQUIRED' ? 'amber' : 'rose'}>
                          {i.recommendation.replace('_', ' ').toLowerCase()}
                        </Pill>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-2.5">{i.type === 'PHI' && app.mohSignOffRequired ? (i.mohSignOff ? i.mohSignOff.decision.toLowerCase().replace('_', ' ') : 'pending') : '—'}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button type="button" className={btnGhost} onClick={() => setViewInspection(i)}>
                        {i.status === 'ASSIGNED' ? 'Open' : 'View report'} →
                      </button>
                    </td>
                  </tr>
                ))}
              </TableShell>
            </Panel>
          )}

          {tab === 'approvals' && (
            <Panel title="Approval Decisions" bodyClassName="p-0">
              <div className="px-5 py-3 flex flex-wrap gap-2 border-b border-gray-100">
                {app.approvalStages.map((s) => {
                  const done = related.approvals.some((a) => a.stage === s && a.decision === 'APPROVED')
                  const current = app.currentApprovalStage === s
                  return (
                    <Pill key={s} tone={current ? 'purple' : done ? 'emerald' : 'gray'}>
                      {APPROVAL_STAGE_LABELS[s]}
                    </Pill>
                  )
                })}
              </div>
              <TableShell
                headers={['Date', 'Stage', 'Officer', 'Decision', 'Remarks']}
                isEmpty={related.approvals.length === 0}
                empty={<EmptyState title="No approval decisions yet" />}
              >
                {related.approvals.map((a) => (
                  <tr key={a.id}>
                    <td className="px-4 py-2.5 whitespace-nowrap">{formatDateTime(a.at)}</td>
                    <td className="px-4 py-2.5">{APPROVAL_STAGE_LABELS[a.stage]}</td>
                    <td className="px-4 py-2.5">
                      {a.officer}
                      <p className="text-[10px] text-gray-400">{a.designation}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <Pill tone={a.decision === 'APPROVED' ? 'emerald' : a.decision === 'REJECTED' ? 'rose' : 'amber'}>{a.decision.toLowerCase()}</Pill>
                    </td>
                    <td className="px-4 py-2.5">{a.remarks || '—'}</td>
                  </tr>
                ))}
              </TableShell>
            </Panel>
          )}

          {tab === 'fees' && (
            <div className="space-y-4">
              <Panel title="Charges (separate financial transactions)" bodyClassName="p-0">
                <TableShell headers={['Type', 'Vote / account', 'Amount', 'Paid', 'Outstanding', 'Status', '']} isEmpty={related.charges.length === 0} empty={<EmptyState title="No charges" />}>
                  {related.charges.map((c) => {
                    const b = chargeBalance(c, db.payments)
                    return (
                      <tr key={c.id} className={c.status === 'CANCELLED' ? 'opacity-50' : ''}>
                        <td className="px-4 py-2.5 font-semibold">
                          {chargeLabel(c.type)}
                          {c.status === 'CANCELLED' && <span className="text-[10px] text-gray-500"> (cancelled)</span>}
                        </td>
                        <td className="px-4 py-2.5">{c.voteCode || <span className="text-gray-400">not configured</span>}</td>
                        <td className="px-4 py-2.5 font-mono">{formatLKR(c.amount)}</td>
                        <td className="px-4 py-2.5 font-mono">{formatLKR(b.paid)}</td>
                        <td className={`px-4 py-2.5 font-mono font-bold ${b.outstanding > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{formatLKR(b.outstanding)}</td>
                        <td className="px-4 py-2.5">
                          <PaymentStatusPill status={b.status} />
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {c.status === 'ACTIVE' && b.outstanding > 0 && can(actor, 'PAYMENT_RECORD') && (
                            <button type="button" className={btnGhost} onClick={() => setPayCharge(c)}>
                              Record payment
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </TableShell>
              </Panel>
              <Panel title="Payments" bodyClassName="p-0">
                <TableShell headers={['Date', 'Type', 'Amount', 'Method', 'Receipt no.', 'Recorded by']} isEmpty={related.payments.length === 0} empty={<EmptyState title="No payments recorded" />}>
                  {related.payments.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-2.5">{formatDate(p.date)}</td>
                      <td className="px-4 py-2.5">{chargeLabel(p.type)}</td>
                      <td className="px-4 py-2.5 font-mono">{formatLKR(p.amount)}</td>
                      <td className="px-4 py-2.5">{PAYMENT_METHOD_LABELS[p.method]}</td>
                      <td className="px-4 py-2.5 font-mono">{p.receiptNo}</td>
                      <td className="px-4 py-2.5">
                        {p.recordedBy}
                        <p className="text-[10px] text-gray-400">{formatDateTime(p.recordedAt)}</p>
                      </td>
                    </tr>
                  ))}
                </TableShell>
              </Panel>
            </div>
          )}

          {tab === 'history' && (
            <Panel title="Audit Trail" bodyClassName="p-0">
              {related.audit.length === 0 ? (
                <EmptyState title="No audit entries" />
              ) : (
                <ul className="divide-y divide-gray-100">
                  {related.audit.map((e) => (
                    <li key={e.id} className="px-5 py-3 text-xs flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                      <span className="text-gray-400 sm:w-40 shrink-0">{formatDateTime(e.at)}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900">{e.action}</p>
                        <p className="text-gray-500 break-words">{e.details}</p>
                      </div>
                      <span className="text-gray-600 sm:text-right shrink-0">
                        {e.actor}
                        <span className="block text-[10px] text-gray-400">{e.designation}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          )}
        </div>

        <Panel title="Next Step" className="xl:col-span-4 xl:sticky xl:top-4">
          {nextAction}
        </Panel>
      </div>

      {editing && <EditApplicationModal app={app} onClose={() => setEditing(false)} />}
      {payCharge && <PaymentModal charge={payCharge} appRef={app.ref} onClose={() => setPayCharge(null)} />}
      {viewInspection && (
        <InspectionReportModal inspection={db.inspections.find((i) => i.id === viewInspection.id) ?? viewInspection} onClose={() => setViewInspection(null)} />
      )}
      {showCert && related.license && <LicenseCertificateModal license={related.license} onClose={() => setShowCert(false)} />}
      {notice && business && (
        <NoticeFormModal
          onClose={() => setNotice(false)}
          businessKey={business.key}
          applicationId={app.id}
          reason="CORRECTIONS_NOT_MET"
          details={`Rectification order for ${app.ref} not complied with by the deadline.`}
        />
      )}
      {withdrawOpen && (
        <Modal
          open
          onClose={() => setWithdrawOpen(false)}
          title={`Withdraw ${app.ref}`}
          footer={
            <>
              <button type="button" className={btnSecondary} onClick={() => setWithdrawOpen(false)}>
                Cancel
              </button>
              <button type="button" className={btnPrimary} onClick={withdraw}>
                Withdraw Application
              </button>
            </>
          }
        >
          <Field label="Reason" required>
            <textarea rows={3} className={inputCls} value={withdrawReason} onChange={(e) => setWithdrawReason(e.target.value)} />
          </Field>
        </Modal>
      )}
    </div>
  )
}

export default ApplicationDetailPage
