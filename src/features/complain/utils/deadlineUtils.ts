/**
 * Utilities for managing complaint deadline statuses
 */

export interface ComplaintDeadline {
  status: string
  dueDate: string
}

export interface ComplaintAssignment {
  assignedTechnician?: string
  assignedOfficer?: string
}

/**
 * Calculates the number of days remaining until the deadline
 * @param dueDate - The deadline date in YYYY-MM-DD format
 * @returns The number of days remaining (can be negative if deadline has passed)
 */
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
  const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

  return daysRemaining
}

/**
 * Determines the deadline status indicator based on days remaining
 * @param dueDate - The deadline date in YYYY-MM-DD format
 * @returns The deadline status string or empty string if no due date
 */
export const getDeadlineStatusLabel = (dueDate: string): string => {
  if (!dueDate) return ''

  const daysRemaining = calculateDaysRemaining(dueDate)

  if (daysRemaining < 0) return 'Overdue'
  if (daysRemaining === 0) return 'Due Today'
  if (daysRemaining === 1) return '01 day left'

  return `${String(daysRemaining).padStart(2, '0')} days left`
}

/**
 * Determines the deadline status indicator for a complaint
 * @param complaint - The complaint with status and due date
 * @param _isAssignedToCurrentTO - Whether the complaint is assigned to the current Technical Officer
 * @returns The deadline status string or empty string if complaint is not active
 */
export const getDeadlineStatus = (
  complaint: ComplaintDeadline,
  _isAssignedToCurrentTO: boolean
): string => {
  if (!complaint) return ''
  const inactiveStatuses = ['COMPLETED', 'REJECTED', 'NO-SHOW']
  if (inactiveStatuses.includes(complaint.status?.toUpperCase())) {
    return ''
  }
  return getDeadlineStatusLabel(complaint.dueDate)
}

/**
 * Returns the styling classes for deadline status badges based on days remaining or status
 * @param dueDateOrStatus - The deadline date in YYYY-MM-DD format or status string
 * @returns CSS classes for styling the badge
 */
export const getDeadlineStatusStyleClasses = (dueDateOrStatus: string): string => {
  if (!dueDateOrStatus) return ''

  // If a date string is passed
  if (dueDateOrStatus.includes('-') || /\d/.test(dueDateOrStatus)) {
    const daysRemaining = calculateDaysRemaining(dueDateOrStatus)

    // Overdue, Due Today, or 1-2 days left: Red label with white text
    if (daysRemaining <= 2) {
      return 'text-white bg-red-600 border-red-700'
    }

    // 3-4 days: Orange label with white text
    if (daysRemaining >= 3 && daysRemaining <= 4) {
      return 'text-white bg-orange-500 border-orange-600'
    }

    // 5+ days: Green label with white text
    return 'text-white bg-green-600 border-green-700'
  }

  // Fallback if status string is passed
  const statusUpper = dueDateOrStatus.toUpperCase()
  if (statusUpper === 'PENDING') return 'text-white bg-red-600 border-red-700'
  if (statusUpper === 'REVIEWING') return 'text-white bg-orange-500 border-orange-600'
  if (statusUpper === 'IN PROGRESS') return 'text-white bg-green-600 border-green-700'

  return 'text-white bg-gray-600 border-gray-700'
}

/**
 * Checks if a complaint is assigned to the current Technical Officer
 * @param complaint - The complaint to check
 * @param currentTOName - The name of the current Technical Officer (case-insensitive)
 * @returns Whether the complaint is assigned to the current TO
 */
export const isComplaintAssignedToCurrentTO = (
  complaint: ComplaintAssignment,
  currentTOName: string
): boolean => {
  if (!currentTOName) {
    return false
  }

  const currentNameLower = currentTOName.toLowerCase().trim()
  
  // Check if assigned to current TO (using assignedTechnician field)
  if (complaint.assignedTechnician) {
    const technicianNameLower = complaint.assignedTechnician.toLowerCase().trim()
    if (technicianNameLower === currentNameLower) {
      return true
    }
  }

  return false
}

