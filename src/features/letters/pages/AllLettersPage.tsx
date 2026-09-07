import React, { useState } from 'react'
import { useLetterData, type Letter } from '../hooks/useLetterData'
import LetterStats from '../components/LetterStats'
import LetterTable from '../components/LetterTable'
import LetterDetailModal from '../components/LetterDetailModal'

const AllLettersPage: React.FC = () => {
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
            Citizen Letters &amp; Official Dispatches
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Manage, review, and track all citizen-submitted formal representations, inquiries, and departmental petitions.
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 bg-white border border-gray-300 text-xs font-semibold px-3 py-1.5 rounded shadow-3xs">
            <span className="text-gray-600 uppercase tracking-wider text-[11px]">Intake Queue:</span>
            <span className="font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 text-[10px]">
              {stats.pending} PENDING
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 rounded animate-pulse" />)}
          </div>
          <div className="h-96 bg-gray-100 rounded animate-pulse" />
        </div>
      ) : (
        <>
          <LetterStats stats={stats} />
          <LetterTable 
            letters={letters} 
            onView={handleView} 
            showTabs={true} 
            showOfficer={true} 
          />
        </>
      )}

      <LetterDetailModal 
        letter={selectedLetter} 
        onClose={handleCloseModal} 
      />

    </div>
  )
}

export default AllLettersPage


