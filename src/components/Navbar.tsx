"use client"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"

export default function Navbar() {
  const { data: session } = useSession()
  const initials = session?.user?.name?.split(" ").map((w: string) => w[0]).slice(0, 2).join("") || ""

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06]"
      style={{ backgroundColor: "rgba(8,11,20,0.85)", backdropFilter: "blur(16px)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg group-hover:bg-indigo-500 transition-colors">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-bold text-white text-lg tracking-tight">CampusIQ</span>
        </Link>
        <div className="hidden sm:flex items-center gap-1">
          <Link href="/" className="text-slate-400 hover:text-white transition-colors text-sm px-3 py-2 rounded-lg hover:bg-white/5">Colleges</Link>
          <Link href="/compare" className="text-slate-400 hover:text-white transition-colors text-sm px-3 py-2 rounded-lg hover:bg-white/5">Compare</Link>
          {session && (
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors text-sm px-3 py-2 rounded-lg hover:bg-white/5">Dashboard</Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          {session ? (
            <>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#fff" }}>
                {initials}
              </div>
              <button onClick={() => signOut({ callbackUrl: "/" })}
                className="text-slate-400 hover:text-white text-sm px-3 py-2 transition-colors hidden sm:block">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-slate-400 hover:text-white text-sm px-3 py-2 transition-colors hidden sm:block">Sign in</Link>
              <Link href="/register" className="text-sm text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl transition-all font-medium"
                style={{ boxShadow: "0 0 20px rgba(99,102,241,0.25)" }}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
