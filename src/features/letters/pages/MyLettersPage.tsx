import React, { useState } from 'react'
import { useLetterData, type Letter } from '../hooks/useLetterData'
import LetterTable from '../components/LetterTable'
import LetterDetailModal from '../components/LetterDetailModal'

const MyLettersPage: React.FC = () => {
  const { loading, letters } = useLetterData()
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
            My Assigned Letters &amp; Correspondence
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Citizen correspondence, petitions, and department communications assigned to your officer desk for verification.
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 bg-white border border-gray-300 text-xs font-semibold px-3 py-1.5 rounded shadow-3xs">
            <span className="text-gray-600 uppercase tracking-wider text-[11px]">Assigned Queue:</span>
            <span className="font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 text-[10px]">
              {letters.length} ASSIGNED
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
          showOfficer={true} 
        />
      )}

      <LetterDetailModal 
        letter={selectedLetter} 
        onClose={handleCloseModal} 
        allowForwardToSuperior={true}
        allowStatusChange={true}
      />

    </div>
  )
}

export default MyLettersPage


