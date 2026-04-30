'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { debounce } from '@/lib/utils'

const TYPES = ['Government', 'Private', 'Deemed']
const SORT_OPTIONS = [
  { value: 'ranking', label: 'Top Ranked' },
  { value: 'rating',  label: 'Highest Rated' },
  { value: 'fees',    label: 'Lowest Fees' },
  { value: 'name',    label: 'A–Z' },
]

export default function SearchFilters({ states }: { states: string[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const updateParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    startTransition(() => router.push(`/?${params.toString()}`))
  }, [searchParams, router])

  const debouncedSearch = useCallback(
    debounce((val: unknown) => updateParam('search', val as string), 300),
    [updateParam]
  )

  const currentType  = searchParams.get('type') || ''
  const currentState = searchParams.get('state') || ''
  const currentSort  = searchParams.get('sort') || 'ranking'
  const currentSearch = searchParams.get('search') || ''

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {isPending && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        )}
        <input
          type="text"
          placeholder="Search colleges, cities..."
          defaultValue={currentSearch}
          onChange={(e) => debouncedSearch(e.target.value)}
          className="w-full pl-10 pr-10 py-3 rounded-xl text-slate-200 text-sm placeholder:text-slate-500 outline-none transition-all"
          style={{
            backgroundColor: 'rgba(20,24,41,0.9)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'rgba(99,102,241,0.5)')}
          onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3">
        {/* Sort */}
        <select
          value={currentSort}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="text-sm text-slate-300 rounded-xl px-3 py-2.5 outline-none cursor-pointer"
          style={{ backgroundColor: 'rgba(20,24,41,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} style={{ backgroundColor: '#0D1221' }}>{o.label}</option>
          ))}
        </select>

        {/* State */}
        <select
          value={currentState}
          onChange={(e) => updateParam('state', e.target.value)}
          className="text-sm text-slate-300 rounded-xl px-3 py-2.5 outline-none cursor-pointer"
          style={{ backgroundColor: 'rgba(20,24,41,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <option value="" style={{ backgroundColor: '#0D1221' }}>All States</option>
          {states.map((s) => (
            <option key={s} value={s} style={{ backgroundColor: '#0D1221' }}>{s}</option>
          ))}
        </select>

        {/* Type pills */}
        <div className="flex gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => updateParam('type', currentType === t ? '' : t)}
              className="text-xs font-medium px-3 py-2 rounded-xl transition-all"
              style={
                currentType === t
                  ? { backgroundColor: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.5)', color: '#818CF8' }
                  : { backgroundColor: 'rgba(20,24,41,0.9)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }
              }
            >
              {t}
            </button>
          ))}
        </div>

        {/* Clear */}
        {(currentSearch || currentType || currentState || currentSort !== 'ranking') && (
          <button
            onClick={() => startTransition(() => router.push('/'))}
            className="text-xs text-slate-500 hover:text-slate-300 px-3 py-2 rounded-xl transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  )
}