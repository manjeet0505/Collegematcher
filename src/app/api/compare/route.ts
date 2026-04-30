import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const ids = searchParams.get('ids')?.split(',').filter(Boolean) || []

    if (ids.length < 2 || ids.length > 3) {
      return NextResponse.json({ error: 'Select 2-3 colleges' }, { status: 400 })
    }

    const colleges = await db.college.findMany({
      where: { id: { in: ids } },
      include: { courses: true },
    })

    const ordered = ids.map((id) => colleges.find((c) => c.id === id)).filter(Boolean)
    return NextResponse.json(ordered)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}