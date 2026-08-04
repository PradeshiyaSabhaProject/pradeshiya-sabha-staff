import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserManagement } from './hooks/useUserManagement'
import { AVAILABLE_FEATURES } from './types'
import type { CouncilEmployeeOption, AppUser } from './types'
import { ResetPasswordModal } from './components/ResetPasswordModal'

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400 shrink-0">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

function getPresetButtonClass(preset: 'Admin' | 'Manager' | 'Staff' | 'Clear', rolePreset: string): string {
  if (preset === 'Clear') {
    return 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
  }
  if (rolePreset === preset) {
    return 'bg-[#801028] text-white border-[#801028] shadow-xs'
  }
  return 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
}

export const CreateUserPage: React.FC = () => {
  const navigate = useNavigate()
  const { availableEmployees, createUser } = useUserManagement()

  // Form State
  const [selectedEmployee, setSelectedEmployee] = useState<CouncilEmployeeOption | null>(null)
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [rolePreset, setRolePreset] = useState<'Admin' | 'Manager' | 'Staff' | 'Custom'>('Staff')
  const [tempPassword, setTempPassword] = useState('')
  const [mustChangePassword, setMustChangePassword] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    attendance: true,
    appointments: true,
    letters: true,
  })

  // Success Modal State
  const [createdUser, setCreatedUser] = useState<AppUser | null>(null)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)

  // Filter employees
  const filteredEmployees = availableEmployees.filter((emp) => {
    const q = searchQuery.toLowerCase()
    return (
      (emp.employeeName || '').toLowerCase().includes(q) ||
      (emp.employeeId || '').toLowerCase().includes(q) ||
      (emp.department || '').toLowerCase().includes(q) ||
      (emp.designation || '').toLowerCase().includes(q)
    )
  })

  // Password Generator
  const generatePassword = () => {
    const words = ['Sabha', 'Lanka', 'Council', 'GovLK', 'Portal', 'Pradeshiya']
    const symbols = ['@', '#', '$', '!', '&']
    const randomValues = new Uint32Array(3)
    window.crypto.getRandomValues(randomValues)
    const num = 1000 + (randomValues[0] % 9000)
    const word = words[randomValues[1] % words.length]
    const sym = symbols[randomValues[2] % symbols.length]
    setTempPassword(`${word}${sym}${num}`)
  }

  // Feature selection handlers
  const toggleFeature = (featureId: string, childrenIds?: string[]) => {
    setRolePreset('Custom')
    setSelectedFeatures((prev) => {
      const exists = prev.includes(featureId)
      if (exists) {
        let newSet = prev.filter((id) => id !== featureId)
        if (childrenIds) {
          newSet = newSet.filter((id) => !childrenIds.includes(id))
        }
        return newSet
      } else {
        const toAdd = [featureId]
        if (childrenIds) {
          toAdd.push(...childrenIds)
        }
        return Array.from(new Set([...prev, ...toAdd]))
      }
    })
  }

  const toggleChildFeature = (parentId: string, childId: string) => {
    setRolePreset('Custom')
    setSelectedFeatures((prev) => {
      const childExists = prev.includes(childId)
      if (childExists) {
        const next = prev.filter((id) => id !== childId)
        const parentObj = AVAILABLE_FEATURES.find((f) => f.id === parentId)
        if (parentObj && parentObj.children) {
          const hasAnyChild = parentObj.children.some((c) => next.includes(c.id))
          if (!hasAnyChild) {
            return next.filter((id) => id !== parentId)
          }
        }
        return next
      } else {
        return Array.from(new Set([...prev, childId, parentId]))
      }
    })
  }

  const toggleExpand = (moduleId: string) => {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }))
  }

  const applyPreset = (preset: 'Admin' | 'Manager' | 'Staff' | 'Clear') => {
    if (preset === 'Clear') {
      setSelectedFeatures([])
      setRolePreset('Custom')
      return
    }

    setRolePreset(preset)
    if (preset === 'Admin') {
      const all: string[] = []
      AVAILABLE_FEATURES.forEach((f) => {
        all.push(f.id)
        if (f.children) f.children.forEach((c) => all.push(c.id))
      })
      setSelectedFeatures(all)
    } else if (preset === 'Manager') {
      const mgr: string[] = []
      AVAILABLE_FEATURES.forEach((f) => {
        if (['overview', 'attendance', 'appointments', 'assets', 'fleet', 'complaints', 'letters', 'profile'].includes(f.id)) {
          mgr.push(f.id)
          if (f.children) {
            f.children.forEach((c) => {
              if (!c.id.includes('audits') && !c.id.includes('assigned')) mgr.push(c.id)
            })
          }
        }
      })
      setSelectedFeatures(mgr)
    } else if (preset === 'Staff') {
      const stf: string[] = []
      AVAILABLE_FEATURES.forEach((f) => {
        if (['overview', 'attendance', 'appointments', 'complaints', 'letters', 'profile'].includes(f.id)) {
          stf.push(f.id)
          if (f.children) {
            f.children.forEach((c) => {
              if (c.id.includes('my') || c.id.includes('dashboard') || c.id.includes('timecards') || c.id.includes('write') || c.id.includes('inward') || c.id.includes('outward')) {
                stf.push(c.id)
              }
            })
          }
        }
      })
      setSelectedFeatures(stf)
    }
  }

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmployee) {
      alert('Please select an employee to create an account for.')
      return
    }
    if (selectedFeatures.length === 0) {
      alert('Please assign at least one feature access permission from the sidebar list.')
      return
    }
    if (!tempPassword || tempPassword.trim().length < 6) {
      alert('Please enter or generate a valid temporary password (at least 6 characters).')
      return
    }

    const newUser = createUser({
      employeeId: selectedEmployee.employeeId,
      employeeName: selectedEmployee.employeeName,
      designation: selectedEmployee.designation,
      department: selectedEmployee.department,
      email: selectedEmployee.email,
      avatarInitials: selectedEmployee.avatarInitials,
      allowedFeatures: selectedFeatures,
      tempPassword: tempPassword.trim(),
      mustChangePassword,
      rolePreset,
    })

    setCreatedUser(newUser)
    setIsSuccessOpen(true)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      {/* Top Header matching Letter / Complain Management */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <button
            type="button"
            onClick={() => navigate('/users/manage')}
            className="text-gray-500 hover:text-[#801028] flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeftIcon />
            Back to User Directory
          </button>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-[#801028] inline-block" />
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create User Account</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Provision a new login account for a municipal council staff member, assign sidebar access modules, and issue initial credentials.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1: Employee Selection Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#801028]/10 text-[#801028] text-xs font-extrabold flex items-center justify-center">
                1
              </span>
              <h2 className="text-lg font-bold text-gray-900">Select Council Employee</h2>
            </div>
            {selectedEmployee && (
              <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
                <CheckIcon />
                {selectedEmployee.employeeName} ({selectedEmployee.employeeId})
              </span>
            )}
          </div>

          <p className="text-xs text-gray-500">
            Search and select an employee from the official council registry who does not yet have an active login account.
          </p>

          <div className="relative border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus-within:border-[#801028]">
            <div className="absolute left-3.5 top-3">
              <SearchIcon />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by staff name, ID (e.g. PS-EMP-0012), or department..."
              className="w-full pl-10 pr-4 py-2.5 text-sm text-gray-800 bg-transparent outline-none placeholder:text-gray-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1 pt-1">
            {filteredEmployees.map((emp) => {
              const isSelected = selectedEmployee?.employeeId === emp.employeeId
              const hasAccount = emp.status === 'Has Account'

              return (
                <div
                  key={emp.employeeId}
                  onClick={() => !hasAccount && setSelectedEmployee(emp)}
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                    hasAccount
                      ? 'bg-gray-50/80 border-gray-200 opacity-60 cursor-not-allowed'
                      : isSelected
                      ? 'bg-[#801028]/5 border-[#801028] shadow-xs cursor-pointer'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-[#801028] text-white shadow-xs'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {emp.avatarInitials || 'E'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 text-sm truncate">{emp.employeeName}</p>
                        <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-600 shrink-0">
                          {emp.employeeId}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{emp.designation}</p>
                      <p className="text-[11px] text-gray-400 truncate">{emp.department}</p>
                    </div>
                  </div>

                  <div className="shrink-0 ml-3">
                    {hasAccount ? (
                      <span className="text-[10px] font-bold bg-gray-200 text-gray-600 px-2 py-1 rounded">
                        Account Exists
                      </span>
                    ) : isSelected ? (
                      <span className="w-6 h-6 rounded-full bg-[#801028] text-white flex items-center justify-center shadow-xs">
                        <CheckIcon />
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-[#801028] border border-[#801028]/30 px-2.5 py-1 rounded-lg hover:bg-[#801028]/10">
                        Select
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* STEP 2: Sidebar Feature Permissions Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#801028]/10 text-[#801028] text-xs font-extrabold flex items-center justify-center">
                2
              </span>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Configure Sidebar Access Modules</h2>
                <p className="text-xs text-gray-500">Check the modules and sub-pages this employee will be authorized to access.</p>
              </div>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              <span className="text-xs font-bold text-gray-400 mr-1 uppercase tracking-wider">Presets:</span>
              {(['Admin', 'Manager', 'Staff', 'Clear'] as const).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-all cursor-pointer border ${getPresetButtonClass(preset, rolePreset)}`}
                >
                  {preset === 'Admin' ? 'Admin (All)' : preset}
                </button>
              ))}
            </div>
          </div>

          {/* Module Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AVAILABLE_FEATURES.map((module) => {
              const isTopSelected = selectedFeatures.includes(module.id)
              const children = module.children || []
              const selectedChildrenCount = children.filter((c) => selectedFeatures.includes(c.id)).length
              const isExpanded = expandedModules[module.id] ?? false

              return (
                <div
                  key={module.id}
                  className={`rounded-xl border transition-all flex flex-col overflow-hidden ${
                    isTopSelected
                      ? 'border-[#801028]/40 bg-[#801028]/[0.02] shadow-xs'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {/* Parent Module Header */}
                  <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <input
                        id={`module-chk-${module.id}`}
                        type="checkbox"
                        checked={isTopSelected}
                        onChange={() => toggleFeature(module.id, children.map((c) => c.id))}
                        className="w-4 h-4 text-[#801028] rounded border-gray-300 focus:ring-[#801028] cursor-pointer"
                      />
                      <label htmlFor={`module-chk-${module.id}`} className="cursor-pointer select-none font-bold text-sm text-gray-900">
                        {module.label}
                      </label>
                    </div>

                    {children.length > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(module.id)}
                        className="text-xs font-semibold text-gray-500 hover:text-gray-800 bg-white border border-gray-200 px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <span>{selectedChildrenCount}/${children.length}</span>
                        <svg
                          className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Children Sub-Routes */}
                  {children.length > 0 && isExpanded && (
                    <div className="p-3 space-y-2 bg-white flex-1">
                      {children.map((child) => {
                        const isChildSelected = selectedFeatures.includes(child.id)
                        return (
                          <div
                            key={child.id}
                            className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors cursor-pointer select-none ${
                              isChildSelected ? 'bg-[#801028]/10 text-[#801028] font-bold' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <input
                                id={`child-chk-${child.id}`}
                                type="checkbox"
                                checked={isChildSelected}
                                onChange={() => toggleChildFeature(module.id, child.id)}
                                className="w-3.5 h-3.5 text-[#801028] rounded border-gray-300 focus:ring-[#801028] cursor-pointer"
                              />
                              <label htmlFor={`child-chk-${child.id}`} className="truncate cursor-pointer flex-1 select-none font-normal">
                                {child.label}
                              </label>
                            </div>
                            {isChildSelected && <CheckIcon />}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* STEP 3: Initial Password Setup Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#801028]/10 text-[#801028] text-xs font-extrabold flex items-center justify-center">
                3
              </span>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Set Temporary Login Credentials</h2>
                <p className="text-xs text-gray-500">Issue an initial password for the employee to sign into the staff portal.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={generatePassword}
              className="text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 px-3.5 py-2 rounded-lg border border-gray-200 transition-colors flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <svg className="w-4 h-4 text-[#801028]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Auto-Generate Secure Password
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <label htmlFor="temp-password-input" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Temporary Password <span className="text-[#801028]">*</span>
              </label>
              <div className="relative">
                <input
                  id="temp-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  placeholder="e.g. Sabha@4821 or click Auto-Generate"
                  required
                  minLength={6}
                  className="w-full pl-4 pr-12 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-mono text-gray-900 focus:ring-2 focus:ring-[#801028] outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-gray-500 mt-1.5">
                Must be at least 6 characters long. Give this exact password to the employee.
              </p>
            </div>

            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-3 p-3.5 bg-gray-50 border border-gray-200 rounded-lg">
                <input
                  id="must-change-password-chk"
                  type="checkbox"
                  checked={mustChangePassword}
                  onChange={(e) => setMustChangePassword(e.target.checked)}
                  className="w-4 h-4 text-[#801028] rounded border-gray-300 focus:ring-[#801028] cursor-pointer shrink-0"
                />
                <label htmlFor="must-change-password-chk" className="cursor-pointer select-none flex-1 min-w-0">
                  <span className="block text-xs font-bold text-gray-900">Require password change on first login</span>
                  <span className="block text-[11px] text-gray-500 mt-0.5 font-normal">Employee will be prompted to create their own private password upon signing in.</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Action Bar */}
        <div className="flex items-center justify-end gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <button
            type="button"
            onClick={() => navigate('/users/manage')}
            className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#801028] hover:bg-[#600a1c] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer"
          >
            <CheckIcon />
            Create &amp; Provision User Account
          </button>
        </div>
      </form>

      {/* Success Confirmation & Password Copy Modal */}
      <ResetPasswordModal
        user={createdUser}
        newPassword={tempPassword}
        isOpen={isSuccessOpen}
        onClose={() => {
          setIsSuccessOpen(false)
          navigate('/users/manage')
        }}
      />
    </div>
  )
}
