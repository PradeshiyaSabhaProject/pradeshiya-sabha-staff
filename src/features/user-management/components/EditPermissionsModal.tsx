import React, { useState } from 'react'
import { AVAILABLE_FEATURES } from '../types'
import type { AppUser } from '../types'

interface EditPermissionsModalProps {
  user: AppUser | null
  isOpen: boolean
  onClose: () => void
  onSave: (userId: string, newFeatures: string[]) => void
}

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export const EditPermissionsModal: React.FC<EditPermissionsModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
}) => {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    attendance: true,
    appointments: true,
    assets: true,
    fleet: true,
    complaints: true,
    letters: true,
    'user-management': true,
  })
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)
  const [prevUserId, setPrevUserId] = useState(user?.id)

  if (isOpen !== prevIsOpen || user?.id !== prevUserId) {
    setPrevIsOpen(isOpen)
    setPrevUserId(user?.id)
    if (user && isOpen) {
      setSelectedFeatures([...user.allowedFeatures])
    }
  }

  if (!isOpen || !user) return null

  const toggleFeature = (featureId: string, childrenIds?: string[]) => {
    const isSelected = selectedFeatures.includes(featureId)
    if (isSelected) {
      const toRemove = new Set([featureId, ...(childrenIds || [])])
      setSelectedFeatures((prev) => prev.filter((id) => !toRemove.has(id)))
    } else {
      const toAdd = [featureId, ...(childrenIds || [])]
      setSelectedFeatures((prev) => Array.from(new Set([...prev, ...toAdd])))
    }
  }

  const toggleChildFeature = (parentId: string, childId: string) => {
    const isSelected = selectedFeatures.includes(childId)
    if (isSelected) {
      setSelectedFeatures((prev) => prev.filter((id) => id !== childId))
    } else {
      setSelectedFeatures((prev) => Array.from(new Set([...prev, parentId, childId])))
    }
  }

  const toggleExpand = (moduleId: string) => {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }))
  }

  const handlePreset = (preset: 'All' | 'Staff' | 'Clear') => {
    if (preset === 'Clear') {
      setSelectedFeatures([])
    } else if (preset === 'All') {
      const all: string[] = []
      AVAILABLE_FEATURES.forEach((f) => {
        all.push(f.id)
        if (f.children) {
          f.children.forEach((c) => all.push(c.id))
        }
      })
      setSelectedFeatures(all)
    } else if (preset === 'Staff') {
      const staffList = [
        'overview',
        'attendance', 'attendance_dashboard', 'attendance_timecards', 'attendance_myleave', 'attendance_corrections',
        'complaints', 'complaints_my',
        'letters', 'letters_my', 'letters_write',
        'profile'
      ]
      setSelectedFeatures(staffList)
    }
  }

  const handleSave = () => {
    onSave(user.id, selectedFeatures)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-300">
        
        {/* Clean Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded bg-[#A31736]/10 border border-[#A31736]/20 flex items-center justify-center font-bold text-[#A31736] text-xs shrink-0">
              {user.avatarInitials || 'U'}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-gray-900 uppercase tracking-tight truncate">Manage Sidebar Access Permissions</h2>
              <p className="text-xs text-gray-500 truncate">
                Configure module authorizations for <span className="font-bold text-gray-800">{user.employeeName}</span> ({user.designation})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded transition-colors cursor-pointer shrink-0"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="bg-gray-50/50 px-5 py-2.5 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Quick Presets:</span>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handlePreset('All')}
              className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              Select All (Admin)
            </button>
            <button
              type="button"
              onClick={() => handlePreset('Staff')}
              className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition-colors cursor-pointer"
            >
              Standard Staff
            </button>
            <button
              type="button"
              onClick={() => handlePreset('Clear')}
              className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-gray-200 text-gray-700 border border-gray-300 rounded hover:bg-gray-300 transition-colors cursor-pointer"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Permissions Grid */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {AVAILABLE_FEATURES.map((feature) => {
              const isChecked = selectedFeatures.includes(feature.id)
              const childrenIds = feature.children?.map((c) => c.id) || []
              const hasChildren = feature.children && feature.children.length > 0
              const isExpanded = expandedModules[feature.id]
              const checkedChildrenCount = childrenIds.filter((id) => selectedFeatures.includes(id)).length

              return (
                <div
                  key={feature.id}
                  className={`border rounded transition-all overflow-hidden ${
                    isChecked
                      ? 'border-[#A31736]/40 bg-[#A31736]/[0.02] shadow-xs'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="p-3 flex items-start justify-between gap-3 bg-gray-50/60 border-b border-gray-100">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <input
                        id={`feature-chk-${feature.id}`}
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleFeature(feature.id, childrenIds)}
                        className="mt-0.5 w-4 h-4 text-[#A31736] border-gray-300 rounded focus:ring-[#A31736] cursor-pointer shrink-0"
                      />
                      <label
                        htmlFor={`feature-chk-${feature.id}`}
                        className="flex-1 min-w-0 cursor-pointer select-none"
                      >
                        <span className="block font-bold text-xs text-gray-900 truncate">{feature.label}</span>
                        <span className="block text-[11px] text-gray-500 mt-0.5 line-clamp-2 font-normal">{feature.description}</span>
                      </label>
                    </div>

                    {hasChildren && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(feature.id)}
                        className="text-[11px] font-semibold px-2 py-0.5 bg-white border border-gray-200 rounded hover:bg-gray-100 flex items-center gap-1 shrink-0 text-gray-600 cursor-pointer"
                      >
                        <span>{checkedChildrenCount}/{childrenIds.length}</span>
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

                  {/* Children list */}
                  {hasChildren && isExpanded && (
                    <div className="p-2.5 bg-white space-y-1">
                      {feature.children?.map((child) => {
                        const childChecked = selectedFeatures.includes(child.id)
                        return (
                          <div
                            key={child.id}
                            className={`flex items-center justify-between p-1.5 rounded text-xs transition-colors cursor-pointer select-none ${
                              childChecked ? 'bg-[#A31736]/10 text-[#A31736] font-bold' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <input
                                id={`child-chk-${child.id}`}
                                type="checkbox"
                                checked={childChecked}
                                onChange={() => toggleChildFeature(feature.id, child.id)}
                                className="w-3.5 h-3.5 text-[#A31736] border-gray-300 rounded focus:ring-[#A31736] cursor-pointer shrink-0"
                              />
                              <label
                                htmlFor={`child-chk-${child.id}`}
                                className="truncate cursor-pointer flex-1 select-none font-normal"
                              >
                                {child.label}
                              </label>
                            </div>
                            {childChecked && <CheckIcon />}
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

        {/* Footer */}
        <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3">
          <div className="text-xs text-gray-500">
            <span className="font-bold text-gray-900">{selectedFeatures.length}</span> permissions selected
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded transition-colors cursor-pointer uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-[#A31736] hover:bg-[#801028] text-white rounded text-xs font-bold uppercase tracking-wider shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckIcon />
              Save Permissions
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
