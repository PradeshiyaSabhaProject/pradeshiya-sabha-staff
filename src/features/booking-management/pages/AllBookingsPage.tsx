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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            Facility Booking Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Review and manage all citizen facility booking applications submitted online across Homagama Pradeshiya Sabha.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/bookings/approvals')}
            className="flex items-center justify-center gap-2 bg-[#A31736] hover:bg-[#801028] text-white text-xs font-bold px-3.5 py-1.5 rounded shadow-xs transition-colors uppercase tracking-wider cursor-pointer"
          >
            <span>Approvals Queue</span>
            {stats.pending > 0 && (
              <span className="bg-amber-400 text-gray-950 px-1.5 py-0.2 rounded text-[10px] font-extrabold">
                {stats.pending}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/bookings/schedule')}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold px-3.5 py-1.5 rounded shadow-xs transition-colors uppercase tracking-wider cursor-pointer"
          >
            <span>Facility Schedule</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-28 bg-gray-100 rounded animate-pulse border border-gray-200" />
            ))}
          </div>
          <div className="h-96 bg-gray-100 rounded animate-pulse border border-gray-200" />
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
