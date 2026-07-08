import { describe, expect, it } from 'vitest'
import { getDeadlineStatus, getDeadlineStatusStyleClasses, isComplaintAssignedToCurrentTO } from './deadlineUtils'

const formatDate = (date: Date) => date.toISOString().split('T')[0]

describe('deadlineUtils', () => {
  it('returns active deadline labels for pending, reviewing, and in-progress complaints', () => {
    const today = formatDate(new Date())
    expect(getDeadlineStatus({ status: 'PENDING', dueDate: today }, false)).toBe('01 day left')
    expect(getDeadlineStatus({ status: 'REVIEWING', dueDate: today }, false)).toBe('04 days left')
    expect(getDeadlineStatus({ status: 'IN PROGRESS', dueDate: today }, false)).toBe('05 days left')
  })

  it('returns blank for completed, approved, rejected, and rescheduled statuses', () => {
    const today = formatDate(new Date())
    expect(getDeadlineStatus({ status: 'COMPLETED', dueDate: today }, true)).toBe('')
    expect(getDeadlineStatus({ status: 'APPROVED', dueDate: today }, true)).toBe('')
    expect(getDeadlineStatus({ status: 'REJECTED', dueDate: today }, true)).toBe('')
    expect(getDeadlineStatus({ status: 'RESCHEDULED', dueDate: today }, true)).toBe('')
  })

  it('returns the expected badge classes for active deadline statuses', () => {
    expect(getDeadlineStatusStyleClasses('PENDING')).toBe('text-black bg-red-300 border-red-200')
    expect(getDeadlineStatusStyleClasses('REVIEWING')).toBe('text-black bg-orange-300 border-orange-200')
    expect(getDeadlineStatusStyleClasses('IN PROGRESS')).toBe('text-black bg-green-300 border-green-200')
  })

  it('detects whether the complaint is assigned to the current technical officer', () => {
    expect(isComplaintAssignedToCurrentTO({ assignedTechnician: 'John Doe', assignedOfficer: 'Jane Doe' }, 'john doe')).toBe(true)
    expect(isComplaintAssignedToCurrentTO({ assignedTechnician: 'John Doe', assignedOfficer: 'Jane Doe' }, 'alice')).toBe(false)
  })
})
