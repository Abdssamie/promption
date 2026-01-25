import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ItemType } from '../types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Tag colors
export const TAG_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#f97316', // orange
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#a855f7', // violet
]

// Item type utilities
export function getItemTypeColor(type: ItemType): string {
  const colors: Record<ItemType, string> = {
    skill: '#3b82f6',    // blue
    rule: '#f59e0b',     // amber
    workflow: '#8b5cf6', // purple
  }
  return colors[type]
}

export function getItemTypeLabel(type: ItemType): string {
  const labels: Record<ItemType, string> = {
    skill: 'Skill',
    rule: 'Rule',
    workflow: 'Workflow',
  }
  return labels[type]
}

// Date formatting
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Text utilities
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
