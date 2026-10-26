/* eslint-disable react-refresh/only-export-components */
import React, { useState } from 'react'
import { useTradeLicense } from '../context/TradeLicenseContext'
import { addDays } from '../rules/tradeLicenseRules'
import type { LegalNotice, NoticeReason } from '../types/tradeLicense'
import { ErrorBanner, Field, Modal, btnPrimary, btnSecondary, formatDate, inputCls, todayIso } from './ui'

export const NOTICE_REASON_LABELS: Record<NoticeReason, string> = {
  NO_LICENSE: 'Failed to obtain the required licence',
  UNPAID_FEE: 'Failed to pay the required tax / charge',
  CORRECTIONS_NOT_MET: 'Rectification order not complied with',
  OTHER: 'Other non-compliance',
}

export const SERVICE_METHOD_LABELS: Record<LegalNotice['service']['method'], string> = {
  HAND_DELIVERED: 'Hand delivered',
  REGISTERED_POST: 'Registered post',
  AFFIXED_AT_PREMISES: 'Affixed at premises',
  OTHER: 'Other',
}

export const NoticeFormModal: React.FC<{
  onClose: () => void
  businessKey?: string
  applicationId?: string
  reason?: NoticeReason
  details?: string
}> = ({ onClose, businessKey: presetBusiness, applicationId, reason: presetReason, details }) => {
  const { db, run, actor } = useTradeLicense()
  const [businessKey, setBusinessKey] = useState(presetBusiness ?? '')
  const [reason, setReason] = useState<NoticeReason>(presetReason ?? 'NO_LICENSE')
  const [reasonDetails, setReasonDetails] = useState(details ?? '')
  const [issueDate, setIssueDate] = useState(todayIso())
  const [method, setMethod] = useState<LegalNotice['service']['method']>('HAND_DELIVERED')
  const [servedBy, setServedBy] = useState(actor.name)
  const [servedOn, setServedOn] = useState(todayIso())
  const [serviceDetails, setServiceDetails] = useState('')
  const [officer, setOfficer] = useState(actor.name)
  const [error, setError] = useState<string | null>(null)
  if (!db) return null

  const submit = async () => {
    if (!businessKey) return setError('Select the business.')
    const res = await run(
      (svc, a) =>
        svc.issueNotice(
          {
            businessKey,
            applicationId,
            reason,
            reasonDetails,
            issueDate,
            service: { method, servedBy, servedOn, details: serviceDetails },
            responsibleOfficer: officer,
          },
          a
        ),
      '14-day legal notice recorded.'
    )
    if (res.ok) onClose()
    else setError(res.error)
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title="Issue 14-day Legal Notice"
      subtitle={`Non-compliance notice. Compliance deadline: ${formatDate(addDays(servedOn || issueDate, db.settings.legalNoticeDays))} (${db.settings.legalNoticeDays} days from service).`}
      footer={
        <>
          <button type="button" className={btnSecondary} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={btnPrimary} onClick={submit}>
            Record Notice
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Business" required className="sm:col-span-2">
          <select className={inputCls} value={businessKey} disabled={!!presetBusiness} onChange={(e) => setBusinessKey(e.target.value)}>
            <option value="">Select business…</option>
            {db.businesses.map((b) => (
              <option key={b.key} value={b.key}>
                {b.businessId ?? 'No ID'} · {b.name} · {b.premises.address}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Reason" required>
          <select className={inputCls} value={reason} onChange={(e) => setReason(e.target.value as NoticeReason)}>
            {(Object.keys(NOTICE_REASON_LABELS) as NoticeReason[]).map((r) => (
              <option key={r} value={r}>
                {NOTICE_REASON_LABELS[r]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Notice issue date" required>
          <input type="date" max={todayIso()} className={inputCls} value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
        </Field>
        <Field label="Reason details" required className="sm:col-span-2">
          <textarea rows={2} className={inputCls} value={reasonDetails} onChange={(e) => setReasonDetails(e.target.value)} />
        </Field>
        <Field label="Service method" required>
          <select className={inputCls} value={method} onChange={(e) => setMethod(e.target.value as LegalNotice['service']['method'])}>
            {(Object.keys(SERVICE_METHOD_LABELS) as LegalNotice['service']['method'][]).map((m) => (
              <option key={m} value={m}>
                {SERVICE_METHOD_LABELS[m]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Served on" required>
          <input type="date" max={todayIso()} className={inputCls} value={servedOn} onChange={(e) => setServedOn(e.target.value)} />
        </Field>
        <Field label="Served by" required>
          <input className={inputCls} value={servedBy} onChange={(e) => setServedBy(e.target.value)} />
        </Field>
        <Field label="Responsible officer" required>
          <input className={inputCls} value={officer} onChange={(e) => setOfficer(e.target.value)} />
        </Field>
        <Field label="Delivery details" className="sm:col-span-2" hint="e.g. received by, registered post no.">
          <input className={inputCls} value={serviceDetails} onChange={(e) => setServiceDetails(e.target.value)} />
        </Field>
      </div>
      <div className="mt-3">
        <ErrorBanner message={error} />
      </div>
    </Modal>
  )
}

export default NoticeFormModal
