import React, { useState } from 'react'
import { useLetterData, type Letter } from '../hooks/useLetterData'
import LetterTable from '../components/LetterTable'
import LetterDetailModal from '../components/LetterDetailModal'

const MyLettersPage: React.FC = () => {
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
          <h1 className="text-2xl font-bold text-gray-900">My Letters</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and view all your letters</p>
        </div>
        <div>
          <button type="button" className="flex items-center gap-2 bg-white border border-gray-300 text-xs font-semibold px-4 py-2 rounded shadow-sm hover:bg-gray-50 transition-colors uppercase tracking-wider">
            <span className="text-gray-700">Quick Stats</span>
            <span className="flex items-center gap-1 text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded uppercase tracking-wider font-bold border border-orange-200">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 block" /> {stats.pending} PENDING
            </span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
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

