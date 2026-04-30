import Link from 'next/link'
import { formatFees, getRatingColor, getTypeColor } from '@/lib/utils'

interface College {
  id: string
  name: string
  city: string
  state: string
  type: string
  nirfRank: number | null
  rating: number
  totalFees: number
  establishedYear: number
  imageUrl: string | null
  placementAvg: number
  naacGrade: string
  _count: { courses: number; reviews: number }
}

export default function CollegeCard({ college }: { college: College }) {
  return (
    <Link href={`/colleges/${college.id}`} className="block group">
      <div
        className="relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
        style={{
          backgroundColor: 'rgba(13,18,33,0.95)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}
      >
        {/* Hover top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

        {/* Image / Monogram */}
        <div className="relative h-36 overflow-hidden" style={{ backgroundColor: '#080B14' }}>
          {college.imageUrl ? (
            <img
              src={college.imageUrl}
              alt={college.name}
              className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
              <span className="text-6xl font-black text-slate-700/60 tracking-tighter select-none">
                {college.name.split(' ').map((w: string) => w[0]).slice(0, 3).join('')}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* NIRF Rank badge */}
          <div
            className="absolute top-3 left-3 text-xs font-bold text-slate-200 px-2.5 py-1 rounded-lg"
            style={{
              backgroundColor: 'rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(4px)',
            }}
          >
            {college.nirfRank ? `#${college.nirfRank} NIRF` : 'Unranked'}
          </div>

          {/* Type badge */}
          <div className={`absolute top-3 right-3 text-xs font-medium px-2.5 py-1 rounded-lg border ${getTypeColor(college.type)}`}>
            {college.type}
          </div>
        </div>

        {/* Body */}
        <div className="p-4">
          <h3 className="font-semibold text-slate-100 text-sm leading-snug mb-1 line-clamp-2 group-hover:text-indigo-300 transition-colors duration-200">
            {college.name}
          </h3>
          <div className="flex items-center gap-1.5 mb-3">
            <svg className="w-3 h-3 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-slate-500 text-xs truncate">{college.city}, {college.state}</p>
          </div>

          {/* Stats */}
          <div
            className="flex items-center justify-between pt-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Fees/yr</p>
              <p className="text-slate-200 text-sm font-semibold">{formatFees(college.totalFees)}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-500 text-xs mb-0.5">Rating</p>
              <p className={`text-sm font-bold ${getRatingColor(college.rating)}`}>
                ★ {college.rating.toFixed(1)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 text-xs mb-0.5">NAAC</p>
              <p className="text-slate-200 text-sm font-semibold">{college.naacGrade}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}