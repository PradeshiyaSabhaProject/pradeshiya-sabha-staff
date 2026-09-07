import React, { useState } from 'react'
import { useLetterData, type Letter } from '../hooks/useLetterData'
import LetterTable from '../components/LetterTable'
import LetterDetailModal from '../components/LetterDetailModal'

const OutwardLettersPage: React.FC = () => {
  const { loading, letters, stats } = useLetterData()
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null)

  const handleView = (letter: Letter) => {
    setSelectedLetter(letter)
  }

  const handleCloseModal = () => {
    setSelectedLetter(null)
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase">
            Outward Letters &amp; Dispatches
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Track outgoing administrative notifications, council decisions, and official citizen replies.
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 bg-white border border-gray-300 text-xs font-semibold px-3 py-1.5 rounded shadow-3xs">
            <span className="text-gray-600 uppercase tracking-wider text-[11px]">Dispatched / Active:</span>
            <span className="font-bold text-blue-800 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 text-[10px]">
              {stats.approved} OUTWARD
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-96 bg-gray-100 rounded animate-pulse" />
      ) : (
        <LetterTable 
          letters={letters} 
          onView={handleView} 
          showTabs={false} 
          showOfficer={false} 
        />
      )}

      <LetterDetailModal 
        letter={selectedLetter} 
        onClose={handleCloseModal} 
      />

    </div>
  )
}

export default OutwardLettersPage


