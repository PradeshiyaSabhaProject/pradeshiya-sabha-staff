import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBookingData } from '../hooks/useBookingData'
import type { FacilityBooking } from '../types'
import BookingTable from '../components/BookingTable'
import BookingDetailModal from '../components/BookingDetailModal'

const BookingApprovalsQueuePage: React.FC = () => {
  const { loading, bookings, approveBooking, rejectBooking, addRemark } = useBookingData()
  const [selectedBooking, setSelectedBooking] = useState<FacilityBooking | null>(null)
  const navigate = useNavigate()

  const pendingBookings = bookings.filter(b => b.status === 'PENDING')

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

  const renderQueueContent = () => {
    if (loading) {
      return <div className="h-96 bg-gray-100 rounded animate-pulse border border-gray-200" />
    }

    if (pendingBookings.length === 0) {
      return (
        <div className="bg-white border border-gray-300 rounded p-12 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
            ✓
          </div>
          <h3 className="text-base font-bold text-gray-900 uppercase">All Caught Up! No Pending Approvals</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            All facility reservations submitted by citizens have been reviewed, approved, or processed by municipal officers.
          </p>
          <button
            type="button"
            onClick={() => navigate('/bookings/all')}
            className="mt-4 px-4 py-2 bg-[#A31736] text-white text-xs font-bold rounded hover:bg-[#801028] transition-colors uppercase tracking-wider cursor-pointer"
          >
            View All Historical Bookings
          </button>
        </div>
      )
    }

    return (
      <BookingTable
        bookings={pendingBookings}
        onView={handleView}
        onApprove={(id) => handleApprove(id, 'Staff Officer (Queue Action)')}
        onReject={(id) => handleReject(id, 'Staff Officer (Queue Action)', 'Rejected via approval queue')}
        showTabs={false}
      />
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            Pending Bookings Queue
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Review and take immediate action on pending citizen venue reservations and equipment requests.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-white border border-gray-300 text-xs font-semibold px-3.5 py-1.5 rounded shadow-sm uppercase tracking-wider cursor-default">
            <span className="text-gray-700 font-bold">Queue Count</span>
            <span className="flex items-center gap-1 text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded uppercase tracking-wider font-bold border border-orange-200">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 block"></span>
              {pendingBookings.length} PENDING
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/bookings/all')}
            className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold px-3.5 py-1.5 rounded shadow-xs transition-colors uppercase tracking-wider cursor-pointer"
          >
            <span>All Bookings</span>
          </button>
        </div>
      </div>

      {renderQueueContent()}

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

export default BookingApprovalsQueuePage
