"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import CompareButton from "@/components/CompareButton"
import { formatFees, formatPackage, getRatingColor, getTypeColor } from "@/lib/utils"

interface Course { id: string; name: string; duration: string; fees: number; seats: number }
interface Review { id: string; author: string; rating: number; comment: string; year: number }
interface College {
  id: string; name: string; slug: string; city: string; state: string; type: string
  rating: number; totalFees: number; establishedYear: number; imageUrl: string | null
  description: string; website: string | null; placementAvg: number
  placementHighest: number; placementPercent: number; naacGrade: string
  nirfRank: number | null; courses: Course[]; reviews: Review[]
}

const TABS = ["Overview", "Courses", "Placements", "Reviews"] as const
type Tab = typeof TABS[number]

export default function CollegeDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [college, setCollege] = useState<College | null>(null)
  const [tab, setTab]         = useState<Tab>("Overview")
  const [saved, setSaved]     = useState(false)
  const [saving, setSaving]   = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/colleges/${params.id}`)
      .then(r => r.json())
      .then(data => { setCollege(data); setLoading(false) })
  }, [params.id])

  useEffect(() => {
    if (!session || !college) return
    fetch("/api/saved").then(r => r.json()).then((data: { id: string }[]) => {
      if (Array.isArray(data)) setSaved(data.some(c => c.id === college.id))
    })
  }, [session, college])

  async function toggleSave() {
    if (!session) { router.push("/login"); return }
    setSaving(true)
    const method = saved ? "DELETE" : "POST"
    await fetch("/api/saved", {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collegeId: college!.id }),
    })
    setSaved(!saved)
    setSaving(false)
  }

  if (loading || !college) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#080B14", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid rgba(99,102,241,0.2)", borderTopColor: "#6366F1", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const tabLabel = (t: Tab) => {
    if (t === "Courses") return `Courses (${college.courses.length})`
    if (t === "Reviews") return `Reviews (${college.reviews.length})`
    return t
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#080B14", paddingBottom: 80 }}>
      <Navbar />
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "88px 16px 0" }}>

        {/* Hero */}
        <div style={{ borderRadius: 24, overflow: "hidden", marginBottom: 24, background: "rgba(13,18,33,0.95)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {college.imageUrl && (
            <div style={{ height: 220, overflow: "hidden", position: "relative" }}>
              <img src={college.imageUrl} alt={college.name} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, #080B14 100%)" }} />
            </div>
          )}
          <div style={{ padding: "28px 28px 24px" }}>
            {/* Badges */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              {college.nirfRank && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8, background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", color: "#F59E0B" }}>
                  #{college.nirfRank} NIRF
                </span>
              )}
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${getTypeColor(college.type)}`}>{college.type}</span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#818CF8" }}>
                NAAC {college.naacGrade}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", color: "#34D399" }}>
                {college.rating.toFixed(1)} / 5.0
              </span>
            </div>

            {/* Title row */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 900, color: "#f1f5f9", marginBottom: 6, letterSpacing: "-0.5px" }}>{college.name}</h1>
                <p style={{ fontSize: 14, color: "#475569" }}>{college.city}, {college.state}</p>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {/* Save button */}
                <button onClick={toggleSave} disabled={saving}
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "10px 18px", borderRadius: 12, fontSize: 13, fontWeight: 700,
                    cursor: saving ? "wait" : "pointer", transition: "all 0.2s",
                    background: saved ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)",
                    border: saved ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.1)",
                    color: saved ? "#818CF8" : "#94a3b8",
                  }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                  {saved ? "Saved" : "Save"}
                </button>
                <div style={{ minWidth: 140 }}>
                  <CompareButton id={college.id} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total Fees",   value: formatFees(college.totalFees) },
            { label: "Avg Package",  value: formatPackage(college.placementAvg) },
            { label: "Placement %",  value: college.placementPercent + "%" },
            { label: "Established",  value: String(college.establishedYear) },
          ].map(s => (
            <div key={s.label} style={{ borderRadius: 16, padding: "18px 20px", background: "rgba(13,18,33,0.9)", border: "1px solid rgba(255,255,255,0.07)", textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "#475569", marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "rgba(13,18,33,0.9)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 6 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                flex: 1, padding: "10px 0", borderRadius: 11, fontSize: 13, fontWeight: 600,
                cursor: "pointer", transition: "all 0.2s", border: "none",
                background: tab === t ? "linear-gradient(135deg,#6366F1,#8B5CF6)" : "transparent",
                color: tab === t ? "#fff" : "#64748b",
                boxShadow: tab === t ? "0 4px 16px rgba(99,102,241,0.3)" : "none",
              }}>
              {tabLabel(t)}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ borderRadius: 20, padding: "24px 24px", background: "rgba(13,18,33,0.9)", border: "1px solid rgba(255,255,255,0.07)" }}>

          {tab === "Overview" && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#64748b", marginBottom: 10, letterSpacing: "0.05em" }}>ABOUT</div>
                <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.75 }}>{college.description}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
                {[
                  { label: "Type",        value: college.type },
                  { label: "NAAC Grade",  value: college.naacGrade },
                  { label: "NIRF Rank",   value: college.nirfRank ? "#" + college.nirfRank : "Not ranked" },
                  { label: "Established", value: String(college.establishedYear) },
                  { label: "Rating",      value: college.rating.toFixed(1) + " / 5.0" },
                  { label: "Highest Pkg", value: formatPackage(college.placementHighest) },
                ].map(item => (
                  <div key={item.label} style={{ padding: "16px 18px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: 11, color: "#475569", marginBottom: 6, fontWeight: 600, letterSpacing: "0.05em" }}>{item.label.toUpperCase()}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{item.value}</div>
                  </div>
                ))}
              </div>
              {college.website && (
                <a href={college.website} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 20, fontSize: 13, color: "#818CF8", fontWeight: 600, textDecoration: "none" }}>
                  Visit Official Website
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
              )}
            </div>
          )}

          {tab === "Courses" && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#64748b", marginBottom: 16, letterSpacing: "0.05em" }}>ALL COURSES</div>
              {college.courses.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#475569" }}>No courses listed yet</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {college.courses.map(c => (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", flexWrap: "wrap", gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", marginBottom: 3 }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: "#475569" }}>{c.duration} &bull; {c.seats} seats</div>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#818CF8" }}>{formatFees(c.fees)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "Placements" && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#64748b", marginBottom: 16, letterSpacing: "0.05em" }}>PLACEMENT STATS</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
                {[
                  { label: "Placement Rate", value: college.placementPercent + "%", color: "#34D399" },
                  { label: "Avg Package",    value: formatPackage(college.placementAvg), color: "#818CF8" },
                  { label: "Highest Package",value: formatPackage(college.placementHighest), color: "#F59E0B" },
                ].map(s => (
                  <div key={s.label} style={{ padding: "22px 20px", borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
                    <div style={{ fontSize: 26, fontWeight: 900, color: s.color, marginBottom: 6 }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: "#475569" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "Reviews" && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#64748b", marginBottom: 16, letterSpacing: "0.05em" }}>STUDENT REVIEWS</div>
              {college.reviews.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#475569" }}>No reviews yet</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {college.reviews.map(r => (
                    <div key={r.id} style={{ padding: "18px 20px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <div style={{ fontWeight: 700, color: "#e2e8f0", fontSize: 13 }}>{r.author}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: "#34D399" }}>{r.rating.toFixed(1)}</span>
                          <span style={{ fontSize: 11, color: "#334155" }}>/ 5.0</span>
                          <span style={{ fontSize: 11, color: "#334155", marginLeft: 4 }}>{r.year}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.65 }}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ marginTop: 20 }}>
          <Link href="/" style={{ fontSize: 13, color: "#475569", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            Back to colleges
          </Link>
        </div>
      </div>
    </div>
  )
}