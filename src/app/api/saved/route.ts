import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

const COLLEGE_SELECT = {
  id: true, name: true, city: true, state: true, type: true,
  nirfRank: true, rating: true, naacGrade: true,
  totalFees: true, placementAvg: true, placementPercent: true,
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as { id: string }).id
  const rows = await db.savedCollege.findMany({
    where: { userId },
    include: { college: { select: COLLEGE_SELECT } },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(rows.map(r => r.college))
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { collegeId } = await req.json()
  if (!collegeId) return NextResponse.json({ error: "collegeId required" }, { status: 400 })
  try {
    await db.savedCollege.create({ data: { userId: (session.user as { id: string }).id, collegeId } })
    return NextResponse.json({ saved: true })
  } catch {
    return NextResponse.json({ error: "Already saved" }, { status: 409 })
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { collegeId } = await req.json()
  await db.savedCollege.deleteMany({ where: { userId: (session.user as { id: string }).id, collegeId } })
  return NextResponse.json({ saved: false })
}
