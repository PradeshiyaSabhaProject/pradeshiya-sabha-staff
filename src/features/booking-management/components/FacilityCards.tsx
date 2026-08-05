import React from 'react'
import type { FacilityBooking, FacilityType } from '../types'

interface FacilityCardsProps {
  bookings: FacilityBooking[]
  onSelectFacility?: (facilityName: string) => void
  selectedFacility?: string
}

const BuildingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#801028]">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M12 6h.01" />
    <path d="M16 6h.01" />
    <path d="M8 10h.01" />
    <path d="M12 10h.01" />
    <path d="M16 10h.01" />
    <path d="M8 14h.01" />
    <path d="M12 14h.01" />
    <path d="M16 14h.01" />
  </svg>
)

const TownHallIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-rose-700">
    <path d="M3 21h18" />
    <path d="M5 21V7l7-4 7 4v14" />
    <path d="M9 21v-5a3 3 0 0 1 6 0v5" />
    <path d="M8 11h.01" />
    <path d="M16 11h.01" />
    <path d="M12 11h.01" />
  </svg>
)

const CommunityCenterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-amber-700">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const PublicGroundIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-emerald-700">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
)

const SportsComplexIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-700">
    <circle cx="12" cy="12" r="10" />
    <path d="M4.93 4.93l14.14 14.14" />
    <path d="M12 2v20" />
    <path d="M2 12h20" />
  </svg>
)

const CrematoriumIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-purple-700">
    <path d="M3 22h18" />
    <path d="M6 18v-7" />
    <path d="M10 18v-7" />
    <path d="M14 18v-7" />
    <path d="M18 18v-7" />
    <path d="M12 2L2 9h20L12 2z" />
  </svg>
)

const EquipmentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-slate-700">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
)

const UsersGroupIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gray-400">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const facilitiesInfo: {
  name: FacilityType
  category: string
  capacity: string
  rate: string
  imageBg: string
  icon: React.ReactNode
}[] = [
  {
    name: 'Pradeshiya Sabha Town Hall',
    category: 'Main Auditorium & Banquet',
    capacity: '500 Seats',
    rate: 'Rs. 45,000 / Day',
    imageBg: 'from-rose-900/10 to-[#801028]/5 border-rose-200',
    icon: <TownHallIcon />
  },
  {
    name: 'Mattegoda Community Center',
    category: 'Community Hall & Workshops',
    capacity: '200 Seats',
    rate: 'Rs. 18,000 / Day',
    imageBg: 'from-amber-900/10 to-amber-500/5 border-amber-200',
    icon: <CommunityCenterIcon />
  },
  {
    name: 'Kottawa Public Ground & Pavilion',
    category: 'Outdoor Sports & Tournaments',
    capacity: '2,000+ Spectators',
    rate: 'Rs. 35,000 / Match',
    imageBg: 'from-emerald-900/10 to-emerald-500/5 border-emerald-200',
    icon: <PublicGroundIcon />
  },
  {
    name: 'Homagama Indoor Sports Complex',
    category: 'Badminton & Indoor Athletics',
    capacity: '150 Players / Audience',
    rate: 'Rs. 25,000 / Slot',
    imageBg: 'from-blue-900/10 to-blue-500/5 border-blue-200',
    icon: <SportsComplexIcon />
  },
  {
    name: 'Public Crematorium & Chapel',
    category: 'Municipal Cremation Services',
    capacity: '250 Attendees',
    rate: 'Rs. 7,500 / Service',
    imageBg: 'from-purple-900/10 to-purple-500/5 border-purple-200',
    icon: <CrematoriumIcon />
  },
  {
    name: 'Mobile Stage & Sound Equipment',
    category: 'Heavy Event Equipment',
    capacity: '30ft x 20ft Platform',
    rate: 'Rs. 55,000 / Event',
    imageBg: 'from-slate-900/10 to-slate-500/5 border-slate-300',
    icon: <EquipmentIcon />
  }
]

const FacilityCards: React.FC<FacilityCardsProps> = ({ bookings, onSelectFacility, selectedFacility = '' }) => {
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-gray-700 flex items-center gap-2">
          <BuildingIcon />
          <span>Municipal Facilities Directory & Availability</span>
        </h2>
        {selectedFacility && (
          <button
            type="button"
            onClick={() => onSelectFacility?.('')}
            className="self-start sm:self-auto text-xs font-bold text-[#801028] hover:underline bg-[#801028]/10 px-3 py-1 rounded-full border border-[#801028]/20 cursor-pointer"
          >
            Clear Filter ({selectedFacility}) ×
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {facilitiesInfo.map((fac) => {
          const facBookings = bookings.filter(b => b.facilityName === fac.name)
          const pendingCount = facBookings.filter(b => b.status === 'PENDING').length
          const approvedCount = facBookings.filter(b => b.status === 'APPROVED').length
          const isSelected = selectedFacility === fac.name

          return (
            <button
              type="button"
              key={fac.name}
              onClick={() => onSelectFacility?.(isSelected ? '' : fac.name)}
              className={`relative bg-white border rounded p-4 sm:p-5 shadow-sm hover:shadow transition-all cursor-pointer flex flex-col justify-between text-left font-normal w-full ${
                isSelected ? 'ring-2 ring-[#801028] border-[#801028] bg-rose-50/20' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <span className="block w-full">
                <span className="flex items-start justify-between gap-2 mb-2">
                  <span className="block text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-600 inline-block">
                      {fac.category}
                    </span>
                    <span className="block text-base font-extrabold text-gray-900 mt-1.5 leading-snug">
                      {fac.name}
                    </span>
                  </span>
                  <span className={`p-2.5 rounded-xl bg-gradient-to-br ${fac.imageBg} border shrink-0 flex items-center justify-center shadow-2xs`}>
                    {fac.icon}
                  </span>
                </span>

                <span className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-semibold text-gray-500 my-3">
                  <span className="flex items-center gap-1.5">
                    <UsersGroupIcon />
                    {fac.capacity}
                  </span>
                  <span className="text-gray-300 hidden sm:inline">|</span>
                  <span className="text-[#801028] font-bold">{fac.rate}</span>
                </span>
              </span>

              <span className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs w-full block">
                <span className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="flex items-center gap-1.5 text-gray-600 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    {approvedCount} Reserved
                  </span>
                  {pendingCount > 0 && (
                    <span className="flex items-center gap-1.5 text-orange-700 font-bold bg-orange-100 px-2 py-0.5 rounded-full border border-orange-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                      {pendingCount} Pending
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-bold text-[#801028] uppercase tracking-wider shrink-0 block">
                  {isSelected ? 'Active Filter' : 'Filter →'}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default FacilityCards
