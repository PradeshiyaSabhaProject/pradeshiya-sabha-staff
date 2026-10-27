import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookingSourceBadge } from './components/BookingStatusBadge'
import { TechnicalReviewModal } from './components/TechnicalReviewModal'
import { SERVICE_CONFIG, type BookingRecord } from './data/initialBookingData'
import { useBookingData } from './hooks/useBookingData'
import { formatLKR, formatTimestamp } from './utils/bookingUtils'

/** Booking-based queue and audit history for Technical Officer decisions. */
export const FleetTechnicalReviewsPage: React.FC = () => {
  const { bookings, approveBooking, rejectBooking, bookingStats } = useBookingData()
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)

  const pendingBookings = bookings
    .filter((booking) => booking.status === 'Pending TO Review')
    .sort((first, second) =>
      Date.parse(second.timeline[0]?.at ?? '') - Date.parse(first.timeline[0]?.at ?? '')
    )
  const bookingDecisions = bookings
    .map((booking) => ({
      booking,
      decision: [...booking.timeline].reverse().find((entry) =>
        entry.event === 'Booking Approved' || entry.event === 'Booking Rejected'
      ),
    }))
    .filter((item) => item.decision)
    .sort((first, second) =>
      Date.parse(second.decision?.at ?? '') - Date.parse(first.decision?.at ?? '')
    )
  const approvedCount = bookingDecisions.filter(
    ({ decision }) => decision?.event === 'Booking Approved'
  ).length
  const rejectedCount = bookingDecisions.filter(
    ({ decision }) => decision?.event === 'Booking Rejected'
  ).length
  const selectedBooking: BookingRecord | null = selectedBookingId
    ? pendingBookings.find((booking) => booking.id === selectedBookingId) ?? null
    : null

  // TODO: enforce role-based access once fleet-specific roles are added to AuthContext.

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            BOOKING TECHNICAL REVIEW
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 max-w-2xl">
            Technical Officer review of Gully Bowser and Water Bowser booking requests before payment is requested.
          </p>
        </div>
        <div className="text-xs font-bold uppercase tracking-wider text-gray-600">
          Responsible role: <span className="text-[#A31736]">Technical Officer</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3">
        <Link
          to="/fleet/overview"
          className="px-4 py-2 rounded bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold text-xs uppercase tracking-wider transition-all"
        >
          Dashboard
        </Link>
        <Link
          to="/fleet/bookings"
          className="px-4 py-2 rounded bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold text-xs uppercase tracking-wider transition-all"
        >
          Fleet Booking
        </Link>
        <Link
          to="/fleet/approvals"
          className="px-4 py-2 rounded bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold text-xs uppercase tracking-wider transition-all"
        >
          Authorizations Desk
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded border border-amber-200 shadow-sm">
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
            Pending Review
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-700">{bookingStats.pendingToReview}</span>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded border border-emerald-200 shadow-sm">
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
            Approved
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">{approvedCount}</span>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded border border-red-200 shadow-sm">
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
            Rejected
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#A31736]">{rejectedCount}</span>
        </div>
      </div>

      <section className="bg-white rounded border border-gray-300 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Pending reviews</h2>
        </div>
        {pendingBookings.length === 0 ? (
          <p className="text-center py-10 text-gray-400 text-xs font-semibold">
            No bookings are awaiting Technical Officer review.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1150px]">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200 text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Scheduled</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Distance / Loads</th>
                  <th className="py-3 px-4">Estimated fee</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {pendingBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-rose-50/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#A31736]">{booking.referenceNumber}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{SERVICE_CONFIG[booking.serviceType].label}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-900">{booking.applicant.name}</span>
                      <span className="block text-[10px] text-gray-500">{booking.applicant.phone}</span>
                    </td>
                    <td className="py-3 px-4"><BookingSourceBadge source={booking.source} /></td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-medium text-gray-800">{booking.scheduledDate}</span>
                      <span className="block text-[10px] text-gray-500">{booking.scheduledTime}</span>
                    </td>
                    <td className="py-3 px-4 max-w-[180px]">
                      <span className="block truncate text-gray-700" title={booking.location.label}>{booking.location.label}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-gray-700">
                      {booking.estimatedFee.distanceKm.toFixed(1)} km / {booking.estimatedFee.loads} load(s)
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-bold text-gray-900">
                      {formatLKR(booking.estimatedFee.totalLKR)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-gray-600">
                      {booking.timeline[0]?.at ? formatTimestamp(booking.timeline[0].at) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedBookingId(booking.id)}
                        className="px-3 py-1.5 rounded bg-[#A31736] hover:bg-[#801028] text-white text-[11px] font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-white rounded border border-gray-300 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Decision history</h2>
        </div>
        {bookingDecisions.length === 0 ? (
          <p className="text-center py-10 text-gray-400 text-xs font-semibold">
            No Technical Officer decisions have been recorded.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200 text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Decision</th>
                  <th className="py-3 px-4">Decided by</th>
                  <th className="py-3 px-4">Decided at</th>
                  <th className="py-3 px-4">Remarks / rejection reason</th>
                  <th className="py-3 px-4">Final fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {bookingDecisions.map(({ booking, decision }) => {
                  const isApproved = decision?.event === 'Booking Approved'
                  return (
                    <tr key={booking.id}>
                      <td className="py-3 px-4 font-mono font-bold text-[#A31736]">{booking.referenceNumber}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{SERVICE_CONFIG[booking.serviceType].label}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase ${
                          isApproved
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {isApproved ? 'Approved' : 'Rejected'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{decision?.actor ?? '—'}</td>
                      <td className="py-3 px-4 whitespace-nowrap text-gray-600">
                        {decision?.at ? formatTimestamp(decision.at) : '—'}
                      </td>
                      <td className="py-3 px-4 max-w-sm text-gray-600">
                        <span className="block truncate" title={booking.rejectionReason ?? decision?.note ?? ''}>
                          {booking.rejectionReason ?? decision?.note ?? '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-bold text-gray-900">
                        {isApproved ? formatLKR(booking.estimatedFee.totalLKR) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <TechnicalReviewModal
        isOpen={Boolean(selectedBooking)}
        onClose={() => setSelectedBookingId(null)}
        booking={selectedBooking}
        onApprove={approveBooking}
        onReject={rejectBooking}
      />
    </div>
  )
}
