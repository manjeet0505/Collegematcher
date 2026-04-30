import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CompareStore {
  selectedIds: string[]
  addCollege: (id: string) => void
  removeCollege: (id: string) => void
  clearAll: () => void
  isSelected: (id: string) => boolean
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      selectedIds: [],
      addCollege: (id) => {
        const s = get().selectedIds
        if (s.length >= 3 || s.includes(id)) return
        set({ selectedIds: [...s, id] })
      },
      removeCollege: (id) =>
        set((s) => ({ selectedIds: s.selectedIds.filter((i) => i !== id) })),
      clearAll: () => set({ selectedIds: [] }),
      isSelected: (id) => get().selectedIds.includes(id),
    }),
    { name: 'campus-compare' }
  )
)