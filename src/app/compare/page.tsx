"use client"
import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Navbar from "@/components/Navbar"
import Link from "next/link"
import { formatFees } from "@/lib/utils"

const COLORS = ["#6366F1", "#F59E0B", "#10B981"]
const FILLS  = ["rgba(99,102,241,0.13)", "rgba(245,158,11,0.13)", "rgba(16,185,129,0.13)"]

interface College {
  id: string; name: string; city: string; state: string; type: string
  nirfRank: number | null; rating: number; totalFees: number
  placementAvg: number; placementHighest: number; placementPercent: number
  naacGrade: string; establishedYear: number; courses: { id: string }[]
}
type MKey = "nirfRank"|"rating"|"totalFees"|"placementAvg"|"placementHighest"|"placementPercent"

const METRICS: { key: MKey; label: string; desc: string; better: boolean; fmt: (v: number) => string }[] = [
  { key: "nirfRank",         label: "NIRF Rank",      desc: "National ranking",  better: false, fmt: v => "#" + v },
  { key: "rating",           label: "Rating",          desc: "Student score",     better: true,  fmt: v => v.toFixed(1) + " / 5" },
  { key: "totalFees",        label: "Annual Fees",     desc: "Cost per year",     better: false, fmt: v => formatFees(v) },
  { key: "placementAvg",     label: "Avg Package",     desc: "Average CTC",       better: true,  fmt: v => formatFees(v) },
  { key: "placementHighest", label: "Highest Package", desc: "Best CTC",          better: true,  fmt: v => formatFees(v) },
  { key: "placementPercent", label: "Placement Rate",  desc: "Students placed",   better: true,  fmt: v => v + "%" },
]

function bestIdx(cols: College[], key: MKey, better: boolean) {
  const vals = cols.map(c => c[key] as number | null)
  const valid = vals.filter(v => v != null) as number[]
  if (!valid.length) return -1
  const best = better ? Math.max(...valid) : Math.min(...valid)
  return vals.findIndex(v => v === best)
}

function norm(v: number, mn: number, mx: number, inv: boolean) {
  if (mx === mn) return 0.5
  const n = (v - mn) / (mx - mn)
  return inv ? 1 - n : n
}

function RadarChart({ colleges }: { colleges: College[] }) {
  const cx = 155, cy = 155, R = 110, N = METRICS.length
  const grid = (lv: number) => Array.from({ length: N }, (_, i) => {
    const a = (i * 2 * Math.PI / N) - Math.PI / 2
    return (cx + R * lv * Math.cos(a)) + "," + (cy + R * lv * Math.sin(a))
  }).join(" ")
  const poly = (c: College) => METRICS.map((m, i) => {
    const vals = colleges.map(x => (x[m.key] as number) || 0)
    const mn = Math.min(...vals), mx = Math.max(...vals)
    const sc = 0.12 + norm((c[m.key] as number) || mn, mn, mx, !m.better) * 0.88
    const a = (i * 2 * Math.PI / N) - Math.PI / 2
    return (cx + R * sc * Math.cos(a)) + "," + (cy + R * sc * Math.sin(a))
  }).join(" ")
  return (
    <svg width="310" height="310" viewBox="0 0 310 310" style={{ flexShrink: 0 }}>
      {[0.25,0.5,0.75,1].map((lv,i) => <polygon key={i} points={grid(lv)} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>)}
      {METRICS.map((_,i) => { const a=(i*2*Math.PI/N)-Math.PI/2; return <line key={i} x1={cx} y1={cy} x2={cx+R*Math.cos(a)} y2={cy+R*Math.sin(a)} stroke="rgba(255,255,255,0.07)" strokeWidth="1"/> })}
      {colleges.map((c,ci) => <polygon key={c.id} points={poly(c)} fill={FILLS[ci]} stroke={COLORS[ci]} strokeWidth="2.5" strokeOpacity="0.9"/>)}
      {METRICS.map((m,i) => {
        const a=(i*2*Math.PI/N)-Math.PI/2
        const lx=cx+(R+22)*Math.cos(a), ly=cy+(R+22)*Math.sin(a)
        return <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontWeight="700" fill="rgba(148,163,184,0.85)">{m.label}</text>
      })}
      {[0.25,0.5,0.75].map((lv,i) => {
        const a=-Math.PI/2; const lx=cx+R*lv*Math.cos(a)-4; const ly=cy+R*lv*Math.sin(a)
        return <text key={i} x={lx} y={ly} textAnchor="end" fontSize="7" fill="rgba(100,116,139,0.7)">{Math.round(lv*100)+"%"}</text>
      })}
    </svg>
  )
}

function Ring({ wins, color }: { wins: number; color: string }) {
  const r = 22, circ = 2 * Math.PI * r
  const dash = (wins / METRICS.length) * circ
  return (
    <div style={{ position:"relative", width:56, height:56, margin:"0 auto 10px" }}>
      <svg width="56" height="56" style={{ transform:"rotate(-90deg)" }}>
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4"/>
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={dash + " " + circ} strokeLinecap="round"/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:14, fontWeight:900, color, lineHeight:1 }}>{wins}</span>
        <span style={{ fontSize:7, color:"rgba(148,163,184,0.5)", fontWeight:700 }}>WINS</span>
      </div>
    </div>
  )
}

function Bar({ pct, color, delay }: { pct: number; color: string; delay: number }) {
  const [w, setW] = useState(0)
  useEffect(() => { const t = setTimeout(() => setW(pct), delay); return () => clearTimeout(t) }, [pct, delay])
  return (
    <div style={{ flex:1, height:7, borderRadius:99, background:"rgba(255,255,255,0.05)", overflow:"hidden" }}>
      <div style={{ height:"100%", borderRadius:99, width:w+"%", background:color, transition:"width 0.9s cubic-bezier(0.4,0,0.2,1)" }}/>
    </div>
  )
}

function CompareContent() {
  const sp = useSearchParams()
  const ids = sp.get("ids")?.split(",").filter(Boolean) ?? []
  const idsStr = ids.join(",")
  const [colleges, setColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (ids.length < 2) { setLoading(false); return }
    fetch("/api/compare?ids=" + idsStr)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) { setColleges(data); setTimeout(() => setReady(true), 300) } else setError("Failed") })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false))
  }, [idsStr])

  if (loading) return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, marginTop:32 }}>
      {[1,2,3].map(i => <div key={i} style={{ height:72, borderRadius:14, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.05)" }}/>)}
    </div>
  )
  if (error) return <div style={{ color:"#f87171", textAlign:"center", padding:"48px 0" }}>{error}</div>
  if (ids.length < 2) return (
    <div style={{ textAlign:"center", padding:"72px 0" }}>
      <div style={{ fontSize:18, fontWeight:700, color:"#cbd5e1", marginBottom:8 }}>No colleges selected</div>
      <div style={{ fontSize:14, color:"#475569", marginBottom:20 }}>Select 2 or 3 colleges to compare</div>
      <Link href="/" style={{ padding:"10px 24px", borderRadius:12, background:"#6366F1", color:"#fff", fontWeight:600, fontSize:14, textDecoration:"none" }}>Browse Colleges</Link>
    </div>
  )

  const wins = colleges.map(() => 0)
  METRICS.forEach(m => { const b = bestIdx(colleges, m.key, m.better); if (b >= 0) wins[b]++ })
  const winnerIdx = wins.indexOf(Math.max(...wins))

  return (
    <div style={{ marginTop:28 }}>

      {/* Winner banner */}
      <div style={{ borderRadius:18, padding:"18px 24px", marginBottom:22, display:"flex", alignItems:"center", gap:16, background:"rgba(245,158,11,0.07)", border:"1px solid rgba(245,158,11,0.22)" }}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
          <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
        </svg>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:10, color:"#F59E0B", fontWeight:800, letterSpacing:"0.1em", marginBottom:3 }}>OVERALL WINNER</div>
          <div style={{ fontSize:20, color:"#fff", fontWeight:800, lineHeight:1.2 }}>{colleges[winnerIdx].name}</div>
          <div style={{ fontSize:12, color:"#92400E", marginTop:2 }}>Best in {wins[winnerIdx]} of {METRICS.length} categories</div>
        </div>
        <div style={{ textAlign:"center", flexShrink:0 }}>
          <div style={{ fontSize:44, fontWeight:900, color:"#F59E0B", lineHeight:1 }}>{wins[winnerIdx]}</div>
          <div style={{ fontSize:10, color:"#78350F", fontWeight:700 }}>category wins</div>
        </div>
      </div>

      {/* College cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat("+colleges.length+",1fr)", gap:14, marginBottom:16 }}>
        {colleges.map((c, ci) => {
          const col = COLORS[ci], isW = ci === winnerIdx
          return (
            <div key={c.id} style={{ borderRadius:18, padding:"22px 16px", textAlign:"center", background:"rgba(13,18,33,0.95)", border: isW ? "1.5px solid "+col : "1px solid rgba(255,255,255,0.07)", position:"relative", boxShadow: isW ? "0 0 40px "+col+"18" : "none" }}>
              {isW && <div style={{ position:"absolute", top:-11, left:"50%", transform:"translateX(-50%)", background:col, color:"#000", fontSize:9, fontWeight:900, padding:"3px 12px", borderRadius:99, letterSpacing:"0.1em", whiteSpace:"nowrap" }}>WINNER</div>}
              <Ring wins={wins[ci]} color={col}/>
              <div style={{ width:50, height:50, borderRadius:14, margin:"0 auto 10px", background:col+"18", border:"1.5px solid "+col+"40", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:900, color:col }}>
                {c.name.split(" ").map((w: string) => w[0]).slice(0,2).join("")}
              </div>
              {c.nirfRank != null && <div style={{ display:"inline-block", marginBottom:8, background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.2)", color:"#F59E0B", borderRadius:7, padding:"2px 8px", fontSize:10, fontWeight:700 }}>{"#"+c.nirfRank+" NIRF"}</div>}
              <Link href={"/colleges/"+c.id} style={{ textDecoration:"none" }}>
                <div style={{ fontSize:12, fontWeight:800, color:"#f1f5f9", lineHeight:1.4, marginBottom:4 }}>{c.name}</div>
              </Link>
              <div style={{ fontSize:11, color:"#475569", marginBottom:10 }}>{c.city+", "+c.state}</div>
              <div style={{ display:"flex", gap:5, justifyContent:"center", flexWrap:"wrap" }}>
                <span style={{ fontSize:10, padding:"2px 7px", borderRadius:5, background:col+"18", border:"1px solid "+col+"30", color:col, fontWeight:700 }}>{c.type}</span>
                <span style={{ fontSize:10, padding:"2px 7px", borderRadius:5, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"#64748b", fontWeight:600 }}>{"NAAC "+c.naacGrade}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Radar chart */}
      <div style={{ borderRadius:18, padding:"24px", marginBottom:12, background:"rgba(13,18,33,0.9)", border:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize:13, fontWeight:700, color:"#94a3b8", marginBottom:2 }}>Performance Radar</div>
        <div style={{ fontSize:11, color:"#334155", marginBottom:16 }}>Larger polygon = stronger overall � normalized across all 6 metrics</div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:28, flexWrap:"wrap" }}>
          <RadarChart colleges={colleges}/>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {colleges.map((c, ci) => (
              <div key={c.id} style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:12, height:12, borderRadius:3, background:COLORS[ci], flexShrink:0 }}/>
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:"#cbd5e1" }}>{c.name.split(" ").slice(0,4).join(" ")}</div>
                  <div style={{ fontSize:10, color:"#475569" }}>{wins[ci]} wins</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metric rows */}
      {METRICS.map((m, mi) => {
        const bi = bestIdx(colleges, m.key, m.better)
        const vals = colleges.map(c => (c[m.key] as number) || 0)
        const mx = Math.max(...vals)
        return (
          <div key={m.key} style={{ borderRadius:15, padding:"16px 20px", marginBottom:10, background:"rgba(13,18,33,0.9)", border:"1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#64748b", marginBottom:12 }}>
              {m.label}
              <span style={{ fontWeight:400, color:"#334155", marginLeft:6, fontSize:11 }}>{m.desc}</span>
            </div>
            {colleges.map((c, ci) => {
              const val = (c[m.key] as number) || 0
              const isBest = ci === bi
              const raw = mx > 0 ? (val / mx) * 100 : 0
              const pct = Math.min(m.better ? raw : Math.max(100 - raw + 12, 8), 100)
              const barColor = isBest ? "linear-gradient(90deg,#10B981,#34D399)" : COLORS[ci]+"80"
              const delayMs = (mi * 60) + (ci * 80)
              return (
                <div key={c.id} style={{ display:"flex", alignItems:"center", gap:10, marginBottom: ci < colleges.length-1 ? 8 : 0 }}>
                  <div style={{ width:26, height:26, borderRadius:7, background:COLORS[ci]+"18", border:"1px solid "+COLORS[ci]+"30", display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, fontWeight:900, color:COLORS[ci], flexShrink:0 }}>
                    {c.name.split(" ").map((w: string) => w[0]).slice(0,2).join("")}
                  </div>
                  <Bar pct={ready ? pct : 0} color={barColor} delay={delayMs}/>
                  <div style={{ fontSize:12, fontWeight:700, color: isBest ? "#34D399" : "#94a3b8", width:78, textAlign:"right", flexShrink:0 }}>{m.fmt(val)}</div>
                  {isBest
                    ? <div style={{ fontSize:9, fontWeight:800, color:"#10B981", background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.22)", borderRadius:5, padding:"2px 6px", flexShrink:0, letterSpacing:"0.06em" }}>BEST</div>
                    : <div style={{ width:35, flexShrink:0 }}/>
                  }
                </div>
              )
            })}
          </div>
        )
      })}

      {/* Bottom row: programs + scorecard */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:4 }}>
        <div style={{ borderRadius:15, padding:"18px 20px", background:"rgba(13,18,33,0.9)", border:"1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#64748b", marginBottom:14 }}>Programs offered</div>
          <div style={{ display:"flex", gap:10 }}>
            {colleges.map((c,ci) => (
              <div key={c.id} style={{ flex:1, textAlign:"center", padding:"14px 8px", borderRadius:10, background:COLORS[ci]+"0d", border:"1px solid "+COLORS[ci]+"20" }}>
                <div style={{ fontSize:30, fontWeight:900, color:COLORS[ci], lineHeight:1 }}>{c.courses.length}</div>
                <div style={{ fontSize:10, color:"#475569", marginTop:3 }}>programs</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderRadius:15, padding:"18px 20px", background:"rgba(13,18,33,0.9)", border:"1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#64748b", marginBottom:14 }}>Final scorecard</div>
          <div style={{ display:"flex", gap:10 }}>
            {colleges.map((c,ci) => (
              <div key={c.id} style={{ flex:1, textAlign:"center", padding:"14px 8px", borderRadius:10, background: ci===winnerIdx ? COLORS[ci]+"14" : "rgba(255,255,255,0.02)", border:"1px solid "+(ci===winnerIdx ? COLORS[ci]+"30" : "rgba(255,255,255,0.05)") }}>
                <div style={{ fontSize:30, fontWeight:900, color:COLORS[ci], lineHeight:1 }}>{wins[ci]}</div>
                <div style={{ fontSize:9, color: ci===winnerIdx ? COLORS[ci] : "#475569", marginTop:3, fontWeight: ci===winnerIdx ? 800 : 400, letterSpacing: ci===winnerIdx ? "0.06em" : 0 }}>{ci===winnerIdx ? "WINNER" : "wins"}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ComparePage() {
  return (
    <div style={{ minHeight:"100vh", paddingBottom:80, backgroundColor:"#080B14" }}>
      <Navbar/>
      <div style={{ maxWidth:860, margin:"0 auto", padding:"112px 16px 0" }}>
        <Link href="/" style={{ fontSize:12, color:"#475569", textDecoration:"none" }}>Back to Colleges</Link>
        <h1 style={{ fontSize:32, fontWeight:900, color:"#fff", margin:"12px 0 4px" }}>Compare Colleges</h1>
        <p style={{ fontSize:14, color:"#475569", margin:0 }}>Radar chart + animated bars. Green highlights the category winner.</p>
        <Suspense fallback={<div style={{ height:300 }}/>}>
          <CompareContent/>
        </Suspense>
      </div>
    </div>
  )
}
