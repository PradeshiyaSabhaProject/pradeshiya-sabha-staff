import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBookingData } from '../hooks/useBookingData'
import type { FacilityBooking } from '../types'
import BookingDetailModal from '../components/BookingDetailModal'

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-[#801028]">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

function getStatusBadgeStyle(status: string): string {
  switch (status) {
    case 'APPROVED':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'PENDING':
      return 'bg-orange-100 text-orange-800 border-orange-300'
    default:
      return 'bg-indigo-100 text-indigo-800 border-indigo-300'
  }
}

const FacilitySchedulePage: React.FC = () => {
  const { loading, bookings, approveBooking, rejectBooking, addRemark } = useBookingData()
  const [selectedBooking, setSelectedBooking] = useState<FacilityBooking | null>(null)
  const [selectedFacility, setSelectedFacility] = useState<string>('')
  const navigate = useNavigate()

  const activeBookings = bookings
    .filter(b => b.status === 'APPROVED' || b.status === 'PENDING' || b.status === 'COMPLETED')
    .filter(b => !selectedFacility || b.facilityName === selectedFacility)
    .sort((a, b) => a.bookingDate.localeCompare(b.bookingDate))

  const handleView = (booking: FacilityBooking) => {
    setSelectedBooking(booking)
  }

  const handleCloseModal = () => {
    setSelectedBooking(null)
  }

  const handleApprove = (id: string, officerName: string = 'Staff Officer', remark?: string) => {
    const updated = approveBooking(id, officerName, remark)
    if (updated && selectedBooking?.id === id) {
      setSelectedBooking(updated)
    }
  }

  const handleReject = (id: string, officerName: string = 'Staff Officer', reason: string = 'Administrative review decision') => {
    const updated = rejectBooking(id, officerName, reason)
    if (updated && selectedBooking?.id === id) {
      setSelectedBooking(updated)
    }
  }

  const handleAddRemark = (id: string, officerName: string, text: string) => {
    const updated = addRemark(id, officerName, text)
    if (updated && selectedBooking?.id === id) {
      setSelectedBooking(updated)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <CalendarIcon />
              <span>Municipal Facility Schedule & Availability</span>
            </h1>
            <span className="bg-[#801028]/10 text-[#801028] text-xs font-bold px-3 py-1 rounded-full border border-[#801028]/20 uppercase tracking-wider">
              Council Timeline
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Visual roster of upcoming events, public ceremonies, and reserved slots across council venues
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/bookings/all')}
          className="flex items-center gap-2 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors uppercase tracking-wider cursor-pointer self-start sm:self-auto"
        >
          <span>← Back to All Bookings</span>
        </button>
      </div>

      {/* Filter by facility */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm font-bold text-gray-700">
          Filter Timeline by Facility:
        </div>
        <select
          value={selectedFacility}
          onChange={(e) => setSelectedFacility(e.target.value)}
          className="w-full sm:w-80 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none cursor-pointer"
        >
          <option value="">All Municipal Facilities (Combined Schedule)</option>
          <option value="Pradeshiya Sabha Town Hall">Pradeshiya Sabha Town Hall</option>
          <option value="Mattegoda Community Center">Mattegoda Community Center</option>
          <option value="Kottawa Public Ground & Pavilion">Kottawa Public Ground & Pavilion</option>
          <option value="Homagama Indoor Sports Complex">Homagama Indoor Sports Complex</option>
          <option value="Public Crematorium & Chapel">Public Crematorium & Chapel</option>
          <option value="Mobile Stage & Sound Equipment">Mobile Stage & Sound Equipment</option>
        </select>
      </div>

      {loading ? (
        <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
      ) : activeBookings.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400 font-semibold">
          No scheduled reservations found for the selected facility view.
        </div>
      ) : (
        <div className="space-y-4">
          {activeBookings.map((booking) => (
            <div
              key={booking.id}
              onClick={() => handleView(booking)}
              className="bg-white border border-gray-200 hover:border-[#801028] rounded-xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="bg-gray-100 border border-gray-200 rounded-xl p-3 text-center min-w-[85px] shrink-0">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Date</span>
                  <span className="text-sm font-black text-[#801028] block mt-0.5">{booking.bookingDate}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                      {booking.facilityName}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider border ${getStatusBadgeStyle(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-gray-900 mt-1.5 leading-snug">
                    {booking.eventTitle}
                  </h3>
                  <div className="text-xs text-gray-500 font-medium mt-1 flex flex-wrap items-center gap-2 sm:gap-4">
                    <span>⏰ {booking.timeSlot}</span>
                    <span>👤 {booking.citizenName}</span>
                    <span>👥 ~{booking.expectedAttendees} attendees</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-gray-100">
                <div className="text-right hidden md:block">
                  <span className="text-[11px] font-bold text-gray-400 uppercase block">Ref ID</span>
                  <span className="text-xs font-extrabold text-[#801028] font-mono">{booking.refId}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleView(booking) }}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-50 hover:bg-[#801028] text-gray-700 hover:text-white border border-gray-200 hover:border-[#801028] rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Dossier & Actions →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dossier Review Modal */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={handleCloseModal}
          onApprove={handleApprove}
          onReject={handleReject}
          onAddRemark={handleAddRemark}
        />
      )}
    </div>
  )
}

export default FacilitySchedulePage
