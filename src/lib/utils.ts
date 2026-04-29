import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFees(amount: number): string {
  if (amount >= 10_00_000) {
    return `₹${(amount / 10_00_000).toFixed(1)}L/yr`
  }
  if (amount >= 1_00_000) {
    return `₹${(amount / 1_00_000).toFixed(1)}L/yr`
  }
  return `₹${amount.toLocaleString('en-IN')}`
}

export function formatPackage(amount: number): string {
  if (amount >= 10_00_000) {
    return `${(amount / 10_00_000).toFixed(1)} LPA`
  }
  return `₹${amount.toLocaleString('en-IN')}`
}

export function getRatingColor(rating: number): string {
  if (rating >= 4.5) return 'text-emerald-400'
  if (rating >= 4.0) return 'text-green-400'
  if (rating >= 3.5) return 'text-yellow-400'
  return 'text-orange-400'
}

export function getTypeColor(type: string): string {
  const map: Record<string, string> = {
    Government: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Deemed: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Private: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  }
  return map[type] ?? 'bg-slate-500/10 text-slate-400 border-slate-500/20'
}

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}
