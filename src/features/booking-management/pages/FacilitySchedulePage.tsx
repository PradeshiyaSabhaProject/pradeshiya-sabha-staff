import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBookingData } from '../hooks/useBookingData'
import type { FacilityBooking } from '../types'
import BookingDetailModal from '../components/BookingDetailModal'

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            Facility Schedule &amp; Availability
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Visual roster of upcoming events, public ceremonies, and reserved slots across council venues.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/bookings/all')}
          className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold px-3.5 py-1.5 rounded shadow-xs transition-colors uppercase tracking-wider cursor-pointer self-start md:self-auto"
        >
          <span>All Bookings</span>
        </button>
      </div>

      {/* Filter by facility */}
      <div className="bg-white border border-gray-300 rounded p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm bg-gray-50/30">
        <div className="text-xs font-bold uppercase tracking-wider text-gray-700">
          Filter Timeline by Facility:
        </div>
        <select
          value={selectedFacility}
          onChange={(e) => setSelectedFacility(e.target.value)}
          className="w-full sm:w-80 bg-white border border-gray-300 rounded px-3 py-1.5 text-xs font-medium text-gray-700 outline-none cursor-pointer focus:border-[#A31736]"
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
        <div className="h-96 bg-gray-100 rounded animate-pulse border border-gray-200" />
      ) : activeBookings.length === 0 ? (
        <div className="bg-white border border-gray-300 rounded p-12 text-center text-gray-400 font-semibold text-xs shadow-sm">
          No scheduled reservations found for the selected facility view.
        </div>
      ) : (
        <div className="space-y-3">
          {activeBookings.map((booking) => (
            <button
              type="button"
              key={booking.id}
              onClick={() => handleView(booking)}
              className="w-full text-left font-normal bg-white border border-gray-300 hover:border-[#A31736] rounded p-4 shadow-sm hover:shadow transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <span className="flex items-start gap-4">
                <span className="bg-gray-100 border border-gray-200 rounded p-2.5 text-center min-w-[80px] shrink-0 block">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Date</span>
                  <span className="text-xs font-bold text-[#A31736] block mt-0.5">{booking.bookingDate}</span>
                </span>
                <span className="block">
                  <span className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                      {booking.facilityName}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${getStatusBadgeStyle(booking.status)}`}>
                      {booking.status}
                    </span>
                  </span>
                  <span className="block text-sm font-bold text-gray-900 mt-1 leading-snug">
                    {booking.eventTitle}
                  </span>
                  <span className="text-xs text-gray-500 font-medium mt-1 flex flex-wrap items-center gap-2 sm:gap-4">
                    <span>⏰ {booking.timeSlot}</span>
                    <span>👤 {booking.citizenName}</span>
                    <span>👥 ~{booking.expectedAttendees} attendees</span>
                  </span>
                </span>
              </span>

              <span className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-gray-100">
                <span className="text-right hidden md:block">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Ref ID</span>
                  <span className="text-xs font-bold text-[#A31736] font-mono">{booking.refId}</span>
                </span>
                <span className="w-full sm:w-auto px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-300 rounded text-xs font-bold text-center uppercase tracking-wider block hover:bg-gray-100 transition-colors">
                  Dossier & Actions →
                </span>
              </span>
            </button>
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
