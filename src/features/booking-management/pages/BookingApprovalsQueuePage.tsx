import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBookingData } from '../hooks/useBookingData'
import type { FacilityBooking } from '../types'
import BookingTable from '../components/BookingTable'
import BookingDetailModal from '../components/BookingDetailModal'

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-orange-600">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

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
      return <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
    }

    if (pendingBookings.length === 0) {
      return (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
            ✓
          </div>
          <h3 className="text-lg font-black text-gray-900">All Caught Up! No Pending Approvals</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            All facility reservations submitted by citizens have been reviewed, approved, or processed by municipal officers.
          </p>
          <button
            type="button"
            onClick={() => navigate('/bookings/all')}
            className="mt-4 px-5 py-2.5 bg-[#801028] text-white text-xs font-bold rounded-xl hover:bg-[#680c20] transition-colors uppercase tracking-wider cursor-pointer"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <ClockIcon />
              <span>Pending Bookings Queue</span>
            </h1>
            <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full border border-orange-200 uppercase tracking-wider">
              Priority Intake ({pendingBookings.length})
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Review and take immediate action on pending citizen venue reservations and equipment requests
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
