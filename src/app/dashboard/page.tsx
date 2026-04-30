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
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
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

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#080B14", paddingBottom: 80 }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 16px 0" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "#fff", boxShadow: "0 0 28px rgba(99,102,241,0.35)" }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9" }}>Hey, {user?.name?.split(" ")[0]}</div>
              <div style={{ fontSize: 13, color: "#475569" }}>{user?.email}</div>
            </div>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/" })}
            style={{ padding: "9px 18px", borderRadius: 11, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Sign out
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 32 }}>
          {[
            { label: "Saved Colleges", value: String(colleges.length),                       icon: "Saved", color: "#6366F1" },
            { label: "Avg Fees / yr",  value: colleges.length ? formatFees(avgFees)  : "--", icon: "Fees",  color: "#10B981" },
            { label: "Avg Package",    value: colleges.length ? formatFees(avgPkg)   : "--", icon: "Pkg",   color: "#F59E0B" },
            { label: "Best Placement", value: colleges.length ? bestPlace + "%"      : "--", icon: "Place", color: "#818CF8" },
          ].map(s => (
            <div key={s.label} style={{ borderRadius: 16, padding: "18px 20px", background: "rgba(13,18,33,0.9)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#334155", marginBottom: 10, letterSpacing: "0.05em" }}>{s.icon.toUpperCase()}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#475569" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9" }}>Saved Colleges</div>
            <div style={{ fontSize: 13, color: "#475569", marginTop: 2 }}>Bookmarked for later</div>
          </div>
          <Link href="/" style={{ fontSize: 13, color: "#818CF8", fontWeight: 600, textDecoration: "none", padding: "8px 16px", borderRadius: 10, border: "1px solid rgba(99,102,241,0.2)", background: "rgba(99,102,241,0.06)" }}>
            + Browse more
          </Link>
        </div>

        {colleges.length === 0 ? (
          <div style={{ borderRadius: 20, padding: "60px 32px", textAlign: "center", background: "rgba(13,18,33,0.9)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#cbd5e1", marginBottom: 8 }}>No saved colleges yet</div>
            <div style={{ fontSize: 13, color: "#475569", marginBottom: 24 }}>Browse colleges and save ones you like</div>
            <Link href="/" style={{ display: "inline-flex", padding: "10px 24px", borderRadius: 12, fontSize: 14, fontWeight: 600, color: "#fff", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", textDecoration: "none" }}>
              Browse Colleges
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 14 }}>
            {colleges.map(c => (
              <div key={c.id} style={{ borderRadius: 18, padding: "20px", background: "rgba(13,18,33,0.9)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <Link href={"/colleges/" + c.id} style={{ textDecoration: "none" }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#f1f5f9", lineHeight: 1.35, marginBottom: 3 }}>{c.name}</div>
                    </Link>
                    <div style={{ fontSize: 12, color: "#475569" }}>{c.city}, {c.state}</div>
                  </div>
                  <button onClick={() => unsave(c.id)}
                    style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", color: "#f87171", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 8 }}>
                    x
                  </button>
                </div>
                <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                  <span className={`text-xs px-2 py-0.5 rounded-md border font-semibold ${getTypeColor(c.type)}`}>{c.type}</span>
                  <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#64748b", fontWeight: 600 }}>NAAC {c.naacGrade}</span>
                  {c.nirfRank && <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#F59E0B", fontWeight: 700 }}>#{c.nirfRank} NIRF</span>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {[
                    { l: "Fees/yr", v: formatFees(c.totalFees) },
                    { l: "Avg Pkg", v: formatFees(c.placementAvg) },
                    { l: "Placed",  v: c.placementPercent + "%" },
                  ].map(m => (
                    <div key={m.l} style={{ textAlign: "center", padding: "10px 6px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#cbd5e1" }}>{m.v}</div>
                      <div style={{ fontSize: 10, color: "#334155", marginTop: 2 }}>{m.l}</div>
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