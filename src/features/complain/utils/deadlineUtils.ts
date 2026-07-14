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
  const today = new Date('2026-06-11') // Fixed today's date
  today.setHours(0, 0, 0, 0)
  
  const deadline = new Date(dueDate)
  deadline.setHours(0, 0, 0, 0)
  
  const timeDiff = deadline.getTime() - today.getTime()
  const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
  
  return daysRemaining
}

/**
 * Determines the deadline status indicator based on days remaining
 * @param dueDate - The deadline date in YYYY-MM-DD format
 * @returns The deadline status string or empty string if deadline has passed
 */
export const getDeadlineStatusLabel = (dueDate: string): string => {
  if (!dueDate) return ''
  
  const daysRemaining = calculateDaysRemaining(dueDate)
  
  if (daysRemaining <= 0) return '' // Deadline passed
  if (daysRemaining === 1) return '01 day left'
  if (daysRemaining === 2) return '02 days left'
  if (daysRemaining === 3) return '03 days left'
  if (daysRemaining === 4) return '04 days left'
  if (daysRemaining === 5) return '05 days left'
  if (daysRemaining === 6) return '06 days left'
  if (daysRemaining === 7) return '07 days left'
  
  return '' // More than 7 days
}

/**
 * Determines the deadline status indicator for a complaint
 * @param complaint - The complaint with status and due date
 * @param _isAssignedToCurrentTO - Whether the complaint is assigned to the current Technical Officer
 * @returns The deadline status string or empty string if not assigned to current TO
 */
export const getDeadlineStatus = (
  complaint: ComplaintDeadline,
  _isAssignedToCurrentTO: boolean
): string => {
  // Don't show deadline status for these statuses
  const hiddenStatuses = ['APPROVED', 'REJECTED', 'COMPLETED', 'NO-SHOW', 'RESCHEDULED']
  if (hiddenStatuses.includes(complaint.status)) {
    return ''
  }
  return getDeadlineStatusLabel(complaint.dueDate)
}

/**
 * Calculates the number of days remaining until the deadline
 * @param dueDate - The deadline date in YYYY-MM-DD format
 * @returns The number of days remaining (can be negative if deadline has passed)
 */
export const calculateDaysRemaining = (dueDate: string): number => {
  const today = new Date('2026-06-11') // Fixed today's date
  today.setHours(0, 0, 0, 0)
  
  const deadline = new Date(dueDate)
  deadline.setHours(0, 0, 0, 0)
  
  const timeDiff = deadline.getTime() - today.getTime()
  const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
  
  return daysRemaining
}

/**
 * Determines the deadline status indicator based on days remaining
 * @param dueDate - The deadline date in YYYY-MM-DD format
 * @returns The deadline status string or empty string if deadline has passed
 */
export const getDeadlineStatusLabel = (dueDate: string): string => {
  if (!dueDate) return ''
  
  const daysRemaining = calculateDaysRemaining(dueDate)
  
  if (daysRemaining <= 0) return '' // Deadline passed
  if (daysRemaining === 1) return '01 day left'
  if (daysRemaining === 2) return '02 days left'
  if (daysRemaining === 3) return '03 days left'
  if (daysRemaining === 4) return '04 days left'
  if (daysRemaining === 5) return '05 days left'
  if (daysRemaining === 6) return '06 days left'
  if (daysRemaining === 7) return '07 days left'
  
  return '' // More than 7 days
}

/**
 * Returns the styling classes for deadline status badges based on days remaining
 * @param dueDate - The deadline date in YYYY-MM-DD format
 * @returns CSS classes for styling the badge
 */
 * Returns the styling classes for deadline status badges based on days remaining
 * @param dueDate - The deadline date in YYYY-MM-DD format
 * @returns CSS classes for styling the badge
 */
export const getDeadlineStatusStyleClasses = (dueDate: string): string => {
  if (!dueDate) return ''
  
  const daysRemaining = calculateDaysRemaining(dueDate)
  
  // 1-2 days: Red label with white text
  if (daysRemaining >= 1 && daysRemaining <= 2) {
    return 'text-white bg-red-600 border-red-700'
  }
  
  // 3-4 days: Orange label with white text
  if (daysRemaining >= 3 && daysRemaining <= 4) {
    return 'text-white bg-orange-500 border-orange-600'
  }
  
  // 5-7 days: Green label with white text
  if (daysRemaining >= 5 && daysRemaining <= 7) {
    return 'text-white bg-green-600 border-green-700'
  }
  
  return ''
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

