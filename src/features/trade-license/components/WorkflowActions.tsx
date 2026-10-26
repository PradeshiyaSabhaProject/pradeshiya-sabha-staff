/*
 * Reusable workflow action forms. Each one calls the service through the context `run`,
 * so permissions/validation are enforced centrally and errors are shown inline.
 */
import React, { useState } from 'react'
import { useTradeLicense } from '../context/TradeLicenseContext'
import {
  APPROVAL_STAGE_DESIGNATION,
  APPROVAL_STAGE_LABELS,
  INSPECTION_TYPE_DESIGNATION,
  INSPECTION_TYPE_LABELS,
} from '../config/defaultConfig'
import { calculateLicenseFee, calculateStampDuty, can, canActOnStage, chargeBalance, latestInspections } from '../rules/tradeLicenseRules'
import type { Application, ApprovalDecision, Charge, InspectionType, License, PaymentMethod } from '../types/tradeLicense'
import { PAYMENT_METHOD_LABELS, chargeLabel } from './labels'
import {
  ErrorBanner,
  Field,
  InfoBanner,
  Modal,
  NeedsConfirmation,
  btnDanger,
  btnPrimary,
  btnSecondary,
  formatDate,
  formatLKR,
  inputCls,
  todayIso,
} from './ui'


// ── Payment ────────────────────────────────────────────────────────────────
export const PaymentModal: React.FC<{ charge: Charge; onClose: () => void; appRef?: string }> = ({ charge, onClose, appRef }) => {
  const { db, run } = useTradeLicense()
  const balance = db ? chargeBalance(charge, db.payments) : { outstanding: 0, paid: 0 }
  const [amount, setAmount] = useState(String(balance.outstanding))
  const [method, setMethod] = useState<PaymentMethod>(charge.type === 'PROCESSING_FEE' ? 'CASH' : 'CASH')
  const [receiptNo, setReceiptNo] = useState('')
  const [date, setDate] = useState(todayIso())
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  if (!db) return null
  const submit = async () => {
    setSaving(true)
    setError(null)
    const res = await run((svc, actor) => svc.recordPayment(charge.id, { amount: Number(amount), method, receiptNo, date }, actor), 'Payment recorded.')
    setSaving(false)
    if (res.ok) onClose()
    else setError(res.error)
  }
  return (
    <Modal
      open
      onClose={onClose}
      title={`Record ${chargeLabel(charge.type)} Payment`}
      subtitle={`${appRef ?? ''} · Charge ${formatLKR(charge.amount)} · Paid ${formatLKR(balance.paid)} · Outstanding ${formatLKR(balance.outstanding)}`}
      footer={
        <>
          <button type="button" className={btnSecondary} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={btnPrimary} onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : 'Record Payment'}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Amount (Rs.)" required hint={db.settings.allowPartialPayments ? 'Partial payments are enabled.' : 'Full outstanding amount required (partial payments disabled).'}>
          <input type="number" min={0} step="0.01" className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="Payment method" required>
          <select className={inputCls} value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
            {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((m) => (
              <option key={m} value={m}>
                {PAYMENT_METHOD_LABELS[m]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Receipt / reference no." required>
          <input className={inputCls} value={receiptNo} onChange={(e) => setReceiptNo(e.target.value)} />
        </Field>
        <Field label="Payment date" required>
          <input type="date" max={todayIso()} className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <p className="sm:col-span-2 text-[11px] text-gray-500">
          Vote / account: <strong>{charge.voteCode || 'not configured'}</strong>
        </p>
      </div>
      <div className="mt-3">
        <ErrorBanner message={error} />
      </div>
    </Modal>
  )
}

// ── RI review ──────────────────────────────────────────────────────────────
export const RiReviewForm: React.FC<{ app: Application }> = ({ app }) => {
  const { db, run } = useTradeLicense()
  const cat = db?.categories.find((c) => c.id === app.categoryId)
  const [types, setTypes] = useState<InspectionType[]>(app.requiredInspections)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  if (!cat) return null
  const toggle = (t: InspectionType) => setTypes(types.includes(t) ? types.filter((x) => x !== t) : [...types, t])
  const submit = async () => {
    const res = await run((svc, actor) => svc.completeRiReview(app.id, { requiredInspections: types, notes }, actor), 'RI review completed.')
    setError(res.ok ? null : res.error)
  }
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-600">
        Confirm the business category and the inspections required. Inspections mandatory for <strong>{cat.name}</strong> are locked.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {(Object.keys(INSPECTION_TYPE_LABELS) as InspectionType[]).map((t) => {
          const locked = cat.requiredInspections.includes(t)
          return (
            <label key={t} className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs ${types.includes(t) ? 'border-[#A31736]/40 bg-[#A31736]/5' : 'border-gray-200'}`}>
              <input type="checkbox" className="accent-[#A31736]" checked={types.includes(t)} disabled={locked} onChange={() => toggle(t)} />
              <span className="flex-1 font-semibold text-gray-800">{INSPECTION_TYPE_LABELS[t]}</span>
              <span className="text-[10px] text-gray-400">{locked ? 'Mandatory' : INSPECTION_TYPE_DESIGNATION[t]}</span>
            </label>
          )
        })}
      </div>
      {cat.mohSignOffRequired && <p className="text-[11px] text-gray-500">PHI report must be signed by the MOH for this category.</p>}
      <Field label="RI notes (field survey / business verification)">
        <textarea rows={2} className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
      <ErrorBanner message={error} />
      <button type="button" className={btnPrimary} onClick={submit}>
        Complete RI Review
      </button>
    </div>
  )
}

// ── Assign inspection ──────────────────────────────────────────────────────
export const AssignInspectionForm: React.FC<{ app: Application; onDone?: () => void }> = ({ app, onDone }) => {
  const { db, run } = useTradeLicense()
  const latest = db ? latestInspections(app, db.inspections) : {}
  const open = app.requiredInspections.filter((t) => !latest[t])
  const [type, setType] = useState<InspectionType | ''>(open[0] ?? '')
  const [assignedTo, setAssignedTo] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  if (open.length === 0) return <p className="text-xs text-gray-500">All required inspections have been assigned.</p>
  const submit = async () => {
    if (!type) return
    const res = await run((svc, actor) => svc.assignInspection(app.id, type, { assignedTo, dueDate }, actor), 'Inspection assigned.')
    if (res.ok) {
      setAssignedTo('')
      setDueDate('')
      setType(open.filter((t) => t !== type)[0] ?? '')
      setError(null)
      onDone?.()
    } else setError(res.error)
  }
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="Inspection" required>
          <select className={inputCls} value={type} onChange={(e) => setType(e.target.value as InspectionType)}>
            {open.map((t) => (
              <option key={t} value={t}>
                {INSPECTION_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </Field>
        <Field label={`Officer (${type ? INSPECTION_TYPE_DESIGNATION[type] : ''})`} required>
          <input className={inputCls} value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} placeholder="Officer name" />
        </Field>
        <Field label="Due date">
          <input type="date" min={todayIso()} className={inputCls} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </Field>
      </div>
      <ErrorBanner message={error} />
      <button type="button" className={btnPrimary} onClick={submit}>
        Assign Inspection
      </button>
    </div>
  )
}

// ── Correction / rectification ─────────────────────────────────────────────
export const RectifyForm: React.FC<{ app: Application; onIssueNotice?: () => void }> = ({ app, onIssueNotice }) => {
  const { run, actor } = useTradeLicense()
  const cr = [...app.correctionRequests].reverse().find((c) => c.status !== 'RECTIFIED')
  const [note, setNote] = useState('')
  const [extra, setExtra] = useState<InspectionType[]>([])
  const [error, setError] = useState<string | null>(null)
  if (!cr) return null
  const overdue = cr.deadline < todayIso()
  const allowed = can(actor, 'CORRECTION_MANAGE')
  const rectify = async () => {
    const res = await run((svc, a) => svc.rectifyCorrection(app.id, cr.id, { note, reinspectionTypes: extra }, a), 'Corrections recorded.')
    setError(res.ok ? null : res.error)
  }
  const missed = async () => {
    const res = await run((svc, a) => svc.markCorrectionDeadlineMissed(app.id, cr.id, a), 'Deadline marked as missed.')
    setError(res.ok ? null : res.error)
  }
  return (
    <div className="space-y-3">
      <div className={`p-3 rounded-xl border text-xs ${overdue ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'}`}>
        <p className="font-bold text-gray-900">
          Rectification order ({cr.source === 'INSPECTION' ? 'inspection findings' : `returned by ${cr.raisedByDesignation}`}) · deadline {formatDate(cr.deadline)}
          {cr.status === 'DEADLINE_MISSED' ? ' · DEADLINE MISSED' : overdue ? ' · OVERDUE' : ''}
        </p>
        <p className="whitespace-pre-line text-gray-700 mt-1">{cr.issues}</p>
        {cr.reinspectionTypes.length > 0 && (
          <p className="text-[11px] text-gray-500 mt-1">Reinspection required: {cr.reinspectionTypes.map((t) => INSPECTION_TYPE_LABELS[t]).join(', ')}</p>
        )}
      </div>
      {allowed ? (
        <>
          <Field label="How were the issues rectified?" required>
            <textarea rows={2} className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
          {cr.source === 'APPROVAL' && (
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="font-semibold text-gray-600">Re-inspect (optional):</span>
              {app.requiredInspections.map((t) => (
                <label key={t} className="flex items-center gap-1">
                  <input type="checkbox" className="accent-[#A31736]" checked={extra.includes(t)} onChange={() => setExtra(extra.includes(t) ? extra.filter((x) => x !== t) : [...extra, t])} />
                  {INSPECTION_TYPE_LABELS[t]}
                </label>
              ))}
            </div>
          )}
          <ErrorBanner message={error} />
          <div className="flex flex-wrap gap-2">
            <button type="button" className={btnPrimary} onClick={rectify}>
              {cr.reinspectionTypes.length || extra.length ? 'Rectified – Schedule Reinspection' : 'Rectified – Return to Approval'}
            </button>
            {cr.status === 'OPEN' && overdue && (
              <button type="button" className={btnDanger} onClick={missed}>
                Mark Deadline Missed
              </button>
            )}
            {cr.status === 'DEADLINE_MISSED' && onIssueNotice && (
              <button type="button" className={btnDanger} onClick={onIssueNotice}>
                Issue 14-day Legal Notice
              </button>
            )}
          </div>
        </>
      ) : (
        <InfoBanner>Rectification is managed by the Revenue Inspector or Chief Inspector.</InfoBanner>
      )}
    </div>
  )
}

// ── Approval decision ──────────────────────────────────────────────────────
export const ApprovalDecisionForm: React.FC<{ app: Application; onDone?: () => void }> = ({ app, onDone }) => {
  const { run, actor } = useTradeLicense()
  const [remarks, setRemarks] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const stage = app.currentApprovalStage
  if (!stage) return null
  if (!canActOnStage(actor, stage)) {
    return (
      <InfoBanner>
        Awaiting <strong>{APPROVAL_STAGE_LABELS[stage]}</strong> by the {APPROVAL_STAGE_DESIGNATION[stage]}. Your role does not have permission to decide at this stage.
      </InfoBanner>
    )
  }
  const decide = async (decision: ApprovalDecision['decision']) => {
    setBusy(true)
    const msg = decision === 'APPROVED' ? 'Approved and forwarded.' : decision === 'REJECTED' ? 'Application rejected.' : 'Returned for correction.'
    const res = await run((svc, a) => svc.recordApprovalDecision(app.id, { decision, remarks }, a), msg)
    setBusy(false)
    if (res.ok) {
      setRemarks('')
      setError(null)
      onDone?.()
    } else setError(res.error)
  }
  const isLast = app.approvalStages[app.approvalStages.length - 1] === stage
  return (
    <div className="space-y-3">
      <Field label={`Remarks – ${APPROVAL_STAGE_LABELS[stage]}`} hint="Required to reject or return.">
        <textarea rows={3} className={inputCls} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
      </Field>
      <ErrorBanner message={error} />
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} className={btnPrimary} onClick={() => decide('APPROVED')}>
          {isLast ? 'Grant Final Approval' : 'Approve & Forward'}
        </button>
        <button type="button" disabled={busy} className={btnSecondary} onClick={() => decide('RETURNED')}>
          Request Corrections
        </button>
        <button type="button" disabled={busy} className={btnDanger} onClick={() => decide('REJECTED')}>
          Reject
        </button>
      </div>
    </div>
  )
}

// ── Fee assessment & issuance ──────────────────────────────────────────────
export const FeeAndIssueForm: React.FC<{ app: Application; onIssued?: (license: License) => void }> = ({ app, onIssued }) => {
  const { db, run, actor } = useTradeLicense()
  const [mode, setMode] = useState<'RULE' | 'MANUAL'>('RULE')
  const [confirmRule, setConfirmRule] = useState(false)
  const [manualAmount, setManualAmount] = useState('')
  const [manualReason, setManualReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  if (!db) return null
  const business = db.businesses.find((b) => b.key === app.businessKey)
  if (!business) return null
  const calc = calculateLicenseFee(business, db.settings)
  const canAssess = can(actor, 'FEE_ASSESS')
  const canIssue = can(actor, 'LICENSE_ISSUE')

  const assess = async () => {
    const res = await run(
      (svc, a) =>
        svc.assessLicenseFee(
          app.id,
          mode === 'RULE' ? { mode, confirmUnconfirmedRule: confirmRule } : { mode, manualAmount: Number(manualAmount), manualReason },
          a
        ),
      'Licence fee and stamp duty recorded.'
    )
    setError(res.ok ? null : res.error)
  }
  const issue = async () => {
    const res = await run((svc, a) => svc.issueLicense(app.id, a), 'Licence issued.')
    if (res.ok) onIssued?.(res.value)
    setError(res.ok ? null : res.error)
  }
  const outstanding = db.charges
    .filter((c) => c.applicationId === app.id && c.status === 'ACTIVE' && c.type !== 'PROCESSING_FEE')
    .reduce((s, c) => s + chargeBalance(c, db.payments).outstanding, 0)

  return (
    <div className="space-y-4">
      {app.feeAssessment ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
            <p className="text-gray-500">Licence fee</p>
            <p className="font-black text-gray-900">{formatLKR(app.feeAssessment.licenseFee)}</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
            <p className="text-gray-500">Stamp duty</p>
            <p className="font-black text-gray-900">{formatLKR(app.feeAssessment.stampDuty)}</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
            <p className="text-gray-500">Basis</p>
            <p className="font-bold text-gray-900">
              {app.feeAssessment.basis === 'MANUAL'
                ? 'Manual entry'
                : app.feeAssessment.basis === 'TOURIST_HOTEL_TURNOVER'
                  ? 'Turnover × 1%'
                  : `Band ${app.feeAssessment.bandLabel}`}
            </p>
          </div>
          <div className={`p-3 rounded-xl border ${outstanding > 0 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
            <p className="text-gray-500">Outstanding</p>
            <p className="font-black text-gray-900">{formatLKR(outstanding)}</p>
          </div>
          {app.feeAssessment.manualReason && <p className="col-span-full text-[11px] text-gray-500">Manual fee justification: {app.feeAssessment.manualReason}</p>}
        </div>
      ) : (
        <p className="text-xs text-gray-600">Record the final licence fee and stamp duty. These are separate charges from the processing fee.</p>
      )}

      {app.status === 'APPROVED' && canAssess && (
        <div className="p-4 rounded-2xl border border-gray-200 space-y-3">
          <div className="flex bg-gray-100 rounded-lg p-0.5 text-[11px] font-bold w-fit">
            {(['RULE', 'MANUAL'] as const).map((m) => (
              <button key={m} type="button" onClick={() => setMode(m)} className={`px-2.5 py-1 rounded-md cursor-pointer ${mode === m ? 'bg-white shadow-2xs text-[#A31736]' : 'text-gray-600'}`}>
                {m === 'RULE' ? 'Calculate from rules' : 'Officer-entered amount'}
              </button>
            ))}
          </div>
          {mode === 'RULE' ? (
            calc.ok ? (
              <div className="space-y-2 text-xs">
                <p>
                  {calc.explanation} → licence fee <strong>{formatLKR(calc.licenseFee)}</strong>, stamp duty (10%, max {formatLKR(db.settings.stampDutyCap)}){' '}
                  <strong>{formatLKR(calc.stampDuty)}</strong>.
                </p>
                {!calc.confirmed && (
                  <label className="flex items-start gap-2 text-amber-900">
                    <input type="checkbox" className="accent-[#A31736] mt-0.5" checked={confirmRule} onChange={(e) => setConfirmRule(e.target.checked)} />
                    <span>
                      <NeedsConfirmation /> I confirm this band fee is officially approved and may be applied.
                    </span>
                  </label>
                )}
              </div>
            ) : (
              <InfoBanner tone="amber">{calc.reason}</InfoBanner>
            )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Licence fee (Rs.)" required hint={manualAmount ? `Stamp duty: ${formatLKR(calculateStampDuty(Number(manualAmount), db.settings))}` : undefined}>
                <input type="number" min={0} step="0.01" className={inputCls} value={manualAmount} onChange={(e) => setManualAmount(e.target.value)} />
              </Field>
              <Field label="Justification / approval reference" required className="sm:col-span-2">
                <input className={inputCls} value={manualReason} onChange={(e) => setManualReason(e.target.value)} placeholder="e.g. Secretary approval ref. / gazette ref." />
              </Field>
            </div>
          )}
          <button type="button" className={btnSecondary} onClick={assess} disabled={mode === 'RULE' && !calc.ok}>
            {app.feeAssessment ? 'Re-assess Fee' : 'Record Licence Fee & Stamp Duty'}
          </button>
        </div>
      )}

      {app.status === 'APPROVED' && (
        <div className="space-y-2">
          {app.feeAssessment && outstanding > 0 && (
            <InfoBanner tone="amber">
              {formatLKR(outstanding)} is unpaid. Per the requirements the licence can still be issued; the balance stays on the unpaid-fees report.
            </InfoBanner>
          )}
          {canIssue ? (
            <button type="button" className={btnPrimary} onClick={issue} disabled={!app.feeAssessment}>
              Issue Licence Certificate
            </button>
          ) : (
            <p className="text-[11px] text-gray-500">Licences are issued by the Counter Officer or Secretary.</p>
          )}
        </div>
      )}
      <ErrorBanner message={error} />
    </div>
  )
}
