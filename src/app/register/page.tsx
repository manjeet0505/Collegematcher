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

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName]         = useState("")
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError("")
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })
    if (!res.ok) {
      const d = await res.json()
      setError(d.error || "Registration failed")
      setLoading(false); return
    }
    await signIn("credentials", { email, password, redirect: false })
    router.push("/dashboard")
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#080B14", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
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
          <div style={{ marginTop: 28, fontSize: 26, fontWeight: 800, color: "#f1f5f9" }}>Create your account</div>
          <div style={{ fontSize: 14, color: "#475569", marginTop: 6 }}>Start comparing colleges for free</div>
        </div>
        <div style={{ borderRadius: 24, padding: "32px 28px", background: "rgba(13,18,33,0.95)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}>
          {error && (
            <div style={{ borderRadius: 12, padding: "12px 14px", marginBottom: 20, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5", fontSize: 13 }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            {[
              { label: "FULL NAME",     type: "text",     value: name,     setter: setName,     ph: "Your full name"    },
              { label: "EMAIL ADDRESS", type: "email",    value: email,    setter: setEmail,    ph: "you@example.com"   },
              { label: "PASSWORD",      type: "password", value: password, setter: setPassword, ph: "Min. 6 characters" },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 8, letterSpacing: "0.08em" }}>{f.label}</label>
                <input type={f.type} required value={f.value} onChange={e => f.setter(e.target.value)} placeholder={f.ph} style={INPUT_STYLE}
                  onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.5)"}
                  onBlur={e  => e.target.style.borderColor = "rgba(255,255,255,0.09)"} />
              </div>
            ))}
            <button type="submit" disabled={loading} style={{ width: "100%", padding: "13px", borderRadius: 14, background: loading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", fontSize: 15, fontWeight: 700, border: "none", cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 0 32px rgba(99,102,241,0.3)", marginTop: 8 }}>
              {loading ? "Creating account..." : "Get Started - Free"}
            </button>
          </form>
        </div>
        <div style={{ textAlign: "center", marginTop: 22, fontSize: 13, color: "#475569" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#818CF8", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
        </div>
      </div>
    </div>
  )
}
