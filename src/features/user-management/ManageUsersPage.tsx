import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserManagement } from './hooks/useUserManagement'
import { AVAILABLE_FEATURES } from './types'
import type { AppUser } from './types'
import { EditPermissionsModal } from './components/EditPermissionsModal'
import { ResetPasswordModal } from './components/ResetPasswordModal'

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-blue-500 shrink-0">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-green-500 shrink-0">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-amber-500 shrink-0">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const XCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-red-500 shrink-0">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
)

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400 shrink-0 pointer-events-none">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400 shrink-0">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

function getRoleBadgeStyle(rolePreset: string): string {
  switch (rolePreset) {
    case 'Admin':
      return 'bg-green-50 text-green-700 border-green-200'
    case 'Manager':
      return 'bg-purple-50 text-purple-700 border-purple-200'
    case 'Staff':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    default:
      return 'bg-amber-50 text-amber-700 border-amber-200'
  }
}

function getStatusDotColor(status: AppUser['status']): string {
  switch (status) {
    case 'Active':
      return 'bg-green-500'
    case 'Suspended':
      return 'bg-amber-500'
    default:
      return 'bg-red-500'
  }
}

export const ManageUsersPage: React.FC = () => {
  const navigate = useNavigate()
  const { users, updatePermissions, resetPassword, updateStatus, deleteUser } = useUserManagement()

  // Filters State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')
  const [selectedRole, setSelectedRole] = useState<string>('All')

  // Modals State
  const [editingUser, setEditingUser] = useState<AppUser | null>(null)
  const [isEditPermissionsOpen, setIsEditPermissionsOpen] = useState(false)
  const [resettingUser, setResettingUser] = useState<AppUser | null>(null)
  const [newGeneratedPassword, setNewGeneratedPassword] = useState('')
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)

  // Compute stats
  const totalCount = users.length
  const activeCount = users.filter((u) => u.status === 'Active').length
  const suspendedCount = users.filter((u) => u.status === 'Suspended' || u.status === 'Deactivated').length
  const pendingLoginCount = users.filter((u) => u.mustChangePassword).length

  // Departments list
  const departments = ['All', ...Array.from(new Set(users.map((u) => u.department)))]

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      (u.employeeName || '').toLowerCase().includes(q) ||
      (u.employeeId || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.designation || '').toLowerCase().includes(q)

    const matchesDept = selectedDepartment === 'All' || u.department === selectedDepartment
    const matchesStatus = selectedStatus === 'All' || u.status === selectedStatus
    const matchesRole = selectedRole === 'All' || u.rolePreset === selectedRole

    return matchesSearch && matchesDept && matchesStatus && matchesRole
  })

  // Handlers
  const handleOpenEditPermissions = (user: AppUser) => {
    setEditingUser(user)
    setIsEditPermissionsOpen(true)
  }

  const handleSavePermissions = (userId: string, newFeatures: string[]) => {
    updatePermissions(userId, newFeatures)
  }

  const handleOpenResetPassword = (user: AppUser) => {
    const words = ['Sabha', 'Lanka', 'Council', 'GovLK', 'Portal', 'Pradeshiya']
    const symbols = ['@', '#', '$', '!', '&']
    const num = Math.floor(1000 + Math.random() * 9000)
    const word = words[Math.floor(Math.random() * words.length)]
    const sym = symbols[Math.floor(Math.random() * symbols.length)]
    const generated = `${word}${sym}${num}`

    resetPassword(user.id, generated)
    setNewGeneratedPassword(generated)
    setResettingUser(user)
    setIsResetModalOpen(true)
  }

  const handleDeleteUser = (user: AppUser) => {
    if (window.confirm(`Are you sure you want to delete user account for "${user.employeeName}" (${user.employeeId})? This action cannot be undone.`)) {
      deleteUser(user.id)
    }
  }

  // Helper to convert feature code to label
  const getFeatureLabel = (featureId: string) => {
    for (const top of AVAILABLE_FEATURES) {
      if (top.id === featureId) return top.label
      if (top.children) {
        for (const child of top.children) {
          if (child.id === featureId) return child.label
        }
      }
    }
    return featureId
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedDepartment('All')
    setSelectedStatus('All')
    setSelectedRole('All')
  }

  const hasActiveFilters = searchQuery !== '' || selectedDepartment !== 'All' || selectedStatus !== 'All' || selectedRole !== 'All'

  const statsCards = [
    {
      id: 'total',
      label: 'Total Portal Users',
      value: totalCount,
      icon: <UsersIcon />,
      colorClass: 'text-blue-600',
      borderClass: 'border-blue-200',
      bgClass: 'bg-blue-50/60'
    },
    {
      id: 'active',
      label: 'Active Accounts',
      value: activeCount,
      icon: <CheckCircleIcon />,
      colorClass: 'text-green-600',
      borderClass: 'border-green-200',
      bgClass: 'bg-green-50/60'
    },
    {
      id: 'pending',
      label: 'Pending First Login',
      value: pendingLoginCount,
      icon: <ClockIcon />,
      colorClass: 'text-amber-600',
      borderClass: 'border-amber-200',
      bgClass: 'bg-amber-50/60'
    },
    {
      id: 'suspended',
      label: 'Suspended / Inactive',
      value: suspendedCount,
      icon: <XCircleIcon />,
      colorClass: 'text-red-600',
      borderClass: 'border-red-200',
      bgClass: 'bg-red-50/60'
    }
  ]

  return (
    <div className="space-y-6 animate-fade-in pb-8 max-w-7xl mx-auto">
      {/* Header Block matching AllLettersPage & ComplainPage */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-[#801028] inline-block" />
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Portal Users</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Inspect authorized accounts, modify sidebar module permissions, reset temporary passwords, and control account statuses.
          </p>
        </div>
        <div>
          <button
            onClick={() => navigate('/users/create')}
            className="w-full sm:w-auto bg-[#801028] hover:bg-[#600a1c] text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <PlusIcon />
            <span>Create New User Account</span>
          </button>
        </div>
      </div>

      {/* Summary Stats Cards matching LetterStats & ComplainStats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <div
            key={card.id}
            className={`flex flex-col items-center justify-center p-5 bg-white border rounded-xl shadow-sm hover:shadow transition-shadow ${card.borderClass}`}
          >
            <div className="flex items-center gap-2 mb-2.5">
              <div className={`p-1.5 rounded-lg ${card.bgClass}`}>
                {card.icon}
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${card.colorClass}`}>{card.label}</span>
            </div>
            <p className={`text-3xl font-extrabold ${card.colorClass}`}>
              {card.value.toString().padStart(2, '0')}
            </p>
          </div>
        ))}
      </div>

      {/* Filter Bar & Table Container matching LetterTable */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Filters Top Bar */}
        <div className="p-4 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 border-b border-gray-100">
          {/* Search Input */}
          <div className="relative flex items-center border border-gray-300 rounded-lg bg-white flex-1 min-w-[200px] hover:border-gray-400 focus-within:border-[#801028]">
            <div className="absolute left-3">
              <SearchIcon />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, ID, email..."
              className="w-full text-sm text-gray-700 bg-transparent py-2 pl-9 pr-4 outline-none placeholder:text-gray-400"
            />
          </div>

          {/* Department Filter */}
          <div className="relative flex items-center border border-gray-300 rounded-lg bg-white flex-1 min-w-[160px] hover:border-gray-400 focus-within:border-[#801028]">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full appearance-none outline-none text-sm text-gray-600 bg-transparent py-2 pl-3 pr-8 cursor-pointer"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'All' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
            <div className="absolute right-3 pointer-events-none">
              <ChevronDownIcon />
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative flex items-center border border-gray-300 rounded-lg bg-white flex-1 min-w-[150px] hover:border-gray-400 focus-within:border-[#801028]">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full appearance-none outline-none text-sm text-gray-600 bg-transparent py-2 pl-3 pr-8 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Deactivated">Deactivated</option>
            </select>
            <div className="absolute right-3 pointer-events-none">
              <ChevronDownIcon />
            </div>
          </div>

          {/* Role Filter */}
          <div className="relative flex items-center border border-gray-300 rounded-lg bg-white flex-1 min-w-[150px] hover:border-gray-400 focus-within:border-[#801028]">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full appearance-none outline-none text-sm text-gray-600 bg-transparent py-2 pl-3 pr-8 cursor-pointer"
            >
              <option value="All">All Role Presets</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Staff">Staff</option>
              <option value="Custom">Custom</option>
            </select>
            <div className="absolute right-3 pointer-events-none">
              <ChevronDownIcon />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-gray-500 hover:text-[#801028] font-medium px-3 py-2 text-sm transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto relative [-webkit-overflow-scrolling:touch] flex-1">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6">USER / EMPLOYEE</th>
                <th className="py-4 px-6">DEPARTMENT &amp; EMAIL</th>
                <th className="py-4 px-6">SIDEBAR ACCESS</th>
                <th className="py-4 px-6">STATUS &amp; LOGIN</th>
                <th className="py-4 px-6 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    No users match your selected filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const topFeatures = (u.allowedFeatures || []).filter((f) => !f.includes('_'))

                  return (
                    <tr key={u.id} className="hover:bg-gray-50/60 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#801028]/10 text-[#801028] border border-[#801028]/20 font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {u.avatarInitials || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 flex items-center gap-2">
                              {u.employeeName || 'Unknown User'}
                              <span className="text-[11px] bg-gray-100 px-2 py-0.5 rounded font-mono text-gray-600">
                                {u.employeeId || 'No ID'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">{u.designation || '-'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <p className="font-semibold text-gray-800 text-xs">{u.department}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{u.email}</p>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex flex-wrap items-center gap-1.5 max-w-xs">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${getRoleBadgeStyle(u.rolePreset)}`}
                          >
                            {u.rolePreset}
                          </span>

                          {topFeatures.slice(0, 3).map((fid) => (
                            <span
                              key={fid}
                              className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium border border-gray-200"
                            >
                              {getFeatureLabel(fid).split(' ')[0]}
                            </span>
                          ))}

                          {topFeatures.length > 3 && (
                            <span
                              className="text-[11px] bg-[#801028]/10 text-[#801028] px-2 py-0.5 rounded font-bold border border-[#801028]/20"
                              title={topFeatures.slice(3).map(getFeatureLabel).join(', ')}
                            >
                              +{topFeatures.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${getStatusDotColor(u.status)}`}
                            />
                            <select
                              value={u.status}
                              onChange={(e) => updateStatus(u.id, e.target.value as AppUser['status'])}
                              className="text-xs font-semibold bg-transparent border-0 text-gray-800 focus:ring-0 cursor-pointer pr-4 py-0"
                            >
                              <option value="Active">Active</option>
                              <option value="Suspended">Suspended</option>
                              <option value="Deactivated">Deactivated</option>
                            </select>
                          </div>
                          <p className="text-[11px] text-gray-400 pl-4">
                            Last: {u.lastLogin || 'Never'}
                          </p>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditPermissions(u)}
                            className="p-2 text-gray-500 hover:text-[#801028] hover:bg-[#801028]/5 rounded-lg transition-colors cursor-pointer"
                            title="Edit Sidebar Permissions"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenResetPassword(u)}
                            className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Reset Temporary Password"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete User Account"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Permissions Modal */}
      <EditPermissionsModal
        user={editingUser}
        isOpen={isEditPermissionsOpen}
        onClose={() => setIsEditPermissionsOpen(false)}
        onSave={handleSavePermissions}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        user={resettingUser}
        newPassword={newGeneratedPassword}
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
      />
    </div>
  )
}
