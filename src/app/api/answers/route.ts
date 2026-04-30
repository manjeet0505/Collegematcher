import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { body, questionId } = await req.json()
  if (!body || !questionId) return NextResponse.json({ error: "body and questionId required" }, { status: 400 })
  const a = await db.answer.create({
    data: { body, questionId, userId: (session.user as { id: string }).id },
    include: { user: { select: { name: true } } },
  })
  return NextResponse.json(a)
}