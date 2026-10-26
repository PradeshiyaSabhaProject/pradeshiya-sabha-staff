/* eslint-disable react-refresh/only-export-components */
import React from 'react'
import type { Business, BusinessCategory, LiabilityType } from '../types/tradeLicense'
import type { BusinessInput } from '../services/tradeLicenseService'
import { Field, inputCls } from './ui'

export const LIABILITY_LABELS: Record<LiabilityType, string> = {
  TRADE_LICENSE: 'Trade licence',
  TRADE_TAX: 'Trade tax',
  BUSINESS_TAX: 'Business tax',
}

export const emptyBusinessInput = (categoryId = ''): BusinessInput => ({
  name: '',
  natureOfActivity: '',
  categoryId,
  owner: { name: '', nic: '', phone: '', email: '', address: '' },
  premises: { address: '', assessmentNo: '', road: '', ward: '', buildingNature: undefined, buildingOwnerName: '', buildingOwnerAddress: '' },
  liabilities: ['TRADE_LICENSE'],
  touristBoardRegistered: false,
  touristBoardRegNo: '',
  annualAssessmentValue: null,
  previousYearTurnover: null,
  previousLicense: undefined,
})

export const businessToInput = (b: Business): BusinessInput => ({
  name: b.name,
  natureOfActivity: b.natureOfActivity,
  categoryId: b.categoryId,
  owner: { ...b.owner },
  premises: { ...b.premises },
  liabilities: [...b.liabilities],
  touristBoardRegistered: b.touristBoardRegistered,
  touristBoardRegNo: b.touristBoardRegNo,
  annualAssessmentValue: b.annualAssessmentValue,
  previousYearTurnover: b.previousYearTurnover,
  previousLicense: b.previousLicense,
  survey: b.survey,
})

const numOrNull =(v: string) => (v.trim() === '' ? null : Number(v))

/** Business master fields – matches "Revenue Survey / Business Registration" and Part A of the paper form. */
export const BusinessFields: React.FC<{
  value: BusinessInput
  onChange: (v: BusinessInput) => void
  categories: BusinessCategory[]
  lockAddress?: boolean
  hideCategory?: boolean
}> = ({ value, onChange, categories, lockAddress, hideCategory }) => {
  const set = (patch: Partial<BusinessInput>) => onChange({ ...value, ...patch })
  const setOwner = (patch: Partial<BusinessInput['owner']>) => set({ owner: { ...value.owner, ...patch } })
  const setPremises = (patch: Partial<BusinessInput['premises']>) => set({ premises: { ...value.premises, ...patch } })
  const toggleLiability = (l: LiabilityType) =>
    set({ liabilities: value.liabilities.includes(l) ? value.liabilities.filter((x) => x !== l) : [...value.liabilities, l] })

  return (
    <div className="space-y-5">
      <section>
        <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2">Business</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Business / trade name" required>
            <input className={inputCls} value={value.name} onChange={(e) => set({ name: e.target.value })} />
          </Field>
          <Field label="Nature of activity" required>
            <input className={inputCls} value={value.natureOfActivity} onChange={(e) => set({ natureOfActivity: e.target.value })} placeholder="e.g. Grocery retail" />
          </Field>
          {!hideCategory && (
            <Field label="Business category / tax category" required>
              <select className={inputCls} value={value.categoryId} onChange={(e) => set({ categoryId: e.target.value })}>
                <option value="">Select category…</option>
                {categories
                  .filter((c) => c.active || c.id === value.categoryId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </Field>
          )}
          <div>
            <span className="block text-[11px] font-bold text-gray-700 mb-1">
              Liable for <span className="text-[#A31736]">*</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(LIABILITY_LABELS) as LiabilityType[]).map((l) => (
                <label key={l} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs cursor-pointer ${value.liabilities.includes(l) ? 'border-[#A31736] bg-[#A31736]/5 text-[#A31736] font-bold' : 'border-gray-300 text-gray-600'}`}>
                  <input type="checkbox" className="accent-[#A31736]" checked={value.liabilities.includes(l)} onChange={() => toggleLiability(l)} />
                  {LIABILITY_LABELS[l]}
                </label>
              ))}
            </div>
          </div>
          <Field label="Annual assessment value (Rs.)" hint="Used to select the licence fee band.">
            <input type="number" min={0} step="0.01" className={inputCls} value={value.annualAssessmentValue ?? ''} onChange={(e) => set({ annualAssessmentValue: numOrNull(e.target.value) })} />
          </Field>
          <Field label="Previous year's turnover (Rs.)" hint="Required where legally needed (e.g. Tourist Board hotels).">
            <input type="number" min={0} step="0.01" className={inputCls} value={value.previousYearTurnover ?? ''} onChange={(e) => set({ previousYearTurnover: numOrNull(e.target.value) })} />
          </Field>
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 sm:col-span-2">
            <input type="checkbox" className="accent-[#A31736]" checked={value.touristBoardRegistered} onChange={(e) => set({ touristBoardRegistered: e.target.checked })} />
            Tourist Board registered hotel (licence fee = previous year's turnover × 1%)
          </label>
          {value.touristBoardRegistered && (
            <Field label="Tourist Board registration no.">
              <input className={inputCls} value={value.touristBoardRegNo ?? ''} onChange={(e) => set({ touristBoardRegNo: e.target.value })} />
            </Field>
          )}
          <Field label="Previous licence no.">
            <input className={inputCls} value={value.previousLicense?.number ?? ''} onChange={(e) => set({ previousLicense: e.target.value ? { number: e.target.value, year: value.previousLicense?.year } : undefined })} />
          </Field>
          <Field label="Previous licence year">
            <input type="number" className={inputCls} value={value.previousLicense?.year ?? ''} disabled={!value.previousLicense?.number} onChange={(e) => set({ previousLicense: { number: value.previousLicense?.number ?? '', year: e.target.value ? Number(e.target.value) : undefined } })} />
          </Field>
        </div>
      </section>

      <section>
        <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2">Owner / Operator</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Name" required>
            <input className={inputCls} value={value.owner.name} onChange={(e) => setOwner({ name: e.target.value })} />
          </Field>
          <Field label="NIC" required>
            <input className={inputCls} value={value.owner.nic} onChange={(e) => setOwner({ nic: e.target.value })} placeholder="200012345678 / 901234567V" />
          </Field>
          <Field label="Phone" required>
            <input className={inputCls} value={value.owner.phone} onChange={(e) => setOwner({ phone: e.target.value })} placeholder="07XXXXXXXX" />
          </Field>
          <Field label="Email">
            <input type="email" className={inputCls} value={value.owner.email ?? ''} onChange={(e) => setOwner({ email: e.target.value })} />
          </Field>
          <Field label="Personal address" required className="sm:col-span-2">
            <input className={inputCls} value={value.owner.address} onChange={(e) => setOwner({ address: e.target.value })} />
          </Field>
        </div>
      </section>

      <section>
        <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2">Premises</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Business premises address" required className="sm:col-span-2" hint={lockAddress ? 'Use "Change Location" to move the business – this issues a new Business ID.' : 'Include the route to reach the premises if needed.'}>
            <input className={inputCls} value={value.premises.address} disabled={lockAddress} onChange={(e) => setPremises({ address: e.target.value })} />
          </Field>
          <Field label="Assessment no. (property reference)">
            <input className={inputCls} value={value.premises.assessmentNo ?? ''} onChange={(e) => setPremises({ assessmentNo: e.target.value })} />
          </Field>
          <Field label="Road">
            <input className={inputCls} value={value.premises.road ?? ''} onChange={(e) => setPremises({ road: e.target.value })} />
          </Field>
          <Field label="Ward / GN division">
            <input className={inputCls} value={value.premises.ward ?? ''} onChange={(e) => setPremises({ ward: e.target.value })} />
          </Field>
          <Field label="Building nature">
            <select className={inputCls} value={value.premises.buildingNature ?? ''} onChange={(e) => setPremises({ buildingNature: (e.target.value || undefined) as 'Permanent' | 'Temporary' | undefined })}>
              <option value="">Not recorded</option>
              <option value="Permanent">Permanent</option>
              <option value="Temporary">Temporary</option>
            </select>
          </Field>
          <Field label="Building owner name">
            <input className={inputCls} value={value.premises.buildingOwnerName ?? ''} onChange={(e) => setPremises({ buildingOwnerName: e.target.value })} />
          </Field>
          <Field label="Building owner address">
            <input className={inputCls} value={value.premises.buildingOwnerAddress ?? ''} onChange={(e) => setPremises({ buildingOwnerAddress: e.target.value })} />
          </Field>
        </div>
      </section>
    </div>
  )
}
