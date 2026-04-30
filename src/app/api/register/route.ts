import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()
    if (!name || !email || !password)
      return NextResponse.json({ error: "All fields required" }, { status: 400 })
    if (password.length < 6)
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    const exists = await db.user.findUnique({ where: { email } })
    if (exists)
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    const hashed = await bcrypt.hash(password, 12)
    const user = await db.user.create({ data: { name, email, password: hashed } })
    return NextResponse.json({ id: user.id })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
