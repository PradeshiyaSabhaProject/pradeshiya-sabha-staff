/**
 * Utilities for managing application deadline and assignment statuses
 */

export interface ApplicationDeadline {
  status: string
  dueDate: string
}

export interface ApplicationAssignment {
  assignedInspector?: string
  assignedOfficer?: string
}

export const calculateDaysRemaining = (dueDate: string): number => {
  if (!dueDate) return 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const parts = dueDate.split('-')
  let deadline: Date
  if (parts.length === 3) {
    const [year, month, day] = parts.map(Number)
    deadline = new Date(year, month - 1, day)
  } else {
    deadline = new Date(dueDate)
  }
  deadline.setHours(0, 0, 0, 0)

  const timeDiff = deadline.getTime() - today.getTime()
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
}

export const getDeadlineStatusLabel = (dueDate: string): string => {
  if (!dueDate) return ''

  const daysRemaining = calculateDaysRemaining(dueDate)

  if (daysRemaining < 0) return 'Overdue'
  if (daysRemaining === 0) return 'Due Today'
  if (daysRemaining === 1) return '01 day left'

  return `${String(daysRemaining).padStart(2, '0')} days left`
}

export const getDeadlineStatus = (
  application: ApplicationDeadline,
  _isAssignedToCurrentTO: boolean
): string => {
  void _isAssignedToCurrentTO
  if (!application) return ''
  const inactiveStatuses = ['APPROVED', 'REJECTED', 'RETURNED']
  if (inactiveStatuses.includes(application.status?.toUpperCase())) {
    return ''
  }
  return getDeadlineStatusLabel(application.dueDate)
}

export const getDeadlineStatusStyleClasses = (dueDateOrStatus: string): string => {
  if (!dueDateOrStatus) return ''

  if (dueDateOrStatus.includes('-') || /\d/.test(dueDateOrStatus)) {
    const daysRemaining = calculateDaysRemaining(dueDateOrStatus)

    if (daysRemaining <= 2) {
      return 'text-white bg-red-600 border-red-700'
    }

    if (daysRemaining >= 3 && daysRemaining <= 4) {
      return 'text-white bg-orange-500 border-orange-600'
    }

    return 'text-white bg-green-600 border-green-700'
  }

  const statusUpper = dueDateOrStatus.toUpperCase()
  if (statusUpper === 'PENDING') return 'text-white bg-red-600 border-red-700'
  if (statusUpper === 'REVIEWING') return 'text-white bg-orange-500 border-orange-600'
  if (statusUpper === 'INSPECTION') return 'text-white bg-indigo-600 border-indigo-700'

  return 'text-white bg-gray-600 border-gray-700'
}

export const isApplicationAssignedToCurrentOfficer = (
  application: ApplicationAssignment & { status?: string },
  currentOfficerName: string,
  userRole?: string
): boolean => {
  if (!currentOfficerName && !userRole) return false
  const currentNameLower = currentOfficerName ? currentOfficerName.toLowerCase().trim() : ''
  if (application.assignedInspector && application.assignedInspector.toLowerCase().trim() === currentNameLower) {
    return true
  }
  if (application.assignedOfficer && application.assignedOfficer.toLowerCase().trim() === currentNameLower) {
    return true
  }
  if (application.assignedOfficer && application.assignedOfficer.toLowerCase().includes('manager')) {
    return true
  }
  if (userRole === 'manager' || userRole === 'admin' || userRole === 'superadmin' || currentNameLower.includes('admin') || currentNameLower.includes('manager')) {
    return true
  }
  return false
}
