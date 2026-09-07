import React from 'react'
import type { DepartmentInfo, UserBioProfile } from '../types'

interface DepartmentAndPermissionsTabProps {
  department: DepartmentInfo
  profile: UserBioProfile
  role?: string
}

const BuildingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-[#A31736]">
    <path d="M3 21h18" />
    <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
    <path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
  </svg>
)

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-amber-600">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-blue-600">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-emerald-600">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const getPermissionBadgeStyle = (enabled: boolean, permissionLevel?: string): string => {
  if (!enabled) {
    return 'bg-gray-100 text-gray-500 border border-gray-300'
  }
  if (permissionLevel === 'Full Admin') {
    return 'bg-purple-50 text-purple-700 border border-purple-200'
  }
  if (permissionLevel === 'Write & Approve') {
    return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
  }
  return 'bg-blue-50 text-blue-700 border border-blue-200'
}

export const DepartmentAndPermissionsTab: React.FC<DepartmentAndPermissionsTabProps> = ({
  department,
  profile,
  role,
}) => {
  const isAdmin = role === 'admin' || role === 'superadmin'

  return (
    <div className="space-y-6">
      {/* Top Card: Department Header */}
      <div className="bg-white border border-gray-300 rounded p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded bg-[#A31736]/10 border border-[#A31736]/20 shrink-0">
            <BuildingIcon />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900 tracking-tight uppercase">{department.name}</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                isAdmin ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-[#A31736]/10 text-[#A31736] border border-[#A31736]/20'
              }`}>
                {isAdmin ? 'Executive Control Level' : 'Council Staff Division'}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1 flex flex-wrap items-center gap-3 font-medium">
              <span>{department.location}</span>
              <span>•</span>
              <span className="font-mono text-gray-700">{department.roomNumber}</span>
              <span>•</span>
              <span className="font-mono text-[#A31736] font-bold">Ext: {department.contactExtension}</span>
            </p>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-300 rounded p-3.5 text-xs text-gray-700 shrink-0 w-full md:w-auto">
          <p className="font-bold uppercase text-[10px] text-gray-500 tracking-wider">Head of Department / Supervisor</p>
          <p className="font-bold text-gray-900 text-sm mt-0.5">{department.headOfDepartment}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">Assigned to {profile.fullName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 column: Security Clearances */}
        <div className="bg-white border border-gray-300 rounded p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-gray-200 pb-3">
            <div className="p-1.5 rounded bg-amber-50">
              <ShieldIcon />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Authorized Clearances</h3>
              <p className="text-[11px] text-gray-500">Official administrative authorities</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {department.clearances.map((clearance) => (
              <div
                key={clearance}
                className="p-3 rounded bg-gray-50 border border-gray-200 flex items-start gap-2.5"
              >
                <div className="shrink-0 mt-0.5">
                  <CheckCircleIcon />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-gray-900 leading-snug">{clearance}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5 font-mono">Status: Verified by HR & Legal</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-200 text-center">
            <p className="text-[11px] text-gray-500 italic">
              Clearance modifications require formal approval from Council Secretary or Chairman.
            </p>
          </div>
        </div>

        {/* Right 2 columns: Assigned Modules Grid */}
        <div className="lg:col-span-2 bg-white border border-gray-300 rounded p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded bg-blue-50">
                <GridIcon />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Assigned Portal Modules & Access Level</h3>
                <p className="text-[11px] text-gray-500">Role-based privileges configured for {profile.empId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-gray-600 font-medium text-[11px]">Enabled</span>
              <span className="inline-block w-2 h-2 rounded-full bg-gray-300 ml-2"></span>
              <span className="text-gray-600 font-medium text-[11px]">Restricted</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {department.assignedModules.map((mod) => {
              const dotBgClass = mod.enabled ? 'bg-[#A31736]' : 'bg-gray-300'
              return (
                <div
                  key={mod.code}
                  className={`p-3.5 rounded border transition-all flex items-center justify-between ${
                    mod.enabled
                      ? 'bg-white border-gray-300 hover:border-gray-400 shadow-sm'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${dotBgClass}`} />
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">{mod.name}</h4>
                      <p className="font-mono text-[10px] text-gray-500">{mod.code}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getPermissionBadgeStyle(
                        mod.enabled,
                        mod.permissionLevel
                      )}`}
                    >
                      {mod.enabled ? mod.permissionLevel : 'Locked'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
export default DepartmentAndPermissionsTab
