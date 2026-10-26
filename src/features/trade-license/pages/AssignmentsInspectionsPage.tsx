import React, { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, MapPin, Pencil, Plus, PlusCircle, Search, Trash2 } from 'lucide-react'
import { useTradeLicense } from '../context/TradeLicenseContext'
import {
  ALL_APPROVAL_STAGES,
  APPROVAL_STAGE_LABELS,
  APPROVAL_STAGE_SHORT,
  INSPECTION_TYPE_DESIGNATION,
  INSPECTION_TYPE_LABELS,
} from '../config/defaultConfig'
import { can, canSubmitInspection, latestInspections } from '../rules/tradeLicenseRules'
import type { Application, Business, BusinessCategory, ChecklistTemplate, Inspection, InspectionType } from '../types/tradeLicense'
import type { BusinessInput } from '../services/tradeLicenseService'
import { BusinessFields, LIABILITY_LABELS, businessToInput, emptyBusinessInput } from '../components/BusinessFields'
import InspectionReportModal from '../components/InspectionReportModal'
import NoticeFormModal from '../components/NoticeFormModal'
import { AssignInspectionForm, RectifyForm, RiReviewForm } from '../components/WorkflowActions'
import {
  AppStatusPill,
  EmptyState,
  ErrorBanner,
  Field,
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
  btnSecondary,
  formatDate,
  inputAutoCls,
  inputCls,
  todayIso,
} from '../components/ui'

// ── Business register (RI field survey) ─────────────────────────────────────
const BusinessModal: React.FC<{ business?: Business; onClose: () => void }> = ({ business, onClose }) => {
  const { db, run } = useTradeLicense()
  const [value, setValue] = useState<BusinessInput>(business ? businessToInput(business) : emptyBusinessInput())
  const [surveyDate, setSurveyDate] = useState(business?.survey?.surveyDate ?? todayIso())
  const [notes, setNotes] = useState(business?.survey?.notes ?? '')
  const [error, setError] = useState<string | null>(null)
  if (!db) return null
  const save = async () => {
    const input = { ...value, survey: { surveyedBy: business?.survey?.surveyedBy ?? '', surveyDate, notes } }
    const res = business
      ? await run((svc, a) => svc.updateBusiness(business.key, { ...input, survey: { ...input.survey, surveyedBy: input.survey.surveyedBy || a.name } }, a), 'Business updated.')
      : await run((svc, a) => svc.registerBusiness({ ...input, survey: { ...input.survey, surveyedBy: a.name } }, a), 'Business registered.')
    if (res.ok) onClose()
    else setError(res.error)
  }
  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      title={business ? `Update ${business.name}` : 'Register Business (Field Survey)'}
      subtitle="Revenue survey: record which businesses must obtain a trade licence and pay trade tax / business tax."
      footer={
        <>
          <button type="button" className={btnSecondary} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={btnPrimary} onClick={save}>
            {business ? 'Save Changes' : 'Register Business'}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <BusinessFields value={value} onChange={setValue} categories={db.categories} lockAddress={!!business?.businessId} />
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Survey date">
            <input type="date" max={todayIso()} className={inputCls} value={surveyDate} onChange={(e) => setSurveyDate(e.target.value)} />
          </Field>
          <Field label="Survey notes" className="sm:col-span-2">
            <input className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
        </section>
        <ErrorBanner message={error} />
      </div>
    </Modal>
  )
}

const LocationModal: React.FC<{ business: Business; onClose: () => void }> = ({ business, onClose }) => {
  const { run } = useTradeLicense()
  const [premises, setPremises] = useState<Business['premises']>({ ...business.premises, address: '' })
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const save = async () => {
    const res = await run((svc, a) => svc.changeBusinessLocation(business.key, premises, reason, a), 'Location changed.')
    if (res.ok) onClose()
    else setError(res.error)
  }
  return (
    <Modal
      open
      onClose={onClose}
      title={`Change Location – ${business.name}`}
      subtitle={`Current: ${business.premises.address}`}
      footer={
        <>
          <button type="button" className={btnSecondary} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={btnPrimary} onClick={save}>
            Change Location
          </button>
        </>
      }
    >
      <div className="space-y-3">
        {business.businessId && (
          <InfoBanner tone="amber">
            Per the requirements, the Business ID changes when the business location changes. <strong>{business.businessId}</strong> will be retired (kept in history) and a new ID issued.
          </InfoBanner>
        )}
        <Field label="New premises address" required>
          <input className={inputCls} value={premises.address} onChange={(e) => setPremises({ ...premises, address: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Assessment no.">
            <input className={inputCls} value={premises.assessmentNo ?? ''} onChange={(e) => setPremises({ ...premises, assessmentNo: e.target.value })} />
          </Field>
          <Field label="Ward / GN division">
            <input className={inputCls} value={premises.ward ?? ''} onChange={(e) => setPremises({ ...premises, ward: e.target.value })} />
          </Field>
        </div>
        <Field label="Reason" required>
          <input className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
        <ErrorBanner message={error} />
      </div>
    </Modal>
  )
}

const BusinessRegister: React.FC = () => {
  const { db, actor } = useTradeLicense()
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<Business | 'new' | null>(null)
  const [moving, setMoving] = useState<Business | null>(null)
  const [history, setHistory] = useState<Business | null>(null)
  const year = new Date().getFullYear()
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return (db?.businesses ?? [])
      .filter((b) => !needle || [b.name, b.businessId, b.owner.name, b.owner.nic, b.premises.address, b.premises.assessmentNo].some((x) => x?.toLowerCase().includes(needle)))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }, [db, q])
  if (!db) return null
  const canSurvey = can(actor.designation, 'BUSINESS_SURVEY')
  return (
    <Panel
      title={`Business Register (${rows.length})`}
      bodyClassName="p-0"
      actions={
        <>
          <label className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input className={`${inputCls} pl-8`} placeholder="Search name, ID, owner, NIC, address" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          {canSurvey && (
            <button type="button" className={btnPrimary} onClick={() => setEditing('new')}>
              <PlusCircle className="w-3.5 h-3.5" /> Register Business
            </button>
          )}
        </>
      }
    >
      {!canSurvey && <div className="px-5 pt-4"><InfoBanner>Field survey registration and updates are done by the Revenue Inspector.</InfoBanner></div>}
      <TableShell
        headers={['Business ID', 'Business', 'Owner', 'Premises', 'Category', 'Liable for', `${year} licence`, '']}
        isEmpty={rows.length === 0}
        empty={<EmptyState title={q ? 'No matching businesses' : 'No businesses registered yet'} message="Businesses identified in the RI field survey or through applications appear here." />}
      >
        {rows.map((b) => {
          const lic = db.licenses.find((l) => l.businessKey === b.key && l.licenseYear === year && l.status === 'ACTIVE')
          const app = db.applications.find((a) => a.businessKey === b.key && a.licenseYear === year && a.status !== 'WITHDRAWN')
          return (
            <tr key={b.key}>
              <td className="px-4 py-2.5 font-mono font-bold whitespace-nowrap">
                {b.businessId ?? <span className="text-gray-400 font-normal">Not issued</span>}
                {b.businessIdHistory.length > 1 && (
                  <button type="button" className="block text-[10px] text-[#A31736] font-sans font-semibold cursor-pointer" onClick={() => setHistory(b)}>
                    ID history ({b.businessIdHistory.length})
                  </button>
                )}
              </td>
              <td className="px-4 py-2.5 min-w-[160px]">
                <p className="font-semibold text-gray-900">{b.name}</p>
                <p className="text-[10px] text-gray-500">{b.natureOfActivity} · {b.source === 'FIELD_SURVEY' ? `Survey ${formatDate(b.survey?.surveyDate)}` : 'Via application'}</p>
              </td>
              <td className="px-4 py-2.5">
                {b.owner.name}
                <p className="text-[10px] text-gray-400 font-mono">{b.owner.nic} · {b.owner.phone}</p>
              </td>
              <td className="px-4 py-2.5 min-w-[160px]">{b.premises.address}</td>
              <td className="px-4 py-2.5">{db.categories.find((c) => c.id === b.categoryId)?.name}</td>
              <td className="px-4 py-2.5 text-[11px]">{b.liabilities.map((l) => LIABILITY_LABELS[l]).join(', ')}</td>
              <td className="px-4 py-2.5 whitespace-nowrap">
                {lic ? <Pill tone="emerald">{lic.licenseNo}</Pill> : app ? <AppStatusPill status={app.status} /> : b.liabilities.includes('TRADE_LICENSE') ? <Pill tone="rose">Not applied</Pill> : <Pill tone="gray">N/A</Pill>}
              </td>
              <td className="px-4 py-2.5 text-right whitespace-nowrap">
                {(canSurvey || can(actor.designation, 'APPLICATION_EDIT')) && (
                  <button type="button" className={btnGhost} onClick={() => setEditing(b)} title="Update details">
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                )}
                {canSurvey && (
                  <button type="button" className={btnGhost} onClick={() => setMoving(b)} title="Change location">
                    <MapPin className="w-3 h-3" /> Move
                  </button>
                )}
                {!app && !lic && b.liabilities.includes('TRADE_LICENSE') && can(actor.designation, 'APPLICATION_CREATE') && (
                  <Link to={`/trade-license/applications?new=1&business=${b.key}${b.businessId ? '&type=RENEWAL' : ''}`} className={btnGhost}>
                    Apply <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </td>
            </tr>
          )
        })}
      </TableShell>
      {editing && <BusinessModal business={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
      {moving && <LocationModal business={moving} onClose={() => setMoving(null)} />}
      {history && (
        <Modal open onClose={() => setHistory(null)} title={`Business ID history – ${history.name}`}>
          <ul className="space-y-2 text-xs">
            {history.businessIdHistory.map((h) => (
              <li key={h.businessId} className="flex justify-between gap-2 p-2.5 rounded-xl border border-gray-200">
                <span className="font-mono font-bold">{h.businessId}</span>
                <span className="text-gray-500 text-right">
                  {formatDate(h.assignedAt)} – {h.retiredAt ? formatDate(h.retiredAt) : 'current'}
                  <br />
                  {h.reason}
                </span>
              </li>
            ))}
          </ul>
        </Modal>
      )}
    </Panel>
  )
}

// ── Category & checklist configuration ──────────────────────────────────────
const CategoryEditor: React.FC<{ category: BusinessCategory; onClose: () => void }> = ({ category, onClose }) => {
  const { run } = useTradeLicense()
  const [c, setC] = useState<BusinessCategory>(structuredClone(category))
  const [error, setError] = useState<string | null>(null)
  const toggleInspection = (t: InspectionType) =>
    setC({ ...c, requiredInspections: c.requiredInspections.includes(t) ? c.requiredInspections.filter((x) => x !== t) : [...c.requiredInspections, t] })
  const toggleStage = (s: (typeof ALL_APPROVAL_STAGES)[number]) =>
    setC({ ...c, approvalStages: c.approvalStages.includes(s) ? c.approvalStages.filter((x) => x !== s) : [...c.approvalStages, s] })
  const save = async () => {
    const res = await run((svc, a) => svc.updateCategory(c, a), 'Category saved.')
    if (res.ok) onClose()
    else setError(res.error)
  }
  return (
    <Modal
      open
      size="lg"
      onClose={onClose}
      title={category.id ? `Category – ${category.name}` : 'New Business Category'}
      footer={
        <>
          <button type="button" className={btnSecondary} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={btnPrimary} onClick={save}>
            Save Category
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Name" required>
            <input className={inputCls} value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} />
          </Field>
          <Field label="Description">
            <input className={inputCls} value={c.description} onChange={(e) => setC({ ...c, description: e.target.value })} />
          </Field>
        </div>
        <div>
          <p className="text-[11px] font-bold text-gray-700 mb-1">Mandatory inspections (approval matrix)</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(INSPECTION_TYPE_LABELS) as InspectionType[]).map((t) => (
              <label key={t} className="flex items-center gap-1.5 text-xs">
                <input type="checkbox" className="accent-[#A31736]" checked={c.requiredInspections.includes(t)} onChange={() => toggleInspection(t)} />
                {INSPECTION_TYPE_LABELS[t]}
              </label>
            ))}
          </div>
          <label className="flex items-center gap-1.5 text-xs mt-2">
            <input type="checkbox" className="accent-[#A31736]" checked={c.mohSignOffRequired} onChange={(e) => setC({ ...c, mohSignOffRequired: e.target.checked })} />
            PHI report must be signed by the MOH
          </label>
        </div>
        <div>
          <p className="text-[11px] font-bold text-gray-700 mb-1">Approval stages (leave all unticked to use the global chain)</p>
          <div className="flex flex-wrap gap-3">
            {ALL_APPROVAL_STAGES.map((s) => (
              <label key={s} className="flex items-center gap-1.5 text-xs">
                <input type="checkbox" className="accent-[#A31736]" checked={c.approvalStages.includes(s)} onChange={() => toggleStage(s)} />
                {APPROVAL_STAGE_LABELS[s]}
              </label>
            ))}
          </div>
        </div>
        <Field label="Required documents (one per line)">
          <textarea rows={4} className={inputCls} value={c.requiredDocuments.join('\n')} onChange={(e) => setC({ ...c, requiredDocuments: e.target.value.split('\n') })} />
        </Field>
        <div className="flex flex-wrap gap-4 text-xs">
          <label className="flex items-center gap-1.5">
            <input type="checkbox" className="accent-[#A31736]" checked={c.active} onChange={(e) => setC({ ...c, active: e.target.checked })} />
            Active (available for new applications)
          </label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" className="accent-[#A31736]" checked={c.confirmed} onChange={(e) => setC({ ...c, confirmed: e.target.checked })} />
            Officially confirmed
          </label>
        </div>
        <ErrorBanner message={error} />
      </div>
    </Modal>
  )
}

const ChecklistEditor: React.FC<{ template: ChecklistTemplate; categoryName: string; onClose: () => void }> = ({ template, categoryName, onClose }) => {
  const { run } = useTradeLicense()
  const [t, setT] = useState<ChecklistTemplate>(structuredClone(template))
  const [error, setError] = useState<string | null>(null)
  const save = async () => {
    const res = await run((svc, a) => svc.updateChecklist(t, a), 'Checklist saved.')
    if (res.ok) onClose()
    else setError(res.error)
  }
  return (
    <Modal
      open
      size="lg"
      onClose={onClose}
      title={`${categoryName} – ${INSPECTION_TYPE_LABELS[t.inspectionType]}`}
      subtitle="By-law conditions provided by the Pradeshiya Sabha. Officers tick these during inspection."
      footer={
        <>
          <button type="button" className={btnSecondary} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={btnPrimary} onClick={save}>
            Save Checklist
          </button>
        </>
      }
    >
      <div className="space-y-2">
        {t.items.map((item, i) => (
          <div key={item.id || i} className="flex items-center gap-2">
            <input className={inputCls} value={item.label} onChange={(e) => setT({ ...t, items: t.items.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} />
            <label className="flex items-center gap-1 text-[11px] whitespace-nowrap">
              <input type="checkbox" className="accent-[#A31736]" checked={item.mandatory} onChange={(e) => setT({ ...t, items: t.items.map((x, j) => (j === i ? { ...x, mandatory: e.target.checked } : x)) })} />
              Mandatory
            </label>
            <button type="button" onClick={() => setT({ ...t, items: t.items.filter((_, j) => j !== i) })} className="p-1.5 text-gray-400 hover:text-rose-600 cursor-pointer" aria-label="Remove">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => setT({ ...t, items: [...t.items, { id: '', label: '', mandatory: true }] })} className="inline-flex items-center gap-1 text-xs font-bold text-[#A31736] cursor-pointer">
          <Plus className="w-3.5 h-3.5" /> Add condition
        </button>
        <label className="flex items-center gap-1.5 text-xs pt-3">
          <input type="checkbox" className="accent-[#A31736]" checked={t.confirmed} onChange={(e) => setT({ ...t, confirmed: e.target.checked })} />
          Conditions officially confirmed by the Pradeshiya Sabha
        </label>
        <p className="text-[10px] text-gray-500">Changes apply to inspections assigned from now on; reports already in progress keep their checklist.</p>
        <ErrorBanner message={error} />
      </div>
    </Modal>
  )
}

const CategoriesChecklists: React.FC = () => {
  const { db, actor } = useTradeLicense()
  const [editCat, setEditCat] = useState<BusinessCategory | null>(null)
  const [editTpl, setEditTpl] = useState<ChecklistTemplate | null>(null)
  if (!db) return null
  const canEdit = can(actor.designation, 'SETTINGS_MANAGE')
  const blank: BusinessCategory = { id: '', name: '', description: '', requiredInspections: ['RI_BYLAW'], mohSignOffRequired: false, approvalStages: [], requiredDocuments: [], active: true, confirmed: false }
  return (
    <div className="space-y-4">
      <InfoBanner tone="amber">
        The requirements state the final approval matrix must define mandatory inspections per category, and that by-law conditions are provided by the Pradeshiya
        Sabha. The defaults below are drafted from the inspection areas named in the requirements and are marked unconfirmed until an authorised officer confirms them.
        {!canEdit && ' Only the System Administrator or Secretary can edit them.'}
      </InfoBanner>
      {canEdit && (
        <button type="button" className={btnPrimary} onClick={() => setEditCat(blank)}>
          <PlusCircle className="w-3.5 h-3.5" /> New Category
        </button>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {db.categories.map((c) => (
          <Panel
            key={c.id}
            title={
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-black text-gray-900">{c.name}</h3>
                {!c.active && <Pill tone="gray">Inactive</Pill>}
                {!c.confirmed && <NeedsConfirmation label="Unconfirmed" />}
              </div>
            }
            actions={
              canEdit && (
                <button type="button" className={btnGhost} onClick={() => setEditCat(c)}>
                  <Pencil className="w-3 h-3" /> Edit
                </button>
              )
            }
          >
            <p className="text-xs text-gray-500 mb-3">{c.description}</p>
            <p className="text-[11px] text-gray-500 mb-2">
              Approval: {(c.approvalStages.length ? c.approvalStages : db.settings.approvalChain).map((s) => APPROVAL_STAGE_SHORT[s]).join(' → ')}
              {c.mohSignOffRequired ? ' · MOH signs PHI report' : ''}
            </p>
            <ul className="space-y-1.5">
              {c.requiredInspections.map((t) => {
                const tpl = db.checklists.find((x) => x.categoryId === c.id && x.inspectionType === t)
                return (
                  <li key={t} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                    <span>
                      <strong>{INSPECTION_TYPE_LABELS[t]}</strong>
                      <span className="text-gray-500"> · {tpl ? `${tpl.items.length} conditions` : 'no checklist'}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      {tpl && !tpl.confirmed && <NeedsConfirmation label="Draft" />}
                      {tpl && (
                        <button type="button" className={btnGhost} onClick={() => setEditTpl(tpl)}>
                          {canEdit ? 'Edit' : 'View'}
                        </button>
                      )}
                    </span>
                  </li>
                )
              })}
            </ul>
          </Panel>
        ))}
      </div>
      {editCat && <CategoryEditor category={editCat} onClose={() => setEditCat(null)} />}
      {editTpl &&
        (canEdit ? (
          <ChecklistEditor template={editTpl} categoryName={db.categories.find((c) => c.id === editTpl.categoryId)?.name ?? ''} onClose={() => setEditTpl(null)} />
        ) : (
          <Modal open onClose={() => setEditTpl(null)} title={INSPECTION_TYPE_LABELS[editTpl.inspectionType]}>
            <ul className="list-disc pl-5 text-xs space-y-1">
              {editTpl.items.map((i) => (
                <li key={i.id}>
                  {i.label}
                  {i.mandatory ? ' *' : ''}
                </li>
              ))}
            </ul>
          </Modal>
        ))}
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────
export const AssignmentsInspectionsPage: React.FC = () => {
  const { db, actor } = useTradeLicense()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') ?? 'queue'
  const setTab = (t: string) => setParams(t === 'queue' ? {} : { tab: t }, { replace: true })
  const [view, setView] = useState<Inspection | null>(null)
  const [riApp, setRiApp] = useState<Application | null>(null)
  const [assignApp, setAssignApp] = useState<Application | null>(null)
  const [rectifyApp, setRectifyApp] = useState<Application | null>(null)
  const [noticeFor, setNoticeFor] = useState<Application | null>(null)
  const [typeFilter, setTypeFilter] = useState<InspectionType | ''>('')
  const [statusFilter, setStatusFilter] = useState<'' | 'ASSIGNED' | 'REPORT_SUBMITTED'>('')

  const data = useMemo(() => {
    if (!db) return null
    const apps = db.applications
    return {
      riReview: apps.filter((a) => a.status === 'RI_REVIEW'),
      needsAssignment: apps.filter((a) => a.status === 'UNDER_INSPECTION' && a.requiredInspections.some((t) => !latestInspections(a, db.inspections)[t])),
      assigned: db.inspections.filter((i) => i.status === 'ASSIGNED'),
      awaitingMoh: db.inspections.filter((i) => {
        const a = apps.find((x) => x.id === i.applicationId)
        return i.type === 'PHI' && i.status === 'REPORT_SUBMITTED' && !i.mohSignOff && !!a?.mohSignOffRequired && a.status === 'UNDER_INSPECTION'
      }),
      corrections: apps.filter((a) => a.status === 'CORRECTIONS_REQUESTED'),
    }
  }, [db])

  if (!db || !data) return null
  const appOf = (id: string) => db.applications.find((a) => a.id === id)
  const bizOf = (key?: string) => db.businesses.find((b) => b.key === key)
  const mine = data.assigned.filter((i) => canSubmitInspection(actor.designation, i.type))
  const allInspections = db.inspections
    .filter((i) => i.status !== 'CANCELLED')
    .filter((i) => !typeFilter || i.type === typeFilter)
    .filter((i) => !statusFilter || i.status === statusFilter)
    .sort((a, b) => b.assignedAt.localeCompare(a.assignedAt))

  const inspectionRow = (i: Inspection, showAction = true) => {
    const app = appOf(i.applicationId)
    const biz = bizOf(app?.businessKey)
    const overdue = i.status === 'ASSIGNED' && i.dueDate && i.dueDate < todayIso()
    return (
      <tr key={i.id}>
        <td className="px-4 py-2.5 whitespace-nowrap">
          <Link to={`/trade-license/applications/${app?.id}`} className="font-mono font-bold text-gray-900 hover:text-[#A31736]">
            {app?.ref}
          </Link>
          <p className="text-[10px] text-gray-500">{db.categories.find((c) => c.id === app?.categoryId)?.name}</p>
        </td>
        <td className="px-4 py-2.5 min-w-[160px]">
          <p className="font-semibold">{biz?.name}</p>
          <p className="text-[10px] text-gray-500">{biz?.premises.address}</p>
        </td>
        <td className="px-4 py-2.5">
          {INSPECTION_TYPE_LABELS[i.type]}
          {i.round > 1 && <Pill tone="indigo">{`Reinspection R${i.round}`}</Pill>}
        </td>
        <td className="px-4 py-2.5">
          {i.assignedTo}
          <p className={`text-[10px] ${overdue ? 'text-rose-600 font-bold' : 'text-gray-400'}`}>{i.dueDate ? `Due ${formatDate(i.dueDate)}` : `Assigned ${formatDate(i.assignedAt)}`}</p>
        </td>
        <td className="px-4 py-2.5">
          {i.status === 'ASSIGNED' ? (
            <Pill tone="teal">Assigned</Pill>
          ) : i.type === 'PHI' && app?.mohSignOffRequired && !i.mohSignOff ? (
            <Pill tone="amber">Awaiting MOH</Pill>
          ) : (
            <Pill tone={i.recommendation === 'RECOMMEND' && i.mohSignOff?.decision !== 'NOT_ENDORSED' ? 'emerald' : 'amber'}>
              {(i.recommendation ?? '').replace('_', ' ').toLowerCase()}
            </Pill>
          )}
        </td>
        {showAction && (
          <td className="px-4 py-2.5 text-right">
            <button type="button" className={btnGhost} onClick={() => setView(i)}>
              {i.status === 'ASSIGNED' && canSubmitInspection(actor.designation, i.type) ? 'Inspect' : 'Open'} →
            </button>
          </td>
        )}
      </tr>
    )
  }

  const appListRow = (a: Application, action: React.ReactNode, extra?: React.ReactNode) => {
    const biz = bizOf(a.businessKey)
    return (
      <li key={a.id} className="px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="min-w-0">
          <Link to={`/trade-license/applications/${a.id}`} className="font-mono font-bold text-gray-900 hover:text-[#A31736]">
            {a.ref}
          </Link>
          <span className="text-gray-500"> · {biz?.name} · {db.categories.find((c) => c.id === a.categoryId)?.name}</span>
          {extra && <div className="mt-0.5">{extra}</div>}
        </div>
        <div className="shrink-0">{action}</div>
      </li>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="ASSIGNMENTS & INSPECTIONS"
        subtitle="RI field survey and business register, RI review, inspection assignments (RI / PHI / MOH / environmental / fire), category checklists, rectification and reinspection."
      />
      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'queue', label: 'Work Queue', count: data.riReview.length + data.needsAssignment.length + data.assigned.length + data.awaitingMoh.length },
          { id: 'corrections', label: 'Corrections & Reinspection', count: data.corrections.length },
          { id: 'all', label: 'All Inspections', count: db.inspections.length },
          { id: 'register', label: 'Business Register (Field Survey)', count: db.businesses.length },
          { id: 'checklists', label: 'Categories & Checklists' },
        ]}
      />

      {tab === 'queue' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Panel title={`Awaiting RI Review (${data.riReview.length})`} bodyClassName="p-0">
              {data.riReview.length === 0 ? (
                <EmptyState title="Nothing awaiting RI review" />
              ) : (
                <ul className="divide-y divide-gray-100">
                  {data.riReview.map((a) =>
                    appListRow(
                      a,
                      can(actor.designation, 'RI_REVIEW') ? (
                        <button type="button" className={btnSecondary} onClick={() => setRiApp(a)}>
                          Review
                        </button>
                      ) : (
                        <span className="text-[10px] text-gray-400">Revenue Inspector</span>
                      )
                    )
                  )}
                </ul>
              )}
            </Panel>
            <Panel title={`Inspections to Assign (${data.needsAssignment.length})`} bodyClassName="p-0">
              {data.needsAssignment.length === 0 ? (
                <EmptyState title="All inspections assigned" />
              ) : (
                <ul className="divide-y divide-gray-100">
                  {data.needsAssignment.map((a) =>
                    appListRow(
                      a,
                      can(actor.designation, 'INSPECTION_ASSIGN') ? (
                        <button type="button" className={btnSecondary} onClick={() => setAssignApp(a)}>
                          Assign
                        </button>
                      ) : (
                        <span className="text-[10px] text-gray-400">RI / Chief Inspector</span>
                      ),
                      <span className="text-[10px] text-gray-500">
                        Unassigned: {a.requiredInspections.filter((t) => !latestInspections(a, db.inspections)[t]).map((t) => INSPECTION_TYPE_LABELS[t]).join(', ')}
                      </span>
                    )
                  )}
                </ul>
              )}
            </Panel>
          </div>

          <Panel title={`Assigned to my office – ${actor.designation} (${mine.length})`} bodyClassName="p-0">
            <TableShell
              headers={['Application', 'Business / premises', 'Inspection', 'Officer', 'Status', '']}
              isEmpty={mine.length === 0}
              empty={
                <EmptyState
                  title="No open inspections for this office"
                  message={`Reports are submitted by the responsible officer: ${Object.values(INSPECTION_TYPE_DESIGNATION).filter((v, i, a) => a.indexOf(v) === i).join(', ')}.`}
                />
              }
            >
              {mine.map((i) => inspectionRow(i))}
            </TableShell>
          </Panel>

          {(actor.designation === 'Medical Officer of Health' || data.awaitingMoh.length > 0) && (
            <Panel title={`PHI Reports Awaiting MOH Sign-off (${data.awaitingMoh.length})`} bodyClassName="p-0">
              <TableShell headers={['Application', 'Business / premises', 'Inspection', 'Officer', 'Status', '']} isEmpty={data.awaitingMoh.length === 0} empty={<EmptyState title="Nothing awaiting MOH sign-off" />}>
                {data.awaitingMoh.map((i) => inspectionRow(i))}
              </TableShell>
            </Panel>
          )}

          {data.assigned.length > mine.length && (
            <Panel title={`Other open inspections (${data.assigned.length - mine.length})`} bodyClassName="p-0">
              <TableShell headers={['Application', 'Business / premises', 'Inspection', 'Officer', 'Status', '']}>
                {data.assigned.filter((i) => !mine.includes(i)).map((i) => inspectionRow(i))}
              </TableShell>
            </Panel>
          )}
        </div>
      )}

      {tab === 'corrections' && (
        <Panel title={`Rectification Orders (${data.corrections.length})`} bodyClassName="p-0">
          {data.corrections.length === 0 ? (
            <EmptyState title="No open rectification orders" message="When an inspection finds deficiencies, or an approver returns an application, the rectification order appears here." />
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.corrections.map((a) => {
                const cr = [...a.correctionRequests].reverse().find((c) => c.status !== 'RECTIFIED')
                const overdue = cr && cr.deadline < todayIso()
                return appListRow(
                  a,
                  <button type="button" className={btnSecondary} onClick={() => setRectifyApp(a)}>
                    Manage
                  </button>,
                  cr && (
                    <span className={`text-[10px] ${overdue ? 'text-rose-600 font-bold' : 'text-gray-500'}`}>
                      Deadline {formatDate(cr.deadline)}
                      {cr.status === 'DEADLINE_MISSED' ? ' · deadline missed' : overdue ? ' · overdue' : ''} · {cr.source === 'INSPECTION' ? 'inspection findings' : `returned by ${cr.raisedByDesignation}`}
                    </span>
                  )
                )
              })}
            </ul>
          )}
        </Panel>
      )}

      {tab === 'all' && (
        <Panel
          title={`All Inspections (${allInspections.length})`}
          bodyClassName="p-0"
          actions={
            <>
              <select className={inputAutoCls} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as InspectionType | '')}>
                <option value="">All types</option>
                {(Object.keys(INSPECTION_TYPE_LABELS) as InspectionType[]).map((t) => (
                  <option key={t} value={t}>
                    {INSPECTION_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
              <select className={inputAutoCls} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as '' | 'ASSIGNED' | 'REPORT_SUBMITTED')}>
                <option value="">All statuses</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="REPORT_SUBMITTED">Report submitted</option>
              </select>
            </>
          }
        >
          <TableShell headers={['Application', 'Business / premises', 'Inspection', 'Officer', 'Status', '']} isEmpty={allInspections.length === 0} empty={<EmptyState title="No inspections" />}>
            {allInspections.map((i) => inspectionRow(i))}
          </TableShell>
        </Panel>
      )}

      {tab === 'register' && <BusinessRegister />}
      {tab === 'checklists' && <CategoriesChecklists />}

      {view && <InspectionReportModal inspection={db.inspections.find((i) => i.id === view.id) ?? view} onClose={() => setView(null)} />}
      {riApp && (
        <Modal open size="lg" onClose={() => setRiApp(null)} title={`RI Review – ${riApp.ref}`} subtitle={bizOf(riApp.businessKey)?.name}>
          {appOf(riApp.id)?.status === 'RI_REVIEW' ? <RiReviewForm app={appOf(riApp.id)!} /> : <InfoBanner>Review completed.</InfoBanner>}
        </Modal>
      )}
      {assignApp && (
        <Modal open size="lg" onClose={() => setAssignApp(null)} title={`Assign Inspections – ${assignApp.ref}`} subtitle={bizOf(assignApp.businessKey)?.premises.address}>
          <AssignInspectionForm app={appOf(assignApp.id)!} />
        </Modal>
      )}
      {rectifyApp && (
        <Modal open size="lg" onClose={() => setRectifyApp(null)} title={`Rectification – ${rectifyApp.ref}`} subtitle={bizOf(rectifyApp.businessKey)?.name}>
          {appOf(rectifyApp.id)?.status === 'CORRECTIONS_REQUESTED' ? (
            <RectifyForm
              app={appOf(rectifyApp.id)!}
              onIssueNotice={() => {
                setNoticeFor(appOf(rectifyApp.id)!)
                setRectifyApp(null)
              }}
            />
          ) : (
            <InfoBanner>This rectification order has been closed.</InfoBanner>
          )}
        </Modal>
      )}
      {noticeFor && (
        <NoticeFormModal
          onClose={() => setNoticeFor(null)}
          businessKey={noticeFor.businessKey}
          applicationId={noticeFor.id}
          reason="CORRECTIONS_NOT_MET"
          details={`Rectification order for ${noticeFor.ref} not complied with by the deadline.`}
        />
      )}
    </div>
  )
}

export default AssignmentsInspectionsPage
