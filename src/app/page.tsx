import { Suspense } from 'react'
import { db } from '@/lib/db'
import Navbar from '@/components/Navbar'
import CollegeCard from '@/components/CollegeCard'
import SearchFilters from '@/components/SearchFilters'
import CompareBar from '@/components/CompareBar'
import { PrismaClient } from '../generated/prisma'
interface SearchParams {
  search?: string
  type?: string
  state?: string
  sort?: string
  page?: string
}

function buildPageUrl(params: SearchParams, pageNum: number): string {
  const p = new URLSearchParams()
  if (params.search) p.set('search', params.search)
  if (params.type)   p.set('type',   params.type)
  if (params.state)  p.set('state',  params.state)
  if (params.sort)   p.set('sort',   params.sort)
  p.set('page', String(pageNum))
  return '?' + p.toString()
}

function getPageStyle(isActive: boolean): React.CSSProperties {
  if (isActive) {
    return {
      backgroundColor: 'rgba(99,102,241,0.2)',
      border: '1px solid rgba(99,102,241,0.4)',
      color: '#818CF8',
    }
  }
  return {
    backgroundColor: 'rgba(20,24,41,0.8)',
    border: '1px solid rgba(255,255,255,0.06)',
    color: '#64748b',
  }
}

async function getColleges(params: SearchParams) {
  const search = params.search || ''
  const type   = params.type   || ''
  const state  = params.state  || ''
  const sort   = params.sort   || 'nirfRank'
  const page   = parseInt(params.page || '1')
  const limit  = 12

  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { name:  { contains: search, mode: 'insensitive' } },
      { city:  { contains: search, mode: 'insensitive' } },
      { state: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (type)  where.type  = type
  if (state) where.state = state

  let orderBy: Record<string, string> = { nirfRank: 'asc' }
  if (sort === 'rating')    orderBy = { rating: 'desc' }
  if (sort === 'totalFees') orderBy = { totalFees: 'asc' }
  if (sort === 'name')      orderBy = { name: 'asc' }

  const [colleges, total, stateRows] = await Promise.all([
    db.college.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        type: true,
        nirfRank: true,
        rating: true,
        totalFees: true,
        establishedYear: true,
        imageUrl: true,
        placementAvg: true,
        naacGrade: true,
        _count: { select: { courses: true, reviews: true } },
      },
    }),
    db.college.count({ where }),
    db.college.findMany({
      select: { state: true },
      distinct: ['state'],
      orderBy: { state: 'asc' },
    }),
  ])

  return {
    colleges,
    total,
    pages: Math.ceil(total / limit),
    page,
    states: stateRows.map((r: { state: string }) => r.state),
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const { colleges, total, pages, page, states } = await getColleges(params)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#080B14' }}>
      <Navbar />

      {/* Hero */}
      <div className="relative pt-24 pb-12 px-4 overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #6366F1 0%, transparent 70%)' }}
        />
        <div className="max-w-7xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1.5 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            {total} colleges · Updated 2025
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
            Find Your{' '}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #6366F1, #818CF8)' }}
            >
              Perfect
            </span>{' '}
            College
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Compare rankings, fees, and placements across India&apos;s top institutions.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 pb-20">

        {/* Filters */}
        <div className="mb-8">
          <Suspense fallback={null}>
            <SearchFilters states={states} />
          </Suspense>
        </div>

        {/* Count */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-slate-500 text-sm">
            Showing <span className="text-slate-300 font-medium">{colleges.length}</span>
            {' '}of <span className="text-slate-300 font-medium">{total}</span> colleges
          </p>
          {pages > 1 && (
            <p className="text-slate-500 text-sm">Page {page} of {pages}</p>
          )}
        </div>

        {/* Grid */}
        {colleges.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
           {colleges.map((college) => (
  <CollegeCard key={college.id} college={college as never} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {colleges.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🎓</div>
            <p className="text-slate-400 text-lg font-medium">No colleges found</p>
            <p className="text-slate-600 text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <a
                key={p}
                href={buildPageUrl(params, p)}
                className="w-9 h-9 rounded-xl text-sm font-medium flex items-center justify-center transition-all"
                style={getPageStyle(p === page)}
              >
                {p}
              </a>
            ))}
          </div>
        )}

      </div>
      <CompareBar />  
    </div>
  )
}