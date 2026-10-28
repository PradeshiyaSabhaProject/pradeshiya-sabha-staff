/*
 * Trade License dashboard – laid out to match the main Municipal Command Overview page
 * (square-cornered gray-300 panels, uppercase headings, KPI cards with "Open Desk" footers,
 * an action queue table on the left and side widgets on the right).
 */
import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  Download,
  FileText,
  Gavel,
  PlusCircle,
  RotateCw,
  Search,
  Store,
  Wallet,
} from 'lucide-react'
import { useTradeLicense } from '../context/TradeLicenseContext'
import { dashboardMetrics } from '../rules/selectors'
import { can, chargeBalance, daysBetween, isApplicationOpen, isApplicationOverdue } from '../rules/tradeLicenseRules'
import { APPROVAL_STAGE_DESIGNATION } from '../config/defaultConfig'
import { buildSampleDb } from '../mock/tradeLicenseMockData'
import type { Application, ApplicationStatus } from '../types/tradeLicense'
import { APPLICATION_STATUS_META, Modal, NeedsConfirmation, downloadCsv, formatDate, formatDateTime, formatLKR, todayIso } from '../components/ui'

// ── Styling helpers (same palette as the Overview page) ─────────────────────
type Priority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'
const PRIORITY_BADGES: Record<Priority, string> = {
  URGENT: 'bg-red-50 text-red-700 border-red-200',
  HIGH: 'bg-orange-50 text-orange-800 border-orange-200',
  MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200',
  LOW: 'bg-gray-100 text-gray-700 border-gray-200',
}
const PRIORITY_RANK: Record<Priority, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }

const STAGE_TABS: { id: string; label: string; statuses: ApplicationStatus[] }[] = [
  { id: 'all', label: 'All Stages', statuses: [] },
  { id: 'intake', label: 'Fee & Documents', statuses: ['SUBMITTED', 'DOCUMENT_REVIEW'] },
  { id: 'ri', label: 'RI Review', statuses: ['RI_REVIEW'] },
  { id: 'inspection', label: 'Inspections', statuses: ['UNDER_INSPECTION'] },
  { id: 'corrections', label: 'Corrections', statuses: ['CORRECTIONS_REQUESTED'] },
  { id: 'approval', label: 'Approvals', statuses: ['IN_APPROVAL'] },
  { id: 'issue', label: 'Licence Issue', statuses: ['APPROVED'] },
]

const ACTION_LABEL: Partial<Record<ApplicationStatus, string>> = {
  SUBMITTED: 'Record Fee',
  DOCUMENT_REVIEW: 'Validate',
  RI_REVIEW: 'RI Review',
  UNDER_INSPECTION: 'Inspect',
  CORRECTIONS_REQUESTED: 'Rectify',
  IN_APPROVAL: 'Approve',
  APPROVED: 'Issue',
}

const STATUS_BAR: Record<string, string> = {
  gray: 'bg-gray-400',
  blue: 'bg-blue-500',
  indigo: 'bg-indigo-500',
  teal: 'bg-teal-500',
  amber: 'bg-amber-500',
  purple: 'bg-purple-600',
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
}

const STATUS_ORDER: ApplicationStatus[] = [
  'SUBMITTED',
  'DOCUMENT_REVIEW',
  'RI_REVIEW',
  'UNDER_INSPECTION',
  'CORRECTIONS_REQUESTED',
  'IN_APPROVAL',
  'APPROVED',
  'LICENSED',
  'REJECTED',
  'WITHDRAWN',
]

const panel = 'bg-white border border-gray-300 rounded shadow-xs'
const sectionTitle = 'text-sm font-bold uppercase tracking-wide text-gray-900 flex items-center gap-2'
const smallLink = 'text-[11px] font-bold text-[#A31736] hover:underline uppercase tracking-wider'

function priorityOf(app: Application, today: string, overdue: boolean): Priority {
  if (overdue) return 'URGENT'
  const openCr = app.correctionRequests.find((c) => c.status === 'OPEN')
  if (openCr && daysBetween(today, openCr.deadline) <= 3) return 'HIGH'
  if (app.status === 'IN_APPROVAL' || app.status === 'APPROVED' || app.status === 'CORRECTIONS_REQUESTED') return 'HIGH'
  if (app.status === 'UNDER_INSPECTION' || app.status === 'RI_REVIEW') return 'MEDIUM'
  return 'LOW'
}

export const TradeDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { db, actor, refresh, run, isLoading } = useTradeLicense()
  const year = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(year)
  const [stageTab, setStageTab] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all')
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [lastSynced, setLastSynced] = useState(() => new Date())
  const [resetOpen, setResetOpen] = useState(false)
  const [resetting, setResetting] = useState(false)
  const today = todayIso()

  const m = useMemo(() => (db ? dashboardMetrics(db, today, selectedYear) : null), [db, today, selectedYear])

  const queue = useMemo(() => {
    if (!db) return []
    const tab = STAGE_TABS.find((t) => t.id === stageTab)!
    const needle = search.trim().toLowerCase()
    return db.applications
      .filter((a) => isApplicationOpen(a))
      .map((a) => {
        const overdue = isApplicationOverdue(a, today, db.settings)
        const business = db.businesses.find((b) => b.key === a.businessKey)
        return { app: a, business, overdue, priority: priorityOf(a, today, overdue) }
      })
      .filter((r) => tab.statuses.length === 0 || tab.statuses.includes(r.app.status))
      .filter((r) => priorityFilter === 'all' || r.priority === priorityFilter)
      .filter(
        (r) =>
          !needle ||
          [r.app.ref, r.business?.name, r.business?.businessId, r.app.applicant.name, r.app.portalRef].some((x) => x?.toLowerCase().includes(needle))
      )
      .sort((x, y) => PRIORITY_RANK[x.priority] - PRIORITY_RANK[y.priority] || x.app.createdAt.localeCompare(y.app.createdAt))
  }, [db, stageTab, priorityFilter, search, today])

  if (!db || !m) return null

  const bizName = (key: string) => db.businesses.find((b) => b.key === key)?.name ?? '—'
  const catName = (id: string) => db.categories.find((c) => c.id === id)?.name ?? '—'
  const totalYearApps = Math.max(1, m.submittedApplications)
  const overdueList = db.applications.filter((a) => isApplicationOverdue(a, today, db.settings))
  const recentLicences = [...db.licenses].sort((a, b) => b.issueDate.localeCompare(a.issueDate)).slice(0, 4)
  const activeNotices = db.notices.filter((n) => ['ISSUED', 'REFERRED_TO_LEGAL', 'COURT_ACTION'].includes(n.status))
  const canCreate = can(actor, 'APPLICATION_CREATE')
  const canReset = can(actor, 'SETTINGS_MANAGE')
  const licenceOutstanding = (applicationId: string) =>
    db.charges
      .filter((c) => c.applicationId === applicationId && c.status === 'ACTIVE' && c.type !== 'PROCESSING_FEE')
      .reduce((s, c) => s + chargeBalance(c, db.payments).outstanding, 0)

  const handleRefresh = async () => {
    setRefreshing(true)
    await refresh()
    setLastSynced(new Date())
    setRefreshing(false)
  }

  const handleExport = () =>
    downloadCsv(
      `trade-license-queue-${today}.csv`,
      ['Application', 'Business', 'Business ID', 'Category', 'Stage', 'Priority', 'Overdue', 'Created'],
      queue.map((r) => [
        r.app.ref,
        r.business?.name,
        r.business?.businessId,
        catName(r.app.categoryId),
        APPLICATION_STATUS_META[r.app.status].label,
        r.priority,
        r.overdue ? 'Yes' : 'No',
        r.app.createdAt.slice(0, 10),
      ])
    )

  const handleReset = async () => {
    setResetting(true)
    const res = await run(async (svc, a) => svc.replaceAllData(await buildSampleDb(), a, 'Reset to sample data from dashboard'), 'Sample data loaded.')
    setResetting(false)
    if (res.ok) setResetOpen(false)
  }

  const yearApps = db.applications.filter((a) => a.licenseYear === selectedYear)
  const kpis = [
    {
      label: 'Registered Businesses',
      value: m.totalBusinesses,
      sub: `${db.businesses.filter((b) => b.source === 'FIELD_SURVEY').length} identified by RI field survey`,
      foot: `${m.openApplications} open applications`,
      positive: true,
      to: '/trade-license/inspections?tab=register',
      icon: <Briefcase className="w-5 h-5 text-[#A31736]" />,
    },
    {
      label: `Applications ${selectedYear}`,
      value: m.submittedApplications,
      sub: `${yearApps.filter((a) => a.channel === 'ONLINE').length} online · ${yearApps.filter((a) => a.channel === 'COUNTER').length} counter`,
      foot: `${m.overdueApplications} overdue`,
      positive: m.overdueApplications === 0,
      to: '/trade-license/applications',
      icon: <FileText className="w-5 h-5 text-[#0284c7]" />,
    },
    {
      label: `Licences Issued ${selectedYear}`,
      value: m.issuedLicenses,
      sub: `${m.awaitingIssuance} approved, awaiting issue`,
      foot: `${formatLKR(m.collectedThisYear)} collected`,
      positive: true,
      to: '/trade-license/licenses?tab=register',
      icon: <BadgeCheck className="w-5 h-5 text-[#16a34a]" />,
    },
    {
      label: 'Unpaid Fees',
      value: formatLKR(m.unpaidAmount),
      sub: `${m.unpaidCount} outstanding charge(s)`,
      foot: `${formatLKR(m.unpaidLicenseAmount)} licence fees`,
      positive: m.unpaidAmount === 0,
      to: '/trade-license/licenses?tab=payments',
      icon: <Wallet className="w-5 h-5 text-[#ea580c]" />,
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* ── 1. Header ── */}
      <div className={`${panel} p-4 sm:p-5`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Licence Year {selectedYear}
              </span>
              <span className="text-xs text-gray-500 font-medium hidden sm:inline">
                Synced at {lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              {!db.settings.validityConfirmed && (
                <NeedsConfirmation label="Validity cycle unconfirmed" tooltip="Annual cycle ending 31 December must be formally confirmed (requirements: Licence Validity)." />
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase mt-1">Homagama Pradeshiya Sabha • Trade License Overview</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Revenue survey, trade licence applications, inspections, approvals, fees and enforcement at a glance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              aria-label="Licence year"
              className="px-3 py-2 text-xs bg-white border border-gray-300 rounded font-bold text-gray-700 uppercase tracking-wider cursor-pointer focus:ring-1 focus:ring-[#A31736] focus:border-[#A31736] outline-none"
            >
              {[year + 1, year, year - 1].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing || isLoading}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold px-3.5 py-2 rounded border border-gray-300 transition-colors uppercase tracking-wider shadow-2xs cursor-pointer disabled:opacity-60"
            >
              <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {canCreate && (
              <button
                type="button"
                onClick={() => navigate('/trade-license/applications?new=1')}
                className="inline-flex items-center gap-1.5 bg-[#A31736] hover:bg-[#801028] text-white text-xs font-bold px-4 py-2 rounded transition-colors shadow-2xs uppercase tracking-wider cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                New Application
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. KPI cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((k) => (
          <Link
            key={k.label}
            to={k.to}
            className={`${panel} p-4 sm:p-5 hover:shadow-md hover:border-[#A31736] transition-all flex flex-col justify-between group cursor-pointer min-w-0`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600 truncate">{k.label}</span>
              <div className="p-1.5 bg-rose-50 rounded shrink-0 border border-rose-100 group-hover:scale-105 transition-transform">{k.icon}</div>
            </div>
            <div className="mt-2.5 min-w-0">
              <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight truncate">{k.value}</p>
              <p className="text-xs text-gray-500 font-medium mt-1 truncate">{k.sub}</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2 text-xs">
              <span title={k.foot} className={`font-semibold truncate ${k.positive ? 'text-emerald-700' : 'text-[#A31736]'}`}>{k.foot}</span>
              <span className="text-[11px] font-bold text-[#A31736] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5 shrink-0">
                Open Desk <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* ── 3. Main split ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2/3 */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          {/* Action queue */}
          <div className={`${panel} overflow-hidden flex flex-col`}>
            <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50/70">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                    <Store className="w-5 h-5 text-[#A31736]" />
                    Trade License Action Queue
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Every open application by workflow stage – processing fee, documents, RI review, inspections, approvals and licence issue.
                  </p>
                </div>
                <span className="self-start sm:self-auto text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#A31736]/10 text-[#A31736] border border-[#A31736]/20 whitespace-nowrap">
                  {queue.length} Pending Actions
                </span>
              </div>

              <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
                {STAGE_TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setStageTab(t.id)}
                    className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                      stageTab === t.id ? 'bg-[#A31736] text-white shadow-2xs' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by application ref, business, Business ID or applicant..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded focus:ring-1 focus:ring-[#A31736] focus:border-[#A31736] outline-none text-gray-800"
                  />
                </div>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as 'all' | Priority)}
                  aria-label="Priority"
                  className="w-full sm:w-auto px-3 py-1.5 text-xs bg-white border border-gray-300 rounded focus:ring-1 focus:ring-[#A31736] focus:border-[#A31736] outline-none text-gray-700 font-semibold cursor-pointer uppercase tracking-wider"
                >
                  <option value="all">Priority: All</option>
                  <option value="URGENT">Urgent (overdue)</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
              <table className="w-full table-fixed text-left border-collapse min-w-[680px]">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                    <th className="py-3 px-3 w-[19%]">Application</th>
                    <th className="py-3 px-3 w-[30%]">Business & Applicant</th>
                    <th className="py-3 px-3 w-[21%]">Stage</th>
                    <th className="py-3 px-3 w-[11%]">Priority</th>
                    <th className="py-3 px-3 w-[19%] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {queue.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500 text-xs font-semibold">
                        No open trade licence applications match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    queue.slice(0, 12).map(({ app, business, overdue, priority }) => (
                      <tr key={app.id} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-mono text-xs font-bold text-gray-900">{app.ref}</div>
                          <span
                            className={`text-[10px] font-bold px-1.5 rounded border uppercase tracking-wider inline-block mt-0.5 ${
                              app.channel === 'ONLINE' ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {app.channel === 'ONLINE' ? 'Online' : 'Counter'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-xs font-semibold text-gray-900 group-hover:text-[#A31736] transition-colors truncate">{business?.name ?? '—'}</div>
                          <div className="text-[11px] text-gray-500 mt-0.5 truncate">
                            {catName(app.categoryId)} · <span className="font-medium text-gray-700">{app.applicant.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap overflow-hidden">
                          <span
                            title={APPLICATION_STATUS_META[app.status].label}
                            className="inline-block max-w-full truncate align-middle text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider"
                          >
                            {APPLICATION_STATUS_META[app.status].label}
                          </span>
                          <div className="text-[10px] text-gray-500 mt-1">
                            {app.currentApprovalStage ? `Awaiting ${APPROVAL_STAGE_DESIGNATION[app.currentApprovalStage]}` : `Since ${formatDate(app.createdAt)}`}
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider inline-block ${PRIORITY_BADGES[priority]}`}>
                            {priority}
                          </span>
                          {overdue && <div className="text-[10px] text-red-600 font-bold mt-1">Overdue</div>}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <Link
                            to={`/trade-license/applications/${app.id}`}
                            className="inline-flex items-center gap-1 border border-[#A31736] text-[#A31736] hover:bg-[#A31736] hover:text-white transition-all text-[11px] font-bold px-2.5 py-1.5 rounded bg-white shadow-2xs uppercase tracking-wider"
                            title="Open application"
                          >
                            {ACTION_LABEL[app.status] ?? 'Open'}
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
              <span>
                Showing {Math.min(queue.length, 12)} of {queue.length} open applications
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={handleExport} disabled={queue.length === 0} className={`${smallLink} inline-flex items-center gap-1 cursor-pointer disabled:opacity-40`}>
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
                <Link to="/trade-license/applications" className={smallLink}>
                  All Applications →
                </Link>
                <Link to="/trade-license/approvals" className={smallLink}>
                  Approvals →
                </Link>
              </div>
            </div>
          </div>

          {/* Status summary + revenue */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`${panel} p-4`}>
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wide text-gray-900">Application Status – {selectedYear}</h3>
                <Link to="/trade-license/applications" className={smallLink}>
                  Register →
                </Link>
              </div>
              {m.submittedApplications === 0 ? (
                <p className="py-6 text-center text-xs font-semibold text-gray-500">No applications for this licence year.</p>
              ) : (
                <div className="space-y-2.5">
                  {STATUS_ORDER.filter((s) => m.statusCounts[s]).map((s) => {
                    const meta = APPLICATION_STATUS_META[s]
                    const count = m.statusCounts[s] ?? 0
                    return (
                      <button type="button" key={s} onClick={() => navigate(`/trade-license/applications?status=${s}`)} className="w-full text-left group cursor-pointer">
                        <div className="flex justify-between items-center mb-1 text-xs">
                          <span className="font-bold text-gray-800 truncate group-hover:text-[#A31736]">{meta.label}</span>
                          <span className="font-extrabold text-gray-900">{count}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-sm h-2 overflow-hidden border border-gray-200">
                          <div className={`${STATUS_BAR[meta.tone]} h-2 rounded-sm transition-all duration-700`} style={{ width: `${(count / totalYearApps) * 100}%` }} />
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className={`${panel} p-4`}>
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wide text-gray-900 flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-[#A31736]" /> Licence Revenue
                </h3>
                <Link to="/trade-license/licenses?tab=payments" className={smallLink}>
                  Payments →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded p-2.5 text-center min-w-0">
                  <p className="text-sm font-black text-emerald-800 truncate">{formatLKR(m.collectedThisYear)}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Collected {selectedYear}</p>
                </div>
                <div className="bg-rose-50 border border-rose-200 rounded p-2.5 text-center min-w-0">
                  <p className="text-sm font-black text-rose-800 truncate">{formatLKR(m.unpaidAmount)}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Outstanding</p>
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                {(['PROCESSING_FEE', 'LICENSE_FEE', 'STAMP_DUTY'] as const).map((t) => {
                  const collected = db.payments.filter((p) => p.type === t && p.date.startsWith(String(selectedYear))).reduce((s, p) => s + p.amount, 0)
                  return (
                    <div key={t} className="flex justify-between gap-2 py-1 border-b border-gray-100 last:border-0">
                      <span className="text-gray-600">{t === 'PROCESSING_FEE' ? 'Processing fees' : t === 'LICENSE_FEE' ? 'Licence fees' : 'Stamp duty'}</span>
                      <span className="font-bold text-gray-900">{formatLKR(collected)}</span>
                    </div>
                  )
                })}
              </div>
              <p className="mt-2 text-[10px] text-gray-500">Licences can be issued with fees unpaid – balances stay on the unpaid report.</p>
            </div>
          </div>

          {/* Activity stream */}
          <div className={`${panel} p-4 sm:p-5`}>
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className={sectionTitle}>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Recent Trade License Activity
              </h3>
              <span className="text-xs text-gray-400 font-medium">Audit trail</span>
            </div>
            {db.audit.length === 0 ? (
              <p className="py-4 text-center text-xs font-semibold text-gray-500">No activity recorded yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {db.audit.slice(0, 8).map((e) => (
                  <div key={e.id} className="py-2.5 flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-3 text-xs">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-[#A31736] mt-1.5 shrink-0" />
                      <p className="text-gray-800 font-medium min-w-0 break-words">
                        <strong className="text-gray-900 font-bold">{e.actor}</strong> ({e.designation}) – {e.action}:{' '}
                        <span className="font-bold text-[#A31736]">{e.details}</span>
                      </p>
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium shrink-0 whitespace-nowrap pl-4 sm:pl-0">{formatDateTime(e.at)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1/3 */}
        <div className="space-y-6 min-w-0">
          {/* Workflow pipeline tiles */}
          <div className={`${panel} p-4 sm:p-5`}>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className={sectionTitle}>Workflow Pipeline</h3>
              <Link to="/trade-license/inspections" className={smallLink}>
                Inspections →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/trade-license/inspections" className="bg-teal-50 border border-teal-200 rounded p-2.5 text-center hover:border-teal-400">
                <p className="text-xl font-black text-teal-800">{m.pendingInspections}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Pending Inspections</p>
              </Link>
              <Link to="/trade-license/approvals" className="bg-purple-50 border border-purple-200 rounded p-2.5 text-center hover:border-purple-400">
                <p className="text-xl font-black text-purple-800">{m.pendingApprovals}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Pending Approvals</p>
              </Link>
              <Link to="/trade-license/licenses" className="bg-emerald-50 border border-emerald-200 rounded p-2.5 text-center hover:border-emerald-400">
                <p className="text-xl font-black text-emerald-800">{m.awaitingIssuance}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Awaiting Issue</p>
              </Link>
              <Link to="/trade-license/applications?overdue=1" className="bg-amber-50 border border-amber-200 rounded p-2.5 text-center hover:border-amber-400">
                <p className="text-xl font-black text-amber-800">{m.overdueApplications}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Overdue</p>
              </Link>
            </div>
            <div className="pt-2 mt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
              <span className="text-gray-500 font-medium">
                Awaiting MOH sign-off: <strong className="text-gray-800">{m.pendingMohSignOff}</strong>
              </span>
              <Link to="/trade-license/inspections?tab=corrections" className={smallLink}>
                Corrections →
              </Link>
            </div>
          </div>

          {/* Overdue */}
          <div className={`${panel} p-4 sm:p-5`}>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className={sectionTitle}>
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Overdue Applications
              </h3>
              <Link to="/trade-license/applications?overdue=1" className={smallLink}>
                All ({overdueList.length}) →
              </Link>
            </div>
            {overdueList.length === 0 ? (
              <p className="py-3 text-xs text-gray-500">
                Nothing overdue. Open applications older than {db.settings.overdueApplicationDays} days or past a rectification deadline appear here.
              </p>
            ) : (
              <div className="space-y-2.5">
                {overdueList.slice(0, 4).map((a) => (
                  <Link
                    key={a.id}
                    to={`/trade-license/applications/${a.id}`}
                    className="block p-3 rounded border border-gray-200 bg-rose-50/30 hover:bg-white hover:border-[#A31736] transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-mono text-xs font-black text-[#A31736]">{a.ref}</span>
                        <p className="text-xs font-bold text-gray-900 truncate">{bizName(a.businessKey)}</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-red-50 text-red-700 border-red-200 shrink-0">
                        {daysBetween(a.createdAt, today)} days
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-gray-500">{APPLICATION_STATUS_META[a.status].label}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recently issued */}
          <div className={`${panel} p-4 sm:p-5`}>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className={sectionTitle}>
                <BadgeCheck className="w-4 h-4 text-emerald-600" /> Recently Issued
              </h3>
              <Link to="/trade-license/licenses?tab=register" className={smallLink}>
                Register →
              </Link>
            </div>
            {recentLicences.length === 0 ? (
              <p className="py-3 text-xs text-gray-500">No licences issued yet.</p>
            ) : (
              <div className="space-y-2">
                {recentLicences.map((l) => {
                  const outstanding = licenceOutstanding(l.applicationId)
                  return (
                    <div key={l.id} className="p-2.5 rounded border border-gray-200 bg-gray-50/50 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-gray-900">{l.licenseNo}</span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            outstanding > 0 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'
                          }`}
                        >
                          {outstanding > 0 ? 'Fee due' : 'Paid'}
                        </span>
                      </div>
                      <p className="text-gray-700 font-semibold truncate mt-0.5">{bizName(l.businessKey)}</p>
                      <p className="text-[10px] text-gray-500">
                        Issued {formatDate(l.issueDate)} · valid to {formatDate(l.validUntil)}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Enforcement */}
          <div className={`${panel} p-4 sm:p-5`}>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className={sectionTitle}>
                <Gavel className="w-4 h-4 text-gray-500" /> Enforcement
              </h3>
              <Link to="/trade-license/licenses?tab=notices" className={smallLink}>
                Notices →
              </Link>
            </div>
            {activeNotices.length === 0 ? (
              <p className="py-3 text-xs text-gray-500">No active legal notices.</p>
            ) : (
              <div className="space-y-2">
                {activeNotices.slice(0, 3).map((n) => (
                  <div key={n.id} className="p-2.5 rounded border border-gray-200 bg-gray-50/50 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-gray-900">{n.noticeNo}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-red-50 text-red-700 border-red-200">
                        {n.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-gray-700 font-semibold truncate mt-0.5">{bizName(n.businessKey)}</p>
                    <p className="text-[10px] text-gray-500">14-day deadline {formatDate(n.deadline)}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] text-gray-500">
              Businesses without a licence or application:{' '}
              <Link to="/trade-license/licenses?tab=reports" className="font-bold text-[#A31736] hover:underline">
                view reports
              </Link>
            </div>
          </div>

          {canReset && (
            <div className="text-center">
              <button type="button" onClick={() => setResetOpen(true)} className="text-[11px] font-bold text-gray-400 hover:text-[#A31736] uppercase tracking-wider cursor-pointer">
                Reset to sample data
              </button>
            </div>
          )}
        </div>
      </div>

      {resetOpen && (
        <Modal
          open
          onClose={() => setResetOpen(false)}
          title="Reset to sample data?"
          footer={
            <>
              <button
                type="button"
                onClick={() => setResetOpen(false)}
                className="px-3.5 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={resetting}
                className="px-4 py-2 text-xs font-bold text-white bg-[#A31736] hover:bg-[#801028] rounded uppercase tracking-wider cursor-pointer disabled:opacity-60"
              >
                {resetting ? 'Loading…' : 'Replace with sample data'}
              </button>
            </>
          }
        >
          <p className="text-xs text-gray-700">
            This replaces <strong>all Trade License records saved in this browser</strong> with the built-in sample businesses and applications. Other modules and
            other users are not affected. This cannot be undone.
          </p>
        </Modal>
      )}
    </div>
  )
}

export default TradeDashboardPage
