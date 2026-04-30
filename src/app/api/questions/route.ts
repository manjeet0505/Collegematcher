import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const collegeId = searchParams.get("collegeId")
  const where = collegeId ? { collegeId } : {}
  const questions = await db.question.findMany({
    where,
    include: {
      user: { select: { name: true } },
      answers: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(questions)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { title, body, collegeId } = await req.json()
  if (!title || !collegeId) return NextResponse.json({ error: "title and collegeId required" }, { status: 400 })
  const q = await db.question.create({
    data: { title, body: body || "", collegeId, userId: (session.user as { id: string }).id },
    include: { user: { select: { name: true } }, answers: [] },
  })
  return NextResponse.json(q)
}