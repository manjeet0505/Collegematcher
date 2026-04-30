"use client"
import { useEffect, useState } from "react"
import { useCompareStore } from "@/store/compareStore"

export default function CompareButton({ id }: { id: string }) {
  const { isSelected, addCollege, removeCollege, selectedIds } = useCompareStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return (
    <button disabled className="w-full text-xs font-medium py-2 rounded-xl border border-white/10 text-slate-600 bg-transparent transition-all duration-200">
      + Compare
    </button>
  )

  const selected = isSelected(id)
  const full = selectedIds.length >= 3 && !selected

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); selected ? removeCollege(id) : addCollege(id) }}
      disabled={full}
      className={`w-full text-xs font-medium py-2 rounded-xl border transition-all duration-200 ${
        selected
          ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
          : full
          ? "bg-transparent border-white/5 text-slate-600 cursor-not-allowed"
          : "bg-transparent border-white/10 text-slate-400 hover:border-indigo-500/40 hover:text-indigo-300"
      }`}
    >
      {selected ? "? Added to Compare" : full ? "Compare Full (3/3)" : "+ Compare"}
    </button>
  )
}
