import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  STAFF_PROFILE,
  ADMIN_PROFILE,
  INITIAL_SESSIONS,
  INITIAL_ACTIVITY_LOGS,
  STAFF_LEAVE_SUMMARY,
} from './data/mockProfileData'
import type { UserBioProfile, SecuritySession, ActivityLogItem } from './types'
import ProfileHeaderCard from './components/ProfileHeaderCard'
import PersonalDetailsTab from './components/PersonalDetailsTab'
import SecurityAndCredentialsTab from './components/SecurityAndCredentialsTab'
import ActivityAndAuditTab from './components/ActivityAndAuditTab'

type TabKey = 'personal' | 'security' | 'activity'

export const ProfilePage: React.FC = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

  const [profile, setProfile] = useState<UserBioProfile>(() => {
    return isAdmin ? ADMIN_PROFILE : STAFF_PROFILE
  })
  const [sessions, setSessions] = useState<SecuritySession[]>(INITIAL_SESSIONS)
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(INITIAL_ACTIVITY_LOGS)

  const [activeTab, setActiveTab] = useState<TabKey>('personal')
  const [isEditing, setIsEditing] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 4000)
  }

  const handleSaveProfile = (updated: Partial<UserBioProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }))
    setIsEditing(false)
    showToast('✔ Personal profile records updated successfully.')

    const newLog: ActivityLogItem = {
      id: `act-${Date.now()}`,
      action: 'Updated Personal & Contact Information',
      module: 'General',
      timestamp: 'Just now',
      ip: '192.168.10.42 (Active Terminal)',
      status: 'Success',
      details: 'Modified communication numbers / emergency contact details on Staff Portal.',
    }
    setActivityLogs((prev) => [newLog, ...prev])
  }

  const handleRevokeSession = (sessionId: string) => {
    const revoked = sessions.find((s) => s.id === sessionId)
    setSessions((prev) => prev.filter((s) => s.id !== sessionId))
    showToast(`✔ Revoked access for ${revoked?.device || 'session'}. Device logged out immediately.`)

    const newLog: ActivityLogItem = {
      id: `act-${Date.now()}`,
      action: `Revoked Session for ${revoked?.device || 'Remote Device'}`,
      module: 'Security',
      timestamp: 'Just now',
      ip: revoked?.ipAddress || 'Unknown IP',
      status: 'Warning',
      details: `Administrative token terminated from Security & Credentials dashboard.`,
    }
    setActivityLogs((prev) => [newLog, ...prev])
  }

  const handleUpdatePassword = (_current: string, _next: string) => {
    const newLog: ActivityLogItem = {
      id: `act-${Date.now()}`,
      action: 'Account Security Credentials & Password Updated',
      module: 'Security',
      timestamp: 'Just now',
      ip: '192.168.10.42 (Active Terminal)',
      status: 'Success',
      details: 'Security credentials and password updated successfully complying with Council policy via SMS OTP verification.',
    }
    setActivityLogs((prev) => [newLog, ...prev])
  }

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: 'personal', label: 'Personal & Bio Details' },
    { key: 'security', label: 'Security & Credentials', count: sessions.length },
    { key: 'activity', label: 'Activity Audit Log', count: activityLogs.length },
  ]

  return (
    <div className="space-y-6 animate-fade-in pb-8 max-w-7xl mx-auto text-left relative">
      {/* Toast feedback notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-gray-700 flex items-center gap-3 animate-fade-in text-xs sm:text-sm font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse"></span>
          <span>{toast}</span>
          <button type="button" onClick={() => setToast(null)} className="ml-2 text-gray-400 hover:text-white font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Header Block & Summary Stats matching ManageUsersPage / AllLettersPage */}
      <ProfileHeaderCard
        profile={profile}
        onEditClick={() => setIsEditing(!isEditing)}
        isEditing={isEditing}
        activeSessionsCount={sessions.length}
        leaveRemaining={STAFF_LEAVE_SUMMARY.annualTotal - STAFF_LEAVE_SUMMARY.annualUsed}
      />

      {/* Tabbed Content Container matching LetterTable / ManageUsersPage */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Navigation Tabs Bar */}
        <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar bg-gray-50/50">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-6 py-4 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#801028] text-[#801028] bg-white font-bold shadow-2xs'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-xs font-bold ${isActive ? 'text-[#801028]' : 'text-gray-400'}`}>
                    ({tab.count})
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Tab Content Panel */}
        <div className="p-6">
          {activeTab === 'personal' && (
            <PersonalDetailsTab
              profile={profile}
              leaveSummary={STAFF_LEAVE_SUMMARY}
              isEditing={isEditing}
              onSaveProfile={handleSaveProfile}
            />
          )}
          {activeTab === 'security' && (
            <SecurityAndCredentialsTab
              sessions={sessions}
              onRevokeSession={handleRevokeSession}
              onUpdatePassword={handleUpdatePassword}
            />
          )}
          {activeTab === 'activity' && (
            <ActivityAndAuditTab logs={activityLogs} />
          )}
        </div>
      </div>
    </div>
  )
}
export default ProfilePage
