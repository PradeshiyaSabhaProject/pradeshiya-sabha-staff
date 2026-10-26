import React, { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Download, PlusCircle, Search, X } from 'lucide-react'
import { useTradeLicense } from '../context/TradeLicenseContext'
import { applicationPayments } from '../rules/selectors'
import { can, isApplicationOverdue } from '../rules/tradeLicenseRules'
import type { Application, ApplicationStatus } from '../types/tradeLicense'
import ApplicationFormModal from '../components/ApplicationFormModal'
import {
  APPLICATION_STATUS_META,
  AppStatusPill,
  ApprovalStatusPill,
  EmptyState,
  InspectionStatusPill,
  PageHeader,
  Panel,
  PaymentStatusPill,
  TableShell,
  btnGhost,
  btnPrimary,
  btnSecondary,
  downloadCsv,
  formatDate,
  inputCls,
  todayIso,
} from '../components/ui'

const PAGE_SIZE = 15

export const TradeApplicationsPage: React.FC = () => {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { db, actor } = useTradeLicense()
  const [page, setPage] = useState(1)

  const q = params.get('q') ?? ''
  const status = (params.get('status') ?? '') as ApplicationStatus | ''
  const channel = params.get('channel') ?? ''
  const categoryId = params.get('category') ?? ''
  const year = params.get('year') ?? ''
  const overdue = params.get('overdue') === '1'
  const showNew = params.get('new') === '1'

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
    setPage(1)
  }

  const rows = useMemo(() => {
    if (!db) return []
    const today = todayIso()
    const needle = q.trim().toLowerCase()
    return db.applications
      .filter((a) => !status || a.status === status)
      .filter((a) => !channel || a.channel === channel)
      .filter((a) => !categoryId || a.categoryId === categoryId)
      .filter((a) => !year || a.licenseYear === Number(year))
      .filter((a) => !overdue || isApplicationOverdue(a, today, db.settings))
      .map((a) => ({ app: a, business: db.businesses.find((b) => b.key === a.businessKey), pay: applicationPayments(db, a) }))
      .filter(({ app, business }) => {
        if (!needle) return true
        return [app.ref, app.portalRef, app.applicant.name, app.applicant.nic, business?.name, business?.businessId, business?.premises.address]
          .filter(Boolean)
          .some((x) => x!.toLowerCase().includes(needle))
      })
      .sort((x, y) => y.app.updatedAt.localeCompare(x.app.updatedAt))
  }, [db, q, status, channel, categoryId, year, overdue])

  if (!db) return null
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const paged = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
  const catName = (id: string) => db.categories.find((c) => c.id === id)?.name ?? '—'
  const hasFilters = !!(q || status || channel || categoryId || year || overdue)

  const exportCsv = () =>
    downloadCsv(
      `trade-applications-${todayIso()}.csv`,
      ['Application Ref', 'Portal Ref', 'Business ID', 'Business', 'Applicant', 'NIC', 'Category', 'Channel', 'Type', 'Year', 'Application Status', 'Inspection Status', 'Approval Status', 'Processing Fee', 'Licence Fee', 'Created'],
      rows.map(({ app, business, pay }) => [
        app.ref,
        app.portalRef,
        business?.businessId,
        business?.name,
        app.applicant.name,
        app.applicant.nic,
        catName(app.categoryId),
        app.channel,
        app.type,
        app.licenseYear,
        APPLICATION_STATUS_META[app.status].label,
        app.inspectionStatus,
        app.approvalStatus,
        pay.processing.status,
        pay.license.status,
        app.createdAt.slice(0, 10),
      ])
    )

  const onCreated = (app: Application) => {
    setParam('new', '')
    navigate(`/trade-license/applications/${app.id}`)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="TRADE APPLICATIONS REGISTER"
        subtitle="All trade licence applications – online submissions and officer-assisted counter applications – in one register."
        actions={
          <>
            <button type="button" onClick={exportCsv} className={btnSecondary} disabled={rows.length === 0}>
              <Download className="w-3.5 h-3.5 text-gray-500" /> EXPORT CSV
            </button>
            {can(actor, 'APPLICATION_CREATE') && (
              <button type="button" onClick={() => setParam('new', '1')} className={btnPrimary}>
                <PlusCircle className="w-3.5 h-3.5" /> NEW APPLICATION
              </button>
            )}
          </>
        }
      />

      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
        <label className="lg:col-span-2 relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input className={`${inputCls} pl-8`} placeholder="Search ref, business, Business ID, applicant, NIC…" value={q} onChange={(e) => setParam('q', e.target.value)} />
        </label>
        <select className={inputCls} value={status} onChange={(e) => setParam('status', e.target.value)} aria-label="Status">
          <option value="">All statuses</option>
          {(Object.keys(APPLICATION_STATUS_META) as ApplicationStatus[]).map((s) => (
            <option key={s} value={s}>
              {APPLICATION_STATUS_META[s].label}
            </option>
          ))}
        </select>
        <select className={inputCls} value={categoryId} onChange={(e) => setParam('category', e.target.value)} aria-label="Category">
          <option value="">All categories</option>
          {db.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select className={inputCls} value={channel} onChange={(e) => setParam('channel', e.target.value)} aria-label="Channel">
          <option value="">Online & counter</option>
          <option value="ONLINE">Online</option>
          <option value="COUNTER">Counter (officer-assisted)</option>
        </select>
        <div className="flex gap-2">
          <select className={inputCls} value={year} onChange={(e) => setParam('year', e.target.value)} aria-label="Year">
            <option value="">All years</option>
            {[...new Set(db.applications.map((a) => a.licenseYear))].sort().map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          {hasFilters && (
            <button type="button" onClick={() => setParams({}, { replace: true })} className="px-2.5 rounded-xl border border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer" title="Clear filters">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {overdue && (
          <p className="lg:col-span-6 text-[11px] font-semibold text-amber-800">Showing overdue applications only.</p>
        )}
      </div>

      <Panel title={`Applications (${rows.length})`} bodyClassName="p-0">
        <TableShell
          headers={['Application', 'Business', 'Category / Channel', 'Application status', 'Inspection', 'Approval', 'Processing fee', 'Licence fee', '']}
          isEmpty={paged.length === 0}
          empty={
            <EmptyState
              title={hasFilters ? 'No applications match these filters' : 'No trade licence applications yet'}
              message={hasFilters ? 'Clear the filters to see all applications.' : 'Register a counter application or an online submission to start the workflow.'}
              action={
                !hasFilters && can(actor, 'APPLICATION_CREATE') ? (
                  <button type="button" className={btnPrimary} onClick={() => setParam('new', '1')}>
                    <PlusCircle className="w-3.5 h-3.5" /> New application
                  </button>
                ) : undefined
              }
            />
          }
        >
          {paged.map(({ app, business, pay }) => (
            <tr key={app.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/trade-license/applications/${app.id}`)}>
              <td className="px-4 py-3 whitespace-nowrap">
                <p className="font-mono font-bold text-gray-900">{app.ref}</p>
                <p className="text-[10px] text-gray-500">
                  {app.type === 'RENEWAL' ? 'Renewal' : 'New'} · {app.licenseYear} · {formatDate(app.createdAt)}
                </p>
              </td>
              <td className="px-4 py-3 min-w-[180px]">
                <p className="font-semibold text-gray-900">{business?.name ?? '—'}</p>
                <p className="text-[10px] text-gray-500 font-mono">{business?.businessId ?? 'Business ID pending'}</p>
                <p className="text-[10px] text-gray-400">{app.applicant.name}</p>
              </td>
              <td className="px-4 py-3">
                <p className="text-gray-700">{catName(app.categoryId)}</p>
                <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${app.channel === 'ONLINE' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                  {app.channel === 'ONLINE' ? 'Online' : 'Counter'}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <AppStatusPill status={app.status} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <InspectionStatusPill status={app.inspectionStatus} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <ApprovalStatusPill status={app.approvalStatus} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <PaymentStatusPill status={pay.processing.status} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <PaymentStatusPill status={pay.license.status} />
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <span className={btnGhost}>Open →</span>
              </td>
            </tr>
          ))}
        </TableShell>
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs bg-gray-50/50">
            <p className="text-gray-500">
              Showing {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, rows.length)} of {rows.length}
            </p>
            <div className="flex items-center gap-1">
              <button type="button" disabled={current <= 1} onClick={() => setPage(current - 1)} className="px-3 py-1 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 disabled:opacity-40">
                Previous
              </button>
              <span className="px-3 py-1 font-semibold text-gray-700">
                {current} / {totalPages}
              </span>
              <button type="button" disabled={current >= totalPages} onClick={() => setPage(current + 1)} className="px-3 py-1 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 disabled:opacity-40">
                Next
              </button>
            </div>
          </div>
        )}
      </Panel>

      {showNew && can(actor, 'APPLICATION_CREATE') && (
        <ApplicationFormModal
          open
          onClose={() => setParam('new', '')}
          onCreated={onCreated}
          presetBusinessKey={params.get('business') ?? undefined}
          presetType={params.get('type') === 'RENEWAL' ? 'RENEWAL' : undefined}
          presetYear={params.get('forYear') ? Number(params.get('forYear')) : undefined}
        />
      )}
    </div>
  )
}

export default TradeApplicationsPage
