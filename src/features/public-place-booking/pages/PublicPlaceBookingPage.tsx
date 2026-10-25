import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  Landmark,
  RotateCcw,
  ShieldCheck,
  Wrench,
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { useStaffBookingWorkflow } from '../hooks/useStaffBookingWorkflow'
import type { StaffBookingWorkflow } from '../types'
import type { FacilityBooking } from '../../booking-management/types'

const sections = [
  { id: 'dashboard', label: 'Staff Booking Dashboard', description: 'Booking officer overview and live payment flags', icon: <Landmark className="h-4 w-4" /> },
  { id: 'payments', label: 'Payment & Billing', description: 'Verify advance or full payment and outstanding balances', icon: <Banknote className="h-4 w-4" /> },
  { id: 'readiness', label: 'Venue Preparation', description: 'Superintendent readiness checklist for grounds, setup and utilities', icon: <Wrench className="h-4 w-4" /> },
  { id: 'handover', label: 'Permit & Venue Handover', description: 'Verify permit, hand over the venue and record its return', icon: <FileCheck2 className="h-4 w-4" /> },
  { id: 'settlement', label: 'Final Reconciliation', description: 'Collect remaining balance and refund or retain the security deposit', icon: <RotateCcw className="h-4 w-4" /> },
] as const

type SectionId = (typeof sections)[number]['id']
type ReadinessField = 'groundsReady' | 'setupReady' | 'utilitiesReady'

const formatCurrency = (value: number) => `Rs. ${value.toLocaleString()}`
const isOperational = (booking: FacilityBooking) => booking.status !== 'REJECTED' && booking.status !== 'CANCELLED'
const isApproved = (workflow: StaffBookingWorkflow) => workflow.status === 'APPROVED' || workflow.status === 'COMPLETED'

const PublicPlaceBookingPage: React.FC = () => {
  const { section: sectionParam = 'dashboard' } = useParams()
  const section: SectionId = sections.some((item) => item.id === sectionParam)
    ? sectionParam as SectionId
    : 'dashboard'
  const currentSection = sections.find((item) => item.id === section)!
  const { user } = useAuth()
  const { bookings, workflows, loading, error, updateWorkflow } = useStaffBookingWorkflow()
  const [amountDrafts, setAmountDrafts] = useState<Record<string, string>>({})

  if (!['admin', 'staff', 'manager', 'superadmin'].includes(user?.role ?? '')) {
    return (
      <div className="mx-auto mt-12 max-w-xl rounded-lg border border-rose-200 bg-white p-8 text-center shadow-sm">
        <ShieldCheck className="mx-auto h-10 w-10 text-[#A31736]" />
        <h1 className="mt-3 text-lg font-bold text-gray-900">Staff access required</h1>
        <p className="mt-2 text-sm text-gray-600">Public Place Booking operations are available to council staff only.</p>
        <Link to="/overview" className="mt-5 inline-flex rounded bg-[#A31736] px-4 py-2 text-sm font-semibold text-white">
          Return to overview
        </Link>
      </div>
    )
  }

  const activeBookings = bookings
    .filter(isOperational)
    .sort((a, b) => a.bookingDate.localeCompare(b.bookingDate))
  const approvedBookings = activeBookings.filter((booking) => {
    const workflow = workflows[booking.id]
    return workflow && isApproved(workflow)
  })

  const update = (bookingId: string, changes: Partial<StaffBookingWorkflow>) =>
    updateWorkflow(bookingId, changes)

  const renderBookingHeading = (booking: FacilityBooking, workflow: StaffBookingWorkflow) => {
    const paymentComplete = workflow.upfrontReceived && (workflow.paymentPlan === 'FULL' || workflow.balanceReceived)
    return (
      <div className="flex flex-col gap-3 border-b border-gray-100 pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#A31736]">{booking.refId}</span>
            <Pill tone={workflow.status === 'APPROVED' || workflow.status === 'COMPLETED' ? 'green' : workflow.status === 'PENDING' ? 'amber' : 'gray'}>
              {workflow.status}
            </Pill>
            <Pill tone={paymentComplete ? 'green' : workflow.upfrontReceived ? 'amber' : 'gray'}>
              {paymentComplete ? 'Payment complete' : workflow.upfrontReceived ? 'Balance due' : 'Payment pending'}
            </Pill>
          </div>
          <h2 className="mt-1 text-sm font-bold text-gray-900">{booking.eventTitle}</h2>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-gray-500">
            <span>{booking.facilityName}</span>
            <span className="text-gray-300">•</span>
            <span>{booking.bookingDate}</span>
            <span className="text-gray-300">•</span>
            <span>{booking.timeSlot}</span>
          </p>
        </div>
        <div className="shrink-0 sm:text-right">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Assigned staff officer</p>
          <p className="mt-1 text-xs font-semibold text-gray-700">{booking.assignedOfficer || 'Awaiting assignment'}</p>
        </div>
      </div>
    )
  }

  const renderDashboard = () => {
    const pendingPayments = activeBookings.filter((booking) => {
      const workflow = workflows[booking.id]
      return workflow && (!workflow.upfrontReceived || (workflow.paymentPlan === 'ADVANCE' && !workflow.balanceReceived))
    }).length
    const preparationQueue = approvedBookings.filter((booking) => !workflows[booking.id]?.venueReturned).length

    return (
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Active bookings" value={activeBookings.length} icon={<CalendarDays className="h-5 w-5" />} />
          <SummaryCard label="Awaiting staff approval" value={activeBookings.filter((booking) => workflows[booking.id]?.status === 'PENDING').length} icon={<ClipboardCheck className="h-5 w-5" />} />
          <SummaryCard label="Payment follow-up" value={pendingPayments} icon={<Banknote className="h-5 w-5" />} />
          <SummaryCard label="Venue operations" value={preparationQueue} icon={<Wrench className="h-5 w-5" />} />
        </div>

        <div className="rounded-lg border border-[#e7c6ce] bg-[#fffafb] p-4">
          <h2 className="text-sm font-bold text-gray-900">Booking Officer Dashboard</h2>
          <p className="mt-1 text-xs leading-relaxed text-gray-600">
            Monitor booking references and payment ledger status, then coordinate the venue superintendent's preparation, permit verification, handover and post-event settlement. This module is for staff operations only.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-gray-900">Booking register &amp; system payment status</h2>
            <span className="text-[11px] text-gray-500">{activeBookings.length} active records</span>
          </div>
          {activeBookings.map((booking) => {
            const workflow = workflows[booking.id]
            if (!workflow) return null
            return (
              <article key={booking.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                {renderBookingHeading(booking, workflow)}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-gray-600">
                    Rental: <strong>{formatCurrency(booking.rentalFee)}</strong>
                    <span className="mx-2 text-gray-300">|</span>
                    Deposit: <strong>{formatCurrency(booking.securityDeposit)}</strong>
                    <span className="mx-2 text-gray-300">|</span>
                    Plan: <strong>{workflow.paymentPlan === 'FULL' ? 'Full payment' : 'Advance payment'}</strong>
                  </div>
                  {workflow.status === 'PENDING' && (
                    <Link to="/bookings/approvals" className="inline-flex items-center gap-1 text-xs font-bold text-[#A31736] hover:underline">
                      Open approval queue <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
                <WorkflowProgress workflow={workflow} />
              </article>
            )
          })}
        </div>
      </div>
    )
  }

  const renderPayments = () => (
    <div className="space-y-3">
      {activeBookings.map((booking) => {
        const workflow = workflows[booking.id]
        if (!workflow) return null
        const total = booking.rentalFee + booking.securityDeposit
        const amount = Number(amountDrafts[booking.id] ?? workflow.upfrontAmount)
        const paymentComplete = workflow.upfrontReceived && (workflow.paymentPlan === 'FULL' || workflow.balanceReceived)
        const amountValid = Number.isFinite(amount) && amount > 0 &&
          (workflow.paymentPlan === 'FULL' ? amount >= total : amount < total)

        return (
          <article key={booking.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            {renderBookingHeading(booking, workflow)}
            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
              <div className="grid grid-cols-2 gap-2">
                <AmountCard label="Rental charge" amount={booking.rentalFee} />
                <AmountCard label="Refundable security deposit" amount={booking.securityDeposit} />
                <div className="col-span-2">
                  <AmountCard label="Total booking charge" amount={total} emphasis />
                </div>
              </div>
              <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-gray-800">Payment ledger</h3>
                  <Pill tone={paymentComplete ? 'green' : workflow.upfrontReceived ? 'amber' : 'gray'}>
                    {paymentComplete ? 'Full amount received' : workflow.upfrontReceived ? 'Advance received · balance pending' : 'Awaiting payment'}
                  </Pill>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="text-[11px] font-semibold text-gray-600">
                    Payment option
                    <select
                      value={workflow.paymentPlan}
                      disabled={workflow.upfrontReceived}
                      onChange={(event) => {
                        const paymentPlan = event.target.value as 'ADVANCE' | 'FULL'
                        setAmountDrafts((current) => ({ ...current, [booking.id]: String(paymentPlan === 'FULL' ? total : booking.securityDeposit || Math.max(total - 1, 1)) }))
                        update(booking.id, { paymentPlan })
                      }}
                      className="mt-1 block w-full rounded border border-gray-300 bg-white px-2.5 py-2 text-xs text-gray-800 disabled:bg-gray-100"
                    >
                      <option value="ADVANCE">Advance payment</option>
                      <option value="FULL">Full payment upfront</option>
                    </select>
                  </label>
                  <label className="text-[11px] font-semibold text-gray-600">
                    {workflow.paymentPlan === 'FULL' ? 'Full amount to verify' : 'Advance amount to verify'}
                    <input
                      type="number"
                      min="1"
                      max={workflow.paymentPlan === 'ADVANCE' ? total - 1 : undefined}
                      step="1"
                      value={amountDrafts[booking.id] ?? workflow.upfrontAmount}
                      disabled={workflow.upfrontReceived}
                      onChange={(event) => setAmountDrafts((current) => ({ ...current, [booking.id]: event.target.value }))}
                      className="mt-1 block w-full rounded border border-gray-300 bg-white px-2.5 py-2 text-xs text-gray-800 disabled:bg-gray-100"
                    />
                  </label>
                </div>
                {workflow.upfrontReceived ? (
                  <p className="mt-3 text-xs text-emerald-800">
                    Upfront payment of <strong>{formatCurrency(workflow.upfrontAmount)}</strong> verified by staff.
                    {workflow.paymentPlan === 'ADVANCE' && !workflow.balanceReceived && ` Balance due: ${formatCurrency(Math.max(total - workflow.upfrontAmount, 0))}.`}
                  </p>
                ) : (
                  <button
                    type="button"
                    disabled={!amountValid}
                    onClick={() => update(booking.id, {
                      upfrontAmount: amount,
                      upfrontReceived: true,
                      balanceReceived: workflow.paymentPlan === 'FULL',
                    })}
                    className="mt-3 rounded bg-[#A31736] px-3 py-2 text-[11px] font-bold text-white hover:bg-[#801028] disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    Verify &amp; record payment
                  </button>
                )}
                {!amountValid && !workflow.upfrontReceived && (
                  <p className="mt-2 text-[10px] text-rose-700">
                    {workflow.paymentPlan === 'FULL' ? 'Full payment must cover the total booking charge.' : 'Advance must be greater than zero and less than the total charge.'}
                  </p>
                )}
                {workflow.paymentPlan === 'ADVANCE' && workflow.upfrontReceived && !workflow.balanceReceived && (
                  <p className="mt-2 text-[10px] text-gray-500">Record the remaining balance from Final Reconciliation after venue return.</p>
                )}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )

  const renderReadiness = () => {
    const checklist: { field: ReadinessField; label: string; description: string }[] = [
      { field: 'groundsReady', label: 'Grounds / hall inspected', description: 'Site is clean, safe and available for the booked use.' },
      { field: 'setupReady', label: 'Venue setup complete', description: 'Requested arrangement and council equipment are ready.' },
      { field: 'utilitiesReady', label: 'Utilities and access checked', description: 'Power, water, sanitation and venue access are ready.' },
    ]
    const eligible = approvedBookings.filter((booking) => workflows[booking.id]?.status === 'APPROVED')
    return (
      <div className="space-y-3">
        {eligible.map((booking) => {
          const workflow = workflows[booking.id]!
          const ready = workflow.groundsReady && workflow.setupReady && workflow.utilitiesReady
          return (
            <article key={booking.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              {renderBookingHeading(booking, workflow)}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-gray-600">Venue Superintendent readiness checklist</p>
                <Pill tone={ready ? 'green' : 'amber'}>{ready ? 'Venue fully prepared' : 'Preparation in progress'}</Pill>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                {checklist.map((item) => (
                  <label key={item.field} className={`flex cursor-pointer items-start gap-2 rounded-md border p-3 ${workflow[item.field] ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 bg-gray-50'}`}>
                    <input
                      type="checkbox"
                      checked={workflow[item.field]}
                      onChange={() => update(booking.id, { [item.field]: !workflow[item.field] })}
                      className="mt-0.5 accent-[#A31736]"
                    />
                    <span>
                      <span className="block text-xs font-bold text-gray-800">{item.label}</span>
                      <span className="mt-1 block text-[10px] leading-relaxed text-gray-500">{item.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </article>
          )
        })}
        {eligible.length === 0 && <EmptyMessage>There are no approved bookings waiting for venue preparation.</EmptyMessage>}
      </div>
    )
  }

  const renderHandover = () => (
    <div className="space-y-3">
      {approvedBookings.map((booking) => {
        const workflow = workflows[booking.id]!
        const ready = workflow.groundsReady && workflow.setupReady && workflow.utilitiesReady
        const upfrontReceived = workflow.upfrontReceived
        return (
          <article key={booking.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            {renderBookingHeading(booking, workflow)}
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <ActionCard
                title="Permit verification"
                helper="Booking officer checks venue permit and required safety documents."
                complete={workflow.permitVerified}
                actionLabel="Confirm permit verified"
                disabled={workflow.permitVerified || !upfrontReceived}
                onClick={() => update(booking.id, { permitVerified: true })}
                icon={<ShieldCheck className="h-4 w-4" />}
                blockedText={!upfrontReceived ? 'Verify the initial payment before proceeding.' : undefined}
              />
              <ActionCard
                title="Venue handover"
                helper="Record handover only after payment, readiness and permit checks."
                complete={workflow.venueHandedOver}
                actionLabel="Record venue handover"
                disabled={workflow.venueHandedOver || !upfrontReceived || !ready || !workflow.permitVerified}
                onClick={() => update(booking.id, { venueHandedOver: true })}
                icon={<ClipboardCheck className="h-4 w-4" />}
                blockedText={!upfrontReceived ? 'Verify initial payment first.' : !ready ? 'Complete the superintendent readiness checklist first.' : !workflow.permitVerified ? 'Verify the permit first.' : undefined}
              />
              <ActionCard
                title="Venue return inspection"
                helper="Record the superintendent's post-event inspection and venue return."
                complete={workflow.venueReturned}
                actionLabel="Record venue returned"
                disabled={!workflow.venueHandedOver || workflow.venueReturned}
                onClick={() => update(booking.id, { venueReturned: true, status: 'COMPLETED' })}
                icon={<RotateCcw className="h-4 w-4" />}
                blockedText={!workflow.venueHandedOver ? 'Record venue handover before return.' : undefined}
              />
            </div>
          </article>
        )
      })}
      {approvedBookings.length === 0 && <EmptyMessage>No approved bookings are available for permit or handover processing.</EmptyMessage>}
    </div>
  )

  const renderSettlement = () => (
    <div className="space-y-3">
      {approvedBookings.map((booking) => {
        const workflow = workflows[booking.id]!
        const total = booking.rentalFee + booking.securityDeposit
        const amountOutstanding = Math.max(total - workflow.upfrontAmount, 0)
        const balanceCanBeRecorded = workflow.paymentPlan === 'ADVANCE' && workflow.upfrontReceived && !workflow.balanceReceived && workflow.venueReturned
        const depositResolved = booking.securityDeposit === 0 || workflow.depositOutcome !== null
        const canClose = workflow.venueReturned && workflow.balanceReceived && depositResolved

        return (
          <article key={booking.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            {renderBookingHeading(booking, workflow)}
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <AmountCard
                label="Remaining balance"
                amount={workflow.balanceReceived || workflow.paymentPlan === 'FULL' ? 0 : amountOutstanding}
                note={workflow.balanceReceived || workflow.paymentPlan === 'FULL' ? 'Paid' : 'Collect after venue return'}
              />
              <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Security deposit</p>
                <p className="mt-1 text-sm font-bold text-gray-900">{formatCurrency(booking.securityDeposit)}</p>
                <p className="mt-1 text-[10px] text-gray-500">{workflow.depositOutcome ?? (booking.securityDeposit === 0 ? 'Not required' : 'Awaiting inspection')}</p>
              </div>
              <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Reconciliation</p>
                <p className="mt-1 text-sm font-bold text-gray-900">{workflow.settlementClosed ? 'Closed' : 'Open'}</p>
                <p className="mt-1 text-[10px] text-gray-500">{workflow.venueReturned ? 'Venue return recorded' : 'Awaiting venue return'}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {balanceCanBeRecorded && (
                <button
                  type="button"
                  onClick={() => update(booking.id, { balanceReceived: true })}
                  className="rounded bg-[#A31736] px-3 py-2 text-[11px] font-bold text-white hover:bg-[#801028]"
                >
                  Confirm balance received · {formatCurrency(amountOutstanding)}
                </button>
              )}
              {booking.securityDeposit > 0 && !workflow.depositOutcome && workflow.venueReturned && (
                <>
                  <button
                    type="button"
                    onClick={() => update(booking.id, { depositOutcome: 'REFUNDED' })}
                    className="rounded border border-emerald-300 bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100"
                  >
                    Record deposit refund
                  </button>
                  <button
                    type="button"
                    onClick={() => update(booking.id, { depositOutcome: 'RETAINED' })}
                    className="rounded border border-gray-300 bg-white px-3 py-2 text-[11px] font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Record deposit retained
                  </button>
                </>
              )}
              {!workflow.settlementClosed && (
                <button
                  type="button"
                  disabled={!canClose}
                  onClick={() => update(booking.id, { settlementClosed: true })}
                  className="rounded border border-[#A31736] px-3 py-2 text-[11px] font-bold text-[#A31736] hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400"
                >
                  Close final reconciliation
                </button>
              )}
            </div>
            {!canClose && !workflow.settlementClosed && (
              <p className="mt-2 text-[10px] text-gray-500">
                Reconciliation requires the venue return, remaining balance (if any), and deposit disposition after inspection.
              </p>
            )}
          </article>
        )
      })}
      {approvedBookings.length === 0 && <EmptyMessage>No approved bookings are available for end-of-event reconciliation.</EmptyMessage>}
    </div>
  )

  const sectionContent: Record<SectionId, React.ReactNode> = {
    dashboard: renderDashboard(),
    payments: renderPayments(),
    readiness: renderReadiness(),
    handover: renderHandover(),
    settlement: renderSettlement(),
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-8">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#A31736]">Staff Operations · Public Place Booking</p>
        <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">{currentSection.label}</h1>
            <p className="mt-1 text-xs text-gray-500">{currentSection.description} · Staff side only</p>
          </div>
          <Link to="/bookings/approvals" className="inline-flex items-center gap-1 self-start text-xs font-bold text-[#A31736] hover:underline sm:self-auto">
            Existing approval queue <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <nav aria-label="Public Place Booking staff workflow" className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        {sections.map((item, index) => (
          <Link
            key={item.id}
            to={`/public-place-booking/${item.id}`}
            aria-current={section === item.id ? 'step' : undefined}
            className={`flex items-center gap-2.5 rounded-lg border p-3 transition-colors ${
              section === item.id ? 'border-[#A31736] bg-rose-50 text-[#801028]' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${section === item.id ? 'bg-[#A31736] text-white' : 'bg-gray-100 text-gray-500'}`}>
              {item.icon}
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-bold">{index + 1}. {item.label}</span>
              <span className="mt-0.5 block truncate text-[10px] text-gray-500">{item.description}</span>
            </span>
          </Link>
        ))}
      </nav>

      <div className="flex items-start gap-2 rounded-md border border-sky-200 bg-sky-50 p-3 text-[11px] leading-relaxed text-sky-900">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>Staff workflow actions are saved in this browser for this prototype. Citizen application, availability search and payment-gateway screens are intentionally not part of this feature.</p>
      </div>
      {error && (
        <div role="alert" className="rounded-md border border-rose-300 bg-rose-50 p-3 text-xs font-medium text-rose-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => <div key={item} className="h-32 animate-pulse rounded-lg border border-gray-200 bg-white" />)}
        </div>
      ) : activeBookings.length === 0 ? (
        <EmptyMessage>No active bookings are available in the staff work queue.</EmptyMessage>
      ) : sectionContent[section]}
    </div>
  )
}

const Pill: React.FC<{ children: React.ReactNode; tone?: 'green' | 'amber' | 'gray' }> = ({ children, tone = 'gray' }) => {
  const colors = {
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-800',
    gray: 'border-gray-200 bg-gray-100 text-gray-700',
  }
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${colors[tone]}`}>{children}</span>
}

const SummaryCard: React.FC<{ label: string; value: number; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
    <span className="rounded-lg bg-rose-50 p-2.5 text-[#A31736]">{icon}</span>
    <div>
      <p className="text-2xl font-bold leading-none text-gray-900">{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">{label}</p>
    </div>
  </div>
)

const AmountCard: React.FC<{ label: string; amount: number; emphasis?: boolean; note?: string }> = ({ label, amount, emphasis, note }) => (
  <div className={`rounded-md border p-3 ${emphasis ? 'border-rose-200 bg-rose-50' : 'border-gray-200 bg-gray-50'}`}>
    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">{label}</p>
    <p className={`mt-1 text-sm font-bold ${emphasis ? 'text-[#A31736]' : 'text-gray-900'}`}>{formatCurrency(amount)}</p>
    {note && <p className="mt-1 text-[10px] text-gray-500">{note}</p>}
  </div>
)

const ActionCard: React.FC<{
  title: string
  helper: string
  complete: boolean
  actionLabel: string
  disabled: boolean
  onClick: () => void
  icon: React.ReactNode
  blockedText?: string
}> = ({ title, helper, complete, actionLabel, disabled, onClick, icon, blockedText }) => (
  <div className="flex min-h-36 flex-col rounded-md border border-gray-200 bg-gray-50 p-3">
    <div className="flex items-center justify-between gap-2">
      <h3 className="text-xs font-bold text-gray-800">{title}</h3>
      {complete && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />}
    </div>
    <p className="mt-2 text-[10px] leading-relaxed text-gray-500">{helper}</p>
    {blockedText && !complete && <p className="mt-2 text-[10px] text-amber-800">{blockedText}</p>}
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="mt-auto inline-flex items-center gap-1.5 pt-3 text-[11px] font-bold text-[#A31736] hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
    >
      {complete ? <Check className="h-4 w-4" /> : icon}
      {complete ? 'Completed' : actionLabel}
    </button>
  </div>
)

const WorkflowProgress: React.FC<{ workflow: StaffBookingWorkflow }> = ({ workflow }) => {
  const steps = [
    { label: 'Payment', done: workflow.upfrontReceived },
    { label: 'Venue ready', done: workflow.groundsReady && workflow.setupReady && workflow.utilitiesReady },
    { label: 'Permit', done: workflow.permitVerified },
    { label: 'Handover', done: workflow.venueHandedOver },
    { label: 'Settlement', done: workflow.settlementClosed },
  ]
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {steps.map((step) => (
        <span key={step.label} className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-semibold ${step.done ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
          {step.done && <Check className="h-3 w-3" />}
          {step.label}
        </span>
      ))}
    </div>
  )
}

const EmptyMessage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="rounded-lg border border-dashed border-gray-300 bg-white px-5 py-12 text-center">
    <ClipboardCheck className="mx-auto h-8 w-8 text-gray-300" />
    <p className="mt-3 text-sm font-semibold text-gray-700">{children}</p>
  </div>
)

export default PublicPlaceBookingPage
