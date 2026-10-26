import React, { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Download, FileBadge, Gavel, PlusCircle, RefreshCw, Trash2, Plus } from 'lucide-react'
import { useTradeLicense } from '../context/TradeLicenseContext'
import { outstandingCharges, reportIssues, reportNotApplied, reportNotLicensed, reportUnpaid } from '../rules/selectors'
import { can, chargeBalance, daysBetween } from '../rules/tradeLicenseRules'
import type { Application, Charge, ChargeType, FeeBand, LegalNotice, License, NoticeReason, TradeLicenseSettings } from '../types/tradeLicense'
import { FeeAndIssueForm, PaymentModal } from '../components/WorkflowActions'
import LicenseCertificateModal from '../components/LicenseCertificateModal'
import NoticeFormModal, { NOTICE_REASON_LABELS, SERVICE_METHOD_LABELS } from '../components/NoticeFormModal'
import { PAYMENT_METHOD_LABELS, chargeLabel } from '../components/labels'
import {
  AppStatusPill,
  DetailRow,
  EmptyState,
  ErrorBanner,
  Field,
  InfoBanner,
  Modal,
  NeedsConfirmation,
  NoticeStatusPill,
  PageHeader,
  Panel,
  PaymentStatusPill,
  Pill,
  TableShell,
  Tabs,
  btnGhost,
  btnPrimary,
  btnSecondary,
  downloadCsv,
  formatDate,
  formatDateTime,
  formatLKR,
  inputAutoCls,
  inputCls,
  todayIso,
} from '../components/ui'

// ── Fee rules ───────────────────────────────────────────────────────────────
const FeeRules: React.FC = () => {
  const { db, actor, run } = useTradeLicense()
  const [s, setS] = useState<TradeLicenseSettings>(() => structuredClone(db!.settings))
  const [error, setError] = useState<string | null>(null)
  if (!db) return null
  const editable = can(actor, 'SETTINGS_MANAGE')
  const num = (v: string) => (v.trim() === '' ? null : Number(v))
  const setBand = (i: number, patch: Partial<FeeBand>) => setS({ ...s, feeBands: s.feeBands.map((b, j) => (j === i ? { ...b, ...patch } : b)) })
  const save = async () => {
    const res = await run((svc, a) => svc.updateSettings(s, a), 'Fee rules saved.')
    setError(res.ok ? null : res.error)
  }
  return (
    <div className="space-y-4">
      <InfoBanner tone="amber">
        Only values written in the requirements are pre-filled: the "&gt;1500 → Rs. 1,000" band, Tourist Board hotels at 1% of previous year's turnover, and stamp duty at 10%
        capped at Rs. 2,000. All other amounts are blank until an authorised officer enters and confirms them – the system will not apply an unconfirmed rate without an
        explicit confirmation.
        {!editable && ' Only the System Administrator or Secretary can change these rules.'}
      </InfoBanner>
      <Panel title="Licence fee by annual assessment value" bodyClassName="p-0">
        <TableShell headers={['Band label', 'Value greater than', 'Value up to (incl.)', 'Licence fee (Rs.)', 'Confirmed', '']}>
          {s.feeBands.map((b, i) => (
            <tr key={b.id}>
              <td className="px-4 py-2">
                <input className={inputCls} disabled={!editable} value={b.label} onChange={(e) => setBand(i, { label: e.target.value })} />
              </td>
              <td className="px-4 py-2">
                <input type="number" className={inputCls} disabled={!editable} value={b.minExclusive ?? ''} placeholder="no lower limit" onChange={(e) => setBand(i, { minExclusive: num(e.target.value) })} />
              </td>
              <td className="px-4 py-2">
                <input type="number" className={inputCls} disabled={!editable} value={b.maxInclusive ?? ''} placeholder="no upper limit" onChange={(e) => setBand(i, { maxInclusive: num(e.target.value) })} />
              </td>
              <td className="px-4 py-2">
                <input type="number" min={0} className={inputCls} disabled={!editable} value={b.licenseFee ?? ''} placeholder="not provided" onChange={(e) => setBand(i, { licenseFee: num(e.target.value) })} />
              </td>
              <td className="px-4 py-2">
                <label className="flex items-center gap-1.5 text-xs">
                  <input type="checkbox" className="accent-[#A31736]" disabled={!editable} checked={b.confirmed} onChange={(e) => setBand(i, { confirmed: e.target.checked })} />
                  {b.confirmed ? 'Yes' : <NeedsConfirmation label="No" />}
                </label>
              </td>
              <td className="px-4 py-2 text-right">
                {editable && (
                  <button type="button" onClick={() => setS({ ...s, feeBands: s.feeBands.filter((_, j) => j !== i) })} className="p-1.5 text-gray-400 hover:text-rose-600 cursor-pointer" aria-label="Remove band">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </TableShell>
        {editable && (
          <div className="px-4 py-3">
            <button
              type="button"
              className={btnSecondary}
              onClick={() => setS({ ...s, feeBands: [...s.feeBands, { id: `band-${Date.now()}`, label: '', minExclusive: null, maxInclusive: null, licenseFee: null, confirmed: false }] })}
            >
              <Plus className="w-3.5 h-3.5" /> Add band
            </button>
          </div>
        )}
      </Panel>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Rates">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Tourist Board hotel – % of previous turnover">
              <input type="number" step="0.01" className={inputCls} disabled={!editable} value={s.touristHotelTurnoverRate * 100} onChange={(e) => setS({ ...s, touristHotelTurnoverRate: Number(e.target.value) / 100 })} />
            </Field>
            <Field label="Stamp duty – % of licence fee">
              <input type="number" step="0.01" className={inputCls} disabled={!editable} value={s.stampDutyRate * 100} onChange={(e) => setS({ ...s, stampDutyRate: Number(e.target.value) / 100 })} />
            </Field>
            <Field label="Stamp duty cap (Rs.)">
              <input type="number" className={inputCls} disabled={!editable} value={s.stampDutyCap} onChange={(e) => setS({ ...s, stampDutyCap: Number(e.target.value) })} />
            </Field>
            <Field label="Processing fee (Rs.)" hint="Not specified in the requirements.">
              <input type="number" min={0} className={inputCls} disabled={!editable} value={s.processingFee.amount ?? ''} placeholder="not provided" onChange={(e) => setS({ ...s, processingFee: { ...s.processingFee, amount: num(e.target.value) } })} />
            </Field>
            <label className="flex items-center gap-1.5 text-xs sm:col-span-2">
              <input type="checkbox" className="accent-[#A31736]" disabled={!editable} checked={s.processingFee.confirmed} onChange={(e) => setS({ ...s, processingFee: { ...s.processingFee, confirmed: e.target.checked } })} />
              Processing fee amount officially confirmed
            </label>
          </div>
        </Panel>
        <Panel title="Payments, validity & votes">
          <div className="space-y-3">
            <label className="flex items-center gap-1.5 text-xs">
              <input type="checkbox" className="accent-[#A31736]" disabled={!editable} checked={s.allowPartialPayments} onChange={(e) => setS({ ...s, allowPartialPayments: e.target.checked })} />
              Allow partial payments
              {!s.partialPaymentsConfirmed && <NeedsConfirmation label="Policy unconfirmed" />}
            </label>
            <label className="flex items-center gap-1.5 text-xs">
              <input type="checkbox" className="accent-[#A31736]" disabled={!editable} checked={s.partialPaymentsConfirmed} onChange={(e) => setS({ ...s, partialPaymentsConfirmed: e.target.checked })} />
              Partial-payment policy officially confirmed
            </label>
            <label className="flex items-center gap-1.5 text-xs">
              <input type="checkbox" className="accent-[#A31736]" disabled={!editable} checked={s.validityEndsDec31} onChange={(e) => setS({ ...s, validityEndsDec31: e.target.checked })} />
              Licences expire on 31 December of the licence year (otherwise 12 months from issue)
            </label>
            <label className="flex items-center gap-1.5 text-xs">
              <input type="checkbox" className="accent-[#A31736]" disabled={!editable} checked={s.validityConfirmed} onChange={(e) => setS({ ...s, validityConfirmed: e.target.checked })} />
              Validity cycle officially confirmed
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {(['PROCESSING_FEE', 'LICENSE_FEE', 'STAMP_DUTY'] as ChargeType[]).map((t) => (
                <Field key={t} label={`Vote – ${chargeLabel(t)}`}>
                  <input className={inputCls} disabled={!editable} value={s.voteCodes[t]} onChange={(e) => setS({ ...s, voteCodes: { ...s.voteCodes, [t]: e.target.value } })} />
                </Field>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Legal notice period (days)">
                <input type="number" min={1} className={inputCls} disabled={!editable} value={s.legalNoticeDays} onChange={(e) => setS({ ...s, legalNoticeDays: Number(e.target.value) })} />
              </Field>
              <Field label="Overdue application after (days)">
                <input type="number" min={1} className={inputCls} disabled={!editable} value={s.overdueApplicationDays} onChange={(e) => setS({ ...s, overdueApplicationDays: Number(e.target.value) })} />
              </Field>
            </div>
          </div>
        </Panel>
      </div>
      <ErrorBanner message={error} />
      {editable && (
        <button type="button" className={btnPrimary} onClick={save}>
          Save Fee Rules
        </button>
      )}
    </div>
  )
}

// ── Notice actions ──────────────────────────────────────────────────────────
const NoticeModal: React.FC<{ notice: LegalNotice; onClose: () => void }> = ({ notice, onClose }) => {
  const { db, run, actor } = useTradeLicense()
  const [action, setAction] = useState<'RESPONSE' | 'REFER_LEGAL' | 'COURT' | 'PROHIBITION' | 'CLOSE'>('RESPONSE')
  const [date, setDate] = useState(todayIso())
  const [text, setText] = useState('')
  const [complied, setComplied] = useState(true)
  const [court, setCourt] = useState(notice.court?.court ?? '')
  const [caseNo, setCaseNo] = useState(notice.court?.caseNo ?? '')
  const [hearing, setHearing] = useState(notice.court?.hearingDate ?? '')
  const [ref, setRef] = useState('')
  const [error, setError] = useState<string | null>(null)
  if (!db) return null
  const n = db.notices.find((x) => x.id === notice.id) ?? notice
  const business = db.businesses.find((b) => b.key === n.businessKey)
  const closed = n.status === 'CLOSED' || n.status === 'COMPLIED'
  const editable = can(actor, 'NOTICE_MANAGE') && !closed
  const submit = async () => {
    const payload =
      action === 'RESPONSE'
        ? { type: action, date, details: text, complied }
        : action === 'REFER_LEGAL'
          ? { type: action, remarks: text }
          : action === 'COURT'
            ? { type: action, court, caseNo, hearingDate: hearing, outcome: text }
            : action === 'PROHIBITION'
              ? { type: action, ref, date, details: text }
              : { type: action, remarks: text }
    const res = await run((svc, a) => svc.updateNotice(n.id, payload, a), 'Notice updated.')
    if (res.ok) {
      setText('')
      setError(null)
    } else setError(res.error)
  }
  return (
    <Modal open size="lg" onClose={onClose} title={`Legal Notice ${n.noticeNo}`} subtitle={`${business?.name ?? ''} · ${NOTICE_REASON_LABELS[n.reason]}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <DetailRow label="Status" value={<NoticeStatusPill status={n.status} />} />
          <DetailRow label="Reason" value={n.reasonDetails} />
          <DetailRow label="Issued" value={formatDate(n.issueDate)} />
          <DetailRow label="Served" value={`${SERVICE_METHOD_LABELS[n.service.method]} · ${formatDate(n.service.servedOn)} by ${n.service.servedBy}`} />
          {n.service.details && <DetailRow label="Delivery details" value={n.service.details} />}
          <DetailRow label="14-day deadline" value={formatDate(n.deadline)} />
          <DetailRow label="Responsible officer" value={n.responsibleOfficer} />
          {n.response && <DetailRow label="Customer response" value={`${formatDate(n.response.date)} – ${n.response.details}`} />}
          {n.legalReferral && <DetailRow label="Referred for legal action" value={`${formatDate(n.legalReferral.date)} by ${n.legalReferral.referredBy}${n.legalReferral.remarks ? ` – ${n.legalReferral.remarks}` : ''}`} />}
          {n.court && <DetailRow label="Court" value={`${n.court.court} · ${n.court.caseNo}${n.court.hearingDate ? ` · hearing ${formatDate(n.court.hearingDate)}` : ''}${n.court.outcome ? ` · ${n.court.outcome}` : ''}`} />}
          {n.prohibitionOrder && <DetailRow label="Prohibition / closure order" value={`${n.prohibitionOrder.ref} · ${formatDate(n.prohibitionOrder.date)} – ${n.prohibitionOrder.details}`} />}
        </div>
        {editable ? (
          <div className="space-y-3">
            <Field label="Record">
              <select className={inputCls} value={action} onChange={(e) => setAction(e.target.value as typeof action)}>
                <option value="RESPONSE">Customer response / correction</option>
                <option value="REFER_LEGAL">Refer for legal action (after deadline)</option>
                <option value="COURT">Magistrate's Court reference</option>
                <option value="PROHIBITION">Prohibition / closure order</option>
                <option value="CLOSE">Close notice</option>
              </select>
            </Field>
            {action === 'COURT' && (
              <div className="grid grid-cols-2 gap-2">
                <Field label="Court" required>
                  <input className={inputCls} value={court} onChange={(e) => setCourt(e.target.value)} />
                </Field>
                <Field label="Case no." required>
                  <input className={inputCls} value={caseNo} onChange={(e) => setCaseNo(e.target.value)} />
                </Field>
                <Field label="Next hearing">
                  <input type="date" className={inputCls} value={hearing} onChange={(e) => setHearing(e.target.value)} />
                </Field>
              </div>
            )}
            {action === 'PROHIBITION' && (
              <Field label="Order reference" required>
                <input className={inputCls} value={ref} onChange={(e) => setRef(e.target.value)} />
              </Field>
            )}
            {(action === 'RESPONSE' || action === 'PROHIBITION') && (
              <Field label="Date" required>
                <input type="date" max={todayIso()} className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
              </Field>
            )}
            <Field label={action === 'COURT' ? 'Outcome (optional)' : action === 'REFER_LEGAL' ? 'Remarks' : 'Details'} required={action !== 'COURT' && action !== 'REFER_LEGAL'}>
              <textarea rows={3} className={inputCls} value={text} onChange={(e) => setText(e.target.value)} />
            </Field>
            {action === 'RESPONSE' && (
              <label className="flex items-center gap-1.5 text-xs">
                <input type="checkbox" className="accent-[#A31736]" checked={complied} onChange={(e) => setComplied(e.target.checked)} />
                Business has complied – close as complied
              </label>
            )}
            <ErrorBanner message={error} />
            <button type="button" className={btnPrimary} onClick={submit}>
              Save
            </button>
          </div>
        ) : (
          <InfoBanner>{closed ? 'This notice is closed.' : 'Notices are managed by the RI, Chief Inspector or Secretary.'}</InfoBanner>
        )}
      </div>
    </Modal>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────
export const LicensesPaymentsPage: React.FC = () => {
  const { db, actor } = useTradeLicense()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') ?? 'issuance'
  const setTab = (t: string) => setParams(t === 'issuance' ? {} : { tab: t }, { replace: true })
  const year = new Date().getFullYear()
  const [reportYear, setReportYear] = useState(year)
  const [issueApp, setIssueApp] = useState<Application | null>(null)
  const [cert, setCert] = useState<License | null>(null)
  const [payCharge, setPayCharge] = useState<Charge | null>(null)
  const [noticeFor, setNoticeFor] = useState<{ businessKey?: string; reason?: NoticeReason; details?: string } | null>(null)
  const [openNotice, setOpenNotice] = useState<LegalNotice | null>(null)
  const [ledgerType, setLedgerType] = useState<ChargeType | ''>('')

  const data = useMemo(() => {
    if (!db) return null
    const today = todayIso()
    return {
      approved: db.applications.filter((a) => a.status === 'APPROVED'),
      licenses: [...db.licenses].sort((a, b) => b.issueDate.localeCompare(a.issueDate)),
      outstanding: outstandingCharges(db),
      notLicensed: reportNotLicensed(db, reportYear),
      unpaid: reportUnpaid(db),
      issues: reportIssues(db, today),
      notApplied: reportNotApplied(db, reportYear),
    }
  }, [db, reportYear])

  if (!db || !data) return null
  const appOf = (id: string) => db.applications.find((a) => a.id === id)
  const bizOf = (key?: string) => db.businesses.find((b) => b.key === key)
  const ledger = db.payments.filter((p) => !ledgerType || p.type === ledgerType).sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))
  const canNotice = can(actor, 'NOTICE_MANAGE')
  const canPay = can(actor, 'PAYMENT_RECORD')

  const reportHeader = (title: string, count: number, onExport: () => void) => (
    <div className="flex items-center justify-between gap-2 px-5 py-3.5 border-b border-gray-100">
      <h3 className="text-sm font-black text-gray-900">
        {title} <span className="text-gray-400">({count})</span>
      </h3>
      <button type="button" className={btnSecondary} onClick={onExport} disabled={count === 0}>
        <Download className="w-3.5 h-3.5 text-gray-500" /> CSV
      </button>
    </div>
  )

  return (
    <div className="space-y-5">
      <PageHeader
        title="LICENSES & PAYMENTS"
        subtitle="Processing fees, licence fees and stamp duty as separate transactions; licence certificates, renewals, statutory reports and 14-day legal notices."
        badges={
          <>
            {!db.settings.processingFee.confirmed && <NeedsConfirmation label="Processing fee unconfirmed" />}
            {db.settings.feeBands.some((b) => !b.confirmed) && <NeedsConfirmation label="Some fee bands unconfirmed" />}
          </>
        }
      />
      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'issuance', label: 'Fee Assessment & Issuance', count: data.approved.length },
          { id: 'register', label: 'Licence Register', count: data.licenses.length },
          { id: 'payments', label: 'Payments & Charges', count: data.outstanding.length },
          { id: 'reports', label: 'Reports' },
          { id: 'notices', label: 'Legal Notices', count: db.notices.filter((n) => !['CLOSED', 'COMPLIED'].includes(n.status)).length },
          { id: 'rules', label: 'Fee Rules' },
        ]}
      />

      {tab === 'issuance' && (
        <Panel title="Approved by the Chairman – licence fee & certificate" bodyClassName="p-0">
          <InfoBanner>
            Per the requirements, a licence is issued even if the fee is not yet paid. The unpaid balance remains visible on the Payments tab and the "Not paid" report.
          </InfoBanner>
          <TableShell
            headers={['Application', 'Business', 'Approved', 'Licence fee', 'Stamp duty', 'Paid status', '']}
            isEmpty={data.approved.length === 0}
            empty={<EmptyState title="No applications awaiting licence issuance" message="Applications appear here after the Chairman's final approval." />}
          >
            {data.approved.map((a) => {
              const biz = bizOf(a.businessKey)
              const fee = db.charges.filter((c) => c.applicationId === a.id && c.status === 'ACTIVE' && c.type !== 'PROCESSING_FEE')
              const paid = fee.length === 0 ? 'NOT_ASSESSED' : fee.every((c) => chargeBalance(c, db.payments).status === 'PAID') ? 'PAID' : fee.some((c) => chargeBalance(c, db.payments).paid > 0) ? 'PARTIALLY_PAID' : 'UNPAID'
              const approvedAt = db.approvals.filter((d) => d.applicationId === a.id && d.stage === 'CHAIRMAN' && d.decision === 'APPROVED').pop()?.at
              return (
                <tr key={a.id}>
                  <td className="px-4 py-2.5">
                    <Link to={`/trade-license/applications/${a.id}`} className="font-mono font-bold hover:text-[#A31736]">
                      {a.ref}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    {biz?.name}
                    <p className="text-[10px] text-gray-500 font-mono">{biz?.businessId}</p>
                  </td>
                  <td className="px-4 py-2.5">{formatDate(approvedAt)}</td>
                  <td className="px-4 py-2.5 font-mono">{formatLKR(a.feeAssessment?.licenseFee)}</td>
                  <td className="px-4 py-2.5 font-mono">{formatLKR(a.feeAssessment?.stampDuty)}</td>
                  <td className="px-4 py-2.5">
                    <PaymentStatusPill status={paid} />
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button type="button" className={btnGhost} onClick={() => setIssueApp(a)}>
                      {a.feeAssessment ? 'Issue licence' : 'Assess fee'} →
                    </button>
                  </td>
                </tr>
              )
            })}
          </TableShell>
        </Panel>
      )}

      {tab === 'register' && (
        <Panel
          title="Licence Register"
          bodyClassName="p-0"
          actions={
            <button
              type="button"
              className={btnSecondary}
              disabled={data.licenses.length === 0}
              onClick={() =>
                downloadCsv(
                  `trade-licences-${todayIso()}.csv`,
                  ['Licence No', 'Business ID', 'Business', 'Year', 'Issued', 'Valid From', 'Valid Until', 'Outstanding at issue', 'Status'],
                  data.licenses.map((l) => [l.licenseNo, l.businessId, bizOf(l.businessKey)?.name, l.licenseYear, l.issueDate, l.validFrom, l.validUntil, l.outstandingAtIssue, l.status])
                )
              }
            >
              <Download className="w-3.5 h-3.5 text-gray-500" /> CSV
            </button>
          }
        >
          <TableShell
            headers={['Licence', 'Business', 'Year', 'Validity', 'Outstanding now', 'Renewal', '']}
            isEmpty={data.licenses.length === 0}
            empty={<EmptyState title="No licences issued yet" />}
          >
            {data.licenses.map((l) => {
              const biz = bizOf(l.businessKey)
              const outstanding = db.charges
                .filter((c) => c.applicationId === l.applicationId && c.status === 'ACTIVE' && c.type !== 'PROCESSING_FEE')
                .reduce((s, c) => s + chargeBalance(c, db.payments).outstanding, 0)
              const daysLeft = daysBetween(todayIso(), l.validUntil)
              const nextYear = l.licenseYear + 1
              const renewalApp = db.applications.find((a) => a.businessKey === l.businessKey && a.licenseYear === nextYear && a.status !== 'WITHDRAWN')
              return (
                <tr key={l.id}>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <p className="font-mono font-bold">{l.licenseNo}</p>
                    <p className="text-[10px] text-gray-500">Issued {formatDate(l.issueDate)} by {l.issuedBy}</p>
                  </td>
                  <td className="px-4 py-2.5 min-w-[160px]">
                    {biz?.name}
                    <p className="text-[10px] text-gray-500 font-mono">{l.businessId}</p>
                  </td>
                  <td className="px-4 py-2.5">{l.licenseYear}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    {formatDate(l.validFrom)} – {formatDate(l.validUntil)}
                    <p className={`text-[10px] ${daysLeft < 0 ? 'text-rose-600 font-bold' : daysLeft <= 30 ? 'text-amber-700 font-bold' : 'text-gray-400'}`}>
                      {daysLeft < 0 ? 'Expired' : `${daysLeft} day(s) left`}
                      {!l.validityConfirmed && ' · validity unconfirmed'}
                    </p>
                  </td>
                  <td className={`px-4 py-2.5 font-mono font-bold ${outstanding > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{formatLKR(outstanding)}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    {renewalApp ? (
                      <Link to={`/trade-license/applications/${renewalApp.id}`} className={btnGhost}>
                        {renewalApp.ref}
                      </Link>
                    ) : can(actor, 'APPLICATION_CREATE') && nextYear <= year + 1 ? (
                      <Link to={`/trade-license/applications?new=1&business=${l.businessKey}&type=RENEWAL&forYear=${nextYear}`} className={btnGhost}>
                        <RefreshCw className="w-3 h-3" /> Renew for {nextYear}
                      </Link>
                    ) : (
                      <span className="text-[10px] text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button type="button" className={btnGhost} onClick={() => setCert(l)}>
                      <FileBadge className="w-3 h-3" /> Certificate
                    </button>
                  </td>
                </tr>
              )
            })}
          </TableShell>
        </Panel>
      )}

      {tab === 'payments' && (
        <div className="space-y-4">
          <Panel title={`Outstanding Charges (${data.outstanding.length}) · ${formatLKR(data.outstanding.reduce((s, x) => s + x.outstanding, 0))}`} bodyClassName="p-0">
            <TableShell
              headers={['Application', 'Business', 'Charge', 'Vote', 'Amount', 'Paid', 'Outstanding', 'Status', '']}
              isEmpty={data.outstanding.length === 0}
              empty={<EmptyState title="No outstanding charges" />}
            >
              {data.outstanding.map(({ charge, paid, outstanding, status }) => {
                const a = appOf(charge.applicationId)
                return (
                  <tr key={charge.id}>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <Link to={`/trade-license/applications/${charge.applicationId}`} className="font-mono font-bold hover:text-[#A31736]">
                        {a?.ref}
                      </Link>
                      {a && (
                        <div className="mt-0.5">
                          <AppStatusPill status={a.status} />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2.5">{bizOf(charge.businessKey)?.name}</td>
                    <td className="px-4 py-2.5 font-semibold">{chargeLabel(charge.type)}</td>
                    <td className="px-4 py-2.5">{charge.voteCode || <span className="text-gray-400">—</span>}</td>
                    <td className="px-4 py-2.5 font-mono">{formatLKR(charge.amount)}</td>
                    <td className="px-4 py-2.5 font-mono">{formatLKR(paid)}</td>
                    <td className="px-4 py-2.5 font-mono font-bold text-rose-600">{formatLKR(outstanding)}</td>
                    <td className="px-4 py-2.5">
                      <PaymentStatusPill status={status} />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {canPay ? (
                        <button type="button" className={btnGhost} onClick={() => setPayCharge(charge)}>
                          Record payment
                        </button>
                      ) : (
                        <span className="text-[10px] text-gray-400">Counter / Cashier</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </TableShell>
          </Panel>
          <Panel
            title="Payment Ledger"
            bodyClassName="p-0"
            actions={
              <>
                <select className={inputAutoCls} value={ledgerType} onChange={(e) => setLedgerType(e.target.value as ChargeType | '')}>
                  <option value="">All transaction types</option>
                  {(['PROCESSING_FEE', 'LICENSE_FEE', 'STAMP_DUTY'] as ChargeType[]).map((t) => (
                    <option key={t} value={t}>
                      {chargeLabel(t)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className={btnSecondary}
                  disabled={ledger.length === 0}
                  onClick={() =>
                    downloadCsv(
                      `trade-licence-payments-${todayIso()}.csv`,
                      ['Date', 'Receipt', 'Application', 'Business', 'Transaction type', 'Vote', 'Amount', 'Method', 'Recorded by'],
                      ledger.map((p) => {
                        const c = db.charges.find((x) => x.id === p.chargeId)
                        return [p.date, p.receiptNo, appOf(p.applicationId)?.ref, bizOf(c?.businessKey)?.name, chargeLabel(p.type), c?.voteCode, p.amount, PAYMENT_METHOD_LABELS[p.method], p.recordedBy]
                      })
                    )
                  }
                >
                  <Download className="w-3.5 h-3.5 text-gray-500" /> CSV
                </button>
              </>
            }
          >
            <TableShell headers={['Date', 'Receipt no.', 'Application', 'Transaction type', 'Amount', 'Method', 'Recorded by']} isEmpty={ledger.length === 0} empty={<EmptyState title="No payments recorded" />}>
              {ledger.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-2.5 whitespace-nowrap">{formatDate(p.date)}</td>
                  <td className="px-4 py-2.5 font-mono">{p.receiptNo}</td>
                  <td className="px-4 py-2.5">
                    <Link to={`/trade-license/applications/${p.applicationId}`} className="font-mono font-bold hover:text-[#A31736]">
                      {appOf(p.applicationId)?.ref}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">{chargeLabel(p.type)}</td>
                  <td className="px-4 py-2.5 font-mono">{formatLKR(p.amount)}</td>
                  <td className="px-4 py-2.5">{PAYMENT_METHOD_LABELS[p.method]}</td>
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

      {tab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-600">Licence year</span>
            <select className={inputAutoCls} value={reportYear} onChange={(e) => setReportYear(Number(e.target.value))}>
              {[year + 1, year, year - 1].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            {reportHeader(`1. Have not taken the licence (${reportYear})`, data.notLicensed.length, () =>
              downloadCsv(
                `not-licensed-${reportYear}.csv`,
                ['Business ID', 'Business', 'Owner', 'Phone', 'Premises', 'Application', 'Status'],
                data.notLicensed.map((r) => [r.business.businessId, r.business.name, r.business.owner.name, r.business.owner.phone, r.business.premises.address, r.application?.ref, r.application?.status ?? 'No application'])
              )
            )}
            <TableShell headers={['Business', 'Owner', 'Premises', 'Application', '']} isEmpty={data.notLicensed.length === 0} empty={<EmptyState title="Every liable business has a licence for this year" />}>
              {data.notLicensed.map((r) => (
                <tr key={r.business.key}>
                  <td className="px-4 py-2.5">
                    {r.business.name}
                    <p className="text-[10px] text-gray-500 font-mono">{r.business.businessId ?? 'No ID'}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    {r.business.owner.name}
                    <p className="text-[10px] text-gray-400">{r.business.owner.phone}</p>
                  </td>
                  <td className="px-4 py-2.5">{r.business.premises.address}</td>
                  <td className="px-4 py-2.5">
                    {r.application ? (
                      <Link to={`/trade-license/applications/${r.application.id}`} className="inline-flex flex-col gap-0.5">
                        <span className="font-mono font-bold">{r.application.ref}</span>
                        <AppStatusPill status={r.application.status} />
                      </Link>
                    ) : (
                      <Pill tone="rose">No application</Pill>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {canNotice && (
                      <button type="button" className={btnGhost} onClick={() => setNoticeFor({ businessKey: r.business.key, reason: 'NO_LICENSE', details: `No trade licence obtained for ${reportYear}.` })}>
                        <Gavel className="w-3 h-3" /> Notice
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </TableShell>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            {reportHeader('2. Not paid for the licence', data.unpaid.length, () =>
              downloadCsv(
                `licence-fees-unpaid-${todayIso()}.csv`,
                ['Licence', 'Application', 'Business ID', 'Business', 'Amount', 'Paid', 'Outstanding'],
                data.unpaid.map((r) => [r.license?.licenseNo, r.application.ref, r.business?.businessId, r.business?.name, r.balance.amount, r.balance.paid, r.balance.outstanding])
              )
            )}
            <TableShell headers={['Licence / application', 'Business', 'Licence fee + stamp duty', 'Paid', 'Outstanding', '']} isEmpty={data.unpaid.length === 0} empty={<EmptyState title="No unpaid licence fees" />}>
              {data.unpaid.map((r) => (
                <tr key={r.application.id}>
                  <td className="px-4 py-2.5">
                    <p className="font-mono font-bold">{r.license?.licenseNo ?? 'Not yet issued'}</p>
                    <Link to={`/trade-license/applications/${r.application.id}`} className="text-[10px] text-[#A31736] font-mono">
                      {r.application.ref}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">{r.business?.name}</td>
                  <td className="px-4 py-2.5 font-mono">{formatLKR(r.balance.amount)}</td>
                  <td className="px-4 py-2.5 font-mono">{formatLKR(r.balance.paid)}</td>
                  <td className="px-4 py-2.5 font-mono font-bold text-rose-600">{formatLKR(r.balance.outstanding)}</td>
                  <td className="px-4 py-2.5 text-right">
                    {canNotice && (
                      <button type="button" className={btnGhost} onClick={() => setNoticeFor({ businessKey: r.application.businessKey, reason: 'UNPAID_FEE', details: `Licence fee / stamp duty of ${formatLKR(r.balance.outstanding)} unpaid (${r.application.ref}).` })}>
                        <Gavel className="w-3 h-3" /> Notice
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </TableShell>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            {reportHeader('3. Businesses with issues', data.issues.length, () =>
              downloadCsv(
                `businesses-with-issues-${todayIso()}.csv`,
                ['Business ID', 'Business', 'Application', 'Issue', 'Severity'],
                data.issues.map((r) => [r.business?.businessId, r.business?.name, r.application?.ref, r.issue, r.severity])
              )
            )}
            <TableShell headers={['Business', 'Application', 'Issue', 'Severity']} isEmpty={data.issues.length === 0} empty={<EmptyState title="No open issues" />}>
              {data.issues.map((r, i) => (
                <tr key={i}>
                  <td className="px-4 py-2.5">
                    {r.business?.name}
                    <p className="text-[10px] text-gray-500 font-mono">{r.business?.businessId}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    {r.application ? (
                      <Link to={`/trade-license/applications/${r.application.id}`} className="font-mono font-bold hover:text-[#A31736]">
                        {r.application.ref}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-2.5">{r.issue}</td>
                  <td className="px-4 py-2.5">
                    <Pill tone={r.severity === 'high' ? 'rose' : 'amber'}>{r.severity}</Pill>
                  </td>
                </tr>
              ))}
            </TableShell>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            {reportHeader(`4. Have not submitted applications (${reportYear})`, data.notApplied.length, () =>
              downloadCsv(
                `no-application-${reportYear}.csv`,
                ['Business ID', 'Business', 'Owner', 'Phone', 'Premises', 'Surveyed'],
                data.notApplied.map((b) => [b.businessId, b.name, b.owner.name, b.owner.phone, b.premises.address, b.survey?.surveyDate])
              )
            )}
            <TableShell headers={['Business', 'Owner', 'Premises', 'Surveyed', '']} isEmpty={data.notApplied.length === 0} empty={<EmptyState title="Every liable business has applied for this year" />}>
              {data.notApplied.map((b) => (
                <tr key={b.key}>
                  <td className="px-4 py-2.5">
                    {b.name}
                    <p className="text-[10px] text-gray-500 font-mono">{b.businessId ?? 'No ID'}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    {b.owner.name}
                    <p className="text-[10px] text-gray-400">{b.owner.phone}</p>
                  </td>
                  <td className="px-4 py-2.5">{b.premises.address}</td>
                  <td className="px-4 py-2.5">{b.survey ? `${formatDate(b.survey.surveyDate)} · ${b.survey.surveyedBy}` : '—'}</td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    {can(actor, 'APPLICATION_CREATE') && (
                      <Link to={`/trade-license/applications?new=1&business=${b.key}&forYear=${reportYear}${b.businessId ? '&type=RENEWAL' : ''}`} className={btnGhost}>
                        <PlusCircle className="w-3 h-3" /> Apply
                      </Link>
                    )}
                    {canNotice && (
                      <button type="button" className={btnGhost} onClick={() => setNoticeFor({ businessKey: b.key, reason: 'NO_LICENSE', details: `No trade licence application submitted for ${reportYear}.` })}>
                        <Gavel className="w-3 h-3" /> Notice
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </TableShell>
          </div>
        </div>
      )}

      {tab === 'notices' && (
        <Panel
          title="14-day Legal Notices & Enforcement"
          bodyClassName="p-0"
          actions={
            canNotice && (
              <button type="button" className={btnPrimary} onClick={() => setNoticeFor({})}>
                <Gavel className="w-3.5 h-3.5" /> Issue Notice
              </button>
            )
          }
        >
          <TableShell
            headers={['Notice', 'Business', 'Reason', 'Served', 'Deadline', 'Responsible', 'Status', '']}
            isEmpty={db.notices.length === 0}
            empty={<EmptyState title="No legal notices issued" message="Issue notices to businesses that fail to obtain the required licence or pay the required tax/charge." />}
          >
            {[...db.notices]
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .map((n) => {
                const overdue = n.status === 'ISSUED' && n.deadline < todayIso()
                return (
                  <tr key={n.id}>
                    <td className="px-4 py-2.5 font-mono font-bold whitespace-nowrap">{n.noticeNo}</td>
                    <td className="px-4 py-2.5">{bizOf(n.businessKey)?.name}</td>
                    <td className="px-4 py-2.5">{NOTICE_REASON_LABELS[n.reason]}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      {formatDate(n.service.servedOn)}
                      <p className="text-[10px] text-gray-400">{SERVICE_METHOD_LABELS[n.service.method]}</p>
                    </td>
                    <td className={`px-4 py-2.5 whitespace-nowrap ${overdue ? 'text-rose-600 font-bold' : ''}`}>
                      {formatDate(n.deadline)}
                      {overdue && <p className="text-[10px]">Deadline passed</p>}
                    </td>
                    <td className="px-4 py-2.5">{n.responsibleOfficer}</td>
                    <td className="px-4 py-2.5">
                      <NoticeStatusPill status={n.status} />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button type="button" className={btnGhost} onClick={() => setOpenNotice(n)}>
                        Open →
                      </button>
                    </td>
                  </tr>
                )
              })}
          </TableShell>
        </Panel>
      )}

      {tab === 'rules' && <FeeRules key={JSON.stringify(db.settings)} />}

      {issueApp && (
        <Modal open size="lg" onClose={() => setIssueApp(null)} title={`Licence fee & issuance – ${issueApp.ref}`} subtitle={bizOf(issueApp.businessKey)?.name}>
          {appOf(issueApp.id)?.status === 'APPROVED' ? (
            <FeeAndIssueForm
              app={appOf(issueApp.id)!}
              onIssued={(lic) => {
                setIssueApp(null)
                setCert(lic)
              }}
            />
          ) : (
            <InfoBanner>Licence issued.</InfoBanner>
          )}
        </Modal>
      )}
      {cert && <LicenseCertificateModal license={cert} onClose={() => setCert(null)} />}
      {payCharge && <PaymentModal charge={payCharge} appRef={appOf(payCharge.applicationId)?.ref} onClose={() => setPayCharge(null)} />}
      {noticeFor && <NoticeFormModal onClose={() => setNoticeFor(null)} businessKey={noticeFor.businessKey} reason={noticeFor.reason} details={noticeFor.details} />}
      {openNotice && <NoticeModal notice={openNotice} onClose={() => setOpenNotice(null)} />}
    </div>
  )
}

export default LicensesPaymentsPage
