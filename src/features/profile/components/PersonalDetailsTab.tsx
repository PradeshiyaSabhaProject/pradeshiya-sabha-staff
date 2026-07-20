import React, { useState } from 'react'
import type { UserBioProfile, LeaveSummary } from '../types'
import Input from '../../../components/Input'
import Button from '../../../components/Button'

interface PersonalDetailsTabProps {
  profile: UserBioProfile
  leaveSummary: LeaveSummary
  isEditing: boolean
  onSaveProfile: (updated: Partial<UserBioProfile>) => void
}

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-[#801028]">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-amber-600">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const HeartPulseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-emerald-600">
    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
  </svg>
)

const BuildingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-[#801028]">
    <path d="M3 21h18" />
    <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
    <path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
  </svg>
)

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-blue-600">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

const AlertCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-orange-600">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-purple-600">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

export const PersonalDetailsTab: React.FC<PersonalDetailsTabProps> = ({
  profile,
  leaveSummary,
  isEditing,
  onSaveProfile,
}) => {
  const [formData, setFormData] = useState<Partial<UserBioProfile>>({
    mobilePhone: profile.mobilePhone,
    whatsappNumber: profile.whatsappNumber,
    personalEmail: profile.personalEmail,
    emergencyContactName: profile.emergencyContactName,
    emergencyContactRelation: profile.emergencyContactRelation,
    emergencyContactPhone: profile.emergencyContactPhone,
    residentialAddress: profile.residentialAddress,
  })

  const handleChange = (field: keyof UserBioProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSaveProfile(formData)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Leave Balance Summary Cards matching standard grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center justify-between hover:border-gray-300 transition-all">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Annual Leave</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-gray-900">{leaveSummary.annualTotal - leaveSummary.annualUsed}</span>
              <span className="text-xs font-medium text-gray-500">/ {leaveSummary.annualTotal} days left</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-[#801028] h-1.5 rounded-full transition-all"
                style={{ width: `${(leaveSummary.annualUsed / leaveSummary.annualTotal) * 100}%` }}
              />
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#801028]/10">
            <CalendarIcon />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center justify-between hover:border-gray-300 transition-all">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Casual Leave</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-gray-900">{leaveSummary.casualTotal - leaveSummary.casualUsed}</span>
              <span className="text-xs font-medium text-gray-500">/ {leaveSummary.casualTotal} days left</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-amber-500 h-1.5 rounded-full transition-all"
                style={{ width: `${(leaveSummary.casualUsed / leaveSummary.casualTotal) * 100}%` }}
              />
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50/60">
            <ClockIcon />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center justify-between hover:border-gray-300 transition-all">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Medical Leave</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-gray-900">{leaveSummary.medicalTotal - leaveSummary.medicalUsed}</span>
              <span className="text-xs font-medium text-gray-500">/ {leaveSummary.medicalTotal} days left</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all"
                style={{ width: `${(leaveSummary.medicalUsed / leaveSummary.medicalTotal) * 100}%` }}
              />
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50/60">
            <HeartPulseIcon />
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Official Council Identifiers */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-[#801028]/10">
                <BuildingIcon />
              </div>
              <h3 className="font-bold text-gray-900 text-base">Official Administrative Record</h3>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2.5 py-1 rounded border border-gray-200">
              Verified by HR
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Employee Number</p>
              <p className="font-mono font-bold text-gray-800 mt-0.5">{profile.empId}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">National Identity Card (NIC)</p>
              <p className="font-mono font-bold text-gray-800 mt-0.5">{profile.nic}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Service Grade</p>
              <p className="font-semibold text-gray-800 mt-0.5">{profile.grade}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Date of Joining</p>
              <p className="font-semibold text-gray-800 mt-0.5">{profile.joinDate}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Date of Birth</p>
              <p className="font-semibold text-gray-800 mt-0.5">{profile.dateOfBirth}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Gender</p>
              <p className="font-semibold text-gray-800 mt-0.5">{profile.gender}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase">Official Council Email</p>
            <p className="font-mono font-medium text-[#801028] mt-0.5">{profile.officialEmail}</p>
          </div>
        </div>

        {/* Section 2: Personal Contact & Communication */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-blue-50">
                <PhoneIcon />
              </div>
              <h3 className="font-bold text-gray-900 text-base">Personal Contact & Communication</h3>
            </div>
            {isEditing && (
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                Editing Mode
              </span>
            )}
          </div>

          <div className="space-y-4">
            {isEditing ? (
              <>
                <Input
                  label="Mobile Phone Number"
                  value={formData.mobilePhone || ''}
                  onChange={(e) => handleChange('mobilePhone', e.target.value)}
                  placeholder="+94 7X XXX XXXX"
                />
                <Input
                  label="WhatsApp Number (For Alerts)"
                  value={formData.whatsappNumber || ''}
                  onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                  placeholder="+94 7X XXX XXXX"
                />
                <Input
                  label="Personal Email Address"
                  type="email"
                  value={formData.personalEmail || ''}
                  onChange={(e) => handleChange('personalEmail', e.target.value)}
                  placeholder="personal@gmail.com"
                />
              </>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase">Mobile Phone</p>
                  <p className="font-mono font-semibold text-gray-800 mt-0.5">{profile.mobilePhone}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase">WhatsApp Number</p>
                  <p className="font-mono font-semibold text-emerald-700 mt-0.5">{profile.whatsappNumber}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase">Personal Email</p>
                  <p className="font-mono font-medium text-gray-800 mt-0.5">{profile.personalEmail}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Emergency Contact Details */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <div className="p-1.5 rounded bg-orange-50">
              <AlertCircleIcon />
            </div>
            <h3 className="font-bold text-gray-900 text-base">Emergency Contact Person</h3>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <Input
                label="Contact Person Name"
                value={formData.emergencyContactName || ''}
                onChange={(e) => handleChange('emergencyContactName', e.target.value)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Relationship"
                  value={formData.emergencyContactRelation || ''}
                  onChange={(e) => handleChange('emergencyContactRelation', e.target.value)}
                />
                <Input
                  label="Emergency Phone"
                  value={formData.emergencyContactPhone || ''}
                  onChange={(e) => handleChange('emergencyContactPhone', e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">Contact Name</p>
                <p className="font-bold text-gray-900 mt-0.5">{profile.emergencyContactName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">Relationship</p>
                <p className="font-semibold text-gray-800 mt-0.5">{profile.emergencyContactRelation}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold text-gray-400 uppercase">Emergency Phone Number</p>
                <p className="font-mono font-bold text-red-700 mt-0.5">{profile.emergencyContactPhone}</p>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Residential Address */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <div className="p-1.5 rounded bg-purple-50">
              <HomeIcon />
            </div>
            <h3 className="font-bold text-gray-900 text-base">Permanent Residential Address</h3>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Full Street & City Address
                </label>
                <textarea
                  rows={3}
                  value={formData.residentialAddress || ''}
                  onChange={(e) => handleChange('residentialAddress', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#801028] transition-all"
                />
              </div>
            </div>
          ) : (
            <div className="text-sm">
              <p className="text-xs font-semibold text-gray-400 uppercase">Registered Address</p>
              <p className="font-medium text-gray-800 mt-1 leading-relaxed">{profile.residentialAddress}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 bg-gray-50 text-gray-600 px-3 py-1.5 rounded text-xs border border-gray-200">
                <span>Western Province / Colombo District</span>
              </div>
            </div>
          )}
        </div>

        {/* Save button visible in editing mode */}
        {isEditing && (
          <div className="lg:col-span-2 flex justify-end gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <Button type="submit" variant="primary" className="px-8 shadow-sm uppercase tracking-wider">
              Save Contact Updates
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}
export default PersonalDetailsTab
