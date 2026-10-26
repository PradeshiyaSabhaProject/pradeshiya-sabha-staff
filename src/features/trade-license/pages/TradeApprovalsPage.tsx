import React, { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTradeLicense } from '../context/TradeLicenseContext'
import {
  ALL_APPROVAL_STAGES,
  APPROVAL_STAGE_DESIGNATION,
  APPROVAL_STAGE_LABELS,
  APPROVAL_STAGE_SHORT,
  INSPECTION_TYPE_LABELS,
} from '../config/defaultConfig'
import { can, canActOnStage, daysBetween, latestInspections } from '../rules/tradeLicenseRules'
import type { Application, ApprovalStage } from '../types/tradeLicense'
import { ApprovalDecisionForm } from '../components/WorkflowActions'
import {
  DetailRow,
  EmptyState,
  ErrorBanner,
  InfoBanner,
  Modal,
  NeedsConfirmation,
  PageHeader,
  Panel,
  Pill,
  TableShell,
  Tabs,
  btnGhost,
  btnPrimary,
  formatDate,
  formatDateTime,
  inputAutoCls,
  inputCls,
  todayIso,
} from '../components/ui'

const ReviewModal: React.FC<{ appId: string; onClose: () => void }> = ({ appId, onClose }) => {
  const { db } = useTradeLicense()
  const app = db?.applications.find((a) => a.id === appId)
  if (!db || !app) return null
  const business = db.businesses.find((b) => b.key === app.businessKey)
  const latest = latestInspections(app, db.inspections)
  const decisions = db.approvals.filter((a) => a.applicationId === app.id)
  return (
    <Modal open size="xl" onClose={onClose} title={`Review ${app.ref}`} subtitle={`${business?.name ?? ''} · ${db.categories.find((c) => c.id === app.categoryId)?.name ?? ''}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1">Business</h4>
            <DetailRow label="Business ID" value={business?.businessId} />
            <DetailRow label="Owner" value={`${business?.owner.name} (${business?.owner.nic})`} />
            <DetailRow label="Premises" value={business?.premises.address} />
            <DetailRow label="Nature of activity" value={business?.natureOfActivity} />
            <DetailRow label="Documents" value={`${app.documents.filter((d) => d.verified).length}/${app.documents.length} verified`} />
          </div>
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1">Inspection outcomes</h4>
            {app.requiredInspections.length === 0 && <p className="text-xs text-gray-500">No inspections required.</p>}
            {app.requiredInspections.map((t) => {
              const i = latest[t]
              return (
                <div key={t} className="py-1.5 border-b border-gray-50 text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-700">
                      {INSPECTION_TYPE_LABELS[t]} {i && i.round > 1 ? `(round ${i.round})` : ''}
                    </span>
                    <span className="font-semibold">
                      {i?.recommendation?.replace('_', ' ').toLowerCase() ?? '—'}
                      {i?.mohSignOff ? ` · MOH ${i.mohSignOff.decision.toLowerCase().replace('_', ' ')}` : ''}
                    </span>
                  </div>
                  {i?.remarks && <p className="text-[11px] text-gray-500">{i.remarks}</p>}
                </div>
              )
            })}
          </div>
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1">Previous decisions</h4>
            {decisions.length === 0 ? (
              <p className="text-xs text-gray-500">None yet.</p>
            ) : (
              <ul className="space-y-1.5 text-xs">
                {decisions.map((d) => (
                  <li key={d.id} className="flex justify-between gap-2">
                    <span>
                      {APPROVAL_STAGE_LABELS[d.stage]} – <strong>{d.decision.toLowerCase()}</strong>
                      {d.remarks ? `: ${d.remarks}` : ''}
                    </span>
                    <span className="text-gray-400 shrink-0">
                      {d.officer} · {formatDate(d.at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Link to={`/trade-license/applications/${app.id}`} className={btnGhost}>
            Open full application file →
          </Link>
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {app.approvalStages.map((s) => (
              <Pill key={s} tone={s === app.currentApprovalStage ? 'purple' : decisions.some((d) => d.stage === s && d.decision === 'APPROVED') ? 'emerald' : 'gray'}>
                {APPROVAL_STAGE_LABELS[s]}
              </Pill>
            ))}
          </div>
          {app.status === 'IN_APPROVAL' ? <ApprovalDecisionForm app={app} onDone={onClose} /> : <InfoBanner>Decision recorded – this application is no longer at this stage.</InfoBanner>}
        </div>
      </div>
    </Modal>
  )
}

const WorkflowConfig: React.FC = () => {
  const { db, actor, run } = useTradeLicense()
  const [chain, setChain] = useState<ApprovalStage[]>(db?.settings.approvalChain ?? [])
  const [confirmed, setConfirmed] = useState(db?.settings.approvalChainConfirmed ?? false)
  const [days, setDays] = useState(String(db?.settings.correctionDeadlineDays ?? 14))
  const [error, setError] = useState<string | null>(null)
  if (!db) return null
  const editable = can(actor.designation, 'SETTINGS_MANAGE')
  const save = async () => {
    const ordered = ALL_APPROVAL_STAGES.filter((s) => chain.includes(s))
    const res = await run(
      (svc, a) => svc.updateSettings({ approvalChain: ordered, approvalChainConfirmed: confirmed, correctionDeadlineDays: Number(days) }, a),
      'Approval workflow saved.'
    )
    setError(res.ok ? null : res.error)
  }
  return (
    <Panel title="Approval Workflow Configuration">
      <div className="space-y-4 max-w-2xl">
        <InfoBanner tone="amber">
          Requirements page 1 lists RI → PHI (MOH-signed) → RI → Secretary → Chairman; the workflow diagram adds a Chief Inspector review. The Chief Inspector stage is
          enabled by default and marked unconfirmed. Categories can override this chain. The Secretary and Chairman stages are always required.
        </InfoBanner>
        <div className="space-y-2">
          {ALL_APPROVAL_STAGES.map((s, i) => {
            const fixed = s === 'SECRETARY' || s === 'CHAIRMAN'
            return (
              <label key={s} className={`flex items-center gap-3 p-3 rounded-xl border text-xs ${chain.includes(s) ? 'border-[#A31736]/40 bg-[#A31736]/5' : 'border-gray-200'}`}>
                <span className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center font-black text-gray-600">{i + 1}</span>
                <input
                  type="checkbox"
                  className="accent-[#A31736]"
                  disabled={!editable || fixed}
                  checked={chain.includes(s)}
                  onChange={() => setChain(chain.includes(s) ? chain.filter((x) => x !== s) : [...chain, s])}
                />
                <span className="flex-1 font-semibold text-gray-800">{APPROVAL_STAGE_LABELS[s]}</span>
                <span className="text-gray-500">{APPROVAL_STAGE_DESIGNATION[s]}</span>
              </label>
            )
          })}
        </div>
        <label className="block text-xs">
          <span className="font-bold text-gray-700">Rectification deadline (days)</span>
          <input type="number" min={1} disabled={!editable} className={`${inputCls} max-w-[140px] mt-1`} value={days} onChange={(e) => setDays(e.target.value)} />
          <span className="block text-[10px] text-gray-500 mt-1">Workflow diagram: strict statutory deadline, e.g. 14–30 days.</span>
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" className="accent-[#A31736]" disabled={!editable} checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
          Approval chain officially confirmed
        </label>
        <ErrorBanner message={error} />
        {editable ? (
          <button type="button" className={btnPrimary} onClick={save}>
            Save Workflow
          </button>
        ) : (
          <p className="text-[11px] text-gray-500">Only the System Administrator or Secretary can change the workflow.</p>
        )}
        <p className="text-[10px] text-gray-500">Changes apply to applications that enter the approval stage after saving.</p>
      </div>
    </Panel>
  )
}

export const TradeApprovalsPage: React.FC = () => {
  const { db, actor } = useTradeLicense()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') ?? 'mine'
  const setTab = (t: string) => setParams(t === 'mine' ? {} : { tab: t }, { replace: true })
  const [reviewId, setReviewId] = useState<string | null>(null)
  const [stageFilter, setStageFilter] = useState<ApprovalStage | ''>('')

  const pipeline = useMemo(() => (db?.applications ?? []).filter((a) => a.status === 'IN_APPROVAL'), [db])
  if (!db) return null
  const mine = pipeline.filter((a) => canActOnStage(actor.designation, a.currentApprovalStage))
  const today = todayIso()
  const waitingSince = (a: Application) => {
    const last = db.approvals.filter((d) => d.applicationId === a.id).sort((x, y) => y.at.localeCompare(x.at))[0]
    const fromAudit = db.audit.find((e) => e.entityId === a.id && e.action === 'Forwarded for approval')
    return last?.at ?? fromAudit?.at ?? a.updatedAt
  }
  const history = db.approvals.filter((d) => !stageFilter || d.stage === stageFilter).sort((a, b) => b.at.localeCompare(a.at))

  const pipelineTable = (rows: Application[], emptyTitle: string, emptyMsg?: string) => (
    <TableShell
      headers={['Application', 'Business', 'Current stage', 'Responsible', 'Waiting', 'Route', '']}
      isEmpty={rows.length === 0}
      empty={<EmptyState title={emptyTitle} message={emptyMsg} />}
    >
      {rows.map((a) => {
        const biz = db.businesses.find((b) => b.key === a.businessKey)
        const days = daysBetween(waitingSince(a), today)
        return (
          <tr key={a.id} className="hover:bg-gray-50">
            <td className="px-4 py-2.5 whitespace-nowrap">
              <Link to={`/trade-license/applications/${a.id}`} className="font-mono font-bold text-gray-900 hover:text-[#A31736]">
                {a.ref}
              </Link>
              <p className="text-[10px] text-gray-500">{db.categories.find((c) => c.id === a.categoryId)?.name}</p>
            </td>
            <td className="px-4 py-2.5 min-w-[160px]">
              <p className="font-semibold">{biz?.name}</p>
              <p className="text-[10px] text-gray-500 font-mono">{biz?.businessId}</p>
            </td>
            <td className="px-4 py-2.5 whitespace-nowrap">
              <Pill tone="purple">{a.currentApprovalStage ? APPROVAL_STAGE_LABELS[a.currentApprovalStage] : '—'}</Pill>
            </td>
            <td className="px-4 py-2.5 whitespace-nowrap">{a.currentApprovalStage ? APPROVAL_STAGE_DESIGNATION[a.currentApprovalStage] : '—'}</td>
            <td className={`px-4 py-2.5 whitespace-nowrap ${days > 7 ? 'text-rose-600 font-bold' : 'text-gray-600'}`}>{days} day(s)</td>
            <td className="px-4 py-2.5 text-[10px] text-gray-500">
              {a.approvalStages.map((s) => APPROVAL_STAGE_SHORT[s]).join(' → ')}
            </td>
            <td className="px-4 py-2.5 text-right">
              <button type="button" className={btnGhost} onClick={() => setReviewId(a.id)}>
                {canActOnStage(actor.designation, a.currentApprovalStage) ? 'Review & decide' : 'View'} →
              </button>
            </td>
          </tr>
        )
      })}
    </TableShell>
  )

  return (
    <div className="space-y-5">
      <PageHeader
        title="APPROVALS"
        subtitle="RI verification, Chief Inspector review, Secretary endorsement and Chairman final approval. Every decision is recorded with the officer, date and remarks."
        badges={!db.settings.approvalChainConfirmed ? <NeedsConfirmation label="Approval chain unconfirmed" /> : undefined}
      />
      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'mine', label: 'My Approvals', count: mine.length },
          { id: 'pipeline', label: 'Approval Pipeline', count: pipeline.length },
          { id: 'history', label: 'Decision History', count: db.approvals.length },
          { id: 'config', label: 'Workflow Configuration' },
        ]}
      />

      {tab === 'mine' && (
        <Panel title={`Awaiting my action – ${actor.designation}`} bodyClassName="p-0">
          {pipelineTable(
            mine,
            'No applications awaiting your approval',
            ['Revenue Inspector', 'Chief Inspector', 'Secretary', 'Chairman'].includes(actor.designation)
              ? undefined
              : 'Approval decisions are made by the RI, Chief Inspector, Secretary and Chairman. Switch the acting designation if you hold one of these offices.'
          )}
        </Panel>
      )}

      {tab === 'pipeline' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {ALL_APPROVAL_STAGES.map((s) => (
              <div key={s} className="p-4 rounded-2xl border border-purple-200 bg-purple-50">
                <p className="text-[11px] font-semibold text-gray-600">{APPROVAL_STAGE_LABELS[s]}</p>
                <p className="text-xl font-black text-gray-900">{pipeline.filter((a) => a.currentApprovalStage === s).length}</p>
                <p className="text-[10px] text-gray-500">{APPROVAL_STAGE_DESIGNATION[s]}</p>
              </div>
            ))}
          </div>
          <Panel title="All applications in approval" bodyClassName="p-0">
            {pipelineTable(pipeline, 'No applications are in the approval stage')}
          </Panel>
        </div>
      )}

      {tab === 'history' && (
        <Panel
          title="Decision History"
          bodyClassName="p-0"
          actions={
            <select className={inputAutoCls} value={stageFilter} onChange={(e) => setStageFilter(e.target.value as ApprovalStage | '')}>
              <option value="">All stages</option>
              {ALL_APPROVAL_STAGES.map((s) => (
                <option key={s} value={s}>
                  {APPROVAL_STAGE_LABELS[s]}
                </option>
              ))}
            </select>
          }
        >
          <TableShell headers={['Date', 'Application', 'Stage', 'Officer', 'Decision', 'Remarks']} isEmpty={history.length === 0} empty={<EmptyState title="No decisions recorded yet" />}>
            {history.map((d) => {
              const a = db.applications.find((x) => x.id === d.applicationId)
              return (
                <tr key={d.id}>
                  <td className="px-4 py-2.5 whitespace-nowrap">{formatDateTime(d.at)}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <Link to={`/trade-license/applications/${d.applicationId}`} className="font-mono font-bold hover:text-[#A31736]">
                      {a?.ref}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">{APPROVAL_STAGE_LABELS[d.stage]}</td>
                  <td className="px-4 py-2.5">
                    {d.officer}
                    <p className="text-[10px] text-gray-400">{d.designation}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    <Pill tone={d.decision === 'APPROVED' ? 'emerald' : d.decision === 'REJECTED' ? 'rose' : 'amber'}>{d.decision.toLowerCase()}</Pill>
                  </td>
                  <td className="px-4 py-2.5">{d.remarks || '—'}</td>
                </tr>
              )
            })}
          </TableShell>
        </Panel>
      )}

      {tab === 'config' && <WorkflowConfig key={db.settings.approvalChain.join()} />}

      {reviewId && <ReviewModal appId={reviewId} onClose={() => setReviewId(null)} />}
    </div>
  )
}

export default TradeApprovalsPage
