"use client"
import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import { formatFees, getTypeColor } from "@/lib/utils"

interface SavedCollege {
  id: string; name: string; city: string; state: string; type: string
  nirfRank: number | null; rating: number; naacGrade: string
  totalFees: number; placementAvg: number; placementPercent: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [colleges, setColleges] = useState<SavedCollege[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (status === "authenticated") {
      fetch("/api/saved")
        .then(r => r.json())
        .then(data => { if (Array.isArray(data)) setColleges(data) })
        .finally(() => setLoading(false))
    }
  }, [status, router])

  if (status === "loading" || loading) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#080B14", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid rgba(99,102,241,0.2)", borderTopColor: "#6366F1", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const user      = session?.user
  const initials  = user?.name?.split(" ").map((w: string) => w[0]).slice(0, 2).join("") || "?"
  const avgFees   = colleges.length ? Math.round(colleges.reduce((a, c) => a + c.totalFees, 0) / colleges.length) : 0
  const avgPkg    = colleges.length ? Math.round(colleges.reduce((a, c) => a + c.placementAvg, 0) / colleges.length) : 0
  const bestPlace = colleges.length ? Math.max(...colleges.map(c => c.placementPercent)) : 0

  async function unsave(id: string) {
    await fetch("/api/saved", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ collegeId: id }) })
    setColleges(prev => prev.filter(c => c.id !== id))
  }

  const stats = [
    { label: "Saved Colleges", value: String(colleges.length), sub: "bookmarked",         grad: "linear-gradient(135deg,#6366F1,#8B5CF6)", glow: "rgba(99,102,241,0.25)" },
    { label: "Avg Fees / yr",  value: colleges.length ? formatFees(avgFees)  : "--", sub: "per year",  grad: "linear-gradient(135deg,#10B981,#059669)", glow: "rgba(16,185,129,0.2)"  },
    { label: "Avg Package",    value: colleges.length ? formatFees(avgPkg)   : "--", sub: "CTC",       grad: "linear-gradient(135deg,#F59E0B,#D97706)", glow: "rgba(245,158,11,0.2)"  },
    { label: "Best Placement", value: colleges.length ? bestPlace + "%"      : "--", sub: "placed",    grad: "linear-gradient(135deg,#EC4899,#DB2777)", glow: "rgba(236,72,153,0.2)"  },
  ]

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#080B14", paddingBottom: 80 }}>
      <Navbar />

      {/* Top gradient band */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 280, background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "96px 16px 0", position: "relative", zIndex: 1 }}>

        {/* Profile header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 60, height: 60, borderRadius: 18,
              background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, fontWeight: 900, color: "#fff",
              boxShadow: "0 0 0 4px rgba(99,102,241,0.15), 0 8px 32px rgba(99,102,241,0.3)",
            }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.5px" }}>
                Welcome back, {user?.name?.split(" ")[0]}
              </div>
              <div style={{ fontSize: 13, color: "#475569", marginTop: 2 }}>{user?.email}</div>
            </div>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/" })}
            style={{ padding: "9px 18px", borderRadius: 11, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { (e.currentTarget.style.color = "#f1f5f9"); (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)") }}
            onMouseLeave={e => { (e.currentTarget.style.color = "#64748b"); (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)") }}>
            Sign out
          </button>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginBottom: 40 }}>
          {stats.map(s => (
            <div key={s.label} style={{
              borderRadius: 20, padding: "22px 22px",
              background: "rgba(13,18,33,0.9)",
              border: "1px solid rgba(255,255,255,0.07)",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: s.grad, opacity: 0.12, filter: "blur(20px)" }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: "#334155", marginBottom: 12, letterSpacing: "0.08em" }}>{s.label.toUpperCase()}</div>
              <div style={{ fontSize: 28, fontWeight: 900, background: s.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#334155" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Section header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.3px" }}>Saved Colleges</div>
            <div style={{ fontSize: 13, color: "#334155", marginTop: 3 }}>{colleges.length} college{colleges.length !== 1 ? "s" : ""} bookmarked</div>
          </div>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#818CF8", fontWeight: 600, textDecoration: "none", padding: "9px 16px", borderRadius: 11, border: "1px solid rgba(99,102,241,0.2)", background: "rgba(99,102,241,0.06)", transition: "all 0.2s" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Browse more
          </Link>
        </div>

        {/* Empty state */}
        {colleges.length === 0 && (
          <div style={{ borderRadius: 24, padding: "64px 32px", textAlign: "center", background: "rgba(13,18,33,0.9)", border: "1px solid rgba(255,255,255,0.07)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
            <div style={{ width: 64, height: 64, borderRadius: 18, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#cbd5e1", marginBottom: 8 }}>No saved colleges yet</div>
            <div style={{ fontSize: 13, color: "#334155", marginBottom: 28 }}>Click the bookmark icon on any college card to save it here</div>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 14, fontSize: 14, fontWeight: 700, color: "#fff", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", textDecoration: "none", boxShadow: "0 4px 20px rgba(99,102,241,0.35)" }}>
              Browse Colleges
            </Link>
          </div>
        )}

        {/* College grid */}
        {colleges.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(310px,1fr))", gap: 16 }}>
            {colleges.map(c => (
              <div key={c.id} style={{
                borderRadius: 20, padding: "20px",
                background: "rgba(13,18,33,0.9)",
                border: "1px solid rgba(255,255,255,0.07)",
                transition: "border-color 0.2s",
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}>

                {/* Card header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ flex: 1 }}>
                    <Link href={"/colleges/" + c.id} style={{ textDecoration: "none" }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#f1f5f9", lineHeight: 1.4, marginBottom: 4 }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#818CF8")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#f1f5f9")}>
                        {c.name}
                      </div>
                    </Link>
                    <div style={{ fontSize: 12, color: "#475569" }}>{c.city}, {c.state}</div>
                  </div>
                  <button onClick={() => unsave(c.id)} title="Remove"
                    style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.12)", color: "#f87171", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 10, transition: "all 0.2s" }}
                    onMouseEnter={e => { (e.currentTarget.style.background = "rgba(239,68,68,0.15)"); (e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)") }}
                    onMouseLeave={e => { (e.currentTarget.style.background = "rgba(239,68,68,0.07)"); (e.currentTarget.style.borderColor = "rgba(239,68,68,0.12)") }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>

                {/* Badges */}
                <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                  <span className={`text-xs px-2 py-0.5 rounded-md border font-semibold ${getTypeColor(c.type)}`}>{c.type}</span>
                  <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)", color: "#818CF8", fontWeight: 600 }}>NAAC {c.naacGrade}</span>
                  {c.nirfRank && <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.18)", color: "#F59E0B", fontWeight: 700 }}>#{c.nirfRank} NIRF</span>}
                </div>

                {/* Metrics */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {[
                    { l: "Fees/yr", v: formatFees(c.totalFees),      color: "#34D399" },
                    { l: "Avg Pkg", v: formatFees(c.placementAvg),   color: "#818CF8" },
                    { l: "Placed",  v: c.placementPercent + "%",      color: "#F59E0B" },
                  ].map(m => (
                    <div key={m.l} style={{ textAlign: "center", padding: "12px 6px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: m.color }}>{m.v}</div>
                      <div style={{ fontSize: 10, color: "#334155", marginTop: 3, fontWeight: 500 }}>{m.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}