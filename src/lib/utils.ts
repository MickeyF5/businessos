import type { Priority, Task } from '../types'

// Priority sorting order
const PRIORITY_ORDER: Record<Priority, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
}

// Priority colors and badges
export const PRIORITY_CONFIG: Record<Priority, { color: string; bgColor: string; label: string; icon: string }> = {
  High: {
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    label: 'HIGH',
    icon: 'High',
  },
  Medium: {
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    label: 'MEDIUM',
    icon: 'Med',
  },
  Low: {
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    label: 'LOW',
    icon: 'Low',
  },
}

// Sort items by priority
export function sortByPriority<T extends { priority?: Priority }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const priorityA = a.priority || 'Low'
    const priorityB = b.priority || 'Low'
    return PRIORITY_ORDER[priorityA] - PRIORITY_ORDER[priorityB]
  })
}

// Sort tasks by multiple criteria: overdue > high priority > completed
export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // Overdue tasks first
    if (a.overdue && !b.overdue) return -1
    if (!a.overdue && b.overdue) return 1

    // High priority first
    const priorityA = PRIORITY_ORDER[a.priority || 'Low']
    const priorityB = PRIORITY_ORDER[b.priority || 'Low']
    if (priorityA !== priorityB) return priorityA - priorityB

    // Not completed first
    if (!a.done && b.done) return -1
    if (a.done && !b.done) return 1

    return 0
  })
}

// Calculate days remaining
export function daysRemaining(dueDate: string | null | undefined): number | null {
  if (!dueDate) return null
  const due = new Date(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

// Get due date status color
export function getDueDateStatus(dueDate: string | null | undefined): 'overdue' | 'dueSoon' | 'onTrack' | null {
  const remaining = daysRemaining(dueDate)
  if (remaining === null) return null
  if (remaining < 0) return 'overdue'
  if (remaining <= 2) return 'dueSoon'
  return 'onTrack'
}

// Format due date display
export function formatDueDate(dueDate: string | null | undefined): string {
  if (!dueDate) return 'No due date'
  const remaining = daysRemaining(dueDate)
  if (remaining === null) return 'No due date'
  if (remaining < 0) return `Overdue by ${Math.abs(remaining)} days`
  if (remaining === 0) return 'Due today'
  if (remaining === 1) return 'Due tomorrow'
  if (remaining <= 7) return `Due in ${remaining} days`
  return new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Get status color based on days remaining
export function getStatusColor(dueDate: string | null | undefined): string {
  const status = getDueDateStatus(dueDate)
  if (status === 'overdue') return '#ef4444'
  if (status === 'dueSoon') return '#f59e0b'
  return '#10b981'
}

// Calculate project progress from tasks
export function calculateProjectProgress(completedTasks: number, totalTasks: number): number {
  if (totalTasks === 0) return 0
  return Math.round((completedTasks / totalTasks) * 100)
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// Allowed file types for documents
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/png', 'image/jpeg']

// Get file type icon
export function getFileTypeIcon(fileType: string): string {
  if (fileType === 'application/pdf') return '📄'
  if (fileType.includes('word') || fileType.includes('document')) return '📝'
  if (fileType.includes('sheet') || fileType.includes('csv')) return '📊'
  if (fileType.includes('image')) return '🖼️'
  return '📎'
}
