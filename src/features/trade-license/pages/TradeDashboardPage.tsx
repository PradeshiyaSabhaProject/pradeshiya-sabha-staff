import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  BadgeCheck,
  Briefcase,
  ClipboardCheck,
  Clock,
  FileText,
  Gavel,
  PlusCircle,
  RotateCw,
  Stamp,
  Wallet,
} from 'lucide-react'
import { useTradeLicense } from '../context/TradeLicenseContext'
import { dashboardMetrics } from '../rules/selectors'
import { can, canActOnStage, canSubmitInspection, isApplicationOverdue } from '../rules/tradeLicenseRules'
import { APPROVAL_STAGE_LABELS, INSPECTION_TYPE_LABELS } from '../config/defaultConfig'
import type { ApplicationStatus } from '../types/tradeLicense'
import {
  APPLICATION_STATUS_META,
  AppStatusPill,
  EmptyState,
  KpiCard,
  NeedsConfirmation,
  PageHeader,
  Panel,
  btnPrimary,
  btnSecondary,
  formatDateTime,
  formatLKR,
  todayIso,
} from '../components/ui'

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

const BAR_COLORS: Record<string, string> = {
  gray: 'bg-gray-400',
  blue: 'bg-blue-500',
  indigo: 'bg-indigo-500',
  teal: 'bg-teal-500',
  amber: 'bg-amber-500',
  purple: 'bg-purple-600',
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
}

export const TradeDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { db, actor, refresh } = useTradeLicense()
  const year = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(year)
  const today = todayIso()

  const m = useMemo(() => (db ? dashboardMetrics(db, today, selectedYear) : null), [db, today, selectedYear])

  const myWork = useMemo(() => {
    if (!db) return []
    const items: { label: string; count: number; to: string }[] = []
    const d = actor.designation
    if (can(d, 'DOCUMENT_VERIFY'))
      items.push({ label: 'Applications awaiting document validation', count: db.applications.filter((a) => a.status === 'DOCUMENT_REVIEW').length, to: '/trade-license/applications?status=DOCUMENT_REVIEW' })
    if (can(d, 'PAYMENT_RECORD'))
      items.push({ label: 'Online applications awaiting processing-fee payment', count: db.applications.filter((a) => a.status === 'SUBMITTED').length, to: '/trade-license/licenses?tab=payments' })
    if (can(d, 'RI_REVIEW'))
      items.push({ label: 'Applications awaiting RI review', count: db.applications.filter((a) => a.status === 'RI_REVIEW').length, to: '/trade-license/inspections' })
    if (can(d, 'CORRECTION_MANAGE'))
      items.push({ label: 'Open rectification orders', count: db.applications.filter((a) => a.status === 'CORRECTIONS_REQUESTED').length, to: '/trade-license/inspections?tab=corrections' })
    const myInspections = db.inspections.filter((i) => i.status === 'ASSIGNED' && canSubmitInspection(d, i.type)).length
    if (myInspections || ['Public Health Inspector', 'Environmental Officer', 'Fire Safety Officer'].includes(d))
      items.push({ label: 'Inspections assigned to my office', count: myInspections, to: '/trade-license/inspections' })
    if (d === 'Medical Officer of Health')
      items.push({ label: 'PHI reports awaiting MOH sign-off', count: m?.pendingMohSignOff ?? 0, to: '/trade-license/inspections' })
    const approvals = db.applications.filter((a) => a.status === 'IN_APPROVAL' && canActOnStage(d, a.currentApprovalStage)).length
    if (approvals || ['Chief Inspector', 'Secretary', 'Chairman'].includes(d))
      items.push({ label: 'Applications awaiting my approval', count: approvals, to: '/trade-license/approvals' })
    if (can(d, 'LICENSE_ISSUE') || can(d, 'FEE_ASSESS'))
      items.push({ label: 'Approved – licence fee / issuance pending', count: db.applications.filter((a) => a.status === 'APPROVED').length, to: '/trade-license/licenses' })
    return items
  }, [db, actor.designation, m?.pendingMohSignOff])

  if (!db || !m) return null

  const totalYearApps = Math.max(1, m.submittedApplications)
  const overdueList = db.applications.filter((a) => isApplicationOverdue(a, today, db.settings)).slice(0, 6)
  const bizName = (key: string) => db.businesses.find((b) => b.key === key)?.name ?? '—'

  return (
    <div className="space-y-5">
      <PageHeader
        title="TRADE LICENSE • DASHBOARD"
        subtitle="Revenue survey, trade licence applications, inspections, approvals, fees and enforcement at a glance."
        badges={
          <>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LICENCE YEAR {selectedYear}
            </span>
            {!db.settings.validityConfirmed && <NeedsConfirmation label="Validity cycle unconfirmed" tooltip="Annual cycle ending 31 December must be formally confirmed (requirements: Licence Validity)." />}
          </>
        }
        actions={
          <>
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="px-3 py-2 text-xs font-bold bg-gray-50 border border-gray-300 rounded-xl">
              {[year + 1, year, year - 1].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => refresh()} className={btnSecondary}>
              <RotateCw className="w-3.5 h-3.5 text-gray-500" /> REFRESH
            </button>
            {can(actor.designation, 'APPLICATION_CREATE') && (
              <button type="button" onClick={() => navigate('/trade-license/applications?new=1')} className={btnPrimary}>
                <PlusCircle className="w-3.5 h-3.5" /> NEW APPLICATION
              </button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
        <KpiCard tone="blue" label="Total Businesses" value={m.totalBusinesses} subtext="In business register" icon={<Briefcase className="w-5 h-5 text-blue-600" />} onClick={() => navigate('/trade-license/inspections?tab=register')} />
        <KpiCard tone="gray" label="Applications" value={m.submittedApplications} subtext={`${m.openApplications} open overall`} icon={<FileText className="w-5 h-5 text-gray-600" />} onClick={() => navigate('/trade-license/applications')} />
        <KpiCard tone="teal" label="Pending Inspections" value={m.pendingInspections} subtext={`${m.pendingMohSignOff} awaiting MOH`} icon={<ClipboardCheck className="w-5 h-5 text-teal-600" />} onClick={() => navigate('/trade-license/inspections')} />
        <KpiCard tone="purple" label="Pending Approvals" value={m.pendingApprovals} subtext="RI · CI · Sec · Chair" icon={<Stamp className="w-5 h-5 text-purple-600" />} onClick={() => navigate('/trade-license/approvals')} />
        <KpiCard tone="emerald" label="Licences Issued" value={m.issuedLicenses} subtext={`${m.awaitingIssuance} awaiting issue`} icon={<BadgeCheck className="w-5 h-5 text-emerald-600" />} onClick={() => navigate('/trade-license/licenses?tab=register')} />
        <KpiCard tone="rose" label="Unpaid Fees" value={formatLKR(m.unpaidAmount)} subtext={`${m.unpaidCount} charge(s) open`} icon={<Wallet className="w-5 h-5 text-rose-600" />} onClick={() => navigate('/trade-license/licenses?tab=payments')} />
        <KpiCard tone="amber" label="Overdue Applications" value={m.overdueApplications} subtext={`> ${db.settings.overdueApplicationDays} days / deadline`} icon={<Clock className="w-5 h-5 text-amber-600" />} onClick={() => navigate('/trade-license/applications?overdue=1')} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <Panel title={`Application Status Summary – ${selectedYear}`} className="xl:col-span-7">
          {m.submittedApplications === 0 ? (
            <EmptyState title="No applications for this licence year yet" message="Applications registered at the counter or received online will be summarised here." />
          ) : (
            <div className="space-y-2.5">
              {STATUS_ORDER.filter((s) => m.statusCounts[s]).map((s) => {
                const meta = APPLICATION_STATUS_META[s]
                const count = m.statusCounts[s] ?? 0
                return (
                  <button
                    type="button"
                    key={s}
                    onClick={() => navigate(`/trade-license/applications?status=${s}`)}
                    className="w-full grid grid-cols-[150px_1fr_40px] items-center gap-3 text-xs group cursor-pointer"
                  >
                    <span className="text-left font-semibold text-gray-700 truncate group-hover:text-[#A31736]">{meta.label}</span>
                    <span className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <span className={`block h-full rounded-full ${BAR_COLORS[meta.tone]}`} style={{ width: `${(count / totalYearApps) * 100}%` }} />
                    </span>
                    <span className="text-right font-black text-gray-900">{count}</span>
                  </button>
                )
              })}
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-gray-100 text-xs">
            <div>
              <p className="text-gray-500">Collected in {selectedYear}</p>
              <p className="font-black text-gray-900">{formatLKR(m.collectedThisYear)}</p>
            </div>
            <div>
              <p className="text-gray-500">Unpaid licence fee + stamp duty</p>
              <p className="font-black text-rose-700">{formatLKR(m.unpaidLicenseAmount)}</p>
            </div>
            <div>
              <p className="text-gray-500">Active legal notices</p>
              <p className="font-black text-gray-900 flex items-center gap-1">
                <Gavel className="w-3.5 h-3.5 text-gray-400" /> {m.activeNotices}
              </p>
            </div>
          </div>
        </Panel>

        <Panel title={`My Work Queue – ${actor.designation}`} className="xl:col-span-5" bodyClassName="p-3">
          {myWork.length === 0 ? (
            <EmptyState title="No queue for this office" message="Switch the acting designation above to see work for another office." />
          ) : (
            <ul className="divide-y divide-gray-100">
              {myWork.map((w) => (
                <li key={w.label}>
                  <button type="button" onClick={() => navigate(w.to)} className="w-full flex items-center justify-between gap-3 px-3 py-3 text-xs text-left rounded-xl hover:bg-gray-50 cursor-pointer">
                    <span className="font-semibold text-gray-700">{w.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${w.count > 0 ? 'bg-[#A31736] text-white' : 'bg-gray-100 text-gray-500'}`}>{w.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <Panel title="Recent Activity" className="xl:col-span-7" bodyClassName="p-0">
          {db.audit.length === 0 ? (
            <EmptyState title="No activity recorded yet" />
          ) : (
            <ul className="divide-y divide-gray-100">
              {db.audit.slice(0, 12).map((e) => (
                <li key={e.id} className="px-5 py-3 text-xs flex gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#A31736]/60 mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900">{e.action}</p>
                    <p className="text-gray-500 truncate" title={e.details}>
                      {e.details}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-gray-700 font-medium">{e.actor}</p>
                    <p className="text-[10px] text-gray-400">
                      {e.designation} · {formatDateTime(e.at)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title={
            <h2 className="text-sm font-black text-gray-900 tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Overdue Applications
            </h2>
          }
          className="xl:col-span-5"
          bodyClassName="p-0"
        >
          {overdueList.length === 0 ? (
            <EmptyState title="Nothing overdue" message={`Open applications older than ${db.settings.overdueApplicationDays} days or with a missed rectification deadline appear here.`} />
          ) : (
            <ul className="divide-y divide-gray-100">
              {overdueList.map((a) => (
                <li key={a.id}>
                  <button type="button" onClick={() => navigate(`/trade-license/applications/${a.id}`)} className="w-full px-5 py-3 text-xs flex items-center justify-between gap-3 hover:bg-gray-50 text-left cursor-pointer">
                    <div className="min-w-0">
                      <p className="font-mono font-bold text-gray-900">{a.ref}</p>
                      <p className="text-gray-500 truncate">
                        {bizName(a.businessKey)}
                        {a.currentApprovalStage ? ` · ${APPROVAL_STAGE_LABELS[a.currentApprovalStage]}` : ''}
                        {a.status === 'UNDER_INSPECTION' ? ` · ${a.requiredInspections.map((t) => INSPECTION_TYPE_LABELS[t].split(' ')[0]).join(', ')}` : ''}
                      </p>
                    </div>
                    <AppStatusPill status={a.status} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  )
}

export default TradeDashboardPage
