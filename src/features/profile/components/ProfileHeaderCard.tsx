import React, { useState } from 'react'
import type { UserBioProfile } from '../types'
import Modal from '../../../components/Modal'
import Button from '../../../components/Button'

interface ProfileHeaderCardProps {
  profile: UserBioProfile
  onEditClick: () => void
  isEditing: boolean
  activeSessionsCount: number
  leaveRemaining: number
}

// ── Icons matching other pages ────────────────────────────────────────────────
const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-green-600 shrink-0">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-blue-600 shrink-0">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const ShieldCheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-purple-600 shrink-0">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-orange-600 shrink-0">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const BadgeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="2" />
    <path d="M15 8h2" />
    <path d="M15 12h2" />
    <path d="M7 16h10" />
  </svg>
)

export const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({
  profile,
  onEditClick,
  isEditing,
  activeSessionsCount,
  leaveRemaining,
}) => {
  const [showIdModal, setShowIdModal] = useState(false)
  const [copiedNfc, setCopiedNfc] = useState(false)

  const handleCopyNfc = () => {
    navigator.clipboard.writeText(profile.biometricNfcId)
    setCopiedNfc(true)
    setTimeout(() => setCopiedNfc(false), 2000)
  }

  const statsCards = [
    {
      id: 'status',
      label: 'Account Status',
      value: profile.verificationStatus,
      percentage: 100,
      icon: <CheckCircleIcon />,
      colorClass: 'text-green-600',
      bgClass: 'bg-green-50',
      barColorClass: 'bg-green-500'
    },
    {
      id: 'nfc',
      label: 'Biometric Turnstile',
      value: 'Synchronized',
      percentage: 100,
      icon: <ClockIcon />,
      colorClass: 'text-blue-600',
      bgClass: 'bg-blue-50',
      barColorClass: 'bg-blue-500'
    },
    {
      id: 'sessions',
      label: 'Active Devices',
      value: `${activeSessionsCount} Device${activeSessionsCount === 1 ? '' : 's'}`,
      percentage: activeSessionsCount > 0 ? Math.min(activeSessionsCount * 25, 100) : 0,
      icon: <ShieldCheckIcon />,
      colorClass: 'text-purple-600',
      bgClass: 'bg-purple-50',
      barColorClass: 'bg-purple-500'
    },
    {
      id: 'leave',
      label: 'Annual Leave Remaining',
      value: `${leaveRemaining} Days`,
      percentage: Math.round((leaveRemaining / 14) * 100),
      icon: <CalendarIcon />,
      colorClass: 'text-[#A31736]',
      bgClass: 'bg-[#A31736]/10',
      barColorClass: 'bg-[#A31736]'
    },
  ]

  return (
    <>
      {/* Staff Identity Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded border border-gray-300 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded bg-[#A31736]/10 text-[#A31736] border border-[#A31736]/20 flex items-center justify-center font-black text-base shrink-0">
            {profile.fullName
              .split(' ')
              .slice(0, 2)
              .map((n) => n[0])
              .join('')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight uppercase">{profile.fullName}</h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded uppercase bg-gray-100 text-gray-700 border border-gray-300 font-mono">
                {profile.empId}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#A31736] mt-0.5">{profile.designation}</p>
            <p className="text-xs text-gray-500 mt-0.5 flex flex-wrap items-center gap-2">
              <span>{profile.department}</span>
              <span>•</span>
              <button
                type="button"
                onClick={handleCopyNfc}
                title="Click to copy NFC Token ID"
                className="font-mono text-xs text-gray-600 hover:text-[#A31736] underline cursor-pointer"
              >
                {copiedNfc ? 'Copied NFC!' : `NFC: ${profile.biometricNfcId}`}
              </button>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowIdModal(true)}
            className="w-full sm:w-auto bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-4 py-2 rounded shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <BadgeIcon />
            <span>ID Badge</span>
          </button>

          <button
            type="button"
            onClick={onEditClick}
            className={`w-full sm:w-auto text-white text-xs font-semibold px-4 py-2 rounded shadow-xs hover:shadow transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider ${
              isEditing ? 'bg-gray-700 hover:bg-gray-800' : 'bg-[#A31736] hover:bg-[#801028]'
            }`}
          >
            <PlusIcon />
            <span>{isEditing ? 'Cancel Editing' : 'Edit Contact Info'}</span>
          </button>
        </div>
      </div>

      {/* Summary Stats Cards matching Overview Page layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <div
            key={card.id}
            className="bg-white p-5 rounded border border-gray-300 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-gray-400 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{card.label}</span>
              <div className={`p-2 rounded ${card.bgClass} ${card.colorClass}`}>
                {card.icon}
              </div>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                {card.value}
              </span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-3">
              <div
                className={`h-full rounded-full ${card.barColorClass}`}
                style={{ width: `${card.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Digital ID Card Modal */}
      <Modal isOpen={showIdModal} onClose={() => setShowIdModal(false)} title="Official Staff Identity Credential">
        <div className="flex flex-col items-center">
          <div className="w-full max-w-sm rounded bg-white border border-gray-300 p-5 text-gray-900 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#A31736]">Homagama Pradeshiya Sabha</p>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-800">Staff Identity Badge</p>
              </div>
              <div className="w-7 h-7 rounded bg-[#A31736] text-white flex items-center justify-center font-bold text-xs">
                HPS
              </div>
            </div>

            <div className="py-5 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded bg-[#A31736]/10 text-[#A31736] font-bold text-xl flex items-center justify-center border border-[#A31736]/20 mb-2.5">
                {profile.fullName
                  .split(' ')
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join('')}
              </div>
              <h4 className="font-bold text-sm text-gray-900">{profile.nameWithInitials}</h4>
              <p className="text-xs text-[#A31736] font-semibold mt-0.5">{profile.designation}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{profile.department}</p>
            </div>

            <div className="bg-gray-50 rounded p-3 text-xs space-y-2 border border-gray-200">
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-500 font-medium">Employee No:</span>
                <span className="font-mono font-bold text-gray-900">{profile.empId}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-500 font-medium">NIC:</span>
                <span className="font-mono font-semibold text-gray-800">{profile.nic}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-500 font-medium">NFC Token:</span>
                <span className="font-mono font-semibold text-green-700">{profile.biometricNfcId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Status:</span>
                <span className="font-semibold text-gray-900">Verified Council Officer</span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex gap-2.5 w-full max-w-sm">
            <Button
              onClick={() => window.print()}
              variant="primary"
              className="flex-1 justify-center shadow-xs"
            >
              Print Badge
            </Button>
            <Button variant="secondary" onClick={() => setShowIdModal(false)} className="flex-1 justify-center">
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
export default ProfileHeaderCard
