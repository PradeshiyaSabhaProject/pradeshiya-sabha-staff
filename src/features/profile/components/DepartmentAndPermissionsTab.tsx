import React from 'react'
import type { DepartmentInfo, UserBioProfile } from '../types'

interface DepartmentAndPermissionsTabProps {
  department: DepartmentInfo
  profile: UserBioProfile
  role?: string
}

const BuildingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-[#801028]">
    <path d="M3 21h18" />
    <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
    <path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
  </svg>
)

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-amber-600">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-blue-600">
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

export const DepartmentAndPermissionsTab: React.FC<DepartmentAndPermissionsTabProps> = ({
  department,
  profile,
  role,
}) => {
  const isAdmin = role === 'admin' || role === 'superadmin'

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Card: Department Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-xl bg-[#801028]/10 border border-[#801028]/20 shrink-0">
            <BuildingIcon />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">{department.name}</h3>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded uppercase ${
                isAdmin ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {isAdmin ? 'Executive Control Level' : 'Council Staff Division'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1 flex flex-wrap items-center gap-3 font-medium">
              <span>{department.location}</span>
              <span>•</span>
              <span className="font-mono text-gray-700">{department.roomNumber}</span>
              <span>•</span>
              <span className="font-mono text-[#801028] font-bold">Ext: {department.contactExtension}</span>
            </p>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-700 shrink-0 w-full md:w-auto">
          <p className="font-bold uppercase text-[10px] text-gray-400">Head of Department / Supervisor</p>
          <p className="font-bold text-gray-900 text-sm mt-0.5">{department.headOfDepartment}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">Assigned to {profile.fullName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 column: Security Clearances */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
            <div className="p-1.5 rounded bg-amber-50">
              <ShieldIcon />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Authorized Clearances</h3>
              <p className="text-xs text-gray-500">Official administrative authorities</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {department.clearances.map((clearance, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-200 flex items-start gap-3 shadow-2xs"
              >
                <div className="shrink-0 mt-0.5">
                  <CheckCircleIcon />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-gray-800 leading-snug">{clearance}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 font-mono">Status: Verified by HR & Legal</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-100 text-center">
            <p className="text-[11px] text-gray-400 italic">
              Clearance modifications require formal approval from Council Secretary or Chairman.
            </p>
          </div>
        </div>

        {/* Right 2 columns: Assigned Modules Grid */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded bg-blue-50">
                <GridIcon />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Assigned Portal Modules & Access Level</h3>
                <p className="text-xs text-gray-500">Role-based privileges configured for {profile.empId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-gray-600 font-medium">Enabled</span>
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-gray-300 ml-2"></span>
              <span className="text-gray-600 font-medium">Restricted</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {department.assignedModules.map((mod) => (
              <div
                key={mod.code}
                className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                  mod.enabled
                    ? 'bg-white border-gray-200 hover:border-gray-300 shadow-2xs'
                    : 'bg-gray-50 border-gray-200/60 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full shrink-0 ${
                      mod.enabled ? 'bg-[#801028]' : 'bg-gray-300'
                    }`}
                  />
                  <div>
                    <h4 className="font-bold text-xs text-gray-900">{mod.name}</h4>
                    <p className="font-mono text-[10px] text-gray-400">{mod.code}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      !mod.enabled
                        ? 'bg-gray-200 text-gray-600'
                        : mod.permissionLevel === 'Full Admin'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : mod.permissionLevel === 'Write & Approve'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}
                  >
                    {mod.enabled ? mod.permissionLevel : 'Locked'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
export default DepartmentAndPermissionsTab
