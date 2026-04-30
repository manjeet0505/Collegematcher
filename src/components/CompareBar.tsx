'use client'
import { useCompareStore } from '@/store/compareStore'
import { useRouter } from 'next/navigation'

export default function CompareBar() {
  const { selectedIds, clearAll } = useCompareStore()
  const router = useRouter()

  if (selectedIds.length === 0) return null

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-3 rounded-2xl"
      style={{
        backgroundColor: 'rgba(13,18,33,0.97)',
        border: '1px solid rgba(99,102,241,0.35)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(99,102,241,0.25)',
      }}
    >
      <span className="text-slate-300 text-sm font-medium">
        <span className="text-indigo-400 font-bold">{selectedIds.length}</span>
        /3 selected
      </span>
      <div className="w-px h-4 bg-white/10" />
      <button
        onClick={() => router.push(`/compare?ids=${selectedIds.join(',')}`)}
        disabled={selectedIds.length < 2}
        className="text-sm font-semibold text-white px-4 py-1.5 rounded-xl transition-all bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Compare Now
      </button>
      <button
        onClick={clearAll}
        className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
      >
        Clear
      </button>
    </div>
  )
}