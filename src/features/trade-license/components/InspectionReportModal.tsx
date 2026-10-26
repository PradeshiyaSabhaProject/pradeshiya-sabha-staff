import React, { useState } from 'react'
import { Camera, Trash2 } from 'lucide-react'
import { useTradeLicense } from '../context/TradeLicenseContext'
import { INSPECTION_TYPE_DESIGNATION, INSPECTION_TYPE_LABELS } from '../config/defaultConfig'
import { canSubmitInspection } from '../rules/tradeLicenseRules'
import type { ChecklistResult, Inspection, InspectionRecommendation } from '../types/tradeLicense'
import { ErrorBanner, Field, InfoBanner, Modal, NeedsConfirmation, Pill, btnPrimary, btnSecondary, formatDateTime, inputCls } from './ui'

const RESULT_LABELS: Record<ChecklistResult, string> = { COMPLIANT: 'Compliant', NON_COMPLIANT: 'Non-compliant', NA: 'N/A' }
const REC_LABELS: Record<InspectionRecommendation, string> = {
  RECOMMEND: 'Recommend approval',
  CORRECTIONS_REQUIRED: 'Corrections required',
  NOT_RECOMMENDED: 'Not recommended',
}

/** Downscale photos so they fit in browser storage (max 1280px, JPEG). */
function readPhoto(file: File): Promise<{ name: string; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error(`${file.name} is not an image.`))
    const reader = new FileReader()
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error(`Could not open ${file.name}.`))
      img.onload = () => {
        const scale = Math.min(1, 1280 / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) return resolve({ name: file.name, dataUrl: reader.result as string })
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve({ name: file.name, dataUrl: canvas.toDataURL('image/jpeg', 0.75) })
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

export const InspectionReportModal: React.FC<{ inspection: Inspection; onClose: () => void }> = ({ inspection, onClose }) => {
  const { db, run, actor } = useTradeLicense()
  const app = db?.applications.find((a) => a.id === inspection.applicationId)
  const template = db?.checklists.find((c) => c.id === inspection.checklistTemplateId)
  const editable = inspection.status === 'ASSIGNED' && canSubmitInspection(actor.designation, inspection.type)
  const [checklist, setChecklist] = useState(inspection.checklist)
  const [photos, setPhotos] = useState<{ name: string; dataUrl: string }[]>(inspection.photos)
  const [remarks, setRemarks] = useState(inspection.remarks ?? '')
  const [recommendation, setRecommendation] = useState<InspectionRecommendation | ''>(inspection.recommendation ?? '')
  const [manualRef, setManualRef] = useState(inspection.manualReportRef ?? '')
  const [mohRemarks, setMohRemarks] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!db || !app) return null
  const business = db.businesses.find((b) => b.key === app.businessKey)
  const canMoh =
    inspection.type === 'PHI' && inspection.status === 'REPORT_SUBMITTED' && !inspection.mohSignOff && actor.designation === 'Medical Officer of Health'

  const addPhotos = async (files: FileList | null) => {
    if (!files) return
    try {
      const read = await Promise.all([...files].map(readPhoto))
      setPhotos((p) => [...p, ...read].slice(0, 6))
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const submit = async () => {
    setBusy(true)
    const res = await run(
      (svc, a) =>
        svc.submitInspectionReport(
          inspection.id,
          { checklist, photos, remarks, recommendation: recommendation || undefined, manualReportRef: manualRef },
          a
        ),
      'Inspection report submitted.'
    )
    setBusy(false)
    if (res.ok) onClose()
    else setError(res.error)
  }

  const signOff = async (decision: 'ENDORSED' | 'NOT_ENDORSED') => {
    setBusy(true)
    const res = await run((svc, a) => svc.mohSignOff(inspection.id, { decision, remarks: mohRemarks }, a), decision === 'ENDORSED' ? 'PHI report endorsed.' : 'PHI report not endorsed.')
    setBusy(false)
    if (res.ok) onClose()
    else setError(res.error)
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={`${INSPECTION_TYPE_LABELS[inspection.type]} – Round ${inspection.round}`}
      subtitle={`${app.ref} · ${business?.name ?? ''} · ${business?.premises.address ?? ''} · Assigned to ${inspection.assignedTo}`}
      footer={
        <>
          <button type="button" className={btnSecondary} onClick={onClose}>
            Close
          </button>
          {editable && (
            <button type="button" className={btnPrimary} onClick={submit} disabled={busy}>
              {busy ? 'Submitting…' : 'Submit Report'}
            </button>
          )}
        </>
      }
    >
      <div className="space-y-5">
        {!editable && inspection.status === 'ASSIGNED' && (
          <InfoBanner>This report must be submitted by the {INSPECTION_TYPE_DESIGNATION[inspection.type]}. Switch the acting designation if you hold that office.</InfoBanner>
        )}

        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-500">Category checklist</h4>
            {template && !template.confirmed && <NeedsConfirmation label="Conditions to be confirmed" tooltip="By-law conditions must be provided by the Pradeshiya Sabha. Edit under Checklist Templates." />}
          </div>
          {checklist.length === 0 ? (
            <InfoBanner tone="amber">No checklist is configured for this category and inspection type. Record detailed remarks below.</InfoBanner>
          ) : (
            <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl">
              {checklist.map((c, idx) => (
                <div key={c.itemId} className="p-3 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-gray-800">
                      {c.label}
                      {c.mandatory && <span className="text-[#A31736]"> *</span>}
                    </span>
                    <div className="flex gap-1">
                      {(Object.keys(RESULT_LABELS) as ChecklistResult[]).map((r) => (
                        <button
                          key={r}
                          type="button"
                          disabled={!editable}
                          onClick={() => setChecklist(checklist.map((x, j) => (j === idx ? { ...x, result: r } : x)))}
                          className={`px-2 py-1 text-[11px] font-bold rounded-lg border cursor-pointer disabled:cursor-default ${
                            c.result === r
                              ? r === 'COMPLIANT'
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : r === 'NON_COMPLIANT'
                                  ? 'bg-rose-600 text-white border-rose-600'
                                  : 'bg-gray-600 text-white border-gray-600'
                              : 'bg-white text-gray-600 border-gray-300'
                          }`}
                        >
                          {RESULT_LABELS[r]}
                        </button>
                      ))}
                    </div>
                  </div>
                  {(editable || c.note) && (
                    <input
                      className={inputCls}
                      disabled={!editable}
                      placeholder="Officer note (optional)"
                      value={c.note ?? ''}
                      onChange={(e) => setChecklist(checklist.map((x, j) => (j === idx ? { ...x, note: e.target.value } : x)))}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-2">
          <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-500">Photographs ({photos.length}/6)</h4>
          <div className="flex flex-wrap gap-2">
            {photos.map((p, i) => (
              <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                <img src={p.dataUrl} alt={p.name} className="w-full h-full object-cover" />
                {editable && (
                  <button type="button" onClick={() => setPhotos(photos.filter((_, j) => j !== i))} className="absolute top-1 right-1 p-1 bg-white/90 rounded-md text-rose-600 cursor-pointer" aria-label="Remove photo">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            {editable && photos.length < 6 && (
              <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-[10px] font-bold text-gray-500 cursor-pointer hover:border-[#A31736] hover:text-[#A31736]">
                <Camera className="w-5 h-5 mb-1" /> Add photo
                <input type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={(e) => void addPhotos(e.target.files)} />
              </label>
            )}
            {!editable && photos.length === 0 && <p className="text-xs text-gray-400">No photographs.</p>}
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Recommendation" required>
            <select className={inputCls} disabled={!editable} value={recommendation} onChange={(e) => setRecommendation(e.target.value as InspectionRecommendation)}>
              <option value="">Select…</option>
              {(Object.keys(REC_LABELS) as InspectionRecommendation[]).map((r) => (
                <option key={r} value={r}>
                  {REC_LABELS[r]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Manual report reference" hint={inspection.type === 'PHI' ? 'Reference of the signed paper report, if any.' : undefined}>
            <input className={inputCls} disabled={!editable} value={manualRef} onChange={(e) => setManualRef(e.target.value)} />
          </Field>
          <Field label="Remarks / corrections to be made" className="sm:col-span-2">
            <textarea rows={3} className={inputCls} disabled={!editable} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          </Field>
        </section>

        {inspection.status === 'REPORT_SUBMITTED' && (
          <p className="text-[11px] text-gray-500">
            Report submitted by {inspection.reportSubmittedBy} on {formatDateTime(inspection.reportSubmittedAt)}.
          </p>
        )}

        {inspection.type === 'PHI' && app.mohSignOffRequired && inspection.status === 'REPORT_SUBMITTED' && (
          <section className="p-4 rounded-2xl border border-gray-200 bg-gray-50/60 space-y-3">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-500">MOH sign-off</h4>
            {inspection.mohSignOff ? (
              <div className="text-xs space-y-1">
                <Pill tone={inspection.mohSignOff.decision === 'ENDORSED' ? 'emerald' : 'rose'}>
                  {inspection.mohSignOff.decision === 'ENDORSED' ? 'Endorsed' : 'Not endorsed'}
                </Pill>
                <p className="text-gray-600">
                  {inspection.mohSignOff.by} · {formatDateTime(inspection.mohSignOff.at)}
                </p>
                {inspection.mohSignOff.remarks && <p className="text-gray-700">{inspection.mohSignOff.remarks}</p>}
              </div>
            ) : canMoh ? (
              <>
                <Field label="MOH remarks" hint="Required if not endorsed.">
                  <textarea rows={2} className={inputCls} value={mohRemarks} onChange={(e) => setMohRemarks(e.target.value)} />
                </Field>
                <div className="flex gap-2">
                  <button type="button" className={btnPrimary} disabled={busy} onClick={() => signOff('ENDORSED')}>
                    Endorse PHI Report
                  </button>
                  <button type="button" className={btnSecondary} disabled={busy} onClick={() => signOff('NOT_ENDORSED')}>
                    Do Not Endorse
                  </button>
                </div>
              </>
            ) : (
              <p className="text-xs text-gray-500">Awaiting signature by the Medical Officer of Health.</p>
            )}
          </section>
        )}

        <ErrorBanner message={error} />
      </div>
    </Modal>
  )
}

export default InspectionReportModal
