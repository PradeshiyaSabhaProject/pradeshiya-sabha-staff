import React, { useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useTradeLicense } from '../context/TradeLicenseContext'
import type { Application, PaymentMethod } from '../types/tradeLicense'
import type { BusinessInput } from '../services/tradeLicenseService'
import { BusinessFields, emptyBusinessInput } from './BusinessFields'
import { PAYMENT_METHOD_LABELS } from './labels'
import { ErrorBanner, Field, InfoBanner, Modal, NeedsConfirmation, btnPrimary, btnSecondary, formatLKR, inputCls, todayIso } from './ui'

interface Props {
  open: boolean
  onClose: () => void
  onCreated: (app: Application) => void
  presetBusinessKey?: string
  presetType?: Application['type']
  presetYear?: number
}

export const ApplicationFormModal: React.FC<Props> = ({ open, onClose, onCreated, presetBusinessKey, presetType, presetYear }) => {
  const { db, run } = useTradeLicense()
  const year = new Date().getFullYear()
  const [channel, setChannel] = useState<'COUNTER' | 'ONLINE'>('COUNTER')
  const [mode, setMode] = useState<'existing' | 'new'>(presetBusinessKey ? 'existing' : 'new')
  const [businessKey, setBusinessKey] = useState(presetBusinessKey ?? '')
  const [businessSearch, setBusinessSearch] = useState('')
  const [business, setBusiness] = useState<BusinessInput>(emptyBusinessInput())
  const [type, setType] = useState<Application['type']>(presetType ?? 'NEW')
  const [licenseYear, setLicenseYear] = useState(presetYear ?? year)
  const [categoryId, setCategoryId] = useState(() => db?.businesses.find((b) => b.key === presetBusinessKey)?.categoryId ?? '')
  const [applicant, setApplicant] = useState<Application['applicant']>({ name: '', nic: '', phone: '', email: '', relationship: 'Owner' })
  const [sameAsOwner, setSameAsOwner] = useState(true)
  const [income, setIncome] = useState('')
  const [extraDocs, setExtraDocs] = useState<string[]>([])
  const [received, setReceived] = useState<Record<string, boolean>>({})
  const [feeAmount, setFeeAmount] = useState(() => (db?.settings.processingFee.amount ? String(db.settings.processingFee.amount) : ''))
  const [ackFee, setAckFee] = useState(false)
  const [payMethod, setPayMethod] = useState<PaymentMethod>('CASH')
  const [receiptNo, setReceiptNo] = useState('')
  const [payDate, setPayDate] = useState(todayIso())
  const [portalRef, setPortalRef] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const categories = useMemo(() => db?.categories ?? [], [db])
  const category = categories.find((c) => c.id === categoryId)
  const selectedBusiness = db?.businesses.find((b) => b.key === businessKey)
  const feeCfg = db?.settings.processingFee
  const feeConfirmed = !!feeCfg?.confirmed && feeCfg.amount !== null

  const businessOptions = useMemo(() => {
    const q = businessSearch.trim().toLowerCase()
    return (db?.businesses ?? [])
      .filter((b) => b.status === 'ACTIVE')
      .filter((b) => !q || [b.name, b.businessId, b.owner.name, b.owner.nic, b.premises.address].some((x) => x?.toLowerCase().includes(q)))
      .slice(0, 50)
  }, [db, businessSearch])

  if (!db) return null

  const docLabels = [...new Set([...(category?.requiredDocuments ?? []), ...extraDocs.filter((d) => d.trim())])]
  const ownerSource = mode === 'existing' ? selectedBusiness?.owner : business.owner
  const effectiveApplicant = sameAsOwner && ownerSource
    ? { name: ownerSource.name, nic: ownerSource.nic, phone: ownerSource.phone, email: ownerSource.email, relationship: 'Owner' as const }
    : applicant

  const submit = async () => {
    setError(null)
    if (!categoryId) return setError('Select the business category.')
    if (mode === 'existing' && !businessKey) return setError('Select the business from the register.')
    const base = {
      businessKey: mode === 'existing' ? businessKey : undefined,
      business: mode === 'new' ? { ...business, categoryId } : undefined,
      applicant: effectiveApplicant,
      categoryId,
      licenseYear,
      type,
      declaredLastYearIncome: income.trim() === '' ? null : Number(income),
      documents: docLabels.map((label) => ({ label, received: !!received[label] })),
    }
    setSaving(true)
    const res =
      channel === 'COUNTER'
        ? await run(
            (svc, actor) =>
              svc.createCounterApplication(
                {
                  ...base,
                  processingFee: {
                    amount: Number(feeAmount),
                    acknowledgeUnconfirmed: ackFee,
                    payment: { method: payMethod, receiptNo, date: payDate },
                  },
                },
                actor
              ),
            'Application registered and processing fee recorded.'
          )
        : await run(
            (svc, actor) => svc.submitOnlineApplication({ ...base, portalRef, processingFeeAmount: feeAmount ? Number(feeAmount) : undefined }, actor),
            'Online submission registered – awaiting processing fee payment.'
          )
    setSaving(false)
    if (res.ok) onCreated(res.value)
    else setError(res.error)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title="New Trade Licence Application"
      subtitle="Register an application and record the processing fee. A Business ID is issued when the processing fee is paid."
      footer={
        <>
          <button type="button" className={btnSecondary} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={btnPrimary} onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : channel === 'COUNTER' ? 'Register Application & Fee' : 'Register Online Submission'}
          </button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Field label="Channel" required>
            <select className={inputCls} value={channel} onChange={(e) => setChannel(e.target.value as 'COUNTER' | 'ONLINE')}>
              <option value="COUNTER">Officer-assisted (counter)</option>
              <option value="ONLINE">Online portal submission</option>
            </select>
          </Field>
          <Field label="Application type" required>
            <select className={inputCls} value={type} onChange={(e) => { setType(e.target.value as Application['type']); if (e.target.value === 'RENEWAL') setMode('existing') }}>
              <option value="NEW">New licence</option>
              <option value="RENEWAL">Renewal</option>
            </select>
          </Field>
          <Field label="Licence year" required>
            <select className={inputCls} value={licenseYear} onChange={(e) => setLicenseYear(Number(e.target.value))}>
              {[year - 1, year, year + 1].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Business category" required>
            <select className={inputCls} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Select…</option>
              {categories.filter((c) => c.active).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        {channel === 'ONLINE' && (
          <InfoBanner>
            Use this to register a form received through the public website (or its e-mail/PDF export) using the portal reference. The processing fee is
            recorded as a charge and the application waits until the payment is verified under <strong>Licenses &amp; Payments</strong>.
          </InfoBanner>
        )}

        <section className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-500">Business</h4>
            <div className="flex bg-gray-100 rounded-lg p-0.5 text-[11px] font-bold">
              <button type="button" disabled={type === 'RENEWAL'} onClick={() => setMode('new')} className={`px-2.5 py-1 rounded-md cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${mode === 'new' ? 'bg-white shadow-2xs text-[#A31736]' : 'text-gray-600'}`}>
                New business
              </button>
              <button type="button" onClick={() => setMode('existing')} className={`px-2.5 py-1 rounded-md cursor-pointer ${mode === 'existing' ? 'bg-white shadow-2xs text-[#A31736]' : 'text-gray-600'}`}>
                Existing / surveyed business
              </button>
            </div>
          </div>
          {mode === 'existing' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Search register" hint="Name, Business ID, owner, NIC or address">
                <input className={inputCls} value={businessSearch} onChange={(e) => setBusinessSearch(e.target.value)} />
              </Field>
              <Field label="Business" required>
                <select
                  className={inputCls}
                  value={businessKey}
                  onChange={(e) => {
                    setBusinessKey(e.target.value)
                    const b = db.businesses.find((x) => x.key === e.target.value)
                    if (b && !categoryId) setCategoryId(b.categoryId)
                  }}
                >
                  <option value="">{businessOptions.length ? 'Select business…' : 'No matching businesses'}</option>
                  {businessOptions.map((b) => (
                    <option key={b.key} value={b.key}>
                      {b.businessId ?? 'No ID yet'} · {b.name} · {b.premises.address}
                    </option>
                  ))}
                </select>
              </Field>
              {selectedBusiness && (
                <p className="sm:col-span-2 text-[11px] text-gray-600 bg-gray-50 border border-gray-200 rounded-xl p-2.5">
                  Owner {selectedBusiness.owner.name} ({selectedBusiness.owner.nic}) · Assessment value {selectedBusiness.annualAssessmentValue ?? '—'}
                  {selectedBusiness.touristBoardRegistered ? ' · Tourist Board hotel' : ''}. Update business details under Assignments &amp; Inspections → Business Register.
                </p>
              )}
            </div>
          ) : (
            <BusinessFields value={business} onChange={setBusiness} categories={categories} hideCategory />
          )}
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-500">Applicant</h4>
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
              <input type="checkbox" className="accent-[#A31736]" checked={sameAsOwner} onChange={(e) => setSameAsOwner(e.target.checked)} />
              Applicant is the owner
            </label>
          </div>
          {!sameAsOwner && (
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <Field label="Name" required>
                <input className={inputCls} value={applicant.name} onChange={(e) => setApplicant({ ...applicant, name: e.target.value })} />
              </Field>
              <Field label="NIC" required>
                <input className={inputCls} value={applicant.nic} onChange={(e) => setApplicant({ ...applicant, nic: e.target.value })} />
              </Field>
              <Field label="Phone" required>
                <input className={inputCls} value={applicant.phone} onChange={(e) => setApplicant({ ...applicant, phone: e.target.value })} />
              </Field>
              <Field label="Email">
                <input className={inputCls} value={applicant.email ?? ''} onChange={(e) => setApplicant({ ...applicant, email: e.target.value })} />
              </Field>
              <Field label="Relationship">
                <select className={inputCls} value={applicant.relationship} onChange={(e) => setApplicant({ ...applicant, relationship: e.target.value as Application['applicant']['relationship'] })}>
                  <option value="Authorised Agent">Authorised agent</option>
                  <option value="Owner">Owner</option>
                </select>
              </Field>
            </div>
          )}
          <Field label="Declared annual income of the business last year (Rs.)" className="max-w-xs">
            <input type="number" min={0} className={inputCls} value={income} onChange={(e) => setIncome(e.target.value)} />
          </Field>
        </section>

        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-500">Required documents</h4>
            {category && !category.confirmed && <NeedsConfirmation label="Document list draft" />}
          </div>
          {!category ? (
            <p className="text-xs text-gray-500">Select a category to load its document list.</p>
          ) : (
            <div className="space-y-1.5">
              {docLabels.map((label) => (
                <label key={label} className="flex items-center gap-2 text-xs text-gray-700">
                  <input type="checkbox" className="accent-[#A31736]" checked={!!received[label]} onChange={(e) => setReceived({ ...received, [label]: e.target.checked })} />
                  <span className="flex-1">{label}</span>
                  <span className="text-[10px] text-gray-400">{received[label] ? 'Received' : 'Pending'}</span>
                </label>
              ))}
              {extraDocs.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input className={inputCls} placeholder="Additional document name" value={d} onChange={(e) => setExtraDocs(extraDocs.map((x, j) => (j === i ? e.target.value : x)))} />
                  <button type="button" onClick={() => setExtraDocs(extraDocs.filter((_, j) => j !== i))} className="p-2 text-gray-400 hover:text-rose-600 cursor-pointer" aria-label="Remove">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setExtraDocs([...extraDocs, ''])} className="inline-flex items-center gap-1 text-xs font-bold text-[#A31736] cursor-pointer">
                <Plus className="w-3.5 h-3.5" /> Add document
              </button>
            </div>
          )}
        </section>

        <section className="space-y-3 p-4 rounded-2xl border border-gray-200 bg-gray-50/60">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-500">Processing fee (separate from licence fee)</h4>
            {!feeConfirmed && <NeedsConfirmation label="Rate not confirmed" tooltip="The processing fee amount is not specified in the requirements. Configure it in Licenses & Payments → Fee Rules." />}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Field label="Amount (Rs.)" required>
              <input type="number" min={0} step="0.01" className={inputCls} value={feeConfirmed ? String(feeCfg!.amount) : feeAmount} disabled={feeConfirmed} onChange={(e) => setFeeAmount(e.target.value)} />
            </Field>
            {channel === 'COUNTER' && (
              <>
                <Field label="Payment method" required>
                  <select className={inputCls} value={payMethod} onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}>
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
                  <input type="date" max={todayIso()} className={inputCls} value={payDate} onChange={(e) => setPayDate(e.target.value)} />
                </Field>
              </>
            )}
            {channel === 'ONLINE' && (
              <Field label="Portal reference no." required>
                <input className={inputCls} value={portalRef} onChange={(e) => setPortalRef(e.target.value)} />
              </Field>
            )}
          </div>
          {channel === 'COUNTER' && !feeConfirmed && (
            <label className="flex items-start gap-2 text-xs text-amber-900">
              <input type="checkbox" className="accent-[#A31736] mt-0.5" checked={ackFee} onChange={(e) => setAckFee(e.target.checked)} />
              I confirm {feeAmount ? formatLKR(Number(feeAmount)) : 'this amount'} is the processing fee officially charged by the Pradeshiya Sabha.
            </label>
          )}
        </section>

        <ErrorBanner message={error} />
      </div>
    </Modal>
  )
}

export default ApplicationFormModal
