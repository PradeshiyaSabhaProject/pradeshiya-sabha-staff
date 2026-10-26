/* eslint-disable react-refresh/only-export-components */
/*
 * Small UI kit for the Trade License module. Mirrors the styling already used in the
 * Varipanam module (white rounded-2xl panels, #A31736 brand colour, compact uppercase labels).
 */
import React, { useEffect } from 'react'
import { AlertCircle, Inbox, X } from 'lucide-react'
import type {
  ApplicationStatus,
  ApprovalOverallStatus,
  InspectionOverallStatus,
  NoticeStatus,
  PaymentStatus,
} from '../types/tradeLicense'

// ── Formatting ──────────────────────────────────────────────────────────────
export function formatLKR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '—'
  return `Rs.\u00A0${amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDate(iso?: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(iso?: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${formatDate(iso)} ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
}

export const todayIso = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function downloadCsv(filename: string, headers: string[], rows: (string | number | null | undefined)[][]) {
  const esc = (v: string | number | null | undefined) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const csv = [headers.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ── Class constants ─────────────────────────────────────────────────────────
export const inputCls =
  'w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A31736]/20 focus:border-[#A31736] disabled:bg-gray-50 disabled:text-gray-500'
/** Same look as inputCls but sized to its content – for filters in panel headers. */
export const inputAutoCls = inputCls.replace('w-full', 'w-auto')
export const btnPrimary =
  'inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#A31736] hover:bg-[#801028] rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
export const btnSecondary =
  'inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
export const btnGhost =
  'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#A31736] hover:bg-[#A31736]/10 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'
export const btnDanger =
  'inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all cursor-pointer disabled:opacity-50'

// ── Layout pieces ───────────────────────────────────────────────────────────
export const PageHeader: React.FC<{
  title: string
  subtitle: string
  badges?: React.ReactNode
  actions?: React.ReactNode
}> = ({ title, subtitle, badges, actions }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="min-w-0">
        {badges && <div className="flex flex-wrap items-center gap-2 mb-1.5">{badges}</div>}
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">{title}</h1>
        <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </div>
  </div>
)

export const Panel: React.FC<{ title?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode; className?: string; bodyClassName?: string }> = ({
  title,
  actions,
  children,
  className = '',
  bodyClassName = 'p-5',
}) => (
  <div className={`bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden ${className}`}>
    {(title || actions) && (
      <div className="px-5 py-3.5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
        {typeof title === 'string' ? <h2 className="text-sm font-black text-gray-900 tracking-tight">{title}</h2> : title}
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    )}
    <div className={bodyClassName}>{children}</div>
  </div>
)

export const Tabs: React.FC<{
  tabs: { id: string; label: string; count?: number }[]
  active: string
  onChange: (id: string) => void
}> = ({ tabs, active, onChange }) => (
  <div className="flex gap-1 overflow-x-auto bg-white border border-gray-200 rounded-xl p-1 shadow-2xs">
    {tabs.map((t) => (
      <button
        key={t.id}
        type="button"
        onClick={() => onChange(t.id)}
        className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
          active === t.id ? 'bg-[#A31736] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        {t.label}
        {t.count !== undefined && (
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${active === t.id ? 'bg-white/20' : 'bg-gray-100 text-gray-600'}`}>
            {t.count}
          </span>
        )}
      </button>
    ))}
  </div>
)

export const KpiCard: React.FC<{
  label: string
  value: React.ReactNode
  subtext?: string
  tone: 'blue' | 'emerald' | 'rose' | 'amber' | 'purple' | 'teal' | 'gray'
  icon: React.ReactNode
  onClick?: () => void
}> = ({ label, value, subtext, tone, icon, onClick }) => {
  const tones = {
    blue: 'text-blue-700 bg-blue-50 border-blue-200',
    emerald: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    rose: 'text-rose-700 bg-rose-50 border-rose-200',
    amber: 'text-amber-800 bg-amber-50 border-amber-200',
    purple: 'text-purple-800 bg-purple-50 border-purple-200',
    teal: 'text-teal-800 bg-teal-50 border-teal-200',
    gray: 'text-gray-700 bg-gray-50 border-gray-200',
  }
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`text-left p-4 rounded-2xl border transition-all duration-200 ${tones[tone]} ${
        onClick ? 'cursor-pointer hover:shadow-md hover:scale-[1.02]' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="p-2 rounded-xl bg-white/70 shadow-xs">{icon}</span>
        {onClick && <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Open ↗</span>}
      </div>
      <p className="text-[11px] font-semibold text-gray-600 leading-tight truncate" title={label}>
        {label}
      </p>
      <p className="text-xl font-black text-gray-900 mt-1 tracking-tight truncate">{value}</p>
      {subtext && <p className="text-[10px] text-gray-500 mt-0.5 truncate">{subtext}</p>}
    </Comp>
  )
}

// ── Status pills (each status family keeps its own colours) ─────────────────
type Tone = 'gray' | 'blue' | 'amber' | 'emerald' | 'rose' | 'purple' | 'teal' | 'indigo'
const toneCls: Record<Tone, { bg: string; dot: string }> = {
  gray: { bg: 'bg-gray-50 text-gray-700 border-gray-300', dot: 'bg-gray-400' },
  blue: { bg: 'bg-blue-50 text-blue-800 border-blue-300', dot: 'bg-blue-500' },
  amber: { bg: 'bg-amber-50 text-amber-800 border-amber-300', dot: 'bg-amber-500' },
  emerald: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' },
  rose: { bg: 'bg-rose-50 text-rose-800 border-rose-300', dot: 'bg-rose-500' },
  purple: { bg: 'bg-purple-50 text-purple-900 border-purple-300', dot: 'bg-purple-600' },
  teal: { bg: 'bg-teal-50 text-teal-800 border-teal-300', dot: 'bg-teal-500' },
  indigo: { bg: 'bg-indigo-50 text-indigo-800 border-indigo-300', dot: 'bg-indigo-500' },
}

export const Pill: React.FC<{ tone: Tone; children: React.ReactNode; title?: string }> = ({ tone, children, title }) => (
  <span
    title={title}
    className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold rounded-full border whitespace-nowrap ${toneCls[tone].bg}`}
  >
    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${toneCls[tone].dot}`} />
    {children}
  </span>
)

export const APPLICATION_STATUS_META: Record<ApplicationStatus, { label: string; tone: Tone }> = {
  SUBMITTED: { label: 'Submitted – fee pending', tone: 'gray' },
  DOCUMENT_REVIEW: { label: 'Document Validation', tone: 'blue' },
  RI_REVIEW: { label: 'RI Review', tone: 'indigo' },
  UNDER_INSPECTION: { label: 'Under Inspection', tone: 'teal' },
  CORRECTIONS_REQUESTED: { label: 'Corrections Requested', tone: 'amber' },
  IN_APPROVAL: { label: 'In Approval', tone: 'purple' },
  APPROVED: { label: 'Approved – to issue', tone: 'emerald' },
  LICENSED: { label: 'Licensed', tone: 'emerald' },
  REJECTED: { label: 'Rejected', tone: 'rose' },
  WITHDRAWN: { label: 'Withdrawn', tone: 'gray' },
}
const INSPECTION_STATUS_META: Record<InspectionOverallStatus, { label: string; tone: Tone }> = {
  NOT_REQUIRED: { label: 'Not required', tone: 'gray' },
  NOT_STARTED: { label: 'Not started', tone: 'gray' },
  IN_PROGRESS: { label: 'In progress', tone: 'teal' },
  CORRECTIONS_REQUIRED: { label: 'Corrections required', tone: 'amber' },
  REINSPECTION: { label: 'Reinspection', tone: 'indigo' },
  PASSED: { label: 'Passed', tone: 'emerald' },
}
const APPROVAL_STATUS_META: Record<ApprovalOverallStatus, { label: string; tone: Tone }> = {
  NOT_STARTED: { label: 'Not started', tone: 'gray' },
  PENDING: { label: 'Pending', tone: 'purple' },
  APPROVED: { label: 'Approved', tone: 'emerald' },
  REJECTED: { label: 'Rejected', tone: 'rose' },
  RETURNED: { label: 'Returned', tone: 'amber' },
}
const PAYMENT_STATUS_META: Record<PaymentStatus, { label: string; tone: Tone }> = {
  NOT_ASSESSED: { label: 'Not assessed', tone: 'gray' },
  UNPAID: { label: 'Unpaid', tone: 'rose' },
  PARTIALLY_PAID: { label: 'Partially paid', tone: 'amber' },
  PAID: { label: 'Paid', tone: 'emerald' },
}
const NOTICE_STATUS_META: Record<NoticeStatus, { label: string; tone: Tone }> = {
  ISSUED: { label: '14-day notice', tone: 'amber' },
  COMPLIED: { label: 'Complied', tone: 'emerald' },
  REFERRED_TO_LEGAL: { label: 'Referred to legal', tone: 'rose' },
  COURT_ACTION: { label: 'Court action', tone: 'purple' },
  CLOSED: { label: 'Closed', tone: 'gray' },
}

export const AppStatusPill = ({ status }: { status: ApplicationStatus }) => (
  <Pill tone={APPLICATION_STATUS_META[status].tone}>{APPLICATION_STATUS_META[status].label}</Pill>
)
export const InspectionStatusPill = ({ status }: { status: InspectionOverallStatus }) => (
  <Pill tone={INSPECTION_STATUS_META[status].tone}>{INSPECTION_STATUS_META[status].label}</Pill>
)
export const ApprovalStatusPill = ({ status }: { status: ApprovalOverallStatus }) => (
  <Pill tone={APPROVAL_STATUS_META[status].tone}>{APPROVAL_STATUS_META[status].label}</Pill>
)
export const PaymentStatusPill = ({ status }: { status: PaymentStatus }) => (
  <Pill tone={PAYMENT_STATUS_META[status].tone}>{PAYMENT_STATUS_META[status].label}</Pill>
)
export const NoticeStatusPill = ({ status }: { status: NoticeStatus }) => (
  <Pill tone={NOTICE_STATUS_META[status].tone}>{NOTICE_STATUS_META[status].label}</Pill>
)

export const NeedsConfirmation: React.FC<{ label?: string; tooltip?: string }> = ({
  label = 'Needs confirmation',
  tooltip = 'This rule/value is not yet officially confirmed by the Pradeshiya Sabha. It is configurable.',
}) => (
  <span
    title={tooltip}
    className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full cursor-help whitespace-nowrap"
  >
    <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
    {label}
  </span>
)

export const EmptyState: React.FC<{ title: string; message?: string; action?: React.ReactNode }> = ({ title, message, action }) => (
  <div className="flex flex-col items-center justify-center text-center py-12 px-4">
    <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-3">
      <Inbox className="w-6 h-6 text-gray-400" />
    </div>
    <p className="text-sm font-bold text-gray-800">{title}</p>
    {message && <p className="text-xs text-gray-500 mt-1 max-w-md">{message}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
)

export const Spinner: React.FC<{ label?: string }> = ({ label = 'Loading…' }) => (
  <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
    <div className="w-8 h-8 border-3 border-[#A31736]/20 border-t-[#A31736] rounded-full animate-spin" />
    <p className="text-xs font-semibold text-gray-500">{label}</p>
  </div>
)

export const ErrorBanner: React.FC<{ message: string | null }> = ({ message }) =>
  message ? (
    <div className="flex items-start gap-2 p-3 text-xs font-medium text-rose-800 bg-rose-50 border border-rose-200 rounded-xl">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <span className="whitespace-pre-line">{message}</span>
    </div>
  ) : null

export const InfoBanner: React.FC<{ children: React.ReactNode; tone?: 'amber' | 'blue' }> = ({ children, tone = 'blue' }) => (
  <div
    className={`flex items-start gap-2 p-3 text-xs rounded-xl border ${
      tone === 'amber' ? 'text-amber-900 bg-amber-50 border-amber-200' : 'text-blue-900 bg-blue-50 border-blue-200'
    }`}
  >
    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
    <div className="min-w-0">{children}</div>
  </div>
)

export const Field: React.FC<{ label: string; required?: boolean; hint?: string; children: React.ReactNode; className?: string }> = ({
  label,
  required,
  hint,
  children,
  className = '',
}) => (
  <label className={`block ${className}`}>
    <span className="block text-[11px] font-bold text-gray-700 mb-1">
      {label}
      {required && <span className="text-[#A31736]"> *</span>}
    </span>
    {children}
    {hint && <span className="block text-[10px] text-gray-500 mt-1">{hint}</span>}
  </label>
)

export const Modal: React.FC<{
  open: boolean
  title: string
  subtitle?: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'md' | 'lg' | 'xl'
}> = ({ open, title, subtitle, onClose, children, footer, size = 'md' }) => {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  const width = size === 'xl' ? 'max-w-5xl' : size === 'lg' ? 'max-w-3xl' : 'max-w-lg'
  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 animate-fade-in" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
        className={`w-full ${width} bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-200 flex flex-col max-h-[92vh]`}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <div className="min-w-0">
            <h3 className="text-sm font-black text-gray-900 tracking-tight">{title}</h3>
            {subtitle && <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto flex-1">{children}</div>
        {footer && <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/60 rounded-b-2xl flex flex-wrap justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}

export const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex justify-between gap-3 py-1.5 border-b border-gray-50 last:border-0 text-xs">
    <span className="text-gray-500 shrink-0">{label}</span>
    <span className="font-semibold text-gray-900 text-right min-w-0 break-words">{value || '—'}</span>
  </div>
)

export const TableShell: React.FC<{ headers: React.ReactNode[]; children: React.ReactNode; empty?: React.ReactNode; isEmpty?: boolean }> = ({
  headers,
  children,
  empty,
  isEmpty,
}) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left text-xs">
      <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
        <tr>
          {headers.map((h, i) => (
            <th key={i} className="px-4 py-3 whitespace-nowrap">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {isEmpty ? (
          <tr>
            <td colSpan={headers.length}>{empty}</td>
          </tr>
        ) : (
          children
        )}
      </tbody>
    </table>
  </div>
)
