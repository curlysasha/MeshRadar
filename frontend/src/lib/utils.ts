import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseTimestamp(timestamp: string | number): Date {
  if (typeof timestamp === 'number') {
    return new Date(timestamp * 1000)
  }

  const trimmed = timestamp.trim()
  const normalized = trimmed.includes('T') ? trimmed : trimmed.replace(' ', 'T')
  const hasTimezone = /([zZ]|[+-]\d\d:?\d\d)$/.test(normalized)
  const isoString = hasTimezone ? normalized : `${normalized}Z`
  const date = new Date(isoString)

  if (Number.isNaN(date.getTime())) {
    return new Date(timestamp)
  }

  return date
}

export function formatTime(timestamp: string | number): string {
  const date = parseTimestamp(timestamp)
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  })
}

export function formatDate(timestamp: string | number): string {
  const date = parseTimestamp(timestamp)
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

export function getNodeName(node: { user?: { longName?: string; shortName?: string }; id?: string }): string {
  return node.user?.longName || node.user?.shortName || node.id || 'Unknown'
}

export function formatNodeId(id: string): string {
  if (id.startsWith('!')) return id
  return `!${parseInt(id).toString(16).padStart(8, '0')}`
}
