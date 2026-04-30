import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const type   = searchParams.get('type')   || ''
    const state  = searchParams.get('state')  || ''
    const sort   = searchParams.get('sort')   || 'nirfRank'
    const page   = parseInt(searchParams.get('page') || '1')
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

    const orderBy: Record<string, string> =
      sort === 'rating'    ? { rating: 'desc' }
      : sort === 'fees'    ? { totalFees: 'asc' }
      : sort === 'name'    ? { name: 'asc' }
      : { nirfRank: 'asc' }

    const [colleges, total] = await Promise.all([
      db.college.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, name: true, city: true, state: true,
          type: true, nirfRank: true, rating: true, totalFees: true,
          establishedYear: true, imageUrl: true, placementAvg: true,
          naacGrade: true,
          _count: { select: { courses: true, reviews: true } },
        },
      }),
      db.college.count({ where }),
    ])

    return NextResponse.json({ colleges, total, pages: Math.ceil(total / limit), page })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch colleges' }, { status: 500 })
  }
}