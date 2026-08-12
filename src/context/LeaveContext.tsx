import React, { createContext, useContext, useState } from 'react'
import {
  MOCK_LEAVE_REQUESTS,
  MOCK_LEAVE_BALANCES,
  type LeaveRequest,
  type LeaveBalance
} from '../features/attendance/data/mockAttendanceData'

interface ApplyLeaveInput {
  employeeId?: string
  employeeName?: string
  designation?: string
  department?: string
  leaveType: LeaveRequest['leaveType']
  startDate: string
  endDate: string
  daysCount: number
  reason: string
  handoverOfficer?: string
}

interface LeaveContextType {
  leaveRequests: LeaveRequest[]
  leaveBalances: LeaveBalance[]
  applyLeave: (input: ApplyLeaveInput) => void
  cancelLeave: (requestId: string, reason: string) => void
  approveLevel: (requestId: string, levelNumber: 1 | 2 | 3, approverName?: string, comments?: string) => void
  rejectLevel: (requestId: string, levelNumber: 1 | 2 | 3, approverName: string, rejectionReason: string) => void
  recordUnauthorizedAbsence: (input: {
    employeeId: string
    employeeName: string
    department: string
    designation: string
    startDate: string
    endDate: string
    daysCount: number
    reason: string
  }) => void
}

const LeaveContext = createContext<LeaveContextType | undefined>(undefined)

// Default employee logged in for self-service actions
const CURRENT_USER = {
  employeeId: 'PS-EMP-0012',
  employeeName: 'Kasun Perera',
  designation: 'Senior Revenue Inspector',
  department: 'Revenue & Finance Department',
  avatarInitials: 'KP'
}

export const LeaveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    // Augment initial mock data with required baseline fields
    return MOCK_LEAVE_REQUESTS.map((req) => ({
      ...req,
      avatarInitials: req.avatarInitials || req.employeeName.split(' ').map((n) => n[0]).join('').slice(0, 2),
      handoverOfficer: req.handoverOfficer || 'Ruwan Kumara (Accountant)'
    })) as LeaveRequest[]
  })

  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>(MOCK_LEAVE_BALANCES)

  // Helper to adjust leave balance
  const adjustBalance = (
    employeeId: string,
    leaveType: LeaveRequest['leaveType'],
    days: number,
    action: 'deduct' | 'restore'
  ) => {
    setLeaveBalances((prev) =>
      prev.map((bal) => {
        if (bal.employeeId !== employeeId) return bal
        const key =
          leaveType === 'Annual Leave'
            ? 'annual'
            : leaveType === 'Casual Leave'
            ? 'casual'
            : leaveType === 'Medical Leave'
            ? 'medical'
            : leaveType === 'Duty Leave'
            ? 'duty'
            : leaveType.includes('Comp-Off')
            ? 'compOff'
            : null

        if (!key || !bal[key]) return bal

        const factor = action === 'deduct' ? 1 : -1
        const newUsed = Math.max(0, bal[key].used + days * factor)
        const newRemaining = Math.max(0, bal[key].total - newUsed)

        return {
          ...bal,
          [key]: {
            ...bal[key],
            used: newUsed,
            remaining: newRemaining
          }
        }
      })
    )
  }

  const applyLeave = (input: ApplyLeaveInput) => {
    const randomNum = Math.floor(100 + Math.random() * 900)
    const empId = input.employeeId || CURRENT_USER.employeeId
    const empName = input.employeeName || CURRENT_USER.employeeName
    const desig = input.designation || CURRENT_USER.designation
    const dept = input.department || CURRENT_USER.department

    const newRequest: LeaveRequest = {
      id: `LV-2026-${randomNum}`,
      employeeId: empId,
      employeeName: empName,
      designation: desig,
      department: dept,
      avatarInitials: empName.split(' ').map((n) => n[0]).join('').slice(0, 2),
      leaveType: input.leaveType,
      startDate: input.startDate,
      endDate: input.endDate,
      daysCount: input.daysCount,
      reason: input.reason,
      handoverOfficer: input.handoverOfficer || 'Subject Clerk (Assigned)',
      appliedOn: new Date().toISOString().split('T')[0],
      overallStatus: 'Pending Level 1',
      approvalLevels: [
        {
          levelNumber: 1,
          roleName: 'Line Supervisor / Engineer',
          approverName: 'Eng. S. Bandara',
          status: 'Pending',
          comments: 'Awaiting initial recommendation.'
        },
        {
          levelNumber: 2,
          roleName: 'Head of Department',
          approverName: 'Chief Revenue Officer',
          status: 'Waiting'
        },
        {
          levelNumber: 3,
          roleName: 'Secretary / HR',
          approverName: 'Municipal Secretary',
          status: 'Waiting'
        }
      ]
    }

    setLeaveRequests((prev) => [newRequest, ...prev])
    adjustBalance(empId, input.leaveType, input.daysCount, 'deduct')
  }

  const cancelLeave = (requestId: string, reason: string) => {
    const timestamp = new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })

    setLeaveRequests((prev) =>
      prev.map((req) => {
        if (req.id !== requestId) return req

        // If paid leave was deducted/reserved, restore balance
        if (req.overallStatus !== 'Rejected (Unauthorized No-Pay Leave)' && req.leaveType !== 'No-Pay Leave') {
          adjustBalance(req.employeeId, req.leaveType, req.daysCount, 'restore')
        }

        const updatedLevels: LeaveRequest['approvalLevels'] = req.approvalLevels.map((lvl) => ({
          ...lvl,
          status: lvl.status === 'Approved' ? 'Approved' : 'Cancelled'
        }))

        return {
          ...req,
          overallStatus: 'Cancelled by Employee',
          approvalLevels: updatedLevels,
          cancelledAt: timestamp,
          cancellationReason: reason
        }
      })
    )
  }

  const approveLevel = (requestId: string, levelNumber: 1 | 2 | 3, approverName?: string, comments?: string) => {
    const timestamp = new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })

    setLeaveRequests((prev) =>
      prev.map((req) => {
        if (req.id !== requestId) return req

        const updatedLevels = req.approvalLevels.map((lvl) => {
          if (lvl.levelNumber === levelNumber) {
            return {
              ...lvl,
              status: 'Approved' as const,
              approverName: approverName || lvl.approverName,
              timestamp,
              comments: comments || 'Recommendation approved and signed.'
            }
          }
          if (lvl.levelNumber === levelNumber + 1) {
            return {
              ...lvl,
              status: 'Pending' as const
            }
          }
          return lvl
        })

        const isFullyApproved = levelNumber === 3 || updatedLevels.every((l) => l.status === 'Approved')
        const nextStatus = isFullyApproved ? 'Approved' : (`Pending Level ${levelNumber + 1}` as LeaveRequest['overallStatus'])

        return {
          ...req,
          approvalLevels: updatedLevels,
          overallStatus: nextStatus
        }
      })
    )
  }

  const rejectLevel = (requestId: string, levelNumber: 1 | 2 | 3, approverName: string, rejectionReason: string) => {
    const timestamp = new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })

    setLeaveRequests((prev) =>
      prev.map((req) => {
        if (req.id !== requestId) return req

        // When superior rejects, paid leave entitlement is restored and charged as Unauthorized No-Pay Leave
        adjustBalance(req.employeeId, req.leaveType, req.daysCount, 'restore')

        const updatedLevels = req.approvalLevels.map((lvl) => {
          if (lvl.levelNumber === levelNumber) {
            return {
              ...lvl,
              status: 'Rejected' as const,
              approverName,
              timestamp,
              comments: `REJECTED: ${rejectionReason}`
            }
          }
          if (lvl.levelNumber > levelNumber) {
            return {
              ...lvl,
              status: 'Waiting' as const
            }
          }
          return lvl
        })

        return {
          ...req,
          overallStatus: 'Rejected (Unauthorized No-Pay Leave)',
          isUnauthorizedNoPay: true,
          rejectionReason,
          rejectedBy: `${approverName} (Level ${levelNumber})`,
          approvalLevels: updatedLevels
        }
      })
    )
  }

  const recordUnauthorizedAbsence = (input: {
    employeeId: string
    employeeName: string
    department: string
    designation: string
    startDate: string
    endDate: string
    daysCount: number
    reason: string
  }) => {
    const randomNum = Math.floor(100 + Math.random() * 900)
    const timestamp = new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })

    const newRequest: LeaveRequest = {
      id: `LV-UNAUTH-${randomNum}`,
      employeeId: input.employeeId,
      employeeName: input.employeeName,
      designation: input.designation,
      department: input.department,
      avatarInitials: input.employeeName.split(' ').map((n) => n[0]).join('').slice(0, 2),
      leaveType: 'No-Pay Leave',
      startDate: input.startDate,
      endDate: input.endDate,
      daysCount: input.daysCount,
      reason: input.reason || 'Unexcused absence logged by HR / Superior',
      appliedOn: new Date().toISOString().split('T')[0],
      overallStatus: 'Rejected (Unauthorized No-Pay Leave)',
      isUnauthorizedNoPay: true,
      rejectionReason: 'Absence declared unauthorized by Superior / HR Admin. Subject to pay-cut penalty.',
      rejectedBy: 'HR Secretary / Head of Department',
      approvalLevels: [
        {
          levelNumber: 1,
          roleName: 'Line Supervisor',
          approverName: 'Department Head',
          status: 'Rejected',
          timestamp,
          comments: 'Unapproved absence logged as Unauthorized No-Pay Leave.'
        },
        {
          levelNumber: 2,
          roleName: 'Head of Department',
          approverName: 'HOD',
          status: 'Rejected',
          timestamp
        },
        {
          levelNumber: 3,
          roleName: 'Secretary / HR',
          approverName: 'Municipal Secretary',
          status: 'Rejected',
          timestamp,
          comments: 'Salary deduction order issued.'
        }
      ]
    }

    setLeaveRequests((prev) => [newRequest, ...prev])
  }

  return (
    <LeaveContext.Provider
      value={{
        leaveRequests,
        leaveBalances,
        applyLeave,
        cancelLeave,
        approveLevel,
        rejectLevel,
        recordUnauthorizedAbsence
      }}
    >
      {children}
    </LeaveContext.Provider>
  )
}

export const useLeave = () => {
  const context = useContext(LeaveContext)
  if (!context) {
    throw new Error('useLeave must be used within a LeaveProvider')
  }
  return context
}
