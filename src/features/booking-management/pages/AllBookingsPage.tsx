import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBookingData } from '../hooks/useBookingData'
import type { FacilityBooking } from '../types'
import BookingStats from '../components/BookingStats'
import FacilityCards from '../components/FacilityCards'
import BookingTable from '../components/BookingTable'
import BookingDetailModal from '../components/BookingDetailModal'

const AllBookingsPage: React.FC = () => {
  const { loading, bookings, stats, approveBooking, rejectBooking, addRemark } = useBookingData()
  const [selectedBooking, setSelectedBooking] = useState<FacilityBooking | null>(null)
  const [selectedFacilityFilter, setSelectedFacilityFilter] = useState<string>('')
  const navigate = useNavigate()

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
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Facility Booking Management
            </h1>
            <span className="bg-[#801028]/10 text-[#801028] text-xs font-bold px-3 py-1 rounded-full border border-[#801028]/20 uppercase tracking-wider">
              Citizen Reservations
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Review and manage all citizen facility booking applications submitted online across Homagama Pradeshiya Sabha
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigate('/bookings/approvals')}
            className="flex items-center justify-center gap-2.5 bg-[#801028] hover:bg-[#680c20] text-white text-xs font-extrabold px-4.5 py-2.5 rounded-xl shadow-sm transition-colors uppercase tracking-wider cursor-pointer flex-1 sm:flex-initial"
          >
            <span>Approvals Queue</span>
            {stats.pending > 0 && (
              <span className="bg-amber-400 text-gray-950 px-2 py-0.5 rounded-full text-[11px] font-black">
                {stats.pending}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate('/bookings/schedule')}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors uppercase tracking-wider cursor-pointer flex-1 sm:flex-initial"
          >
            <span>📅 Facility Schedule</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      ) : (
        <>
          <BookingStats stats={stats} />

          {/* Facility Directory Cards */}
          <FacilityCards
            bookings={bookings}
            selectedFacility={selectedFacilityFilter}
            onSelectFacility={setSelectedFacilityFilter}
          />

          {/* Data Table */}
          <BookingTable
            bookings={bookings}
            onView={handleView}
            onApprove={(id) => handleApprove(id, 'Staff Officer (Table Action)')}
            onReject={(id) => handleReject(id, 'Staff Officer (Table Action)', 'Rejected via quick action')}
            showTabs={true}
            selectedFacilityFilter={selectedFacilityFilter}
          />
        </>
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

export default AllBookingsPage
