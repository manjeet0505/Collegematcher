"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/Navbar"

interface Answer {
  id: string; body: string; createdAt: string
  user: { name: string | null }
}
interface Question {
  id: string; title: string; body: string; createdAt: string; collegeId: string
  user: { name: string | null }
  answers: Answer[]
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return "just now"
  if (s < 3600) return Math.floor(s/60) + "m ago"
  if (s < 86400) return Math.floor(s/3600) + "h ago"
  return Math.floor(s/86400) + "d ago"
}

function Avatar({ name, size = 32, color = "#6366F1" }: { name: string | null; size?: number; color?: string }) {
  const initials = name?.split(" ").map(w => w[0]).slice(0,2).join("") || "?"
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.3, background: color + "22", border: "1px solid " + color + "40", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 800, color, flexShrink: 0 }}>
      {initials}
    </div>
  )
}

export default function QAPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading]     = useState(true)
  const [expanded, setExpanded]   = useState<string | null>(null)
  const [showAsk, setShowAsk]     = useState(false)
  const [answerFor, setAnswerFor] = useState<string | null>(null)

  // ask form
  const [qTitle, setQTitle]   = useState("")
  const [qBody, setQBody]     = useState("")
  const [qCollege, setQCollege] = useState("")
  const [colleges, setColleges] = useState<{ id: string; name: string }[]>([])
  const [submitting, setSubmitting] = useState(false)

  // answer form
  const [ansBody, setAnsBody] = useState("")
  const [ansSub, setAnsSub]   = useState(false)

  useEffect(() => {
    fetch("/api/questions").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setQuestions(data)
      setLoading(false)
    })
    fetch("/api/colleges?limit=100").then(r => r.json()).then(data => {
      if (data.colleges) setColleges(data.colleges)
    })
  }, [])

  async function submitQuestion(e: React.FormEvent) {
    e.preventDefault()
    if (!session) { router.push("/login"); return }
    if (!qTitle.trim() || !qCollege) return
    setSubmitting(true)
    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: qTitle, body: qBody, collegeId: qCollege }),
    })
    const newQ = await res.json()
    setQuestions(prev => [{ ...newQ, answers: [] }, ...prev])
    setQTitle(""); setQBody(""); setQCollege(""); setShowAsk(false)
    setSubmitting(false)
  }

  async function submitAnswer(questionId: string) {
    if (!session) { router.push("/login"); return }
    if (!ansBody.trim()) return
    setAnsSub(true)
    const res = await fetch("/api/answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: ansBody, questionId }),
    })
    const newA = await res.json()
    setQuestions(prev => prev.map(q =>
      q.id === questionId ? { ...q, answers: [...q.answers, newA] } : q
    ))
    setAnsBody(""); setAnswerFor(null)
    setAnsSub(false)
  }

  const INPUT: React.CSSProperties = {
    width: "100%", padding: "11px 14px", borderRadius: 12,
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
    color: "#f1f5f9", fontSize: 14, outline: "none", boxSizing: "border-box",
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#080B14", paddingBottom: 80 }}>
      <Navbar />

      {/* Ambient glow */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 320, background: "radial-gradient(ellipse at 60% 0%, rgba(139,92,246,0.1) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "96px 16px 0", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#6366F1", letterSpacing: "0.1em", marginBottom: 8 }}>COMMUNITY</div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.5px", margin: 0 }}>Q&amp;A Discussion</h1>
            <p style={{ fontSize: 14, color: "#475569", marginTop: 6 }}>Ask questions, share experiences about colleges</p>
          </div>
          <button onClick={() => { if (!session) { router.push("/login"); return } setShowAsk(v => !v) }}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 20px", borderRadius: 13, background: showAsk ? "rgba(99,102,241,0.15)" : "linear-gradient(135deg,#6366F1,#8B5CF6)", border: showAsk ? "1px solid rgba(99,102,241,0.3)" : "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: showAsk ? "none" : "0 4px 20px rgba(99,102,241,0.35)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {showAsk ? "Cancel" : "Ask Question"}
          </button>
        </div>

        {/* Ask form */}
        {showAsk && (
          <div style={{ borderRadius: 20, padding: "24px", marginBottom: 24, background: "rgba(13,18,33,0.95)", border: "1px solid rgba(99,102,241,0.2)", boxShadow: "0 0 0 1px rgba(99,102,241,0.05), 0 20px 60px rgba(0,0,0,0.4)" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#f1f5f9", marginBottom: 18 }}>Post a Question</div>
            <form onSubmit={submitQuestion}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 7, letterSpacing: "0.07em" }}>COLLEGE</label>
                <select value={qCollege} onChange={e => setQCollege(e.target.value)} required style={{ ...INPUT, appearance: "none" }}>
                  <option value="">Select a college...</option>
                  {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 7, letterSpacing: "0.07em" }}>QUESTION TITLE</label>
                <input value={qTitle} onChange={e => setQTitle(e.target.value)} required placeholder="e.g. What is the hostel life like?" style={INPUT}
                  onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.5)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.09)"} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 7, letterSpacing: "0.07em" }}>DETAILS (OPTIONAL)</label>
                <textarea value={qBody} onChange={e => setQBody(e.target.value)} placeholder="Add more context..." rows={3}
                  style={{ ...INPUT, resize: "vertical" as const, fontFamily: "inherit" }}
                  onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.5)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.09)"} />
              </div>
              <button type="submit" disabled={submitting}
                style={{ padding: "11px 24px", borderRadius: 12, background: submitting ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", fontSize: 14, fontWeight: 700, border: "none", cursor: submitting ? "wait" : "pointer", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
                {submitting ? "Posting..." : "Post Question"}
              </button>
            </form>
          </div>
        )}

        {/* Stats bar */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Questions", value: questions.length },
            { label: "Answers", value: questions.reduce((a, q) => a + q.answers.length, 0) },
            { label: "Contributors", value: new Set([...questions.map(q => q.user.name), ...questions.flatMap(q => q.answers.map(a => a.user.name))]).size },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, borderRadius: 14, padding: "14px 16px", background: "rgba(13,18,33,0.9)", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#818CF8", lineHeight: 1, marginBottom: 3 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#334155" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Questions list */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1,2,3].map(i => <div key={i} style={{ height: 100, borderRadius: 18, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", animation: "pulse 1.5s ease-in-out infinite" }} />)}
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
          </div>
        ) : questions.length === 0 ? (
          <div style={{ borderRadius: 20, padding: "64px 32px", textAlign: "center", background: "rgba(13,18,33,0.9)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ width: 60, height: 60, borderRadius: 18, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#cbd5e1", marginBottom: 8 }}>No questions yet</div>
            <div style={{ fontSize: 13, color: "#334155" }}>Be the first to ask a question about a college</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {questions.map(q => {
              const isOpen = expanded === q.id
              const isAnswering = answerFor === q.id
              return (
                <div key={q.id} style={{ borderRadius: 20, background: "rgba(13,18,33,0.9)", border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden", transition: "border-color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}>

                  {/* Question header */}
                  <div style={{ padding: "20px 22px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <Avatar name={q.user.name} color="#6366F1" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "#f1f5f9", lineHeight: 1.4, marginBottom: 4 }}>{q.title}</div>
                        {q.body && <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, marginBottom: 8 }}>{q.body}</div>}
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>{q.user.name || "Anonymous"}</span>
                          <span style={{ fontSize: 11, color: "#1e293b" }}>&bull;</span>
                          <span style={{ fontSize: 11, color: "#334155" }}>{timeAgo(q.createdAt)}</span>
                          <Link href={"/colleges/" + q.collegeId}
                            style={{ fontSize: 11, fontWeight: 600, color: "#6366F1", textDecoration: "none", padding: "2px 8px", borderRadius: 6, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
                            View College
                          </Link>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        {q.answers.length > 0 && (
                          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 8, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.15)" }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#34D399" }}>{q.answers.length} ans</span>
                          </div>
                        )}
                        <button onClick={() => setExpanded(isOpen ? null : q.id)}
                          style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 9, background: isOpen ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.04)", border: isOpen ? "1px solid rgba(99,102,241,0.25)" : "1px solid rgba(255,255,255,0.08)", color: isOpen ? "#818CF8" : "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                          {isOpen ? "Hide" : q.answers.length === 0 ? "Answer" : "View"}
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                            <polyline points="6 9 12 15 18 9"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded answers */}
                  {isOpen && (
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "16px 22px 20px" }}>
                      {q.answers.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                          {q.answers.map((a, ai) => (
                            <div key={a.id} style={{ display: "flex", gap: 11 }}>
                              <Avatar name={a.user.name} size={28} color={["#F59E0B","#10B981","#EC4899"][ai % 3]} />
                              <div style={{ flex: 1, padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                  <span style={{ fontSize: 12, fontWeight: 700, color: "#cbd5e1" }}>{a.user.name || "Anonymous"}</span>
                                  <span style={{ fontSize: 11, color: "#1e293b" }}>&bull;</span>
                                  <span style={{ fontSize: 11, color: "#334155" }}>{timeAgo(a.createdAt)}</span>
                                </div>
                                <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.65 }}>{a.body}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Answer input */}
                      {isAnswering ? (
                        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <Avatar name={session?.user?.name || null} size={28} color="#6366F1" />
                          <div style={{ flex: 1 }}>
                            <textarea value={ansBody} onChange={e => setAnsBody(e.target.value)}
                              placeholder="Write your answer..." rows={3} autoFocus
                              style={{ width: "100%", padding: "11px 14px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(99,102,241,0.3)", color: "#f1f5f9", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
                            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                              <button onClick={() => submitAnswer(q.id)} disabled={ansSub}
                                style={{ padding: "9px 18px", borderRadius: 10, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", fontSize: 13, fontWeight: 700, border: "none", cursor: ansSub ? "wait" : "pointer" }}>
                                {ansSub ? "Posting..." : "Post Answer"}
                              </button>
                              <button onClick={() => { setAnswerFor(null); setAnsBody("") }}
                                style={{ padding: "9px 14px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b", fontSize: 13, cursor: "pointer" }}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => { if (!session) { router.push("/login"); return } setAnswerFor(q.id); setAnsBody("") }}
                          style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 10, background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.15)", color: "#818CF8", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                          Write an Answer
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}