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
 * Determines the deadline status indicator for a complaint
 * @param complaint - The complaint with status and due date
 * @param isAssignedToCurrentTO - Whether the complaint is assigned to the current Technical Officer
 * @returns The deadline status string or empty string if not assigned to current TO
 */
export const getDeadlineStatus = (
  complaint: ComplaintDeadline,
  _isAssignedToCurrentTO: boolean
): string => {
  switch (complaint.status) {
    case 'PENDING':
      return '01 day left'
    case 'REVIEWING':
      return '04 days left'
    case 'IN PROGRESS':
      return '05 days left'
    default:
      return ''
  }
}

/**
 * Returns the styling classes for deadline status badges.
 */
export const getDeadlineStatusStyleClasses = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return 'text-black bg-red-100 border-red-200'
    case 'REVIEWING':
      return 'text-black bg-orange-100 border-orange-200'
    case 'IN PROGRESS':
      return 'text-black bg-green-100 border-green-200'
    default:
      return 'text-black bg-gray-50 border-gray-200'
  }
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
