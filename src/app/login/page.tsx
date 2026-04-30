"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const INPUT_STYLE: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: 12,
  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
  color: "#f1f5f9", fontSize: 14, outline: "none", boxSizing: "border-box",
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError("")
    const res = await signIn("credentials", { email, password, redirect: false })
    setLoading(false)
    if (res?.error) { setError("Invalid email or password"); return }
    router.push("/dashboard")
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#080B14", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-20%", left: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ width: "100%", maxWidth: 420, position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 24px rgba(99,102,241,0.4)" }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>CampusIQ</span>
          </Link>
          <div style={{ marginTop: 28, fontSize: 26, fontWeight: 800, color: "#f1f5f9" }}>Welcome back</div>
          <div style={{ fontSize: 14, color: "#475569", marginTop: 6 }}>Sign in to your account</div>
        </div>
        <div style={{ borderRadius: 24, padding: "32px 28px", background: "rgba(13,18,33,0.95)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}>
          {error && (
            <div style={{ borderRadius: 12, padding: "12px 14px", marginBottom: 20, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5", fontSize: 13 }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 8, letterSpacing: "0.08em" }}>EMAIL ADDRESS</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={INPUT_STYLE}
                onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.5)"}
                onBlur={e  => e.target.style.borderColor = "rgba(255,255,255,0.09)"} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 8, letterSpacing: "0.08em" }}>PASSWORD</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" style={INPUT_STYLE}
                onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.5)"}
                onBlur={e  => e.target.style.borderColor = "rgba(255,255,255,0.09)"} />
            </div>
            <button type="submit" disabled={loading} style={{ width: "100%", padding: "13px", borderRadius: 14, background: loading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", fontSize: 15, fontWeight: 700, border: "none", cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 0 32px rgba(99,102,241,0.3)" }}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
        <div style={{ textAlign: "center", marginTop: 22, fontSize: 13, color: "#475569" }}>
          No account?{" "}
          <Link href="/register" style={{ color: "#818CF8", fontWeight: 600, textDecoration: "none" }}>Create one free</Link>
        </div>
      </div>
    </div>
  )
}
