import { useState, useEffect, useMemo, useCallback } from 'react'
import type { AppUser, CouncilEmployeeOption } from '../types'
import { INITIAL_APP_USERS, AVAILABLE_EMPLOYEES } from '../data/mockUserData'

const STORAGE_KEY = 'pradeshiya_users_list'

export const useUserManagement = () => {
  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // Fallback to initial
      }
    }
    return INITIAL_APP_USERS
  })

  // Save to localStorage when state updates
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
  }, [users])

  // Compute available employees with dynamic account status
  const availableEmployees = useMemo<CouncilEmployeeOption[]>(() => {
    const accountMap = new Set(users.map((u) => u.employeeId))
    return AVAILABLE_EMPLOYEES.map((emp) => ({
      ...emp,
      status: accountMap.has(emp.employeeId) ? 'Has Account' : 'Available',
    }))
  }, [users])

  // Create new user account
  const createUser = useCallback((payload: {
    employeeId: string
    employeeName: string
    designation: string
    department: string
    email: string
    avatarInitials: string
    allowedFeatures: string[]
    tempPassword: string
    mustChangePassword: boolean
    rolePreset: 'Admin' | 'Manager' | 'Staff' | 'Custom'
  }) => {
    const newId = `USR-${new Date().getFullYear()}-${String(users.length + 1).padStart(3, '0')}`
    const newUser: AppUser = {
      id: newId,
      employeeId: payload.employeeId,
      employeeName: payload.employeeName,
      designation: payload.designation,
      department: payload.department,
      email: payload.email,
      avatarInitials: payload.avatarInitials,
      allowedFeatures: payload.allowedFeatures,
      tempPassword: payload.tempPassword,
      mustChangePassword: payload.mustChangePassword,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
      rolePreset: payload.rolePreset
    }
    setUsers((prev) => [newUser, ...prev])
    return newUser
  }, [users.length])

  // Update permissions for a user
  const updatePermissions = useCallback((userId: string, newAllowedFeatures: string[]) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, allowedFeatures: newAllowedFeatures } : u))
    )
  }, [])

  // Reset temporary password
  const resetPassword = useCallback((userId: string, newPassword: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, tempPassword: newPassword, mustChangePassword: true }
          : u
      )
    )
  }, [])

  // Toggle account status
  const updateStatus = useCallback((userId: string, newStatus: 'Active' | 'Suspended' | 'Deactivated') => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    )
  }, [])

  // Delete user account
  const deleteUser = useCallback((userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId))
  }, [])

  return {
    users,
    availableEmployees,
    createUser,
    updatePermissions,
    resetPassword,
    updateStatus,
    deleteUser
  }
}
