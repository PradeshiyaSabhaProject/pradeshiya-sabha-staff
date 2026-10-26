import React, { useState } from 'react'
import { CheckCircle2, FilePlus2, Plus, Upload, UserRound } from 'lucide-react'
import type { FacilityBooking, FacilityType } from '../../booking-management/types'
import type { StaffBookingWorkflow } from '../types'

interface MyBookingSectionProps {
  bookings: FacilityBooking[]
  workflows: Record<string, StaffBookingWorkflow>
  onCreateBooking: (booking: FacilityBooking, workflow: StaffBookingWorkflow) => boolean
}

interface BookingFormValues {
  facilityName: FacilityType | ''
  citizenName: string
  citizenNic: string
  citizenPhone: string
  citizenEmail: string
  citizenAddress: string
  eventTitle: string
  eventType: string
  bookingDate: string
  startTime: string
  endTime: string
  expectedAttendees: string
  rentalFee: string
  securityDeposit: string
  paymentPlan: StaffBookingWorkflow['paymentPlan']
  upfrontAmount: string
  upfrontReceived: boolean
  assignedOfficer: string
  specialRequirements: string
}

const facilities: FacilityType[] = [
  'Pradeshiya Sabha Town Hall',
  'Mattegoda Community Center',
  'Kottawa Public Ground & Pavilion',
  'Homagama Indoor Sports Complex',
  'Public Crematorium & Chapel',
  'Mobile Stage & Sound Equipment',
]

const createEmptyForm = (): BookingFormValues => ({
  facilityName: '',
  citizenName: '',
  citizenNic: '',
  citizenPhone: '',
  citizenEmail: '',
  citizenAddress: '',
  eventTitle: '',
  eventType: '',
  bookingDate: '',
  startTime: '',
  endTime: '',
  expectedAttendees: '',
  rentalFee: '',
  securityDeposit: '0',
  paymentPlan: 'ADVANCE',
  upfrontAmount: '0',
  upfrontReceived: false,
  assignedOfficer: '',
  specialRequirements: '',
})

const fileToDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => {
    if (typeof reader.result === 'string') resolve(reader.result)
    else reject(new Error(`Could not read ${file.name}.`))
  }
  reader.onerror = () => reject(new Error(`Could not read ${file.name}.`))
  reader.readAsDataURL(file)
})

const attachmentType = (file: File): 'image' | 'pdf' | 'doc' => {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type === 'application/pdf' || file.name.toLocaleLowerCase().endsWith('.pdf')) return 'pdf'
  return 'doc'
}

const MyBookingSection: React.FC<MyBookingSectionProps> = ({ bookings, workflows, onCreateBooking }) => {
  const [form, setForm] = useState<BookingFormValues>(createEmptyForm)
  const [files, setFiles] = useState<File[]>([])
  const [formError, setFormError] = useState('')
  const [successRef, setSuccessRef] = useState('')
  const [saving, setSaving] = useState(false)

  const change = <K extends keyof BookingFormValues>(key: K, value: BookingFormValues[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const totalCharge = (Number(form.rentalFee) || 0) + (Number(form.securityDeposit) || 0)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')
    setSuccessRef('')

    if (!form.facilityName) {
      setFormError('Select a public place or facility.')
      return
    }
    if (form.endTime <= form.startTime) {
      setFormError('The end time must be later than the start time.')
      return
    }
    const rentalFee = Number(form.rentalFee)
    const securityDeposit = Number(form.securityDeposit)
    const upfrontAmount = Number(form.upfrontAmount)
    const expectedAttendees = Number(form.expectedAttendees)
    const total = rentalFee + securityDeposit
    if (![rentalFee, securityDeposit, upfrontAmount, expectedAttendees].every(Number.isFinite) ||
      rentalFee < 0 || securityDeposit < 0 || upfrontAmount < 0 || expectedAttendees < 1) {
      setFormError('Enter valid non-negative charges and a guest count of at least one.')
      return
    }
    if (upfrontAmount > total) {
      setFormError('The amount received cannot be greater than the rental fee and security deposit total.')
      return
    }
    if (form.upfrontReceived && upfrontAmount === 0) {
      setFormError('Enter the amount collected or clear the payment-received checkbox.')
      return
    }
    if (form.paymentPlan === 'FULL' && form.upfrontReceived && upfrontAmount < total) {
      setFormError('A full-payment booking must collect the complete rental fee and security deposit.')
      return
    }
    if (files.reduce((size, file) => size + file.size, 0) > 2 * 1024 * 1024) {
      setFormError('Supporting documents must total no more than 2 MB so this browser can save them.')
      return
    }

    setSaving(true)
    try {
      const now = new Date()
      const date = now.toISOString().slice(0, 10)
      const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const id = `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const refId = `#PS-FB-${now.getFullYear()}-M${Date.now()}`
      const attachments = await Promise.all(files.map(async (file, index) => ({
        id: `${id}-attachment-${index + 1}`,
        name: file.name,
        size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
        type: attachmentType(file),
        url: await fileToDataUrl(file),
      })))
      const booking: FacilityBooking = {
        id,
        refId,
        source: 'STAFF_MANUAL',
        facilityName: form.facilityName,
        citizenName: form.citizenName.trim(),
        citizenNic: form.citizenNic.trim(),
        citizenPhone: form.citizenPhone.trim(),
        citizenEmail: form.citizenEmail.trim(),
        citizenAddress: form.citizenAddress.trim(),
        eventTitle: form.eventTitle.trim(),
        eventType: form.eventType.trim(),
        bookingDate: form.bookingDate,
        timeSlot: `${form.startTime} - ${form.endTime}`,
        submittedDate: date,
        submittedTime: time,
        expectedAttendees,
        rentalFee,
        securityDeposit,
        paymentStatus: form.upfrontReceived && upfrontAmount >= total ? 'PAID' : 'PENDING',
        status: 'PENDING',
        specialRequirements: form.specialRequirements.trim(),
        attachments,
        remarks: [{
          id: `${id}-remark`,
          author: form.assignedOfficer.trim() || 'Staff Officer',
          text: 'Booking recorded manually by council staff.',
          date,
          time,
          action: 'NOTE',
        }],
        assignedOfficer: form.assignedOfficer.trim() || undefined,
      }
      const workflow: StaffBookingWorkflow = {
        status: 'PENDING',
        paymentPlan: form.paymentPlan,
        upfrontAmount,
        upfrontReceived: form.upfrontReceived,
        balanceReceived: form.upfrontReceived && upfrontAmount >= total,
        groundsReady: false,
        setupReady: false,
        utilitiesReady: false,
        permitVerified: false,
        venueHandedOver: false,
        venueReturned: false,
        depositOutcome: null,
        settlementClosed: false,
      }

      if (onCreateBooking(booking, workflow)) {
        setSuccessRef(refId)
        setForm(createEmptyForm())
        setFiles([])
      } else {
        setFormError('The booking could not be saved. Review the staff workflow error shown above and try again.')
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not prepare the booking documents.')
    } finally {
      setSaving(false)
    }
  }

  const updateFiles = (selected: FileList | null) => {
    const nextFiles = selected ? Array.from(selected) : []
    if (nextFiles.some((file) => file.size > 2 * 1024 * 1024) ||
      nextFiles.reduce((size, file) => size + file.size, 0) > 2 * 1024 * 1024) {
      setFormError('Supporting documents must total no more than 2 MB so this browser can save them.')
      return
    }
    setFormError('')
    setFiles(nextFiles)
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
        <div className="mb-5 flex items-start gap-3">
          <span className="rounded-xl bg-rose-50 p-2.5 text-[#A31736]"><Plus className="h-5 w-5" /></span>
          <div>
            <h2 className="text-base font-bold text-gray-900">Create a manual booking</h2>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">
              Record a counter or staff-assisted booking. It will enter the pending approvals queue and the relevant payment and venue workflows.
            </p>
          </div>
        </div>

        {successRef && (
          <div role="status" className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Booking {successRef} was saved and added to the approval queue.
          </div>
        )}
        {formError && (
          <div role="alert" className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormSection title="Applicant details" icon={<UserRound className="h-4 w-4" />}>
            <Field label="Full name" required>
              <input required maxLength={120} value={form.citizenName} onChange={(event) => change('citizenName', event.target.value)} className={inputClass} />
            </Field>
            <Field label="NIC / national identity number" required>
              <input required maxLength={20} value={form.citizenNic} onChange={(event) => change('citizenNic', event.target.value)} className={inputClass} />
            </Field>
            <Field label="Contact number" required>
              <input required type="tel" maxLength={20} value={form.citizenPhone} onChange={(event) => change('citizenPhone', event.target.value)} className={inputClass} />
            </Field>
            <Field label="Email address">
              <input type="email" maxLength={160} value={form.citizenEmail} onChange={(event) => change('citizenEmail', event.target.value)} className={inputClass} />
            </Field>
            <Field label="Residential address" required wide>
              <textarea required rows={2} maxLength={500} value={form.citizenAddress} onChange={(event) => change('citizenAddress', event.target.value)} className={inputClass} />
            </Field>
          </FormSection>

          <FormSection title="Facility and event">
            <Field label="Public place / facility" required>
              <select required value={form.facilityName} onChange={(event) => change('facilityName', event.target.value as FacilityType | '')} className={inputClass}>
                <option value="">Select a facility</option>
                {facilities.map((facility) => <option key={facility} value={facility}>{facility}</option>)}
              </select>
            </Field>
            <Field label="Event / booking category" required>
              <input required maxLength={100} placeholder="e.g. Wedding, meeting, sports event" value={form.eventType} onChange={(event) => change('eventType', event.target.value)} className={inputClass} />
            </Field>
            <Field label="Event title" required wide>
              <input required maxLength={160} value={form.eventTitle} onChange={(event) => change('eventTitle', event.target.value)} className={inputClass} />
            </Field>
            <Field label="Expected attendees / users" required>
              <input required type="number" min="1" step="1" value={form.expectedAttendees} onChange={(event) => change('expectedAttendees', event.target.value)} className={inputClass} />
            </Field>
            <Field label="Assigned staff officer">
              <input maxLength={120} value={form.assignedOfficer} onChange={(event) => change('assignedOfficer', event.target.value)} className={inputClass} />
            </Field>
          </FormSection>

          <FormSection title="Date and time">
            <Field label="Booking date" required>
              <input required type="date" value={form.bookingDate} onChange={(event) => change('bookingDate', event.target.value)} className={inputClass} />
            </Field>
            <Field label="Start time" required>
              <input required type="time" value={form.startTime} onChange={(event) => change('startTime', event.target.value)} className={inputClass} />
            </Field>
            <Field label="End time" required>
              <input required type="time" value={form.endTime} onChange={(event) => change('endTime', event.target.value)} className={inputClass} />
            </Field>
          </FormSection>

          <FormSection title="Charges and payment">
            <Field label="Rental fee (Rs.)" required>
              <input required type="number" min="0" step="0.01" value={form.rentalFee} onChange={(event) => change('rentalFee', event.target.value)} className={inputClass} />
            </Field>
            <Field label="Refundable security deposit (Rs.)" required>
              <input required type="number" min="0" step="0.01" value={form.securityDeposit} onChange={(event) => change('securityDeposit', event.target.value)} className={inputClass} />
            </Field>
            <Field label="Payment plan" required>
              <select value={form.paymentPlan} onChange={(event) => change('paymentPlan', event.target.value as StaffBookingWorkflow['paymentPlan'])} className={inputClass}>
                <option value="ADVANCE">Advance payment</option>
                <option value="FULL">Full payment upfront</option>
              </select>
            </Field>
            <Field label={`Amount received (Rs.) · total ${totalCharge.toLocaleString()}`}>
              <input type="number" min="0" max={totalCharge} step="0.01" value={form.upfrontAmount} onChange={(event) => change('upfrontAmount', event.target.value)} className={inputClass} />
            </Field>
            <label className="flex items-center gap-2 self-end pb-2 text-xs font-medium text-gray-700">
              <input type="checkbox" checked={form.upfrontReceived} onChange={(event) => change('upfrontReceived', event.target.checked)} className="h-4 w-4 accent-[#A31736]" />
              Payment received and verified
            </label>
          </FormSection>

          <FormSection title="Requirements and supporting documents">
            <Field label="Special requirements / notes" wide>
              <textarea rows={3} maxLength={2000} placeholder="Setup, utilities, access, permits, or other arrangements" value={form.specialRequirements} onChange={(event) => change('specialRequirements', event.target.value)} className={inputClass} />
            </Field>
            <Field label="Supporting documents (optional)" wide>
              <label className="flex cursor-pointer flex-wrap items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-3 text-xs text-gray-600 hover:border-[#A31736]">
                <Upload className="h-4 w-4 text-[#A31736]" />
                <span>{files.length ? `${files.length} document(s) selected` : 'Choose NIC copy, application, permits, or payment receipt'}</span>
                <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={(event) => updateFiles(event.target.files)} className="sr-only" />
              </label>
              {files.length > 0 && (
                <ul className="mt-2 space-y-1 text-[11px] text-gray-500">
                  {files.map((file) => <li key={`${file.name}-${file.lastModified}`}>{file.name} · {Math.max(1, Math.round(file.size / 1024))} KB</li>)}
                </ul>
              )}
              <p className="mt-1 text-[10px] text-gray-400">Files are saved in this browser for this prototype (2 MB total per booking).</p>
            </Field>
          </FormSection>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
            <p className="text-[11px] text-gray-500">New manual bookings are recorded as pending until reviewed by an approving officer.</p>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#A31736] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#801028] disabled:cursor-wait disabled:opacity-60"
            >
              <FilePlus2 className="h-4 w-4" />
              {saving ? 'Saving booking...' : 'Save manual booking'}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-gray-900">My manual bookings</h2>
            <p className="mt-0.5 text-[11px] text-gray-500">Bookings entered manually by staff on this browser.</p>
          </div>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-600">{bookings.length}</span>
        </div>
        {bookings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-5 py-10 text-center text-xs text-gray-500">
            No manual bookings have been created yet.
          </div>
        ) : (
          bookings.map((booking) => (
            <article key={booking.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#A31736]">{booking.refId}</span>
                    <StatusPill status={booking.status} />
                    <PaymentPill workflow={workflows[booking.id]} />
                  </div>
                  <h3 className="mt-1 text-sm font-bold text-gray-900">{booking.eventTitle}</h3>
                  <p className="mt-1 text-xs text-gray-500">{booking.facilityName} · {booking.bookingDate} · {booking.timeSlot}</p>
                </div>
                <p className="text-[11px] text-gray-500">Entered {booking.submittedDate} by {booking.assignedOfficer || 'Staff Officer'}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-gray-100 pt-3 text-[11px] text-gray-600">
                <span>Applicant: <strong className="text-gray-800">{booking.citizenName}</strong></span>
                <span>Rental: <strong className="text-gray-800">Rs. {booking.rentalFee.toLocaleString()}</strong></span>
                <span>Deposit: <strong className="text-gray-800">Rs. {booking.securityDeposit.toLocaleString()}</strong></span>
                <span>{booking.attachments.length} supporting document(s)</span>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  )
}

const inputClass = 'mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 outline-none transition focus:border-[#A31736] focus:ring-1 focus:ring-[#A31736]'

const FormSection: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ title, children, icon }) => (
  <fieldset className="rounded-xl border border-gray-200 p-4">
    <legend className="px-1 text-xs font-bold uppercase tracking-wide text-gray-700">
      <span className="inline-flex items-center gap-1.5">{icon}{title}</span>
    </legend>
    <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
  </fieldset>
)

const Field: React.FC<{ label: string; required?: boolean; wide?: boolean; children: React.ReactNode }> = ({ label, required, wide, children }) => (
  <label className={`block text-[11px] font-semibold text-gray-600 ${wide ? 'sm:col-span-2 lg:col-span-3' : ''}`}>
    {label}{required && <span className="ml-0.5 text-rose-600">*</span>}
    {children}
  </label>
)

const StatusPill: React.FC<{ status: FacilityBooking['status'] }> = ({ status }) => (
  <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${
    status === 'PENDING' ? 'border-amber-200 bg-amber-50 text-amber-800' :
      status === 'APPROVED' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
        'border-gray-200 bg-gray-100 text-gray-700'
  }`}>{status}</span>
)

const PaymentPill: React.FC<{ workflow: StaffBookingWorkflow | undefined }> = ({ workflow }) => {
  const complete = workflow?.upfrontReceived && (workflow.paymentPlan === 'FULL' || workflow.balanceReceived)
  const label = complete ? 'Payment complete' : workflow?.upfrontReceived ? 'Balance due' : 'Payment pending'
  return <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${
    complete ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
      workflow?.upfrontReceived ? 'border-amber-200 bg-amber-50 text-amber-800' :
        'border-gray-200 bg-gray-100 text-gray-600'
  }`}>{label}</span>
}

export default MyBookingSection
